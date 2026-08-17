import { parsePlist } from "./plist.js";
import { wireInstallButton } from "./profile-install.js";
import { githubUrlBox } from "./copy.js";
import { wireThemeControls, applyHostGuard } from "./theme.js?v=7";

wireThemeControls();
const host = applyHostGuard();

const ALLOWED = /^profiles\/[A-Za-z0-9._-]+\.mobileconfig$/;
const SKIP = new Set([
  "PayloadType",
  "PayloadVersion",
  "PayloadUUID",
  "PayloadIdentifier",
  "PayloadDisplayName",
  "PayloadDescription",
  "PayloadOrganization",
]);

const PAYLOAD_LABELS = {
  "com.apple.dnsSettings.managed": "Encrypted DNS",
  "com.apple.applicationaccess": "Privacy restrictions in this profile",
  "com.apple.mobiledevice.passwordpolicy": "Passcode policy",
  "com.apple.webcontent-filter": "Safari website list",
};

const KEY_LABELS = {
  allowDiagnosticSubmission: "Share iPhone Analytics",
  allowApplePersonalizedAdvertising: "Apple personalized ads",
  forceLimitAdTracking: "Limit ad tracking",
  allowCloudBackup: "iCloud Backup",
  forceEncryptedBackup: "Encrypt local backups",
  allowCloudDocumentSync: "iCloud Drive",
  allowCloudKeychainSync: "iCloud Keychain",
  allowActivityContinuation: "Handoff",
  allowSharedStream: "iCloud Shared Album",
  allowPhotoStream: "My Photo Stream",
  allowSpotlightInternetResults: "Siri Suggestions in Spotlight",
  allowAutoUnlock: "Auto Unlock with Apple Watch",
  allowEnterpriseAppTrust: "Trust enterprise apps",
  safariForceFraudWarning: "Safari fraud warning",
  safariAcceptCookies: "Safari cookies",
  safariAllowPopups: "Safari pop-ups",
  allowUntrustedTLSPrompt: "Prompt for untrusted TLS",
  allowLockScreenControlCenter: "Control Center on lock screen",
  allowLockScreenNotificationsView: "Notification Center on lock screen",
  allowLockScreenTodayView: "Today view on lock screen",
  allowPassbookWhileLocked: "Wallet on lock screen",
  allowAssistantWhileLocked: "Siri on lock screen",
  forceWatchWristDetection: "Apple Watch wrist detection",
  forceOnDeviceOnlyDictation: "On-device dictation",
  forceOnDeviceOnlyTranslation: "On-device translation",
  allowExternalIntelligenceIntegrations: "Apple Intelligence cloud",
  allowExternalIntelligenceIntegrationsSignIn: "Apple Intelligence sign-in",
  allowRemoteScreenObservation: "Remote screen observation",
  forceAirDropUnmanaged: "AirDrop as unmanaged",
  forcePIN: "Require a PIN",
  allowSimple: "Allow simple codes (123456)",
  minLength: "Minimum PIN length",
  maxGracePeriod: "Lock grace period (minutes)",
  maxInactivity: "Auto-lock (minutes)",
  FilterType: "Filter type",
  AutoFilterEnabled: "Automatic adult filter",
  UserDefinedName: "List name",
  DenyListURLs: "Blocked Safari URLs",
  blockedAppBundleIDs: "Hidden apps (Supervised only)",
  ProhibitDisablement: "User can turn DNS off",
};

function allowedPath(raw) {
  const path = decodeURIComponent(raw || "").replace(/^\/+/, "");
  return ALLOWED.test(path) ? path : "";
}

