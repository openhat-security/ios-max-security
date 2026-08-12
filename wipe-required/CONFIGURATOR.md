# This erases the iPhone

**This procedure wipes the device.** Every photo, thread, and app that is not in an encrypted backup is gone. Do not start Prepare until that backup exists and you have opened it once to confirm.

After this, restrictions that a Safari profile cannot apply will start working. `OpenHat-Supervised.mobileconfig` in this folder also hides Instagram, Facebook, Messenger, Snapchat, TikTok, X, Pinterest, Reddit, and LinkedIn.

## Steps

1. Encrypted Finder backup of the iPhone. Verify you can see the backup on the Mac.
2. Install [Apple Configurator](https://apps.apple.com/app/apple-configurator/id1037126344) (free).
3. Cable the iPhone. Trust the computer.
4. Select the device → **Prepare**.
5. **Manual Configuration**. Enable **Supervise devices**. Leave MDM enrollment **off**.
6. Continue. The phone **erases** and returns Supervised.
7. Restore the backup if you want data back, then install `OpenHat-Supervised.mobileconfig` from this folder (Safari or Configurator → Add → Profiles).
8. Confirm **Settings → General → VPN & Device Management**. Blocked apps should be gone. AirDrop / Siri should be forced off.

## Unsupervise

Erase All Content and Settings again, or restore a backup from **before** Prepare. There is no unsupervise toggle.
