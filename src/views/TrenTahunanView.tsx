import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Layers, 
  Activity,
  Award
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { MONTH_NAMES } from '../data/mockHealthData';

type TrendMetricKey = 
  | 'kunjunganLansia'
  | 'skriningLansia'
  | 'lansiaDenganKelainan'
  | 'totalPenyakitBulanIni'
  | 'diobati'
  | 'dirujuk'
  | 'jumlahKunjunganRumah'
  | 'sasaranLansia';

interface MetricOption {
  key: TrendMetricKey;
  label: string;
  unit: string;
  color: string;
  isStock?: boolean;
}

const METRIC_OPTIONS: MetricOption[] = [
  { key: 'kunjunganLansia', label: 'Kunjungan Lansia', unit: 'Kunjungan', color: '#2563eb' },
  { key: 'skriningLansia', label: 'Lansia Diskrining (>60 thn)', unit: 'Lansia', color: '#0d9488' },
  { key: 'lansiaDenganKelainan', label: 'Lansia dengan Kelainan', unit: 'Kasus', color: '#f59e0b' },
  { key: 'totalPenyakitBulanIni', label: 'Total Kasus Penyakit', unit: 'Kasus', color: '#dc2626' },
  { key: 'diobati', label: 'Lansia Diobati', unit: 'Lansia', color: '#16a34a' },
  { key: 'dirujuk', label: 'Lansia Dirujuk', unit: 'Lansia', color: '#9333ea' },
  { key: 'jumlahKunjunganRumah', label: 'Kunjungan Rumah', unit: 'Kunjungan', color: '#0284c7' },
  { key: 'sasaranLansia', label: 'Sasaran Lansia (Stok)', unit: 'Jiwa', color: '#475569', isStock: true },
];

