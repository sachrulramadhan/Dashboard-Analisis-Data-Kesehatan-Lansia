import { HealthRecord, IndicatorMetadata } from '../types';

export const PUSKESMAS_LIST = [
  'Puskesmas Birobuli',
  'Puskesmas Bulili',
  'Puskesmas Kamonji',
  'Puskesmas Kawatuna',
  'Puskesmas Lere',
  'Puskesmas Mabelopura',
  'Puskesmas Mamboro',
  'Puskesmas Nosarara',
  'Puskesmas Pantoloan',
  'Puskesmas Sangurara',
  'Puskesmas Singgani',
  'Puskesmas Talise',
  'Puskesmas Tawaeli',
  'Puskesmas Tipo',
];

// 14 Puskesmas & 46 Kelurahan Kota Palu (disesuaikan dengan data riil laporan)
export const PUSKESMAS_KELURAHAN_MAP: Record<string, string[]> = {
  'Puskesmas Birobuli': ['Birobuli Utara', 'Lolu Selatan', 'Lolu Utara'],
  'Puskesmas Bulili': ['Birobuli Selatan', 'Petobo'],
  'Puskesmas Kamonji': ['Baru', 'Kamonji', 'Siranindi', 'Ujuna'],
  'Puskesmas Kawatuna': ['Kawatuna', 'Lasoani', 'Poboya', 'Tanamodindi'],
  'Puskesmas Lere': ['Kabonena', 'Lere', 'Silae'],
  'Puskesmas Mabelopura': ['Tatura Selatan', 'Tatura Utara'],
  'Puskesmas Mamboro': ['Mamboro', 'Mamboro Barat', 'Taipa'],
  'Puskesmas Nosarara': ['Palupi', 'Pengawu', 'Tawanjuka'],
  'Puskesmas Pantoloan': ['Baiya', 'Pantoloan', 'Pantoloan Boya'],
  'Puskesmas Sangurara': ['Balaroa', 'Boyaoge', 'Donggala Kodi', 'Duyu', 'Nunu'],
  'Puskesmas Singgani': ['BSS Barat', 'BSS Tengah', 'BSS Timur'],
  'Puskesmas Talise': ['Layana Indah', 'T. Valangguni', 'Talise', 'Tondo'],
  'Puskesmas Tawaeli': ['Kayu Malue Ngapa', 'Kayu Malue Pajeko', 'Lambara', 'Panau'],
  'Puskesmas Tipo': ['Buluri', 'Tipo', 'Watusampu'],
};

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const INDICATOR_METADATA_LIST: IndicatorMetadata[] = [
  {
    indicator_name: 'Sasaran Lansia (Target Populasi)',
    source_column: 'sasaranLansia',
    aggregation_type: 'MAX',
    formula: 'MAX(sasaranLansia) per wilayah (stok sasaran riil, bukan penjumlahan 12 bulan)',
    unit: 'Jiwa',
    monthly_available: true,
    annual_available: true,
    category: 'demografi',
    isPositiveWhenRising: true,
  },
  {
    indicator_name: 'Kunjungan Lansia',
    source_column: 'kunjunganLansia',
    aggregation_type: 'SUM',
    formula: 'SUM(kunjunganLansia)',
    unit: 'Kunjungan',
    monthly_available: true,
    annual_available: true,
    category: 'layanan',
    isPositiveWhenRising: true,
  },
  {
    indicator_name: 'Lansia Diskrining (>60 Tahun)',
    source_column: 'skriningLansia',
    aggregation_type: 'SUM',
    formula: 'SUM(skriningLansia)',
    unit: 'Lansia',
    monthly_available: true,
    annual_available: true,
    category: 'cakupan',
    isPositiveWhenRising: true,
  },
  {
    indicator_name: 'Cakupan Skrining Lansia',
    source_column: 'persentaseSkrining',
    aggregation_type: 'PERCENTAGE',
    formula: '(SUM(skriningLansia) / MAX(sasaranLansia)) × 100%',
    unit: '%',
    monthly_available: true,
    annual_available: true,
    category: 'cakupan',
    isPositiveWhenRising: true,
  },
  {
    indicator_name: 'Lansia dengan Kelainan',
    source_column: 'lansiaDenganKelainan',
    aggregation_type: 'SUM',
    formula: 'SUM(lansiaDenganKelainan)',
    unit: 'Kasus',
    monthly_available: true,
    annual_available: true,
    category: 'penyakit',
    isPositiveWhenRising: false,
  },
  {
    indicator_name: 'Total Kasus Penyakit',
    source_column: 'totalPenyakitBulanIni',
    aggregation_type: 'SUM',
    formula: 'SUM(totalPenyakitBulanIni)',
    unit: 'Kasus',
    monthly_available: true,
    annual_available: true,
    category: 'penyakit',
    isPositiveWhenRising: false,
  },
  {
    indicator_name: 'Lansia Diobati',
    source_column: 'diobati',
    aggregation_type: 'SUM',
    formula: 'SUM(diobati)',
    unit: 'Lansia',
    monthly_available: true,
    annual_available: true,
    category: 'layanan',
    isPositiveWhenRising: true,
  },
  {
    indicator_name: 'Persentase Pengobatan Kelainan',
    source_column: 'persentasePengobatan',
    aggregation_type: 'PERCENTAGE',
    formula: '(SUM(diobati) / SUM(lansiaDenganKelainan)) × 100%',
    unit: '%',
    monthly_available: true,
    annual_available: true,
    category: 'cakupan',
    isPositiveWhenRising: true,
  },
  {
    indicator_name: 'Lansia Dirujuk',
    source_column: 'dirujuk',
    aggregation_type: 'SUM',
    formula: 'SUM(dirujuk)',
    unit: 'Lansia',
    monthly_available: true,
    annual_available: true,
    category: 'layanan',
    isPositiveWhenRising: false,
  },
  {
    indicator_name: 'Kunjungan Rumah Lansia',
    source_column: 'jumlahKunjunganRumah',
    aggregation_type: 'SUM',
    formula: 'SUM(jumlahKunjunganRumah)',
    unit: 'Kunjungan',
    monthly_available: true,
    annual_available: true,
    category: 'layanan',
    isPositiveWhenRising: true,
  },
  {
    indicator_name: 'Posyandu Lansia / Posbindu Aktif',
    source_column: 'posyanduLansiaAktif',
    aggregation_type: 'LAST_VALUE',
    formula: 'LAST_VALUE(posyanduLansiaAktif) / MAX per periode',
    unit: 'Pos',
    monthly_available: true,
    annual_available: true,
    category: 'layanan',
    isPositiveWhenRising: true,
  },
  {
    indicator_name: 'Tenaga Kesehatan Pembina Lansia',
    source_column: 'totalTenagaKesehatan',
    aggregation_type: 'LAST_VALUE',
    formula: 'LAST_VALUE(totalTenagaKesehatan) (data stok per fasilitas)',
    unit: 'Orang',
    monthly_available: true,
    annual_available: true,
    category: 'tenaga',
    isPositiveWhenRising: true,
  },
];

