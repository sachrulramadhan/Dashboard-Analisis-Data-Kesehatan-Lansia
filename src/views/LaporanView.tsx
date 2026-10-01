import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Building, 
  Layers, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { exportSummaryToExcel, triggerPrint } from '../utils/exportUtils';
import { MONTH_NAMES } from '../data/mockHealthData';

type ReportType = 'bulanan' | 'triwulan' | 'semester' | 'tahunan';

export const LaporanView: React.FC = () => {
  const { metrics, periodLabel, filters, puskesmasStats, diseaseRanking, activeMenu, setActiveMenu } = useDashboard();
  
  const initialType: ReportType = useMemo(() => {
    if (activeMenu === 'laporan-triwulan') return 'triwulan';
    if (activeMenu === 'laporan-semester') return 'semester';
    if (activeMenu === 'laporan-tahunan') return 'tahunan';
    return 'bulanan';
  }, [activeMenu]);

  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [reportGenerated, setReportGenerated] = useState(true);

  // Sync with activeMenu
  useEffect(() => {
    if (activeMenu === 'laporan-triwulan') {
      setReportType('triwulan');
      setReportGenerated(true);
    } else if (activeMenu === 'laporan-semester') {
      setReportType('semester');
      setReportGenerated(true);
    } else if (activeMenu === 'laporan-tahunan') {
      setReportType('tahunan');
      setReportGenerated(true);
    } else if (activeMenu === 'laporan-bulanan') {
      setReportType('bulanan');
      setReportGenerated(true);
    }
  }, [activeMenu]);

  const handleGenerateReport = () => {
    setReportGenerated(true);
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'bulanan':
        return `Laporan Bulanan Program Kesehatan Lansia - ${MONTH_NAMES[filters.month - 1]} ${filters.year}`;
      case 'triwulan':
        return `Laporan Triwulan ${selectedQuarter} (TW ${selectedQuarter}) Program Lansia - Tahun ${filters.year}`;
      case 'semester':
        return `Laporan Semester ${selectedSemester} Program Lansia - Tahun ${filters.year}`;
      case 'tahunan':
        return `Laporan Tahunan Evaluasi Program Kesehatan Lansia - Tahun ${filters.year}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Card (hidden in print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Generator Laporan Resmi Kesehatan Lansia
            </h2>
            <p className="text-xs text-slate-500">
              Dokumen akuntabilitas program untuk Dinas Kesehatan Kota Palu dan Bappeda
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>GENERATE REPORT</span>
            </button>

            {reportGenerated && (
              <>
                <button
                  type="button"
                  onClick={() => exportSummaryToExcel(metrics, puskesmasStats, filters)}
                  className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>

                <button
                  type="button"
                  onClick={triggerPrint}
                  className="px-3 py-2 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Cetak PDF</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jenis Laporan:</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as ReportType);
                setReportGenerated(false);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
            >
              <option value="bulanan">Laporan Bulanan</option>
              <option value="triwulan">Laporan Triwulan</option>
              <option value="semester">Laporan Semester</option>
              <option value="tahunan">Laporan Tahunan</option>
            </select>
          </div>

          {reportType === 'triwulan' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Triwulan:</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
              >
                <option value={1}>Triwulan I (Januari – Maret)</option>
                <option value={2}>Triwulan II (April – Juni)</option>
                <option value={3}>Triwulan III (Juli – September)</option>
                <option value={4}>Triwulan IV (Oktober – Desember)</option>
              </select>
            </div>
          )}

          {reportType === 'semester' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Semester:</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
              >
                <option value={1}>Semester I (Januari – Juni)</option>
                <option value={2}>Semester II (Juli – Desember)</option>
              </select>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tahun Evaluasi:</label>
            <div className="p-2 bg-slate-100 rounded-lg font-bold text-slate-800 border border-slate-200">
              {filters.year}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Report Document Paper (Section 30 requirement) */}
      {reportGenerated ? (
        <div className="bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-6 text-slate-800 print:shadow-none print:border-none print:p-0">
          {/* Header Kop Surat */}
          <div className="text-center pb-6 border-b-2 border-slate-800">
            <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
              Pemerintah Kota Palu • Dinas Kesehatan
            </h1>
            <h2 className="text-sm font-bold text-slate-700 mt-0.5">
              Bidang Kesehatan Masyarakat — Seksi Kesehatan Usia Produktif & Lansia
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Jl. Balai Kota No. 1, Kota Palu, Sulawesi Tengah 94236
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center py-2">
            <h3 className="text-base font-extrabold uppercase text-slate-900 underline decoration-slate-400">
              {getReportTitle()}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Periode Evaluasi: {periodLabel} • Wilayah Kerja: Seluruh Puskesmas Kota Palu
            </p>
          </div>

          {/* Bab 1: Ringkasan Eksekutif */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Ringkasan Eksekutif & Indikator Kunci
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              Berdasarkan hasil pemantauan dan pencatatan rutin program kesehatan lanjut usia pada periode {periodLabel}, tercatat total estimasi sasaran lansia di Kota Palu sebanyak <strong>{metrics.totalSasaran.toLocaleString('id-ID')} jiwa</strong>. Total kunjungan lansia ke fasilitas kesehatan primer (Puskesmas, Posyandu Lansia, dan Posbindu PTM) tercatat <strong>{metrics.totalKunjungan.toLocaleString('id-ID')} kunjungan</strong> (rasio terhadap sasaran: {metrics.rasioKunjunganSasaran.toFixed(1)}%).
            </p>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              Cakupan lansia usia ≥60 tahun yang mendapatkan skrining kesehatan standar mencapai <strong>{metrics.totalSkrining.toLocaleString('id-ID')} lansia ({metrics.persentaseSkrining.toFixed(1)}%)</strong>. Dari hasil skrining tersebut, teridentifikasi <strong>{metrics.lansiaDenganKelainan.toLocaleString('id-ID')} lansia ({metrics.persentaseKelainan.toFixed(1)}%)</strong> dengan kelainan/faktor risiko penyakit.
            </p>
          </div>

          {/* Bab 2: Tabel Capaian Indikator */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Matriks Capaian Indikator Program Lansia
            </h4>
            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 text-left">Nama Indikator</th>
                  <th className="p-2 text-right">Target / Stok</th>
                  <th className="p-2 text-right">Realisasi</th>
                  <th className="p-2 text-right">Capaian (%)</th>
                  <th className="p-2 text-left">Metode Agregasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-2 font-medium">Sasaran Lansia (60+ Tahun) - Target SPM</td>
                  <td className="p-2 text-right">{metrics.totalSasaran60Plus.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right">{metrics.totalSasaran60Plus.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right font-bold">100.0%</td>
                  <td className="p-2 text-slate-500">MAX (Stok Sasaran 60+)</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Sasaran Pra-Lansia (45–59 Tahun)</td>
                  <td className="p-2 text-right">{metrics.totalSasaranPraLansia.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right">{metrics.totalSasaranPraLansia.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right font-bold">-</td>
                  <td className="p-2 text-slate-500">Kelompok Pembinaan Awal</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Total Kunjungan Lansia</td>
                  <td className="p-2 text-right">{metrics.totalSasaran.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right">{metrics.totalKunjungan.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right font-bold">{metrics.rasioKunjunganSasaran.toFixed(1)}%</td>
                  <td className="p-2 text-slate-500">SUM Bulanan</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Skrining Kesehatan Lansia</td>
                  <td className="p-2 text-right">{metrics.totalSasaran60Plus.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right">{metrics.totalSkrining.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right font-bold text-blue-700">{metrics.persentaseSkrining.toFixed(1)}%</td>
                  <td className="p-2 text-slate-500">(Skrining ÷ Sasaran 60+) × 100%</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Lansia dengan Kelainan</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right">{metrics.lansiaDenganKelainan.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right font-bold">{metrics.persentaseKelainan.toFixed(1)}%</td>
                  <td className="p-2 text-slate-500">(Kelainan/Skrining)*100%</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Lansia Diobati</td>
                  <td className="p-2 text-right">{metrics.lansiaDenganKelainan.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right">{metrics.diobati.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right font-bold text-emerald-700">{metrics.persentasePengobatan.toFixed(1)}%</td>
                  <td className="p-2 text-slate-500">(Diobati/Kelainan)*100%</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Lansia Dirujuk ke FKRTL</td>
                  <td className="p-2 text-right">{metrics.lansiaDenganKelainan.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right">{metrics.dirujuk.toLocaleString('id-ID')}</td>
                  <td className="p-2 text-right font-bold text-rose-700">{metrics.persentaseRujukan.toFixed(1)}%</td>
                  <td className="p-2 text-slate-500">(Dirujuk/Kelainan)*100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bab 3: Top Penyakit */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Profil Beban Penyakit & Faktor Risiko Utama
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Tiga kondisi penyakit dengan kasus tertinggi pada periode ini adalah:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
              {diseaseRanking.slice(0, 3).map((d, i) => (
                <li key={d.id}>
                  <strong>{d.name}</strong>: {d.cases.toLocaleString('id-ID')} kasus ({d.percentageOfCases.toFixed(1)}% dari total kelainan).
                </li>
              ))}
            </ul>
          </div>

          {/* Bab 4: Kesimpulan Berbasis Data */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              4. Kesimpulan dan Tindak Lanjut Program
            </h4>
            <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-1 text-justify">
              <li>Puskesmas dengan capaian skrining di bawah 50% wajib menjadwalkan Posyandu Lansia terintegrasi bersama kader kelurahan.</li>
              <li>Tingkat kepatuhan minum obat antihipertensi dan antidiabetes harus dipantau melalui program Home Care nakes.</li>
              <li>Penyediaan logistik strip pemeriksaan gula darah dan kolesterol harus dialokasikan merata di 12 Puskesmas se-Kota Palu.</li>
            </ol>
          </div>

          {/* Signature Block */}
          <div className="pt-8 grid grid-cols-2 text-xs text-center">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Dinas Kesehatan Kota Palu</p>
              <div className="h-16" />
              <p className="font-bold underline">dr. Hj. Rochmat Jasin, M.Kes</p>
              <p className="text-slate-500">NIP. 19740512 200212 2 003</p>
            </div>
            <div>
              <p>Palu, 28 September {filters.year}</p>
              <p className="font-bold">Pengelola Program Kesehatan Lansia</p>
              <div className="h-16" />
              <p className="font-bold underline">Hj. Siti Nurbaya, S.Kep, Ners</p>
              <p className="text-slate-500">NIP. 19820815 200604 2 018</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Siap untuk Menghasilkan Dokumen Laporan
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Pilih jenis laporan yang diinginkan di atas lalu klik tombol &quot;GENERATE REPORT&quot; untuk menyusun format laporan resmi lengkap dengan kop dinas dan tabel matriks.
          </p>
          <button
            type="button"
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-700"
          >
            Generate Laporan Sekarang
          </button>
        </div>
      )}
    </div>
  );
};
