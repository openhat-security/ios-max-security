import { markInstalled } from "./store.js?v=8";
import { installProfile } from "./profile-install.js";

function dnsValue(root, name) {
  const picked = root.querySelector(`input[name="${name}"]:checked`);
  return picked && picked.value === "Quad9" ? "Quad9" : "Mullvad";
}

function level1Path(dns) {
  return `profiles/OpenHat-Level-1-${dns}.mobileconfig`;
}

function level2Path(dns, pin, safari) {
  if (pin && safari) return `profiles/OpenHat-Level-2.21-${dns}.mobileconfig`;
  if (pin) return `profiles/OpenHat-Level-2.11-${dns}.mobileconfig`;
  if (safari) return `profiles/OpenHat-Level-2.12-${dns}.mobileconfig`;
  return "";
}

function setLinks(root, path) {
  const install = root.querySelector("[data-pick-install]");
  const view = root.querySelector("[data-pick-view]");
  if (install) {
    install.href = path || "#";
    install.setAttribute("data-install", path || "");
    install.setAttribute("aria-disabled", path ? "false" : "true");
    install.classList.toggle("is-disabled", !path);
  }
  if (view) {
    view.href = path ? `view.html?p=${path}` : "#";
    view.setAttribute("aria-disabled", path ? "false" : "true");
    view.classList.toggle("is-disabled", !path);
  }
}

function syncLevel1(card) {
  setLinks(card, level1Path(dnsValue(card, "l1-dns")));
}

function syncLevel2(card) {
  const pin = Boolean(card.querySelector('input[name="l2-pin"]')?.checked);
  const safari = Boolean(card.querySelector('input[name="l2-safari"]')?.checked);
  const hint = card.querySelector("#l2-hint");
  if (hint) hint.hidden = pin || safari;
  setLinks(card, level2Path(dnsValue(card, "l2-dns"), pin, safari));
}

function closeAll(list, except) {
  list.querySelectorAll(".level").forEach((card) => {
    if (card === except) return;
    card.classList.remove("is-open");
    const btn = card.querySelector(".level-start:not(.static)");
    const panel = card.querySelector(".level-panel");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (panel) panel.hidden = true;
  });
}

function extrasPath(pin, safari) {
  if (pin && safari) return "profiles/OpenHat-Extras-Both.mobileconfig";
  if (pin) return "profiles/OpenHat-Extras-1.1.mobileconfig";
  if (safari) return "profiles/OpenHat-Extras-1.2.mobileconfig";
  return "";
}

function extrasPicked(root) {
  return {
    pin: Boolean(root.querySelector('[name="ex-pin"]')?.checked),
    safari: Boolean(root.querySelector('[name="ex-safari"]')?.checked),
  };
}

function syncExtras(root) {
  const { pin, safari } = extrasPicked(root);
  const path = extrasPath(pin, safari);
  const install = root.querySelector("#extras-install");
  const view = root.querySelector("#extras-view");
  const detail = root.querySelector("#extras-detail");
  if (install) {
    install.href = path || "#";
    install.setAttribute("data-install", path);
    install.setAttribute("aria-disabled", path ? "false" : "true");
    install.classList.toggle("is-disabled", !path);
  }
  if (view) view.disabled = !path;
  root.querySelectorAll("[data-ex-detail]").forEach((block) => {
    const on = (block.getAttribute("data-ex-detail") === "pin" && pin) ||
      (block.getAttribute("data-ex-detail") === "safari" && safari);
    block.hidden = !on;
  });
  if (detail && detail.hidden === false && !path) detail.hidden = true;
}

function wireExtras(canInstall) {
  const root = document.getElementById("extras");
  if (!root) return;
  const view = root.querySelector("#extras-view");
  const detail = root.querySelector("#extras-detail");
  const install = root.querySelector("#extras-install");
  syncExtras(root);
  root.addEventListener("change", () => syncExtras(root));
  if (view && detail) {
    view.addEventListener("click", () => {
      if (view.disabled) return;
      const open = detail.hidden;
      detail.hidden = !open;
      view.setAttribute("aria-expanded", String(open));
      view.textContent = open ? "Hide Profile" : "View Profile";
    });
  }
  if (!install || !canInstall) return;
  install.addEventListener("click", async (event) => {
    event.preventDefault();
    const path = extrasPath(extrasPicked(root).pin, extrasPicked(root).safari);
    if (!path) return;
    const label = install.textContent;
    install.textContent = "Loading…";
    try {
      markInstalled(path);
      await installProfile(path);
    } catch (err) {
      install.textContent = label;
      window.alert(err.message || "Install failed. Try again in Safari.");
    }
  });
}

export function wireLevelPicker(canInstall = true) {
  const list = document.querySelector(".level-list");
  if (list) {
    list.querySelectorAll(".level-start:not(.static)").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".level");
        const panel = card.querySelector(".level-panel");
        const open = panel.hidden;
        closeAll(list, open ? card : null);
        panel.hidden = !open;
        card.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  const l1 = document.getElementById("level-1");
  const l2 = document.getElementById("level-2");
  if (l1) {
    syncLevel1(l1);
    l1.addEventListener("change", () => syncLevel1(l1));
  }
  if (l2) {
    syncLevel2(l2);
    l2.addEventListener("change", () => syncLevel2(l2));
  }
  wireExtras(canInstall);
}
