# OpenHat iOS Max Privacy

A `.mobileconfig` plus an audit page covering the four source guides. No Apple Developer certificate and no MDM are required for the default install.

A website **cannot** read iPhone Settings. Live state is only in Settings on the phone. Greyed-out toggles mean the profile owns them.

## Install (no MDM)

1. `python3 serve.py`
2. On the iPhone, open the printed URL **in Safari**.
3. Tap **Install Max Privacy**. In the profile screen tap **More Details**, then Install.
4. Finish leftover taps on `/#audit` (Location, Lockdown Mode, iCloud sync, delete Instagram/Snapchat, …).

Optional files in `profiles/`:

| File | When |
| --- | --- |
| `OpenHat-MaxPrivacy.mobileconfig` | Default. Encrypted DNS (Mullvad Adblock) + every unsupervised restriction. |
| `OpenHat-MaxPrivacy-Quad9.mobileconfig` | Same, Quad9 DNS. Replaces the default (same identifier). |
| `OpenHat-Passcode.mobileconfig` | Optional PIN policy. Separate so a weak PIN cannot block privacy install. |
| `OpenHat-SafariDenyList.mobileconfig` | Safari-only tracker URL deny list (iOS 16+). |
| `OpenHat-Supervised.mobileconfig` | After [Apple Configurator supervision](CONFIGURATOR.md): also hides Instagram, Facebook, Messenger, Snapchat, TikTok, X, Pinterest, Reddit, LinkedIn. **No MDM. No paid Developer Program.** USB + a Mac. Erases the phone. |

Rebuild: `python3 tools/build_profile.py`

## What still needs a tap

Location Services, Lockdown Mode, signing out of iCloud / stripping iCloud app sync, Private Wi-Fi Address, leftover Siri/AirDrop if unsupervised, app permissions, a no-logs VPN, deleting high-tracking apps (or Screen Time → Never Allow).

## MDM (separate branch)

Remote management, InstallProfile, and using OpenHat’s MDM **or** your own NanoMDM live on `feature/mdm`. That path needs an MDM push certificate and a public HTTPS URL. It is not required for the files above.

## Sources

- [paulmillr/encrypted-dns](https://github.com/paulmillr/encrypted-dns)
- [celenityy/ios-settings](https://github.com/celenityy/ios-settings)
- [iPrivacyGuides/iOS-Privacy-Guide](https://github.com/iPrivacyGuides/iOS-Privacy-Guide)
- [danieloz147/ios-profile-builder](https://github.com/danieloz147/ios-profile-builder) (plist assembly only)
- [Apple Restrictions payload](https://developer.apple.com/documentation/devicemanagement/restrictions)
