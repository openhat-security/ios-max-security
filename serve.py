#!/usr/bin/env python3
"""Serve the installer so an iPhone on the same Wi-Fi can download the profile.

iOS Safari needs the Apple config MIME type. Opening the .mobileconfig as a
local file often just saves it instead of offering Install.

When a profile is downloaded through this server, a home-screen Web Clip is
appended that points back at this audit page — that is the shareable link
for “what is in place / what is left.”
"""

from __future__ import annotations

import argparse
import http.server
import plistlib
import socket
import sys
import uuid
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
PORT_DEFAULT = 8080
WEBCLIP_NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

MIME = {
    ".mobileconfig": "application/x-apple-aspen-config",
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".md": "text/markdown; charset=utf-8",
}


def inject_audit_webclip(raw: bytes, page_url: str) -> bytes:
    try:
        profile = plistlib.loads(raw)
    except Exception:
        return raw
    if not isinstance(profile, dict) or profile.get("PayloadType") != "Configuration":
        return raw
    clip = {
        "PayloadType": "com.apple.webClip.managed",
        "PayloadVersion": 1,
        "PayloadUUID": str(uuid.uuid5(WEBCLIP_NS, "webclip.audit")).upper(),
        "PayloadIdentifier": "org.openhat.ios-max-privacy.webclip.audit",
        "PayloadDisplayName": "Privacy Audit",
        "PayloadDescription": "Open the checklist: what the profile set, what you still have to tap.",
        "PayloadOrganization": "OpenHat",
        "Label": "Privacy Audit",
        "URL": page_url,
        "IsRemovable": True,
        "FullScreen": False,
        "IgnoreManifestScope": True,
    }
    payloads = [
        p
        for p in profile.get("PayloadContent", [])
        if isinstance(p, dict) and p.get("PayloadType") != "com.apple.webClip.managed"
    ]
    payloads.append(clip)
    profile["PayloadContent"] = payloads
    return plistlib.dumps(profile, fmt=plistlib.FMT_XML, sort_keys=False)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def guess_type(self, path):
        ext = Path(path).suffix.lower()
        if ext in MIME:
            return MIME[ext]
        return super().guess_type(path)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        rel = parsed.path.lstrip("/")
        if rel.endswith(".mobileconfig"):
            disk = (ROOT / rel).resolve()
            if str(disk).startswith(str(ROOT.resolve())) and disk.is_file():
                host = self.headers.get("Host", "127.0.0.1:8080")
                scheme = "https" if self.headers.get("X-Forwarded-Proto") == "https" else "http"
                page_url = f"{scheme}://{host}/#audit"
                body = inject_audit_webclip(disk.read_bytes(), page_url)
                self.send_response(200)
                self.send_header("Content-Type", MIME[".mobileconfig"])
                self.send_header("Content-Length", str(len(body)))
                self.send_header(
                    "Content-Disposition",
                    f'attachment; filename="{disk.name}"',
                )
                self.end_headers()
                self.wfile.write(body)
                return
        super().do_GET()


def lan_ip() -> str:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("1.1.1.1", 80))
        return sock.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        sock.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve OpenHat iOS Max Privacy installer.")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=PORT_DEFAULT)
    args = parser.parse_args()

    httpd = http.server.ThreadingHTTPServer((args.host, args.port), Handler)
    ip = lan_ip()
    print("OpenHat iOS Max Privacy")
    print(f"  This Mac:     http://127.0.0.1:{args.port}/")
    print(f"  iPhone Wi-Fi: http://{ip}:{args.port}/")
    print(f"  Preview/audit:{ip}:{args.port}/#preview")
    print()
    print("Open the iPhone URL in Safari (not Chrome). Tap Install Max Privacy (Route A — no wipe).")
    print("Supervised / erase path is isolated at /wipe-required/ — do not mix it up.")
    print("For a remote test device, iOS needs HTTPS — use:")
    print("  cloudflared tunnel --url http://127.0.0.1:%d" % args.port)
    print("Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()
