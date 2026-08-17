import { markInstalled, wasInstalled, INSTALL_DONE } from "./store.js?v=7";

/** Serve .mobileconfig with the MIME type iOS expects (static hosts often use octet-stream). */
export async function installProfile(url, filename) {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) {
    throw new Error(`Could not load profile (${resp.status})`);
  }
  const name =
    filename ||
    url
      .split("/")
      .pop()
      .replace(/\?.*$/, "") ||
    "OpenHat.mobileconfig";
  const blob = new Blob([await resp.arrayBuffer()], {
    type: "application/x-apple-aspen-config",
  });
  const blobUrl = URL.createObjectURL(blob);
  window.location.href = blobUrl;
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  return name;
}

export function applyInstallLabel(button, url) {
  if (wasInstalled(url)) {
    button.textContent = INSTALL_DONE;
    button.classList.add("started");
  }
}

export function wireInstallButton(button, url, filename) {
  applyInstallLabel(button, url);
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    const label = button.textContent;
    button.disabled = true;
    button.textContent = "Loading…";
    try {
      markInstalled(url);
      button.textContent = INSTALL_DONE;
      button.classList.add("started");
      await installProfile(url, filename);
    } catch (err) {
      button.disabled = false;
      button.textContent = label;
      window.alert(err.message || "Install failed. Try again in Safari.");
    }
  });
}
