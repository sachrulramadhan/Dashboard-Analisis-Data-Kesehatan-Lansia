import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info,
  Eye,
  Ear,
  Brain,
  Scale,
  Heart,
  Droplets,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';
import { TrendLineChart } from '../components/charts/TrendLineChart';

type DiseaseFilterCategory = 'all' | 'kelainan' | 'faktor-risiko';

const KELAINAN_GERIATRI_IDS = [
  'gangguanPenglihatan',
  'gangguanPendengaran',
  'gangguanKognitif',
  'imtKurang',
  'anemiaHbKurang',
  'gangguanGinjal'
];

const FAKTOR_RISIKO_PTM_IDS = [
  'hipertensi',
  'diabetesMelitus',
  'kolesterolTinggi',
  'asamUratTinggi',
  'imtLebihObesitas',
  'gangguanMetabolikLain'
];

export const ProfilPenyakitView: React.FC = () => {
  const { diseaseRanking, periodLabel, filters, dataset, activeMenu, setActiveMenu } = useDashboard();
  
  // Tentukan kategori aktif berdasarkan activeMenu
  const initialCategory: DiseaseFilterCategory = useMemo(() => {
    if (activeMenu === 'kelainan-lansia') return 'kelainan';
    if (activeMenu === 'faktor-risiko') return 'faktor-risiko';
    return 'all';
  }, [activeMenu]);

  const [activeCategory, setActiveCategory] = useState<DiseaseFilterCategory>(initialCategory);

  // Sync state if activeMenu changes in sidebar
  useEffect(() => {
    if (activeMenu === 'kelainan-lansia') {
      setActiveCategory('kelainan');
    } else if (activeMenu === 'faktor-risiko') {
      setActiveCategory('faktor-risiko');
    } else if (activeMenu === 'profil-penyakit') {
      setActiveCategory('all');
    }
  }, [activeMenu]);

  // Saring dataset penyakit berdasarkan kategori aktif
  const filteredDiseases = useMemo(() => {
    if (activeCategory === 'kelainan') {
      return diseaseRanking.filter((d) => KELAINAN_GERIATRI_IDS.includes(d.id));
    }
    if (activeCategory === 'faktor-risiko') {
      return diseaseRanking.filter((d) => FAKTOR_RISIKO_PTM_IDS.includes(d.id));
    }
    return diseaseRanking;
  }, [diseaseRanking, activeCategory]);

  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('hipertensi');

  // Pastikan selectedDiseaseId ada di dalam list yang tersaring
  useEffect(() => {
    if (filteredDiseases.length > 0 && !filteredDiseases.some((d) => d.id === selectedDiseaseId)) {
      setSelectedDiseaseId(filteredDiseases[0].id);
    }
  }, [filteredDiseases, selectedDiseaseId]);

  const topDisease = filteredDiseases[0];
  const lowestDisease = filteredDiseases[filteredDiseases.length - 1];

  // Find disease with biggest change
  const validDeltas = filteredDiseases.filter((d) => d.delta !== null && d.delta !== undefined);
  const biggestChangeDisease = validDeltas.length > 0
    ? [...validDeltas].sort((a, b) => Math.abs(b.delta!) - Math.abs(a.delta!))[0]
    : null;

  const smallestChangeDisease = validDeltas.length > 0
    ? [...validDeltas].sort((a, b) => Math.abs(a.delta!) - Math.abs(b.delta!))[0]
    : null;

  // Monthly trend for selected disease
  const monthlyTrendSelected = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => {
        if (r.tahun !== filters.year || r.bulan !== month) return false;
        if (filters.puskesmas !== 'ALL' && r.puskesmas !== filters.puskesmas) return false;
        if (filters.kelurahan !== 'ALL' && r.kelurahan !== filters.kelurahan) return false;
        return true;
      })
      .reduce((acc, r) => acc + (r[selectedDiseaseId as keyof typeof r] as number || 0), 0);
  });

  const selectedDiseaseInfo = filteredDiseases.find((d) => d.id === selectedDiseaseId) || filteredDiseases[0] || diseaseRanking[0];

  const totalCasesInCategory = filteredDiseases.reduce((sum, d) => sum + d.cases, 0);

  return (
    <div className="space-y-6">
      <PeriodBanner />

      {/* Navigasi Tab Kategori Khusus (Menjawab kebutuhan sub-menu yang spesifik) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {activeCategory === 'kelainan' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {activeCategory === 'faktor-risiko' && <ShieldAlert className="w-4 h-4 text-rose-600" />}
              {activeCategory === 'all' && <Activity className="w-4 h-4 text-blue-600" />}
              {activeCategory === 'kelainan' 
                ? 'Kelainan Fungsional Lansia & Sindrom Geriatri' 
                : activeCategory === 'faktor-risiko'
                ? 'Faktor Risiko Penyakit Tidak Menular (PTM) & Metabolik'
                : 'Profil Morbiditas & Seluruh Penyakit Lansia'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih tab di bawah untuk melihat analisis terpisah antara Kelainan Fungsional, Faktor Risiko, atau Seluruh Morbiditas.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setActiveMenu('profil-penyakit');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Penyakit (12)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('kelainan');
                setActiveMenu('kelainan-lansia');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'kelainan'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Kelainan Lansia (6)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('faktor-risiko');
                setActiveMenu('faktor-risiko');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'faktor-risiko'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Faktor Risiko PTM (6)
            </button>
          </div>
        </div>

        {/* Edukasi Kontekstual Sesuai Sub-Menu yang Dipilih */}
        {activeCategory === 'kelainan' && (
          <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Sub-Menu Kelainan Lansia:</span>
              Mencakup penurunan kapasitas fungsional geriatri yang disaring melalui skrining berkala: 
              <strong> Gangguan Penglihatan (katarak/refraksi)</strong>, 
              <strong> Gangguan Pendengaran (presbikusis)</strong>, 
              <strong> Gangguan Kognitif / Demensia (instrumen AMT/Mini-Cog)</strong>, 
              <strong> Malnutrisi / IMT Kurang (KEK)</strong>, 
              <strong> Anemia (kadar Hb)</strong>, dan 
              <strong> Gangguan Fungsi Ginjal</strong>.
            </div>
          </div>
        )}

        {activeCategory === 'faktor-risiko' && (
          <div className="mt-3 p-3 bg-rose-50/80 border border-rose-200 rounded-lg text-xs text-rose-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Sub-Menu Faktor Risiko PTM:</span>
              Mencakup faktor risiko kardiovaskular dan metabolik penyebab komplikasi kronis lansia: 
              <strong> Hipertensi (tekanan darah &ge; 140/90 mmHg)</strong>, 
              <strong> Diabetes Melitus (gula darah puasa/sewaktu)</strong>, 
              <strong> Hiperkolesterolemia (kolesterol total &ge; 200 mg/dL)</strong>, 
              <strong> Hiperurisemia (asam urat)</strong>, dan 
              <strong> IMT Lebih / Obesitas</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Top Header stats without stigmatizing labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-rose-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Kasus Tertinggi</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{topDisease?.name}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-rose-700">
              {topDisease?.cases.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500">Kasus</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalCasesInCategory > 0 ? ((topDisease?.cases / totalCasesInCategory) * 100).toFixed(1) : 0}% dari kelompok ini
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Kasus Terendah</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{lowestDisease?.name}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-blue-700">
              {lowestDisease?.cases.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500">Kasus</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalCasesInCategory > 0 ? ((lowestDisease?.cases / totalCasesInCategory) * 100).toFixed(1) : 0}% dari kelompok ini
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Perubahan Terbesar</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{biggestChangeDisease?.name || '-'}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-amber-700">
              {biggestChangeDisease?.delta ? `${biggestChangeDisease.delta > 0 ? '+' : ''}${biggestChangeDisease.delta.toFixed(1)}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500">vs Periode Lalu</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Dinamika pergeseran kasus tertinggi
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Perubahan Terkecil (Paling Stabil)</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{smallestChangeDisease?.name || '-'}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-700">
              {smallestChangeDisease?.delta ? `${smallestChangeDisease.delta > 0 ? '+' : ''}${smallestChangeDisease.delta.toFixed(1)}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500">vs Periode Lalu</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Cenderung konstan antar periode
          </span>
        </div>
      </div>

      {/* Disease Ranking Bar Chart & Interactive Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ComparisonBarChart
            title={
              activeCategory === 'kelainan'
                ? 'Ranking Kelainan Fungsional & Geriatri'
                : activeCategory === 'faktor-risiko'
                ? 'Ranking Faktor Risiko PTM & Sindrom Metabolik'
                : 'Ranking Kasus Penyakit & Faktor Risiko Lansia'
            }
            subtitle={`Urutan prevalensi pada ${periodLabel} (${filteredDiseases.length} indikator)`}
            items={filteredDiseases.map((d) => ({
              label: d.name,
              sublabel: d.category,
              value: d.cases,
              percentage: totalCasesInCategory > 0 ? (d.cases / totalCasesInCategory) * 100 : 0,
              color: 
                activeCategory === 'kelainan'
                  ? 'bg-amber-600'
                  : activeCategory === 'faktor-risiko'
                  ? 'bg-rose-600'
                  : d.id === 'hipertensi' ? 'bg-rose-600' : d.id === 'diabetesMelitus' ? 'bg-amber-600' : 'bg-blue-600',
            }))}
            valueUnit="Kasus"
            maxDisplay={12}
            periodLabel={periodLabel}
          />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Pilih {activeCategory === 'kelainan' ? 'Kelainan' : activeCategory === 'faktor-risiko' ? 'Faktor Risiko' : 'Penyakit'} untuk Tren Bulanan
            </h3>
            <select
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 mb-4"
            >
              {filteredDiseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.cases.toLocaleString('id-ID')} Kasus)
                </option>
              ))}
            </select>

            <TrendLineChart
              title={`Tren: ${selectedDiseaseInfo?.name || '-'}`}
              subtitle={`Januari – Desember ${filters.year}`}
              series={[
                { 
                  name: selectedDiseaseInfo?.name || 'Kasus', 
                  color: activeCategory === 'kelainan' ? '#d97706' : '#dc2626', 
                  data: monthlyTrendSelected 
                },
              ]}
              periodLabel={`Tahun ${filters.year}`}
              yAxisUnit="Kasus"
              height={200}
            />
          </div>
        </div>
      </div>

      {/* Complete Disease Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Tabel Prevalensi {activeCategory === 'kelainan' ? 'Kelainan Fungsional' : activeCategory === 'faktor-risiko' ? 'Faktor Risiko PTM' : 'Penyakit Lansia'} ({periodLabel})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Total Kasus Kelompok Ini: <strong className="text-slate-900">{totalCasesInCategory.toLocaleString('id-ID')} Kasus</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Nama {activeCategory === 'kelainan' ? 'Kelainan' : 'Penyakit / Risiko'}</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Jumlah Kasus</th>
                <th className="py-2.5 px-3 text-right">Kasus Periode Lalu</th>
                <th className="py-2.5 px-3 text-right">Perubahan (%)</th>
                <th className="py-2.5 px-3 text-right">% dari Total Skrining</th>
                <th className="py-2.5 px-3 text-right">% Proporsi Kelompok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDiseases.map((d, idx) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{d.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{d.category}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                    {d.cases.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {d.prevCases != null ? d.prevCases.toLocaleString('id-ID') : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {d.delta != null ? (
                      <span className={d.delta > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                        {d.delta > 0 ? `+${d.delta.toFixed(1)}%` : `${d.delta.toFixed(1)}%`}
                      </span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{d.percentageOfScreened.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                    {totalCasesInCategory > 0 ? ((d.cases / totalCasesInCategory) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
