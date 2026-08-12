# OpenHat Max Privacy for iPhone

Install **OpenHat Max Privacy** on the iPhone. That is the main step. You can stop there.

Built for public **iOS 26** (currently 26.6). See [Supported iOS](#supported-ios).

Everything after that is optional. You can leave off at any green “stop” below. Your photos and apps stay put unless you choose the last step, which **erases the whole iPhone**. Most people never do that last step.

This branch also has a **separate** [remote management](#remote-management) path. Do not mix that chart with the personal setup below.

## Configurations

```mermaid
flowchart TD
  start([Start]) --> s1["1. Install OpenHat Max Privacy in Safari"]
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

  s3["3. Taps only you can do in Settings"]
  s3 --> s3d["A website cannot flip these for you:
Location Services, Lockdown Mode,
iCloud, Private Wi-Fi Address, VPN"]
  s3d --> stop3{Want more, or stop?}
  stop3 -->|Stop| done
  stop3 -->|Tracking apps are still on the phone| s4

  s4["4. Instagram, Snapchat, TikTok, Facebook"]
  s4 --> del["Delete the apps"]
  s4 --> st["Or Settings → Screen Time → Never Allow"]
  del --> done
  st --> done
  s4 --> s5{I want the phone itself to hide them so they cannot come back}

  s5 -->|No — I'm done| done
  s5 -->|Yes — Apple will erase the iPhone| wipe["5. Advanced setup — Apple Configurator"]
  wipe --> hidden["After the wipe: those apps are hidden,
Siri and AirDrop can be forced off"]
```

| Step | What it is | Can you stop after this? | Erases the iPhone? |
| --- | --- | --- | --- |
| **1. OpenHat Max Privacy** | The main install. Private DNS (Mullvad, blocks ads), Apple ads/analytics off, tighter lock screen. | **Yes — recommended stop** | No |
| **2a. Quad9 DNS** | Same as step 1, but DNS from Quad9 instead of Mullvad. One or the other, not both. | Yes | No |
| **2b. Stronger PIN** | An extra install we made. Blocks easy PINs like `123456` and locks the phone immediately. | Yes | No |
| **2c. Safari website block list** | An extra install we made. A list of sites we chose (Facebook, Instagram, Snapchat, TikTok websites, plus ad/tracker pages). Only affects **Safari**. The apps stay. | Yes | No |
| **3. Settings taps** | Things Apple will not let an install change: Location, Lockdown Mode, iCloud, Private Wi-Fi, VPN. Checklist is on the audit page. | Yes | No |
| **4. Tracking apps** | Delete them, or Screen Time → Never Allow. You can undo Screen Time later. | **Yes — last stop that keeps your data** | No |
| **5. Advanced setup** | Apple Configurator on a Mac. **Erases the iPhone.** Supervised restrictions a Safari install cannot apply. | — | **Yes** |

---

## Step 1 — OpenHat Max Privacy

This does **not** erase the iPhone. Stop here if you only wanted private DNS and ads/analytics off.

1. On a computer in this folder, run `python3 serve.py`.
2. On the iPhone, open the printed URL **in Safari** (not Chrome).
3. Tap **Install Max Privacy**. Then **Settings → General → VPN & Device Management → Install**.

Default DNS is Mullvad (Sweden, blocks ads and trackers). Tap **Install with Quad9 DNS** instead if you want Quad9 (Switzerland, blocks malware). Installing Quad9 replaces Mullvad — the phone only uses one.

---

## Step 2 — extras we built (optional)

Skip this whole step if step 1 is enough.

| Button on the installer | What we made | What it does not do |
| --- | --- | --- |
| **Optional: passcode policy** | A stronger PIN rule | Does not erase the phone after wrong guesses |
| **Optional: Safari tracker deny list** | Our list of websites to block **in Safari** (Facebook, Instagram, Snapchat, TikTok sites, DoubleClick, Google Analytics, and similar) | Does not remove the Instagram or Snapchat **apps**. Those still work until you delete them or use Screen Time. |

---

## Step 3 — leftover taps

Open the leftover-taps step in the Safari installer. Check off Location Services, Lockdown Mode, iCloud, Private Wi-Fi Address, and VPN. A website cannot flip those switches for you.

You can stop after this.

---

## Step 4 — tracking apps, still no erase

Instagram, Facebook, Messenger, Snapchat, TikTok, X, Pinterest, Reddit, and LinkedIn are not malware, but they build advertising graphs. Step 1 cannot hide them. Either:

- Delete the apps, or
- **Settings → Screen Time → Content & Privacy Restrictions → Never Allow**

You can stop here. This is the last step that keeps your data.

---

## Step 5 — Advanced setup (erases the iPhone)

**Skip this unless you need Supervised restrictions.** Read [`wipe-required/README.md`](wipe-required/README.md) before you plug in a cable.

A Safari install cannot apply those locks. Apple Configurator **Prepare** supervises the device and **always erases all content and settings**.

After the wipe, install `wipe-required/OpenHat-Supervised.mobileconfig`.

---

## Remote management

This is a **different** path. It is optional. It is not required for any personal step above. Enrolling does **not** erase the phone by itself. Combining stronger locks **with** remote management **does** erase the phone.

```mermaid
flowchart TD
  start[Want the iPhone managed remotely?] --> wipe{Willing to erase the entire iPhone?}

  wipe -->|No — keep my data| enroll[Enroll without erasing]
  wipe -->|Yes — I accept a full wipe| both[Erase, then enroll]

  enroll --> n1[Keeps photos and apps]
  n1 --> n2[A server can push settings, lock the phone]
  n2 --> n3[Cannot hide Instagram or Snapchat]

  both --> y1[ERASES the iPhone]
  y1 --> y2[Stronger locks plus remote management]
  y2 --> y3[Apps can be hidden and the server can still manage the phone]
```

| Setup | Erases the iPhone? | What you get |
| --- | --- | --- |
| **Enroll without erasing** | **No** | Remote push of the personal privacy profile. Instagram stays unless you delete it. |
| **Erase, then enroll** | **Yes** | Stronger locks (app blocks, Siri / AirDrop off) **and** remote management. |

Enroll without erasing: open the enrollment page in Safari on the iPhone (`/enroll/` on your management server).

Erase, then enroll: follow [`wipe-required/CONFIGURATOR.md`](wipe-required/CONFIGURATOR.md), turn **Supervise** on, then enroll. After that the server can install `wipe-required/OpenHat-Supervised.mobileconfig`.

How to run the server: [`mdm/README.md`](mdm/README.md).

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

## Contributing

Bug reports, catalog items, and installer changes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Security reports go through [SECURITY.md](SECURITY.md), not a public issue.

## License

[MIT](LICENSE). Pico CSS in `vendor/` is MIT ([Pico CSS](https://picocss.com)).

## Sources

- [paulmillr/encrypted-dns](https://github.com/paulmillr/encrypted-dns)
- [celenityy/ios-settings](https://github.com/celenityy/ios-settings)
- [iPrivacyGuides/iOS-Privacy-Guide](https://github.com/iPrivacyGuides/iOS-Privacy-Guide)
- [danieloz147/ios-profile-builder](https://github.com/danieloz147/ios-profile-builder)
- [Apple Restrictions payload](https://developer.apple.com/documentation/devicemanagement/restrictions)
- [NanoMDM](https://github.com/micromdm/nanomdm)
