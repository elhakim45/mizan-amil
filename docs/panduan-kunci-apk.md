# Panduan membuat kunci tanda tangan APK

Panduan ini untuk satu tugas: membuat **keystore** (berkas kunci `.jks`) dan memasukkannya ke GitHub, supaya setiap build APK otomatis **bertanda tangan rilis**. Anda hanya perlu melakukannya satu kali.

## Mengapa perlu

- APK tanpa kunci rilis hanyalah APK *debug*. Bisa dipasang, tetapi tidak cocok dibagikan luas.
- Android hanya mengizinkan sebuah APK **menimpa (memperbarui)** aplikasi lama bila tanda tangannya sama. Kunci yang Anda buat sekarang akan dipakai untuk semua versi berikutnya.
- **Bila kunci hilang, APK baru tidak bisa lagi memperbarui APK lama.** Pengguna harus menghapus aplikasi dan memasang ulang (dan data lokalnya hilang). Jadi simpan cadangannya baik-baik.

## Yang akan Anda hasilkan

| Berkas / data | Fungsi | Disimpan di |
|---|---|---|
| `mizan-amil.jks` | berkas kunci | tempat aman milik Anda (flashdisk, Google Drive pribadi). **Jangan di-commit.** |
| kata sandi | membuka kunci | pengelola kata sandi atau catatan pribadi |
| `mizan-amil.jks.base64` | isi kunci dalam bentuk teks | ditempel ke GitHub Secret `KEYSTORE_BASE64`, lalu boleh dihapus |

## Memilih jalur

Pembuatan kunci memakai program kecil bernama `keytool`, bagian dari **JDK** (Java). Bila Anda tidak ingin memasang JDK, ada tiga alternatif.

| Jalur | Cocok bila | Yang perlu dipasang |
|---|---|---|
| **A. JDK di Windows** | Anda memakai laptop Windows dan tidak keberatan memasang JDK | JDK 21 (sekitar 200 MB) |
| **A2. JDK portabel** | Windows, tidak ingin memasang apa pun secara permanen atau tidak punya hak admin | hanya mengekstrak berkas ZIP |
| **B. GitHub Codespaces** | ingin semuanya di browser, tanpa memasang apa pun | tidak ada (kuota gratis bulanan) |
| **C. Android Studio** | Android Studio sudah terpasang | tidak ada tambahan |
| **D. Termux di ponsel Android** | tidak punya komputer | Termux (gratis) |

> **Jangan** membuat kunci lewat situs generator keystore online, dan jangan membuatnya lewat GitHub Actions di repositori publik ini. Nilai yang dimasukkan atau hasil yang dibuat di sana bisa terlihat oleh orang lain, sehingga kuncinya tidak lagi rahasia.

