import React from 'react';
import { CalendarRange, Users, Scale, Activity } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { DonutChart } from '../components/charts/DonutChart';
import { StackedBarChart, StackedRow } from '../components/charts/StackedBarChart';
import { TrendLineChart } from '../components/charts/TrendLineChart';

export const KelompokUmurView: React.FC = () => {
  const { filteredRecords, periodLabel, dataset, filters, puskesmasStats } = useDashboard();

  // Aggregate current period by age group
  let sum45_59 = 0;
  let sum60_69 = 0;
  let sum70Plus = 0;

  filteredRecords.forEach((r) => {
    sum45_59 += r.kunjunganUmur45_59;
    sum60_69 += r.kunjunganUmur60_69;
    sum70Plus += r.kunjunganUmur70Plus;
  });

  const totalAll = sum45_59 + sum60_69 + sum70Plus;
  const total60Plus = sum60_69 + sum70Plus;
  const pct60Plus = totalAll > 0 ? (total60Plus / totalAll) * 100 : 0;

  // Monthly trend by age group across Jan-Dec
  const trend45_59 = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.kunjunganUmur45_59, 0);
  });

  const trend60_69 = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.kunjunganUmur60_69, 0);
  });

  const trend70Plus = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.kunjunganUmur70Plus, 0);
  });

  // Stacked rows by Puskesmas showing Age distribution
  const stackedRows: StackedRow[] = puskesmasStats.map((p) => {
    const pRecords = filteredRecords.filter((r) => r.puskesmas === p.puskesmas);
    const u45 = pRecords.reduce((acc, r) => acc + r.kunjunganUmur45_59, 0);
    const u60 = pRecords.reduce((acc, r) => acc + r.kunjunganUmur60_69, 0);
    const u70 = pRecords.reduce((acc, r) => acc + r.kunjunganUmur70Plus, 0);

    return {
      label: p.puskesmas.replace('Puskesmas ', ''),
      segments: [
        { name: '45–59 Thn', value: u45, color: '#38bdf8' },
        { name: '60–69 Thn', value: u60, color: '#3b82f6' },
        { name: '70+ Thn', value: u70, color: '#1e3a8a' },
      ],
    };
  });

  return (
    <div className="space-y-6">
      <PeriodBanner />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-sky-500">
          <span className="text-xs font-semibold text-slate-600 block">45–59 Tahun (Pra-Lansia)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{sum45_59.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-500">Kunjungan</span>
          </div>
          <span className="text-xs text-sky-700 font-bold block mt-2">
            {totalAll > 0 ? ((sum45_59 / totalAll) * 100).toFixed(1) : 0}% dari Total
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-blue-600">
          <span className="text-xs font-semibold text-slate-600 block">60–69 Tahun (Lansia Muda)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{sum60_69.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-500">Kunjungan</span>
          </div>
          <span className="text-xs text-blue-700 font-bold block mt-2">
            {totalAll > 0 ? ((sum60_69 / totalAll) * 100).toFixed(1) : 0}% dari Total
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-indigo-800">
          <span className="text-xs font-semibold text-slate-600 block">70+ Tahun (Lansia Risti)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{sum70Plus.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-500">Kunjungan</span>
          </div>
          <span className="text-xs text-indigo-800 font-bold block mt-2">
            {totalAll > 0 ? ((sum70Plus / totalAll) * 100).toFixed(1) : 0}% dari Total
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-xs font-semibold text-slate-600 block">Total Lansia Usia ≥60 Tahun</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-800">{total60Plus.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-500">Kunjungan</span>
          </div>
          <span className="text-xs text-emerald-700 font-bold block mt-2">
            {pct60Plus.toFixed(1)}% Populasi Lansia Murni
          </span>
        </div>
      </div>

      {/* Donut & Stacked Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <DonutChart
            title="Proporsi Kelompok Umur"
            subtitle="Distribusi kunjungan menurut kategori usia"
            segments={[
              { name: '45–59 Thn', value: sum45_59, color: '#38bdf8' },
              { name: '60–69 Thn', value: sum60_69, color: '#3b82f6' },
              { name: '70+ Thn', value: sum70Plus, color: '#1e3a8a' },
            ]}
            centerLabel="Total Kunjungan"
            centerValue={totalAll}
            periodLabel={periodLabel}
          />
        </div>

        <div className="lg:col-span-7">
          <TrendLineChart
            title="Tren Bulanan Menurut Kelompok Umur"
            subtitle={`Januari – Desember ${filters.year}`}
            series={[
              { name: '45–59 Thn', color: '#38bdf8', data: trend45_59 },
              { name: '60–69 Thn', color: '#3b82f6', data: trend60_69 },
              { name: '70+ Thn', color: '#1e3a8a', data: trend70Plus },
            ]}
            periodLabel={`Tahun ${filters.year}`}
            yAxisUnit="Kunjungan"
          />
        </div>
      </div>

      {/* Puskesmas Distribution Stacked Bar */}
      <StackedBarChart
        title="Distribusi Kelompok Umur per Puskesmas"
        subtitle="Komposisi usia pengunjung lansia di setiap Puskesmas"
        rows={stackedRows}
        periodLabel={periodLabel}
      />
    </div>
  );
};
