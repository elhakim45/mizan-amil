#!/usr/bin/env bash
# Membuat keystore untuk menandatangani APK Mizan Amil dan menyiapkan nilai untuk GitHub Secrets.
# Butuh JDK (perintah keytool). Jalankan SEKALI, lalu simpan berkas .jks di tempat aman:
# keystore yang hilang berarti APK tidak bisa lagi diperbarui di atas versi lama.
set -euo pipefail

ALIAS="${1:-mizanamil}"
FILE="mizan-amil.jks"

[ -e "$FILE" ] && { echo "$FILE sudah ada. Pindahkan atau hapus dulu bila ingin membuat baru." >&2; exit 1; }

read -r -s -p "Kata sandi keystore (minimal 6 karakter): " PASS; echo
read -r -s -p "Ulangi kata sandi: " PASS2; echo
[ "$PASS" = "$PASS2" ] || { echo "Kata sandi tidak sama." >&2; exit 1; }
[ "${#PASS}" -ge 6 ] || { echo "Kata sandi terlalu pendek." >&2; exit 1; }

keytool -genkeypair -keystore "$FILE" -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$PASS" -keypass "$PASS" \
  -dname "CN=Mizan Amil, OU=Prodi HES FAI, O=Universitas Muhammadiyah Surakarta, C=ID"

base64 < "$FILE" | tr -d '\n' > "$FILE.base64"

cat <<EOF

Selesai. Berkas dibuat:
  $FILE          (SIMPAN di tempat aman, jangan di-commit)
  $FILE.base64   (isi untuk secret KEYSTORE_BASE64)

Buka GitHub: Settings > Secrets and variables > Actions > New repository secret, lalu isi:
  KEYSTORE_BASE64    = isi berkas $FILE.base64
  KEYSTORE_PASSWORD  = kata sandi yang baru Anda ketik
  KEY_ALIAS          = $ALIAS
  KEY_PASSWORD       = kata sandi yang sama (boleh dikosongkan bila sama)

Push berikutnya ke main akan menghasilkan APK rilis yang bertanda tangan.
EOF
