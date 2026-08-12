# OpenHat NanoMDM

**This folder is isolated from the default installer.** Route A (`profiles/`) never enrolls a phone in MDM.

MDM is **not** the same as erasing the iPhone:

| Route | Erase? | Supervised? | What MDM adds |
| --- | --- | --- | --- |
| **C — User Enrollment** (Safari, this folder) | **No** | **No** | Push Route A profiles, query, lock. **Cannot** hide Instagram. |
| **D — Prepare + Supervise + MDM** | **Yes** | **Yes** | Everything in C, plus app blocks via `wipe-required/OpenHat-Supervised.mobileconfig`. |

If you only wanted encrypted DNS, stay on `main` and use Route A. Do not run this stack.

You can:

- **Self-host** (`MDM_PROVIDER=self`) — this compose stack, your domain, your push cert.
- **Point at OpenHat** (`MDM_PROVIDER=openhat`) — set `MDM_PUBLIC_URL` to the hosted endpoint when it exists. Same enrollment generator.

## What you must have (cannot be faked in git)

1. **Paid Apple Developer Program** (you are waiting on this) to get an **MDM push certificate** from [identity.apple.com](https://identity.apple.com). See MicroMDM’s [APNs cert notes](https://github.com/micromdm/micromdm/blob/main/docs/user-guide/quickstart.md).
2. A **public HTTPS** hostname (Caddy in this compose uses Let’s Encrypt). Example: `mdm.example.com`.
3. Devices you are allowed to manage. Enrolling someone else’s phone without consent is not supported.

## Quick start (Route C — no wipe)

```bash
cd mdm
cp config.example.env .env
# edit .env — MDM_PUBLIC_URL, secrets, leave PUSH files empty until you have the cert

./bootstrap.sh          # init SCEP CA, start compose
./generate_enrollment.py
# profiles written to mdm/out/OpenHat-MDM-Enroll.mobileconfig

# after you have push.pem + push.key:
./upload_pushcert.sh
# paste the returned Topic into .env as MDM_TOPIC and regenerate enrollment

./enqueue_profile.py ../profiles/OpenHat-MaxPrivacy.mobileconfig --udid DEVICE_UDID
```

Open `https://$MDM_PUBLIC_URL/enroll/` for the enroll page. That enrollment **does not erase** the phone and **does not** supervise it.

## Route D — erase, then MDM

1. Read [`../wipe-required/CONFIGURATOR.md`](../wipe-required/CONFIGURATOR.md). **Prepare erases the iPhone.**
2. In Configurator Prepare, enable **Supervise** and **Automatically enroll in MDM**, pointing at `https://$MDM_PUBLIC_URL/enroll/OpenHat-MDM-Enroll.mobileconfig` (or install that profile after setup).
3. After enrollment:

```bash
./enqueue_profile.py ../wipe-required/OpenHat-Supervised.mobileconfig --udid DEVICE_UDID
```

## Layout

| Path | Role |
| --- | --- |
| `docker-compose.yml` | Caddy (HTTPS) + SCEP :8080 + NanoMDM :9000 |
| `Caddyfile` | TLS termination, `/scep` `/mdm` `/v1` `/enroll` |
| `generate_enrollment.py` | Builds SCEP + MDM payloads from `.env` |
| `enqueue_profile.py` | `InstallProfile` to one device |
| `pki/` `db/` `depot/` | Local secrets — gitignored |

AccessRights default is `8191` (all, including remote wipe). Narrow this in `.env` if you do not want the server to be able to erase the device later.
