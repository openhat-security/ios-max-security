import { wireInstallButton } from "./profile-install.js";
import { wasViewed, VIEW_DONE } from "./store.js";
import { githubUrlBox } from "./copy.js";
import { wireThemeControls, hostStatus, PAGES } from "./theme.js";

wireThemeControls();

const status = hostStatus();
if (status === "phish") document.body.classList.add("host-phish");
if (status === "local") document.body.classList.add("host-local");

function profileCard(profile, sectionDanger) {
  const danger = profile.danger || sectionDanger;
  const card = document.createElement("article");
  card.className = "profile-card" + (danger ? " danger" : "") + (profile.recommended ? " recommended" : "");

  const head = document.createElement("div");
  head.className = "profile-head";
  const title = document.createElement("h3");
  title.textContent = profile.title;
  head.append(title);
  if (profile.subtitle) {
    const sub = document.createElement("span");
    sub.className = "profile-sub";
    sub.textContent = profile.subtitle;
    head.append(sub);
  }
  if (profile.recommended) {
    const rec = document.createElement("span");
    rec.className = "tag ok";
    rec.textContent = "Recommended";
    head.append(rec);
  }
  card.append(head);

  const desc = document.createElement("p");
  desc.className = "profile-desc";
  desc.textContent = profile.description;
  card.append(desc);

  const actions = document.createElement("div");
  actions.className = "profile-actions";

  if (profile.file) {
    const install = document.createElement("a");
    install.href = profile.file;
    install.setAttribute("role", "button");
    install.className = danger ? "danger" : "";
    install.textContent = "Install";
    if (status !== "phish") wireInstallButton(install, profile.file);
    else {
      install.addEventListener("click", (e) => e.preventDefault());
      install.setAttribute("aria-disabled", "true");
    }

    const view = document.createElement("a");
    view.href = status === "phish" ? "#" : "view.html?p=" + encodeURIComponent(profile.file);
    view.setAttribute("role", "button");
    view.className = "secondary";
    view.textContent = wasViewed(profile.file) ? VIEW_DONE : "View profile";
    if (wasViewed(profile.file)) view.classList.add("started");
    if (status === "phish") {
      view.addEventListener("click", (e) => e.preventDefault());
      view.setAttribute("aria-disabled", "true");
    }

    actions.append(install, view);
  }

  if (profile.guide) {
    const guide = document.createElement("a");
    guide.href = status === "phish" ? "#" : profile.guide;
    guide.className = "outline guide-link";
    guide.textContent = profile.guideLabel || "Read instructions first";
    if (status === "phish") {
      guide.addEventListener("click", (e) => e.preventDefault());
      guide.setAttribute("aria-disabled", "true");
    }
    actions.append(guide);
  }

  card.append(actions);
  return card;
}

function render(data) {
  document.title = data.title;
  document.getElementById("title").textContent = data.title;
  const lead = document.getElementById("lead");
  if (lead) lead.remove();

  const box = document.getElementById("repo-url-box");
  if (box && !box.dataset.ready) {
    box.append(githubUrlBox(PAGES));
    box.dataset.ready = "1";
  }

  const banner = document.getElementById("host-banner");
  if (banner) {
    if (status === "phish") {
      banner.hidden = false;
      banner.innerHTML =
        "<strong>This is not the official host.</strong> You are not on openhat-security.github.io. Treat this as a phishing attack. Do not tap Install or any profile link below.";
    } else if (status === "local") {
      banner.hidden = false;
      banner.className = "note";
      banner.innerHTML =
        "<strong>Local preview.</strong> Official public host is <code>openhat-security.github.io/ios-max-security</code>.";
    }
  }

  const root = document.getElementById("profiles");
  root.replaceChildren();

  for (const section of data.sections) {
    const block = document.createElement("section");
    block.className = "profile-section" + (section.danger ? " danger" : "");

    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    block.append(h2);

    if (section.description) {
      const p = document.createElement("p");
      p.className = "section-desc";
      p.textContent = section.description;
      block.append(p);
    }

    if (section.id === "level-1" && data.safari_note) {
      const safari = document.createElement("div");
      safari.className = "note safari-box";
      safari.textContent = data.safari_note;
      block.append(safari);
    }

    const grid = document.createElement("div");
    grid.className = "profile-grid";
    for (const profile of section.profiles) {
      grid.append(profileCard(profile, section.danger));
    }
    block.append(grid);
    root.append(block);
  }
}

fetch("data/profiles.json?v=theme1")
  .then((r) => {
    if (!r.ok) throw new Error("Could not load profile list");
    return r.json();
  })
  .then(render)
  .catch((err) => {
    const lead = document.getElementById("lead");
    if (lead) lead.textContent = err.message;
  });
