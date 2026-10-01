import React from 'react';
import { HeartHandshake, CheckCircle2, AlertCircle, ShieldAlert, Award } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { DonutChart } from '../components/charts/DonutChart';
import { StackedBarChart, StackedRow } from '../components/charts/StackedBarChart';
import { TrendLineChart } from '../components/charts/TrendLineChart';

export const KemandirianView: React.FC = () => {
  const { filteredRecords, periodLabel, puskesmasStats, dataset, filters } = useDashboard();

  let totalA = 0;
  let totalBRingan = 0;
  let totalBSedang = 0;
  let totalCBerat = 0;
  let totalCTotal = 0;

  filteredRecords.forEach((r) => {
    totalA += r.kemandirianA;
    totalBRingan += r.kemandirianBRingan;
    totalBSedang += r.kemandirianBSedang;
    totalCBerat += r.kemandirianCBerat;
    totalCTotal += r.kemandirianCTotal;
  });

  const grandTotal = totalA + totalBRingan + totalBSedang + totalCBerat + totalCTotal;

  // Stacked rows by Puskesmas
  const stackedRows: StackedRow[] = puskesmasStats.map((p) => {
    const pRecords = filteredRecords.filter((r) => r.puskesmas === p.puskesmas);
    const a = pRecords.reduce((acc, r) => acc + r.kemandirianA, 0);
    const br = pRecords.reduce((acc, r) => acc + r.kemandirianBRingan, 0);
    const bs = pRecords.reduce((acc, r) => acc + r.kemandirianBSedang, 0);
    const cb = pRecords.reduce((acc, r) => acc + r.kemandirianCBerat, 0);
    const ct = pRecords.reduce((acc, r) => acc + r.kemandirianCTotal, 0);

    return {
      label: p.puskesmas.replace('Puskesmas ', ''),
      segments: [
        { name: 'Kategori A (Mandiri)', value: a, color: '#16a34a' },
        { name: 'Kategori B Ringan', value: br, color: '#3b82f6' },
        { name: 'Kategori B Sedang', value: bs, color: '#f59e0b' },
        { name: 'Kategori C Berat', value: cb, color: '#ea580c' },
        { name: 'Kategori C Total', value: ct, color: '#dc2626' },
      ],
    };
  });

  // Monthly trend for Mandiri vs Ketergantungan
  const trendMandiri = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.kemandirianA, 0);
  });

  const trendTergantung = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + (r.kemandirianBRingan + r.kemandirianBSedang + r.kemandirianCBerat + r.kemandirianCTotal), 0);
  });

  return (
    <div className="space-y-6">
      <PeriodBanner />

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-blue-600" />
          Tingkat Kemandirian Lansia (Aktivitas Sehari-hari / ADL Barthel Index)
        </h2>
        <span className="text-xs text-slate-500">{periodLabel}</span>
      </div>

      {/* 5 Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Kategori A (Mandiri)</span>
          <span className="text-xl font-extrabold text-emerald-800 block mt-1">{totalA.toLocaleString('id-ID')}</span>
          <span className="text-xs text-emerald-700 font-bold block mt-1">
            {grandTotal > 0 ? ((totalA / grandTotal) * 100).toFixed(1) : 0}% Lansia
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Dapat melakukan ADL tanpa bantuan</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs border-l-4 border-l-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Kategori B (Ringan)</span>
          <span className="text-xl font-extrabold text-blue-800 block mt-1">{totalBRingan.toLocaleString('id-ID')}</span>
          <span className="text-xs text-blue-700 font-bold block mt-1">
            {grandTotal > 0 ? ((totalBRingan / grandTotal) * 100).toFixed(1) : 0}% Lansia
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Perlu sedikit bantuan ADL</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Kategori B (Sedang)</span>
          <span className="text-xl font-extrabold text-amber-800 block mt-1">{totalBSedang.toLocaleString('id-ID')}</span>
          <span className="text-xs text-amber-700 font-bold block mt-1">
            {grandTotal > 0 ? ((totalBSedang / grandTotal) * 100).toFixed(1) : 0}% Lansia
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Bantuan sebagian aktivitas</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs border-l-4 border-l-orange-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Kategori C (Berat)</span>
          <span className="text-xl font-extrabold text-orange-800 block mt-1">{totalCBerat.toLocaleString('id-ID')}</span>
          <span className="text-xs text-orange-700 font-bold block mt-1">
            {grandTotal > 0 ? ((totalCBerat / grandTotal) * 100).toFixed(1) : 0}% Lansia
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Perlu pendampingan intensif</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs border-l-4 border-l-rose-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Kategori C (Total)</span>
          <span className="text-xl font-extrabold text-rose-800 block mt-1">{totalCTotal.toLocaleString('id-ID')}</span>
          <span className="text-xs text-rose-700 font-bold block mt-1">
            {grandTotal > 0 ? ((totalCTotal / grandTotal) * 100).toFixed(1) : 0}% Lansia
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Tirah baring / Sasaran LTC Home Care</p>
        </div>
      </div>

      {/* Donut & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <DonutChart
            title="Komposisi Kemandirian Lansia"
            subtitle="Distribusi ADL Barthel Index hasil skrining"
            segments={[
              { name: 'Kategori A (Mandiri)', value: totalA, color: '#16a34a' },
              { name: 'Kategori B Ringan', value: totalBRingan, color: '#3b82f6' },
              { name: 'Kategori B Sedang', value: totalBSedang, color: '#f59e0b' },
              { name: 'Kategori C Berat', value: totalCBerat, color: '#ea580c' },
              { name: 'Kategori C Total', value: totalCTotal, color: '#dc2626' },
            ]}
            centerLabel="Total Dievaluasi"
            centerValue={grandTotal}
            periodLabel={periodLabel}
          />
        </div>

        <div className="lg:col-span-7">
          <TrendLineChart
            title="Tren Bulanan: Lansia Mandiri vs Butuh Bantuan"
            subtitle={`Januari – Desember ${filters.year}`}
            series={[
              { name: 'Lansia Mandiri (Kat. A)', color: '#16a34a', data: trendMandiri },
              { name: 'Memerlukan Bantuan (Kat. B & C)', color: '#ea580c', data: trendTergantung },
            ]}
            periodLabel={`Tahun ${filters.year}`}
            yAxisUnit="Lansia"
          />
        </div>
      </div>

      {/* Stacked Bar by Puskesmas (Section 11 requirement) */}
      <StackedBarChart
        title="Distribusi Tingkat Kemandirian per Puskesmas"
        subtitle="Proporsi kategori A, B, dan C di 12 Puskesmas Kota Palu"
        rows={stackedRows}
        periodLabel={periodLabel}
      />
    </div>
  );
};
