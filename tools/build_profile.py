#!/usr/bin/env python3
"""Generate OpenHat iOS Max Privacy configuration profiles + catalog.json."""

from __future__ import annotations

import argparse
import json
import plistlib
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from catalog import (  # noqa: E402
    CURRENT_PUBLIC_IOS,
    MIN_IOS_ENCRYPTED_DNS,
    MIN_IOS_FULL_RESTRICTIONS,
    MIN_IOS_SAFARI_DENYLIST,
    public_catalog,
    restriction_keys,
)

NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
ORG = "OpenHat"
BUNDLE = "org.openhat.ios-max-privacy"
VERSION = 1


def uid(name: str) -> str:
    return str(uuid.uuid5(NS, f"{BUNDLE}.{name}")).upper()


DNS_PROVIDERS = {
    "mullvad-adblock": {
        "label": "Mullvad Adblock",
        "protocol": "HTTPS",
        "url": "https://adblock.doh.mullvad.net/dns-query",
        "addresses": ["194.242.2.3", "2a07:e340::3"],
        "notes": "Mullvad VPN AB (Sweden). Encrypts DNS and blocks ads, trackers, and malware.",
    },
    "quad9": {
        "label": "Quad9",
        "protocol": "HTTPS",
        "url": "https://dns.quad9.net/dns-query",
        "addresses": ["9.9.9.9", "149.112.112.112", "2620:fe::fe", "2620:fe::9"],
        "notes": "Quad9 Foundation (Switzerland). Encrypts DNS and blocks known malware domains.",
    },
}


def _load_json(name: str):
    path = Path(__file__).resolve().parent.parent / "data" / name
    return json.loads(path.read_text(encoding="utf-8"))


def tracker_bundle_ids() -> list[str]:
    data = _load_json("tracker-apps.json")
    ids = [a["bundle_id"] for a in data.get("default_block", [])]
    return ids


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
    urls = _load_json("safari-denylist.json")
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
    spec = DNS_PROVIDERS[provider_id]
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
    return "Mullvad" if provider_id.startswith("mullvad") else "Quad9"


def level_code(*, pin: bool, safari: bool) -> str:
    """2.1N = one extra N; 2.2N = two-extra combo N. Extra 1 = PIN, extra 2 = Safari."""
    extras = []
    if pin:
        extras.append(1)
    if safari:
        extras.append(2)
    if not extras:
        return "1"
    count = len(extras)
    if count == 1:
        return f"2.1{extras[0]}"
    return "2.21"


def security_display_name(provider_id: str, *, pin: bool = False, safari: bool = False) -> str:
    return f"OpenHat Security: Level {level_code(pin=pin, safari=safari)} ({dns_short(provider_id)})"


def build_profile(provider_id: str) -> bytes:
    return build_setup_profile(provider_id, pin=False, safari=False)


