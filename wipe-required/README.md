# This folder erases the iPhone

**Stop.** Nothing in `wipe-required/` can be applied on a phone you want to keep as-is.

Apple only unlocks Supervised restrictions (hide Instagram/Snapchat, force Siri and AirDrop off, host pairing off, …) after the device is **Supervised**. The only one-person way to do that without MDM is Apple Configurator **Prepare**, and **Prepare erases all content and settings**.

- Encrypted Finder backup first.
- This is **not** MDM and does **not** need a paid Developer Program.
- If you only wanted encrypted DNS and ads off, go back to `profiles/` (Route A). That path does **not** wipe.

## After you accept the wipe

Follow [CONFIGURATOR.md](CONFIGURATOR.md), then install:

`OpenHat-Supervised.mobileconfig`

That profile is isolated here on purpose so it cannot be mixed up with the Safari-install files in `../profiles/`.
