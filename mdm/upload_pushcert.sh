#!/bin/sh
set -eu
cd "$(dirname "$0")"
# shellcheck disable=SC1091
set -a
. ./.env
set +a
CERT="${PUSH_CERT_PEM:-pki/push.pem}"
KEY="${PUSH_CERT_KEY:-pki/push.key}"
if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
  echo "missing $CERT or $KEY" >&2
  echo "Create an MDM push certificate at https://identity.apple.com then PEM-encode cert+key." >&2
  exit 1
fi
# NanoMDM is not published on the host by default; use docker exec.
cat "$CERT" "$KEY" | docker compose exec -T nanomdm \
  sh -c "cat | curl -sS -T - -u nanomdm:${NANOMDM_API_KEY} http://127.0.0.1:9000/v1/pushcert"
echo
echo "Put the returned topic into MDM_TOPIC in .env, then: python3 generate_enrollment.py"
