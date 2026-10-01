import React from 'react';
import { UserCheck, AlertCircle, CheckCircle2, Send, Activity, Info } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { KpiCard } from '../components/KpiCard';
import { FunnelChart } from '../components/charts/FunnelChart';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';
import { TrendLineChart } from '../components/charts/TrendLineChart';

export const SkriningView: React.FC = () => {
  const { metrics, periodLabel, filters, puskesmasStats, dataset } = useDashboard();

  // Monthly trend for Screening
  const monthlySkrining = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => {
        if (r.tahun !== filters.year || r.bulan !== month) return false;
        if (filters.puskesmas !== 'ALL' && r.puskesmas !== filters.puskesmas) return false;
        if (filters.kelurahan !== 'ALL' && r.kelurahan !== filters.kelurahan) return false;
        return true;
      })
      .reduce((acc, r) => acc + r.skriningLansia, 0);
  });

  const monthlyKelainan = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => {
        if (r.tahun !== filters.year || r.bulan !== month) return false;
        if (filters.puskesmas !== 'ALL' && r.puskesmas !== filters.puskesmas) return false;
        if (filters.kelurahan !== 'ALL' && r.kelurahan !== filters.kelurahan) return false;
        return true;
      })
      .reduce((acc, r) => acc + r.lansiaDenganKelainan, 0);
  });

  return (
    <div className="space-y-6">
      {/* Information Banner for Formula & Focus */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-blue-950">
            Fokus Standar Pelayanan Minimal (SPM) Kesehatan Lansia: Usia ≥60 Tahun
          </p>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            Sesuai regulasi Kemenkes RI, <strong>Cakupan Skrining Lansia</strong> dihitung dengan rumus:{' '}
            <code className="bg-blue-100/90 text-blue-900 px-1.5 py-0.5 rounded font-mono font-bold">
              (Jumlah Lansia Diskrining ÷ Sasaran Lansia 60 Tahun ke Atas) × 100%
            </code>. Kelompok umur 45–59 tahun merupakan Pra-lansia untuk pemantauan faktor risiko dini.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Lansia Diskrining (>60 Thn)"
          value={metrics.totalSkrining}
          unit="Lansia"
          delta={metrics.deltaSkrining}
          aggregationFormula="SUM lansia diskrining kesehatan standar"
          highlightColor="blue"
          icon={<UserCheck className="w-4 h-4" />}
        />

        <KpiCard
          title="Cakupan Skrining Lansia (60+ Thn)"
          value={`${metrics.persentaseSkrining.toFixed(1)}%`}
          unit="Capaian SPM"
          delta={metrics.deltaSkrining}
          aggregationFormula="(Jumlah Skrining / Sasaran Lansia 60 Ke Atas) × 100%"
          highlightColor="emerald"
          icon={<Activity className="w-4 h-4" />}
        />

        <KpiCard
          title="Ditemukan Kelainan / Risiko"
          value={metrics.lansiaDenganKelainan}
          unit={`Kasus (${metrics.persentaseKelainan.toFixed(1)}%)`}
          delta={metrics.deltaKelainan}
          isPositiveWhenRising={false}
          aggregationFormula="(Lansia Kelainan / Total Skrining) × 100%"
          highlightColor="amber"
          icon={<AlertCircle className="w-4 h-4" />}
        />

        <KpiCard
          title="Persentase Pengobatan Kelainan"
          value={`${metrics.persentasePengobatan.toFixed(1)}%`}
          unit={`${metrics.diobati.toLocaleString('id-ID')} Diobati`}
          delta={metrics.deltaDiobati}
          isPositiveWhenRising={true}
          aggregationFormula="(Lansia Diobati / Lansia Kelainan) × 100%"
          highlightColor="emerald"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </div>

      {/* Main Funnel Pipeline Chart (Section 8 requirement) */}
      <FunnelChart
        sasaran={metrics.totalSasaran60Plus || metrics.totalSasaran}
        kunjungan={metrics.totalKunjungan}
        skrining={metrics.totalSkrining}
        kelainan={metrics.lansiaDenganKelainan}
        diobati={metrics.diobati}
        dirujuk={metrics.dirujuk}
        periodLabel={periodLabel}
      />

      {/* Trend & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TrendLineChart
            title="Tren Bulanan Skrining vs Ditemukan Kelainan"
            subtitle={`Januari – Desember ${filters.year}`}
            series={[
              { name: 'Lansia Diskrining', color: '#0d9488', data: monthlySkrining },
              { name: 'Ditemukan Kelainan', color: '#f59e0b', data: monthlyKelainan },
            ]}
            periodLabel={`Tahun ${filters.year}`}
            yAxisUnit="Lansia"
          />
        </div>

        <div className="lg:col-span-5">
          <ComparisonBarChart
            title="Cakupan Skrining per Puskesmas"
            subtitle="Persentase lansia diskrining terhadap sasaran"
            items={puskesmasStats.map((p) => ({
              label: p.puskesmas.replace('Puskesmas ', ''),
              sublabel: `${p.skrining.toLocaleString('id-ID')} / ${p.sasaran.toLocaleString('id-ID')}`,
              value: p.skrining,
              percentage: p.persenSkrining,
              color: p.persenSkrining >= 70 ? 'bg-teal-600' : p.persenSkrining >= 50 ? 'bg-blue-600' : 'bg-amber-600',
            }))}
            valueUnit="Lansia"
            periodLabel={periodLabel}
            maxDisplay={12}
          />
        </div>
      </div>

      {/* Detailed Puskesmas Screening Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Tabel Capaian Skrining & Penemuan Kasus per Puskesmas ({periodLabel})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Puskesmas</th>
                <th className="py-2.5 px-3 text-right">Sasaran Lansia (60+)</th>
                <th className="py-2.5 px-3 text-right">Kunjungan</th>
                <th className="py-2.5 px-3 text-right">Skrining</th>
                <th className="py-2.5 px-3 text-right">Cakupan Skrining (%)</th>
                <th className="py-2.5 px-3 text-right">Kelainan</th>
                <th className="py-2.5 px-3 text-right">% Kelainan</th>
                <th className="py-2.5 px-3 text-right">Diobati</th>
                <th className="py-2.5 px-3 text-right">Dirujuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {puskesmasStats.map((p, idx) => {
                const pctKel = p.skrining > 0 ? (p.kelainan / p.skrining) * 100 : 0;
                return (
                  <tr key={`${p.puskesmas}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{p.puskesmas}</td>
                    <td className="py-2.5 px-3 text-right">{p.sasaran.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right">{p.kunjungan.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-teal-800">{p.skrining.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-blue-700">
                      {p.persenSkrining.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-800 font-semibold">{p.kelainan.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right text-amber-700">{pctKel.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{p.diobati.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right text-rose-700">{p.dirujuk.toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
