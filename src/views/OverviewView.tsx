import React from 'react';
import { 
  Users, 
  HeartPulse, 
  UserCheck, 
  Activity, 
  AlertCircle, 
  Pill, 
  Send, 
  Home, 
  Heart, 
  Building2, 
  MapPin, 
  Sparkles, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { KpiCard } from '../components/KpiCard';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';
import { PaluGisMap } from '../components/charts/PaluGisMap';
import { MONTH_NAMES } from '../data/mockHealthData';

export const OverviewView: React.FC = () => {
  const { 
    metrics, 
    periodLabel, 
    filters, 
    diseaseRanking, 
    puskesmasStats, 
    filteredRecords, 
    dataset, 
    setActiveMenu,
    resetToDefaultData 
  } = useDashboard();

  // Aggregate monthly series for the 12 months of the selected year
  const monthlyKunjungan = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.kunjunganLansia, 0);
  });

  const monthlySkrining = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.skriningLansia, 0);
  });

  const comparePeriodLabel = filters.mode === 'monthly' ? 'Bulan Sebelumnya' : `Tahun ${filters.year - 1}`;

  return (
    <div className="space-y-6">
      {/* Period Consistency Banner */}
      <PeriodBanner />

      {/* Empty Data Alert Banner */}
      {dataset.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Data Masih Kosong (Belum ada data laporan yang di-import)
              </h3>
              <p className="text-xs text-amber-800">
                Sistem saat ini dalam kondisi bersih tanpa data. Anda dapat mengimpor file Excel/CSV laporan kesehatan lansia Anda, atau klik tombol muat data simulasi jika ingin melihat visualisasi contoh.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMenu('data-explorer')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Import Data Excel/CSV
              </button>
              <button
                type="button"
                onClick={resetToDefaultData}
                className="px-3.5 py-2 bg-white border border-amber-300 hover:bg-amber-100/70 text-amber-900 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                Muat Data Contoh (Demo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row 1: 12 KPI Cards (Section 5) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Indikator Kinerja Utama (KPI Lansia)
          </h2>
          <span className="text-xs text-slate-500">
            Metode: {filters.mode === 'monthly' ? 'Bulanan' : 'Akumulasi Tahunan (SUM/MAX)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard
            title="1. Sasaran Lansia (60+ Thn)"
            value={metrics.totalSasaran}
            unit="Jiwa (SPM)"
            delta={metrics.deltaSasaran}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula={`Fokus Utama: Lansia Usia ≥60 Tahun (Standar SPM Kemenkes). Total populasi termasuk Pra-lansia (45-59): ${metrics.totalSasaranSemuaUmur.toLocaleString('id-ID')} Jiwa`}
            highlightColor="blue"
            icon={<Users className="w-4 h-4" />}
          />

          <KpiCard
            title="2. Total Kunjungan Lansia"
            value={metrics.totalKunjungan}
            unit="Kunjungan"
            delta={metrics.deltaKunjungan}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula="SUM kunjungan lansia ke faskes/posyandu"
            highlightColor="blue"
            icon={<HeartPulse className="w-4 h-4" />}
          />

          <KpiCard
            title="3. Lansia Diskrining (>60 Thn)"
            value={metrics.totalSkrining}
            unit="Lansia"
            delta={metrics.deltaSkrining}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula="SUM skrining kesehatan lansia standar"
            highlightColor="emerald"
            icon={<UserCheck className="w-4 h-4" />}
          />

          <KpiCard
            title="4. Cakupan Skrining Lansia"
            value={`${metrics.persentaseSkrining.toFixed(1)}%`}
            unit={`Capaian SPM`}
            delta={metrics.deltaSkrining}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula="(Jumlah Skrining / Sasaran Lansia 60 Ke Atas) × 100%"
            highlightColor="emerald"
            icon={<Activity className="w-4 h-4" />}
          />

          <KpiCard
            title="5. Lansia dengan Kelainan"
            value={metrics.lansiaDenganKelainan}
            unit="Kasus"
            delta={metrics.deltaKelainan}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={false}
            aggregationFormula="SUM lansia terdeteksi memiliki minimal 1 kelainan"
            highlightColor="amber"
            icon={<AlertCircle className="w-4 h-4" />}
          />

          <KpiCard
            title="6. Total Kasus Penyakit"
            value={metrics.totalKasusPenyakit}
            unit="Kasus"
            delta={metrics.deltaPenyakit}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={false}
            aggregationFormula="SUM seluruh diagnosa penyakit pada periode"
            highlightColor="rose"
            icon={<AlertTriangle className="w-4 h-4" />}
          />

          <KpiCard
            title="7. Lansia Diobati"
            value={metrics.diobati}
            unit={`Lansia (${metrics.persentasePengobatan.toFixed(1)}%)`}
            delta={metrics.deltaDiobati}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula="SUM lansia dengan kelainan yang mendapat pengobatan"
            highlightColor="emerald"
            icon={<Pill className="w-4 h-4" />}
          />

          <KpiCard
            title="8. Lansia Dirujuk ke FKRTL"
            value={metrics.dirujuk}
            unit={`Lansia (${metrics.persentaseRujukan.toFixed(1)}%)`}
            delta={metrics.deltaDirujuk}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={false}
            aggregationFormula="SUM lansia dirujuk ke rumah sakit lanjutan"
            highlightColor="indigo"
            icon={<Send className="w-4 h-4" />}
          />

          <KpiCard
            title="9. Kunjungan Rumah (Home Care)"
            value={metrics.kunjunganRumah}
            unit="Kunjungan"
            delta={metrics.deltaKunjunganRumah}
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula="SUM kunjungan rumah oleh nakes ke lansia risti"
            highlightColor="blue"
            icon={<Home className="w-4 h-4" />}
          />

          <KpiCard
            title="10. Posyandu / Posbindu Aktif"
            value={metrics.posbinduAktif}
            unit="Pos Aktif"
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula="LAST VALUE status aktif pos pelayanan"
            highlightColor="emerald"
            icon={<Heart className="w-4 h-4" />}
          />

          <KpiCard
            title="11. Jumlah Puskesmas Terdata"
            value={metrics.jumlahPuskesmas}
            unit="Puskesmas"
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula="DISTINCT COUNT puskesmas yang melaporkan data"
            highlightColor="slate"
            icon={<Building2 className="w-4 h-4" />}
          />

          <KpiCard
            title="12. Jumlah Kelurahan Terdata"
            value={metrics.jumlahKelurahan}
            unit="Kelurahan"
            periodCompareLabel={comparePeriodLabel}
            isPositiveWhenRising={true}
            aggregationFormula="DISTINCT COUNT kelurahan di wilayah kerja"
            highlightColor="slate"
            icon={<MapPin className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Row 2: Charts (Tren Kunjungan & Skrining + Distribusi Penyakit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TrendLineChart
            title="Tren Kunjungan & Skrining Lansia"
            subtitle={`Januari – Desember ${filters.year} (Perbandingan Progresivitas Pelayanan)`}
            series={[
              { name: 'Kunjungan Lansia', color: '#2563eb', data: monthlyKunjungan },
              { name: 'Skrining Lansia', color: '#0d9488', data: monthlySkrining },
            ]}
            periodLabel={`Tahun ${filters.year}`}
            yAxisUnit="Jiwa"
          />
        </div>

        <div className="lg:col-span-5">
          <ComparisonBarChart
            title="Ranking Kasus Penyakit & Faktor Risiko"
            subtitle="Diurutkan berdasarkan kasus terbanyak pada periode ini"
            items={diseaseRanking.map((d) => ({
              label: d.name,
              sublabel: d.category,
              value: d.cases,
              percentage: d.percentageOfCases,
              color: d.id === 'hipertensi' ? 'bg-rose-600' : d.id === 'diabetesMelitus' ? 'bg-amber-600' : 'bg-blue-600',
            }))}
            valueUnit="Kasus"
            maxDisplay={6}
            periodLabel={periodLabel}
          />
        </div>
      </div>

      {/* Row 3: Peta GIS & Puskesmas Comparative Table */}
      <div className="space-y-4">
        <PaluGisMap
          puskesmasStats={puskesmasStats}
          rawRecords={filteredRecords}
          periodLabel={periodLabel}
        />
      </div>

      {/* Row 4: Alert & Monitoring Summary + AI Insight Preview (Section 36) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Peringatan Dini & Deteksi Masalah Program
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveMenu('alert-masalah')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua Alert</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {metrics.persentaseSkrining < 50 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900">Cakupan Skrining di Bawah Target</span>
                  <p className="text-amber-800 mt-0.5">
                    Cakupan skrining baru mencapai {metrics.persentaseSkrining.toFixed(1)}% dari sasaran lansia {metrics.totalSasaran.toLocaleString('id-ID')} jiwa.
                  </p>
                </div>
              </div>
            )}

            {metrics.tidakDiobati > 0 && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-900">Lansia Kelainan Belum Diobati</span>
                  <p className="text-rose-800 mt-0.5">
                    Terdapat {metrics.tidakDiobati.toLocaleString('id-ID')} lansia ({metrics.persentaseTidakDiobati.toFixed(1)}%) dengan kelainan yang tercatat belum mendapatkan tatalaksana pengobatan.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-900">Beban Penyakit Tertinggi: {diseaseRanking[0]?.name}</span>
                <p className="text-blue-800 mt-0.5">
                  Menyumbang {diseaseRanking[0]?.cases.toLocaleString('id-ID')} kasus ({diseaseRanking[0]?.percentageOfCases.toFixed(1)}% dari seluruh kelainan).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight preview */}
        <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                AI Health Analyst
              </span>
              <span className="text-xs text-slate-400">{periodLabel}</span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              Analisis Intelijen Berbasis Data Riil
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              AI secara otomatis mengevaluasi korelasi sasaran ({metrics.totalSasaran.toLocaleString('id-ID')}), skrining ({metrics.totalSkrining.toLocaleString('id-ID')}), kasus penyakit metabolik ({diseaseRanking[0]?.name}), serta tingkat keterjangkauan intervensi tanpa halusinasi data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveMenu('ai-analyst')}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buka Analisis Menyeluruh dengan AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
