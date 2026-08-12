#!/bin/sh
set -eu
if [ ! -f /depot/ca.pem ]; then
  echo "initializing SCEP CA in /depot"
  scepserver ca -init
fi
exec scepserver -depot /depot -allowrenew 0 -challenge "${SCEP_CHALLENGE:-nanomdm}" -port 8080
