import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import {
  buildLocalizedPath,
  BUNDLES,
  LOCALES,
  type LocaleCode,
  type LocaleSpec,
  type RouteSlug,
  slugModeAndEngine,
} from "./i18n";
import { ROUTES } from "./routes";

export { buildLocalizedPath, BUNDLES, LOCALES, ROUTES, slugModeAndEngine, type LocaleCode, type LocaleSpec, type RouteSlug };

export function renderRouteHtml(pathname: string, basePath: string): string {
  return renderToString(
    <StrictMode>
      <App initialPathname={pathname} basePath={basePath} />
    </StrictMode>,
  );
}
