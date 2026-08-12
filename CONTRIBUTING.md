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

## Development setup

You need Python 3.9+ (stdlib only: no pip packages for the installer).

```bash
python3 tools/build_profile.py
python3 serve.py
```

Open the printed LAN URL **in Safari on an iPhone**. Chrome and desktop Safari will not install a configuration profile the same way.

## Where to edit

| Change | Edit this | Then |
| --- | --- | --- |
| Restriction / leftover-tap catalog | `tools/catalog.py` | `python3 tools/build_profile.py` |
| DNS providers | `tools/build_profile.py` (`DNS_PROVIDERS`) | rebuild |
| Safari deny list | `data/safari-denylist.json` | rebuild |
| Tracker apps | `data/tracker-apps.json` | rebuild |
| Installer UI | `js/app.js`, `css/app.css`, `index.html` | refresh Safari |
| Local server / MIME | `serve.py` | restart `serve.py` |
| Supervised (erase) path | `wipe-required/` | keep it isolated from `profiles/` |

**Do not hand-edit** `profiles/*.mobileconfig` or `catalog.json`. Those are generated.

## Hard limits (do not “fix”)

These are Apple’s rules, not missing payloads:

- No custom root CA / HTTPS interception
- No MDM enrollment on `main`
- No jailbreak
- Do not set `allowCloudPhotoLibrary=false` (can delete undownloaded photos)
- Do not set `allowFindMyDevice=false` on the default profile
- Do not force-disable iMessage or Face ID on the default profile
- `blockedAppBundleIDs` only works after Apple Configurator **Prepare** (erases the phone) — that stays in `wipe-required/`

If a setting cannot be flipped by a profile, add it to the catalog as `via: "manual"` (or `skipped` / `app`). Do not invent a restriction key.

## Pull requests

1. Open an issue first for anything that changes payload keys or the keep-vs-erase story.
2. Keep `main` free of MDM. Supervised / erase work belongs in `wipe-required/`.
3. Rebuild generated files in the same commit as the catalog or data change.
4. Say how you tested: iOS version, Safari install, and whether extras (PIN / Safari list) were on.

Use the pull request template. Be kind; we follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security reports

Do not file a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).
