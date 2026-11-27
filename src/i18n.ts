import type { EngineFilter, FaqItem, StudioMode } from "./routes";

export type LocaleCode = "en" | "zh" | "ja" | "ko" | "ru" | "de" | "es" | "fr" | "pt";

export interface LocaleSpec {
  code: LocaleCode;
  hreflang: string;
  htmlLang: string;
  ogLocale: string;
  nativeLabel: string;
  shortLabel: string;
}

export const LOCALES: LocaleSpec[] = [
  { code: "en", hreflang: "en", htmlLang: "en", ogLocale: "en_US", nativeLabel: "English", shortLabel: "EN" },
  { code: "zh", hreflang: "zh-Hans", htmlLang: "zh-Hans", ogLocale: "zh_CN", nativeLabel: "简体中文", shortLabel: "中文" },
  { code: "ja", hreflang: "ja", htmlLang: "ja", ogLocale: "ja_JP", nativeLabel: "日本語", shortLabel: "日本語" },
  { code: "ko", hreflang: "ko", htmlLang: "ko", ogLocale: "ko_KR", nativeLabel: "한국어", shortLabel: "한국어" },
  { code: "ru", hreflang: "ru", htmlLang: "ru", ogLocale: "ru_RU", nativeLabel: "Русский", shortLabel: "RU" },
  { code: "de", hreflang: "de", htmlLang: "de", ogLocale: "de_DE", nativeLabel: "Deutsch", shortLabel: "DE" },
  { code: "es", hreflang: "es", htmlLang: "es", ogLocale: "es_ES", nativeLabel: "Español", shortLabel: "ES" },
  { code: "fr", hreflang: "fr", htmlLang: "fr", ogLocale: "fr_FR", nativeLabel: "Français", shortLabel: "FR" },
  { code: "pt", hreflang: "pt-BR", htmlLang: "pt-BR", ogLocale: "pt_BR", nativeLabel: "Português", shortLabel: "PT" },
];

export type RouteSlug =
  | ""
  | "postgres"
  | "sql-server"
  | "mysql"
  | "yugabytedb"
  | "sqlite"
  | "compare"
  | "deadlock"
  | "extended-events";

export interface LocalizedRouteCopy {
  navLabel: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  faqs: FaqItem[];
}

export interface UiStrings {
  localWasm: string;
  loadingWasm: string;
  wasmOffline: string;
  wasmTooltip: string;
  tabPlan: string;
  tabCompare: string;
  tabDeadlock: string;
  history: string;
  sqlStudio: string;
  githubRepo: string;
  trustBanner: string;
  autoDetect: string;
  optionalTitlePlaceholder: string;
  attachSql: string;
  hideSql: string;
  sqlPlaceholder: string;
  paste: string;
  openFile: string;
  file: string;
  dropHintPlan: string;
  dropHintDeadlock: string;
  analyzePlan: string;
  analyzing: string;
  comparePlans: string;
  comparing: string;
  visualizeDeadlock: string;
  swapAB: string;
  beforePlaceholder: string;
  afterPlaceholder: string;
  trySampleKicker: string;
  editInput: string;
  newAnalysis: string;
  redactLiterals: string;
  shareLink: string;
  capturePlanHeading: string;
  captureDeadlockHeading: string;
  captureSub: string;
  copy: string;
  copied: string;
  faqHeading: string;
  upsellBadge: string;
  upsellTitle: string;
  upsellBody: string;
  upsellPrimaryCta: string;
  upsellSecondaryCta: string;
  ecosystemHeading: string;
  ecosystemSub: string;
  ecoStudioDesc: string;
  ecoFleetDesc: string;
  ecoVscodeDesc: string;
  ecoDevtoolsDesc: string;
  ecoCiDesc: string;
  ecoTestDesc: string;
  ecoPlansDesc: string;
  ecoViewerDesc: string;
  localHistoryTitle: string;
  localHistorySub: string;
  localHistoryEmpty: string;
  clear: string;
}

export interface LocaleBundle {
  ui: UiStrings;
  routes: Record<RouteSlug, LocalizedRouteCopy>;
}

const EN_PRIVACY_FAQ: FaqItem = {
  q: "Are my SQL execution plans or queries uploaded to a server?",
  a: "No. Culprit Explain runs 100% locally in your browser using Rust compiled to WebAssembly (@culpritsql/plans). Your execution plans, SQL statements, and deadlock logs never leave your device.",
};

const ZH_PRIVACY_FAQ: FaqItem = {
  q: "我的 SQL 执行计划或查询会上传到服务器吗？",
  a: "绝不会。Culprit Explain 基于编译为 WebAssembly 的 Rust 引擎 (@culpritsql/plans) 100% 在您的浏览器本地运行。您的执行计划、SQL 语句和死锁日志绝不会离开您的设备。",
};

const JA_PRIVACY_FAQ: FaqItem = {
  q: "SQL 実行計画やクエリはサーバーにアップロードされますか？",
  a: "いいえ。Culprit Explain は WebAssembly にコンパイルされた Rust エンジン (@culpritsql/plans) により 100% ブラウザ内でローカル実行されます。実行計画や SQL、デッドロックログが外部に送信されることはありません。",
};

const KO_PRIVACY_FAQ: FaqItem = {
  q: "SQL 실행 계획이나 쿼리가 서버로 업로드되나요?",
  a: "아니요. Culprit Explain은 WebAssembly로 컴파일된 Rust 엔진(@culpritsql/plans)을 사용하여 브라우저에서 100% 로컬로 실행됩니다. 실행 계획, SQL 쿼리, 데드락 로그는 절대 기기 밖으로 전송되지 않습니다.",
};

const RU_PRIVACY_FAQ: FaqItem = {
  q: "Отправляются ли мои SQL-запросы и планы выполнения на сервер?",
  a: "Нет. Culprit Explain работает на 100% локально в вашем браузере с помощью Rust и WebAssembly (@culpritsql/plans). Планы выполнения, SQL-код и дампы взаимоблокировок никогда не покидают ваше устройство.",
};

const DE_PRIVACY_FAQ: FaqItem = {
  q: "Werden meine SQL-Ausführungspläne oder Abfragen auf einen Server hochgeladen?",
  a: "Nein. Culprit Explain läuft zu 100 % lokal in Ihrem Browser über Rust und WebAssembly (@culpritsql/plans). Ihre Pläne, SQL-Abfragen und Deadlock-Logs verlassen Ihr Gerät nie.",
};

const ES_PRIVACY_FAQ: FaqItem = {
  q: "¿Se suben mis planes de ejecución SQL o consultas a algún servidor?",
  a: "No. Culprit Explain se ejecuta 100 % localmente en tu navegador mediante Rust compilado a WebAssembly (@culpritsql/plans). Tus planes, sentencias SQL y registros de deadlocks nunca salen de tu dispositivo.",
};

const FR_PRIVACY_FAQ: FaqItem = {
  q: "Mes plans d'exécution SQL ou mes requêtes sont-ils envoyés vers un serveur ?",
  a: "Non. Culprit Explain s'exécute à 100 % localement dans votre navigateur grâce à Rust compilé en WebAssembly (@culpritsql/plans). Vos plans, requêtes SQL et journaux d'interblocage ne quittent jamais votre machine.",
};

const PT_PRIVACY_FAQ: FaqItem = {
  q: "Meus planos de execução SQL ou consultas são enviados para algum servidor?",
  a: "Não. O Culprit Explain roda 100% localmente no seu navegador usando Rust compilado para WebAssembly (@culpritsql/plans). Seus planos, consultas SQL e logs de deadlock nunca saem do seu dispositivo.",
};

