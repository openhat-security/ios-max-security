import { getColor, setColor, getStyle, setStyle } from "./store.js?v=9";

const OVERLAY = {
  blackhat: "theme-blackhat.css",
  paper: "theme-paper.css",
  terminal: "theme-terminal.css",
};

function cssDir() {
  const base = document.getElementById("theme-base");
  if (!base) return "css/";
  return base.href.replace(/app\.css[^/]*$/, "");
}

export function applyTheme(overrides = {}) {
  if (overrides.color) setColor(overrides.color);
  if (overrides.style) setStyle(overrides.style);
  const color = overrides.color || getColor();
  const style = overrides.style || getStyle();
  document.documentElement.dataset.color = color;
  document.documentElement.dataset.style = style;
  const overlay = document.getElementById("theme-overlay");
  if (overlay) {
    if (OVERLAY[style]) {
      overlay.href = cssDir() + OVERLAY[style] + "?v=8";
      overlay.disabled = false;
    } else {
      overlay.removeAttribute("href");
      overlay.disabled = true;
    }
  }
  const toggle = document.getElementById("mode-toggle");
  if (toggle) {
    const dark = color === "dark";
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    toggle.setAttribute("aria-pressed", String(dark));
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (bg) meta.content = bg;
  }
  const select = document.getElementById("style-select");
  if (select && !overrides.style) select.value = style;
}

export function wireThemeControls() {
  applyTheme();
  const toggle = document.getElementById("mode-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      applyTheme({ color: getColor() === "dark" ? "light" : "dark" });
    });
  }
  const select = document.getElementById("style-select");
  if (select) {
    select.addEventListener("change", () => {
      applyTheme({ style: select.value });
    });
  }
}

export const CANONICAL_HOST = "openhat-security.github.io";
export const CANONICAL_PATH = "/ios-max-security";
export const PAGES = "https://openhat-security.github.io/ios-max-security/";
export const REPO = "https://github.com/openhat-security/ios-max-security";

export function hostStatus() {
  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return "local";
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return "local";
  const path = location.pathname.replace(/\/index\.html$/, "/");
  if (host === CANONICAL_HOST && path.startsWith(CANONICAL_PATH)) return "ok";
  return "phish";
}

export function applyHostGuard() {
  const status = hostStatus();
  if (status === "local") document.body.classList.add("host-local");
  if (status !== "phish") return status;
  document.body.classList.add("host-phish");
  document.querySelectorAll('a[href$=".mobileconfig"], a[href*=".mobileconfig"], a[href*="view.html"]').forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
    a.setAttribute("aria-disabled", "true");
  });
  if (!document.getElementById("host-banner") && !document.querySelector(".host-phish-banner")) {
    const banner = document.createElement("div");
    banner.className = "note danger host-phish-banner";
    banner.innerHTML =
      "<strong>This is not the official host.</strong> You are not on openhat-security.github.io. Treat this as a phishing attack. Do not tap Install or any profile link.";
    const main = document.querySelector("main");
    if (main) main.prepend(banner);
    else document.body.prepend(banner);
  }
  return status;
}
