#!/usr/bin/env python3
"""Build an MDM enrollment profile from mdm/.env (self-hosted or OpenHat URL).

Stdlib only. Do not add pip dependencies.
"""

from __future__ import annotations

import os
import plistlib
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


def load_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def uid(name: str) -> str:
    return str(uuid.uuid5(NS, f"org.openhat.mdm.{name}")).upper()


def build(env: dict[str, str]) -> bytes:
    base = env.get("MDM_PUBLIC_URL", "https://mdm.example.com").rstrip("/")
    topic = env.get("MDM_TOPIC", "com.apple.mgmt.External.REPLACE_ME")
    challenge = env.get("SCEP_CHALLENGE", "nanomdm")
    rights = int(env.get("ACCESS_RIGHTS", "8191"))
    provider = env.get("MDM_PROVIDER", "self")
    scep_uuid = uid("scep")

    scep = {
        "PayloadType": "com.apple.security.scep",
        "PayloadVersion": 1,
        "PayloadUUID": scep_uuid,
        "PayloadIdentifier": "org.openhat.mdm.scep",
        "PayloadDisplayName": "OpenHat SCEP",
        "PayloadContent": {
            "URL": f"{base}/scep",
            "Challenge": challenge,
            "Key Type": "RSA",
            "Keysize": 2048,
            "Key Usage": 5,
        },
    }
    mdm = {
        "PayloadType": "com.apple.mdm",
        "PayloadVersion": 1,
        "PayloadUUID": uid("mdm"),
        "PayloadIdentifier": "org.openhat.mdm.payload",
        "PayloadDisplayName": "OpenHat MDM",
        "AccessRights": rights,
        "CheckOutWhenRemoved": True,
        "IdentityCertificateUUID": scep_uuid,
        "ServerURL": f"{base}/mdm",
        "CheckInURL": f"{base}/mdm",
        "SignMessage": True,
        "Topic": topic,
        "ServerCapabilities": [
            "com.apple.mdm.per-user-connections",
            "com.apple.mdm.bootstraptoken",
            "com.apple.mdm.token",
        ],
    }
    consent = (
        f"Enrolls this iPhone in the {provider} MDM at {base}. "
        "The server can install profiles, query the device, and — if "
        "AccessRights include it — lock or erase the device.\n\n"
        "Remove: Settings > General > VPN & Device Management. "
        "This is not supervision by itself."
    )
    profile = {
        "PayloadType": "Configuration",
        "PayloadVersion": 1,
        "PayloadUUID": uid("root"),
        "PayloadIdentifier": "org.openhat.mdm.enroll",
        "PayloadDisplayName": "OpenHat MDM Enrollment",
        "PayloadDescription": f"MDM enrollment ({provider}) → {base}",
        "PayloadOrganization": "OpenHat",
        "PayloadRemovalDisallowed": False,
        "PayloadScope": "System",
        "ConsentText": {"default": consent},
        "PayloadContent": [scep, mdm],
    }
    return plistlib.dumps(profile, fmt=plistlib.FMT_XML, sort_keys=False)


def main() -> None:
    env = {**os.environ, **load_env(ROOT / ".env")}
    if "REPLACE_ME" in env.get("MDM_TOPIC", "REPLACE_ME"):
        print("warning: MDM_TOPIC is still a placeholder — upload the push cert first")
    raw = build(env)
    out = ROOT / "out"
    out.mkdir(parents=True, exist_ok=True)
    path = out / "OpenHat-MDM-Enroll.mobileconfig"
    path.write_bytes(raw)
    html = out / "index.html"
    html.write_text(
        """<!DOCTYPE html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Enroll without erasing</title>
<body style="font:16px/1.5 -apple-system,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem;background:#0e1116;color:#e6edf3">
<p style="color:#3fb950"><strong>This enrollment does not erase the iPhone.</strong></p>
<h1>Remote management</h1>
<p>Open this page in <strong>Safari</strong> on the iPhone.</p>
<p><a href="OpenHat-MDM-Enroll.mobileconfig" style="color:#3d9cf0">Install enrollment profile</a></p>
<p>The server can install profiles, query the device, and — if allowed — lock or erase later. This does not hide Instagram or Snapchat.</p>
<p style="color:#f85149"><strong>Hiding those apps erases the whole iPhone</strong> (Apple Configurator Prepare, then this same enrollment). Do not start Prepare unless you accept a full wipe.</p>
</body></html>
""",
        encoding="utf-8",
    )
    print(f"wrote {path}")
    print(f"wrote {html}")


if __name__ == "__main__":
    main()