// Deterministic generator with consistent seed so numbers are stable and verifiable
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateSeedHealthData(): HealthRecord[] {
  const records: HealthRecord[] = [];
  const years = [2025, 2026];

  let seedCounter = 12345;

  years.forEach((year) => {
    // 2026 has all 12 months (or Jan-Sep available, up to Dec projection/target)
    const months = year === 2025 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    PUSKESMAS_LIST.forEach((puskesmas, pIdx) => {
      const kelurahans = PUSKESMAS_KELURAHAN_MAP[puskesmas];

      kelurahans.forEach((kelurahan, kIdx) => {
        // Base population characteristics for this kelurahan
        const baseSasaran = 650 + Math.round(pseudoRandom(pIdx * 100 + kIdx * 17) * 750);
        const posbinduCount = 3 + Math.round(pseudoRandom(pIdx * 33 + kIdx * 9) * 4);
        const pantiCount = (pIdx === 0 && kIdx === 0) || (pIdx === 2 && kIdx === 1) ? 1 : 0;

        months.forEach((month) => {
          seedCounter++;
          const rand = () => pseudoRandom(seedCounter++);

          // Seasonal factor: e.g. post-holiday checkups, Posyandu campaigns in March, July, Oct
          const monthFactor = 0.85 + (Math.sin((month / 12) * Math.PI * 2) * 0.15) + (rand() * 0.12);
          const yearGrowth = year === 2026 ? 1.05 : 1.0;

          // Demographic breakdown of Sasaran
          const sasaranLaki = Math.round(baseSasaran * (0.46 + rand() * 0.03));
          const sasaranPerempuan = baseSasaran - sasaranLaki;

          const sasaranUmur45_59 = Math.round(baseSasaran * 0.38);
          const sasaranUmur60_69 = Math.round(baseSasaran * 0.42);
          const sasaranUmur70Plus = baseSasaran - sasaranUmur45_59 - sasaranUmur60_69;

          // Kunjungan (usually 40% - 75% of sasaran monthly)
          const kunjunganLansia = Math.round(baseSasaran * (0.42 + rand() * 0.22) * monthFactor * yearGrowth);
          const kunjunganLaki = Math.round(kunjunganLansia * (0.41 + rand() * 0.04));
          const kunjunganPerempuan = kunjunganLansia - kunjunganLaki;

          const kunjunganUmur45_59 = Math.round(kunjunganLansia * 0.35);
          const kunjunganUmur60_69 = Math.round(kunjunganLansia * 0.44);
          const kunjunganUmur70Plus = kunjunganLansia - kunjunganUmur45_59 - kunjunganUmur60_69;

          // Skrining (subset of kunjungan & target >60)
          const skriningLansia = Math.round(kunjunganLansia * (0.72 + rand() * 0.18));
          const skriningLaki = Math.round(skriningLansia * (0.42 + rand() * 0.03));
          const skriningPerempuan = skriningLansia - skriningLaki;

          const skriningUmur45_59 = Math.round(skriningLansia * 0.25);
          const skriningUmur60_69 = Math.round(skriningLansia * 0.48);
          const skriningUmur70Plus = skriningLansia - skriningUmur45_59 - skriningUmur60_69;

          // Lansia dengan kelainan (sekitar 50% - 68% dari yang diskrining menemukan minimal 1 faktor risiko/kelainan)
          const lansiaDenganKelainan = Math.round(skriningLansia * (0.52 + rand() * 0.14));
          const lansiaKelainanLaki = Math.round(lansiaDenganKelainan * 0.43);
          const lansiaKelainanPerempuan = lansiaDenganKelainan - lansiaKelainanLaki;

          // Pengobatan & Rujukan
          // Persentase diobati biasanya 75% - 90% dari yang ada kelainan
          const diobati = Math.round(lansiaDenganKelainan * (0.76 + rand() * 0.14));
          const tidakDiobati = Math.max(0, lansiaDenganKelainan - diobati);
          // Dirujuk ke FKRTL/RS
          const dirujuk = Math.round(lansiaDenganKelainan * (0.08 + rand() * 0.07));

          // Konseling, Penyuluhan, Pemberdayaan
          const konseling = Math.round(skriningLansia * (0.65 + rand() * 0.2));
          const penyuluhan = Math.round(posbinduCount * (1 + rand() * 1.5));
          const pemberdayaanLansia = Math.round(15 + rand() * 25);

          // Layanan
          const posyanduLansiaAktif = Math.min(posbinduCount, Math.round(posbinduCount * (0.85 + rand() * 0.15)));
          const jumlahKunjunganRumah = Math.round(12 + rand() * 20);
          const longTermCareLansia = Math.round(4 + rand() * 8);
          const kunjunganPantiWreda = pantiCount > 0 ? Math.round(8 + rand() * 14) : 0;

          // Tenaga Kesehatan (stok di wilayah)
          const tenagaDokter = 1 + (pIdx % 2);
          const tenagaPerawat = 2 + (kIdx % 3);
          const tenagaBidan = 2 + ((pIdx + kIdx) % 2);
          const tenagaGiziPromkes = 1;
          const totalTenagaKesehatan = tenagaDokter + tenagaPerawat + tenagaBidan + tenagaGiziPromkes;

          // Profil Penyakit & Faktor Risiko
          // Hipertensi is commonly the highest in elderly (>60% of abnormalities)
          const hipertensi = Math.round(lansiaDenganKelainan * (0.58 + rand() * 0.12));
          const diabetesMelitus = Math.round(lansiaDenganKelainan * (0.24 + rand() * 0.08));
          const kolesterolTinggi = Math.round(lansiaDenganKelainan * (0.36 + rand() * 0.10));
          const asamUratTinggi = Math.round(lansiaDenganKelainan * (0.30 + rand() * 0.08));
          const gangguanPenglihatan = Math.round(lansiaDenganKelainan * (0.26 + rand() * 0.09));
          const gangguanPendengaran = Math.round(lansiaDenganKelainan * (0.16 + rand() * 0.06));
          const gangguanKognitif = Math.round(lansiaDenganKelainan * (0.11 + rand() * 0.05));
          const gangguanGinjal = Math.round(lansiaDenganKelainan * (0.05 + rand() * 0.04));
          const anemiaHbKurang = Math.round(lansiaDenganKelainan * (0.14 + rand() * 0.06));
          const imtLebihObesitas = Math.round(lansiaDenganKelainan * (0.22 + rand() * 0.07));
          const imtKurang = Math.round(lansiaDenganKelainan * (0.08 + rand() * 0.04));
          const gangguanMetabolikLain = Math.round(lansiaDenganKelainan * (0.09 + rand() * 0.05));

          const totalPenyakitBulanIni = hipertensi + diabetesMelitus + kolesterolTinggi + asamUratTinggi + 
            gangguanPenglihatan + gangguanPendengaran + gangguanKognitif + gangguanGinjal + anemiaHbKurang;
          const totalPenyakit = totalPenyakitBulanIni;

          // Kemandirian Lansia (ADL Barthel Index)
          // Total evaluated is usually the screened population
          const kemandirianA = Math.round(skriningLansia * (0.64 + rand() * 0.08)); // Mandiri
          const kemandirianBRingan = Math.round(skriningLansia * (0.20 + rand() * 0.05)); // Ringan
          const kemandirianBSedang = Math.round(skriningLansia * (0.09 + rand() * 0.03)); // Sedang
          const kemandirianCBerat = Math.round(skriningLansia * (0.05 + rand() * 0.02)); // Berat
          const kemandirianCTotal = Math.max(0, skriningLansia - (kemandirianA + kemandirianBRingan + kemandirianBSedang + kemandirianCBerat)); // Total

          records.push({
            id: `${year}-${month}-${puskesmas}-${kelurahan}`,
            puskesmas,
            kelurahan,
            tahun: year,
            bulan: month,
            bulanNama: MONTH_NAMES[month - 1],

            sasaranLansia: baseSasaran,
            sasaranLaki,
            sasaranPerempuan,
            sasaranUmur45_59,
            sasaranUmur60_69,
            sasaranUmur70Plus,

            kunjunganLansia,
            kunjunganLaki,
            kunjunganPerempuan,
            kunjunganUmur45_59,
            kunjunganUmur60_69,
            kunjunganUmur70Plus,

            skriningLansia,
            skriningLaki,
            skriningPerempuan,
            skriningUmur45_59,
            skriningUmur60_69,
            skriningUmur70Plus,

            lansiaDenganKelainan,
            lansiaKelainanLaki,
            lansiaKelainanPerempuan,
            totalPenyakitBulanIni,
            totalPenyakit,

            diobati,
            tidakDiobati,
            dirujuk,
            konseling,
            penyuluhan,
            pemberdayaanLansia,

            jumlahPosbindu: posbinduCount,
            kelompokLansia: posbinduCount + 1,
            posyanduLansiaAktif,
            jumlahKunjunganRumah,
            longTermCareLansia,
            pantiWredaDibina: pantiCount,
            kunjunganPantiWreda,

            tenagaDokter,
            tenagaPerawat,
            tenagaBidan,
            tenagaGiziPromkes,
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
        });
      });
    });
  });

  return records;
}
