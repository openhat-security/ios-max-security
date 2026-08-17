<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Let's go with the detailed README section with all the citations

Here’s a full, detailed README section you can drop into your project. It keeps your voice, adds the legal/opt‑out backbone, and ties everything to Apple’s own policies, U.S. law, and the “data can be bought” narrative—with inline citations.

***

# OpenHat Max Privacy for iPhone — Detailed Background \& Citations

> **Note:** This section is written to be publishable as a short paper or long README intro. You can trim it later for the final app page.

***

## Before you start: why this matters

<details>
<summary>Why is this important?</summary>

Even for apps that claim to be secure—Telegram, Signal, Proton, etc.—a lot of their data can still touch Apple’s servers. If you use **iCloud Backup**, your backup can include app data, messages, photos, and more, depending on your settings. [Apple] Apple’s **iCloud Terms** explicitly say that when you sign in to certain third‑party apps with your iCloud credentials, you “agree to allow that app to store data in your personal iCloud account and for **Apple to collect, store and process such data on behalf of the relevant third‑party app developer**.” [Apple][^1][^2]

On newer iOS releases, Apple leans harder into “personalization” and “convenience.” Its **Privacy Policy** (updated July 30, 2025) lists as “Usage Data”: “app launches within our services, including **browsing history; search history; product interaction; crash data, performance and other diagnostic data**; and other usage data.” [Apple] It also collects **coarse location**, device identifiers (including serial numbers that can make your device identifiable), and more—all to “power our services,” “improve our offerings,” and “personalize your experience.” [Apple][^3]

Apple says it doesn’t sell your personal data and doesn’t share it with third parties for *their* marketing. [Apple] But Apple also says it may disclose information about you if it determines that for purposes of **national security, law enforcement, or other issues of public importance**, disclosure is necessary or appropriate—and it publishes a **Transparency Report** on government requests for customer data. [Apple][^4][^5][^3]

Meanwhile, U.S. privacy law already assumes companies build profiles on you—and gives you (in some states) a legal right to opt out of the “sale” or “sharing” of that data. In California, the **CCPA/CPRA** gives consumers the right to direct businesses to **stop selling or sharing their personal information**, and requires a clear “Do Not Sell or Share My Personal Information” mechanism. [cppa.ca.gov][^6][^7][^8]

So: yes, your iPhone is part of a system that profiles you. Yes, there are opt‑out rights (especially in California). And yes, that same commercial data ecosystem is one that government agencies can and do tap into via data brokers—without a warrant. [NPR][^9][^10][^11]

</details>

***

## The legal backbone: you *do* have opt‑out rights (U.S.)

You don’t have to take my word for it. U.S. privacy law now explicitly treats “AI‑style profiling” as a commercial reality—and gives you rights around it.

### California: CCPA/CPRA “Do Not Sell or Share”

- The **California Consumer Privacy Act (CCPA)**, as updated by the **CPRA**, gives California consumers the right to **opt out of the “sale” or “sharing”** of their personal information, including for cross‑context behavioral advertising. [cppa.ca.gov][^7][^8][^6]
- Covered businesses must provide a **clear, conspicuous link** such as **“Do Not Sell or Share My Personal Information”** (or a consolidated “Your Privacy Choices”) and must honor **global opt‑out signals** like **Global Privacy Control (GPC)**. [cppa.ca.gov][^12][^6][^7]
- Once you opt out, they **cannot ask you to opt back in for at least 12 months**, and as of 2026 they must **confirm** that your opt‑out was processed (no more silent acceptance). [cppa.ca.gov][^13][^7][^12]

In plain English: California law assumes companies *are* selling/sharing your data and building profiles—and forces them to give you a working “no” button. [cppa.ca.gov][^8][^7]

### FTC and “commercial surveillance”

- The **FTC** has been ramping up enforcement around **commercial surveillance**, AI profiling, and deceptive data practices, including major actions against big tech for privacy and data‑use abuses. [anonym.legal][^14]
- While there isn’t yet a single federal “opt out of all profiling” law, the FTC’s stance is clear: **automated profiling and behavioral targeting are surveillance‑like practices** that can be unfair or deceptive if hidden or misrepresented. [anonym.legal][^14]

So when people say “they’re building an AI profile on you,” the law is already catching up: regulators treat this as **commercial surveillance** that needs limits and transparency. [anonym.legal][cppa.ca.gov][^7][^14]

***

## Apple’s own paperwork: what they admit they collect

Apple’s global **Privacy Policy** (updated July 30, 2025) is surprisingly candid.

### What Apple says it collects

Apple lists, among other things:

- **Usage Data**: “app launches within our services, including **browsing history; search history; product interaction; crash data, performance and other diagnostic data**; and other usage data.” [Apple][^3]
- **Location Information**: “Precise location only to support services such as Find My or where you agree… and **coarse location**.” [Apple][^3]
- **Device Information**: serial numbers and other identifiers that can make your device “identifiable.” [Apple][^3]

