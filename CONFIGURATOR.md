# Supervise without MDM or a paid Developer Program

Apple Configurator on a Mac can mark **your** iPhone as Supervised over USB. That is not MDM. It does not need an Apple Developer certificate. It **erases the phone**.

After supervision, the keys already in `OpenHat-MaxPrivacy.mobileconfig` that currently do nothing (Siri off, AirDrop off, iCloud Drive, host pairing, …) start applying. `OpenHat-Supervised.mobileconfig` also hides Instagram, Facebook, Messenger, Snapchat, TikTok, X, Pinterest, Reddit, and LinkedIn.

## Steps

1. Encrypted Finder backup of the iPhone.
2. Install [Apple Configurator](https://apps.apple.com/app/apple-configurator/id1037126344) on the Mac (free).
3. Connect the iPhone with a cable. Trust the computer.
4. In Configurator: select the device → **Prepare**.
5. Choose **Manual Configuration**. Enable **Supervise devices**. Leave **Automatically enroll in MDM** **off**.
6. Continue. The phone wipes and comes back Supervised.
7. Restore the backup if you want data back, then on the phone install:
   - `profiles/OpenHat-Supervised.mobileconfig` (privacy + app blocks + Safari deny list), or
   - the standard `OpenHat-MaxPrivacy.mobileconfig` if you only want the extra restriction keys, not the app denylist.
8. Confirm **Settings → General → VPN & Device Management**. AirDrop / Siri should now be forced off. Blocked apps disappear from the Home Screen.

## What this still cannot do

- Sign you out of iCloud (do that by hand).
- Flip Location Services or Lockdown Mode (do that by hand).
- Remotely push new profiles later — that is MDM, on the `feature/mdm` branch, and needs a push certificate plus HTTPS.

## Unsupervise

Erase All Content and Settings, or restore a backup from before Prepare. There is no “unsupervise” toggle.
