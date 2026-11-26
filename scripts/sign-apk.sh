#!/usr/bin/env bash
# Menandatangani APK rilis: zipalign, apksigner, lalu verifikasi.
#
# Pemakaian:
#   KEYSTORE_FILE=mizan-amil.jks KEYSTORE_PASSWORD=... KEY_ALIAS=mizanamil [KEY_PASSWORD=...] \
#     scripts/sign-apk.sh <apk-belum-bertanda-tangan> <apk-hasil>
set -euo pipefail

IN="${1:?apk masukan belum diisi}"
OUT="${2:?apk keluaran belum diisi}"
: "${KEYSTORE_FILE:?KEYSTORE_FILE belum diisi}"
: "${KEYSTORE_PASSWORD:?KEYSTORE_PASSWORD belum diisi}"
: "${KEY_ALIAS:?KEY_ALIAS belum diisi}"
export KEYSTORE_PASSWORD
export KEY_PASSWORD="${KEY_PASSWORD:-$KEYSTORE_PASSWORD}"

SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
[ -d "$SDK/build-tools" ] || { echo "Android SDK (build-tools) tidak ditemukan di '$SDK'" >&2; exit 1; }
BT="$(ls -d "$SDK"/build-tools/* | sort -V | tail -1)"

ALIGNED="$(mktemp -u).apk"
trap 'rm -f "$ALIGNED" "$OUT.idsig"' EXIT

"$BT/zipalign" -f -p 4 "$IN" "$ALIGNED"
"$BT/apksigner" sign \
  --ks "$KEYSTORE_FILE" --ks-key-alias "$KEY_ALIAS" \
  --ks-pass env:KEYSTORE_PASSWORD --key-pass env:KEY_PASSWORD \
  --out "$OUT" "$ALIGNED"
"$BT/apksigner" verify --verbose "$OUT"
echo "APK bertanda tangan: $OUT"
