import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const container = document.getElementById("root")!;
const basePath = import.meta.env.BASE_URL || "/";
const app = (
  <StrictMode>
    <App initialPathname={window.location.pathname} basePath={basePath} />
  </StrictMode>
);

if (container.hasChildNodes() && container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
