import * as XLSX from 'xlsx';
import { HealthRecord, FilterState, AggregatedMetrics, PuskesmasStat } from '../types';

export function exportRecordsToExcel(records: HealthRecord[], filenamePrefix: string = 'Data_Kesehatan_Lansia') {
  const exportData = records.map((r) => ({
    'Tahun': r.tahun,
    'Bulan': r.bulanNama,
    'Puskesmas': r.puskesmas,
    'Kelurahan': r.kelurahan,
    'Sasaran Lansia': r.sasaranLansia,
    'Sasaran L': r.sasaranLaki,
    'Sasaran P': r.sasaranPerempuan,
    'Kunjungan Lansia': r.kunjunganLansia,
    'Kunjungan L': r.kunjunganLaki,
    'Kunjungan P': r.kunjunganPerempuan,
    'Skrining Lansia': r.skriningLansia,
    'Kelainan Ditemukan': r.lansiaDenganKelainan,
    'Diobati': r.diobati,
    'Tidak Diobati': r.tidakDiobati,
    'Dirujuk': r.dirujuk,
    'Kunjungan Rumah': r.jumlahKunjunganRumah,
    'Posbindu/Posyandu Aktif': r.posyanduLansiaAktif,
    'Total Tenaga Kesehatan': r.totalTenagaKesehatan,
    'Hipertensi': r.hipertensi,
    'Diabetes Melitus': r.diabetesMelitus,
    'Kolesterol Tinggi': r.kolesterolTinggi,
    'Asam Urat': r.asamUratTinggi,
    'Gangguan Penglihatan': r.gangguanPenglihatan,
    'Gangguan Pendengaran': r.gangguanPendengaran,
    'Gangguan Kognitif': r.gangguanKognitif,
    'Gangguan Ginjal': r.gangguanGinjal,
    'Anemia / Hb Kurang': r.anemiaHbKurang,
    'Kemandirian A (Mandiri)': r.kemandirianA,
    'Kemandirian B Ringan': r.kemandirianBRingan,
    'Kemandirian B Sedang': r.kemandirianBSedang,
    'Kemandirian C Berat': r.kemandirianCBerat,
    'Kemandirian C Total': r.kemandirianCTotal,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Lansia');
  
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
}

export function exportSummaryToExcel(
  metrics: AggregatedMetrics, 
  puskesmasStats: PuskesmasStat[], 
  filters: FilterState,
  periodLabelOverride?: string
) {
  const periodLabel = periodLabelOverride ?? (filters.mode === 'monthly' 
    ? `Bulan ${filters.month} Tahun ${filters.year}` 
    : `Akumulasi Jan-Desember ${filters.year}`);

  const summarySheetData = [
    ['DASHBOARD ANALISIS DATA KESEHATAN LANSIA'],
    ['DINAS KESEHATAN KOTA PALU'],
    ['Periode Analisis', periodLabel],
    ['Filter Puskesmas', filters.puskesmas],
    ['Filter Kelurahan', filters.kelurahan],
    ['Jenis Kelamin', filters.gender],
    ['Kelompok Umur', filters.ageGroup],
    [''],
    ['INDIKATOR UTAMA', 'NILAI', 'SATUAN', 'METODE AGREGASI'],
    ['Sasaran Lansia (60+ Tahun)', metrics.totalSasaran60Plus, 'Jiwa', 'Target Pokok Standar SPM'],
    ['Sasaran Pra-Lansia (45-59 Tahun)', metrics.totalSasaranPraLansia, 'Jiwa', 'Kelompok Pembinaan Awal'],
    ['Total Sasaran Agregat (45+ Tahun)', metrics.totalSasaranSemuaUmur, 'Jiwa', 'MAX Stok Riil per Wilayah'],
    ['Total Kunjungan Lansia', metrics.totalKunjungan, 'Kunjungan', 'SUM'],
    ['Total Lansia Diskrining', metrics.totalSkrining, 'Lansia', 'SUM'],
    ['Cakupan Skrining Lansia', `${metrics.persentaseSkrining.toFixed(1)}%`, '%', '(Jumlah Skrining ÷ Sasaran 60+) × 100%'],
    ['Lansia dengan Kelainan', metrics.lansiaDenganKelainan, 'Orang', 'SUM'],
    ['Persentase Kelainan', `${metrics.persentaseKelainan.toFixed(1)}%`, '%', '(Kelainan / Skrining) * 100%'],
    ['Lansia Diobati', metrics.diobati, 'Lansia', 'SUM'],
    ['Persentase Pengobatan', `${metrics.persentasePengobatan.toFixed(1)}%`, '%', '(Diobati / Kelainan) * 100%'],
    ['Lansia Tidak Diobati', metrics.tidakDiobati, 'Lansia', 'SUM'],
    ['Lansia Dirujuk ke FKRTL', metrics.dirujuk, 'Lansia', 'SUM'],
    ['Persentase Rujukan', `${metrics.persentaseRujukan.toFixed(1)}%`, '%', '(Dirujuk / Kelainan) * 100%'],
    ['Kunjungan Rumah (Home Care)', metrics.kunjunganRumah, 'Kunjungan', 'SUM'],
    ['Posyandu Lansia Aktif', metrics.posbinduAktif, 'Pos', 'LAST VALUE'],
    ['Tenaga Kesehatan Pembina', metrics.totalTenaga, 'Orang', 'LAST VALUE'],
  ];

  const puskesmasSheetData = puskesmasStats.map((p) => ({
    'Puskesmas': p.puskesmas,
    'Sasaran Lansia (60+)': p.sasaran,
    'Sasaran Total (45+)': p.sasaranTotalSemuaUmur,
    'Kunjungan': p.kunjungan,
    'Skrining': p.skrining,
    '% Skrining (60+)': Number(p.persenSkrining.toFixed(1)),
    'Kelainan': p.kelainan,
    'Penyakit': p.penyakit,
    'Diobati': p.diobati,
    'Dirujuk': p.dirujuk,
    'Kunjungan Rumah': p.kunjunganRumah,
    'Posbindu/Posyandu': p.posbindu,
    'Tenaga Kes': p.tenaga,
  }));

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(summarySheetData);
  const ws2 = XLSX.utils.json_to_sheet(puskesmasSheetData);

  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan Eksekutif');
  XLSX.utils.book_append_sheet(wb, ws2, 'Capaian Puskesmas');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Laporan_Eksekutif_Lansia_${(periodLabelOverride ?? `${filters.year}_${filters.mode}`).replace(/[^A-Za-z0-9]+/g, '_')}_${dateStr}.xlsx`);
}

export function exportRecordsToCSV(records: HealthRecord[], filenamePrefix: string = 'Data_Kesehatan_Lansia') {
  const exportData = records.map((r) => ({
    'Tahun': r.tahun,
    'Bulan': r.bulanNama,
    'Puskesmas': r.puskesmas,
    'Kelurahan': r.kelurahan,
    'Sasaran': r.sasaranLansia,
    'Kunjungan': r.kunjunganLansia,
    'Skrining': r.skriningLansia,
    'Kelainan': r.lansiaDenganKelainan,
    'Diobati': r.diobati,
    'Dirujuk': r.dirujuk,
    'Kunjungan_Rumah': r.jumlahKunjunganRumah,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function triggerPrint() {
  window.print();
}

export function downloadTemplateExcel() {
  const templateRows = [
    {
      'Tahun': 2026,
      'Bulan': 'Januari',
      'Puskesmas': 'Puskesmas Talise',
      'Kelurahan': 'Talise',
      'Sasaran Lansia': 520,
      'Kunjungan Lansia': 410,
      'Skrining Lansia': 380,
      'Lansia dengan Kelainan': 145,
      'Diobati': 130,
      'Dirujuk': 15,
      'Hipertensi': 95,
      'Diabetes Melitus': 42,
      'Kolesterol Tinggi': 35,
      'Asam Urat': 28,
      'Kunjungan Rumah': 25,
      'Posyandu Lansia Aktif': 4,
      'Total Tenaga Kesehatan': 6
    },
    {
      'Tahun': 2026,
      'Bulan': 'Januari',
      'Puskesmas': 'Puskesmas Kamonji',
      'Kelurahan': 'Kamonji',
      'Sasaran Lansia': 480,
      'Kunjungan Lansia': 390,
      'Skrining Lansia': 350,
      'Lansia dengan Kelainan': 120,
      'Diobati': 110,
      'Dirujuk': 10,
      'Hipertensi': 80,
      'Diabetes Melitus': 38,
      'Kolesterol Tinggi': 30,
      'Asam Urat': 22,
      'Kunjungan Rumah': 20,
      'Posyandu Lansia Aktif': 3,
      'Total Tenaga Kesehatan': 5
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Lansia');
  XLSX.writeFile(workbook, 'Template_Format_Laporan_Kesehatan_Lansia.xlsx');
}
