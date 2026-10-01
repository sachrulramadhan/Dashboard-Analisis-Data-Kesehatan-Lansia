import React from 'react';
import { Users, HeartPulse, Scale, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { KpiCard } from '../components/KpiCard';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { StackedBarChart, StackedRow } from '../components/charts/StackedBarChart';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';

export const SasaranKunjunganView: React.FC = () => {
  const { metrics, periodLabel, filters, puskesmasStats, kelurahanStats, dataset } = useDashboard();

  // Top & Bottom Puskesmas by Kunjungan
  const sortedPuskesmas = [...puskesmasStats].sort((a, b) => b.kunjungan - a.kunjungan);
  const highestPuskesmas = sortedPuskesmas[0];
  const lowestPuskesmas = sortedPuskesmas[sortedPuskesmas.length - 1];

  // Top & Bottom Kelurahan by Kunjungan
  const sortedKelurahan = [...kelurahanStats].sort((a, b) => b.kunjungan - a.kunjungan);
  const highestKelurahan = sortedKelurahan[0];
  const lowestKelurahan = sortedKelurahan[sortedKelurahan.length - 1];

  // Stacked rows by Puskesmas (Gender breakdown: Laki-laki vs Perempuan)
  const stackedGenderRows: StackedRow[] = puskesmasStats.map((p) => {
    // derive ratio from filtered dataset
    const pRecords = dataset.filter((r) => {
      if (r.tahun !== filters.year) return false;
      if (filters.mode === 'monthly' && r.bulan !== filters.month) return false;
      return r.puskesmas === p.puskesmas;
    });

    const laki = pRecords.reduce((acc, r) => acc + r.kunjunganLaki, 0);
    const perempuan = pRecords.reduce((acc, r) => acc + r.kunjunganPerempuan, 0);

    return {
      label: p.puskesmas.replace('Puskesmas ', ''),
      segments: [
        { name: 'Laki-laki', value: laki, color: '#3b82f6' },
        { name: 'Perempuan', value: perempuan, color: '#ec4899' },
      ],
    };
  });

  // Monthly trend for current filter
  const monthlyKunjungan = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => {
        if (r.tahun !== filters.year || r.bulan !== month) return false;
        if (filters.puskesmas !== 'ALL' && r.puskesmas !== filters.puskesmas) return false;
        if (filters.kelurahan !== 'ALL' && r.kelurahan !== filters.kelurahan) return false;
        return true;
      })
      .reduce((acc, r) => acc + r.kunjunganLansia, 0);
  });

  return (
    <div className="space-y-6">
      <PeriodBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Sasaran Lansia (60+ Thn)"
          value={metrics.totalSasaran}
          unit="Jiwa (SPM)"
          delta={metrics.deltaSasaran}
          aggregationFormula={`Fokus Utama: Lansia Usia ≥60 Tahun. Total populasi termasuk Pra-lansia (45-59): ${metrics.totalSasaranSemuaUmur.toLocaleString('id-ID')} Jiwa`}
          highlightColor="blue"
          icon={<Users className="w-4 h-4" />}
        />

        <KpiCard
          title="Total Kunjungan Lansia"
          value={metrics.totalKunjungan}
          unit="Kunjungan"
          delta={metrics.deltaKunjungan}
          aggregationFormula="SUM kunjungan seluruh fasilitas"
          highlightColor="emerald"
          icon={<HeartPulse className="w-4 h-4" />}
        />

        <KpiCard
          title="Rasio Kunjungan thd Sasaran"
          value={`${metrics.rasioKunjunganSasaran.toFixed(1)}%`}
          delta={metrics.deltaKunjungan}
          aggregationFormula="(Total Kunjungan / Sasaran Lansia) × 100%"
          highlightColor="indigo"
          icon={<Scale className="w-4 h-4" />}
        />

        <KpiCard
          title="Rata-rata Kunjungan per Puskesmas"
          value={
            metrics.jumlahPuskesmas > 0
              ? Math.round(metrics.totalKunjungan / metrics.jumlahPuskesmas)
              : 0
          }
          unit="Kunjungan / Puskesmas"
          highlightColor="slate"
          icon={<Award className="w-4 h-4" />}
        />
      </div>

      {/* Top & Low Summary Cards (Section 7 requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            Puskesmas Kunjungan Tertinggi
          </span>
          <h4 className="text-sm font-bold text-slate-900">{highestPuskesmas?.puskesmas || '-'}</h4>
          <p className="text-base font-extrabold text-emerald-800 mt-1">
            {highestPuskesmas?.kunjungan.toLocaleString('id-ID')} Kunjungan
          </p>
          <span className="text-[10px] text-slate-500">
            Cakupan: {highestPuskesmas?.persenSkrining.toFixed(1)}%
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
            Puskesmas Kunjungan Terendah
          </span>
          <h4 className="text-sm font-bold text-slate-900">{lowestPuskesmas?.puskesmas || '-'}</h4>
          <p className="text-base font-extrabold text-amber-800 mt-1">
            {lowestPuskesmas?.kunjungan.toLocaleString('id-ID')} Kunjungan
          </p>
          <span className="text-[10px] text-slate-500">
            Cakupan: {lowestPuskesmas?.persenSkrining.toFixed(1)}%
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            Kelurahan Kunjungan Tertinggi
          </span>
          <h4 className="text-sm font-bold text-slate-900">{highestKelurahan?.kelurahan || '-'}</h4>
          <p className="text-base font-extrabold text-emerald-800 mt-1">
            {highestKelurahan?.kunjungan.toLocaleString('id-ID')} Kunjungan
          </p>
          <span className="text-[10px] text-slate-500">
            Wilayah: {highestKelurahan?.puskesmas}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
            Kelurahan Kunjungan Terendah
          </span>
          <h4 className="text-sm font-bold text-slate-900">{lowestKelurahan?.kelurahan || '-'}</h4>
          <p className="text-base font-extrabold text-amber-800 mt-1">
            {lowestKelurahan?.kunjungan.toLocaleString('id-ID')} Kunjungan
          </p>
          <span className="text-[10px] text-slate-500">
            Wilayah: {lowestKelurahan?.puskesmas}
          </span>
        </div>
      </div>

      {/* Monthly Trend & Gender Stacked Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <TrendLineChart
            title="Tren Kunjungan Bulanan (Januari – Desember)"
            subtitle={`Pola kunjungan lansia sepanjang tahun ${filters.year}`}
            series={[
              { name: 'Kunjungan Lansia', color: '#2563eb', data: monthlyKunjungan },
            ]}
            periodLabel={`Tahun ${filters.year}`}
            yAxisUnit="Kunjungan"
          />
        </div>

        <div className="lg:col-span-6">
          <StackedBarChart
            title="Distribusi Kunjungan Berdasarkan Jenis Kelamin"
            subtitle="Perbandingan kunjungan Lansia Laki-laki vs Perempuan per Puskesmas"
            rows={stackedGenderRows}
            periodLabel={periodLabel}
          />
        </div>
      </div>

      {/* Puskesmas Comparison Ranking */}
      <ComparisonBarChart
        title="Peringkat Kunjungan Lansia Antar Puskesmas"
        subtitle="Total kunjungan lansia pada periode terpilih"
        items={sortedPuskesmas.map((p) => ({
          label: p.puskesmas,
          sublabel: `Sasaran: ${p.sasaran.toLocaleString('id-ID')}`,
          value: p.kunjungan,
          percentage: (p.kunjungan / p.sasaran) * 100,
          color: 'bg-blue-600',
        }))}
        valueUnit="Kunjungan"
        periodLabel={periodLabel}
        maxDisplay={12}
      />
    </div>
  );
};
