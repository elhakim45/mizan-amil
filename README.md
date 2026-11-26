# Mizan Amil — Lab Hukum Zakat HES UMS

Kalkulator zakat dan simulasi pengelolaan zakat untuk mata kuliah **Hukum Zakat**, Program Studi Hukum Ekonomi Syariah, Fakultas Agama Islam, Universitas Muhammadiyah Surakarta.

Acuan: Fatwa MUI dan Ijtima Ulama Komisi Fatwa, putusan Munas Tarjih Muhammadiyah, serta SK BAZNAS dan regulasi Kementerian Agama (rinciannya di menu **Rujukan** dalam aplikasi).

## Fitur

- Kalkulator 11 jenis zakat: penghasilan, simpanan, emas & perak (beberapa kadar karat), perdagangan, perusahaan, saham, pertanian, peternakan, rikaz, fitrah, fidyah
- Harga emas & perak dengan sinkronisasi dari Logam Mulia Antam (otomatis di aplikasi Android) dan pengingat sebelum menyimpan
- Penerimaan dengan kwitansi berdoa, penyaluran 8 asnaf dengan batas hak amil, laporan, ekspor CSV, cadangan JSON
- Bisa dipakai tanpa internet setelah dibuka sekali

## Cara memakai

| Bentuk | Cara mendapatkan |
|---|---|
| **Web app** (semua perangkat) | Buka `https://elhakim45.github.io/mizan-amil/`, lalu pilih *Tambahkan ke layar utama* / *Instal aplikasi* di browser |
| **APK Android** | Unduh `MizanAmil-v1.0.x.apk` dari halaman [Releases](../../releases), buka di ponsel, izinkan instalasi dari sumber tidak dikenal |

Data penerimaan dan penyaluran tersimpan di perangkat masing-masing pengguna (cocok untuk latihan mahasiswa). Gunakan *Unduh cadangan (JSON)* di menu Laporan untuk memindahkan data.

## Struktur

```
www/                  aplikasi web (index.html, manifest, service worker, ikon)
assets/               logo sumber untuk ikon & splash Android
capacitor.config.json konfigurasi aplikasi Android (Capacitor)
.github/workflows/    pages.yml (web) dan android.yml (APK)
```

Setiap *push* ke `main` otomatis menerbitkan ulang web app dan membuat rilis APK baru.

## Build lokal (opsional)

Butuh Node.js 20+, JDK 21, dan Android SDK.

```bash
npm install
npx cap add android
npm run icons
npx cap sync android
npm run apk   # hasil: android/app/build/outputs/apk/debug/app-debug.apk
```
