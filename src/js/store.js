const KEY = "openhat-ios-ui-v1";

function read() {
  try {
    return Object.assign(
      { installs: {}, color: "system", style: "app" },
      JSON.parse(localStorage.getItem(KEY) || "{}")
    );
  } catch (e) {
    return { installs: {}, color: "system", style: "app" };
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function markInstalled(url) {
  const data = read();
  data.installs[url] = Date.now();
  write(data);
}

export function wasInstalled(url) {
  return Boolean(read().installs[url]);
}

export function getColor() {
  const c = read().color;
  return c === "light" || c === "dark" ? c : "system";
}

export function setColor(color) {
  const data = read();
  data.color = color === "light" || color === "dark" ? color : "system";
  write(data);
}

export function getStyle() {
  const s = read().style;
  return ["app", "primer", "paper", "terminal"].includes(s) ? s : "app";
}

export function setStyle(style) {
  const data = read();
  data.style = ["app", "primer", "paper", "terminal"].includes(style) ? style : "app";
  write(data);
}

export const INSTALL_DONE = "Finish in Settings";
