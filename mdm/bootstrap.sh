#!/bin/sh
set -eu
cd "$(dirname "$0")"
if [ ! -f .env ]; then
  echo "copy config.example.env to .env and edit it first" >&2
  exit 1
fi
# shellcheck disable=SC1091
set -a
. ./.env
set +a

mkdir -p depot db pki out
chmod +x scep-entrypoint.sh nanomdm-entrypoint.sh bootstrap.sh upload_pushcert.sh 2>/dev/null || true

echo "starting SCEP + NanoMDM + Caddy"
docker compose up -d --build

echo "generating enrollment profile"
python3 generate_enrollment.py

echo
echo "Next:"
echo "  1. Put APNs push.pem + push.key in mdm/pki/ (after identity.apple.com)"
echo "  2. ./upload_pushcert.sh   # prints MDM_TOPIC — paste into .env"
echo "  3. python3 generate_enrollment.py"
echo "  4. Enroll without erasing — iPhone Safari: https://${MDM_HOSTNAME}/enroll/"
echo "  5. python3 enqueue_profile.py ../profiles/OpenHat-MaxPrivacy.mobileconfig --udid UDID"
echo "  Erase then enroll (ERASES the iPhone): Configurator Prepare+Supervise, then"
echo "  python3 enqueue_profile.py ../wipe-required/OpenHat-Supervised.mobileconfig --udid UDID"
