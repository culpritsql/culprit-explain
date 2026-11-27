import type { Engine } from "@culpritsql/plan-viewer";
import type { StudioMode } from "./routes";

export interface SampleCase {
  id: string;
  title: string;
  badge: string;
  metric: string;
  tone: "amber" | "green" | "coral" | "blue";
  icon: string;
  mode: StudioMode;
  engine?: Engine;
  sql?: string;
  planText?: string;
  beforeName?: string;
  beforeText?: string;
  afterName?: string;
  afterText?: string;
  deadlockText?: string;
  eventsXml?: string;
}

const PG_SPILL_BEFORE = JSON.stringify(
  [
    {
      Plan: {
        "Node Type": "Limit",
        "Startup Cost": 48210.4,
        "Total Cost": 48215.9,
        "Plan Rows": 50,
        "Plan Width": 96,
        "Actual Startup Time": 318.4,
        "Actual Total Time": 319.2,
        "Actual Rows": 50,
        "Actual Loops": 1,
        "Shared Hit Blocks": 4120,
        "Shared Read Blocks": 18420,
        "Temp Read Blocks": 2304,
        "Temp Written Blocks": 2304,
        Plans: [
          {
            "Node Type": "Sort",
            "Sort Key": ["o.created_at DESC"],
            "Sort Method": "external merge",
            "Sort Space Used": 18432,
            "Sort Space Type": "Disk",
            "Startup Cost": 48210.4,
            "Total Cost": 48285.1,
            "Plan Rows": 29880,
            "Plan Width": 96,
            "Actual Startup Time": 318.1,
            "Actual Total Time": 318.9,
            "Actual Rows": 50,
            "Actual Loops": 1,
            "Shared Hit Blocks": 4120,
            "Shared Read Blocks": 18420,
            "Temp Read Blocks": 2304,
            "Temp Written Blocks": 2304,
            Plans: [
              {
                "Node Type": "Hash Join",
                "Join Type": "Inner",
                "Hash Cond": "(o.customer_id = c.id)",
                "Startup Cost": 1420.0,
                "Total Cost": 44890.0,
                "Plan Rows": 29880,
                "Plan Width": 96,
                "Actual Startup Time": 24.6,
                "Actual Total Time": 274.5,
                "Actual Rows": 41280,
                "Actual Loops": 1,
                "Shared Hit Blocks": 4120,
                "Shared Read Blocks": 18420,
                Plans: [
                  {
                    "Node Type": "Seq Scan",
                    "Relation Name": "orders",
                    Schema: "public",
                    Alias: "o",
                    Filter: "((status = 'paid'::text) AND (created_at >= '2026-10-01'::timestamptz))",
                    "Rows Removed by Filter": 1458720,
                    "Startup Cost": 0.0,
                    "Total Cost": 39840.0,
                    "Plan Rows": 3100,
                    "Plan Width": 64,
                    "Actual Startup Time": 0.08,
                    "Actual Total Time": 218.4,
                    "Actual Rows": 41280,
                    "Actual Loops": 1,
                    "Shared Hit Blocks": 3680,
                    "Shared Read Blocks": 18420,
                  },
                  {
                    "Node Type": "Hash",
                    "Buckets": 65536,
                    "Batches": 1,
                    "Memory Usage": 2684,
                    "Startup Cost": 980.0,
                    "Total Cost": 980.0,
                    "Plan Rows": 35200,
                    "Plan Width": 32,
                    "Actual Startup Time": 24.2,
                    "Actual Total Time": 24.2,
                    "Actual Rows": 35200,
                    "Actual Loops": 1,
                    "Shared Hit Blocks": 440,
                    Plans: [
                      {
                        "Node Type": "Seq Scan",
                        "Relation Name": "customers",
                        Schema: "public",
                        Alias: "c",
                        "Startup Cost": 0.0,
                        "Total Cost": 980.0,
                        "Plan Rows": 35200,
                        "Plan Width": 32,
                        "Actual Startup Time": 0.03,
                        "Actual Total Time": 11.8,
                        "Actual Rows": 35200,
                        "Actual Loops": 1,
                        "Shared Hit Blocks": 440,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      "Planning Time": 0.84,
      "Execution Time": 321.6,
    },
  ],
  null,
  2,
);

const PG_INDEX_AFTER = JSON.stringify(
  [
    {
      Plan: {
        "Node Type": "Limit",
        "Startup Cost": 0.86,
        "Total Cost": 84.2,
        "Plan Rows": 50,
        "Plan Width": 96,
        "Actual Startup Time": 0.19,
        "Actual Total Time": 1.84,
        "Actual Rows": 50,
        "Actual Loops": 1,
        "Shared Hit Blocks": 254,
        Plans: [
          {
            "Node Type": "Nested Loop",
            "Join Type": "Inner",
            "Startup Cost": 0.86,
            "Total Cost": 3420.0,
            "Plan Rows": 2050,
            "Plan Width": 96,
            "Actual Startup Time": 0.18,
            "Actual Total Time": 1.79,
            "Actual Rows": 50,
            "Actual Loops": 1,
            "Shared Hit Blocks": 254,
            Plans: [
              {
                "Node Type": "Index Scan",
                "Scan Direction": "Backward",
                "Index Name": "ix_orders_status_created_at",
                "Relation Name": "orders",
                Schema: "public",
                Alias: "o",
                "Index Cond": "((status = 'paid'::text) AND (created_at >= '2026-10-01'::timestamptz))",
                "Startup Cost": 0.43,
                "Total Cost": 1240.0,
                "Plan Rows": 41000,
                "Plan Width": 64,
                "Actual Startup Time": 0.11,
                "Actual Total Time": 0.62,
                "Actual Rows": 50,
                "Actual Loops": 1,
                "Shared Hit Blocks": 54,
              },
              {
                "Node Type": "Index Scan",
                "Scan Direction": "Forward",
                "Index Name": "customers_pkey",
                "Relation Name": "customers",
                Schema: "public",
                Alias: "c",
                "Index Cond": "(id = o.customer_id)",
                "Startup Cost": 0.43,
                "Total Cost": 0.53,
                "Plan Rows": 1,
                "Plan Width": 32,
                "Actual Startup Time": 0.02,
                "Actual Total Time": 0.02,
                "Actual Rows": 1,
                "Actual Loops": 50,
                "Shared Hit Blocks": 200,
              },
            ],
          },
        ],
      },
      "Planning Time": 0.42,
      "Execution Time": 1.92,
    },
  ],
  null,
  2,
);

const MSSQL_KEY_LOOKUP_XML = `<ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan" Version="1.564" Build="16.0.4295.3">
  <BatchSequence><Batch><Statements>
    <StmtSimple StatementText="SELECT TOP 50 o.id, c.name, o.total_cents, o.shipping_notes FROM shop.orders o JOIN shop.customers c ON c.id = o.customer_id WHERE o.status = 'shipped' ORDER BY o.created_at DESC" StatementId="1" StatementCompId="1" StatementType="SELECT" StatementSubTreeCost="14.82" StatementEstRows="50" StatementOptmLevel="FULL" CardinalityEstimationModelVersion="160">
      <QueryPlan DegreeOfParallelism="1" CachedPlanSize="64" CompileTime="14" CompileCPU="12">
        <MissingIndexes>
          <MissingIndexGroup Impact="91.4">
            <MissingIndex Database="[culprit_demo]" Schema="[shop]" Table="[orders]">
              <ColumnGroup Usage="EQUALITY"><Column Name="[status]" ColumnId="4"/></ColumnGroup>
              <ColumnGroup Usage="INCLUDE"><Column Name="[customer_id]" ColumnId="2"/><Column Name="[total_cents]" ColumnId="5"/><Column Name="[shipping_notes]" ColumnId="8"/></ColumnGroup>
            </MissingIndex>
          </MissingIndexGroup>
        </MissingIndexes>
        <QueryTimeStats ElapsedTime="184" CpuTime="92"/>
        <RelOp NodeId="0" PhysicalOp="Top" LogicalOp="Top" EstimateRows="50" EstimateIO="0" EstimateCPU="0.00005" AvgRowSize="212" EstimatedTotalSubtreeCost="14.82" Parallel="0" EstimatedExecutionMode="Row">
          <RunTimeInformation><RunTimeCountersPerThread Thread="0" ActualRows="50" ActualElapsedms="184" ActualCPUms="92" ActualExecutions="1" ActualExecutionMode="Row"/></RunTimeInformation>
          <Top RowCount="0" IsPercent="0" WithTies="0">
            <RelOp NodeId="1" PhysicalOp="Nested Loops" LogicalOp="Inner Join" EstimateRows="50" EstimateIO="0" EstimateCPU="0.024" AvgRowSize="212" EstimatedTotalSubtreeCost="14.81" Parallel="0" EstimatedExecutionMode="Row">
              <RunTimeInformation><RunTimeCountersPerThread Thread="0" ActualRows="50" ActualElapsedms="183" ActualCPUms="91" ActualExecutions="1" ActualExecutionMode="Row"/></RunTimeInformation>
              <NestedLoops Optimized="0">
                <RelOp NodeId="3" PhysicalOp="Nested Loops" LogicalOp="Inner Join" EstimateRows="50" EstimateIO="0" EstimateCPU="0.18" AvgRowSize="148" EstimatedTotalSubtreeCost="13.94" Parallel="0" EstimatedExecutionMode="Row">
                  <RunTimeInformation><RunTimeCountersPerThread Thread="0" ActualRows="18400" ActualElapsedms="169" ActualCPUms="82" ActualExecutions="1" ActualExecutionMode="Row"/></RunTimeInformation>
                  <NestedLoops Optimized="0">
                    <RelOp NodeId="5" PhysicalOp="Index Seek" LogicalOp="Index Seek" EstimateRows="120" EstimatedRowsRead="18400" EstimateIO="0.12" EstimateCPU="0.02" AvgRowSize="24" EstimatedTotalSubtreeCost="0.14" TableCardinality="2400000" Parallel="0" EstimatedExecutionMode="Row">
                      <RunTimeInformation><RunTimeCountersPerThread Thread="0" ActualRows="18400" ActualElapsedms="18" ActualCPUms="14" ActualScans="1" ActualLogicalReads="94" ActualPhysicalReads="4" ActualExecutions="1" ActualExecutionMode="Row"/></RunTimeInformation>
                      <IndexScan Ordered="1" ScanDirection="BACKWARD" Storage="RowStore">
                        <Object Database="[culprit_demo]" Schema="[shop]" Table="[orders]" Index="[ix_orders_status_created]" Alias="[o]" IndexKind="NonClustered" Storage="RowStore"/>
                      </IndexScan>
                    </RelOp>
                    <RelOp NodeId="7" PhysicalOp="Clustered Index Seek" LogicalOp="Clustered Index Seek" EstimateRows="1" EstimateIO="0.003125" EstimateCPU="0.0001581" AvgRowSize="132" EstimatedTotalSubtreeCost="13.62" TableCardinality="2400000" Parallel="0" EstimateRebinds="119" EstimatedExecutionMode="Row">
                      <RunTimeInformation><RunTimeCountersPerThread Thread="0" ActualRows="18400" ActualElapsedms="146" ActualCPUms="64" ActualScans="0" ActualLogicalReads="56120" ActualPhysicalReads="1890" ActualExecutions="18400" ActualExecutionMode="Row"/></RunTimeInformation>
                      <IndexScan Lookup="1" Ordered="1" ScanDirection="FORWARD" Storage="RowStore">
                        <Object Database="[culprit_demo]" Schema="[shop]" Table="[orders]" Index="[pk_orders]" Alias="[o]" IndexKind="Clustered" Storage="RowStore"/>
                      </IndexScan>
                    </RelOp>
                  </NestedLoops>
                </RelOp>
                <RelOp NodeId="8" PhysicalOp="Clustered Index Seek" LogicalOp="Clustered Index Seek" EstimateRows="1" EstimateIO="0.003125" EstimateCPU="0.0001581" AvgRowSize="76" EstimatedTotalSubtreeCost="0.84" TableCardinality="200000" Parallel="0" EstimateRebinds="49" EstimatedExecutionMode="Row">
                  <RunTimeInformation><RunTimeCountersPerThread Thread="0" ActualRows="50" ActualElapsedms="12" ActualCPUms="8" ActualLogicalReads="152" ActualPhysicalReads="0" ActualExecutions="50" ActualExecutionMode="Row"/></RunTimeInformation>
                  <IndexScan Ordered="1" ScanDirection="FORWARD" Storage="RowStore">
                    <Object Database="[culprit_demo]" Schema="[shop]" Table="[customers]" Index="[pk_customers]" Alias="[c]" IndexKind="Clustered" Storage="RowStore"/>
                  </IndexScan>
                </RelOp>
              </NestedLoops>
            </RelOp>
          </Top>
        </RelOp>
      </QueryPlan>
    </StmtSimple>
  </Statements></Batch></BatchSequence>
</ShowPlanXML>`;

const MSSQL_DEADLOCK_XML = `<deadlock>
  <victim-list>
    <victimProcess id="process201"/>
  </victim-list>
  <process-list>
    <process id="process201" spid="74" clientapp="checkout-worker" loginname="app_checkout" hostname="worker-03" isolationlevel="read committed (2)" waitresource="KEY: 6:72057594041204736 (81944f3284a0)" waittime="1840" status="suspended" lastbatchstarted="2026-11-22T18:14:09.410">
      <executionStack>
        <frame procname="adhoc" sqlhandle="0x02">UPDATE dbo.inventory SET reserved = reserved + @qty WHERE sku_id = @sku;</frame>
      </executionStack>
      <inputbuf>BEGIN TRAN; UPDATE dbo.orders SET status = 'reserved' WHERE id = 91824; UPDATE dbo.inventory SET reserved = reserved + 2 WHERE sku_id = 4410;</inputbuf>
    </process>
    <process id="process202" spid="112" clientapp="fulfillment-sync" loginname="app_fulfillment" hostname="sync-01" isolationlevel="read committed (2)" waitresource="KEY: 6:72057594039894016 (44019a01b2c1)" waittime="1825" status="suspended" lastbatchstarted="2026-11-22T18:14:09.425">
      <executionStack>
        <frame procname="adhoc" sqlhandle="0x03">UPDATE dbo.orders SET shipped_at = SYSUTCDATETIME() WHERE id = @order_id;</frame>
      </executionStack>
      <inputbuf>BEGIN TRAN; UPDATE dbo.inventory SET on_hand = on_hand - 2 WHERE sku_id = 4410; UPDATE dbo.orders SET shipped_at = SYSUTCDATETIME() WHERE id = 91824;</inputbuf>
    </process>
  </process-list>
  <resource-list>
    <keylock hobtid="72057594039894016" dbid="6" objectname="shop.dbo.orders" indexname="PK_orders" id="lock_orders" mode="X">
      <owner-list><owner id="process201" mode="X"/></owner-list>
      <waiter-list><waiter id="process202" mode="U" requestType="wait"/></waiter-list>
    </keylock>
    <keylock hobtid="72057594041204736" dbid="6" objectname="shop.dbo.inventory" indexname="PK_inventory" id="lock_inventory" mode="X">
      <owner-list><owner id="process202" mode="X"/></owner-list>
      <waiter-list><waiter id="process201" mode="X" requestType="wait"/></waiter-list>
    </keylock>
  </resource-list>
</deadlock>`;

const MSSQL_SYSTEM_HEALTH_XML = `<events>
  <event name="xml_deadlock_report" package="sqlserver" timestamp="2026-11-22T18:14:09.890Z">
    <data name="xml_report"><value>${MSSQL_DEADLOCK_XML}</value></data>
  </event>
  <event name="error_reported" package="sqlserver" timestamp="2026-11-22T18:14:09.892Z">
    <data name="error_number"><value>1205</value></data>
    <data name="severity"><value>13</value></data>
    <data name="state"><value>51</value></data>
    <data name="user_defined"><value>false</value></data>
    <action name="session_id" package="sqlserver"><value>74</value></action>
    <action name="client_app_name" package="sqlserver"><value>checkout-worker</value></action>
    <action name="client_hostname" package="sqlserver"><value>worker-03</value></action>
    <action name="database_name" package="sqlserver"><value>shop_prod</value></action>
    <action name="sql_text" package="sqlserver"><value>UPDATE dbo.inventory SET reserved = reserved + 2 WHERE sku_id = 4410;</value></action>
  </event>
  <event name="error_reported" package="sqlserver" timestamp="2026-11-22T18:14:18.420Z">
    <data name="error_number"><value>1222</value></data>
    <data name="severity"><value>16</value></data>
    <data name="state"><value>56</value></data>
    <data name="user_defined"><value>false</value></data>
    <action name="session_id" package="sqlserver"><value>91</value></action>
    <action name="client_app_name" package="sqlserver"><value>order-api</value></action>
    <action name="client_hostname" package="sqlserver"><value>api-pod-02</value></action>
    <action name="database_name" package="sqlserver"><value>shop_prod</value></action>
    <action name="sql_text" package="sqlserver"><value>SELECT id, status, total_cents FROM dbo.orders WITH (UPDLOCK) WHERE id = 91824;</value></action>
  </event>
  <event name="attention" package="sqlserver" timestamp="2026-11-22T18:14:33.504Z">
    <data name="duration"><value>15002000</value></data>
    <action name="session_id" package="sqlserver"><value>108</value></action>
    <action name="client_app_name" package="sqlserver"><value>reporting-service</value></action>
    <action name="client_hostname" package="sqlserver"><value>report-worker-01</value></action>
    <action name="database_name" package="sqlserver"><value>shop_prod</value></action>
    <action name="sql_text" package="sqlserver"><value>SELECT customer_id, SUM(total_cents) FROM dbo.orders WHERE status = 'paid' GROUP BY customer_id;</value></action>
  </event>
</events>`;

const YUGABYTE_DOCDB_JSON = JSON.stringify(
  [
    {
      Plan: {
        "Node Type": "Index Scan",
        "Parallel Aware": false,
        "Async Capable": false,
        "Scan Direction": "NoMovement",
        "Index Name": "orders_created_idx",
        "Relation Name": "orders",
        Alias: "orders",
        "Startup Cost": 48.17,
        "Total Cost": 48.47,
        "Plan Rows": 1,
        "Plan Width": 123,
        "Actual Startup Time": 2.456,
        "Actual Total Time": 2.458,
        "Actual Rows": 1,
        "Actual Loops": 1,
        "Index Cond": "(created_at = '2026-10-14 21:20:00+00'::timestamp with time zone)",
        "Rows Removed by Index Recheck": 0,
        "Storage Table Read Requests": 1,
        "Storage Table Read Execution Time": 0.442,
        "Storage Table Read Ops": 1,
        "Storage Table Rows Scanned": 1,
        "Storage Index Read Requests": 1,
        "Storage Index Read Execution Time": 1.696,
        "Storage Index Read Ops": 1,
        "Storage Index Rows Scanned": 1,
      },
      "Planning Time": 10.997,
      Triggers: [],
      "Execution Time": 3.892,
      "Storage Read Requests": 2,
      "Storage Read Execution Time": 2.138,
      "Storage Read Ops": 2,
      "Storage Rows Scanned": 2,
      "Catalog Read Requests": 54,
      "Catalog Read Execution Time": 11.95,
      "Catalog Read Ops": 54,
      "Catalog Write Requests": 0,
      "Storage Write Requests": 0,
      "Storage Flush Requests": 0,
      "Storage Execution Time": 14.088,
      "Peak Memory Usage": 89,
    },
  ],
  null,
  2,
);

const SAMPLE_SQL =
  "SELECT o.id, o.total_cents, c.email\nFROM public.orders o\nJOIN public.customers c ON c.id = o.customer_id\nWHERE o.status = 'paid' AND o.created_at >= '2026-10-01'\nORDER BY o.created_at DESC\nLIMIT 50;";

export const SAMPLES: SampleCase[] = [
  {
    id: "pg-spill",
    title: "Recent Paid Orders (Seq Scan + Disk Spill)",
    badge: "PostgreSQL",
    metric: "321.6 ms · 18 MB spill",
    tone: "coral",
    icon: "providers/postgres.svg",
    mode: "plan",
    engine: "postgres",
    sql: SAMPLE_SQL,
    planText: PG_SPILL_BEFORE,
  },
  {
    id: "pg-diff",
    title: "Before vs After Composite Index",
    badge: "Plan Diff",
    metric: "167x faster · 322 ms -> 1.9 ms",
    tone: "green",
    icon: "providers/postgres.svg",
    mode: "compare",
    engine: "postgres",
    sql: SAMPLE_SQL,
    beforeName: "Before index",
    beforeText: PG_SPILL_BEFORE,
    afterName: "After ix_orders_status_created_at",
    afterText: PG_INDEX_AFTER,
  },
  {
    id: "mssql-lookup",
    title: "Shipped Orders (18.4K Key Lookups)",
    badge: "SQL Server",
    metric: "184 ms · 56K logical reads",
    tone: "amber",
    icon: "providers/mssql.svg",
    mode: "plan",
    engine: "mssql",
    planText: MSSQL_KEY_LOOKUP_XML,
  },
  {
    id: "mssql-deadlock",
    title: "Checkout vs Fulfillment Lock Cycle",
    badge: "Deadlock",
    metric: "2 sessions · Victim SPID 74",
    tone: "coral",
    icon: "providers/mssql.svg",
    mode: "deadlock",
    deadlockText: MSSQL_DEADLOCK_XML,
  },
  {
    id: "mssql-xel",
    title: "system_health Timeouts & Deadlock",
    badge: "Extended Events",
    metric: "4 events · .xel / XML",
    tone: "amber",
    icon: "providers/mssql.svg",
    mode: "deadlock",
    eventsXml: MSSQL_SYSTEM_HEALTH_XML,
  },
  {
    id: "yb-docdb",
    title: "Distributed Index Scan + DocDB RPCs",
    badge: "YugabyteDB",
    metric: "3.9 ms · 54 catalog RPCs",
    tone: "blue",
    icon: "providers/yugabyte.svg",
    mode: "plan",
    engine: "yugabyte",
    sql: "SELECT * FROM orders WHERE created_at = '2026-10-14 21:20:00+00'::timestamptz;",
    planText: YUGABYTE_DOCDB_JSON,
  },
];