They say this is to “power our services,” “improve our offerings,” and for “personalization.” [Apple] That’s corporate‑speak for: **we build a behavioral picture of how you use your devices and services.**[^3]

### Apple’s “we don’t sell your data” line

Apple explicitly states:

> “Apple does not sell your personal data including as ‘sale’ is defined in Nevada and California. Apple also does not ‘share’ your personal data as that term is defined in California.” [Apple][^3]

That’s good. But note the rest of the sentence in their policy:

> “We may also disclose information about you if we determine that for purposes of **national security, law enforcement, or other issues of public importance**, disclosure is necessary or appropriate.” [Apple][^3]

And they publish a **Transparency Report** on government requests for customer data. [Apple][^5][^4]

So: no, Apple doesn’t sell your data to advertisers. But yes, they **do** disclose data to governments under certain legal processes—and they say so in their own policy. [Apple][^4][^5][^3]

***

## “But I use Signal/Telegram—they’re secure, right?”

Here’s the uncomfortable part: **end‑to‑end encryption in the app doesn’t mean nothing touches Apple.**

### iCloud backups and third‑party app data

Apple’s **iCloud Terms** say:

> “If you sign in to certain third party apps with your iCloud credentials, you agree to allow that app to store data in your personal iCloud account and for **Apple to collect, store and process such data on behalf of the relevant third‑party app developer**…” [Apple][^2]

That means:

- If you allow **iCloud Backup**, your backup can include app data, messages, photos, etc., depending on the app and your settings. [Apple][^1]
- With **Standard Data Protection**, some iCloud data (including certain message backups) can be accessible to Apple under legal process; with **Advanced Data Protection**, more categories become end‑to‑end encrypted so Apple *cannot* produce the content. [Apple][^5][^1]
- Third‑party app data stored via **CloudKit** or iCloud is encrypted in transit and on server, but Apple still “collects, stores and processes” it on the developer’s behalf. [Apple][^2][^1]

So even if Signal/Telegram encrypt messages in transit, **if their data lands in your iCloud backup or uses Apple‑hosted storage, Apple is part of the chain**—and can respond to lawful government requests for that data. [Apple][^1][^5]

### Government requests and Apple’s Transparency Report

Apple’s **U.S. Transparency Report** page explains they disclose how many government requests they receive and how they respond. [Apple] Independent analyses of Apple’s reporting show categories like:[^4]

- **Account Requests** (basic subscriber info),
- **Content Requests** (photos, emails, backups, contacts, calendars),
- **U.S. National Security Requests** (classified counts). [Apple][^5]

Apple also notes:

> “iMessage message content in transit is E2EE and not decryptable by Apple. iCloud Backups under Standard Data Protection may include the Messages in iCloud key and are producible; with ADP enabled, Apple cannot produce Messages in iCloud content.” [Apple][^5]

Translation: if you’re on standard iCloud, some message content *can* be produced under legal process; if you enable **Advanced Data Protection**, Apple says it *cannot* produce that content. [Apple][^1][^5]

***

## “So the government just buys data instead of getting a warrant?”

Yes—through the **data broker loophole**.

Multiple investigations and reporting show:

- **Data brokers** collect massive amounts of information from phones and browsers (location, browsing, app usage, demographics) to sell for **targeted advertising**. [NPR][^15][^9]
- The **same industry sells that data to the government**, including agencies like **ICE, CBP, DHS, FBI, DoD**, often **without a warrant**. [NPR][^10][^11][^16][^9]
- Civil liberties groups (ACLU, CDT, EFF, POGO, etc.) have published letters and reports calling this the **“data broker loophole”** and urging Congress to ban government purchases of Americans’ sensitive data. [Brennan Center][^17][^18][^19][^10]

One NPR headline says it plainly:

> “Your data is everywhere. The government is buying it up.” [NPR][^9]

And the Brennan Center summarizes:

> “A glaring loophole in current law allows law enforcement and government intelligence agencies to pay third party data brokers to gain access to your private [data].” [Brennan Center][^19]

This is the missing link in most people’s mental model: **you don’t need to be a spy agency to get dossiers on people; you just need a budget and a vendor.** [NPR][^11][^10][^9]

***

## “But I clicked ‘Allow’ in some 500‑page Terms and Conditions…”

Exactly. Almost no one reads the full **Apple Media Services Terms**, **iCloud Terms**, or **Privacy Policy** before tapping “Agree.” And they’re not designed to be read cover‑to‑cover; they’re designed to:

- Give Apple **broad permission** to collect and process data for “services,” “security,” “fraud prevention,” “personalization,” and “compliance with law.” [Apple][^2][^3]
- Reserve the right to disclose data for **national security and law enforcement**. [Apple][^3]
- Let third‑party apps **store data in your iCloud**, with Apple processing it on their behalf. [Apple][^2]

Legally, that click is your “consent.” Practically, it’s a **take‑it‑or‑leave‑it wall of text** that almost nobody understands. That’s why state laws like the CCPA matter: they say, “Even if you ‘agreed,’ you still get a real **opt out of sale/sharing**.” [cppa.ca.gov][^6][^7]

