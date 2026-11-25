import type { Engine } from "@culpritsql/plan-viewer";

export type StudioMode = "plan" | "compare" | "deadlock";
export type EngineFilter = "auto" | Engine;

export interface CaptureGuide {
  engineLabel: string;
  icon: string;
  command: string;
  note: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface RouteMeta {
  slug: string; // "" for home, "postgres", "sql-server", "mysql", "yugabytedb", "sqlite", "compare", "deadlock"
  path: string; // "/" or "/postgres/"
  navLabel: string;
  mode: StudioMode;
  engineFilter: EngineFilter;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  placeholder: string;
  captureGuides: CaptureGuide[];
  faqs: FaqItem[];
}

export const CAPTURE_GUIDES: Record<Engine, CaptureGuide> = {
  postgres: {
    engineLabel: "PostgreSQL & TimescaleDB",
    icon: "providers/postgres.svg",
    command: "EXPLAIN (ANALYZE, BUFFERS, WAL, VERBOSE, FORMAT JSON)\nSELECT * FROM orders WHERE status = 'paid';",
    note: "Paste the JSON array or plain text output from psql, pgAdmin, DataGrip, or DBeaver.",
  },
  mssql: {
    engineLabel: "SQL Server & Azure SQL",
    icon: "providers/mssql.svg",
    command: "SET STATISTICS XML ON;\nGO\nSELECT TOP 50 * FROM dbo.orders WHERE status = 'paid';\nGO",
    note: "Drop a saved .sqlplan file from SSMS / Azure Data Studio or paste the raw ShowPlanXML string.",
  },
  mysql: {
    engineLabel: "MySQL & MariaDB",
    icon: "providers/mysql.svg",
    command: "EXPLAIN FORMAT=JSON SELECT * FROM orders WHERE status = 'paid';\n-- or MySQL 8.0.18+ actual timings:\nEXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'paid';",
    note: "Supports both EXPLAIN FORMAT=JSON (MySQL & MariaDB) and EXPLAIN ANALYZE tree text.",
  },
  yugabyte: {
    engineLabel: "YugabyteDB",
    icon: "providers/yugabyte.svg",
    command: "EXPLAIN (ANALYZE, DIST, VERBOSE, FORMAT JSON)\nSELECT * FROM orders WHERE created_at >= now() - interval '1 day';",
    note: "Include DIST to inspect DocDB storage read requests, RPC roundtrips, and catalog reads.",
  },
  sqlite: {
    engineLabel: "SQLite",
    icon: "providers/sqlite.svg",
    command: "EXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC;",
    note: "Paste the EXPLAIN QUERY PLAN output from the sqlite3 CLI or your SQLite client.",
  },
};

export const DEADLOCK_GUIDES: CaptureGuide[] = [
  {
    engineLabel: "SQL Server Extended Events (.xel & XML)",
    icon: "providers/mssql.svg",
    command: "-- Drop any binary system_health*.xel or Azure SQL Blob .xel file directly above (no SSMS needed),\n-- or query XML from Extended Events:\nSELECT CAST(event_data AS XML) FROM sys.fn_xe_telemetry_blob_target_read_file('system_health*.xel', NULL, NULL, NULL)\nWHERE object_name IN ('xml_deadlock_report', 'error_reported', 'attention');",
    note: "Drop a binary .xel capture, an .xdl / .xml deadlock report, or exported <events> XML.",
  },
  {
    engineLabel: "PostgreSQL Log Excerpt",
    icon: "providers/postgres.svg",
    command: "-- Copy from postgresql.log starting at:\n-- ERROR:  deadlock detected\n-- DETAIL: Process ... waits for ShareLock on transaction ...",
    note: "Include the ERROR, DETAIL, HINT, and STATEMENT lines from your PostgreSQL server log.",
  },
  {
    engineLabel: "MySQL / MariaDB InnoDB Status",
    icon: "providers/mysql.svg",
    command: "SHOW ENGINE INNODB STATUS;",
    note: "Paste either the full InnoDB monitor output or the LATEST DETECTED DEADLOCK section.",
  },
];

const COMMON_PRIVACY_FAQ: FaqItem = {
  q: "Are my SQL execution plans or queries uploaded to a server?",
  a: "No. Culprit Explain runs 100% locally in your browser using Rust compiled to WebAssembly (@culpritsql/plans). Your execution plans, SQL statements, and deadlock logs never leave your device, and Content Security Policy restricts external network connections.",
};

export const ROUTES: RouteMeta[] = [
  {
    slug: "",
    path: "/",
    navLabel: "All Engines",
    mode: "plan",
    engineFilter: "auto",
    title: "Culprit Explain: Free Online SQL Execution Plan & Deadlock Visualizer",
    description:
      "Visualize PostgreSQL EXPLAIN ANALYZE, SQL Server .sqlplan XML, MySQL, MariaDB, YugabyteDB, and SQLite execution plans, compare plans side-by-side, and analyze deadlocks locally in WebAssembly.",
    h1: "Understand any SQL execution plan or deadlock in seconds.",
    subtitle:
      "Drop a plan or deadlock dump for interactive flow diagrams, bottleneck fixes, cache/disk I/O breakdown, and side-by-side diffs. Runs 100% locally in WebAssembly.",
    placeholder:
      "Paste PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) or text, SQL Server .sqlplan XML, MySQL EXPLAIN FORMAT=JSON / ANALYZE, YugabyteDB JSON, or SQLite EXPLAIN QUERY PLAN...",
    captureGuides: [
      CAPTURE_GUIDES.postgres,
      CAPTURE_GUIDES.mssql,
      CAPTURE_GUIDES.mysql,
      CAPTURE_GUIDES.yugabyte,
      CAPTURE_GUIDES.sqlite,
    ],
    faqs: [
      COMMON_PRIVACY_FAQ,
      {
        q: "Which database engines and plan formats does Culprit Explain support?",
        a: "Culprit Explain parses SQL Server Showplan XML (.sqlplan), PostgreSQL EXPLAIN (FORMAT JSON) and EXPLAIN ANALYZE text, MySQL and MariaDB EXPLAIN FORMAT=JSON and EXPLAIN ANALYZE tree text, YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON), and SQLite EXPLAIN QUERY PLAN, plus deadlock dumps from SQL Server, PostgreSQL, and InnoDB.",
      },
      {
        q: "How is Culprit Explain different from PEV2 or Paste The Plan?",
        a: "Unlike single-engine viewers or cloud upload services, Culprit Explain supports six SQL engines in one workspace, compares Before and After plans structurally side-by-side, visualizes deadlock cycles, redacts SQL literals when sharing, and executes entirely client-side with zero server uploads.",
      },
      {
        q: "Can I embed this plan viewer in my own React application?",
        a: "Yes. Both the WebAssembly parser (@culpritsql/plans) and the React component suite (@culpritsql/plan-viewer) are open-source MIT packages on npm.",
      },
    ],
  },
  {
    slug: "postgres",
    path: "/postgres/",
    navLabel: "PostgreSQL",
    mode: "plan",
    engineFilter: "postgres",
    title: "PostgreSQL EXPLAIN ANALYZE Visualizer Online | Culprit Explain",
    description:
      "Free client-side PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) and text plan visualizer. Inspect slow nodes, shared buffer cache hits vs disk reads, temp spills, and parallel worker skew.",
    h1: "PostgreSQL EXPLAIN ANALYZE Visualizer",
    subtitle:
      "Paste JSON or text output from EXPLAIN (ANALYZE, BUFFERS) for interactive operator DAGs, buffer cache vs disk bars, cardinality drift, and index recommendations.",
    placeholder:
      "Paste PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) or plain EXPLAIN ANALYZE text output here...",
    captureGuides: [CAPTURE_GUIDES.postgres],
    faqs: [
      {
        q: "Should I use FORMAT JSON or plain text for PostgreSQL EXPLAIN?",
        a: "Both work in Culprit Explain, including plans copied directly from psql. Running EXPLAIN (ANALYZE, BUFFERS, WAL, VERBOSE, FORMAT JSON) captures the richest per-node I/O, sort space, parallel worker, and column projection metadata.",
      },
      {
        q: "How does Culprit calculate PostgreSQL buffer sizes in MB?",
        a: "PostgreSQL shared, local, and temp buffer blocks use 8 KB pages by default. Culprit surfaces exact hit, read, dirtied, and temp spill block counts alongside human-readable KB/MB/GB totals and cache hit ratios.",
      },
      COMMON_PRIVACY_FAQ,
    ],
  },
  {
    slug: "sql-server",
    path: "/sql-server/",
    navLabel: "SQL Server",
    mode: "plan",
    engineFilter: "mssql",
    title: "SQL Server Execution Plan (.sqlplan) Viewer Online | Culprit Explain",
    description:
      "Open SQL Server and Azure SQL .sqlplan Showplan XML files directly in your browser. Spot Key Lookups, missing indexes, memory grant spills, implicit conversions, and parallelism skew with zero server uploads.",
    h1: "SQL Server .sqlplan Viewer Online",
    subtitle:
      "Drop any SSMS or Azure Data Studio .sqlplan XML file to inspect actual vs estimated rows, logical reads, batch-mode operators, Key Lookups, and missing index SQL.",
    placeholder: "Drop a .sqlplan file or paste <ShowPlanXML xmlns=\"http://schemas.microsoft.com/sqlserver/2004/07/showplan\">...",
    captureGuides: [CAPTURE_GUIDES.mssql],
    faqs: [
      {
        q: "Does Culprit Explain support both Estimated and Actual SQL Server .sqlplan files?",
        a: "Yes. Estimated plans render subtree costs, estimated rows, seek/residual predicates, and missing index hints. Actual plans additionally unlock per-operator elapsed/CPU milliseconds, logical/physical 8 KB page reads, spills, and per-thread row distributions.",
      },
      COMMON_PRIVACY_FAQ,
    ],
  },
  {
    slug: "mysql",
    path: "/mysql/",
    navLabel: "MySQL & MariaDB",
    mode: "plan",
    engineFilter: "mysql",
    title: "MySQL & MariaDB EXPLAIN Visualizer Online | Culprit Explain",
    description:
      "Visualize MySQL EXPLAIN FORMAT=JSON, MySQL 8.0+ EXPLAIN ANALYZE tree plans, and MariaDB JSON execution plans online in your browser with zero uploads.",
    h1: "MySQL & MariaDB EXPLAIN Visualizer",
    subtitle:
      "Turn dense EXPLAIN FORMAT=JSON documents and EXPLAIN ANALYZE trees into clear visual flow diagrams, full-scan warnings, filesort/temporary table flags, and table rollups.",
    placeholder: "Paste MySQL / MariaDB EXPLAIN FORMAT=JSON or MySQL EXPLAIN ANALYZE (-> Nested loop...) output...",
    captureGuides: [CAPTURE_GUIDES.mysql],
    faqs: [
      {
        q: "Does this support MySQL 8 EXPLAIN ANALYZE as well as EXPLAIN FORMAT=JSON?",
        a: "Yes. Paste either JSON plans from MySQL or MariaDB or arrow-indented EXPLAIN ANALYZE output with actual millisecond timings and loop counts.",
      },
      COMMON_PRIVACY_FAQ,
    ],
  },
  {
    slug: "yugabytedb",
    path: "/yugabytedb/",
    navLabel: "YugabyteDB",
    mode: "plan",
    engineFilter: "yugabyte",
    title: "YugabyteDB EXPLAIN & DocDB Plan Visualizer Online | Culprit Explain",
    description:
      "Inspect YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) execution plans online, including DocDB storage read requests, RPC execution time, and catalog overhead.",
    h1: "YugabyteDB EXPLAIN & DocDB Visualizer",
    subtitle:
      "Analyze distributed YSQL execution plans with first-class DocDB storage read/write request counters, RPC latency breakdown, and index scan diagnostics.",
    placeholder: "Paste YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) output...",
    captureGuides: [CAPTURE_GUIDES.yugabyte],
    faqs: [
      {
        q: "What extra metrics are shown when DIST is enabled on YugabyteDB EXPLAIN?",
        a: "Culprit surfaces Storage Read/Write/Flush Requests, DocDB execution time, catalog read requests, and per-node table vs index RPC counts.",
      },
      COMMON_PRIVACY_FAQ,
    ],
  },
  {
    slug: "sqlite",
    path: "/sqlite/",
    navLabel: "SQLite",
    mode: "plan",
    engineFilter: "sqlite",
    title: "SQLite EXPLAIN QUERY PLAN Visualizer Online | Culprit Explain",
    description:
      "Visualize SQLite EXPLAIN QUERY PLAN trees online. Spot full table scans, temporary B-trees for ORDER BY, and covering index searches locally in WebAssembly.",
    h1: "SQLite EXPLAIN QUERY PLAN Visualizer",
    subtitle:
      "Paste EXPLAIN QUERY PLAN text from SQLite, LibSQL, or Turso to inspect table scans, index searches, and temporary sort B-trees visually.",
    placeholder: "Paste SQLite EXPLAIN QUERY PLAN output (e.g. QUERY PLAN / `--SCAN orders)...",
    captureGuides: [CAPTURE_GUIDES.sqlite],
    faqs: [
      {
        q: "Which SQLite CLI output styles are recognized?",
        a: "Both modern tree-indented QUERY PLAN (`--SCAN / `--SEARCH) output and classic selectid|order|from|detail rows are parsed automatically.",
      },
      COMMON_PRIVACY_FAQ,
    ],
  },
  {
    slug: "compare",
    path: "/compare/",
    navLabel: "Compare Plans",
    mode: "compare",
    engineFilter: "auto",
    title: "Compare SQL Execution Plans Side-by-Side Online | Culprit Explain",
    description:
      "Diff Before and After SQL execution plans structurally in your browser. Measure exact speedup or cost ratio, spot Seq Scan to Index Scan flips, and verify query optimizations.",
    h1: "Compare SQL Execution Plans Side-by-Side",
    subtitle:
      "Paste a Before plan and an After plan to verify index changes, query rewrites, and parameter-sniffing regressions with structural operator diffing.",
    placeholder: "Paste Before and After execution plans...",
    captureGuides: [CAPTURE_GUIDES.postgres, CAPTURE_GUIDES.mssql, CAPTURE_GUIDES.mysql],
    faqs: [
      {
        q: "What does structural SQL plan comparison check?",
        a: "Culprit matches operators across both trees, computes measured runtime speedup or estimated cost change, flags access-path flips (such as Seq Scan to Index Scan), and explains why the optimizer chose a different plan.",
      },
      COMMON_PRIVACY_FAQ,
    ],
  },
  {
    slug: "deadlock",
    path: "/deadlock/",
    navLabel: "Deadlock Viewer",
    mode: "deadlock",
    engineFilter: "auto",
    title: "SQL Deadlock Graph Viewer Online (SQL Server, Postgres, MySQL) | Culprit Explain",
    description:
      "Visualize SQL Server XML deadlock graphs, PostgreSQL deadlock log excerpts, and MySQL InnoDB deadlock dumps online. See lock wait cycles, victim sessions, and SQL remediation steps.",
    h1: "SQL Deadlock Graph & Root-Cause Analyzer",
    subtitle:
      "Drop a SQL Server .xdl/.xml deadlock report, PostgreSQL error log, or SHOW ENGINE INNODB STATUS dump for an interactive lock-cycle diagram and fix steps.",
    placeholder:
      "Paste SQL Server <deadlock> XML, PostgreSQL deadlock log lines, or MySQL SHOW ENGINE INNODB STATUS output...",
    captureGuides: DEADLOCK_GUIDES,
    faqs: [
      {
        q: "Which deadlock formats can Culprit Explain visualize?",
        a: "SQL Server XML deadlock graphs (<deadlock-list> or <deadlock>), PostgreSQL server log deadlock blocks (ERROR: deadlock detected + DETAIL), and MySQL / MariaDB SHOW ENGINE INNODB STATUS output.",
      },
      COMMON_PRIVACY_FAQ,
    ],
  },
];

export function findRouteByPathname(pathname: string, basePath = "/"): RouteMeta {
  const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  let rel = pathname;
  if (cleanBase && rel.startsWith(cleanBase)) {
    rel = rel.slice(cleanBase.length);
  }
  const slug = rel.replace(/^\/+|\/+$/g, "").split("/")[0] ?? "";
  return ROUTES.find((r) => r.slug === slug) ?? ROUTES[0];
}
