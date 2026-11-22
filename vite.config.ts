import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function normalizeBase(raw: string | undefined): string {
  if (!raw || raw === "/") return "/";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export default defineConfig({
  base: normalizeBase(process.env.SITE_BASE_PATH),
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@culpritsql/plans"],
  },
  ssr: {
    noExternal: ["@culpritsql/plan-viewer"],
  },
  build: {
    target: "es2022",
    sourcemap: false,
  },
});