***

## How OpenHat Max Privacy fits into this

This project doesn’t pretend to “fix” the entire system. It does three concrete things:

1. **Cuts off a lot of third‑party tracking at the network layer** (private DNS that blocks ads/trackers, Apple analytics and personalized ads off, tighter lock screen).
2. **Makes it harder for the worst profiling apps to run** (Safari block list for Facebook/Instagram/TikTok/etc., plus guidance to delete or Screen‑Time‑block the apps).
3. **Gives you a path to a much harder device posture** (Lockdown Mode, optional supervised setup with Apple Configurator that can hide apps and restrict features).

None of this stops Apple from collecting the data it says it needs to “power services.” But it does:

- Reduce how much **third‑party ad tech** can see you.
- Reduce how much **Meta/Instagram/TikTok** can directly observe your behavior on that device.
- Make it more annoying (and in some setups, impossible) for casual profiling apps to stay installed.

And it lines up with the spirit of laws like the CCPA: **you should have meaningful controls, not just a 500‑page contract you “agreed” to.** [cppa.ca.gov][^6][^7]

***

## Suggested “Before” section text (ready to paste)

You can drop this near the top of your README, before the flowchart:

```markdown
## Before you start: why this matters

<details>
<summary>Why is this important?</summary>

Even for apps that claim to be secure—Telegram, Signal, Proton, etc.—a lot of their data can still touch Apple’s servers (iCloud backups, CloudKit, push tokens, analytics). Apple’s own iCloud terms say third‑party apps can store data in your iCloud, and Apple will “collect, store and process such data on behalf of the relevant third‑party app developer.” [Apple][^62]

On newer iOS releases, Apple leans harder into “personalization” and “convenience”: usage data, search history, app interaction, diagnostics, and coarse location are all listed as data Apple collects to “power our services,” “improve our offerings,” and “personalize your experience.” [Apple][^44]

Apple says it doesn’t sell your personal data and doesn’t share it with third parties for their marketing. [Apple][^44] But Apple does disclose data for “national security, law enforcement, or other issues of public importance,” and publishes a Transparency Report on government requests. [Apple][^44][^45][^70]

Meanwhile, U.S. privacy law already assumes companies build profiles on you—and gives you (in some states) a legal right to opt out of the “sale” or “sharing” of that data. In California, the CCPA/CPRA gives consumers the right to direct businesses to stop selling or sharing their personal information, and requires a clear “Do Not Sell or Share My Personal Information” mechanism. [cppa.ca.gov][^47][^55][^57]

So: yes, your iPhone is part of a system that profiles you. Yes, there are opt‑out rights (especially in California). And yes, that same commercial data ecosystem is one that government agencies can and do tap into via data brokers—without a warrant. [NPR][^1][^5][^26]

</details>
```


***

If you want, I can next:

- Convert this into a tighter “paper” version with abstract, methods, and limitations, or
- Generate a shorter, punchier “manifesto” README that leans harder into the surveillance angle while staying within what the sources actually support.

<div align="center">⁂</div>

[^1]: https://support.apple.com/en-us/102651

[^2]: https://www.apple.com/legal/internet-services/icloud/

[^3]: https://www.apple.com/legal/privacy/en-ww/

[^4]: https://www.apple.com/legal/transparency/us.html

[^5]: https://caty.ee/reports/2026-q2/

[^6]: https://cppa.ca.gov/announcements/2025/20250909.html

[^7]: https://privacyautomated.ai/articles/ccpa-opt-out-implementation-guide.html

[^8]: https://www.lawincalifornia.com/consumer-rights/california-consumer-privacy-act-ccpa-guide/

[^9]: https://www.npr.org/2026/03/25/nx-s1-5752369/ice-surveillance-data-brokers-congress-anthropic

[^10]: https://www.brennancenter.org/our-work/research-reports/congress-must-close-data-broker-loophole-prohibiting-government-0

[^11]: https://leakcheckme.com/blog/government-data-broker-loophole

[^12]: https://www.gtlaw.com/en/insights/2025/9/revised-and-new-ccpa-regulations-set-to-take-effect-on-jan-1-2026-summary-of-near-term-action-items

[^13]: https://secureprivacy.ai/blog/ccpa-requirements-2026-complete-compliance-guide

[^14]: https://anonym.legal/blog/ftc-us-ai-privacy-section5-enforcement-2025

[^15]: https://www.protegrity.com/blog/the-hidden-market-for-your-personal-data/

[^16]: https://www.aclu.org/news/privacy-technology/dhs-is-circumventing-constitution-by-buying-data-it-would-normally-need-a-warrant-to-access

[^17]: https://cdt.org/insights/section-702-reauthorization-must-close-the-data-broker-loophole/

[^18]: https://www.citizen.org/wp-content/uploads/ACLU_PC_SJC_HSGAC_ThomsonReuters_8.12.26.pdf

[^19]: https://www.pogo.org/fact-sheets/fact-sheet-closing-the-data-broker-loophole

