import { HealthRecord } from '../types';
import { PUSKESMAS_LIST, PUSKESMAS_KELURAHAN_MAP, MONTH_NAMES } from '../data/mockHealthData';
import { normalizePuskesmasName } from './calculationEngine';

export interface SchemaCheckItem {
  id: string;
  name: string;
  category: 'format' | 'structure' | 'period' | 'metrics' | 'completeness';
  status: 'pass' | 'warning' | 'fail';
  title: string;
  message: string;
  detail?: string;
}

export interface ValidationReport {
  isValid: boolean;
  status: 'valid' | 'warning' | 'invalid';
  score: number; // 0 - 100
  title: string;
  summary: string;
  checks: SchemaCheckItem[];
  stats: {
    totalRows: number;
    validRows: number;
    warningRows: number;
    emptyRows: number;
    totalSasaran: number;
    totalKunjungan: number;
    totalSkrining: number;
    totalPenyakit: number;
  };
  detectedPeriod: {
    bulan: number;
    bulanNama: string;
    tahun: number;
    detectedFrom: 'filename' | 'header' | 'cell_data' | 'user_default';
  };
  detectedPuskesmasList: string[];
  detectedKelurahanList: string[];
  canProceed: boolean;
  blockReason?: string;
  recommendedAction?: string;
}

/**
 * Deteksi nama bulan dari string (nama file, judul header, cell)
 */
export function extractMonthFromString(text: string): number | null {
  if (!text) return null;
  const upper = text.toUpperCase();

  // Pola nama bulan lengkap & singkatan Bahasa Indonesia & Inggris
  if (/\b(JANUARI|JANUARY|JAN)\b/i.test(upper) || upper.includes('JANUARI') || upper.includes('JAN')) return 1;
  if (/\b(FEBRUARI|FEBRUARY|FEB)\b/i.test(upper) || upper.includes('FEBRUARI') || upper.includes('FEBRUARY') || upper.includes('FEB')) return 2;
  if (/\b(MARET|MARCH|MAR)\b/i.test(upper) || upper.includes('MARET') || upper.includes('MARCH')) return 3;
  if (/\b(APRIL|APR)\b/i.test(upper) || upper.includes('APRIL') || upper.includes('APR')) return 4;
  if (/\b(MEI|MAY)\b/i.test(upper) || upper.includes('MEI') || upper.includes('MAY')) return 5;
  if (/\b(JUNI|JUNE|JUN)\b/i.test(upper) || upper.includes('JUNI') || upper.includes('JUNE')) return 6;
  if (/\b(JULI|JULY|JUL)\b/i.test(upper) || upper.includes('JULI') || upper.includes('JULY')) return 7;
  if (/\b(AGUSTUS|AUGUST|AGU|AUG)\b/i.test(upper) || upper.includes('AGUSTUS') || upper.includes('AUGUST')) return 8;
  if (/\b(SEPTEMBER|SEP)\b/i.test(upper) || upper.includes('SEPTEMBER') || upper.includes('SEP')) return 9;
  if (/\b(OKTOBER|OCTOBER|OKT|OCT)\b/i.test(upper) || upper.includes('OKTOBER') || upper.includes('OCTOBER')) return 10;
  if (/\b(NOVEMBER|NOV)\b/i.test(upper) || upper.includes('NOVEMBER') || upper.includes('NOV')) return 11;
  if (/\b(DESEMBER|DECEMBER|DES|DEC)\b/i.test(upper) || upper.includes('DESEMBER') || upper.includes('DECEMBER')) return 12;

  return null;
}

/**
 * Deteksi tahun dari string (misal: "2025", "2026", "2027")
 */
