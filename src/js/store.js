const KEY = "openhat-ios-ui-v1";

const STYLES = ["app", "blackhat", "primer", "paper", "terminal"];

function read() {
  try {
    return Object.assign(
      { installs: {}, color: "light", style: "app" },
      JSON.parse(localStorage.getItem(KEY) || "{}")
    );
  } catch (e) {
    return { installs: {}, color: "light", style: "app" };
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
  return read().color === "dark" ? "dark" : "light";
}

export function setColor(color) {
  const data = read();
  data.color = color === "dark" ? "dark" : "light";
  write(data);
}

export function getStyle() {
  const s = read().style;
  return STYLES.includes(s) ? s : "app";
}

export function setStyle(style) {
  const data = read();
  data.style = STYLES.includes(style) ? style : "app";
  write(data);
}

export const INSTALL_DONE = "Finish in Settings";