def build_setup_profile(
    provider_id: str, *, pin: bool = False, safari: bool = False
) -> bytes:
    spec = DNS_PROVIDERS[provider_id]
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
        "enable Lockdown Mode, or sign you out of Apple ID.\n\n"
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
    spec = DNS_PROVIDERS[provider_id]
    consent = (
        "For a phone already SUPERVISED with Apple Configurator (USB, erases "
        "the device).\n\n"
        "Level 3 includes everything: encrypted DNS, Max Privacy restrictions, "
        "stronger PIN, Safari website list, and a Supervised block list for "
        "Instagram, Facebook, Messenger, Snapchat, TikTok, X, Pinterest, "
        "Reddit, and LinkedIn.\n\n"
        "On an unsupervised iPhone this file's app blocks are ignored."
    )
    profile = {
        "PayloadType": "Configuration",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid(f"root.supervised.{provider_id}"),
        "PayloadIdentifier": f"{BUNDLE}.supervised",
        "PayloadDisplayName": f"OpenHat Security: Level 3 ({dns_short(provider_id)})",
        "PayloadDescription": (
            "Level 3: Max Privacy, PIN, Safari list, and Supervised app blocks. "
            "Requires Apple Configurator Prepare (erases the iPhone)."
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


def build_safari_denylist_profile() -> bytes:
    consent = (
        "Optional. Blocks a short list of tracker and social-graph sites "
        "inside Safari only. Instagram/Snapchat apps still work until you "
        "delete them or use the Supervised profile.\n\n"
        "Needs iOS 16+. If install fails, your iOS build may require "
        "supervision for Built-in web filters — use Configurator then."
    )
    profile = {
        "PayloadType": "Configuration",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid("root.webfilter"),
        "PayloadIdentifier": f"{BUNDLE}.safari-denylist",
        "PayloadDisplayName": "OpenHat Extras 1.2",
        "PayloadDescription": "Safari-only deny list for known tracker hosts.",
        "PayloadOrganization": ORG,
        "PayloadRemovalDisallowed": False,
        "PayloadScope": "System",
        "ConsentText": {"default": consent},
        "PayloadContent": [web_filter_payload()],
    }
    return plistlib.dumps(profile, fmt=plistlib.FMT_XML, sort_keys=False)


def build_passcode_profile() -> bytes:
    consent = (
        "Optional extra profile. Requires a passcode that is not a simple "
        "pattern (123456, 111111) and is at least 6 characters. The phone "
        "locks immediately when idle. It does not erase the device after "
        "failed attempts.\n\n"
        "If your current passcode is too weak, iOS will ask you to change it "
        "within 60 minutes of install."
    )
    profile = {
        "PayloadType": "Configuration",
        "PayloadVersion": VERSION,
        "PayloadUUID": uid("root.passcode"),
        "PayloadIdentifier": f"{BUNDLE}.passcode-profile",
        "PayloadDisplayName": "OpenHat Extras 1.1",
        "PayloadDescription": "Optional: non-simple passcode, lock immediately.",
        "PayloadOrganization": ORG,
        "PayloadRemovalDisallowed": False,
        "PayloadScope": "System",
        "ConsentText": {"default": consent},
        "PayloadContent": [passcode_payload()],
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


def write_catalog(path: Path) -> None:
    rows = public_catalog()
    payload = {
        "title": "OpenHat iOS Max Privacy — change catalog",
        "disclaimer": (
            "A website cannot read iPhone Settings. This catalog is what the "
            "profile will write versus Apple defaults, plus every leftover tap "
            "from the four source guides. Live state is only in Settings on the phone."
        ),
        "ios": {
            "current_public": CURRENT_PUBLIC_IOS,
            "full_restrictions": MIN_IOS_FULL_RESTRICTIONS,
            "safari_denylist": MIN_IOS_SAFARI_DENYLIST,
            "encrypted_dns": MIN_IOS_ENCRYPTED_DNS,
            "beta_unsupported": "27",
        },
        "counts": {
            "profile": sum(1 for r in rows if r["via"] == "profile"),
            "profile-supervised": sum(1 for r in rows if r["via"] == "profile-supervised"),
            "manual": sum(1 for r in rows if r["via"] == "manual"),
            "app": sum(1 for r in rows if r["via"] == "app"),
            "skipped": sum(1 for r in rows if r["via"] == "skipped"),
        },
        "items": rows,
    }
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path} ({len(rows)} items)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build OpenHat iOS privacy profiles.")
    root = Path(__file__).resolve().parent.parent
    parser.add_argument("--out", type=Path, default=root / "profiles")
    parser.add_argument(
        "--wipe-out",
        type=Path,
        default=root / "wipe-required",
        help="Supervised profile (erases the iPhone). Isolated from --out.",
    )
    parser.add_argument("--catalog", type=Path, default=root / "catalog.json")
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    args.wipe_out.mkdir(parents=True, exist_ok=True)

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

    passcode = build_passcode_profile()
    plistlib.loads(passcode)
    ppath = args.out / "OpenHat-Extras-1.1.mobileconfig"
    ppath.write_bytes(passcode)
    print(f"wrote {ppath} ({len(passcode)} bytes)")

    for provider_id, filename in (
        ("mullvad-adblock", "OpenHat-Level-3-Mullvad.mobileconfig"),
        ("quad9", "OpenHat-Level-3-Quad9.mobileconfig"),
    ):
        supervised = build_supervised_profile(provider_id)
        plistlib.loads(supervised)
        spath = args.wipe_out / filename
        spath.write_bytes(supervised)
        print(f"wrote {spath} ({len(supervised)} bytes)")
    leftover = args.out / "OpenHat-Supervised.mobileconfig"
    if leftover.exists():
        leftover.unlink()
        print(f"removed {leftover} (wipe-required only)")

    safari = build_safari_denylist_profile()
    plistlib.loads(safari)
    safari_path = args.out / "OpenHat-Extras-1.2.mobileconfig"
    safari_path.write_bytes(safari)
    print(f"wrote {safari_path} ({len(safari)} bytes)")

    write_catalog(args.catalog)


if __name__ == "__main__":
    main()