export function extractYearFromString(text: string): number | null {
  if (!text) return null;
  const match = text.match(/\b(202[0-9]|2030)\b/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Menemukan Puskesmas induk dari nama kelurahan di Kota Palu
 */
const normKel = (x: string) =>
  x
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Ejaan lain yang sering muncul di file laporan
const KELURAHAN_ALIASES: Record<string, string> = {
  'bss barat': 'BSS Barat',
  'besusu barat': 'BSS Barat',
  'bss tengah': 'BSS Tengah',
  'besusu tengah': 'BSS Tengah',
  'bss timur': 'BSS Timur',
  'besusu timur': 'BSS Timur',
  'talise valangguni': 'T. Valangguni',
  't valangguni': 'T. Valangguni',
  'kayumalue ngapa': 'Kayu Malue Ngapa',
  'kayumalue pajeko': 'Kayu Malue Pajeko',
  'tavanjuka': 'Tawanjuka',
  'layana indah': 'Layana Indah',
};

/**
 * Menemukan Puskesmas induk dari nama kelurahan di Kota Palu.
 * Pencocokan persis (tanpa memedulikan huruf besar/kecil dan tanda baca) lebih dulu,
 * agar kelurahan tidak salah masuk ke puskesmas lain.
 */
export function findPuskesmasByKelurahan(kelurahanName: string): string | null {
  if (!kelurahanName) return null;
  let key = normKel(kelurahanName);
  if (KELURAHAN_ALIASES[key]) key = normKel(KELURAHAN_ALIASES[key]);

  for (const [pkm, kels] of Object.entries(PUSKESMAS_KELURAHAN_MAP)) {
    if (kels.some((k) => normKel(k) === key)) return pkm;
  }

  // Cadangan: cocok sebagian hanya bila hasilnya satu puskesmas saja (tidak ambigu)
  const hits = new Set<string>();
  for (const [pkm, kels] of Object.entries(PUSKESMAS_KELURAHAN_MAP)) {
    if (kels.some((k) => key.length >= 4 && (normKel(k).startsWith(key) || key.startsWith(normKel(k))))) {
      hits.add(pkm);
    }
  }
  return hits.size === 1 ? Array.from(hits)[0] : null;
}

/**
 * Mesin Validasi Otomatis Skema Database & Data sebelum diproses
 */
export function validateImportedData(
  records: HealthRecord[],
  fileName: string,
  detectedFormatName: string,
  rawWarnings: string[] = []
): ValidationReport {
  const checks: SchemaCheckItem[] = [];
  const totalRows = records.length;

  // 1. Validasi Keberadaan Data (Empty Dataset Guard)
  if (totalRows === 0) {
    checks.push({
      id: 'check-rows',
      name: 'Jumlah Baris Data',
      category: 'format',
      status: 'fail',
      title: 'Tidak Ada Baris Data Valid',
      message: 'Sistem tidak menemukan baris data yang dapat diproses dari file ini.',
      detail: 'Pastikan file memiliki isi tabel dan bukan file kosong atau hanya header.'
    });

    return {
      isValid: false,
      status: 'invalid',
      score: 0,
      title: 'Validasi Skema Gagal: File Kosong',
      summary: 'File tidak memuat data yang sesuai dengan skema database sistem.',
      checks,
      stats: {
        totalRows: 0,
        validRows: 0,
        warningRows: 0,
        emptyRows: 0,
        totalSasaran: 0,
        totalKunjungan: 0,
        totalSkrining: 0,
        totalPenyakit: 0,
      },
      detectedPeriod: {
        bulan: 1,
        bulanNama: 'Januari',
        tahun: 2026,
        detectedFrom: 'user_default',
      },
      detectedPuskesmasList: [],
      detectedKelurahanList: [],
      canProceed: false,
      blockReason: 'File kosong atau format struktur tabel tidak dapat dikenali oleh skema database.',
      recommendedAction: 'Gunakan file template Excel/CSV resmi yang disediakan oleh sistem.'
    };
  }

  checks.push({
    id: 'check-rows',
    name: 'Kelengkapan Baris Data',
    category: 'format',
    status: 'pass',
    title: `${totalRows} Baris Terbaca`,
    message: `Format file berhasil diurai sebagai: ${detectedFormatName}.`
  });

  // 2. Validasi Pencegahan Data Kosong / Zero Data (Metrics Integrity)
  const totalSasaran = records.reduce((s, r) => s + (r.sasaranLansia || 0), 0);
  const totalKunjungan = records.reduce((s, r) => s + (r.kunjunganLansia || 0), 0);
  const totalSkrining = records.reduce((s, r) => s + (r.skriningLansia || 0), 0);
  const totalPenyakit = records.reduce((s, r) => s + (r.totalPenyakit || r.totalPenyakitBulanIni || 0), 0);

  let emptyRows = 0;
  let validRows = 0;
  let warningRows = 0;

  records.forEach((r) => {
    if (!r.sasaranLansia && !r.kunjunganLansia && !r.skriningLansia) {
      emptyRows++;
    } else if (r.sasaranLansia > 0 && r.kunjunganLansia >= 0) {
      validRows++;
    } else {
      warningRows++;
    }
  });

  // Jika semua metrik bernilai 0 (Data Kosong Total)
  if (totalSasaran === 0 && totalKunjungan === 0 && totalSkrining === 0) {
    checks.push({
      id: 'check-zero-metrics',
      name: 'Integritas Angka Numerik',
      category: 'metrics',
      status: 'fail',
      title: 'Semua Nilai Numerik Bernilai 0 (Data Kosong)',
      message: 'Seluruh baris memiliki nilai Sasaran Lansia = 0, Kunjungan = 0, dan Skrining = 0.',
      detail: 'Hal ini terjadi jika kolom angka bergeser atau format kolom numerik tidak cocok dengan skema database.'
    });
  } else {
    checks.push({
      id: 'check-zero-metrics',
      name: 'Integritas Angka Numerik',
      category: 'metrics',
      status: totalSasaran > 0 ? 'pass' : 'warning',
      title: totalSasaran > 0 ? 'Data Numerik Terisi Valid' : 'Sasaran Lansia Bernilai 0',
      message: `Terdeteksi Sasaran: ${totalSasaran.toLocaleString('id-ID')} jiwa, Kunjungan: ${totalKunjungan.toLocaleString('id-ID')}, Skrining: ${totalSkrining.toLocaleString('id-ID')}.`
    });
  }

  // 3. Validasi Skema Wilayah: Puskesmas & Kelurahan
  const puskesmasSet = new Set<string>();
  const kelurahanSet = new Set<string>();
  let numericKelurahanCount = 0;
  let unknownPuskesmasCount = 0;

  records.forEach((r) => {
    if (r.puskesmas) puskesmasSet.add(r.puskesmas);
    if (r.kelurahan) {
      kelurahanSet.add(r.kelurahan);
      // Deteksi anomali jika kelurahan berupa angka murni (kolom bergeser)
      if (/^\d+$/.test(r.kelurahan.trim())) {
        numericKelurahanCount++;
      }
    }
  });

  if (numericKelurahanCount > 0) {
    checks.push({
      id: 'check-column-shift',
      name: 'Validasi Kolom Wilayah',
      category: 'structure',
      status: 'warning',
      title: 'Peringatan Kolom Bergeser',
      message: `Terdapat ${numericKelurahanCount} baris di mana kolom kelurahan berisi angka murni.`,
      detail: 'Sistem telah mengidentifikasi kemungkinan pergeseran kolom posyandu/kelurahan.'
    });
  } else {
    checks.push({
      id: 'check-column-shift',
      name: 'Validasi Kolom Wilayah',
      category: 'structure',
      status: 'pass',
      title: 'Kolom Puskesmas & Kelurahan Valid',
      message: `Terdeteksi ${puskesmasSet.size} Puskesmas dan ${kelurahanSet.size} Kelurahan.`
    });
  }

  // 4. Validasi Periode (Bulan & Tahun)
  const monthFromFileName = extractMonthFromString(fileName);
  const yearFromFileName = extractYearFromString(fileName);
  const detectedMonthFromData = records[0]?.bulan || 1;
  const detectedYearFromData = records[0]?.tahun || 2026;

  let finalMonth = detectedMonthFromData;
  let detectedFrom: 'filename' | 'header' | 'cell_data' | 'user_default' = 'cell_data';

  // Jika nama file jelas menyatakan bulan (seperti LANSIA FEBRUARI .xlsx)
  // dan data dalam sel bernilai default 1 (Januari), beri prioritas ke nama file!
  if (monthFromFileName && monthFromFileName !== detectedMonthFromData) {
    checks.push({
      id: 'check-period-sync',
      name: 'Sinkronisasi Periode Bulan',
      category: 'period',
      status: 'warning',
      title: 'Sinkronisasi Bulan File',
      message: `Nama file memuat kata "${MONTH_NAMES[monthFromFileName - 1]}", namun data sel terbaca "${MONTH_NAMES[detectedMonthFromData - 1]}".`,
      detail: `Sistem secara otomatis menyesuaikan periode ke bulan ${MONTH_NAMES[monthFromFileName - 1]} agar data muncul dengan tepat di dashboard.`
    });
    finalMonth = monthFromFileName;
    detectedFrom = 'filename';
  } else {
    checks.push({
      id: 'check-period-sync',
      name: 'Validasi Periode Waktu',
      category: 'period',
      status: 'pass',
      title: `Periode: ${MONTH_NAMES[finalMonth - 1]} ${detectedYearFromData}`,
      message: `Data dialokasikan untuk ${MONTH_NAMES[finalMonth - 1]} Tahun ${detectedYearFromData}.`
    });
  }

  // 5. Validasi Morbiditas Penyakit Lansia
  if (totalPenyakit > 0) {
    checks.push({
      id: 'check-morbidity',
      name: 'Skema Morbiditas Penyakit',
      category: 'completeness',
      status: 'pass',
      title: 'Data Kasus Penyakit Terdeteksi',
      message: `Total ${totalPenyakit.toLocaleString('id-ID')} kasus penyakit lansia (Hipertensi, DM, Kolesterol, dll.) tercatat.`
    });
  } else {
    checks.push({
      id: 'check-morbidity',
      name: 'Skema Morbiditas Penyakit',
      category: 'completeness',
      status: 'warning',
      title: 'Morbiditas Kosong / Belum Terisi',
      message: 'Kolom rincian penyakit tidak memuat angka (akan bernilai 0 di grafik penyakit).'
    });
  }

  // Hitung Skor Kesesuaian Skema (Score 0 - 100)
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warnCount = checks.filter(c => c.status === 'warning').length;
  
  let score = 100;
  if (failCount > 0) score -= failCount * 40;
  if (warnCount > 0) score -= warnCount * 12;
  score = Math.max(0, Math.min(100, score));

  const canProceed = failCount === 0 && (totalSasaran > 0 || totalKunjungan > 0 || totalSkrining > 0);
  const status: 'valid' | 'warning' | 'invalid' = !canProceed ? 'invalid' : warnCount > 0 ? 'warning' : 'valid';

  let title = 'Skema Database Valid';
  let summary = 'Format file sesuai dengan skema database dashboard lansia.';
  if (status === 'warning') {
    title = 'Sesuai Skema dengan Penyesuaian Otomatis';
    summary = 'Format file dapat diproses. Sistem telah melakukan sinkronisasi otomatis agar tidak terjadi data kosong.';
  } else if (status === 'invalid') {
    title = 'Format File Tidak Sesuai Skema Database';
    summary = 'Data ditolak untuk mencegah database kosong atau rusak. Mohon periksa kolom file Anda.';
  }

  return {
    isValid: canProceed,
    status,
    score,
    title,
    summary,
    checks,
    stats: {
      totalRows,
      validRows,
      warningRows,
      emptyRows,
      totalSasaran,
      totalKunjungan,
      totalSkrining,
      totalPenyakit,
    },
    detectedPeriod: {
      bulan: finalMonth,
      bulanNama: MONTH_NAMES[finalMonth - 1] || 'Januari',
      tahun: yearFromFileName || detectedYearFromData,
      detectedFrom,
    },
    detectedPuskesmasList: Array.from(puskesmasSet),
    detectedKelurahanList: Array.from(kelurahanSet),
    canProceed,
    blockReason: !canProceed
      ? (totalSasaran === 0 && totalKunjungan === 0 && totalSkrining === 0)
        ? 'Data Kosong: Tidak ditemukan angka sasaran, kunjungan, atau skrining yang valid dalam file.'
        : 'Struktur kolom tidak memenuhi skema database minimum.'
      : undefined,
    recommendedAction: !canProceed
      ? 'Silakan unduh format template Excel resmi (.xlsx) yang telah disediakan sistem untuk memastikan struktur kolom sesuai.'
      : undefined
  };
}
