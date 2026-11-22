import type {
  CompareContext,
  CoreError,
  Deadlock,
  Engine,
  ExportFile,
  ExportFormat,
  ExportOptions,
  Plan,
  PlanDiff,
} from "@culpritsql/plans";

export type { CompareContext, CoreError, Deadlock, Engine, ExportFile, ExportFormat, ExportOptions, Plan, PlanDiff };

type PlansModule = typeof import("@culpritsql/plans");

let loadedModule: PlansModule | null = null;
let initPromise: Promise<PlansModule> | null = null;

export async function ensurePlansWasm(): Promise<PlansModule> {
  if (loadedModule) return loadedModule;
  if (!initPromise) {
    initPromise = (async () => {
      const mod = await import("@culpritsql/plans");
      await mod.init();
      loadedModule = mod;
      return mod;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export function extractCoreError(err: unknown): CoreError | null {
  if (err && typeof err === "object" && "error" in err) {
    const inner = (err as { error?: CoreError }).error;
    if (inner && typeof inner.message === "string") {
      return inner;
    }
  }
  return null;
}
