export type AggregationType = 
  | 'SUM' 
  | 'AVERAGE' 
  | 'MAX' 
  | 'MIN' 
  | 'LAST_VALUE' 
  | 'PERCENTAGE' 
  | 'DISTINCT_COUNT';

export type AnalysisMode = 'monthly' | 'cumulative';

export type UserRole = 'admin' | 'pengelola' | 'pimpinan';

export interface IndicatorMetadata {
  indicator_name: string;
  source_column: string;
  aggregation_type: AggregationType;
  formula: string;
  unit: string;
  monthly_available: boolean;
  annual_available: boolean;
  category: 'cakupan' | 'penyakit' | 'kemandirian' | 'layanan' | 'demografi' | 'tenaga';
  isPositiveWhenRising?: boolean; // false for diseases/unmedicated; true for screening/visits
}

export interface HealthRecord {
  id: string;
  puskesmas: string;
  kelurahan: string;
  tahun: number;
  bulan: number; // 1 - 12
  bulanNama: string; // 'Januari', etc.

  // Demografi & Sasaran
  sasaranLansia: number;
  sasaranLaki: number;
  sasaranPerempuan: number;
  sasaranUmur45_59: number;
  sasaranUmur60_69: number;
  sasaranUmur70Plus: number;

  // Kunjungan
  kunjunganLansia: number;
  kunjunganLaki: number;
  kunjunganPerempuan: number;
  kunjunganUmur45_59: number;
  kunjunganUmur60_69: number;
  kunjunganUmur70Plus: number;

  // Skrining
  skriningLansia: number; // Lansia usia >60 tahun yang diskrining
  skriningLaki: number;
  skriningPerempuan: number;
  skriningUmur45_59: number;
  skriningUmur60_69: number;
  skriningUmur70Plus: number;

  // Status Kesehatan & Kelainan
  lansiaDenganKelainan: number;
  lansiaKelainanLaki: number;
  lansiaKelainanPerempuan: number;
  totalPenyakitBulanIni: number;
  totalPenyakit: number;

  // Intervensi
  diobati: number;
  tidakDiobati: number;
  dirujuk: number;
  konseling: number;
  penyuluhan: number;
  pemberdayaanLansia: number;

  // Layanan Komunitas
  jumlahPosbindu: number;
  kelompokLansia: number;
  posyanduLansiaAktif: number;
  jumlahKunjunganRumah: number;
  longTermCareLansia: number;
  pantiWredaDibina: number;
  kunjunganPantiWreda: number;

  // Tenaga Kesehatan (Stok per wilayah)
  tenagaDokter: number;
  tenagaPerawat: number;
  tenagaBidan: number;
  tenagaGiziPromkes: number;
  totalTenagaKesehatan: number;

  // Profil Penyakit & Faktor Risiko
  hipertensi: number; // Tekanan darah
  diabetesMelitus: number;
  kolesterolTinggi: number;
  asamUratTinggi: number;
  gangguanGinjal: number;
  gangguanKognitif: number; // Demensia/Alzheimer
  gangguanPenglihatan: number; // Katarak, glaukoma, refraksi
  gangguanPendengaran: number;
  anemiaHbKurang: number;
  imtLebihObesitas: number;
  imtKurang: number;
  gangguanMetabolikLain: number;

  // Kemandirian Lansia (Barthel Index / ADL)
  kemandirianA: number; // Mandiri
  kemandirianBRingan: number; // Ketergantungan Ringan
  kemandirianBSedang: number; // Ketergantungan Sedang
  kemandirianCBerat: number; // Ketergantungan Berat
  kemandirianCTotal: number; // Ketergantungan Total
}

export interface FilterState {
  year: number;
  month: number;
  puskesmas: string; // 'ALL' or specific name
  kelurahan: string; // 'ALL' or specific name
  gender: 'ALL' | 'Laki-laki' | 'Perempuan';
  ageGroup: 'ALL' | '45-59' | '60-69' | '70+';
  mode: AnalysisMode;
}

export interface AggregatedMetrics {
  totalSasaran: number; // Sasaran Lansia 60+ (Fokus Utama Program / Standar SPM)
  totalSasaran60Plus: number; // Sasaran Lansia Usia >= 60 Tahun (60-69 thn + 70+ thn)
  totalSasaranSemuaUmur: number; // Total sasaran agregat termasuk pra-lansia (45-59 thn)
  totalSasaranPraLansia: number; // Sasaran Pra-lansia 45-59 tahun
  totalSasaranLansiaMuda: number; // Sasaran Lansia 60-69 tahun
  totalSasaranLansiaRisti: number; // Sasaran Lansia Risti 70+ tahun
  totalKunjungan: number;
  totalSkrining: number;
  persentaseSkrining: number; // Rumus: (Total Skrining / Sasaran Lansia 60 Ke Atas) * 100%
  formulaSkrining: string;
  rasioKunjunganSasaran: number;

  lansiaDenganKelainan: number;
  persentaseKelainan: number;
  totalKasusPenyakit: number;

  diobati: number;
  persentasePengobatan: number;
  tidakDiobati: number;
  persentaseTidakDiobati: number;

  dirujuk: number;
  persentaseRujukan: number;

  kunjunganRumah: number;
  posbinduAktif: number;
  kelompokLansia: number;
  pantiWreda: number;
  ltcLansia: number;
  totalTenaga: number;

  jumlahPuskesmas: number;
  jumlahKelurahan: number;

  // MoM Deltas (% change compared to previous period)
  deltaSasaran?: number | null;
  deltaKunjungan?: number | null;
  deltaSkrining?: number | null;
  deltaKelainan?: number | null;
  deltaPenyakit?: number | null;
  deltaDiobati?: number | null;
  deltaDirujuk?: number | null;
  deltaKunjunganRumah?: number | null;

  // Aggregation method notes
  aggregationNotes: Record<string, string>;
}

export interface DiseaseStat {
  id: string;
  name: string;
  cases: number;
  prevCases?: number | null;
  delta?: number | null;
  percentageOfScreened: number;
  percentageOfCases: number;
  category: string;
}

export interface PuskesmasStat {
  puskesmas: string;
  sasaran: number; // Sasaran Lansia 60+ (Fokus Utama)
  sasaran60Plus: number;
  sasaranTotalSemuaUmur: number;
  kunjungan: number;
  skrining: number;
  persenSkrining: number; // (Skrining / Sasaran 60+) * 100%
  kelainan: number;
  penyakit: number;
  diobati: number;
  dirujuk: number;
  kunjunganRumah: number;
  posbindu: number;
  tenaga: number;
  kelurahanList: string[];
}

export interface KelurahanStat {
  kelurahan: string;
  puskesmas: string;
  sasaran: number; // Sasaran Lansia 60+ (Fokus Utama)
  sasaran60Plus: number;
  sasaranTotalSemuaUmur: number;
  kunjungan: number;
  skrining: number;
  persenSkrining: number; // (Skrining / Sasaran 60+) * 100%
  kelainan: number;
  penyakit: number;
  diobati: number;
  dirujuk: number;
  kunjunganRumah: number;
}
