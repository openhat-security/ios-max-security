# OpenHat Max Privacy for iPhone

Install **OpenHat Max Privacy** on the iPhone. That is the main step. You can stop there.

Built for public **iOS 26** (currently 26.6). See [Supported iOS](#supported-ios).

Everything after that is optional. You can leave off at any green “stop” below. Your photos and apps stay put unless you choose Level 4.2, which **erases the whole iPhone**. Most people never do that last step.

Lockdown Mode (Level 3) and MDM (Level 4) are independent. You can use one, both, or neither.

## Configurations

```mermaid
flowchart TD
  start([Start]) --> s1["1. Install OpenHat Security: Level 1 in Safari"]
  s1 --> s1d["What this does for you:
private DNS that blocks ads and trackers,
Apple analytics off, personalized ads off,
lock screen does not show message previews"]
  s1d --> stop1{Want more, or stop?}
  stop1 -->|Stop — this is enough| done[Finished. iPhone was not erased.]
  stop1 -->|Keep going| s2

  s2["2. Optional extras we built"]
  s2 --> dns["Different DNS: Quad9 instead of Mullvad.
Same install, just a different button.
Use this if you prefer Quad9."]
  s2 --> pin["Stronger PIN.
Requires a PIN that is not 123456,
and locks the phone right away."]
  s2 --> safari["Safari website block list we wrote.
In Safari, blocks facebook.com, instagram.com,
snapchat.com, tiktok.com, and common ad pages.
The Instagram and Snapchat apps still work."]
  dns --> stop2{Want more, or stop?}
  pin --> stop2
  safari --> stop2
  stop2 -->|Stop| done
  stop2 -->|Keep going| s3

  s3["3. Lockdown Mode (Settings tap)"]
  s3 --> s3d["Apple high-risk mode. No profile key.
Install Level 1 or 2 first.
Optional. Not MDM."]
  s3d --> stop3{Want more, or stop?}
  stop3 -->|Stop| done
  stop3 -->|Want a server you run| s4

  s4["4. MDM — two versions"]
  s4 --> s41["4.1 User enrollment. No erase.
Can push Level 1 / 2. Cannot hide apps."]
  s4 --> s42["4.2 Supervise with Configurator.
ERASES the iPhone. Then Level 4 profile
hides Instagram and forces Siri / AirDrop off."]
  s41 --> done
  s42 --> done
```

| Step | What it is | Can you stop after this? | Erases the iPhone? |
| --- | --- | --- | --- |
| **Level 1 (Mullvad or Quad9)** | The main install. Private DNS, Apple ads/analytics off, tighter lock screen. | **Yes — recommended stop** | No |
| **Level 2.11** | Level 1 plus Extra 1.1 (stronger PIN). | Yes | No |
| **Level 2.12** | Level 1 plus Extra 1.2 (Safari website list). | Yes | No |
| **Level 2.21** | Level 1 plus both extras. | Yes | No |
| **Extras 1.1 / 1.2** | PIN or Safari only, if Level 1 is already installed. | Yes | No |
| **Settings taps** | Things Apple will not let an install change: Location, iCloud leftovers, Private Wi-Fi, VPN, Stolen Device Protection. | Yes | No |
| **Tracking apps** | Delete them, or Screen Time → Never Allow. | **Yes — last stop that keeps your data** | No |
| **Level 3** | Lockdown Mode in Settings. **No profile. No erase. No MDM.** Optional with Level 4. | Yes | No |
| **Level 4.1** | User-enrolled MDM you host. **Does not erase.** Can push Level 1 / 2. Cannot hide apps. | Yes | No |
| **Level 4.2** | Erase with Apple Configurator, then the Supervised Level 4 profile. Lockdown Mode is still Level 3 and optional. | — | **Yes** |

---

## Step 1 — OpenHat Security: Level 1

This does **not** erase the iPhone. Stop here if you only wanted private DNS and ads/analytics off.

### Install from GitHub Pages (recommended)

1. On the iPhone, open **Safari** (not Chrome):  
   **https://openhat-security.github.io/ios-max-security/**
2. Tap the profile you want, then **Allow** when iOS prompts you.
3. Finish in **Settings → General → VPN & Device Management → Install**.

Default is **OpenHat Security: Level 1 (Mullvad)**. Pick **Level 1 (Quad9)** if you prefer that resolver. Level 2 bundles add extras in one file (`.11` = PIN, `.12` = Safari, `.21` = both).

### Local preview

```bash
echo "iPhone Safari: http://$(ipconfig getifaddr en0):8080/" && python3 -m http.server 8080 --directory src
```

Open that URL in Safari on the iPhone. GitHub Pages is the public host: **https://openhat-security.github.io/ios-max-security/**

---

## Step 2 — extras we built (optional)

Skip this whole step if step 1 is enough.

| Button on the installer | What we made | What it does not do |
| --- | --- | --- |
| **Optional: passcode policy** | A stronger PIN rule | Does not erase the phone after wrong guesses |
| **Optional: Safari tracker deny list** | Our list of websites to block **in Safari** (Facebook, Instagram, Snapchat, TikTok sites, DoubleClick, Google Analytics, and similar) | Does not remove the Instagram or Snapchat **apps**. Those still work until you delete them or use Screen Time. |

---

## Step 3 — Lockdown Mode (optional)

This is **Level 3**. It is a Settings switch, not a profile. Apple’s Platform Security guide describes it as an extreme attack-surface cut for people who may be targeted. A profile cannot enable it. MDM cannot enable it.

Install Level 1 or 2 first. Lockdown Mode blocks new Safari profile installs.

Read [lockdown.html](https://openhat-security.github.io/ios-max-security/lockdown.html). You can stop after this. You can also skip it and still do Level 4 later.

Also do the leftover Settings taps a website cannot flip: Location Services, Stolen Device Protection, Private Wi-Fi Address, VPN.

---

## Step 4 — tracking apps, still no erase

Instagram, Facebook, Messenger, Snapchat, TikTok, X, Pinterest, Reddit, and LinkedIn are not malware, but they build advertising graphs. Step 1 cannot hide them. Either:

- Delete the apps, or
- **Settings → Screen Time → Content & Privacy Restrictions → Never Allow**

You can stop here. This is the last step that keeps your data unless you choose Level 4.2.

---

## Step 5 — MDM (optional)

Lockdown Mode is not required for either path.

| Setup | Erases? | What you get |
| --- | --- | --- |
| **Level 4.1 — user enrollment** | **No** | A server you run can push Level 1 / 2. Instagram stays unless you delete it. |
| **Level 4.2 — Supervise** | **Yes** | Apple Configurator **Prepare**, then the Level 4 profile: app hides, Siri / AirDrop / USB pairing off. |

4.1: [mdm.html](https://openhat-security.github.io/ios-max-security/mdm.html) and [`mdm/README.md`](mdm/README.md). Open `/enroll/` on your server in Safari.

4.2: Read [wipe.html](https://openhat-security.github.io/ios-max-security/wipe.html) before you plug in a cable. After Prepare, install **OpenHat Security: Level 4** from `src/profiles/` (Mullvad or Quad9). You manage that profile. OpenHat cannot see your data. If you also want Lockdown Mode, turn it on after the profile is installed.

---

## Supported iOS

| | Version |
| --- | --- |
| Current public iOS we build against | **iOS 26.6** |
| Full restriction set (Apple Intelligence keys) | **iOS 18.2 and later** |
| Optional Safari website block list | **iOS 16 and later** |
| Encrypted DNS | **iOS 14 and later** |
| iOS 27 developer / public beta | **Not supported** until Apple ships it |

Unknown restriction keys are ignored on older iOS. The leftover Settings checklist is the same on every version: a website cannot flip those switches.

## No pip, no extra packages

Every Python file in this repo uses the **Python 3 standard library only**. That includes `build_profile.py` and the optional MDM helpers (`mdm/generate_enrollment.py`, `mdm/enqueue_profile.py`). There is no `requirements.txt`, no virtualenv, and no third-party package to install or supply-chain review.

That is intentional. You can read every `import` in a minute. We will not add PyPI dependencies. The public installer is static HTML on GitHub Pages. The optional MDM server is Docker images you pin yourself (NanoMDM, SCEP, Caddy), not Python packages we vendor.

## Contributing

Bug reports, catalog items, and installer changes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Security reports go through [SECURITY.md](SECURITY.md), not a public issue.

## License

[MIT](LICENSE).

## Sources

- [paulmillr/encrypted-dns](https://github.com/paulmillr/encrypted-dns)
- [celenityy/ios-settings](https://github.com/celenityy/ios-settings)
- [iPrivacyGuides/iOS-Privacy-Guide](https://github.com/iPrivacyGuides/iOS-Privacy-Guide)
- [danieloz147/ios-profile-builder](https://github.com/danieloz147/ios-profile-builder)
- [Apple Restrictions payload](https://developer.apple.com/documentation/devicemanagement/restrictions)
- [Apple Platform Security](https://support.apple.com/guide/security/welcome/web)
- [iAnonymous3000/iOS-Hardening-Guide](https://github.com/iAnonymous3000/iOS-Hardening-Guide)
- [NanoMDM](https://github.com/micromdm/nanomdm)
