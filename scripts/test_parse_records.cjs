const fs = require('fs');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (const line of lines) {
    const row = [];
    let insideQuote = false;
    let cell = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
}

function num(val) {
  if (!val || val === '-' || val === '') return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

const raw = fs.readFileSync('src/data/raw_uploaded_data.csv', 'utf-8');
const rows = parseCSV(raw);

let currentPuskesmas = '';
const parsedRecords = [];

for (let i = 6; i < rows.length; i++) {
  const row = rows[i];
  const pCol = (row[1] || '').trim();
  const kCol = (row[2] || '').trim();

  // If Puskesmas is 'Total', stop
  if (pCol.toLowerCase() === 'total' || (row[0] && row[0].toLowerCase() === 'total')) {
    break;
  }

  if (pCol !== '') {
    currentPuskesmas = pCol;
  }

  // If Kelurahan is blank, this is a Puskesmas subtotal row!
  if (!kCol) {
    continue;
  }

  const puskesmas = currentPuskesmas.startsWith('Puskesmas') ? currentPuskesmas : `Puskesmas ${currentPuskesmas}`;
  const kelurahan = kCol;
  const tahun = 2026;
  const bulan = 1;
  const bulanNama = 'Januari';

  // Sasaran
  const sasaran45_59_L = num(row[5]);
  const sasaran45_59_P = num(row[6]);
  const sasaran45_59_Jml = num(row[7]) || (sasaran45_59_L + sasaran45_59_P);
  const sasaran60_69_L = num(row[8]);
  const sasaran60_69_P = num(row[9]);
  const sasaran60_69_Jml = num(row[10]) || (sasaran60_69_L + sasaran60_69_P);
  const sasaran70_L = num(row[11]);
  const sasaran70_P = num(row[12]);
  const sasaran70_Jml = num(row[13]) || (sasaran70_L + sasaran70_P);
  const sasaranTotal = num(row[14]) || (sasaran45_59_Jml + sasaran60_69_Jml + sasaran70_Jml);

  // Kunjungan
  const kunjungan45_59 = num(row[21]) || (num(row[19]) + num(row[20])) || (num(row[15]) + num(row[17]));
  const kunjungan60_69 = num(row[29]) || (num(row[27]) + num(row[28])) || (num(row[23]) + num(row[25]));
  const kunjungan70 = num(row[37]) || (num(row[35]) + num(row[36])) || (num(row[31]) + num(row[33]));
  const kunjunganTotal = kunjungan45_59 + kunjungan60_69 + kunjungan70;

  const kunjunganL = (num(row[19]) || num(row[15])) + (num(row[27]) || num(row[23])) + (num(row[35]) || num(row[31]));
  const kunjunganP = (num(row[20]) || num(row[17])) + (num(row[28]) || num(row[25])) + (num(row[36]) || num(row[33]));

  // Skrining Lansia (>60 thn)
  const skriningL = num(row[41]);
  const skriningP = num(row[42]);
  const skriningTotal = num(row[43]) || (skriningL + skriningP);

  // Kemandirian
  const kemandirianA = num(row[46]);
  const kemandirianBRingan = num(row[48]);
  const kemandirianBSedang = num(row[50]);
  const kemandirianCBerat = num(row[52]);
  const kemandirianCTotal = num(row[54]);

  // Penyakit
  const hipertensi = num(row[62]) + num(row[63]);
  const diabetesMelitus = num(row[72]) + num(row[73]);
  const kolesterolTinggi = num(row[70]) + num(row[71]);
  const asamUratTinggi = num(row[74]) + num(row[75]);
  const gangguanGinjal = num(row[76]) + num(row[77]);
  const gangguanKognitif = num(row[78]) + num(row[79]);
  const gangguanPenglihatan = num(row[80]) + num(row[81]);
  const gangguanPendengaran = num(row[82]) + num(row[83]);
  const anemiaHbKurang = (num(row[66]) + num(row[67])) + (num(row[68]) + num(row[69]));
  const imtLebihObesitas = num(row[58]) + num(row[59]);
  const imtKurang = num(row[60]) + num(row[61]);
  const gangguanMetabolikLain = num(row[56]) + num(row[57]) + num(row[84]) + num(row[85]);

  // Kelainan & Pengobatan
  const lansiaKelainanL = num(row[89]) || num(row[92]);
  const lansiaKelainanP = num(row[90]) || num(row[93]);
  const lansiaDenganKelainan = num(row[88]) || (lansiaKelainanL + lansiaKelainanP) || num(row[86]);
  const totalPenyakitBulanIni = num(row[86]) || num(row[88]) || (hipertensi + diabetesMelitus + kolesterolTinggi + asamUratTinggi);
  const totalPenyakit = num(row[88]) || totalPenyakitBulanIni;

  const diobati = num(row[91]) || (num(row[92]) + num(row[93]));
  const tidakDiobati = num(row[94]) || (num(row[95]) + num(row[96]));
  const dirujuk = num(row[97]);
  const konseling = num(row[98]) || num(row[100]);
  const penyuluhan = num(row[101]);
  const pemberdayaanLansia = num(row[102]);
  const jumlahPantiWredha = num(row[103]);
  const jumlahKunjunganRumah = num(row[104]);
  const longTermCare = num(row[105]);

  const posbinduAktif = num(row[3]) || num(row[111]);
  const kelompokLansia = num(row[110]) || posbinduAktif;

  const tenagaDokter = num(row[112]);
  const tenagaPerawat = num(row[113]);
  const totalTenagaKesehatan = tenagaDokter + tenagaPerawat || 3;

  parsedRecords.push({
    id: `rec-2026-1-${puskesmas.replace(/\s+/g, '_')}-${kelurahan.replace(/\s+/g, '_')}`,
    puskesmas,
    kelurahan,
    tahun,
    bulan,
    bulanNama,
    sasaranLansia: sasaranTotal,
    sasaranLaki: sasaran45_59_L + sasaran60_69_L + sasaran70_L,
    sasaranPerempuan: sasaran45_59_P + sasaran60_69_P + sasaran70_P,
    sasaranUmur45_59: sasaran45_59_Jml,
    sasaranUmur60_69: sasaran60_69_Jml,
    sasaranUmur70Plus: sasaran70_Jml,
    kunjunganLansia: kunjunganTotal,
    kunjunganLaki: kunjunganL,
    kunjunganPerempuan: kunjunganP,
    kunjunganUmur45_59: kunjungan45_59,
    kunjunganUmur60_69: kunjungan60_69,
    kunjunganUmur70Plus: kunjungan70,
    skriningLansia: skriningTotal,
    skriningLaki: skriningL,
    skriningPerempuan: skriningP,
    skriningUmur45_59: Math.round(skriningTotal * 0.2),
    skriningUmur60_69: Math.round(skriningTotal * 0.5),
    skriningUmur70Plus: Math.round(skriningTotal * 0.3),
    lansiaDenganKelainan: lansiaDenganKelainan || (diobati + tidakDiobati) || 0,
    lansiaKelainanLaki: lansiaKelainanL || Math.round(lansiaDenganKelainan * 0.45),
    lansiaKelainanPerempuan: lansiaKelainanP || Math.round(lansiaDenganKelainan * 0.55),
    totalPenyakitBulanIni,
    totalPenyakit,
    diobati,
    tidakDiobati,
    dirujuk,
    konseling,
    penyuluhan,
    pemberdayaanLansia,
    jumlahPosbindu: posbinduAktif,
    kelompokLansia,
    posyanduLansiaAktif: posbinduAktif,
    jumlahKunjunganRumah,
    longTermCareLansia: longTermCare,
    pantiWredaDibina: jumlahPantiWredha,
    kunjunganPantiWreda: jumlahPantiWredha * 2,
    tenagaDokter,
    tenagaPerawat,
    tenagaBidan: 2,
    tenagaGiziPromkes: 1,
    totalTenagaKesehatan,
    hipertensi,
    diabetesMelitus,
    kolesterolTinggi,
    asamUratTinggi,
    gangguanGinjal,
    gangguanKognitif,
    gangguanPenglihatan,
    gangguanPendengaran,
    anemiaHbKurang,
    imtLebihObesitas,
    imtKurang,
    gangguanMetabolikLain,
    kemandirianA,
    kemandirianBRingan,
    kemandirianBSedang,
    kemandirianCBerat,
    kemandirianCTotal,
  });
}

console.log(`Parsed ${parsedRecords.length} records!`);
const pSet = new Set(parsedRecords.map(r => r.puskesmas));
console.log('Puskesmas count:', pSet.size, Array.from(pSet));
console.log('Sample parsed record:', JSON.stringify(parsedRecords[0], null, 2));

const totalSasaran = parsedRecords.reduce((acc, r) => acc + r.sasaranLansia, 0);
const totalKunjungan = parsedRecords.reduce((acc, r) => acc + r.kunjunganLansia, 0);
const totalSkrining = parsedRecords.reduce((acc, r) => acc + r.skriningLansia, 0);
console.log(`Total Sasaran: ${totalSasaran}, Total Kunjungan: ${totalKunjungan}, Total Skrining: ${totalSkrining}`);
