(() => {
  const STORE = "openhat-ios-wizard-v1";
  const CHECK = "openhat-ios-audit-v1";

  const KEEP = ["route", "dns", "extras", "install", "taps", "apps", "done"];
  const ERASE = ["route", "erase", "done"];

  const state = loadState();
  let catalog = [];
  let trackers = { default_block: [], consider_removing: [] };
  let safariList = [];
  let checks = {};
  try { checks = JSON.parse(localStorage.getItem(CHECK) || "{}"); } catch (e) { checks = {}; }

  function loadState() {
    try {
      return Object.assign(
        { route: "", dns: "mullvad", pin: false, safari: false, step: "route", installed: false },
        JSON.parse(localStorage.getItem(STORE) || "{}")
      );
    } catch (e) {
      return { route: "", dns: "mullvad", pin: false, safari: false, step: "route", installed: false };
    }
  }

  function save() {
    localStorage.setItem(STORE, JSON.stringify(state));
    localStorage.setItem(CHECK, JSON.stringify(checks));
  }

  function steps() {
    return state.route === "erase" ? ERASE : KEEP;
  }

  function stepIndex() {
    const i = steps().indexOf(state.step);
    return i < 0 ? 0 : i;
  }

  function go(step) {
    state.step = step;
    save();
    render();
    window.scrollTo(0, 0);
  }

  function next() {
    const list = steps();
    const i = stepIndex();
    go(list[Math.min(i + 1, list.length - 1)]);
  }

  function back() {
    const list = steps();
    const i = stepIndex();
    if (i <= 0) {
      state.route = "";
      go("route");
      return;
    }
    go(list[i - 1]);
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content;
  }

  function choice(id, { title, sub, danger, mark, selected }) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "choice" + (danger ? " danger" : "") + (selected ? " selected" : "");
    b.dataset.id = id;
    b.innerHTML =
      (mark ? `<span class="mark">${mark}</span>` : "") +
      `<strong>${title}</strong><small>${sub}</small>`;
    return b;
  }

  function setHeader(badge, lead, badgeBad) {
    const badgeEl = document.getElementById("badge");
    badgeEl.textContent = badge;
    badgeEl.className = "badge" + (badgeBad ? " bad" : "");
    document.getElementById("lead").textContent = lead;
  }

  function renderBar() {
    const bar = document.getElementById("bar");
    const onRoute = state.step === "route";
    bar.hidden = onRoute;
    if (onRoute) return;
    const list = steps();
    const i = stepIndex();
    document.getElementById("step-label").textContent = `${i} / ${list.length - 1}`;
    const dots = document.getElementById("dots");
    dots.innerHTML = list
      .slice(1)
      .map((_, n) => `<i class="${n < i ? "on" : ""}"></i>`)
      .join("");
  }

  function panel() {
    return document.getElementById("panel");
  }

  function renderRoute() {
    setHeader("Choose a setup", "Select Basic or Advanced. You can go back at any time.");
    const wrap = document.createElement("div");
    wrap.className = "stack";
    const keep = choice("keep", {
      mark: "Basic",
      title: "Install Max Privacy",
      sub: "Private DNS, ads and analytics off, tighter lock screen. Optional extras and a checklist. Does not erase the iPhone.",
      selected: state.route === "keep",
    });
    const erase = choice("erase", {
      mark: "Advanced · erases the iPhone",
      title: "Apple Configurator",
      sub: "Supervised setup on a Mac. Unlocks restrictions a Safari install cannot apply.",
      danger: true,
      selected: state.route === "erase",
    });
    keep.addEventListener("click", () => {
      state.route = "keep";
      save();
      next();
    });
    erase.addEventListener("click", () => {
      state.route = "erase";
      save();
      next();
    });
    wrap.append(keep, erase);
    const remote = document.createElement("p");
    remote.className = "muted";
    remote.innerHTML =
      'Remote management is a separate path and is not required. <a href="mdm/out/">Enroll without erasing</a> · <a href="mdm/README.md">Server setup</a>';
    wrap.append(remote);
    panel().replaceChildren(wrap);
  }

  function renderDns() {
    setHeader("Basic setup", "Which private DNS do you want? The phone can only use one.");
    const wrap = document.createElement("div");
    wrap.className = "stack";
    const mullvad = choice("mullvad", {
      mark: "Recommended",
      title: "Mullvad DNS",
      sub: "Encrypts DNS and blocks ads, trackers, and malware. Included with Max Privacy.",
      selected: state.dns === "mullvad",
    });
    const quad9 = choice("quad9", {
      title: "Quad9 DNS",
      sub: "Same Max Privacy install, different resolver. Blocks malware. Replaces Mullvad.",
      selected: state.dns === "quad9",
    });
    mullvad.addEventListener("click", () => {
      state.dns = "mullvad";
      state.installed = false;
      save();
      next();
    });
    quad9.addEventListener("click", () => {
      state.dns = "quad9";
      state.installed = false;
      save();
      next();
    });
    wrap.append(mullvad, quad9);
    panel().replaceChildren(wrap);
  }

  function toggleBtn(key, title, sub) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "toggle-row" + (state[key] ? " on" : "");
    b.innerHTML = `<input type="checkbox" ${state[key] ? "checked" : ""} tabindex="-1"><span><strong>${title}</strong><small>${sub}</small></span>`;
    b.addEventListener("click", () => {
      state[key] = !state[key];
      state.installed = false;
      save();
      render();
    });
    return b;
  }

  function continueBtn(onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = "Continue";
    b.addEventListener("click", onClick);
    return b;
  }

  function stopHereBtn() {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "stop-here";
    b.textContent = "Stop here";
    b.addEventListener("click", () => go("done"));
    return b;
  }

  function renderExtras() {
    setHeader("Basic setup", "Optional extras. Skip both if Max Privacy is enough.");
    const wrap = document.createElement("div");
    wrap.className = "stack";
    wrap.append(
      toggleBtn("pin", "Stronger PIN", "Blocks easy codes like 123456 and locks the phone right away."),
      toggleBtn("safari", "Safari website list", "Blocks selected social and advertising sites in Safari. Does not remove those apps.")
    );
    const nav = document.createElement("div");
    nav.className = "stack nav-next";
    nav.append(continueBtn(next));
    wrap.append(nav);
    panel().replaceChildren(wrap);
  }

  const CAT_ORDER = [
    "Network",
    "Apple telemetry",
    "Third-party tracking",
    "iCloud",
    "Lock screen",
    "Safari",
    "Apps",
  ];

  function grouped(items) {
    const groups = {};
    for (const i of items) {
      (groups[i.category] || (groups[i.category] = [])).push(i);
    }
    const keys = CAT_ORDER.filter((c) => groups[c]).concat(
      Object.keys(groups).filter((c) => !CAT_ORDER.includes(c))
    );
    return keys.map((k) => [k, groups[k]]);
  }

  function profileItems() {
    const dnsName = state.dns === "quad9" ? "Quad9" : "Mullvad Adblock";
    const dnsAfter =
      state.dns === "quad9"
        ? "Encrypted DNS · blocks malware"
        : "Encrypted DNS · blocks ads, trackers, and malware";
    const dns = {
      id: "dns-doh",
      category: "Network",
      title: "Encrypted DNS (" + dnsName + ")",
      after: dnsAfter,
    };
    const rest = catalog.filter(
      (i) => i.via === "profile" && i.id !== "dns-doh" && i.id !== "dns-quad9"
    );
    return [dns, ...rest];
  }

  function installLink(href, label, primary) {
    const a = document.createElement("a");
    a.href = href;
    a.setAttribute("role", "button");
    if (!primary) a.className = "secondary";
    a.textContent = label;
    return a;
  }

  function renderInstall() {
    const items = profileItems();
    setHeader("Basic setup", "Tap Install, then Allow.");
    const wrap = document.createElement("div");
    wrap.className = "stack";

    let name = state.dns === "quad9" ? "OpenHat-MaxPrivacy-Quad9" : "OpenHat-MaxPrivacy";
    if (state.pin) name += "-PIN";
    if (state.safari) name += "-Safari";
    const install = installLink("profiles/" + name + ".mobileconfig", "Install Max Privacy", true);

    if (state.pin || state.safari) {
      const label = document.createElement("p");
      label.className = "extras-label";
      label.textContent = "Extras:";
      const ul = document.createElement("ul");
      ul.className = "extras-list";
      if (state.pin) {
        const li = document.createElement("li");
        li.textContent = "Stronger PIN";
        ul.append(li);
      }
      if (state.safari) {
        const li = document.createElement("li");
        li.textContent = "Safari website list";
        ul.append(li);
      }
      wrap.append(label, ul);
    }

    wrap.append(install);

    const nav = document.createElement("div");
    nav.className = "stack";
    const cont = continueBtn(next);
    if (!state.installed) {
      cont.disabled = true;
    }
    install.addEventListener("click", () => {
      state.installed = true;
      save();
      cont.disabled = false;
    });
    nav.append(cont, stopHereBtn());
    wrap.append(nav);

    const max = document.createElement("details");
    max.className = "block";
    const maxSum = document.createElement("summary");
    maxSum.textContent = "What's in Max Privacy (" + items.length + ")";
    max.append(maxSum);
    const hint = document.createElement("p");
    hint.className = "muted";
    hint.textContent = "Same list iPhone shows under More Details.";
    max.append(hint);
    for (const [cat, rows] of grouped(items)) {
      const inner = document.createElement("details");
      inner.className = "block inner";
      const is = document.createElement("summary");
      is.textContent = cat + " (" + rows.length + ")";
      inner.append(is);
      for (const i of rows) {
        const row = document.createElement("div");
        row.className = "restrict";
        row.innerHTML = `<strong>${i.title}</strong><span>${i.after || ""}</span>`;
        inner.append(row);
      }
      max.append(inner);
    }
    wrap.append(max);

    if (state.pin) {
      const pin = document.createElement("details");
      pin.className = "block";
      pin.innerHTML = `<summary>What's in the PIN policy</summary>
        <ul class="compact-list">
          <li>PIN required, at least 6 characters</li>
          <li>Simple codes like 123456 are not allowed</li>
          <li>Phone locks immediately when idle</li>
        </ul>`;
      wrap.append(pin);
    }

    if (state.safari) {
      const safari = document.createElement("details");
      safari.className = "block";
      const ss = document.createElement("summary");
      const urls = safariList.length ? safariList : [];
      ss.textContent = "What's in the Safari list (" + (urls.length || "…") + ")";
      safari.append(ss);
      const sh = document.createElement("p");
      sh.className = "muted";
      sh.textContent = "Safari only. Apps are not removed.";
      safari.append(sh);
      if (!urls.length) {
        const p = document.createElement("p");
        p.className = "muted";
        p.textContent = "Could not load the site list.";
        safari.append(p);
      } else {
        const ul = document.createElement("ul");
        ul.className = "compact-list";
        for (const u of urls) {
          const li = document.createElement("li");
          li.textContent = u.replace(/^https:\/\//, "");
          ul.append(li);
        }
        safari.append(ul);
      }
      wrap.append(safari);
    }

    panel().replaceChildren(wrap);
  }

  function renderTaps() {
    setHeader(
      "Basic setup",
      "These are not in Max Privacy. The previous screen listed every restriction the profile already set. Open each path on the phone, then check it off."
    );
    const wrap = document.createElement("div");
    const items = catalog.filter(
      (i) =>
        (i.via === "manual" || i.via === "app") &&
        i.id !== "configurator-supervise" &&
        i.id !== "safari-denylist"
    );
    const doneN = items.filter((i) => checks[i.id]).length;
    const prog = document.createElement("p");
    prog.className = "progress";
    prog.textContent = `${doneN} / ${items.length} checked on this phone’s browser`;
    wrap.append(prog);

    const groups = grouped(items);
    for (const [cat, rows] of groups) {
      const h = document.createElement("div");
      h.className = "cat";
      h.textContent = cat;
      wrap.append(h);
      for (const i of rows) {
        const row = document.createElement("label");
        row.className = "check-item" + (checks[i.id] ? " done" : "");
        row.innerHTML = `<input type="checkbox" ${checks[i.id] ? "checked" : ""}>
          <span><strong>${i.title}</strong><span class="path">${i.verify || ""}</span></span>`;
        row.querySelector("input").addEventListener("change", (ev) => {
          if (ev.target.checked) checks[i.id] = true;
          else delete checks[i.id];
          save();
          render();
        });
        wrap.append(row);
      }
    }

    const nav = document.createElement("div");
    nav.className = "stack nav-next";
    nav.append(continueBtn(next), stopHereBtn());
    wrap.append(nav);
    panel().replaceChildren(wrap);
  }

  function renderApps() {
    setHeader("Basic setup", "The Max Privacy install cannot remove these apps. Delete them, or use Screen Time → Never Allow.");
    const wrap = document.createElement("div");
    const list = document.createElement("div");
    for (const a of trackers.default_block || []) {
      const id = "app-" + a.bundle_id;
      const row = document.createElement("label");
      row.className = "check-item" + (checks[id] ? " done" : "");
      row.innerHTML = `<input type="checkbox" ${checks[id] ? "checked" : ""}>
        <span><strong>${a.name}</strong><span class="path">${a.reason}</span></span>`;
      row.querySelector("input").addEventListener("change", (ev) => {
        if (ev.target.checked) checks[id] = true;
        else delete checks[id];
        save();
        render();
      });
      list.append(row);
    }
    wrap.append(list);
    const hint = document.createElement("p");
    hint.className = "muted";
    hint.textContent = (trackers.screen_time || "") + " Checking a box only records that you handled it — this page cannot delete apps.";
    wrap.append(hint);

    const nav = document.createElement("div");
    nav.className = "stack nav-next";
    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.textContent = "Finish Basic setup";
    doneBtn.addEventListener("click", () => go("done"));
    const eraseBtn = document.createElement("button");
    eraseBtn.type = "button";
    eraseBtn.className = "contrast";
    eraseBtn.textContent = "Continue to Advanced setup";
    eraseBtn.addEventListener("click", () => {
      state.route = "erase";
      save();
      go("erase");
    });
    nav.append(doneBtn, eraseBtn);
    wrap.append(nav);
    panel().replaceChildren(wrap);
  }

  function renderErase() {
    setHeader("Advanced setup", "Apple Configurator on a Mac. Prepare erases the iPhone.", true);
    const wrap = document.createElement("div");
    wrap.className = "stack";
    const note = document.createElement("div");
    note.className = "note danger";
    note.innerHTML = `<strong>Prepare always erases the iPhone.</strong>
      <p>This path supervises the device so restrictions a Safari install cannot apply will take effect. Encrypted Finder backup first.</p>`;
    wrap.append(note);
    const open = document.createElement("a");
    open.className = "action danger";
    open.href = "wipe-required/";
    open.innerHTML = `<span>Continue in Apple Configurator<small>Mac + cable · erases the iPhone</small></span><span class="go">Open</span>`;
    wrap.append(open);
    const backKeep = document.createElement("button");
    backKeep.type = "button";
    backKeep.className = "outline";
    backKeep.textContent = "Return to Basic setup";
    backKeep.addEventListener("click", () => {
      state.route = "keep";
      save();
      go("apps");
    });
    wrap.append(backKeep);
    panel().replaceChildren(wrap);
  }

  function renderDone() {
    const erased = state.route === "erase";
    setHeader(
      erased ? "Advanced setup" : "Basic setup complete",
      erased
        ? "Finish Apple Configurator on a Mac. Prepare erases the iPhone."
        : "Max Privacy is installed. Extras and leftover taps were optional.",
      erased
    );
    const wrap = document.createElement("div");
    wrap.className = "stack";
    const note = document.createElement("div");
    note.className = "note";
    if (erased) {
      note.innerHTML = `<p>After Prepare, install the Supervised configuration from the next page.</p>`;
    } else {
      const dns = state.dns === "quad9" ? "Quad9" : "Mullvad";
      note.innerHTML = `<strong>Your path</strong>
        <ul>
          <li>Max Privacy with ${dns} DNS</li>
          <li>${state.pin ? "Stronger PIN extra" : "No PIN extra"}</li>
          <li>${state.safari ? "Safari website list extra" : "No Safari extra"}</li>
        </ul>
        <p class="muted">Remove later: Settings → General → VPN &amp; Device Management → the profile → Remove.</p>`;
    }
    wrap.append(note);
    const again = document.createElement("button");
    again.type = "button";
    again.className = "outline";
    again.textContent = "Start over";
    again.addEventListener("click", () => {
      state.route = "";
      state.dns = "mullvad";
      state.pin = false;
      state.safari = false;
      state.installed = false;
      save();
      go("route");
    });
    wrap.append(again);
    panel().replaceChildren(wrap);
  }

  const VIEWS = {
    route: renderRoute,
    dns: renderDns,
    extras: renderExtras,
    install: renderInstall,
    taps: renderTaps,
    apps: renderApps,
    erase: renderErase,
    done: renderDone,
  };

  function render() {
    if (state.route === "erase" && !ERASE.includes(state.step)) state.step = "erase";
    if (state.route === "keep" && !KEEP.includes(state.step)) state.step = "dns";
    if (!state.route) state.step = "route";
    renderBar();
    (VIEWS[state.step] || renderRoute)();
  }

  document.getElementById("back").addEventListener("click", back);

  Promise.all([
    fetch("catalog.json").then((r) => r.json()).catch(() => ({ items: [] })),
    fetch("data/tracker-apps.json").then((r) => r.json()).catch(() => ({ default_block: [] })),
    fetch("data/safari-denylist.json").then((r) => r.json()).catch(() => []),
  ]).then(([cat, tr, safari]) => {
    catalog = cat.items || [];
    trackers = tr;
    safariList = Array.isArray(safari) ? safari : [];
    render();
  });
})();
