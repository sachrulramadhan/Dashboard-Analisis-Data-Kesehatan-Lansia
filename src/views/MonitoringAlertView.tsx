import React, { useState, useEffect, useMemo } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  GitCompare, 
  TrendingDown, 
  TrendingUp,
  Info,
  Building,
  Calendar
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';
import { MONTH_NAMES } from '../data/mockHealthData';

interface AlertItem {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  puskesmas?: string;
  value: string;
}

type MonitoringTab = 'alert' | 'perbandingan';

export const MonitoringAlertView: React.FC = () => {
  const { metrics, periodLabel, puskesmasStats, kelurahanStats, filters, dataset, activeMenu, setActiveMenu } = useDashboard();

  const initialTab: MonitoringTab = useMemo(() => {
    if (activeMenu === 'perbandingan-puskesmas') return 'perbandingan';
    return 'alert';
  }, [activeMenu]);

  const [activeTab, setActiveTab] = useState<MonitoringTab>(initialTab);

  useEffect(() => {
    if (activeMenu === 'perbandingan-puskesmas') {
      setActiveTab('perbandingan');
    } else if (activeMenu === 'alert-masalah') {
      setActiveTab('alert');
    }
  }, [activeMenu]);

  // Period comparison selector states
  const [compPeriodA, setCompPeriodA] = useState({ year: 2026, month: 1 }); // Januari 2026
  const [compPeriodB, setCompPeriodB] = useState({ year: 2026, month: 2 }); // Februari 2026

  // Generate automated alerts strictly from the data
  const alerts: AlertItem[] = [];

  // Alert 1: Low screening Puskesmas (< 15% dari target SPM tahunan/bulanan)
  puskesmasStats.forEach((p) => {
    if (p.persenSkrining < 10) {
      alerts.push({
        id: `scr-low-${p.puskesmas}`,
        type: 'danger',
        title: `Cakupan Skrining Butuh Akselerasi: ${p.puskesmas}`,
        description: `${p.puskesmas} mencatatkan cakupan skrining sebesar ${p.persenSkrining.toFixed(1)}% (${p.skrining.toLocaleString('id-ID')} lansia) dari total sasaran lansia (60+) ${p.sasaran.toLocaleString('id-ID')} jiwa.`,
        puskesmas: p.puskesmas,
        value: `${p.persenSkrining.toFixed(1)}%`,
      });
    }
  });

  // Alert 2: High abnormalities but unmedicated gap
  puskesmasStats.forEach((p) => {
    const unmedicated = p.kelainan - p.diobati;
    const unmedicatedPct = p.kelainan > 0 ? (unmedicated / p.kelainan) * 100 : 0;
    if (unmedicatedPct > 15) {
      alerts.push({
        id: `unmed-${p.puskesmas}`,
        type: 'warning',
        title: `Kesenjangan Pengobatan Kelainan: ${p.puskesmas}`,
        description: `Terdapat ${unmedicated.toLocaleString('id-ID')} lansia (${unmedicatedPct.toFixed(1)}%) dengan kelainan yang belum tercatat mendapat terapi pengobatan di ${p.puskesmas}.`,
        puskesmas: p.puskesmas,
        value: `${unmedicatedPct.toFixed(1)}% Belum Diobati`,
      });
    }
  });

  // Alert 3: Drop in visits across Kelurahan
  kelurahanStats.slice(0, 3).forEach((k) => {
    if (k.kunjungan < 50) {
      alerts.push({
        id: `vis-low-${k.kelurahan}`,
        type: 'info',
        title: `Kunjungan Perlu Peningkatan: Kel. ${k.kelurahan}`,
        description: `Kelurahan ${k.kelurahan} (${k.puskesmas}) mencatat kunjungan ${k.kunjungan} lansia pada periode ini.`,
        puskesmas: k.puskesmas,
        value: `${k.kunjungan} Kunjungan`,
      });
    }
  });

  // Compute Period A vs Period B comparison values
  const getPeriodMetrics = (y: number, m: number) => {
    const recs = dataset.filter((r) => r.tahun === y && r.bulan === m);
    const kunjungan = recs.reduce((acc, r) => acc + r.kunjunganLansia, 0);
    const skrining = recs.reduce((acc, r) => acc + r.skriningLansia, 0);
    const kelainan = recs.reduce((acc, r) => acc + r.lansiaDenganKelainan, 0);
    const diobati = recs.reduce((acc, r) => acc + r.diobati, 0);
    const dirujuk = recs.reduce((acc, r) => acc + r.dirujuk, 0);
    return { kunjungan, skrining, kelainan, diobati, dirujuk };
  };

  const dataA = getPeriodMetrics(compPeriodA.year, compPeriodA.month);
  const dataB = getPeriodMetrics(compPeriodB.year, compPeriodB.month);

  const calcDiff = (a: number, b: number) => {
    const selisih = b - a;
    const pct = a > 0 ? ((b - a) / a) * 100 : null;
    return { selisih, pct };
  };

  const compIndicators = [
    { label: 'Kunjungan Lansia', a: dataA.kunjungan, b: dataB.kunjungan, ...calcDiff(dataA.kunjungan, dataB.kunjungan) },
    { label: 'Lansia Diskrining', a: dataA.skrining, b: dataB.skrining, ...calcDiff(dataA.skrining, dataB.skrining) },
    { label: 'Lansia dengan Kelainan', a: dataA.kelainan, b: dataB.kelainan, ...calcDiff(dataA.kelainan, dataB.kelainan) },
    { label: 'Lansia Diobati', a: dataA.diobati, b: dataB.diobati, ...calcDiff(dataA.diobati, dataB.diobati) },
    { label: 'Lansia Dirujuk ke RS', a: dataA.dirujuk, b: dataB.dirujuk, ...calcDiff(dataA.dirujuk, dataB.dirujuk) },
  ];

  return (
    <div className="space-y-6">
      <PeriodBanner />

      {/* Navigasi Tab Monitoring */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {activeTab === 'alert' && <BellRing className="w-4 h-4 text-amber-600" />}
              {activeTab === 'perbandingan' && <GitCompare className="w-4 h-4 text-indigo-600" />}
              {activeTab === 'alert' 
                ? 'Deteksi Alert, Anomali & Peringatan Dini' 
                : 'Analisis Komparasi Kinerja Puskesmas & Periode'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alat pengawasan mutu data dan evaluasi performa pelayanan kesehatan lansia.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('alert');
                setActiveMenu('alert-masalah');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'alert'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              Deteksi Alert ({alerts.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('perbandingan');
                setActiveMenu('perbandingan-puskesmas');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'perbandingan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              Komparasi Puskesmas & Periode
            </button>
          </div>
        </div>
      </div>

      {/* Konten Tab 1: Alert & Masalah */}
      {activeTab === 'alert' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Peringatan Dini Kinerja ({periodLabel})
                </h3>
                <p className="text-xs text-slate-500">
                  Sistem otomatis memindai anomali capaian, kesenjangan skrining vs pengobatan, dan penurunan kinerja.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              {alerts.length} Alert Terdeteksi
            </span>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Tidak Ada Anomali Kritis</h4>
                <p className="text-xs text-slate-500 mt-1">Seluruh indikator Puskesmas berada dalam batas normal kinerja.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                    alert.type === 'danger'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : alert.type === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-blue-50/70 border-blue-200 text-blue-950'
                  }`}
                >
                  {alert.type === 'danger' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                  {alert.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900">{alert.title}</h4>
                      <span className="font-extrabold text-[11px] px-2 py-0.5 rounded bg-white/80 border border-slate-200/60 shadow-2xs">
                        {alert.value}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-700 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Konten Tab 2: Komparasi Puskesmas & Periode */}
      {activeTab === 'perbandingan' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Mesin Komparasi Antar-Periode (Comparison Engine)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih dua periode untuk menganalisis pertumbuhan atau penurunan capaian secara langsung.
                  </p>
                </div>
              </div>

              {/* Period Selectors */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-600">Periode A:</span>
                  <select
                    value={compPeriodA.month}
                    onChange={(e) => setCompPeriodA({ ...compPeriodA, month: Number(e.target.value) })}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m} {compPeriodA.year}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs font-bold text-slate-400">VS</span>

                <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-600">Periode B:</span>
                  <select
                    value={compPeriodB.month}
                    onChange={(e) => setCompPeriodB({ ...compPeriodB, month: Number(e.target.value) })}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m} {compPeriodB.year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Indikator Kinerja</th>
                    <th className="py-2.5 px-3 text-right">
                      {MONTH_NAMES[compPeriodA.month - 1]} {compPeriodA.year}
                    </th>
                    <th className="py-2.5 px-3 text-right">
                      {MONTH_NAMES[compPeriodB.month - 1]} {compPeriodB.year}
                    </th>
                    <th className="py-2.5 px-3 text-right">Selisih Absolut</th>
                    <th className="py-2.5 px-3 text-right">Perubahan (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compIndicators.map((ind) => (
                    <tr key={ind.label} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{ind.label}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {ind.a.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                        {ind.b.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                        {ind.selisih > 0 ? `+${ind.selisih.toLocaleString('id-ID')}` : ind.selisih.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold">
                        {ind.pct !== null ? (
                          <span className={ind.pct > 0 ? 'text-emerald-700' : ind.pct < 0 ? 'text-rose-700' : 'text-slate-600'}>
                            {ind.pct > 0 ? `+${ind.pct.toFixed(1)}%` : `${ind.pct.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Puskesmas Screening Performance Comparison Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <ComparisonBarChart
              title="Perbandingan Cakupan Skrining Lansia (60+) Antar-Puskesmas"
              subtitle={`Peringkat capaian seluruh 12 Puskesmas pada ${periodLabel}`}
              items={puskesmasStats.map((p) => ({
                label: p.puskesmas.replace('Puskesmas ', ''),
                sublabel: `${p.skrining.toLocaleString('id-ID')} dari ${p.sasaran.toLocaleString('id-ID')} lansia (60+)`,
                value: p.skrining,
                percentage: p.persenSkrining,
                color: p.persenSkrining >= 15 ? 'bg-emerald-600' : p.persenSkrining >= 8 ? 'bg-blue-600' : 'bg-amber-600',
              }))}
              valueUnit="Lansia"
              periodLabel={periodLabel}
              maxDisplay={12}
            />
          </div>
        </div>
      )}
    </div>
  );
};
