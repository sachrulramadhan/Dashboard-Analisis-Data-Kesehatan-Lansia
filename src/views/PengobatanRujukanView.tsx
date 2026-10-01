import React, { useState, useEffect, useMemo } from 'react';
import { Pill, Send, CheckCircle2, AlertCircle, TrendingUp, Info, Hospital, Stethoscope, ArrowRight } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { KpiCard } from '../components/KpiCard';
import { DonutChart } from '../components/charts/DonutChart';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';

type TabMode = 'semua' | 'pengobatan' | 'rujukan';

export const PengobatanRujukanView: React.FC = () => {
  const { metrics, periodLabel, puskesmasStats, dataset, filters, activeMenu, setActiveMenu } = useDashboard();

  const initialTab: TabMode = useMemo(() => {
    if (activeMenu === 'rujukan') return 'rujukan';
    if (activeMenu === 'pengobatan') return 'pengobatan';
    return 'semua';
  }, [activeMenu]);

  const [activeTab, setActiveTab] = useState<TabMode>(initialTab);

  useEffect(() => {
    if (activeMenu === 'rujukan') {
      setActiveTab('rujukan');
    } else if (activeMenu === 'pengobatan') {
      setActiveTab('pengobatan');
    }
  }, [activeMenu]);

  // Monthly trends for Diobati and Dirujuk
  const trendDiobati = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.diobati, 0);
  });

  const trendDirujuk = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.dirujuk, 0);
  });

  return (
    <div className="space-y-6">
      <PeriodBanner />

      {/* Navigasi Tab Pengobatan vs Rujukan */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {activeTab === 'pengobatan' && <Pill className="w-4 h-4 text-emerald-600" />}
              {activeTab === 'rujukan' && <Send className="w-4 h-4 text-indigo-600" />}
              {activeTab === 'semua' && <Stethoscope className="w-4 h-4 text-blue-600" />}
              {activeTab === 'pengobatan' 
                ? 'Tatalaksana & Pengobatan Lansia di Puskesmas' 
                : activeTab === 'rujukan'
                ? 'Sistem Rujukan Pasien Lansia ke RS (FKRTL)'
                : 'Intervensi Medis: Pengobatan & Sistem Rujukan'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola penanganan lansia yang ditemukan memiliki kelainan dari hasil skrining kesehatan.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('semua');
                setActiveMenu('pengobatan');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'semua'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Intervensi
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('pengobatan');
                setActiveMenu('pengobatan');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pengobatan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              Fokus Pengobatan
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('rujukan');
                setActiveMenu('rujukan');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rujukan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Fokus Rujukan FKRTL
            </button>
          </div>
        </div>

        {activeTab === 'pengobatan' && (
          <div className="mt-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Sub-Menu Pengobatan:</span>
              Menampilkan efektivitas tatalaksana farmakologis dan non-farmakologis lansia dengan kelainan di Puskesmas. Indikator utama mencakup <strong>Persentase Diobati ({metrics.persentasePengobatan.toFixed(1)}%)</strong> dan kesenjangan <strong>Lansia Belum Diobati ({metrics.persentaseTidakDiobati.toFixed(1)}%)</strong> yang memerlukan tindak lanjut kader posyandu.
            </div>
          </div>
        )}

        {activeTab === 'rujukan' && (
          <div className="mt-3 p-3 bg-indigo-50/80 border border-indigo-200 rounded-lg text-xs text-indigo-950 flex items-start gap-2.5">
            <Hospital className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Sub-Menu Rujukan FKRTL:</span>
              Menampilkan alur transfer pasien lansia dengan kelainan kompleks yang memerlukan penanganan dokter spesialis di Rumah Sakit rujukan. Indikator utama mencakup <strong>Tingkat Rujukan ({metrics.persentaseRujukan.toFixed(1)}%)</strong> dan sebaran puskesmas dengan volume rujukan tertinggi.
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Lansia dengan Kelainan"
          value={metrics.lansiaDenganKelainan}
          unit="Kasus"
          delta={metrics.deltaKelainan}
          isPositiveWhenRising={false}
          highlightColor="amber"
          icon={<AlertCircle className="w-4 h-4" />}
        />

        <KpiCard
          title="Mendapat Pengobatan"
          value={metrics.diobati}
          unit={`Lansia (${metrics.persentasePengobatan.toFixed(1)}%)`}
          delta={metrics.deltaDiobati}
          isPositiveWhenRising={true}
          highlightColor="emerald"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />

        <KpiCard
          title="Belum Diobati / Drop out"
          value={metrics.tidakDiobati}
          unit={`Lansia (${metrics.persentaseTidakDiobati.toFixed(1)}%)`}
          isPositiveWhenRising={false}
          highlightColor="rose"
          icon={<Pill className="w-4 h-4" />}
        />

        <KpiCard
          title="Lansia Dirujuk ke FKRTL"
          value={metrics.dirujuk}
          unit={`Lansia (${metrics.persentaseRujukan.toFixed(1)}%)`}
          delta={metrics.deltaDirujuk}
          isPositiveWhenRising={false}
          highlightColor="indigo"
          icon={<Send className="w-4 h-4" />}
        />
      </div>

      {/* Tampilan Kondisional Berdasarkan Tab */}
      {(activeTab === 'semua' || activeTab === 'pengobatan') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <DonutChart
              title="Status Intervensi Lansia dengan Kelainan"
              subtitle="Proporsi pengobatan vs rujukan vs belum tertangani"
              segments={[
                { name: 'Diobati di Puskesmas', value: metrics.diobati, color: '#16a34a' },
                { name: 'Dirujuk ke RS / FKRTL', value: metrics.dirujuk, color: '#6366f1' },
                { name: 'Belum Diobati / Follow Up', value: metrics.tidakDiobati, color: '#e11d48' },
              ]}
              centerLabel="Total Kelainan"
              centerValue={metrics.lansiaDenganKelainan}
              periodLabel={periodLabel}
            />
          </div>

          <div className="lg:col-span-7">
            <TrendLineChart
              title="Tren Bulanan Lansia Diobati"
              subtitle={`Januari – Desember ${filters.year}`}
              series={[
                { name: 'Lansia Diobati', color: '#16a34a', data: trendDiobati },
                { name: 'Lansia Dirujuk', color: '#6366f1', data: trendDirujuk },
              ]}
              periodLabel={`Tahun ${filters.year}`}
              yAxisUnit="Lansia"
            />
          </div>
        </div>
      )}

      {/* Puskesmas Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(activeTab === 'semua' || activeTab === 'pengobatan') && (
          <ComparisonBarChart
            title="Persentase Pengobatan per Puskesmas"
            subtitle="Tingkat tatalaksana kelainan di fasilitas primer"
            items={puskesmasStats.map((p) => {
              const pct = p.kelainan > 0 ? (p.diobati / p.kelainan) * 100 : 0;
              return {
                label: p.puskesmas.replace('Puskesmas ', ''),
                sublabel: `${p.diobati.toLocaleString('id-ID')} dari ${p.kelainan.toLocaleString('id-ID')} kelainan`,
                value: p.diobati,
                percentage: pct,
                color: pct >= 80 ? 'bg-emerald-600' : 'bg-amber-600',
              };
            })}
            valueUnit="Lansia"
            periodLabel={periodLabel}
            maxDisplay={12}
          />
        )}

        {(activeTab === 'semua' || activeTab === 'rujukan') && (
          <div className={activeTab === 'rujukan' ? 'lg:col-span-2' : ''}>
            <ComparisonBarChart
              title="Lansia Dirujuk ke RS per Puskesmas"
              subtitle="Distribusi pasien lansia yang dirujuk ke fasilitas rujukan lanjutan (FKRTL)"
              items={puskesmasStats.map((p) => {
                const pct = p.kelainan > 0 ? (p.dirujuk / p.kelainan) * 100 : 0;
                return {
                  label: p.puskesmas.replace('Puskesmas ', ''),
                  sublabel: `${p.dirujuk.toLocaleString('id-ID')} rujukan (${pct.toFixed(1)}% dari kasus kelainan)`,
                  value: p.dirujuk,
                  percentage: pct,
                  color: 'bg-indigo-600',
                };
              })}
              valueUnit="Lansia"
              periodLabel={periodLabel}
              maxDisplay={12}
            />
          </div>
        )}
      </div>
    </div>
  );
};
