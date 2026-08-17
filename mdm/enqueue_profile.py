#!/usr/bin/env python3
"""Queue an InstallProfile command on NanoMDM (privacy profile → enrolled device).

Stdlib only (`urllib.request`). Do not add pip dependencies.
"""

from __future__ import annotations

import argparse
import base64
import os
import plistlib
import uuid
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent


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


def install_profile_plist(mobileconfig: bytes) -> bytes:
    cmd = {
        "CommandUUID": str(uuid.uuid4()).upper(),
        "Command": {
            "RequestType": "InstallProfile",
            "Payload": mobileconfig,
        },
    }
    return plistlib.dumps(cmd, fmt=plistlib.FMT_XML)


def main() -> None:
    parser = argparse.ArgumentParser(description="Install a .mobileconfig via NanoMDM.")
    parser.add_argument("profile", type=Path, help="Path to .mobileconfig")
    parser.add_argument("--udid", required=True, help="Device UDID / NanoMDM enrollment id")
    parser.add_argument(
        "--api",
        default="http://127.0.0.1:9000",
        help="NanoMDM origin (use localhost if you port-forward 9000)",
    )
    args = parser.parse_args()
    env = {**os.environ, **load_env(ROOT / ".env")}
    api_key = env.get("NANOMDM_API_KEY", "nanomdm")
    raw = args.profile.read_bytes()
    body = install_profile_plist(raw)
    url = f"{args.api.rstrip('/')}/v1/enqueue/{args.udid}"
    req = Request(url, data=body, method="PUT")
    token = base64.b64encode(f"nanomdm:{api_key}".encode()).decode()
    req.add_header("Authorization", f"Basic {token}")
    req.add_header("Content-Type", "application/xml")
    with urlopen(req) as resp:
        print(resp.read().decode("utf-8", "replace"))


if __name__ == "__main__":
    main()
