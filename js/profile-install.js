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
  // iOS Safari needs the aspen-config MIME; navigation to the blob opens the install sheet.
  window.location.href = blobUrl;
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  return name;
}

export function wireInstallButton(button, url, filename) {
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    const label = button.textContent;
    button.disabled = true;
    button.textContent = "Loading…";
    try {
      await installProfile(url, filename);
      button.textContent = "Profile ready — tap Allow in Settings";
    } catch (err) {
      button.disabled = false;
      button.textContent = label;
      window.alert(err.message || "Install failed. Try again in Safari.");
    }
  });
}
