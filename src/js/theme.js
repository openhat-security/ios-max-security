import { getColor, setColor, getStyle, setStyle } from "./store.js";

const OVERLAY = {
  primer: "theme-primer.css",
  paper: "theme-paper.css",
  terminal: "theme-terminal.css",
};

function cssDir() {
  const base = document.getElementById("theme-base");
  if (!base) return "css/";
  return base.href.replace(/app\.css[^/]*$/, "");
}

export function applyTheme() {
  const color = getColor();
  const style = getStyle();
  document.documentElement.dataset.color = color;
  document.documentElement.dataset.style = style;
  const overlay = document.getElementById("theme-overlay");
  if (overlay) {
    if (OVERLAY[style]) {
      overlay.href = cssDir() + OVERLAY[style] + "?v=5";
      overlay.disabled = false;
    } else {
      overlay.removeAttribute("href");
      overlay.disabled = true;
    }
  }
  document.querySelectorAll("[data-color-set]").forEach((btn) => {
    btn.classList.toggle("on", btn.getAttribute("data-color-set") === color);
  });
  const select = document.getElementById("style-select");
  if (select) select.value = style;
}

export function wireThemeControls() {
  applyTheme();
  document.querySelectorAll("[data-color-set]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setColor(btn.getAttribute("data-color-set"));
      applyTheme();
    });
  });
  const select = document.getElementById("style-select");
  if (select) {
    select.addEventListener("change", () => {
      setStyle(select.value);
      applyTheme();
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