Apa pun jalurnya, tahap setelah kunci jadi sama: lihat bagian [Memasukkan kunci ke GitHub](#memasukkan-kunci-ke-github).

---

## Jalur A. Windows dengan JDK

### A1. Pasang JDK

1. Buka <https://adoptium.net/temurin/releases/>.
2. Pilih **Operating System: Windows**, **Architecture: x64**, **Package Type: JDK**, **Version: 21 (LTS)**. Unduh berkas **.msi**.
3. Jalankan berkas .msi. Pada layar *Custom Setup* pastikan dua fitur ini berstatus *Will be installed on local hard drive*:
   - **Add to PATH**
   - **Set JAVA_HOME variable**
4. Selesaikan instalasi.
5. **Tutup semua jendela PowerShell lalu buka yang baru**, kemudian cek:

   ```powershell
   keytool -help
   java -version
   ```

   Bila keluar daftar perintah dan nomor versi (21.x), JDK siap. Bila muncul *"keytool is not recognized"*, lihat bagian [Masalah yang sering muncul](#masalah-yang-sering-muncul).

### A2. (Alternatif tanpa instalasi) JDK portabel

1. Dari halaman Temurin yang sama, unduh paket **.zip** (bukan .msi) untuk Windows x64, JDK 21.
2. Ekstrak ke folder mana pun, misalnya `C:\jdk-21`.
3. Di PowerShell, aktifkan **hanya untuk jendela itu**:

   ```powershell
   $env:Path = "C:\jdk-21\bin;" + $env:Path
   keytool -help
   ```

   (Sesuaikan `C:\jdk-21` dengan nama folder hasil ekstrak; di dalamnya ada folder `bin`.) Lanjutkan ke A3 **di jendela PowerShell yang sama**.

### A3. Buat kuncinya

1. Buka <https://github.com/elhakim45/mizan-amil>, klik tombol hijau **Code**, lalu **Download ZIP**. Ekstrak.
2. Buka folder hasil ekstrak di File Explorer (folder yang berisi `README.md` dan folder `scripts`). Klik **kolom alamat** di bagian atas, ketik `powershell`, tekan Enter. PowerShell terbuka tepat di folder itu.
3. Jalankan:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\buat-keystore.ps1
   ```

4. Ketik kata sandi dua kali (minimal 6 karakter, hindari tanda kutip). Pilih sandi yang bisa Anda simpan dengan aman; Anda akan membutuhkannya lagi.
5. Skrip membuat `mizan-amil.jks` dan `mizan-amil.jks.base64` di folder itu, dan **menyalin isi base64 ke clipboard**.

Bila skrip PowerShell bermasalah, pakai perintah manual ini (ganti `SANDI_ANDA`):

```powershell
keytool -genkeypair -keystore mizan-amil.jks -alias mizanamil -keyalg RSA -keysize 2048 -validity 10000 -storepass SANDI_ANDA -keypass SANDI_ANDA -dname "CN=Mizan Amil, OU=Prodi HES FAI, O=UMS, C=ID"

[Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path mizan-amil.jks).Path)) | Set-Clipboard
```

Baris kedua menyalin isi base64 ke clipboard.

---

## Jalur B. GitHub Codespaces (tanpa memasang apa pun)

Codespaces adalah komputer sementara di browser. Akun GitHub gratis mendapat kuota pemakaian bulanan; satu sesi singkat ini jauh di bawah kuota itu.

1. Buka <https://github.com/elhakim45/mizan-amil>, klik **Code**, tab **Codespaces**, lalu **Create codespace on main**. Tunggu editornya terbuka di browser.
2. Di panel **Terminal** bagian bawah, cek keytool:

   ```bash
   keytool -help
   ```

   Bila tidak ditemukan, pasang dulu:

   ```bash
   sudo apt-get update && sudo apt-get install -y default-jre-headless
   ```

3. Buat kuncinya:

   ```bash
   bash scripts/buat-keystore.sh
   ```

   Ketik kata sandi dua kali. File `mizan-amil.jks` dan `mizan-amil.jks.base64` muncul di daftar file sebelah kiri.
4. **Unduh `mizan-amil.jks` ke komputer Anda**: klik kanan file itu di daftar file, pilih **Download...**. Simpan di tempat aman.
5. Ambil isi base64: klik `mizan-amil.jks.base64` agar terbuka, tekan Ctrl+A lalu Ctrl+C. (Isinya satu baris panjang tanpa spasi.)
6. Lanjutkan ke [Memasukkan kunci ke GitHub](#memasukkan-kunci-ke-github) (tempel isi tadi sebagai `KEYSTORE_BASE64`).
7. **Setelah selesai dan setelah .jks tersimpan di komputer Anda**, hapus Codespace-nya: <https://github.com/codespaces>, klik tiga titik pada Codespace, pilih **Delete**. Berkas di dalamnya ikut terhapus, jadi pastikan langkah 4 sudah dilakukan.

Berkas kunci tidak akan ikut ter-commit karena `.gitignore` sudah mengabaikan `*.jks`, `*.keystore`, dan `*.base64`.

---

## Jalur C. Android Studio

Android Studio membawa JDK sendiri, jadi Anda bisa memakainya tanpa memasang JDK terpisah.

**Cara cepat (memakai skrip yang sama).** Di PowerShell, aktifkan keytool bawaan Android Studio untuk jendela itu, lalu jalankan skrip seperti Jalur A3:

```powershell
$env:Path = "C:\Program Files\Android\Android Studio\jbr\bin;" + $env:Path
keytool -help
```

Jika lokasi pemasangan Anda berbeda, cari folder `jbr\bin` di dalam folder Android Studio.

**Cara lewat jendela (tanpa perintah).**

1. Buka proyek apa saja di Android Studio (boleh proyek kosong baru).
2. Menu **Build → Generate Signed App Bundle / APK → APK → Next → Create new...**
3. Isi: *Key store path* (misalnya `mizan-amil.jks`), *Password*, *Alias* `mizanamil`, *Password* kunci, *Validity* `27` tahun atau lebih, dan nama pada *Certificate*. Klik **OK**. Berkas .jks terbuat.
4. Anda tidak perlu melanjutkan membuat APK dari jendela itu; cukup tutup.
5. Ubah .jks menjadi teks di PowerShell (ganti jalurnya):

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\jalur\ke\mizan-amil.jks")) | Set-Clipboard
   ```

6. Catat **alias** dan **kata sandi** yang Anda ketik di langkah 3; keduanya dibutuhkan di GitHub Secrets.

---

## Jalur D. Termux di ponsel Android