export const TrenTahunanView: React.FC = () => {
  const { dataset, filters } = useDashboard();
  const [selectedMetricKey, setSelectedMetricKey] = useState<TrendMetricKey>('kunjunganLansia');

  const selectedMetric = METRIC_OPTIONS.find((m) => m.key === selectedMetricKey)!;

  // Compute 12-month array
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const records = dataset.filter((r) => {
      if (r.tahun !== filters.year) return false;
      if (r.bulan !== month) return false;
      if (filters.puskesmas !== 'ALL' && r.puskesmas !== filters.puskesmas) return false;
      if (filters.kelurahan !== 'ALL' && r.kelurahan !== filters.kelurahan) return false;
      return true;
    });

    if (selectedMetric.isStock) {
      // Sasaran: MAX per unique kelurahan
      const kelMap = new Map<string, number>();
      records.forEach((r) => {
        const k = `${r.puskesmas}__${r.kelurahan}`;
        if (!kelMap.has(k) || r.sasaranLansia > kelMap.get(k)!) {
          kelMap.set(k, r.sasaranLansia);
        }
      });
      let sum = 0;
      kelMap.forEach((v) => (sum += v));
      return sum;
    }

    return records.reduce((acc, r) => acc + (r[selectedMetricKey] as number), 0);
  });

  // Calculate annual statistics
  const totalTahunan = selectedMetric.isStock
    ? Math.max(...monthlyData, 0)
    : monthlyData.reduce((acc, v) => acc + v, 0);

  const rataRataBulanan = monthlyData.length > 0 ? totalTahunan / 12 : 0;

  // Max and Min values and corresponding months
  let maxVal = -Infinity;
  let maxMonthIdx = 0;
  let minVal = Infinity;
  let minMonthIdx = 0;

  monthlyData.forEach((v, idx) => {
    if (v > maxVal) {
      maxVal = v;
      maxMonthIdx = idx;
    }
    if (v < minVal) {
      minVal = v;
      minMonthIdx = idx;
    }
  });

  // Month with biggest change (MoM delta)
  let maxChangePct = 0;
  let maxChangeMonthIdx = 1;
  let maxChangeType: 'up' | 'down' = 'up';

  for (let i = 1; i < 12; i++) {
    const prev = monthlyData[i - 1];
    const curr = monthlyData[i];
    if (prev > 0) {
      const changePct = ((curr - prev) / prev) * 100;
      if (Math.abs(changePct) > Math.abs(maxChangePct)) {
        maxChangePct = changePct;
        maxChangeMonthIdx = i;
        maxChangeType = changePct >= 0 ? 'up' : 'down';
      }
    }
  }

  return (
    <div className="space-y-6">
      <PeriodBanner />

      {/* Header & Metric Picker */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Tren Tahunan: Capaian Kumulatif Januari – Desember {filters.year}
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi fluktuasi bulanan, konsistensi pelaporan, dan lonjakan kasus sepanjang tahun
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Pilih Indikator Tren:</span>
            <select
              value={selectedMetricKey}
              onChange={(e) => setSelectedMetricKey(e.target.value as TrendMetricKey)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-blue-500"
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 Annual Stat Cards (Section 23 requirement) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Tahunan</span>
            <span className="text-lg font-extrabold text-blue-800">
              {totalTahunan.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 block">{selectedMetric.unit}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Rata-rata Bulanan</span>
            <span className="text-lg font-extrabold text-slate-800">
              {Math.round(rataRataBulanan).toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 block">{selectedMetric.unit} / bulan</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Nilai Tertinggi (Puncak)</span>
            <span className="text-lg font-extrabold text-emerald-800">
              {maxVal.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block">
              Bulan {MONTH_NAMES[maxMonthIdx]}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Nilai Terendah</span>
            <span className="text-lg font-extrabold text-amber-800">
              {minVal.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold block">
              Bulan {MONTH_NAMES[minMonthIdx]}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Perubahan Terbesar</span>
            <span className="text-lg font-extrabold text-indigo-800 flex items-center gap-1">
              {maxChangeType === 'up' ? '+' : ''}
              {maxChangePct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-indigo-700 font-semibold block">
              di Bulan {MONTH_NAMES[maxChangeMonthIdx]}
            </span>
          </div>
        </div>
      </div>

      {/* Main Trend Line Chart */}
      <TrendLineChart
        title={`Grafik Tren Bulanan: ${selectedMetric.label}`}
        subtitle={`Perjalanan data Januari hingga Desember ${filters.year}`}
        series={[
          {
            name: selectedMetric.label,
            color: selectedMetric.color,
            data: monthlyData,
          },
        ]}
        periodLabel={`Tahun ${filters.year}`}
        yAxisUnit={selectedMetric.unit}
        height={280}
      />

      {/* Monthly Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Tabel Capaian Tiap Bulan (Januari – Desember {filters.year})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right">Nilai ({selectedMetric.unit})</th>
                <th className="py-2.5 px-3 text-right">Proporsi Tahunan (%)</th>
                <th className="py-2.5 px-3 text-right">Perubahan MoM (%)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MONTH_NAMES.map((name, idx) => {
                const val = monthlyData[idx];
                const propTahunan = totalTahunan > 0 ? (val / totalTahunan) * 100 : 0;
                const prev = idx > 0 ? monthlyData[idx - 1] : null;
                const mom = prev !== null && prev > 0 ? ((val - prev) / prev) * 100 : null;

                const isHighest = idx === maxMonthIdx;
                const isLowest = idx === minMonthIdx;

                return (
                  <tr key={`${name}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                      <span>{name}</span>
                      {isHighest && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Tertinggi
                        </span>
                      )}
                      {isLowest && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Terendah
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {val.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {propTahunan.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      {mom !== null ? (
                        <span className={mom >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {mom > 0 ? `+${mom.toFixed(1)}%` : `${mom.toFixed(1)}%`}
                        </span>
                      ) : (
                        <span className="text-slate-400">Baseline</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val > rataRataBulanan ? '#16a34a' : '#f59e0b' }} />
                    </td>
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
