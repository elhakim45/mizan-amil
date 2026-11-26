// Mengambil harga emas & perak dari situs Logam Mulia Antam memakai Chrome sungguhan
// (harga di situs itu baru muncul setelah JavaScript berjalan, jadi HTTP biasa tidak cukup),
// lalu menulisnya ke berkas JSON yang dibaca aplikasi.
//
// Pemakaian: node scripts/ambil-harga.mjs [berkas-keluaran]   (bawaan: www/harga.json)
import { chromium } from 'playwright-core';
import { renameSync, writeFileSync } from 'node:fs';
import { parseHarga } from './harga-parse.mjs';

const KELUARAN = process.argv[2] || 'www/harga.json';
const ALAMAT = [
  'https://www.logammulia.com/id/harga-emas-hari-ini',
  'https://www.logammulia.com/id',
  'https://www.logammulia.com/',
];
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const catatan = [];
let hasil = null;
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
try {
  const ctx = await browser.newContext({
    userAgent: UA,
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    viewport: { width: 1366, height: 900 },
  });
  const page = await ctx.newPage();
  for (const url of ALAMAT) {
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      catatan.push(`${url} -> HTTP ${resp ? resp.status() : '?'}`);
      await page.waitForFunction(
        () => /Harga\s+Beli\s+Emas[^\d]{0,80}\d/i.test(document.body.innerText),
        null,
        { timeout: 45000 },
      );
      const teks = await page.evaluate(() => document.body.innerText);
      const p = parseHarga(teks);
      if (p.emas) {
        hasil = p;
        break;
      }
      catatan.push('  teks harga ada, tetapi angka emas tidak terbaca');
    } catch (e) {
      catatan.push(`  gagal: ${String(e.message).split('\n')[0]}`);
      try {
        const teks = await page.evaluate(() => document.body.innerText);
        catatan.push('  cuplikan halaman: ' + teks.replace(/\s+/g, ' ').slice(0, 300));
      } catch {}
    }
  }
} finally {
  await browser.close();
}

console.log(catatan.join('\n'));
if (!hasil) {
  console.error('Harga tidak berhasil diambil.');
  process.exit(1);
}

const sekarangWib = new Date(Date.now() + 7 * 3600 * 1000);
const data = {
  emas: hasil.emas,
  perak: hasil.perak,
  buyback: hasil.buyback,
  tgl: hasil.tgl || sekarangWib.toISOString().slice(0, 10),
  upd: hasil.upd,
  diambil: new Date().toISOString(),
  sumber: 'Logam Mulia Antam (logammulia.com)',
};
writeFileSync(KELUARAN + '.tmp', JSON.stringify(data, null, 1) + '\n');
renameSync(KELUARAN + '.tmp', KELUARAN);
console.log('Tersimpan:', JSON.stringify(data));