1. Pasang **Termux** dari F-Droid (<https://f-droid.org/packages/com.termux/>). Versi di Play Store sudah lama tidak diperbarui, jadi jangan memakainya.
2. Buka Termux, lalu:

   ```bash
   pkg update
   pkg install -y openjdk-21 git
   git clone https://github.com/elhakim45/mizan-amil.git
   cd mizan-amil
   bash scripts/buat-keystore.sh
   ```

   Ketik kata sandi dua kali.
3. Salin berkas ke penyimpanan ponsel agar terlihat aplikasi lain:

   ```bash
   termux-setup-storage        # izinkan akses penyimpanan saat diminta
   cp mizan-amil.jks mizan-amil.jks.base64 ~/storage/downloads/
   ```

4. Buka `mizan-amil.jks.base64` dengan aplikasi pengedit teks apa pun di ponsel, pilih semua, salin. Tempelkan sebagai `KEYSTORE_BASE64` di GitHub lewat browser ponsel (gunakan tampilan *Desktop site* agar menu Settings repositori muncul).
5. Simpan `mizan-amil.jks` dari folder Download ke tempat yang aman (misalnya Google Drive pribadi).

---

## Memasukkan kunci ke GitHub

1. Buka repositori: <https://github.com/elhakim45/mizan-amil>.
2. Klik tab **Settings** (tab paling kanan di baris Code, Issues, Pull requests, Actions...).
3. Di menu kiri: **Secrets and variables → Actions**.
4. Di tab **Secrets**, klik **New repository secret**. Buat empat secret satu per satu (isi **Name**, isi **Secret**, klik **Add secret**):

   | Name | Secret |
   |---|---|
   | `KEYSTORE_BASE64` | isi berkas `mizan-amil.jks.base64` (satu baris panjang; tempel apa adanya) |
   | `KEYSTORE_PASSWORD` | kata sandi keystore yang Anda ketik tadi |
   | `KEY_ALIAS` | `mizanamil` (atau alias yang Anda pilih sendiri di Android Studio) |
   | `KEY_PASSWORD` | kata sandi kunci. Pada skrip di repositori ini sama dengan kata sandi keystore. |

   Nama harus persis sama, termasuk huruf besar dan garis bawah.
5. Picu build baru: buka tab **Actions → Build APK Android → Run workflow** (atau push apa saja ke `main`).

### Memastikan berhasil

- Buka run terbaru, langkah **Tentukan jenis build**. Log-nya harus berbunyi *"Kunci tanda tangan ditemukan: membangun APK rilis bertanda tangan."* (bukan "belum diisi").
- Di halaman **Releases**, catatan rilis menyebut APK sudah ditandatangani, dan ukuran berkasnya kira-kira **4 MB** (APK debug sekitar 9 MB).
- Langkah **Build dan tanda tangani APK rilis** berstatus hijau.

### Beralih dari APK debug ke APK rilis

Tanda tangan APK debug berbeda dengan APK rilis, sehingga Android tidak mau menimpa yang satu dengan yang lain. Pengguna yang sudah memasang APK debug perlu:

1. Membuka menu **Laporan** dan memilih *Unduh cadangan (JSON)*.
2. Menghapus aplikasi Mizan Amil lama.
3. Memasang APK rilis, lalu memakai *Pulihkan dari cadangan*.

Setelah itu, versi-versi berikutnya bisa langsung dipasang di atasnya.

## Masalah yang sering muncul

| Gejala | Penyebab dan cara mengatasi |
|---|---|
| `keytool is not recognized` | JDK belum terpasang atau PATH belum aktif. Tutup lalu buka lagi PowerShell. Pada jalur A2/C, jalankan lagi perintah `$env:Path = ...` di jendela yang sama. |
| `File ... cannot be loaded because running scripts is disabled` | Jalankan skrip dengan `powershell -ExecutionPolicy Bypass -File ...` seperti di panduan. |
| Build gagal: `Keystore was tampered with, or password was incorrect` | Nilai `KEYSTORE_PASSWORD` salah ketik atau mengandung spasi di ujung. Buat ulang secret-nya. |
| Build gagal: `Cannot recover key` atau `alias does not exist` | `KEY_ALIAS` atau `KEY_PASSWORD` tidak cocok. Cek alias yang tercetak saat kunci dibuat. |
| Build gagal membaca keystore (`Invalid keystore format`) | `KEYSTORE_BASE64` terpotong atau berisi baris baru/spasi. Salin ulang seluruh isi `.base64` dalam satu kali Ctrl+A, Ctrl+C. |
| Log menulis "belum diisi: membangun APK debug" | Secret `KEYSTORE_BASE64` belum ada atau namanya salah ketik. |
| Pengguna gagal memperbarui: "aplikasi tidak terpasang" / konflik paket | Tanda tangan berbeda (debug lawan rilis, atau kunci baru). Ikuti langkah *beralih* di atas. |
