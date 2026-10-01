const fs = require('fs');
const XLSX = require('xlsx');

function num(val) {
  if (val === null || val === undefined || val === '' || val === '-') return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function parseMonth(val) {
  if (!val) return 1;
  const s = String(val).trim().toUpperCase();
  if (s.startsWith('JAN')) return 1;
  if (s.startsWith('FEB')) return 2;
  if (s.startsWith('MAR')) return 3;
  if (s.startsWith('APR')) return 4;
  if (s.startsWith('MEI') || s.startsWith('MAY')) return 5;
  if (s.startsWith('JUN')) return 6;
  if (s.startsWith('JUL')) return 7;
  if (s.startsWith('AGU') || s.startsWith('AUG')) return 8;
  if (s.startsWith('SEP')) return 9;
  if (s.startsWith('OKT') || s.startsWith('OCT')) return 10;
  if (s.startsWith('NOV')) return 11;
  if (s.startsWith('DES') || s.startsWith('DEC')) return 12;
  const n = Number(s);
  return (n >= 1 && n <= 12) ? n : 1;
}

function parseSpreadsheet(data2D) {
  // Check if it's the Dinkes LB-Lansia matrix
  let isDinkesMatrix = false;
  let dataStartRow = -1;

  for (let i = 0; i < Math.min(15, data2D.length); i++) {
    const rowStr = (data2D[i] || []).join(' ').toUpperCase();
    if (rowStr.includes('SASARAN LANSIA') || rowStr.includes('KUNJUNGAN LANSIA') || rowStr.includes('SKRINING')) {
      isDinkesMatrix = true;
    }
    // Check if this row looks like the first data row (e.g., Puskesmas name in col 0 or 1, and Kelurahan in col 1 or 2)
    const col1 = String(data2D[i]?.[1] || '').trim().toLowerCase();
    const col2 = String(data2D[i]?.[2] || '').trim().toLowerCase();
    if (col1 === 'singgani' || col2 === 'bss barat' || (col1 && col2 && num(data2D[i]?.[5]) > 0)) {
      if (dataStartRow === -1) {
        dataStartRow = i;
      }
    }
  }

  console.log('isDinkesMatrix:', isDinkesMatrix, 'dataStartRow:', dataStartRow);

  const parsedRecords = [];
  const errors = [];

  if (isDinkesMatrix && dataStartRow !== -1) {
    let currentPuskesmas = '';
    for (let i = dataStartRow; i < data2D.length; i++) {
      const row = data2D[i] || [];
      const col0 = String(row[0] || '').trim();
      const col1 = String(row[1] || '').trim();
      const col2 = String(row[2] || '').trim();

      if (col0.toLowerCase() === 'total' || col1.toLowerCase() === 'total') {
        break;
      }

      if (col1 !== '') {
        currentPuskesmas = col1;
      }

      // If kelurahan is blank, it's a puskesmas subtotal row
      if (!col2) {
        continue;
      }

      const rawPkm = currentPuskesmas.trim();
      const puskesmas = rawPkm.startsWith('Puskesmas') ? rawPkm : `Puskesmas ${rawPkm}`;
      const kelurahan = col2;
      const bulan = parseMonth(row[4]);
      const tahun = 2026;

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

      const kunjungan45_59 = num(row[21]) || (num(row[19]) + num(row[20])) || (num(row[15]) + num(row[17]));
      const kunjungan60_69 = num(row[29]) || (num(row[27]) + num(row[28])) || (num(row[23]) + num(row[25]));
      const kunjungan70 = num(row[37]) || (num(row[35]) + num(row[36])) || (num(row[31]) + num(row[33]));
      const kunjunganTotal = kunjungan45_59 + kunjungan60_69 + kunjungan70;

      const kunjunganL = (num(row[19]) || num(row[15])) + (num(row[27]) || num(row[23])) + (num(row[35]) || num(row[31]));
      const kunjunganP = (num(row[20]) || num(row[17])) + (num(row[28]) || num(row[25])) + (num(row[36]) || num(row[33]));

      const skriningL = num(row[41]);
      const skriningP = num(row[42]);
      const skriningTotal = num(row[43]) || (skriningL + skriningP);

      const kemandirianA = num(row[46]);
      const kemandirianBRingan = num(row[48]);
      const kemandirianBSedang = num(row[50]);
      const kemandirianCBerat = num(row[52]);
      const kemandirianCTotal = num(row[54]);

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
        id: `import-${tahun}-${bulan}-${puskesmas.replace(/\s+/g, '_')}-${kelurahan.replace(/\s+/g, '_')}`,
        puskesmas,
        kelurahan,
        tahun,
        bulan,
        bulanNama: MONTH_NAMES[bulan - 1] || 'Januari',
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
        lansiaDenganKelainan: lansiaDenganKelainan,
        lansiaKelainanLaki: lansiaKelainanL,
        lansiaKelainanPerempuan: lansiaKelainanP,
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
        kunjunganPantiWreda: 0,
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
        kemandirianCTotal
      });
    }
  }

  return { parsedRecords, errors };
}

// Test with src/data/raw_uploaded_data.csv using XLSX
const fileBuffer = fs.readFileSync('src/data/raw_uploaded_data.csv');
const wb = XLSX.read(fileBuffer, { type: 'buffer' });
const ws = wb.Sheets[wb.SheetNames[0]];
const data2D = XLSX.utils.sheet_to_json(ws, { header: 1 });

const res = parseSpreadsheet(data2D);
console.log('Parsed successfully:', res.parsedRecords.length, 'records');
console.log('Sample record 0:', res.parsedRecords[0]);
console.log('Sample record 0 sasaran:', res.parsedRecords[0].sasaranLansia, 'kunjungan:', res.parsedRecords[0].kunjunganLansia, 'skrining:', res.parsedRecords[0].skriningLansia);