export const BUNDLES: Record<LocaleCode, LocaleBundle> = {
  en: {
    ui: {
      localWasm: "Local Wasm",
      loadingWasm: "Loading Wasm",
      wasmOffline: "Wasm Offline",
      wasmTooltip: "Zero backend: plans and deadlocks are parsed locally in WebAssembly and never leave your browser.",
      tabPlan: "Plan",
      tabCompare: "Compare",
      tabDeadlock: "Deadlock",
      history: "History",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100% Client-Side Rust + WebAssembly · Your SQL plans never leave your browser",
      autoDetect: "Auto-detect",
      optionalTitlePlaceholder: "Optional title (e.g. Checkout Query)",
      attachSql: "+ Attach SQL",
      hideSql: "Hide SQL",
      sqlPlaceholder: "Optional SQL statement (attached when the plan format omits query text)...",
      paste: "Paste",
      openFile: "Open File",
      file: "File",
      dropHintPlan: "Drop .sqlplan, .xel, .json, .xml, or .txt anywhere on this card",
      dropHintDeadlock: "Drop .xel, .xdl, .xml, or server .log excerpts",
      analyzePlan: "Analyze Plan",
      analyzing: "Analyzing...",
      comparePlans: "Compare Plans",
      comparing: "Comparing...",
      visualizeDeadlock: "Visualize Deadlock",
      swapAB: "Swap A and B",
      beforePlaceholder: "Paste or drop the baseline (Before) execution plan...",
      afterPlaceholder: "Paste or drop the candidate (After) execution plan...",
      trySampleKicker: "Try an interactive example in one click",
      editInput: "Edit Input",
      newAnalysis: "New",
      redactLiterals: "Redact literals",
      shareLink: "Share Link",
      capturePlanHeading: "How to capture the richest execution plan",
      captureDeadlockHeading: "How to capture a deadlock dump",
      captureSub: "Run the statement below in your SQL client and paste or drop the output above.",
      copy: "Copy",
      copied: "Copied",
      faqHeading: "Frequently Asked Questions",
      upsellBadge: "Free & Open Source · MIT",
      upsellTitle: "Stop hunting for slow queries one plan at a time.",
      upsellBody:
        "Culprit SQL Studio connects read-only to PostgreSQL, SQL Server, MySQL, MariaDB, YugabyteDB, TimescaleDB, and SQLite to rank your slowest queries, test missing indexes, and catch deadlocks automatically.",
      upsellPrimaryCta: "Download Culprit SQL Studio",
      upsellSecondaryCta: "GitHub Repository",
      ecosystemHeading: "Open-Source Culprit SQL Ecosystem",
      ecosystemSub: "Every parser, React component, CI gate, and editor extension is open source under MIT.",
      ecoStudioDesc: "Desktop app, CLI, and 27-tool MCP server for automatic database tuning.",
      ecoFleetDesc: "Self-hosted multi-region database fleet command center, archive time-machine, and remote MCP server.",
      ecoVscodeDesc: "VS Code, Cursor, and Windsurf custom .sqlplan / .xdl viewer, Plan Diff Studio, and SQL CodeLens.",
      ecoDevtoolsDesc: "Floating React & Node.js SQL HUD, automatic N+1 burst detector, and live EXPLAIN inspector.",
      ecoCiDesc: "SQL migration lock linter, execution plan regression gate, SARIF 2.1.0 emitter, and PR diff bot.",
      ecoTestDesc: "Vitest, Jest, and node:test execution plan matchers for index usage, spills, and regressions.",
      ecoPlansDesc: "Portable Rust + WebAssembly SQL plan parser, differ, deadlock parser, and exporter.",
      ecoViewerDesc: "Interactive React flow diagrams, structural plan diffs, and deadlock cycle graphs.",
      localHistoryTitle: "Local History",
      localHistorySub: "Stored privately in this browser only.",
      localHistoryEmpty: "Plans, comparisons, and deadlocks you analyze appear here automatically. Nothing is sent over the network.",
      clear: "Clear",
    },
    routes: {
      "": {
        navLabel: "All Engines",
        title: "Culprit Explain: Free Online SQL Execution Plan & Deadlock Visualizer",
        description:
          "Visualize PostgreSQL EXPLAIN ANALYZE, SQL Server .sqlplan XML, MySQL, MariaDB, YugabyteDB, and SQLite execution plans, compare plans side-by-side, and analyze deadlocks locally in WebAssembly.",
        h1: "Understand any SQL execution plan or deadlock in seconds.",
        subtitle:
          "Drop a plan or deadlock dump for interactive flow diagrams, bottleneck fixes, cache/disk I/O breakdown, and side-by-side diffs. Runs 100% locally in WebAssembly.",
        faqs: [
          EN_PRIVACY_FAQ,
          {
            q: "Which database engines and plan formats does Culprit Explain support?",
            a: "SQL Server Showplan XML (.sqlplan) and binary Extended Events (.xel), PostgreSQL EXPLAIN (FORMAT JSON) and EXPLAIN ANALYZE text, MySQL and MariaDB EXPLAIN FORMAT=JSON and EXPLAIN ANALYZE tree text, YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON), and SQLite EXPLAIN QUERY PLAN, plus deadlock dumps from SQL Server, PostgreSQL, and InnoDB.",
          },
          {
            q: "How is Culprit Explain different from PEV2 or Paste The Plan?",
            a: "Culprit Explain supports six SQL engines in one workspace, compares Before and After plans structurally side-by-side, visualizes deadlock cycles, redacts SQL literals when sharing, and runs completely client-side with zero server uploads.",
          },
        ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "PostgreSQL EXPLAIN ANALYZE Visualizer Online | Culprit Explain",
        description:
          "Free client-side PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) and text plan visualizer. Inspect slow nodes, shared buffer cache hits vs disk reads, temp spills, and parallel worker skew.",
        h1: "PostgreSQL EXPLAIN ANALYZE Visualizer",
        subtitle:
          "Paste JSON or text output from EXPLAIN (ANALYZE, BUFFERS) for interactive operator DAGs, buffer cache vs disk bars, cardinality drift, and index recommendations.",
        faqs: [
          {
            q: "Should I use FORMAT JSON or plain text for PostgreSQL EXPLAIN?",
            a: "Both work in Culprit Explain. Running EXPLAIN (ANALYZE, BUFFERS, WAL, VERBOSE, FORMAT JSON) captures the richest per-node I/O, sort space, parallel worker, and column projection metadata.",
          },
          EN_PRIVACY_FAQ,
        ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "SQL Server Execution Plan (.sqlplan) Viewer Online | Culprit Explain",
        description:
          "Open SQL Server and Azure SQL .sqlplan Showplan XML and binary .xel Extended Events files directly in your browser. Spot Key Lookups, missing indexes, spills, and parallelism skew with zero server uploads.",
        h1: "SQL Server .sqlplan Viewer Online",
        subtitle:
          "Drop any SSMS or Azure Data Studio .sqlplan XML or .xel file to inspect actual vs estimated rows, logical reads, batch-mode operators, Key Lookups, and missing index SQL.",
        faqs: [
          {
            q: "Does Culprit Explain support both Estimated and Actual SQL Server .sqlplan files?",
            a: "Yes. Estimated plans render subtree costs, estimated rows, seek/residual predicates, and missing index hints. Actual plans unlock per-operator elapsed/CPU ms, 8 KB page reads, spills, and per-thread row skew.",
          },
          {
            q: "Can I open SQL Server .xel Extended Events files without Windows SSMS?",
            a: "Yes. Drop any binary .xel capture or exported Extended Events XML onto Culprit Explain (or open /extended-events/) to inspect timeouts, errors, waits, and deadlocks locally.",
          },
          EN_PRIVACY_FAQ,
        ],
      },
      mysql: {
        navLabel: "MySQL & MariaDB",
        title: "MySQL & MariaDB EXPLAIN Visualizer Online | Culprit Explain",
        description:
          "Visualize MySQL EXPLAIN FORMAT=JSON, MySQL 8.0+ EXPLAIN ANALYZE tree plans, and MariaDB JSON execution plans online in your browser with zero uploads.",
        h1: "MySQL & MariaDB EXPLAIN Visualizer",
        subtitle:
          "Turn dense EXPLAIN FORMAT=JSON documents and EXPLAIN ANALYZE trees into clear visual flow diagrams, full-scan warnings, filesort flags, and table rollups.",
        faqs: [
          {
            q: "Does this support MySQL 8 EXPLAIN ANALYZE as well as EXPLAIN FORMAT=JSON?",
            a: "Yes. Paste either JSON plans from MySQL or MariaDB or arrow-indented EXPLAIN ANALYZE output with actual millisecond timings and loop counts.",
          },
          EN_PRIVACY_FAQ,
        ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "YugabyteDB EXPLAIN & DocDB Plan Visualizer Online | Culprit Explain",
        description:
          "Inspect YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) execution plans online, including DocDB storage read requests, RPC execution time, and catalog overhead.",
        h1: "YugabyteDB EXPLAIN & DocDB Visualizer",
        subtitle:
          "Analyze distributed YSQL execution plans with first-class DocDB storage read/write request counters, RPC latency breakdown, and index scan diagnostics.",
        faqs: [EN_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "SQLite EXPLAIN QUERY PLAN Visualizer Online | Culprit Explain",
        description:
          "Visualize SQLite EXPLAIN QUERY PLAN trees online. Spot full table scans, temporary B-trees for ORDER BY, and covering index searches locally in WebAssembly.",
        h1: "SQLite EXPLAIN QUERY PLAN Visualizer",
        subtitle:
          "Paste EXPLAIN QUERY PLAN text from SQLite, LibSQL, or Turso to inspect table scans, index searches, and temporary sort B-trees visually.",
        faqs: [EN_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "Compare Plans",
        title: "Compare SQL Execution Plans Side-by-Side Online | Culprit Explain",
        description:
          "Diff Before and After SQL execution plans structurally in your browser. Measure exact speedup or cost ratio, spot Seq Scan to Index Scan flips, and verify query optimizations.",
        h1: "Compare SQL Execution Plans Side-by-Side",
        subtitle:
          "Paste a Before plan and an After plan to verify index changes, query rewrites, and parameter-sniffing regressions with structural operator diffing.",
        faqs: [EN_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "Deadlock Viewer",
        title: "SQL Deadlock Graph Viewer Online (SQL Server, Postgres, MySQL) | Culprit Explain",
        description:
          "Visualize SQL Server XML & .xel deadlock graphs, PostgreSQL deadlock log excerpts, and MySQL InnoDB deadlock dumps online. See lock wait cycles, victim sessions, and SQL remediation steps.",
        h1: "SQL Deadlock Graph & Root-Cause Analyzer",
        subtitle:
          "Drop a SQL Server .xel or .xdl/.xml deadlock report, PostgreSQL error log, or SHOW ENGINE INNODB STATUS dump for an interactive lock-cycle diagram and fix steps.",
        faqs: [EN_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "SQL Server Extended Events (.xel) Viewer Online Without SSMS | Culprit Explain",
        description:
          "Open binary SQL Server and Azure SQL Extended Events (.xel) files and RingBufferTarget XML directly in your browser on macOS, Linux, or Windows. 100% local WebAssembly with zero server uploads.",
        h1: "SQL Server Extended Events (.xel) Viewer Online",
        subtitle:
          "Drop any binary system_health*.xel, Azure SQL Blob .xel capture, or RingBufferTarget XML to inspect query timeouts, errors, wait spikes, and deadlocks without SSMS.",
        faqs: [
          {
            q: "Can I open binary SQL Server .xel files on macOS or Linux without SSMS?",
            a: "Yes. Culprit Explain decodes binary SQL Server and Azure SQL Extended Events (.xel) files 100% locally in WebAssembly inside your browser tab, with automatic SQL literal scrubbing when sharing.",
          },
          EN_PRIVACY_FAQ,
        ],
      },
    },
  },

  zh: {
    ui: {
      localWasm: "本地 Wasm",
      loadingWasm: "加载 Wasm",
      wasmOffline: "Wasm 离线",
      wasmTooltip: "零后端服务：执行计划与死锁日志均在浏览器内通过 WebAssembly 本地解析，绝不上传服务器。",
      tabPlan: "执行计划",
      tabCompare: "计划对比",
      tabDeadlock: "死锁分析",
      history: "历史记录",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100% 浏览器本地 Rust + WebAssembly 解析 · SQL 执行计划绝不离开您的设备",
      autoDetect: "自动识别",
      optionalTitlePlaceholder: "可选标题（例如：订单结算查询）",
      attachSql: "+ 附加 SQL",
      hideSql: "隐藏 SQL",
      sqlPlaceholder: "可选 SQL 语句（当执行计划不包含原始查询文本时附加）...",
      paste: "粘贴",
      openFile: "打开文件",
      file: "文件",
      dropHintPlan: "将 .sqlplan、.json、.xml 或 .txt 文件拖放到此处",
      dropHintDeadlock: "拖放 .xdl、.xml 或数据库错误日志片段",
      analyzePlan: "解析执行计划",
      analyzing: "解析中...",
      comparePlans: "对比执行计划",
      comparing: "对比中...",
      visualizeDeadlock: "可视化死锁图",
      swapAB: "交换 A 与 B",
      beforePlaceholder: "粘贴或拖放优化前 (Before) 的执行计划...",
      afterPlaceholder: "粘贴或拖放优化后 (After) 的执行计划...",
      trySampleKicker: "一键体验交互式示例",
      editInput: "返回编辑",
      newAnalysis: "新建",
      redactLiterals: "脱敏 SQL 常量",
      shareLink: "分享链接",
      capturePlanHeading: "如何获取完整的数据库执行计划",
      captureDeadlockHeading: "如何导出数据库死锁日志",
      captureSub: "在您的 SQL 客户端中运行以下命令，并将输出结果粘贴或拖放到上方编辑器。",
      copy: "复制",
      copied: "已复制",
      faqHeading: "常见问题解答",
      upsellBadge: "免费开源 · MIT 许可",
      upsellTitle: "告别逐条手动粘贴排查慢查询。",
      upsellBody:
        "Culprit SQL Studio 以只读方式连接 PostgreSQL、SQL Server、MySQL、MariaDB、YugabyteDB、TimescaleDB 和 SQLite，自动定位慢查询、验证缺失索引并捕获死锁。",
      upsellPrimaryCta: "访问 Culprit SQL Studio",
      upsellSecondaryCta: "GitHub 仓库",
      ecosystemHeading: "Culprit SQL 开源生态",
      ecosystemSub: "所有解析引擎、React 组件、CI 检查门禁与编辑器扩展均基于 MIT 协议开源。",
      ecoStudioDesc: "桌面客户端、CLI 与内置 27 个工具的 MCP 服务器，自动诊断数据库性能瓶颈。",
      ecoFleetDesc: "支持多地域的自托管数据库集群指挥中心、历史归档时间机器与远程 MCP 服务器。",
      ecoVscodeDesc: "支持 VS Code、Cursor 与 Windsurf 的 .sqlplan / .xdl 可视化编辑器、计划对比与 SQL CodeLens。",
      ecoDevtoolsDesc: "面向 React 与 Node.js 的应用内 SQL 悬浮面板、N+1 查询突发检测与实时 EXPLAIN 检查器。",
      ecoCiDesc: "SQL 迁移锁风险检查、执行计划回退门禁、SARIF 2.1.0 代码扫描与 PR 对比评论 Action。",
      ecoTestDesc: "适用于 Vitest、Jest 与 node:test 的执行计划断言库，验证索引命中、磁盘溢出与性能回退。",
      ecoPlansDesc: "基于 Rust + WebAssembly 的多引擎执行计划解析、对比、死锁解析与导出库。",
      ecoViewerDesc: "交互式 React 执行计划流程图、结构化对比与死锁环路组件库。",
      localHistoryTitle: "本地历史记录",
      localHistorySub: "仅私密保存在当前浏览器中。",
      localHistoryEmpty: "您解析过的执行计划、对比结果和死锁图会自动保存在此处，不会通过网络发送。",
      clear: "清空",
    },
    routes: {
      "": {
        navLabel: "全部数据库",
        title: "Culprit Explain：免费在线 SQL 执行计划可视化与死锁图分析工具",
        description:
          "在线可视化分析 PostgreSQL EXPLAIN ANALYZE、SQL Server .sqlplan、MySQL、MariaDB、YugabyteDB 与 SQLite 执行计划，支持前后执行计划结构化对比与死锁环路分析，100% 本地 WebAssembly 运行。",
        h1: "秒级看懂任何 SQL 执行计划与死锁环路",
        subtitle:
          "拖入执行计划或死锁日志，即刻生成交互式算子流程图、性能瓶颈修复建议、缓存与磁盘 I/O 分析及前后对比。100% 浏览器本地运行。",
        faqs: [
          ZH_PRIVACY_FAQ,
          {
            q: "Culprit Explain 支持哪些数据库和执行计划格式？",
            a: "支持 SQL Server (.sqlplan XML)、PostgreSQL (EXPLAIN FORMAT JSON 及 ANALYZE 文本)、MySQL 与 MariaDB (EXPLAIN FORMAT=JSON 及 EXPLAIN ANALYZE 树形文本)、YugabyteDB (DocDB 指标) 和 SQLite (EXPLAIN QUERY PLAN)，以及 SQL Server、PostgreSQL 和 InnoDB 死锁日志。",
          },
        ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "PostgreSQL EXPLAIN ANALYZE 在线可视化分析工具 | Culprit Explain",
        description:
          "免费纯前端 PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 可视化工具。快速定位慢算子、Shared Buffers 缓存命中率、临时文件磁盘溢出与并行倾斜。",
        h1: "PostgreSQL EXPLAIN ANALYZE 可视化分析器",
        subtitle: "粘贴 EXPLAIN (ANALYZE, BUFFERS) 的 JSON 或文本输出，直观查看算子耗时占比、缓存与磁盘读取、行数估算偏差及索引建议。",
        faqs: [ZH_PRIVACY_FAQ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "SQL Server 执行计划 (.sqlplan) 在线查看与分析工具 | Culprit Explain",
        description:
          "在浏览器中直接打开 SQL Server 与 Azure SQL 的 .sqlplan XML 执行计划文件。快速识别键查找 (Key Lookup)、缺失索引、内存授予溢出与并行度倾斜，零上传更安全。",
        h1: "SQL Server .sqlplan 执行计划在线查看器",
        subtitle: "拖放 SSMS 或 Azure Data Studio 导出的 .sqlplan 文件，查看实际与估算行数、逻辑读取页数、Key Lookup 瓶颈与缺失索引 SQL。",
        faqs: [ZH_PRIVACY_FAQ],
      },
      mysql: {
        navLabel: "MySQL & MariaDB",
        title: "MySQL 与 MariaDB EXPLAIN 执行计划在线可视化工具 | Culprit Explain",
        description: "在线可视化 MySQL EXPLAIN FORMAT=JSON、MySQL 8.0+ EXPLAIN ANALYZE 树形计划与 MariaDB JSON 执行计划，快速发现全表扫描与文件排序。",
        h1: "MySQL & MariaDB EXPLAIN 可视化分析工具",
        subtitle: "将复杂的 EXPLAIN FORMAT=JSON 与 EXPLAIN ANALYZE 输出转化为清晰的交互式算子图，高亮全表扫描、临时表与 filesort 瓶颈。",
        faqs: [ZH_PRIVACY_FAQ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "YugabyteDB EXPLAIN 与 DocDB 执行计划在线可视化 | Culprit Explain",
        description: "在线分析 YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) 分布式执行计划，展示 DocDB 存储读取请求、RPC 耗时与目录开销。",
        h1: "YugabyteDB EXPLAIN & DocDB 可视化工具",
        subtitle: "深入分析分布式 YSQL 执行计划，直观呈现 DocDB 读写请求次数、RPC 延迟明细与索引扫描效率。",
        faqs: [ZH_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "SQLite EXPLAIN QUERY PLAN 在线可视化工具 | Culprit Explain",
        description: "在线可视化 SQLite EXPLAIN QUERY PLAN 输出，快速识别全表扫描 (SCAN)、ORDER BY 临时 B-Tree 与覆盖索引查找。",
        h1: "SQLite EXPLAIN QUERY PLAN 可视化工具",
        subtitle: "粘贴 SQLite、LibSQL 或 Turso 的 EXPLAIN QUERY PLAN 文本，直观查看表扫描、索引搜索与临时排序树。",
        faqs: [ZH_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "计划对比",
        title: "SQL 执行计划前后对比工具 (Before vs After) | Culprit Explain",
        description: "在浏览器中结构化对比优化前后的 SQL 执行计划，精确计算加速倍数或成本变化，直观查看全表扫描到索引扫描的转换。",
        h1: "SQL 执行计划并排结构化对比",
        subtitle: "粘贴优化前 (Before) 与优化后 (After) 的执行计划，验证索引优化、SQL 改写效果或排查执行计划回退。",
        faqs: [ZH_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "死锁分析",
        title: "SQL 死锁图在线可视化分析工具 (SQL Server, Postgres, MySQL) | Culprit Explain",
        description: "在线可视化 SQL Server XML 死锁图、PostgreSQL 死锁日志与 MySQL SHOW ENGINE INNODB STATUS 输出，清晰展示锁等待环路、牺牲者会话与修复方案。",
        h1: "SQL 死锁环路图与根因分析器",
        subtitle: "拖入 SQL Server .xdl/.xml 死锁报告、PostgreSQL 日志或 InnoDB 状态输出，立即生成交互式锁等待环路图与修复建议。",
        faqs: [ZH_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "SQL Server Extended Events (.xel) 在线查看器（无需 SSMS） | Culprit Explain",
        description: "在 macOS、Linux 或 Windows 浏览器中直接打开二进制 SQL Server 与 Azure SQL Extended Events (.xel) 文件及 RingBufferTarget XML，100% 本地 WebAssembly 解析。",
        h1: "SQL Server Extended Events (.xel) 在线查看器",
        subtitle: "拖入 system_health*.xel、Azure SQL .xel 捕获文件或导出的 XML，无需安装 Windows SSMS 即可排查查询超时、错误、锁等待与死锁。",
        faqs: [ZH_PRIVACY_FAQ],
      },
    },
  },

  ja: {
    ui: {
      localWasm: "ローカル Wasm",
      loadingWasm: "Wasm 読込中",
      wasmOffline: "Wasm オフライン",
      wasmTooltip: "サーバー通信ゼロ：実行計画やデッドロックは WebAssembly によりブラウザ内でローカル解析されます。",
      tabPlan: "実行計画",
      tabCompare: "プラン比較",
      tabDeadlock: "デッドロック",
      history: "履歴",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100% クライアントサイド Rust + WebAssembly · SQL 実行計画が外部送信されることはありません",
      autoDetect: "自動判別",
      optionalTitlePlaceholder: "任意のタイトル（例：注文検索クエリ）",
      attachSql: "+ SQL を添付",
      hideSql: "SQL を隠す",
      sqlPlaceholder: "任意の SQL クエリ（実行計画にクエリ本文が含まれない場合に添付）...",
      paste: "貼り付け",
      openFile: "ファイルを開く",
      file: "ファイル",
      dropHintPlan: ".sqlplan / .json / .xml / .txt ファイルをここにドロップ",
      dropHintDeadlock: ".xdl / .xml / サーバーログの抜粋をドロップ",
      analyzePlan: "実行計画を解析",
      analyzing: "解析中...",
      comparePlans: "プランを比較",
      comparing: "比較中...",
      visualizeDeadlock: "デッドロックを可視化",
      swapAB: "A と B を入れ替え",
      beforePlaceholder: "変更前 (Before) の実行計画を貼り付けまたはドロップ...",
      afterPlaceholder: "変更後 (After) の実行計画を貼り付けまたはドロップ...",
      trySampleKicker: "ワンクリックでサンプルを試す",
      editInput: "入力に戻る",
      newAnalysis: "新規",
      redactLiterals: "リテラルをマスク",
      shareLink: "共有リンク",
      capturePlanHeading: "詳細な実行計画を取得する方法",
      captureDeadlockHeading: "デッドロックログを取得する方法",
      captureSub: "お使いの SQL クライアントで以下のコマンドを実行し、出力を上部に貼り付けるかドロップしてください。",
      copy: "コピー",
      copied: "コピー完了",
      faqHeading: "よくある質問 (FAQ)",
      upsellBadge: "無料・オープンソース · MIT",
      upsellTitle: "遅いクエリを 1 件ずつ手作業で探す必要はありません。",
      upsellBody:
        "Culprit SQL Studio は PostgreSQL、SQL Server、MySQL、MariaDB、YugabyteDB、TimescaleDB、SQLite に読み取り専用で接続し、スロークエリの特定、不足インデックスの検証、デッドロック解析を自動化します。",
      upsellPrimaryCta: "Culprit SQL Studio を見る",
      upsellSecondaryCta: "GitHub リポジトリ",
      ecosystemHeading: "Culprit SQL オープンソースエコシステム",
      ecosystemSub: "パーサー、React コンポーネント、CI ゲート、エディタ拡張はすべて MIT ライセンスで公開されています。",
      ecoStudioDesc: "デスクトップアプリ、CLI、27 種のツールを備えたコーディングエージェント向け MCP サーバー。",
      ecoFleetDesc: "マルチリージョン対応のセルフホスト型データベースフリート運用センター・履歴タイムマシン・リモート MCP サーバー。",
      ecoVscodeDesc: "VS Code・Cursor・Windsurf 向け .sqlplan / .xdl カスタムビューア、プラン比較、SQL CodeLens。",
      ecoDevtoolsDesc: "React & Node.js 向けアプリ内 SQL HUD、N+1 クエリ自動検出、ライブ EXPLAIN インスペクター。",
      ecoCiDesc: "SQL マイグレーションロック検査、実行計画退行ゲート、SARIF 2.1.0 出力、PR 差分コメント Action。",
      ecoTestDesc: "Vitest・Jest・node:test 向け実行計画マッチャー（インデックス使用、スピル、プラン退行検証）。",
      ecoPlansDesc: "Rust + WebAssembly 製のポータブルな SQL 実行計画パーサー・比較・デッドロック解析ライブラリ。",
      ecoViewerDesc: "React 向けインタラクティブ実行計画ダイアグラム・差分比較・デッドロック可視化コンポーネント。",
      localHistoryTitle: "ローカル履歴",
      localHistorySub: "このブラウザ内にのみ保存されます。",
      localHistoryEmpty: "解析した実行計画やプラン比較、デッドロックが自動的に保存されます。外部には送信されません。",
      clear: "消去",
    },
    routes: {
      "": {
        navLabel: "全エンジン",
        title: "Culprit Explain：無料のオンライン SQL 実行計画・デッドロック可視化ツール",
        description:
          "PostgreSQL EXPLAIN ANALYZE、SQL Server .sqlplan、MySQL、MariaDB、YugabyteDB、SQLite の実行計画をブラウザ内で可視化・比較・デッドロック解析。100% ローカル WebAssembly 動作で安全。",
        h1: "あらゆる SQL 実行計画とデッドロックを数秒で可視化",
        subtitle:
          "実行計画やデッドロックログをドロップするだけで、フロー図、ボトルネック改善案、キャッシュ/ディスク I/O 内訳、Before/After 比較を表示します。",
        faqs: [JA_PRIVACY_FAQ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "PostgreSQL EXPLAIN ANALYZE 可視化ビューア（無料・オンライン） | Culprit Explain",
        description:
          "PostgreSQL の EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) およびテキスト出力をブラウザ上で安全に可視化。Shared Buffers ヒット率、一時ファイルスピル、並列ワーカーの偏りを即座に特定。",
        h1: "PostgreSQL EXPLAIN ANALYZE 可視化ビューア",
        subtitle: "EXPLAIN (ANALYZE, BUFFERS) の JSON またはテキストを貼り付けて、オペレーター DAG、バッファ I/O、行数見積もり誤差、インデックス提案を確認できます。",
        faqs: [JA_PRIVACY_FAQ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "SQL Server 実行プラン (.sqlplan) オンラインビューア | Culprit Explain",
        description:
          "SQL Server / Azure SQL の .sqlplan Showplan XML ファイルをサーバー送信なしでブラウザ表示。Key Lookup、不足インデックス、メモリスピルを即座に診断。",
        h1: "SQL Server .sqlplan オンラインビューア",
        subtitle: "SSMS や Azure Data Studio の .sqlplan ファイルをドロップして、実測行数、論理読み取り、Key Lookup、不足インデックス SQL を検査します。",
        faqs: [JA_PRIVACY_FAQ],
      },
      mysql: {
        navLabel: "MySQL & MariaDB",
        title: "MySQL・MariaDB EXPLAIN 実行計画 可視化ツール | Culprit Explain",
        description: "MySQL EXPLAIN FORMAT=JSON、MySQL 8.0+ EXPLAIN ANALYZE ツリー形式、MariaDB JSON 実行計画をブラウザ内でわかりやすく図解。",
        h1: "MySQL & MariaDB EXPLAIN 可視化ビューア",
        subtitle: "読みづらい EXPLAIN FORMAT=JSON や EXPLAIN ANALYZE 出力をフロー図に変換し、フルスキャンや filesort をハイライトします。",
        faqs: [JA_PRIVACY_FAQ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "YugabyteDB EXPLAIN & DocDB 実行計画ビューア | Culprit Explain",
        description: "YugabyteDB の EXPLAIN (ANALYZE, DIST, FORMAT JSON) を可視化し、DocDB ストレージ読み取りリクエスト数や RPC レイテンシを分析。",
        h1: "YugabyteDB EXPLAIN & DocDB 可視化ビューア",
        subtitle: "分散 YSQL 実行計画の DocDB RPC 回数、ストレージ読み書き時間、インデックススキャン効率を可視化します。",
        faqs: [JA_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "SQLite EXPLAIN QUERY PLAN 可視化ツール | Culprit Explain",
        description: "SQLite の EXPLAIN QUERY PLAN 出力をオンラインで図解。フルテーブルスキャンや一時 B-Tree ソート、カバリングインデックスをローカル確認。",
        h1: "SQLite EXPLAIN QUERY PLAN 可視化ツール",
        subtitle: "SQLite・LibSQL・Turso の EXPLAIN QUERY PLAN テキストを貼り付けて、スキャンやインデックス検索を視覚的に確認できます。",
        faqs: [JA_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "プラン比較",
        title: "SQL 実行計画 差分比較ツール (Before / After) | Culprit Explain",
        description: "インデックス追加やクエリ書き換え前後の SQL 実行計画を並べて構造比較。高速化倍率や Seq Scan から Index Scan への変化を自動検出。",
        h1: "SQL 実行計画の並列構造比較 (Before vs After)",
        subtitle: "変更前と変更後の実行計画を貼り付けて、インデックス効果やプラン退行を正確に検証します。",
        faqs: [JA_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "デッドロック解析",
        title: "SQL デッドロックグラフ可視化ツール (SQL Server, Postgres, MySQL) | Culprit Explain",
        description: "SQL Server のデッドロック XML、PostgreSQL ログ、MySQL SHOW ENGINE INNODB STATUS を図解し、ロック待機サイクルと解決策を表示。",
        h1: "SQL デッドロックグラフ・原因解析ツール",
        subtitle: "SQL Server .xdl/.xml、PostgreSQL エラーログ、InnoDB ステータスをドロップして、ロック循環グラフと修正手順を確認できます。",
        faqs: [JA_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "SQL Server Extended Events (.xel) オンラインビューア（SSMS 不要） | Culprit Explain",
        description: "macOS・Linux・Windows のブラウザ上で SQL Server / Azure SQL のバイナリ Extended Events (.xel) ファイルや RingBufferTarget XML を直接開いて解析します。",
        h1: "SQL Server Extended Events (.xel) オンラインビューア",
        subtitle: "system_health*.xel や Azure SQL Blob の .xel ファイルをドロップして、SSMS なしでタイムアウト・エラー・待機スパイク・デッドロックをローカル検査できます。",
        faqs: [JA_PRIVACY_FAQ],
      },
    },
  },

  ko: {
    ui: {
      localWasm: "로컬 Wasm",
      loadingWasm: "Wasm 로딩 중",
      wasmOffline: "Wasm 오프라인",
      wasmTooltip: "무서버 아키텍처: 실행 계획과 데드락 로그는 브라우저 내 WebAssembly에서 로컬로 분석되며 외부로 전송되지 않습니다.",
      tabPlan: "실행 계획",
      tabCompare: "계획 비교",
      tabDeadlock: "데드락",
      history: "기록",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100% 클라이언트 사이드 Rust + WebAssembly · SQL 실행 계획은 절대 브라우저 밖으로 나가지 않습니다",
      autoDetect: "자동 감지",
      optionalTitlePlaceholder: "선택 제목 (예: 주문 결제 조회 쿼리)",
      attachSql: "+ SQL 첨부",
      hideSql: "SQL 숨기기",
      sqlPlaceholder: "선택 SQL 쿼리 (실행 계획에 원본 쿼리가 없을 때 첨부)...",
      paste: "붙여넣기",
      openFile: "파일 열기",
      file: "파일",
      dropHintPlan: ".sqlplan, .json, .xml, .txt 파일을 이 카드에 드롭하세요",
      dropHintDeadlock: ".xdl, .xml 또는 서버 .log 발췌본을 드롭하세요",
      analyzePlan: "실행 계획 분석",
      analyzing: "분석 중...",
      comparePlans: "실행 계획 비교",
      comparing: "비교 중...",
      visualizeDeadlock: "데드락 시각화",
      swapAB: "A와 B 바꾸기",
      beforePlaceholder: "변경 전(Before) 실행 계획을 붙여넣거나 드롭하세요...",
      afterPlaceholder: "변경 후(After) 실행 계획을 붙여넣거나 드롭하세요...",
      trySampleKicker: "클릭 한 번으로 인터랙티브 예제 체험",
      editInput: "입력 수정",
      newAnalysis: "새 분석",
      redactLiterals: "리터럴 마스킹",
      shareLink: "공유 링크",
      capturePlanHeading: "상세한 실행 계획을 추출하는 방법",
      captureDeadlockHeading: "데드락 덤프를 추출하는 방법",
      captureSub: "SQL 클라이언트에서 아래 명령을 실행한 뒤 결과를 위 편집기에 붙여넣거나 드롭하세요.",
      copy: "복사",
      copied: "복사됨",
      faqHeading: "자주 묻는 질문 (FAQ)",
      upsellBadge: "무료 오픈소스 · MIT",
      upsellTitle: "느린 쿼리를 하나씩 수동으로 찾지 마세요.",
      upsellBody:
        "Culprit SQL Studio는 PostgreSQL, SQL Server, MySQL, MariaDB, YugabyteDB, TimescaleDB, SQLite에 읽기 전용으로 연결하여 슬로우 쿼리 순위, 누락 인덱스 검증, 데드락 추적을 자동화합니다.",
      upsellPrimaryCta: "Culprit SQL Studio 살펴보기",
      upsellSecondaryCta: "GitHub 저장소",
      ecosystemHeading: "Culprit SQL 오픈소스 생태계",
      ecosystemSub: "파서, React 컴포넌트, CI 게이트, 에디터 확장 모두 MIT 라이선스 오픈소스입니다.",
      ecoStudioDesc: "데스크톱 앱, CLI 및 코딩 에이전트용 27개 도구를 제공하는 MCP 서버.",
      ecoFleetDesc: "멀티 리전 셀프 호스팅 데이터베이스 플릿 관제 센터, 아카이브 타임머신 및 원격 MCP 서버.",
      ecoVscodeDesc: "VS Code, Cursor, Windsurf용 .sqlplan / .xdl 커스텀 에디터, 플랜 비교 스튜디오 및 SQL CodeLens.",
      ecoDevtoolsDesc: "React 및 Node.js 인앱 SQL HUD, 자동 N+1 버스트 탐지기 및 실시간 EXPLAIN 인스펙터.",
      ecoCiDesc: "SQL 마이그레이션 락 린터, 실행 계획 회귀 게이트, SARIF 2.1.0 리포터 및 PR 비교 코멘트 Action.",
      ecoTestDesc: "Vitest, Jest, node:test용 실행 계획 매처 (인덱스 사용, 디스크 스필, 플랜 회귀 검증).",
      ecoPlansDesc: "Rust + WebAssembly 기반 포터블 SQL 실행 계획 파서, 비교기, 데드락 분석기.",
      ecoViewerDesc: "React용 인터랙티브 실행 계획 플로우차트, 구조적 비교 및 데드락 그래프 컴포넌트.",
      localHistoryTitle: "로컬 기록",
      localHistorySub: "현재 브라우저에만 안전하게 저장됩니다.",
      localHistoryEmpty: "분석한 실행 계획, 비교 결과, 데드락이 여기에 자동으로 저장되며 네트워크로 전송되지 않습니다.",
      clear: "비우기",
    },
    routes: {
      "": {
        navLabel: "전체 엔진",
        title: "Culprit Explain: 무료 온라인 SQL 실행 계획 시각화 및 데드락 분석기",
        description:
          "PostgreSQL EXPLAIN ANALYZE, SQL Server .sqlplan, MySQL, MariaDB, YugabyteDB, SQLite 실행 계획을 브라우저에서 로컬 WebAssembly로 시각화하고 전후 비교 및 데드락 그래프를 분석하세요.",
        h1: "모든 SQL 실행 계획과 데드락을 몇 초 만에 파악하세요",
        subtitle:
          "실행 계획이나 데드락 로그를 드롭하면 인터랙티브 다이어그램, 병목 해결 SQL, 캐시/디스크 I/O 분석, 전후 비교를 즉시 보여줍니다.",
        faqs: [KO_PRIVACY_FAQ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "PostgreSQL EXPLAIN ANALYZE 온라인 시각화 분석기 | Culprit Explain",
        description:
          "PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 및 텍스트 실행 계획을 서버 업로드 없이 분석하세요. Shared Buffers 캐시 히트율, 디스크 스필, 병렬 워커 불균형을 시각화합니다.",
        h1: "PostgreSQL EXPLAIN ANALYZE 시각화 분석기",
        subtitle: "EXPLAIN (ANALYZE, BUFFERS) 출력을 붙여넣어 연산자 플로우차트, 버퍼 캐시 대 디스크 읽기, 로우 추정 오차 및 인덱스 추천을 확인하세요.",
        faqs: [KO_PRIVACY_FAQ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "SQL Server 실행 계획 (.sqlplan) 온라인 뷰어 | Culprit Explain",
        description: "SQL Server 및 Azure SQL .sqlplan XML 파일을 브라우저에서 바로 열어 Key Lookup, 누락 인덱스, 메모리 스필을 안전하게 분석하세요.",
        h1: "SQL Server .sqlplan 온라인 실행 계획 뷰어",
        subtitle: "SSMS 또는 Azure Data Studio의 .sqlplan 파일을 드롭하여 실제 대 예상 행 수, 논리적 읽기, Key Lookup 병목을 확인하세요.",
        faqs: [KO_PRIVACY_FAQ],
      },
      mysql: {
        navLabel: "MySQL & MariaDB",
        title: "MySQL 및 MariaDB EXPLAIN 실행 계획 시각화 도구 | Culprit Explain",
        description: "MySQL EXPLAIN FORMAT=JSON, MySQL 8.0+ EXPLAIN ANALYZE 트리, MariaDB JSON 실행 계획을 온라인으로 시각화합니다.",
        h1: "MySQL & MariaDB EXPLAIN 시각화 분석기",
        subtitle: "복잡한 EXPLAIN FORMAT=JSON과 EXPLAIN ANALYZE 트리를 직관적인 플로우 다이어그램으로 변환하고 풀 스캔과 filesort를 표시합니다.",
        faqs: [KO_PRIVACY_FAQ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "YugabyteDB EXPLAIN & DocDB 실행 계획 시각화 | Culprit Explain",
        description: "YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) 실행 계획의 DocDB 스토리지 읽기 요청과 RPC 지연 시간을 분석합니다.",
        h1: "YugabyteDB EXPLAIN & DocDB 시각화 도구",
        subtitle: "분산 YSQL 실행 계획의 DocDB RPC 요청 수와 스토리지 실행 시간을 한눈에 분석하세요.",
        faqs: [KO_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "SQLite EXPLAIN QUERY PLAN 온라인 시각화 도구 | Culprit Explain",
        description: "SQLite EXPLAIN QUERY PLAN 트리를 시각화하여 전체 테이블 스캔, 임시 정렬 B-Tree, 커버링 인덱스 탐색을 확인하세요.",
        h1: "SQLite EXPLAIN QUERY PLAN 시각화 도구",
        subtitle: "SQLite, LibSQL, Turso의 EXPLAIN QUERY PLAN 출력을 붙여넣어 스캔과 인덱스 검색 경로를 확인하세요.",
        faqs: [KO_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "계획 비교",
        title: "SQL 실행 계획 전후 비교 (Before vs After) | Culprit Explain",
        description: "인덱스 추가나 쿼리 튜닝 전후의 SQL 실행 계획을 나란히 비교하여 속도 향상 배율과 연산자 변화를 검증하세요.",
        h1: "SQL 실행 계획 나란히 구조 비교",
        subtitle: "Before 실행 계획과 After 실행 계획을 붙여넣어 인덱스 튜닝 효과와 실행 계획 퇴행을 정확히 검증하세요.",
        faqs: [KO_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "데드락 뷰어",
        title: "SQL 데드락 그래프 온라인 뷰어 (SQL Server, Postgres, MySQL) | Culprit Explain",
        description: "SQL Server 데드락 XML, PostgreSQL 데드락 로그, MySQL SHOW ENGINE INNODB STATUS 덤프를 인터랙티브 락 사이클 그래프로 시각화합니다.",
        h1: "SQL 데드락 그래프 및 원인 분석기",
        subtitle: "SQL Server .xdl/.xml, PostgreSQL 로그 또는 InnoDB 상태를 드롭하여 락 대기 사이클과 해결 SQL을 확인하세요.",
        faqs: [KO_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "SQL Server Extended Events (.xel) 온라인 뷰어 (SSMS 불필요) | Culprit Explain",
        description: "macOS, Linux, Windows 브라우저에서 바이너리 SQL Server 및 Azure SQL Extended Events (.xel) 파일과 XML을 서버 업로드 없이 로컬 WebAssembly로 바로 열어 분석하세요.",
        h1: "SQL Server Extended Events (.xel) 온라인 뷰어",
        subtitle: "system_health*.xel, Azure SQL Blob .xel 캡처 또는 RingBufferTarget XML을 드롭하여 쿼리 타임아웃, 오류, 대기 스파이크 및 데드락을 SSMS 없이 확인하세요.",
        faqs: [KO_PRIVACY_FAQ],
      },
    },
  },

  ru: {
    ui: {
      localWasm: "Локальный Wasm",
      loadingWasm: "Загрузка Wasm",
      wasmOffline: "Wasm офлайн",
      wasmTooltip: "Без бэкенда: планы выполнения и взаимоблокировки разбираются локально в браузере через WebAssembly.",
      tabPlan: "План",
      tabCompare: "Сравнение",
      tabDeadlock: "Дедлоки",
      history: "История",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100% локально в браузере (Rust + WebAssembly) · Ваши SQL-планы не передаются на сервер",
      autoDetect: "Автоопределение",
      optionalTitlePlaceholder: "Название (например, Запрос заказов)",
      attachSql: "+ Добавить SQL",
      hideSql: "Скрыть SQL",
      sqlPlaceholder: "SQL-запрос (необязательно, если текст запроса отсутствует в плане)...",
      paste: "Вставить",
      openFile: "Открыть файл",
      file: "Файл",
      dropHintPlan: "Перетащите файл .sqlplan, .json, .xml или .txt в эту область",
      dropHintDeadlock: "Перетащите .xdl, .xml или фрагмент лога сервера",
      analyzePlan: "Анализировать план",
      analyzing: "Анализ...",
      comparePlans: "Сравнить планы",
      comparing: "Сравнение...",
      visualizeDeadlock: "Построить граф дедлока",
      swapAB: "Поменять A и B",
      beforePlaceholder: "Вставьте или перетащите исходный план (До)...",
      afterPlaceholder: "Вставьте или перетащите новый план (После)...",
      trySampleKicker: "Попробуйте интерактивный пример в один клик",
      editInput: "К вводу",
      newAnalysis: "Новый",
      redactLiterals: "Скрыть литералы",
      shareLink: "Поделиться",
      capturePlanHeading: "Как получить подробный план выполнения",
      captureDeadlockHeading: "Как получить дамп взаимоблокировки (deadlock)",
      captureSub: "Выполните команду ниже в вашем SQL-клиенте и вставьте результат в редактор выше.",
      copy: "Копировать",
      copied: "Скопировано",
      faqHeading: "Часто задаваемые вопросы",
      upsellBadge: "Бесплатно · Open Source · MIT",
      upsellTitle: "Хватит искать медленные запросы вручную по одному плану.",
      upsellBody:
        "Culprit SQL Studio подключается в режиме чтения к PostgreSQL, SQL Server, MySQL, MariaDB, YugabyteDB, TimescaleDB и SQLite, автоматически ранжирует тяжелые запросы, проверяет индексы и находит дедлоки.",
      upsellPrimaryCta: "Открыть Culprit SQL Studio",
      upsellSecondaryCta: "GitHub репозиторий",
      ecosystemHeading: "Открытая экосистема Culprit SQL",
      ecosystemSub: "Парсеры, React-компоненты, CI-проверки и расширения для IDE открыты под лицензией MIT.",
      ecoStudioDesc: "Десктопное приложение, CLI и MCP-сервер (27 инструментов) для диагностики БД.",
      ecoFleetDesc: "Self-hosted центр управления парком БД, машина времени по архивам ADX/ClickHouse и удаленный MCP-сервер.",
      ecoVscodeDesc: "Расширение для VS Code, Cursor и Windsurf: просмотр .sqlplan / .xdl, сравнение планов и SQL CodeLens.",
      ecoDevtoolsDesc: "Встроенная панель SQL HUD для React и Node.js, детектор N+1 запросов и инспектор EXPLAIN.",
      ecoCiDesc: "Линтер SQL-миграций, проверка регрессий планов, отчеты SARIF 2.1.0 и комментарии в PR.",
      ecoTestDesc: "Матчеры планов выполнения для Vitest, Jest и node:test (индексы, сбросы на диск, регрессии).",
      ecoPlansDesc: "Портативный Rust + WebAssembly парсер планов, диффер и анализатор дедлоков.",
      ecoViewerDesc: "React-компоненты визуализации планов выполнения, сравнения и графов дедлоков.",
      localHistoryTitle: "Локальная история",
      localHistorySub: "Хранится только в этом браузере.",
      localHistoryEmpty: "Проанализированные планы, сравнения и дедлоки сохраняются здесь автоматически и никуда не отправляются.",
      clear: "Очистить",
    },
    routes: {
      "": {
        navLabel: "Все СУБД",
        title: "Culprit Explain: бесплатный онлайн визуализатор планов SQL и дедлоков",
        description:
          "Визуализация планов выполнения PostgreSQL EXPLAIN ANALYZE, SQL Server .sqlplan, MySQL, MariaDB, YugabyteDB и SQLite, сравнение планов До/После и графы взаимоблокировок локально в WebAssembly.",
        h1: "Разберите любой план выполнения SQL или дедлок за секунды",
        subtitle:
          "Загрузите план или лог взаимоблокировки: интерактивные графы операторов, узкие места, чтение из кэша и с диска, сравнение До и После. 100% локально в браузере.",
        faqs: [RU_PRIVACY_FAQ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "Визуализатор PostgreSQL EXPLAIN ANALYZE онлайн | Culprit Explain",
        description:
          "Бесплатный клиентский визуализатор PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) и текстовых планов. Анализ медленных узлов, кэша shared buffers, сбросов на диск и параллельных воркеров.",
        h1: "Визуализатор PostgreSQL EXPLAIN ANALYZE",
        subtitle: "Вставьте JSON или текстовый вывод EXPLAIN (ANALYZE, BUFFERS) для анализа графа операторов, буферного ввода-вывода, ошибок кардинальности и рекомендаций по индексам.",
        faqs: [RU_PRIVACY_FAQ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "Просмотр планов SQL Server (.sqlplan) онлайн | Culprit Explain",
        description: "Открывайте файлы .sqlplan XML из SQL Server и Azure SQL прямо в браузере без загрузки на сервер. Поиск Key Lookup, недостающих индексов и сбросов в tempdb.",
        h1: "Онлайн просмотрщик SQL Server .sqlplan",
        subtitle: "Перетащите файл .sqlplan из SSMS или Azure Data Studio для анализа фактических строк, логических чтений, Key Lookup и SQL-рекомендаций индексов.",
        faqs: [RU_PRIVACY_FAQ],
      },
      mysql: {
        navLabel: "MySQL и MariaDB",
        title: "Визуализатор EXPLAIN для MySQL и MariaDB онлайн | Culprit Explain",
        description: "Онлайн визуализация MySQL EXPLAIN FORMAT=JSON, дерева EXPLAIN ANALYZE (MySQL 8.0+) и планов MariaDB локально в браузере.",
        h1: "Визуализатор MySQL и MariaDB EXPLAIN",
        subtitle: "Превратите громоздкий EXPLAIN FORMAT=JSON или EXPLAIN ANALYZE в наглядную схему операторов с подсветкой полных сканирований и filesort.",
        faqs: [RU_PRIVACY_FAQ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "Визуализатор планов YugabyteDB EXPLAIN и DocDB | Culprit Explain",
        description: "Анализ распределенных планов YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON), запросов чтения DocDB и задержек RPC.",
        h1: "Визуализатор YugabyteDB EXPLAIN и DocDB",
        subtitle: "Исследуйте распределенные планы YSQL: счетчики обращений к DocDB, время RPC и эффективность индексов.",
        faqs: [RU_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "Визуализатор SQLite EXPLAIN QUERY PLAN онлайн | Culprit Explain",
        description: "Онлайн визуализация дерева SQLite EXPLAIN QUERY PLAN: поиск полных сканирований таблиц, временных B-деревьев и покрывающих индексов.",
        h1: "Визуализатор SQLite EXPLAIN QUERY PLAN",
        subtitle: "Вставьте вывод EXPLAIN QUERY PLAN из SQLite, LibSQL или Turso для наглядного анализа сканирований и индексов.",
        faqs: [RU_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "Сравнение",
        title: "Сравнение планов выполнения SQL онлайн (До и После) | Culprit Explain",
        description: "Структурное сравнение двух планов выполнения SQL бок о бок: расчет ускорения, смена Seq Scan на Index Scan и проверка оптимизации запросов.",
        h1: "Структурное сравнение планов SQL (До и После)",
        subtitle: "Вставьте план До и план После, чтобы проверить эффект нового индекса, переписывания запроса или причину регрессии.",
        faqs: [RU_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "Дедлоки",
        title: "Визуализатор графов взаимоблокировок SQL (Deadlock Viewer) | Culprit Explain",
        description: "Онлайн визуализация XML-графов дедлоков SQL Server, логов PostgreSQL и SHOW ENGINE INNODB STATUS в MySQL с рекомендациями по устранению.",
        h1: "Анализатор и граф взаимоблокировок SQL (Deadlock)",
        subtitle: "Загрузите .xdl/.xml отчет SQL Server, лог PostgreSQL или статус InnoDB для построения цикла блокировок и шагов исправления.",
        faqs: [RU_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "Онлайн просмотрщик SQL Server Extended Events (.xel) без SSMS | Culprit Explain",
        description: "Открывайте бинарные файлы SQL Server и Azure SQL Extended Events (.xel) и RingBufferTarget XML прямо в браузере на macOS, Linux и Windows локально через WebAssembly.",
        h1: "Онлайн просмотрщик SQL Server Extended Events (.xel)",
        subtitle: "Перетащите бинарный файл system_health*.xel или XML-дамп Extended Events для анализа таймаутов, ошибок, ожиданий и дедлоков без установки SSMS.",
        faqs: [RU_PRIVACY_FAQ],
      },
    },
  },

  de: {
    ui: {
      localWasm: "Lokales Wasm",
      loadingWasm: "Lade Wasm",
      wasmOffline: "Wasm offline",
      wasmTooltip: "Kein Backend: Ausführungspläne und Deadlocks werden lokal per WebAssembly im Browser analysiert.",
      tabPlan: "Plan",
      tabCompare: "Vergleich",
      tabDeadlock: "Deadlock",
      history: "Verlauf",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100 % clientseitiges Rust + WebAssembly · Ihre SQL-Pläne verlassen niemals Ihren Browser",
      autoDetect: "Automatisch",
      optionalTitlePlaceholder: "Optionaler Titel (z. B. Bestellabfrage)",
      attachSql: "+ SQL anfügen",
      hideSql: "SQL ausblenden",
      sqlPlaceholder: "Optionale SQL-Abfrage...",
      paste: "Einfügen",
      openFile: "Datei öffnen",
      file: "Datei",
      dropHintPlan: ".sqlplan, .json, .xml oder .txt hier ablegen",
      dropHintDeadlock: ".xdl, .xml oder Server-Log-Auszüge ablegen",
      analyzePlan: "Plan analysieren",
      analyzing: "Analysiere...",
      comparePlans: "Pläne vergleichen",
      comparing: "Vergleiche...",
      visualizeDeadlock: "Deadlock visualisieren",
      swapAB: "A und B tauschen",
      beforePlaceholder: "Ursprünglichen Ausführungsplan (Vorher) einfügen...",
      afterPlaceholder: "Neuen Ausführungsplan (Nachher) einfügen...",
      trySampleKicker: "Interaktives Beispiel mit einem Klick testen",
      editInput: "Eingabe",
      newAnalysis: "Neu",
      redactLiterals: "Literale schwärzen",
      shareLink: "Link teilen",
      capturePlanHeading: "So erfassen Sie einen detaillierten Ausführungsplan",
      captureDeadlockHeading: "So erfassen Sie einen Deadlock-Bericht",
      captureSub: "Führen Sie den Befehl in Ihrem SQL-Client aus und fügen Sie die Ausgabe oben ein.",
      copy: "Kopieren",
      copied: "Kopiert",
      faqHeading: "Häufig gestellte Fragen",
      upsellBadge: "Kostenlos & Open Source · MIT",
      upsellTitle: "Schluss mit der manuellen Einzelsuche nach langsamen Abfragen.",
      upsellBody:
        "Culprit SQL Studio verbindet sich schreibgeschützt mit PostgreSQL, SQL Server, MySQL, MariaDB, YugabyteDB, TimescaleDB und SQLite und erkennt langsame Abfragen, fehlende Indizes und Deadlocks automatisch.",
      upsellPrimaryCta: "Culprit SQL Studio entdecken",
      upsellSecondaryCta: "GitHub Repository",
      ecosystemHeading: "Das Open-Source Culprit SQL Ökosystem",
      ecosystemSub: "Alle Parser, React-Komponenten, CI-Gates und Editor-Erweiterungen stehen unter der MIT-Lizenz.",
      ecoStudioDesc: "Desktop-App, CLI und MCP-Server mit 27 Tools für automatische Datenbankdiagnose.",
      ecoFleetDesc: "Self-Hosted Multi-Region Datenbank-Flottenzentrale, Archiv-Zeitmaschine und Remote-MCP-Server.",
      ecoVscodeDesc: "VS Code, Cursor und Windsurf Erweiterung für .sqlplan / .xdl Dateien, Plan-Diffs und SQL CodeLens.",
      ecoDevtoolsDesc: "In-App SQL-HUD für React & Node.js, automatischer N+1-Detektor und Live-EXPLAIN-Inspektor.",
      ecoCiDesc: "SQL-Migrations-Linter, Ausführungsplan-Gate, SARIF 2.1.0 Berichte und GitHub-PR-Kommentare.",
      ecoTestDesc: "Ausführungsplan-Matcher für Vitest, Jest und node:test gegen Full-Scans, Spills und Regressionen.",
      ecoPlansDesc: "Portabler Rust + WebAssembly SQL-Plan-Parser, Differ und Deadlock-Parser.",
      ecoViewerDesc: "Interaktive React-Komponenten für Ausführungspläne, Vergleiche und Deadlock-Graphen.",
      localHistoryTitle: "Lokaler Verlauf",
      localHistorySub: "Nur lokal in diesem Browser gespeichert.",
      localHistoryEmpty: "Analysierte Pläne, Vergleiche und Deadlocks erscheinen hier automatisch.",
      clear: "Leeren",
    },
    routes: {
      "": {
        navLabel: "Alle Engines",
        title: "Culprit Explain: Kostenloser Online SQL Ausführungsplan & Deadlock Visualizer",
        description:
          "Visualisieren Sie PostgreSQL EXPLAIN ANALYZE, SQL Server .sqlplan, MySQL, MariaDB, YugabyteDB und SQLite Ausführungspläne, vergleichen Sie Pläne und analysieren Sie Deadlocks lokal per WebAssembly.",
        h1: "Jeden SQL-Ausführungsplan oder Deadlock in Sekunden verstehen",
        subtitle: "Legen Sie einen Plan oder Deadlock-Dump ab für interaktive Flussdiagramme, Engpass-Analysen, Cache/Disk-I/O und Vorher/Nachher-Vergleiche.",
        faqs: [DE_PRIVACY_FAQ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "PostgreSQL EXPLAIN ANALYZE Visualizer Online | Culprit Explain",
        description: "Kostenloser clientseitiger PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) Visualizer für Buffer-I/O, Temp-Spills und Index-Tipps.",
        h1: "PostgreSQL EXPLAIN ANALYZE Visualizer",
        subtitle: "Fügen Sie EXPLAIN (ANALYZE, BUFFERS) als JSON oder Text ein, um langsame Operatoren, Shared-Buffer-Treffer und Schätzfehler zu prüfen.",
        faqs: [DE_PRIVACY_FAQ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "SQL Server Ausführungsplan (.sqlplan) Viewer Online | Culprit Explain",
        description: "SQL Server und Azure SQL .sqlplan XML-Dateien direkt im Browser öffnen, ohne Server-Upload. Key Lookups, fehlende Indizes und Spills erkennen.",
        h1: "SQL Server .sqlplan Viewer Online",
        subtitle: "Ziehen Sie eine .sqlplan-Datei aus SSMS in den Browser, um logische Lesevorgänge, Key Lookups und Index-Empfehlungen zu sehen.",
        faqs: [DE_PRIVACY_FAQ],
      },
      mysql: {
        navLabel: "MySQL & MariaDB",
        title: "MySQL & MariaDB EXPLAIN Visualizer Online | Culprit Explain",
        description: "MySQL EXPLAIN FORMAT=JSON, MySQL 8+ EXPLAIN ANALYZE und MariaDB Ausführungspläne lokal im Browser visualisieren.",
        h1: "MySQL & MariaDB EXPLAIN Visualizer",
        subtitle: "Verwandeln Sie EXPLAIN FORMAT=JSON und EXPLAIN ANALYZE in übersichtliche Diagramme inklusive Full-Scan- und Filesort-Hinweisen.",
        faqs: [DE_PRIVACY_FAQ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "YugabyteDB EXPLAIN & DocDB Plan Visualizer | Culprit Explain",
        description: "YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) Ausführungspläne mit DocDB-Storage-Requests und RPC-Metriken analysieren.",
        h1: "YugabyteDB EXPLAIN & DocDB Visualizer",
        subtitle: "Analysieren Sie verteilte YSQL-Pläne inklusive DocDB-Leseanfragen und RPC-Latenzen.",
        faqs: [DE_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "SQLite EXPLAIN QUERY PLAN Visualizer Online | Culprit Explain",
        description: "SQLite EXPLAIN QUERY PLAN Ausgaben online visualisieren und Table Scans sowie temporäre B-Trees erkennen.",
        h1: "SQLite EXPLAIN QUERY PLAN Visualizer",
        subtitle: "Fügen Sie EXPLAIN QUERY PLAN Text aus SQLite, LibSQL oder Turso ein, um Scans und Indexzugriffe zu prüfen.",
        faqs: [DE_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "Vergleich",
        title: "SQL Ausführungspläne nebeneinander vergleichen | Culprit Explain",
        description: "Vergleichen Sie Vorher- und Nachher-Ausführungspläne strukturell im Browser und messen Sie den genauen Speedup.",
        h1: "SQL-Ausführungspläne Vorher vs. Nachher vergleichen",
        subtitle: "Prüfen Sie Index-Optimierungen und Abfrage-Umschreibungen mit strukturellem Operator-Diffing.",
        faqs: [DE_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "Deadlocks",
        title: "SQL Deadlock-Graph Viewer Online (SQL Server, Postgres, MySQL) | Culprit Explain",
        description: "SQL Server Deadlock-XML, PostgreSQL-Logs und MySQL InnoDB Deadlocks als interaktiven Sperrzyklus-Graphen visualisieren.",
        h1: "SQL Deadlock-Graph & Ursachenanalyse",
        subtitle: "Laden Sie einen .xdl/.xml-Bericht, PostgreSQL-Log oder InnoDB-Status für ein interaktives Zyklusdiagramm.",
        faqs: [DE_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "SQL Server Extended Events (.xel) Viewer Online ohne SSMS | Culprit Explain",
        description: "Binäre SQL Server und Azure SQL Extended Events (.xel) Dateien sowie RingBufferTarget-XML auf macOS, Linux oder Windows direkt lokal per WebAssembly im Browser öffnen.",
        h1: "SQL Server Extended Events (.xel) Viewer Online",
        subtitle: "Ziehen Sie eine system_health*.xel-Datei oder Extended-Events-XML in den Browser, um Timeouts, Fehler, Waits und Deadlocks ohne SSMS zu prüfen.",
        faqs: [DE_PRIVACY_FAQ],
      },
    },
  },

  es: {
    ui: {
      localWasm: "Wasm local",
      loadingWasm: "Cargando Wasm",
      wasmOffline: "Wasm sin conexión",
      wasmTooltip: "Sin servidor: los planes y deadlocks se analizan localmente con WebAssembly en tu navegador.",
      tabPlan: "Plan",
      tabCompare: "Comparar",
      tabDeadlock: "Deadlock",
      history: "Historial",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100 % local en tu navegador (Rust + WebAssembly) · Tus planes SQL nunca se suben a un servidor",
      autoDetect: "Auto-detectar",
      optionalTitlePlaceholder: "Título opcional (ej. Consulta de pedidos)",
      attachSql: "+ Adjuntar SQL",
      hideSql: "Ocultar SQL",
      sqlPlaceholder: "Sentencia SQL opcional...",
      paste: "Pegar",
      openFile: "Abrir archivo",
      file: "Archivo",
      dropHintPlan: "Arrastra un archivo .sqlplan, .json, .xml o .txt aquí",
      dropHintDeadlock: "Arrastra un archivo .xdl, .xml o fragmento de log",
      analyzePlan: "Analizar plan",
      analyzing: "Analizando...",
      comparePlans: "Comparar planes",
      comparing: "Comparando...",
      visualizeDeadlock: "Visualizar deadlock",
      swapAB: "Intercambiar A y B",
      beforePlaceholder: "Pega o arrastra el plan base (Antes)...",
      afterPlaceholder: "Pega o arrastra el plan optimizado (Después)...",
      trySampleKicker: "Prueba un ejemplo interactivo en un clic",
      editInput: "Editar entrada",
      newAnalysis: "Nuevo",
      redactLiterals: "Ocultar literales",
      shareLink: "Compartir enlace",
      capturePlanHeading: "Cómo capturar un plan de ejecución detallado",
      captureDeadlockHeading: "Cómo capturar un volcado de deadlock",
      captureSub: "Ejecuta el comando en tu cliente SQL y pega o arrastra el resultado arriba.",
      copy: "Copiar",
      copied: "Copiado",
      faqHeading: "Preguntas frecuentes",
      upsellBadge: "Gratis y Open Source · MIT",
      upsellTitle: "Deja de buscar consultas lentas pegando planes uno por uno.",
      upsellBody:
        "Culprit SQL Studio se conecta en modo solo lectura a PostgreSQL, SQL Server, MySQL, MariaDB, YugabyteDB, TimescaleDB y SQLite para detectar consultas lentas, índices faltantes y deadlocks automáticamente.",
      upsellPrimaryCta: "Explorar Culprit SQL Studio",
      upsellSecondaryCta: "Repositorio en GitHub",
      ecosystemHeading: "Ecosistema Open Source Culprit SQL",
      ecosystemSub: "Todos los analizadores, componentes React, puertas CI y extensiones son código abierto bajo MIT.",
      ecoStudioDesc: "App de escritorio, CLI y servidor MCP con 27 herramientas para optimización de bases de datos.",
      ecoFleetDesc: "Centro de mando self-hosted multirregión para flotas de bases de datos, archivo histórico y servidor MCP remoto.",
      ecoVscodeDesc: "Extensión para VS Code, Cursor y Windsurf con visor .sqlplan / .xdl, comparación de planes y CodeLens.",
      ecoDevtoolsDesc: "HUD SQL flotante para React y Node.js, detector automático de ráfagas N+1 e inspector EXPLAIN.",
      ecoCiDesc: "Linter de bloqueos en migraciones SQL, control de regresiones, SARIF 2.1.0 y comentarios en PR.",
      ecoTestDesc: "Matchers de planes SQL para Vitest, Jest y node:test sobre índices, derrames a disco y regresiones.",
      ecoPlansDesc: "Parser portable en Rust + WebAssembly de planes SQL, comparador y analizador de deadlocks.",
      ecoViewerDesc: "Componentes React interactivos para diagramas de planes, comparaciones y ciclos de deadlock.",
      localHistoryTitle: "Historial local",
      localHistorySub: "Guardado de forma privada solo en este navegador.",
      localHistoryEmpty: "Los planes, comparaciones y deadlocks analizados aparecerán aquí automáticamente.",
      clear: "Borrar",
    },
    routes: {
      "": {
        navLabel: "Todos los motores",
        title: "Culprit Explain: Visualizador online gratuito de planes SQL y deadlocks",
        description:
          "Visualiza planes de ejecución de PostgreSQL EXPLAIN ANALYZE, SQL Server .sqlplan, MySQL, MariaDB, YugabyteDB y SQLite, compara planes Antes/Después y analiza deadlocks localmente en WebAssembly.",
        h1: "Entiende cualquier plan de ejecución SQL o deadlock en segundos",
        subtitle: "Arrastra un plan o reporte de deadlock para ver diagramas interactivos, cuellos de botella, lectura de caché vs disco y comparaciones lado a lado.",
        faqs: [ES_PRIVACY_FAQ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "Visualizador PostgreSQL EXPLAIN ANALYZE Online | Culprit Explain",
        description: "Visualizador gratuito del lado del cliente para PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) y texto. Analiza buffers, derrames a disco e índices.",
        h1: "Visualizador de PostgreSQL EXPLAIN ANALYZE",
        subtitle: "Pega la salida JSON o texto de EXPLAIN (ANALYZE, BUFFERS) para inspeccionar nodos lentos, uso de caché y recomendaciones SQL.",
        faqs: [ES_PRIVACY_FAQ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "Visor de planes SQL Server (.sqlplan) Online | Culprit Explain",
        description: "Abre archivos .sqlplan XML de SQL Server y Azure SQL directamente en tu navegador sin subirlos a ningún servidor.",
        h1: "Visor Online de SQL Server .sqlplan",
        subtitle: "Arrastra cualquier archivo .sqlplan de SSMS para revisar lecturas lógicas, Key Lookups e índices faltantes.",
        faqs: [ES_PRIVACY_FAQ],
      },
      mysql: {
        navLabel: "MySQL y MariaDB",
        title: "Visualizador EXPLAIN para MySQL y MariaDB Online | Culprit Explain",
        description: "Visualiza MySQL EXPLAIN FORMAT=JSON, árboles EXPLAIN ANALYZE de MySQL 8+ y planes MariaDB en tu navegador.",
        h1: "Visualizador de EXPLAIN para MySQL y MariaDB",
        subtitle: "Convierte salidas EXPLAIN FORMAT=JSON y EXPLAIN ANALYZE en diagramas claros con alertas de escaneo completo y filesort.",
        faqs: [ES_PRIVACY_FAQ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "Visualizador de planes YugabyteDB EXPLAIN y DocDB | Culprit Explain",
        description: "Inspecciona planes distribuidos YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) con métricas de peticiones DocDB y RPC.",
        h1: "Visualizador de YugabyteDB EXPLAIN y DocDB",
        subtitle: "Analiza planes YSQL distribuidos con desglose de lecturas DocDB y latencia RPC.",
        faqs: [ES_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "Visualizador SQLite EXPLAIN QUERY PLAN Online | Culprit Explain",
        description: "Visualiza árboles EXPLAIN QUERY PLAN de SQLite online para detectar escaneos completos e índices.",
        h1: "Visualizador de SQLite EXPLAIN QUERY PLAN",
        subtitle: "Pega la salida de EXPLAIN QUERY PLAN de SQLite, LibSQL o Turso para analizar accesos a tablas e índices.",
        faqs: [ES_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "Comparar",
        title: "Comparar planes de ejecución SQL lado a lado | Culprit Explain",
        description: "Compara estructuralmente planes SQL Antes y Después en tu navegador y mide la mejora exacta de velocidad.",
        h1: "Comparar planes de ejecución SQL lado a lado",
        subtitle: "Pega un plan Antes y un plan Después para verificar nuevos índices, reescrituras SQL o regresiones.",
        faqs: [ES_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "Deadlocks",
        title: "Visor de grafos de Deadlock SQL Online (SQL Server, Postgres, MySQL) | Culprit Explain",
        description: "Visualiza grafos XML de deadlocks en SQL Server, logs de PostgreSQL y SHOW ENGINE INNODB STATUS de MySQL.",
        h1: "Analizador y grafo de Deadlocks SQL",
        subtitle: "Arrastra un reporte .xdl/.xml, log de PostgreSQL o estado InnoDB para ver el ciclo de bloqueos y cómo resolverlo.",
        faqs: [ES_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "Visor Online de SQL Server Extended Events (.xel) sin SSMS | Culprit Explain",
        description: "Abre archivos binarios Extended Events (.xel) de SQL Server y Azure SQL y XML RingBufferTarget en macOS, Linux o Windows localmente en WebAssembly.",
        h1: "Visor Online de SQL Server Extended Events (.xel)",
        subtitle: "Arrastra cualquier captura binaria system_health*.xel o XML de Extended Events para inspeccionar timeouts, errores, esperas y deadlocks sin SSMS.",
        faqs: [ES_PRIVACY_FAQ],
      },
    },
  },

  fr: {
    ui: {
      localWasm: "Wasm local",
      loadingWasm: "Chargement Wasm",
      wasmOffline: "Wasm hors ligne",
      wasmTooltip: "Zéro serveur : vos plans et interblocages sont analysés localement en WebAssembly dans votre navigateur.",
      tabPlan: "Plan",
      tabCompare: "Comparer",
      tabDeadlock: "Deadlock",
      history: "Historique",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100 % côté client (Rust + WebAssembly) · Vos plans SQL ne quittent jamais votre navigateur",
      autoDetect: "Auto-détection",
      optionalTitlePlaceholder: "Titre optionnel (ex. Requête commandes)",
      attachSql: "+ Joindre SQL",
      hideSql: "Masquer SQL",
      sqlPlaceholder: "Requête SQL optionnelle...",
      paste: "Coller",
      openFile: "Ouvrir un fichier",
      file: "Fichier",
      dropHintPlan: "Déposez un fichier .sqlplan, .json, .xml ou .txt ici",
      dropHintDeadlock: "Déposez un fichier .xdl, .xml ou un extrait de log",
      analyzePlan: "Analyser le plan",
      analyzing: "Analyse...",
      comparePlans: "Comparer les plans",
      comparing: "Comparaison...",
      visualizeDeadlock: "Visualiser le deadlock",
      swapAB: "Inverser A et B",
      beforePlaceholder: "Collez ou déposez le plan initial (Avant)...",
      afterPlaceholder: "Collez ou déposez le plan modifié (Après)...",
      trySampleKicker: "Essayez un exemple interactif en un clic",
      editInput: "Modifier l'entrée",
      newAnalysis: "Nouveau",
      redactLiterals: "Masquer les littéraux",
      shareLink: "Partager le lien",
      capturePlanHeading: "Comment capturer un plan d'exécution complet",
      captureDeadlockHeading: "Comment capturer un rapport d'interblocage",
      captureSub: "Exécutez la commande ci-dessous dans votre client SQL puis collez le résultat en haut.",
      copy: "Copier",
      copied: "Copié",
      faqHeading: "Questions fréquentes",
      upsellBadge: "Gratuit & Open Source · MIT",
      upsellTitle: "Ne cherchez plus vos requêtes lentes plan par plan.",
      upsellBody:
        "Culprit SQL Studio se connecte en lecture seule à PostgreSQL, SQL Server, MySQL, MariaDB, YugabyteDB, TimescaleDB et SQLite pour classer les requêtes lentes, tester les index et analyser les interblocages.",
      upsellPrimaryCta: "Découvrir Culprit SQL Studio",
      upsellSecondaryCta: "Dépôt GitHub",
      ecosystemHeading: "L'écosystème Open Source Culprit SQL",
      ecosystemSub: "Chaque parseur, composant React, outil CI et extension IDE est open source sous licence MIT.",
      ecoStudioDesc: "Application desktop, CLI et serveur MCP (27 outils) pour le diagnostic SQL automatique.",
      ecoFleetDesc: "Centre de contrôle self-hosted multirégion pour flottes de bases de données, archive historique et serveur MCP distant.",
      ecoVscodeDesc: "Extension VS Code, Cursor et Windsurf : éditeur .sqlplan / .xdl, diff de plans et SQL CodeLens.",
      ecoDevtoolsDesc: "HUD SQL flottant pour React et Node.js, détecteur automatique de N+1 et inspecteur EXPLAIN.",
      ecoCiDesc: "Linter de migrations SQL, garde-fou de plans d'exécution, export SARIF 2.1.0 et commentaires PR.",
      ecoTestDesc: "Assertions de plans SQL pour Vitest, Jest et node:test (index, débordements disque, régressions).",
      ecoPlansDesc: "Parseur portable Rust + WebAssembly de plans SQL, comparateur et analyseur de deadlocks.",
      ecoViewerDesc: "Composants React interactifs de diagrammes de plans, diffs structurels et graphes de deadlocks.",
      localHistoryTitle: "Historique local",
      localHistorySub: "Stocké uniquement dans ce navigateur.",
      localHistoryEmpty: "Les plans, comparaisons et deadlocks analysés s'affichent automatiquement ici.",
      clear: "Effacer",
    },
    routes: {
      "": {
        navLabel: "Tous moteurs",
        title: "Culprit Explain : Visualiseur gratuit en ligne de plans d'exécution SQL et deadlocks",
        description:
          "Visualisez les plans PostgreSQL EXPLAIN ANALYZE, SQL Server .sqlplan, MySQL, MariaDB, YugabyteDB et SQLite, comparez deux plans côte à côte et analysez les deadlocks localement en WebAssembly.",
        h1: "Comprenez n'importe quel plan d'exécution SQL ou deadlock en quelques secondes",
        subtitle: "Déposez un plan ou un journal d'interblocage pour obtenir des diagrammes interactifs, les goulots d'étranglement, les lectures cache/disque et la comparaison Avant/Après.",
        faqs: [FR_PRIVACY_FAQ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "Visualiseur PostgreSQL EXPLAIN ANALYZE en ligne | Culprit Explain",
        description: "Visualiseur client gratuit pour PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) et texte : buffers partagés, débordements disque et conseils d'index.",
        h1: "Visualiseur PostgreSQL EXPLAIN ANALYZE",
        subtitle: "Collez la sortie JSON ou texte de EXPLAIN (ANALYZE, BUFFERS) pour inspecter le graphe d'opérateurs, les accès disque et les erreurs d'estimation.",
        faqs: [FR_PRIVACY_FAQ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "Visionneuse de plans SQL Server (.sqlplan) en ligne | Culprit Explain",
        description: "Ouvrez vos fichiers .sqlplan XML SQL Server et Azure SQL directement dans le navigateur sans aucun envoi serveur.",
        h1: "Visionneuse SQL Server .sqlplan en ligne",
        subtitle: "Déposez un fichier .sqlplan issu de SSMS pour analyser les lectures logiques, les Key Lookups et les index manquants.",
        faqs: [FR_PRIVACY_FAQ],
      },
      mysql: {
        navLabel: "MySQL & MariaDB",
        title: "Visualiseur EXPLAIN MySQL et MariaDB en ligne | Culprit Explain",
        description: "Visualisez MySQL EXPLAIN FORMAT=JSON, EXPLAIN ANALYZE (MySQL 8+) et les plans MariaDB localement dans votre navigateur.",
        h1: "Visualiseur MySQL & MariaDB EXPLAIN",
        subtitle: "Transformez vos sorties EXPLAIN FORMAT=JSON et EXPLAIN ANALYZE en diagrammes clairs avec détection des parcours complets et filesorts.",
        faqs: [FR_PRIVACY_FAQ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "Visualiseur YugabyteDB EXPLAIN & DocDB en ligne | Culprit Explain",
        description: "Analysez les plans distribués YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) avec requêtes DocDB et temps RPC.",
        h1: "Visualiseur YugabyteDB EXPLAIN & DocDB",
        subtitle: "Inspectez les compteurs de lecture/écriture DocDB et la latence RPC de vos plans YSQL distribués.",
        faqs: [FR_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "Visualiseur SQLite EXPLAIN QUERY PLAN en ligne | Culprit Explain",
        description: "Visualisez les arbres EXPLAIN QUERY PLAN de SQLite pour repérer les scans de table et B-trees temporaires.",
        h1: "Visualiseur SQLite EXPLAIN QUERY PLAN",
        subtitle: "Collez la sortie EXPLAIN QUERY PLAN de SQLite, LibSQL ou Turso pour examiner vos index visuellement.",
        faqs: [FR_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "Comparer",
        title: "Comparer deux plans d'exécution SQL côte à côte | Culprit Explain",
        description: "Comparez structurellement vos plans SQL Avant et Après dans le navigateur et mesurez le gain de performance réel.",
        h1: "Comparer des plans d'exécution SQL côte à côte",
        subtitle: "Collez un plan Avant et un plan Après pour valider un nouvel index ou diagnostiquer une régression.",
        faqs: [FR_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "Deadlocks",
        title: "Visualiseur de graphes de Deadlock SQL en ligne | Culprit Explain",
        description: "Visualisez les graphes XML de deadlocks SQL Server, les logs PostgreSQL et SHOW ENGINE INNODB STATUS de MySQL.",
        h1: "Analyseur et graphe d'interblocages SQL (Deadlock)",
        subtitle: "Déposez un rapport .xdl/.xml, un log PostgreSQL ou un statut InnoDB pour visualiser le cycle de verrous et les correctifs.",
        faqs: [FR_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "Visionneuse SQL Server Extended Events (.xel) en ligne sans SSMS | Culprit Explain",
        description: "Ouvrez vos fichiers binaires Extended Events (.xel) SQL Server et Azure SQL ainsi que le XML RingBufferTarget sur macOS, Linux ou Windows localement en WebAssembly.",
        h1: "Visionneuse SQL Server Extended Events (.xel) en ligne",
        subtitle: "Déposez un fichier system_health*.xel ou XML Extended Events pour inspecter les timeouts, erreurs, attentes et deadlocks sans Windows SSMS.",
        faqs: [FR_PRIVACY_FAQ],
      },
    },
  },

  pt: {
    ui: {
      localWasm: "Wasm local",
      loadingWasm: "Carregando Wasm",
      wasmOffline: "Wasm offline",
      wasmTooltip: "Zero backend: planos e deadlocks são analisados localmente via WebAssembly no seu navegador.",
      tabPlan: "Plano",
      tabCompare: "Comparar",
      tabDeadlock: "Deadlock",
      history: "Histórico",
      sqlStudio: "SQL Studio",
      githubRepo: "GitHub",
      trustBanner: "100% local no navegador (Rust + WebAssembly) · Seus planos SQL nunca saem do seu dispositivo",
      autoDetect: "Auto-detectar",
      optionalTitlePlaceholder: "Título opcional (ex.: Consulta de pedidos)",
      attachSql: "+ Anexar SQL",
      hideSql: "Ocultar SQL",
      sqlPlaceholder: "Consulta SQL opcional...",
      paste: "Colar",
      openFile: "Abrir arquivo",
      file: "Arquivo",
      dropHintPlan: "Solte um arquivo .sqlplan, .json, .xml ou .txt aqui",
      dropHintDeadlock: "Solte um arquivo .xdl, .xml ou trecho de log",
      analyzePlan: "Analisar plano",
      analyzing: "Analisando...",
      comparePlans: "Comparar planos",
      comparing: "Comparando...",
      visualizeDeadlock: "Visualizar deadlock",
      swapAB: "Inverter A e B",
      beforePlaceholder: "Cole ou solte o plano original (Antes)...",
      afterPlaceholder: "Cole ou solte o novo plano (Depois)...",
      trySampleKicker: "Teste um exemplo interativo com um clique",
      editInput: "Editar entrada",
      newAnalysis: "Novo",
      redactLiterals: "Ocultar literais",
      shareLink: "Compartilhar link",
      capturePlanHeading: "Como capturar um plano de execução completo",
      captureDeadlockHeading: "Como capturar um relatório de deadlock",
      captureSub: "Execute o comando abaixo no seu cliente SQL e cole ou solte o resultado acima.",
      copy: "Copiar",
      copied: "Copiado",
      faqHeading: "Perguntas frequentes",
      upsellBadge: "Gratuito e Open Source · MIT",
      upsellTitle: "Pare de caçar consultas lentas analisando um plano por vez.",
      upsellBody:
        "O Culprit SQL Studio conecta-se em modo somente leitura ao PostgreSQL, SQL Server, MySQL, MariaDB, YugabyteDB, TimescaleDB e SQLite para classificar queries lentas, sugerir índices e capturar deadlocks automaticamente.",
      upsellPrimaryCta: "Conhecer o Culprit SQL Studio",
      upsellSecondaryCta: "Repositório GitHub",
      ecosystemHeading: "Ecossistema Open Source Culprit SQL",
      ecosystemSub: "Todos os parsers, componentes React, gates de CI e extensões IDE têm código aberto sob MIT.",
      ecoStudioDesc: "App desktop, CLI e servidor MCP com 27 ferramentas para diagnóstico automático de bancos SQL.",
      ecoFleetDesc: "Central self-hosted multirregião para frotas de bancos de dados, máquina do tempo de arquivos e servidor MCP remoto.",
      ecoVscodeDesc: "Extensão para VS Code, Cursor e Windsurf com visualizador .sqlplan / .xdl, diff de planos e CodeLens.",
      ecoDevtoolsDesc: "HUD SQL flutuante para React e Node.js, detector automático de N+1 e inspetor EXPLAIN ao vivo.",
      ecoCiDesc: "Linter de bloqueios em migrações SQL, gate de regressão de planos, SARIF 2.1.0 e comentários em PR.",
      ecoTestDesc: "Matchers de planos SQL para Vitest, Jest e node:test contra table scans, spills e regressões.",
      ecoPlansDesc: "Parser portável em Rust + WebAssembly para planos SQL, comparação e deadlocks.",
      ecoViewerDesc: "Componentes React interativos para diagramas de planos, diffs estruturais e grafos de deadlock.",
      localHistoryTitle: "Histórico local",
      localHistorySub: "Armazenado apenas neste navegador.",
      localHistoryEmpty: "Os planos, comparações e deadlocks analisados aparecem aqui automaticamente.",
      clear: "Limpar",
    },
    routes: {
      "": {
        navLabel: "Todos os bancos",
        title: "Culprit Explain: Visualizador online gratuito de planos de execução SQL e deadlocks",
        description:
          "Visualize planos de execução do PostgreSQL EXPLAIN ANALYZE, SQL Server .sqlplan, MySQL, MariaDB, YugabyteDB e SQLite, compare planos Antes/Depois e analise deadlocks localmente em WebAssembly.",
        h1: "Entenda qualquer plano de execução SQL ou deadlock em segundos",
        subtitle: "Solte um plano ou dump de deadlock para ver diagramas interativos, gargalos, I/O de cache vs disco e comparação lado a lado.",
        faqs: [PT_PRIVACY_FAQ],
      },
      postgres: {
        navLabel: "PostgreSQL",
        title: "Visualizador PostgreSQL EXPLAIN ANALYZE Online | Culprit Explain",
        description: "Visualizador gratuito no navegador para PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) e texto: cache shared buffers, temp spills e índices.",
        h1: "Visualizador PostgreSQL EXPLAIN ANALYZE",
        subtitle: "Cole o JSON ou texto do EXPLAIN (ANALYZE, BUFFERS) para inspecionar operadores lentos, leituras de disco e recomendações de índice.",
        faqs: [PT_PRIVACY_FAQ],
      },
      "sql-server": {
        navLabel: "SQL Server",
        title: "Visualizador de planos SQL Server (.sqlplan) Online | Culprit Explain",
        description: "Abra arquivos .sqlplan XML do SQL Server e Azure SQL direto no navegador sem upload para servidores. Identifique Key Lookups e índices ausentes.",
        h1: "Visualizador Online de SQL Server .sqlplan",
        subtitle: "Solte um arquivo .sqlplan do SSMS para analisar leituras lógicas, Key Lookups, spills e sugestões de índice.",
        faqs: [PT_PRIVACY_FAQ],
      },
      mysql: {
        navLabel: "MySQL e MariaDB",
        title: "Visualizador EXPLAIN para MySQL e MariaDB Online | Culprit Explain",
        description: "Visualize MySQL EXPLAIN FORMAT=JSON, árvores EXPLAIN ANALYZE do MySQL 8+ e planos do MariaDB localmente no navegador.",
        h1: "Visualizador MySQL & MariaDB EXPLAIN",
        subtitle: "Transforme saídas EXPLAIN FORMAT=JSON e EXPLAIN ANALYZE em diagramas claros com alertas de table scan e filesort.",
        faqs: [PT_PRIVACY_FAQ],
      },
      yugabytedb: {
        navLabel: "YugabyteDB",
        title: "Visualizador de planos YugabyteDB EXPLAIN e DocDB | Culprit Explain",
        description: "Inspecione planos distribuídos YugabyteDB EXPLAIN (ANALYZE, DIST, FORMAT JSON) com métricas DocDB e latência RPC.",
        h1: "Visualizador YugabyteDB EXPLAIN & DocDB",
        subtitle: "Analise planos YSQL distribuídos com contadores de leitura DocDB e tempo de execução RPC.",
        faqs: [PT_PRIVACY_FAQ],
      },
      sqlite: {
        navLabel: "SQLite",
        title: "Visualizador SQLite EXPLAIN QUERY PLAN Online | Culprit Explain",
        description: "Visualize árvores EXPLAIN QUERY PLAN do SQLite online para identificar table scans e B-trees temporárias.",
        h1: "Visualizador SQLite EXPLAIN QUERY PLAN",
        subtitle: "Cole a saída EXPLAIN QUERY PLAN do SQLite, LibSQL ou Turso para inspecionar scans e índices.",
        faqs: [PT_PRIVACY_FAQ],
      },
      compare: {
        navLabel: "Comparar",
        title: "Comparar planos de execução SQL lado a lado | Culprit Explain",
        description: "Compare estruturalmente planos SQL Antes e Depois no navegador e meça o ganho exato de velocidade.",
        h1: "Comparar planos de execução SQL lado a lado",
        subtitle: "Cole o plano Antes e o plano Depois para validar novos índices, reescritas de query ou regressões.",
        faqs: [PT_PRIVACY_FAQ],
      },
      deadlock: {
        navLabel: "Deadlocks",
        title: "Visualizador de grafos de Deadlock SQL Online | Culprit Explain",
        description: "Visualize grafos XML de deadlock do SQL Server, logs do PostgreSQL e SHOW ENGINE INNODB STATUS do MySQL.",
        h1: "Analisador e grafo de Deadlocks SQL",
        subtitle: "Solte um relatório .xdl/.xml, log do PostgreSQL ou status do InnoDB para ver o ciclo de locks e como corrigir.",
        faqs: [PT_PRIVACY_FAQ],
      },
      "extended-events": {
        navLabel: "Extended Events (.xel)",
        title: "Visualizador SQL Server Extended Events (.xel) Online sem SSMS | Culprit Explain",
        description: "Abra arquivos binários Extended Events (.xel) do SQL Server e Azure SQL e XML RingBufferTarget no macOS, Linux ou Windows localmente via WebAssembly.",
        h1: "Visualizador SQL Server Extended Events (.xel) Online",
        subtitle: "Solte qualquer arquivo system_health*.xel ou XML do Extended Events para inspecionar timeouts, erros, waits e deadlocks sem precisar do SSMS.",
        faqs: [PT_PRIVACY_FAQ],
      },
    },
  },
};

const LOCALE_SET = new Set<string>(LOCALES.map((l) => l.code));

export function parsePathnameLocaleAndSlug(
  pathname: string,
  basePath = "/",
): { locale: LocaleCode; slug: RouteSlug } {
  const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  let rel = pathname;
  if (cleanBase && rel.startsWith(cleanBase)) {
    rel = rel.slice(cleanBase.length);
  }
  const parts = rel.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  let locale: LocaleCode = "en";
  let idx = 0;
  if (parts[0] && LOCALE_SET.has(parts[0]) && parts[0] !== "en") {
    locale = parts[0] as LocaleCode;
    idx = 1;
  }
  const candidate = parts[idx] ?? "";
  const allowed: RouteSlug[] = [
    "",
    "postgres",
    "sql-server",
    "mysql",
    "yugabytedb",
    "sqlite",
    "compare",
    "deadlock",
    "extended-events",
  ];
  const slug: RouteSlug = allowed.includes(candidate as RouteSlug) ? (candidate as RouteSlug) : "";
  return { locale, slug };
}

export function buildLocalizedPath(basePath: string, locale: LocaleCode, slug: RouteSlug): string {
  const cleanBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const langSegment = locale === "en" ? "" : `${locale}/`;
  const slugSegment = slug ? `${slug}/` : "";
  return `${cleanBase}${langSegment}${slugSegment}`;
}

export function slugModeAndEngine(slug: RouteSlug): { mode: StudioMode; engineFilter: EngineFilter; ogImage: string } {
  switch (slug) {
    case "postgres":
      return { mode: "plan", engineFilter: "postgres", ogImage: "og/postgres.png" };
    case "sql-server":
      return { mode: "plan", engineFilter: "mssql", ogImage: "og/sql-server.png" };
    case "mysql":
      return { mode: "plan", engineFilter: "mysql", ogImage: "og/mysql.png" };
    case "yugabytedb":
      return { mode: "plan", engineFilter: "yugabyte", ogImage: "og/yugabytedb.png" };
    case "sqlite":
      return { mode: "plan", engineFilter: "sqlite", ogImage: "og/sqlite.png" };
    case "compare":
      return { mode: "compare", engineFilter: "auto", ogImage: "og/compare.png" };
    case "deadlock":
      return { mode: "deadlock", engineFilter: "auto", ogImage: "og/deadlock.png" };
    case "extended-events":
      return { mode: "deadlock", engineFilter: "mssql", ogImage: "og/extended-events.png" };
    default:
      return { mode: "plan", engineFilter: "auto", ogImage: "og/home.png" };
  }
}
