#!/bin/sh
set -eu
CA=/pki/scep-ca.pem
mkdir -p /pki /db
if [ ! -f "$CA" ]; then
  echo "fetching SCEP CA from http://scep:8080"
  i=0
  while [ "$i" -lt 30 ]; do
    if curl -fsS "http://scep:8080/scep?operation=GetCACert" | openssl x509 -inform DER -out "$CA" 2>/dev/null; then
      break
    fi
    i=$((i + 1))
    sleep 2
  done
fi
if [ ! -f "$CA" ]; then
  echo "no SCEP CA found; cannot start NanoMDM" >&2
  exit 1
fi
exec nanomdm -ca "$CA" -api "${NANOMDM_API_KEY:-nanomdm}" -storage file -storage-dsn /db -listen :9000
