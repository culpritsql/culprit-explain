import { describe, expect, test } from "bun:test";
import { SAMPLES } from "../src/samples";
import { decodeShareHash, encodeShareHash, isValidSharedEventsBatch, redactPayloadText, scrubSqlLiterals } from "../src/share";
import { ensurePlansWasm } from "../src/wasm-client";

describe("Share Link encoding, redaction, and Wasm round-trip", () => {
  test("compresses and decompresses large payloads without Web Streams backpressure deadlock", async () => {
    const repeatedPlan = JSON.stringify(
      Array.from({ length: 400 }, (_, i) => ({
        step: i,
        relation: `orders_partition_${i}`,
        filter: `(tenant_id = ${1000 + i} AND status = 'active')`,
      })),
    );
    expect(repeatedPlan.length).toBeGreaterThan(24_000);

    const encoded = await encodeShareHash({
      v: 1,
      m: "plan",
      t: "Large Partitioned Plan",
      e: "postgres",
      p: repeatedPlan,
    });
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;

    expect(encoded.hash.startsWith("#s=z1.")).toBe(true);
    const decoded = await decodeShareHash(`https://explain.culpritsql.com/${encoded.hash}`);
    expect(decoded).not.toBeNull();
    expect(decoded?.t).toBe("Large Partitioned Plan");
    expect(decoded?.p).toBe(repeatedPlan);
  });

  test("returns null cleanly on malformed or corrupted share hashes", async () => {
    expect(await decodeShareHash("")).toBeNull();
    expect(await decodeShareHash("#foo=bar")).toBeNull();
    expect(await decodeShareHash("#s=badprefix.abc")).toBeNull();
    expect(await decodeShareHash("#s=z1.not_valid_deflate_bytes")).toBeNull();
  });

  test("round-trips all 6 interactive samples (redacted and unredacted) through Wasm", async () => {
    const wasm = await ensurePlansWasm();

    for (const sample of SAMPLES) {
      for (const redact of [false, true]) {
        if (sample.mode === "plan" && sample.planText) {
          const orig = wasm.parsePlan(sample.planText, sample.engine);
          const p = redact
            ? wasm.exportPlan(orig, sample.title, "native", { redact: true, notes: [] }).contents
            : sample.planText;
          const q = sample.sql ? (redact ? scrubSqlLiterals(sample.sql) : sample.sql) : undefined;
          if (redact) {
            expect(p).not.toContain("'paid'");
            expect(p).not.toContain("'shipped'");
            expect(p).not.toContain("2026-10-01");
            if (q) {
              expect(q).not.toContain("'paid'");
              expect(q).not.toContain("2026-10-01");
            }
          }
          const enc = await encodeShareHash({ v: 1, m: "plan", t: sample.title, e: sample.engine, p, q });
          expect(enc.ok).toBe(true);
          if (!enc.ok) continue;
          const dec = await decodeShareHash(enc.hash);
          expect(dec?.m).toBe("plan");
          const reparsed = wasm.parsePlan(dec!.p!, dec!.e);
          expect(reparsed.engine).toBe(orig.engine);
          expect(reparsed.root.op).toBe(orig.root.op);
        } else if (sample.mode === "compare" && sample.beforeText && sample.afterText) {
          const origA = wasm.parsePlan(sample.beforeText, sample.engine);
          const origB = wasm.parsePlan(sample.afterText, sample.engine);
          const pa = redact
            ? wasm.exportPlan(origA, sample.beforeName ?? "Before", "native", { redact: true, notes: [] }).contents
            : sample.beforeText;
          const pb = redact
            ? wasm.exportPlan(origB, sample.afterName ?? "After", "native", { redact: true, notes: [] }).contents
            : sample.afterText;
          const enc = await encodeShareHash({
            v: 1,
            m: "compare",
            e: sample.engine,
            na: sample.beforeName,
            pa,
            nb: sample.afterName,
            pb,
          });
          expect(enc.ok).toBe(true);
          if (!enc.ok) continue;
          const dec = await decodeShareHash(enc.hash);
          expect(dec?.m).toBe("compare");
          const a = wasm.parsePlan(dec!.pa!, dec!.e);
          const b = wasm.parsePlan(dec!.pb!, dec!.e);
          const diff = wasm.diffPlans(a, dec!.na ?? "Before", b, dec!.nb ?? "After");
          expect(diff.changes.length).toBeGreaterThan(0);
        } else if (sample.mode === "deadlock" && sample.deadlockText) {
          const d = redact ? redactPayloadText(sample.deadlockText) : sample.deadlockText;
          if (redact) {
            expect(d).not.toContain("'reserved'");
            expect(d).not.toContain("91824");
            expect(d).not.toContain("4410");
            expect(d).toContain('spid="74"');
            expect(d).toContain('hobtid="72057594039894016"');
          }
          const enc = await encodeShareHash({ v: 1, m: "deadlock", t: sample.title, d });
          expect(enc.ok).toBe(true);
          if (!enc.ok) continue;
          const dec = await decodeShareHash(enc.hash);
          expect(dec?.m).toBe("deadlock");
          const dls = wasm.parseDeadlock(dec!.d!);
          expect(dls.length).toBe(1);
          expect(dls[0].processes.length).toBe(2);
        } else if (sample.eventsXml) {
          const batch = wasm.parseExtendedEventsXml(sample.eventsXml);
          expect(batch.records.length).toBeGreaterThanOrEqual(4);
          expect(batch.deadlocks.length).toBe(1);
          const enc = await encodeShareHash({ v: 1, m: "events", t: sample.title, eb: batch });
          expect(enc.ok).toBe(true);
          if (!enc.ok) continue;
          const dec = await decodeShareHash(enc.hash);
          expect(dec?.m).toBe("events");
          expect(isValidSharedEventsBatch(dec?.eb)).toBe(true);
        }
      }
    }
  });

  test("redacts Postgres text EXPLAIN, Postgres deadlock logs, and InnoDB deadlocks without breaking parsers", async () => {
    const wasm = await ensurePlansWasm();

    const pgText = [
      "Seq Scan on orders  (cost=0.00..39840.00 rows=3100 width=64) (actual time=0.080..218.400 rows=41280 loops=1)",
      "  Filter: ((status = 'secret_paid'::text) AND (tenant_id = 98765))",
      "  Rows Removed by Filter: 1458720",
      "  Buffers: shared hit=3680 read=18420",
      "Planning Time: 0.840 ms",
      "Execution Time: 219.120 ms",
    ].join("\n");
    const redactedPgText = redactPayloadText(pgText);
    expect(redactedPgText).not.toContain("secret_paid");
    expect(redactedPgText).not.toContain("98765");
    const parsedTextPlan = wasm.parsePlan(redactedPgText);
    expect(parsedTextPlan.engine).toBe("postgres");
    expect(parsedTextPlan.facts.elapsed_ms).toBeCloseTo(219.12, 1);

    const pgDeadlock = [
      "2026-10-11 13:48:28.887 UTC [539] ERROR:  deadlock detected",
      "2026-10-11 13:48:28.887 UTC [539] DETAIL:  Process 539 waits for ShareLock on transaction 838; blocked by process 545.",
      "\tProcess 545 waits for ShareLock on transaction 837; blocked by process 539.",
      "\tProcess 539: UPDATE customers SET email = 'alice@example.com' WHERE id = 7771",
      "\tProcess 545: UPDATE orders SET note = 'vip_secret' WHERE id = 8882",
      '2026-10-11 13:48:28.887 UTC [539] CONTEXT:  while updating tuple (0,1) in relation "customers"',
      "2026-10-11 13:48:28.887 UTC [539] STATEMENT:  UPDATE customers SET email = 'alice@example.com' WHERE id = 7771",
    ].join("\n");
    const redactedPgDl = redactPayloadText(pgDeadlock);
    expect(redactedPgDl).not.toContain("alice@example.com");
    expect(redactedPgDl).not.toContain("vip_secret");
    expect(redactedPgDl).not.toContain("7771");
    expect(redactedPgDl).not.toContain("8882");
    const parsedPgDl = wasm.parseDeadlock(redactedPgDl);
    expect(parsedPgDl.length).toBe(1);
    expect(parsedPgDl[0].processes.length).toBe(2);

    const innodbDeadlock = [
      "LATEST DETECTED DEADLOCK",
      "------------------------",
      "2026-10-11 13:48:08 0x7f8b",
      "*** (1) TRANSACTION:",
      "TRANSACTION 4101, ACTIVE 2 sec starting index read",
      "mysql tables in use 1, locked 1",
      "LOCK WAIT 3 lock struct(s), heap size 1128, 2 row lock(s)",
      "MySQL thread id 91, OS thread handle 12345, query id 5001 localhost app updating",
      "UPDATE `shop`.`accounts` SET balance = balance - 250 WHERE email = 'bob@secret.io' AND id = 301",
      "*** (1) HOLDS THE LOCK(S):",
      "RECORD LOCKS space id 12 page no 4 n bits 72 index PRIMARY of table `shop`.`accounts` trx id 4101 lock_mode X locks rec but not gap",
      "*** (1) WAITING FOR THIS LOCK TO BE GRANTED:",
      "RECORD LOCKS space id 12 page no 5 n bits 72 index PRIMARY of table `shop`.`orders` trx id 4101 lock_mode X locks rec but not gap waiting",
      "*** (2) TRANSACTION:",
      "TRANSACTION 4102, ACTIVE 2 sec updating or deleting",
      "MySQL thread id 92, OS thread handle 12346, query id 5002 localhost app updating",
      "UPDATE `shop`.`accounts` SET balance = balance + 250 WHERE id = 302",
      "*** (2) HOLDS THE LOCK(S):",
      "RECORD LOCKS space id 12 page no 5 n bits 72 index PRIMARY of table `shop`.`orders` trx id 4102 lock_mode X locks rec but not gap",
      "*** (2) WAITING FOR THIS LOCK TO BE GRANTED:",
      "RECORD LOCKS space id 12 page no 4 n bits 72 index PRIMARY of table `shop`.`accounts` trx id 4102 lock_mode X locks rec but not gap waiting",
      "*** WE ROLL BACK TRANSACTION (1)",
    ].join("\n");
    const redactedInnodbDl = redactPayloadText(innodbDeadlock);
    expect(redactedInnodbDl).not.toContain("bob@secret.io");
    expect(redactedInnodbDl).not.toContain("250");
    const parsedInnodbDl = wasm.parseDeadlock(redactedInnodbDl);
    expect(parsedInnodbDl.length).toBe(1);
    expect(parsedInnodbDl[0].processes.length).toBe(2);
  });

  test("parses SQL Server Extended Events XML and share-links ExtendedEventsBatch with redacted literals", async () => {
    const wasm = await ensurePlansWasm();
    const xeXml = `<events><event name="attention" package="sqlserver" timestamp="2026-11-25T04:24:44.500Z"><data name="duration"><value>2500</value></data><action name="sql_text" package="sqlserver"><value>SELECT 'explain-xe-secret' AS token</value></action></event></events>`;
    const batch = wasm.parseExtendedEventsXml(xeXml);
    expect(batch.format).toBe("xml");
    expect(batch.records.length).toBe(1);
    expect(JSON.stringify(batch)).not.toContain("explain-xe-secret");

    const enc = await encodeShareHash({ v: 1, m: "events", t: "system_health", eb: batch });
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    const dec = await decodeShareHash(enc.hash);
    expect(dec?.m).toBe("events");
    expect(isValidSharedEventsBatch(dec?.eb)).toBe(true);
    expect(dec?.eb?.records.length).toBe(1);
  });
});
