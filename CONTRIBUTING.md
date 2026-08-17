# Contributing

Thanks for helping with OpenHat Max Privacy. This file is how to work on the repo. GitHub’s [community profile](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories) and [Bootstrap’s contributing guide](https://github.com/twbs/bootstrap/blob/main/.github/CONTRIBUTING.md) are the layout we followed.

By opening a pull request you agree to license your contribution under the [MIT License](LICENSE).

## What this project is

A Safari installer and `.mobileconfig` profiles that harden a personal iPhone **without MDM, a custom root CA, or a jailbreak**. The default path on `main` must stay that way.

## Supported iOS

| | Version |
| --- | --- |
| Current public iOS we build against | **iOS 26.6** |
| Full restriction set (Apple Intelligence keys) | **iOS 18.2 and later** |
| Safari website block list extra | **iOS 16 and later** |
| Encrypted DNS payload | **iOS 14 and later** |
| iOS 27 developer / public beta | **Not supported** until Apple ships it |

Unknown restriction keys are ignored on older iOS. Do not drop iOS 18.2+ keys to “support” older phones; those phones already skip them.

## Standard library only (do not add pip)

All Python in this repo — `build_profile.py` and `mdm/*.py` — must stay on the **Python 3 standard library**. No `requirements.txt`, no `pip install`, no new third-party imports.

This is a security rule, not a style preference. A privacy installer should not ask anyone to pull packages from PyPI. If a change needs a library that is not in stdlib, it does not belong here. Use `json`, `plistlib`, `uuid`, `pathlib`, `urllib.request`, and the rest of the stdlib.

The optional MDM **server** is Docker (NanoMDM / SCEP / Caddy). That is separate from our Python. Do not wrap those daemons in a pip package.

## Development setup

You need Python 3.9+ (stdlib only).

```bash
python3 build_profile.py
echo "iPhone Safari: http://$(ipconfig getifaddr en0):8080/" && python3 -m http.server 8080 --directory src
```

Open the printed LAN URL **in Safari on an iPhone**. Chrome and desktop Safari will not install a configuration profile the same way. Public host is GitHub Pages.

## Repo layout

| Path | What it is |
| --- | --- |
| `src/` | GitHub Pages site. Published as the site root, so URLs stay `/`, `/paper.html`, `/wipe.html`, `/mdm.html`, `/profiles/…` |
| `data/` | Schema-stable JSON: Apple settings, leftovers, DNS, deny list, apps |
| `build_profile.py` | Writes `src/profiles/*.mobileconfig` from `data/` |
| `mdm/` | Self-hosted MDM server (Level 4.1; not Lockdown Mode) |
| `logos/` | Brand marks |

Local preview must serve `src/`, not the repo root.

## Where to edit

| Change | Edit this | Then |
| --- | --- | --- |
| Apple restriction key | `data/settings.json` | `python3 build_profile.py` |
| Leftover Settings taps | `data/leftovers.json` | no rebuild (docs only) |
| DNS providers | `data/dns.json` | rebuild |
| Safari deny list | `data/safari-denylist.json` | rebuild |
| Tracker apps | `data/tracker-apps.json` | rebuild |
| Installer UI | `src/index.html`, `src/css/`, `src/js/` | refresh Safari |
| Lockdown Mode (Level 3) | `src/lockdown.html` | no rebuild |
| Supervised (erase) path | `src/wipe.html`, `src/configurator.html`, Level 4 files in `src/profiles/` | Level 4.2 still erases the iPhone |

**Do not hand-edit** `src/profiles/*.mobileconfig`. Those are generated from `data/settings.json` and the other `data/*.json` lists. Each file has a schema in `data/schema/`.

## Hard limits (do not “fix”)

These are Apple’s rules, not missing payloads:

- No custom root CA / HTTPS interception
- No MDM enrollment on `main`
- No jailbreak
- No PyPI / pip dependencies in any Python we ship
- Do not set `allowCloudPhotoLibrary=false` (can delete undownloaded photos)
- Do not set `allowFindMyDevice=false` on the default profile
- Do not force-disable iMessage or Face ID on the default profile
- `blockedAppBundleIDs` only works after Apple Configurator **Prepare** (erases the phone) — that is Level 4.2 in `src/profiles/`

If a setting cannot be flipped by a profile, add it to the catalog as `via: "manual"` (or `skipped` / `app`). Do not invent a restriction key.

## Pull requests

1. Open an issue first for anything that changes payload keys or the keep-vs-erase story.
2. Keep `main` free of MDM enrollment payloads. Supervised / erase work belongs on `wipe.html` / Level 4.2 profiles. Lockdown Mode is `lockdown.html` (Level 3).
3. Rebuild generated files in the same commit as the catalog or data change.
4. Say how you tested: iOS version, Safari install, and whether extras (PIN / Safari list) were on.
5. Do not add pip packages. New `import`s must be from the Python standard library.

Use the pull request template. Be kind; we follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security reports

Do not file a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).