function fmt(value) {
  if (value === true) return "On";
  if (value === false) return "Off";
  if (Array.isArray(value)) return value.length + " items";
  return String(value);
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function payloadTitle(p) {
  return PAYLOAD_LABELS[p.PayloadType] || p.PayloadDisplayName || p.PayloadType;
}

function renderPayload(p) {
  const box = el(`<details class="audit-payload"></details>`);
  box.append(el(`<summary>${payloadTitle(p)}</summary>`));
  if (p.PayloadDescription) {
    box.append(el(`<p class="muted">${p.PayloadDescription}</p>`));
  }
  if (p.PayloadType === "com.apple.dnsSettings.managed" && p.DNSSettings) {
    const dns = p.DNSSettings;
    const ul = el("<ul class='audit-keys'></ul>");
    ul.append(el(`<li><strong>Protocol</strong> ${dns.DNSProtocol || ""}</li>`));
    ul.append(el(`<li><strong>Server</strong> ${dns.ServerURL || ""}</li>`));
    if (dns.ServerAddresses) {
      ul.append(el(`<li><strong>Addresses</strong> ${dns.ServerAddresses.join(", ")}</li>`));
    }
    ul.append(el(`<li><strong>${KEY_LABELS.ProhibitDisablement}</strong> ${p.ProhibitDisablement ? "No" : "Yes"}</li>`));
    box.append(ul);
    return box;
  }
  const ul = el("<ul class='audit-keys'></ul>");
  for (const [key, value] of Object.entries(p)) {
    if (SKIP.has(key) || key === "DNSSettings" || key === "ContentFilterUUID") continue;
    const label = KEY_LABELS[key] || key;
    if (Array.isArray(value) && (key === "DenyListURLs" || key === "blockedAppBundleIDs")) {
      const li = el(`<li><strong>${label}</strong></li>`);
      const inner = el("<ul class='compact-list'></ul>");
      for (const item of value) inner.append(el(`<li>${item}</li>`));
      li.append(inner);
      ul.append(li);
    } else {
      ul.append(el(`<li><strong>${label}</strong> ${fmt(value)}</li>`));
    }
  }
  box.append(ul);
  return box;
}

function render(profile, xml, path) {
  const root = document.getElementById("audit");
  const github = "https://github.com/openhat-security/ios-max-security/blob/main/" + path;
  const payloads = Array.isArray(profile.PayloadContent) ? profile.PayloadContent : [];

  root.replaceChildren();
  document.title = "View · " + (profile.PayloadDisplayName || "Profile");
  document.getElementById("title").textContent = profile.PayloadDisplayName || "Profile";
  document.getElementById("lead").textContent =
    profile.PayloadDescription || "Apple configuration profile — settings only, not an app.";

  // const proof = el(`<details class="audit-payload proof-panel"></details>`);
  // const bounce = el(
  //   `<span class="proof-bounce is-live">Click here for proof this is not a virus!</span>`
  // );
  const sum = document.createElement("summary");
  // sum.append(bounce);
  // proof.append(sum);
  // proof.addEventListener("toggle", () => {
  //   bounce.classList.toggle("is-live", !proof.open);
  //   bounce.textContent = proof.open
  //     ? "Proof this is not a virus"
  //     : "Click here for proof this is not a virus!";
  // });

  // const trust = el(`<div class="note"></div>`);
  // trust.innerHTML = `<strong>This is not an app and cannot be a virus.</strong>
  //   <p>A <code>.mobileconfig</code> is a text settings file (XML). It has no executable code.
  //   iOS will show the same name and payloads under Settings → General → VPN &amp; Device Management.
  //   You can remove it later. It is not locked on the phone.</p>`;
  // proof.append(trust);

  const meta = el("<ul class='audit-keys'></ul>");
  meta.append(el(`<li><strong>Organization</strong> ${profile.PayloadOrganization || "—"}</li>`));
  meta.append(el(`<li><strong>Identifier</strong> ${profile.PayloadIdentifier || "—"}</li>`));
  meta.append(el(`<li><strong>Removable</strong> ${profile.PayloadRemovalDisallowed ? "No" : "Yes"}</li>`));
  meta.append(el(`<li><strong>Payloads</strong> ${payloads.length}</li>`));
  meta.append(el(`<li><strong>File</strong> ${path} · ${xml.length.toLocaleString()} bytes of XML</li>`));
  // proof.append(meta);

  // proof.append(el("<h2>Same file on GitHub</h2>"));
  // proof.append(
  //   el(
  //     `<p class="section-desc">This page loaded <code>${path}</code> from the site. That is the same public file on GitHub. If you do not trust the button, copy the address and paste it in Safari yourself.</p>`
  //   )
  // );
  // const proofActions = el("<div class='profile-actions'></div>");
  // const viewSrc = el(
  //   `<a href="${github}" role="button" class="github-cta"><span class="gh-mark" aria-hidden="true"></span> View the source code for this profile</a>`
  // );
  // proofActions.append(viewSrc);
  // proof.append(proofActions);
  // proof.append(githubUrlBox(github));
  // root.append(proof);

  const actions = el("<div class='profile-actions audit-actions'></div>");
  const install = el(`<a href="${path}" role="button">Install this profile</a>`);
  if (host !== "phish") wireInstallButton(install, path);
  else {
    install.addEventListener("click", (e) => e.preventDefault());
    install.setAttribute("aria-disabled", "true");
  }
  actions.append(install);
  root.append(actions);

  for (const p of payloads) root.append(renderPayload(p));

  const raw = el("<details class='audit-payload'></details>");
  raw.append(el("<summary>Raw XML (the exact file that will install)</summary>"));
  const pre = document.createElement("pre");
  pre.className = "audit-xml";
  pre.textContent = xml;
  raw.append(pre);
  raw.append(el("<p class='section-desc'>Same file on GitHub:</p>"));
  raw.append(githubUrlBox(github));
  root.append(raw);
}

const path = allowedPath(new URLSearchParams(location.search).get("p"));
if (!path) {
  document.getElementById("lead").textContent = "No profile selected. Go back and tap View profile.";
} else {
  fetch(path, { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("Could not load " + path);
      return r.text();
    })
    .then((xml) => render(parsePlist(xml), xml, path))
    .catch((err) => {
      document.getElementById("lead").textContent = err.message;
    });
}
