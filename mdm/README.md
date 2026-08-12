# OpenHat NanoMDM

Self-hosted Apple MDM using [NanoMDM](https://github.com/micromdm/nanomdm) + [MicroMDM SCEP](https://github.com/micromdm/scep). This branch is **optional**. The default OpenHat profiles on `main` do not enroll the phone in MDM.

You can:

- **Self-host** (`MDM_PROVIDER=self`) — this stack, your domain, your push cert.
- **Point at OpenHat** (`MDM_PROVIDER=openhat`) — set `MDM_PUBLIC_URL` to the hosted endpoint when it exists. Same enrollment generator.

## What you must have (cannot be faked in git)

1. **Paid Apple Developer Program** (you are waiting on this) to get an **MDM push certificate** from [identity.apple.com](https://identity.apple.com). See MicroMDM’s [APNs cert notes](https://github.com/micromdm/micromdm/blob/main/docs/user-guide/quickstart.md).
2. A **public HTTPS** hostname (Caddy in this compose uses Let’s Encrypt). Example: `mdm.example.com`.
3. Devices you are allowed to manage. Enrolling someone else’s phone without consent is not supported.

User Enrollment (Safari install of the enrollment profile) is **not Supervised**. App blocks and most “supervised only” keys still need [Apple Configurator](../CONFIGURATOR.md) or Apple Business Manager. MDM without supervision is mainly: push profiles, query, lock/wipe (if you grant those rights).

## Quick start

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

Open `https://$MDM_PUBLIC_URL/` for the enroll page (Caddy serves `out/` + the privacy installer).

## Layout

| Path | Role |
| --- | --- |
| `docker-compose.yml` | Caddy (HTTPS) + SCEP :8080 + NanoMDM :9000 |
| `Caddyfile` | TLS termination, `/scep` `/mdm` `/v1` |
| `generate_enrollment.py` | Builds SCEP + MDM payloads from `.env` |
| `enqueue_profile.py` | `InstallProfile` to one or all devices |
| `pki/` `db/` `depot/` | Local secrets — gitignored |

AccessRights default is `8191` (all). Narrow this in `.env` if you do not want remote wipe.
