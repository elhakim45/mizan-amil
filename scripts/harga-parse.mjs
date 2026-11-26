// Membaca harga emas & perak dari teks halaman Logam Mulia Antam.
// Dipakai oleh scripts/ambil-harga.mjs (dan bisa diuji tanpa peramban).

const ANGKA = '(\\d{1,3}(?:[.,]\\d{3})+)';
const BULAN = {
  januari: 1, january: 1, februari: 2, february: 2, maret: 3, march: 3, april: 4,
  mei: 5, may: 5, juni: 6, june: 6, juli: 7, july: 7, agustus: 8, august: 8,
  september: 9, oktober: 10, october: 10, november: 11, desember: 12, december: 12,
};

const digits = (s) => Number(String(s).replace(/[^\d]/g, ''));

export function parseTanggal(s) {
  const m = String(s).match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  const bln = BULAN[m[2].toLowerCase()];
  if (!bln) return null;
  return `${m[3]}-${String(bln).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
}

export function parseHarga(teks) {
  const t = String(teks).replace(/ /g, ' ');
  const ambil = (label) => {
    const m = t.match(new RegExp(label + '[^\\d]{0,80}?' + ANGKA, 'i'));
    return m ? digits(m[1]) : null;
  };
  const dalam = (n, min, max) => (n && n >= min && n <= max ? n : null);

  const emas = dalam(ambil('Harga\\s+Beli\\s+Emas'), 500000, 20000000);
  const perak = dalam(ambil('Harga\\s+Beli\\s+Perak'), 1000, 1000000);
  const buyback = dalam(ambil('Harga\\s+Jual\\s+Emas'), 300000, 20000000);

  const u = t.match(/(?:Terakhir diperbarui|Last updated)\s*:?\s*([^\n|]{3,40}?)\s*\|\s*(\d{1,2}[.:]\d{2})\s*WIB/i);
  return {
    emas,
    perak,
    buyback,
    upd: u ? `${u[1].replace(/\\/g, '').trim()} | ${u[2]} WIB` : '',
    tgl: u ? parseTanggal(u[1]) : null,
  };
}
