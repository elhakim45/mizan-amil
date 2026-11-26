# Membuat keystore untuk menandatangani APK Mizan Amil (versi Windows / PowerShell).
# Butuh JDK (perintah keytool). Jalankan SEKALI, lalu simpan berkas .jks di tempat aman:
# keystore yang hilang berarti APK tidak bisa lagi diperbarui di atas versi lama.
#
# Cara menjalankan (dari folder repositori, di PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts\buat-keystore.ps1
param([string]$Alias = "mizanamil")

$ErrorActionPreference = "Stop"
$file = "mizan-amil.jks"

if (Test-Path $file) { throw "$file sudah ada. Pindahkan atau hapus dulu bila ingin membuat yang baru." }
if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
    throw "Perintah 'keytool' tidak ditemukan. Pasang JDK (lihat docs/panduan-kunci-apk.md), tutup lalu buka lagi PowerShell, dan coba lagi."
}

function Baca-Rahasia($pesan) {
    $s = Read-Host $pesan -AsSecureString
    $p = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($p) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p) }
}

$pass  = Baca-Rahasia "Kata sandi keystore (minimal 6 karakter, hindari tanda kutip)"
$pass2 = Baca-Rahasia "Ulangi kata sandi"
if ($pass -ne $pass2) { throw "Kata sandi tidak sama." }
if ($pass.Length -lt 6) { throw "Kata sandi terlalu pendek." }

& keytool -genkeypair -keystore $file -alias $Alias `
    -keyalg RSA -keysize 2048 -validity 10000 `
    -storepass $pass -keypass $pass `
    -dname "CN=Mizan Amil, OU=Prodi HES FAI, O=Universitas Muhammadiyah Surakarta, C=ID"
if ($LASTEXITCODE -ne 0) { throw "keytool gagal membuat keystore (kode $LASTEXITCODE)." }

$jalur = (Resolve-Path $file).Path
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($jalur))
[IO.File]::WriteAllText("$jalur.base64", $b64)

$tersalin = $false
try { Set-Clipboard -Value $b64; $tersalin = $true } catch {}

Write-Host ""
Write-Host "Selesai. Berkas dibuat di folder ini:"
Write-Host "  $file          (SIMPAN di tempat aman, jangan di-commit)"
Write-Host "  $file.base64   (isi untuk secret KEYSTORE_BASE64)"
if ($tersalin) { Write-Host "Isi KEYSTORE_BASE64 sudah disalin ke clipboard: tinggal tempel (Ctrl+V) di GitHub." }
Write-Host ""
Write-Host "Buka GitHub: Settings > Secrets and variables > Actions > New repository secret, lalu isi:"
Write-Host "  KEYSTORE_BASE64    = isi berkas $file.base64"
Write-Host "  KEYSTORE_PASSWORD  = kata sandi yang baru Anda ketik"
Write-Host "  KEY_ALIAS          = $Alias"
Write-Host "  KEY_PASSWORD       = kata sandi yang sama (boleh dikosongkan bila sama)"
