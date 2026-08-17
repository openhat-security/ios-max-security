#!/usr/bin/env python3
"""Generate OpenHat iOS Max Privacy profiles from data/*.json.

Python 3 standard library only (json, plistlib, uuid). No pip packages.
"""

from __future__ import annotations

import argparse
import json
import plistlib
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
SRC = ROOT / "src"

NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
ORG = "OpenHat"
BUNDLE = "org.openhat.ios-max-privacy"
VERSION = 1


def uid(name: str) -> str:
    return str(uuid.uuid5(NS, f"{BUNDLE}.{name}")).upper()


def load_json(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def restriction_keys(vias: tuple[str, ...]) -> dict:
    out = {}
    for item in load_json("settings.json")["items"]:
        if item.get("via") in vias:
            out[item["key"]] = item["value"]
    return out


def dns_providers() -> dict[str, dict]:
    return {item["id"]: item for item in load_json("dns.json")["items"]}


def tracker_bundle_ids() -> list[str]:
    return [a["bundle_id"] for a in load_json("tracker-apps.json")["items"]]


def restrictions_payload(*, supervised_apps: bool = False) -> dict:
    p = {
        "PayloadType": "com.apple.applicationaccess",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid("restrictions" + (".supervised" if supervised_apps else "")),
        "PayloadIdentifier": f"{BUNDLE}.restrictions",
        "PayloadDisplayName": "OpenHat Privacy Restrictions",
        "PayloadDescription": "Disable Apple telemetry, ad tracking, and lock-screen leakage.",
        "PayloadOrganization": ORG,
    }
    vias = ("profile", "profile-supervised") if supervised_apps else ("profile",)
    p.update(restriction_keys(vias))
    if supervised_apps:
        p["blockedAppBundleIDs"] = tracker_bundle_ids()
    return p


def web_filter_payload() -> dict:
    urls = [row["url"] for row in load_json("safari-denylist.json")["items"]]
    return {
        "PayloadType": "com.apple.webcontent-filter",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid("webfilter"),
        "PayloadIdentifier": f"{BUNDLE}.webfilter",
        "PayloadDisplayName": "OpenHat Safari Tracker Deny List",
        "PayloadDescription": "Blocks known tracker and social-graph sites in Safari. Native apps are unaffected.",
        "PayloadOrganization": ORG,
        "FilterType": "BuiltIn",
        "AutoFilterEnabled": False,
        "UserDefinedName": "OpenHat Safari Deny List",
        "ContentFilterUUID": uid("webfilter.content"),
        "DenyListURLs": urls,
    }


def dns_payload(provider_id: str) -> dict:
    spec = dns_providers()[provider_id]
    return {
        "PayloadType": "com.apple.dnsSettings.managed",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid(f"dns.{provider_id}"),
        "PayloadIdentifier": f"{BUNDLE}.dns",
        "PayloadDisplayName": f"{spec['label']} Encrypted DNS",
        "PayloadDescription": spec["notes"],
        "PayloadOrganization": ORG,
        "ProhibitDisablement": False,
        "DNSSettings": {
            "DNSProtocol": spec["protocol"],
            "ServerURL": spec["url"],
            "ServerAddresses": spec["addresses"],
        },
    }


def passcode_payload() -> dict:
    return {
        "PayloadType": "com.apple.mobiledevice.passwordpolicy",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid("passcode"),
        "PayloadIdentifier": f"{BUNDLE}.passcode",
        "PayloadDisplayName": "OpenHat Passcode Policy",
        "PayloadDescription": "Require a non-simple passcode of at least 6 characters; lock immediately.",
        "PayloadOrganization": ORG,
        "forcePIN": True,
        "allowSimple": False,
        "minLength": 6,
        "maxGracePeriod": 0,
        "maxInactivity": 2,
        "requireAlphanumeric": False,
    }


def dns_short(provider_id: str) -> str:
    return dns_providers()[provider_id]["short"]


def level_code(*, pin: bool, safari: bool) -> str:
    extras = []
    if pin:
        extras.append(1)
    if safari:
        extras.append(2)
    if not extras:
        return "1"
    if len(extras) == 1:
        return f"2.1{extras[0]}"
    return "2.21"


def security_display_name(provider_id: str, *, pin: bool = False, safari: bool = False) -> str:
    return f"OpenHat Security: Level {level_code(pin=pin, safari=safari)} ({dns_short(provider_id)})"


def build_setup_profile(provider_id: str, *, pin: bool = False, safari: bool = False) -> bytes:
    spec = dns_providers()[provider_id]
    extras = []
    if pin:
        extras.append("a stronger PIN policy")
    if safari:
        extras.append("a Safari website block list")
    extra_txt = ""
    if extras:
        extra_txt = " Also includes " + " and ".join(extras) + "."
    fail_txt = ""
    if pin or safari:
        fail_txt = (
            "\n\nIf Install fails, your PIN may be too simple or this iPhone "
            "may reject the Safari filter. Remove this profile attempt, turn "
            "that extra off, and install again."
        )
    display = security_display_name(provider_id, pin=pin, safari=safari)
    consent = (
        "This profile encrypts DNS via "
        f"{spec['label']} and turns off Apple analytics, personalized ads, "
        "and app tracking requests. It also tightens the lock screen and "
        f"disables iCloud Backup.{extra_txt}\n\n"
        "It cannot read your current Settings, turn off Location Services, "
        "enable Lockdown Mode (do that yourself after Install — Level 3), "
        "or sign you out of Apple ID.\n\n"
        "Before Install, tap More Details to see every payload. "
        "Remove anytime: Settings > General > VPN & Device Management."
        f"{fail_txt}"
    )
    content = [dns_payload(provider_id), restrictions_payload()]
    if pin:
        content.append(passcode_payload())
    if safari:
        content.append(web_filter_payload())
    profile = {
        "PayloadType": "Configuration",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid(f"root.{provider_id}"),
        "PayloadIdentifier": BUNDLE,
        "PayloadDisplayName": display,
        "PayloadDescription": (
            "Encrypted DNS, no Apple analytics, no ad tracking, tighter lock "
            "screen"
            + (", PIN policy" if pin else "")
            + (", Safari site list" if safari else "")
            + "."
        ),
        "PayloadOrganization": ORG,
        "PayloadRemovalDisallowed": False,
        "PayloadScope": "System",
        "ConsentText": {"default": consent},
        "PayloadContent": content,
    }
    return plistlib.dumps(profile, fmt=plistlib.FMT_XML, sort_keys=False)


def build_supervised_profile(provider_id: str = "mullvad-adblock") -> bytes:
    consent = (
        "For a phone already SUPERVISED with Apple Configurator (USB, erases "
        "the device). That is Level 4.2. Lockdown Mode is Level 3 and optional; "
        "a profile cannot turn it on.\n\n"
        "This file includes encrypted DNS, Max Privacy restrictions, a stronger "
        "PIN, the Safari website list, and a Supervised block list for "
        "Instagram, Facebook, Messenger, Snapchat, TikTok, X, Pinterest, "
        "Reddit, and LinkedIn.\n\n"
        "On an unsupervised iPhone the app blocks and other Supervised keys "
        "are ignored. Use Level 1 or 2 instead, or Level 4.1 MDM without a wipe."
    )
    profile = {
        "PayloadType": "Configuration",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid(f"root.supervised.{provider_id}"),
        "PayloadIdentifier": f"{BUNDLE}.supervised",
        "PayloadDisplayName": f"OpenHat Security: Level 4 ({dns_short(provider_id)})",
        "PayloadDescription": (
            "Level 4.2 Supervised: Max Privacy, PIN, Safari list, and app blocks. "
            "Requires Apple Configurator Prepare (erases the iPhone). "
            "Lockdown Mode is Level 3 and optional."
        ),
        "PayloadOrganization": ORG,
        "PayloadRemovalDisallowed": False,
        "PayloadScope": "System",
        "ConsentText": {"default": consent},
        "PayloadContent": [
            dns_payload(provider_id),
            restrictions_payload(supervised_apps=True),
            passcode_payload(),
            web_filter_payload(),
        ],
    }
    return plistlib.dumps(profile, fmt=plistlib.FMT_XML, sort_keys=False)


def build_extras_profile(*, pin: bool = False, safari: bool = False) -> bytes:
    content = []
    parts = []
    if pin:
        content.append(passcode_payload())
        parts.append("a passcode policy")
    if safari:
        content.append(web_filter_payload())
        parts.append("a Safari content filter")
    if not content:
        raise ValueError("extras profile needs pin or safari")
    included = " and ".join(parts)
    if pin and safari:
        ident = f"{BUNDLE}.extras"
        uuid_name = "root.extras"
        display = "OpenHat Additional Profiles"
        desc = "Passcode policy and Safari content filter."
    elif pin:
        ident = f"{BUNDLE}.passcode-profile"
        uuid_name = "root.passcode"
        display = "OpenHat Extras 1.1"
        desc = "Optional: non-simple passcode, lock immediately."
    else:
        ident = f"{BUNDLE}.safari-denylist"
        uuid_name = "root.webfilter"
        display = "OpenHat Extras 1.2"
        desc = "Safari-only deny list for known tracker hosts."
    consent = (
        f"This additional configuration profile includes {included}. "
        "Install it if Level 1 is already on this iPhone and you do not "
        "want to replace that profile.\n\n"
        "A passcode policy requires a code that is not a simple pattern "
        "and is at least 6 characters. The Safari filter blocks listed "
        "sites in Safari only; Instagram and Snapchat apps still work."
    )
    profile = {
        "PayloadType": "Configuration",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid(uuid_name),
        "PayloadIdentifier": ident,
        "PayloadDisplayName": display,
        "PayloadDescription": desc,
        "PayloadOrganization": ORG,
        "PayloadRemovalDisallowed": False,
        "PayloadScope": "System",
        "ConsentText": {"default": consent},
        "PayloadContent": content,
    }
    return plistlib.dumps(profile, fmt=plistlib.FMT_XML, sort_keys=False)


def validate(raw: bytes) -> None:
    data = plistlib.loads(raw)
    assert data["PayloadType"] == "Configuration"
    assert data["PayloadRemovalDisallowed"] is False
    types = [p["PayloadType"] for p in data["PayloadContent"]]
    assert "com.apple.dnsSettings.managed" in types
    assert "com.apple.applicationaccess" in types
    restrictions = next(
        p for p in data["PayloadContent"] if p["PayloadType"] == "com.apple.applicationaccess"
    )
    assert restrictions["allowDiagnosticSubmission"] is False
    assert restrictions["forceLimitAdTracking"] is True
    assert restrictions["allowApplePersonalizedAdvertising"] is False
    assert restrictions["allowEnterpriseAppTrust"] is False
    assert "allowRCSMessaging" not in restrictions
    assert "allowCloudPhotoLibrary" not in restrictions
    assert "allowFindMyDevice" not in restrictions
    assert "allowChat" not in restrictions
    assert "allowFingerprintForUnlock" not in restrictions
    assert "blockedAppBundleIDs" not in restrictions
    dns = next(
        p for p in data["PayloadContent"] if p["PayloadType"] == "com.apple.dnsSettings.managed"
    )
    assert dns["DNSSettings"]["DNSProtocol"] == "HTTPS"
    assert dns["ProhibitDisablement"] is False


def main() -> None:
    parser = argparse.ArgumentParser(description="Build OpenHat iOS privacy profiles.")
    parser.add_argument("--out", type=Path, default=SRC / "profiles")
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    outputs = [
        ("mullvad-adblock", False, False, "OpenHat-Level-1-Mullvad.mobileconfig"),
        ("quad9", False, False, "OpenHat-Level-1-Quad9.mobileconfig"),
        ("mullvad-adblock", True, False, "OpenHat-Level-2.11-Mullvad.mobileconfig"),
        ("quad9", True, False, "OpenHat-Level-2.11-Quad9.mobileconfig"),
        ("mullvad-adblock", False, True, "OpenHat-Level-2.12-Mullvad.mobileconfig"),
        ("quad9", False, True, "OpenHat-Level-2.12-Quad9.mobileconfig"),
        ("mullvad-adblock", True, True, "OpenHat-Level-2.21-Mullvad.mobileconfig"),
        ("quad9", True, True, "OpenHat-Level-2.21-Quad9.mobileconfig"),
    ]
    for provider_id, pin, safari, filename in outputs:
        raw = build_setup_profile(provider_id, pin=pin, safari=safari)
        if not pin and not safari:
            validate(raw)
        else:
            plistlib.loads(raw)
        path = args.out / filename
        path.write_bytes(raw)
        print(f"wrote {path} ({len(raw)} bytes)")

    extras = [
        (True, False, "OpenHat-Extras-1.1.mobileconfig"),
        (False, True, "OpenHat-Extras-1.2.mobileconfig"),
        (True, True, "OpenHat-Extras-Both.mobileconfig"),
    ]
    for pin, safari, filename in extras:
        raw = build_extras_profile(pin=pin, safari=safari)
        plistlib.loads(raw)
        path = args.out / filename
        path.write_bytes(raw)
        print(f"wrote {path} ({len(raw)} bytes)")

    for provider_id, filename in (
        ("mullvad-adblock", "OpenHat-Level-4-Mullvad.mobileconfig"),
        ("quad9", "OpenHat-Level-4-Quad9.mobileconfig"),
    ):
        supervised = build_supervised_profile(provider_id)
        plistlib.loads(supervised)
        spath = args.out / filename
        spath.write_bytes(supervised)
        print(f"wrote {spath} ({len(supervised)} bytes)")
    leftover = args.out / "OpenHat-Supervised.mobileconfig"
    if leftover.exists():
        leftover.unlink()
        print(f"removed {leftover}")



if __name__ == "__main__":
    main()
