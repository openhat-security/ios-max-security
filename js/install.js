import { wireInstallButton } from "./profile-install.js";

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

  const install = document.createElement("a");
  install.href = profile.file;
  install.setAttribute("role", "button");
  install.className = danger ? "danger" : "";
  install.textContent = "Install";
  wireInstallButton(install, profile.file);
  actions.append(install);

  if (profile.guide) {
    const guide = document.createElement("a");
    guide.href = profile.guide;
    guide.className = "outline guide-link";
    guide.textContent = "Read instructions first";
    actions.append(guide);
  }

  card.append(actions);
  return card;
}

function render(data) {
  document.title = data.title;
  document.getElementById("title").textContent = data.title;
  document.getElementById("lead").textContent = data.lead;

  const note = document.getElementById("safari-note");
  if (data.safari_note) {
    note.textContent = data.safari_note;
    note.hidden = false;
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

    const grid = document.createElement("div");
    grid.className = "profile-grid";
    for (const profile of section.profiles) {
      grid.append(profileCard(profile, section.danger));
    }
    block.append(grid);
    root.append(block);
  }
}

fetch("data/profiles.json")
  .then((r) => {
    if (!r.ok) throw new Error("Could not load profile list");
    return r.json();
  })
  .then(render)
  .catch((err) => {
    document.getElementById("lead").textContent = err.message;
  });
