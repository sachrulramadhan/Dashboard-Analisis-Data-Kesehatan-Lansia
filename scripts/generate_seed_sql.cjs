const fs = require('fs');
const path = require('path');

// Baca userRealDataset.ts
const filePath = path.resolve(__dirname, '..', 'src', 'data', 'userRealDataset.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Extract array
const jsonStart = content.indexOf('[');
const jsonEnd = content.lastIndexOf(']');
if (jsonStart === -1 || jsonEnd === -1) {
  console.error('Tidak dapat menemukan array JSON di userRealDataset.ts');
  process.exit(1);
}

const rawArray = content.substring(jsonStart, jsonEnd + 1);
const records = JSON.parse(rawArray);

console.log(`Menemukan ${records.length} rekam data riil.`);

const escapeStr = (str) => {
  if (str === null || str === undefined) return "''";
  return `'${String(str).replace(/'/g, "''")}'`;
};

const num = (v) => (Number.isFinite(v) ? Number(v) : 0);

const sqlLines = [];
sqlLines.push('-- ====================================================================');
sqlLines.push('-- Seed Data Awal Cloudflare D1: Data Riil LB-Lansia Kota Palu');
sqlLines.push(`-- Total Rekam Data: ${records.length} Kelurahan / Unit`);
sqlLines.push('-- ====================================================================');
sqlLines.push('');

for (const r of records) {
  sqlLines.push(
    `INSERT OR REPLACE INTO health_records (` +
    `id, puskesmas, kelurahan, tahun, bulan, bulanNama, ` +
    `sasaranLansia, sasaranLaki, sasaranPerempuan, sasaranUmur45_59, sasaranUmur60_69, sasaranUmur70Plus, ` +
    `kunjunganLansia, kunjunganLaki, kunjunganPerempuan, kunjunganUmur45_59, kunjunganUmur60_69, kunjunganUmur70Plus, ` +
    `skriningLansia, skriningLaki, skriningPerempuan, skriningUmur45_59, skriningUmur60_69, skriningUmur70Plus, ` +
    `lansiaDenganKelainan, lansiaKelainanLaki, lansiaKelainanPerempuan, totalPenyakitBulanIni, totalPenyakit, ` +
    `diobati, tidakDiobati, dirujuk, konseling, penyuluhan, pemberdayaanLansia, ` +
    `jumlahPosbindu, kelompokLansia, posyanduLansiaAktif, jumlahKunjunganRumah, longTermCareLansia, pantiWredaDibina, kunjunganPantiWreda, ` +
    `tenagaDokter, tenagaPerawat, tenagaBidan, tenagaGiziPromkes, totalTenagaKesehatan, ` +
    `hipertensi, diabetesMelitus, kolesterolTinggi, asamUratTinggi, gangguanGinjal, gangguanKognitif, gangguanPenglihatan, gangguanPendengaran, anemiaHbKurang, imtLebihObesitas, imtKurang, gangguanMetabolikLain, ` +
    `kemandirianA, kemandirianBRingan, kemandirianBSedang, kemandirianCBerat, kemandirianCTotal` +
    `) VALUES (` +
    `${escapeStr(r.id)}, ${escapeStr(r.puskesmas)}, ${escapeStr(r.kelurahan)}, ${num(r.tahun)}, ${num(r.bulan)}, ${escapeStr(r.bulanNama)}, ` +
    `${num(r.sasaranLansia)}, ${num(r.sasaranLaki)}, ${num(r.sasaranPerempuan)}, ${num(r.sasaranUmur45_59)}, ${num(r.sasaranUmur60_69)}, ${num(r.sasaranUmur70Plus)}, ` +
    `${num(r.kunjunganLansia)}, ${num(r.kunjunganLaki)}, ${num(r.kunjunganPerempuan)}, ${num(r.kunjunganUmur45_59)}, ${num(r.kunjunganUmur60_69)}, ${num(r.kunjunganUmur70Plus)}, ` +
    `${num(r.skriningLansia)}, ${num(r.skriningLaki)}, ${num(r.skriningPerempuan)}, ${num(r.skriningUmur45_59)}, ${num(r.skriningUmur60_69)}, ${num(r.skriningUmur70Plus)}, ` +
    `${num(r.lansiaDenganKelainan)}, ${num(r.lansiaKelainanLaki)}, ${num(r.lansiaKelainanPerempuan)}, ${num(r.totalPenyakitBulanIni)}, ${num(r.totalPenyakit)}, ` +
    `${num(r.diobati)}, ${num(r.tidakDiobati)}, ${num(r.dirujuk)}, ${num(r.konseling)}, ${num(r.penyuluhan)}, ${num(r.pemberdayaanLansia)}, ` +
    `${num(r.jumlahPosbindu)}, ${num(r.kelompokLansia)}, ${num(r.posyanduLansiaAktif)}, ${num(r.jumlahKunjunganRumah)}, ${num(r.longTermCareLansia)}, ${num(r.pantiWredaDibina)}, ${num(r.kunjunganPantiWreda)}, ` +
    `${num(r.tenagaDokter)}, ${num(r.tenagaPerawat)}, ${num(r.tenagaBidan)}, ${num(r.tenagaGiziPromkes)}, ${num(r.totalTenagaKesehatan)}, ` +
    `${num(r.hipertensi)}, ${num(r.diabetesMelitus)}, ${num(r.kolesterolTinggi)}, ${num(r.asamUratTinggi)}, ${num(r.gangguanGinjal)}, ${num(r.gangguanKognitif)}, ${num(r.gangguanPenglihatan)}, ${num(r.gangguanPendengaran)}, ${num(r.anemiaHbKurang)}, ${num(r.imtLebihObesitas)}, ${num(r.imtKurang)}, ${num(r.gangguanMetabolikLain)}, ` +
    `${num(r.kemandirianA)}, ${num(r.kemandirianBRingan)}, ${num(r.kemandirianBSedang)}, ${num(r.kemandirianCBerat)}, ${num(r.kemandirianCTotal)}` +
    `);`
  );
}

sqlLines.push('');
sqlLines.push(`UPDATE dataset_metadata SET total_records = ${records.length}, updated_at = datetime('now'), source = 'real_seed_palu' WHERE id = 'current_dataset';`);

const outputPath = path.resolve(__dirname, '..', 'migrations', '0002_seed_data.sql');
fs.writeFileSync(outputPath, sqlLines.join('\n'), 'utf-8');
console.log(`Berhasil menulis ${sqlLines.length} baris SQL ke: ${outputPath}`);
