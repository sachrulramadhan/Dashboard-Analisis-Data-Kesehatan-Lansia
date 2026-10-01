import React, { useState, useEffect, useMemo } from 'react';
import { 
  HeartPulse, 
  Home, 
  Clock, 
  Heart, 
  Stethoscope, 
  Users, 
  CheckCircle2, 
  TrendingUp,
  Activity,
  Info,
  Building2,
  UserCheck
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { KpiCard } from '../components/KpiCard';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';
import { TrendLineChart } from '../components/charts/TrendLineChart';

type LayananTab = 'all' | 'posyandu' | 'home-care' | 'ltc' | 'panti' | 'nakes';

export const LayananLansiaView: React.FC = () => {
  const { metrics, periodLabel, puskesmasStats, dataset, filters, activeMenu, setActiveMenu } = useDashboard();

  // Tentukan tab awal dari activeMenu
  const initialTab: LayananTab = useMemo(() => {
    switch (activeMenu) {
      case 'posbindu-posyandu': return 'posyandu';
      case 'kunjungan-rumah': return 'home-care';
      case 'long-term-care': return 'ltc';
      case 'panti-wreda': return 'panti';
      case 'tenaga-kesehatan': return 'nakes';
      default: return 'all';
    }
  }, [activeMenu]);

  const [activeTab, setActiveTab] = useState<LayananTab>(initialTab);

  useEffect(() => {
    switch (activeMenu) {
      case 'posbindu-posyandu': setActiveTab('posyandu'); break;
      case 'kunjungan-rumah': setActiveTab('home-care'); break;
      case 'long-term-care': setActiveTab('ltc'); break;
      case 'panti-wreda': setActiveTab('panti'); break;
      case 'tenaga-kesehatan': setActiveTab('nakes'); break;
    }
  }, [activeMenu]);

  // Monthly trends for Kunjungan Rumah and LTC
  const trendHomeCare = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.jumlahKunjunganRumah, 0);
  });

  const trendLTC = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return dataset
      .filter((r) => r.tahun === filters.year && r.bulan === month)
      .reduce((acc, r) => acc + r.longTermCareLansia, 0);
  });

  // Calculate Nakes to Sasaran ratio (e.g. per 1,000 lansia)
  const nakesRatio = metrics.totalSasaran > 0 ? (metrics.totalTenaga / metrics.totalSasaran) * 1000 : 0;

  return (
    <div className="space-y-6">
      <PeriodBanner />

      {/* Navigasi Tab Layanan */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {activeTab === 'posyandu' && <HeartPulse className="w-4 h-4 text-emerald-600" />}
              {activeTab === 'home-care' && <Home className="w-4 h-4 text-blue-600" />}
              {activeTab === 'ltc' && <Clock className="w-4 h-4 text-amber-600" />}
              {activeTab === 'panti' && <Heart className="w-4 h-4 text-rose-600" />}
              {activeTab === 'nakes' && <Stethoscope className="w-4 h-4 text-indigo-600" />}
              {activeTab === 'all' && <Activity className="w-4 h-4 text-slate-700" />}
              {activeTab === 'posyandu'
                ? 'Layanan Posyandu / Posbindu Lansia'
                : activeTab === 'home-care'
                ? 'Layanan Kunjungan Rumah (Home Care Lansia Risti)'
                : activeTab === 'ltc'
                ? 'Perawatan Jangka Panjang / Long Term Care (LTC)'
                : activeTab === 'panti'
                ? 'Pembinaan Lansia di Panti Wreda / Panti Sosial'
                : activeTab === 'nakes'
                ? 'Distribusi & Rasio Tenaga Kesehatan Pembina Lansia'
                : 'Ringkasan Seluruh Program Layanan Lansia'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau kapasitas dan realisasi layanan berbasis komunitas, fasilitas, dan kunjungan rumah.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setActiveMenu('posbindu-posyandu');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Layanan
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('posyandu');
                setActiveMenu('posbindu-posyandu');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'posyandu' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              Posyandu
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('home-care');
                setActiveMenu('kunjungan-rumah');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'home-care' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home Care
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ltc');
                setActiveMenu('long-term-care');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'ltc' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              LTC
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('panti');
                setActiveMenu('panti-wreda');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'panti' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Panti Wreda
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('nakes');
                setActiveMenu('tenaga-kesehatan');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'nakes' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Nakes
            </button>
          </div>
        </div>

        {/* Info Banner per Tab */}
        {activeTab === 'posyandu' && (
          <div className="mt-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Posyandu / Posbindu Lansia:</span>
              Mencakup <strong>{metrics.posbinduAktif} Pos Aktif</strong> di 46 Kelurahan. Posyandu merupakan ujung tombak deteksi dini faktor risiko PTM, penimbangan berat badan, pengukuran tekanan darah, dan edukasi pola hidup sehat.
            </div>
          </div>
        )}

        {activeTab === 'home-care' && (
          <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Kunjungan Rumah (Home Care):</span>
              Pelayanan proaktif tenaga kesehatan dan perawat Puskesmas ke rumah lansia tirah baring (bedridden), lansia risti, atau yang memiliki keterbatasan fisik/mental untuk datang ke faskes. Total realisasi: <strong>{metrics.kunjunganRumah.toLocaleString('id-ID')} kunjungan</strong>.
            </div>
          </div>
        )}

        {activeTab === 'ltc' && (
          <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Perawatan Jangka Panjang (Long Term Care / LTC):</span>
              Pendampingan terstruktur bagi <strong>{metrics.ltcLansia.toLocaleString('id-ID')} lansia</strong> dengan ketergantungan sedang, berat, dan total (Tingkat Kemandirian B dan C) bersama caregiver/keluarga.
            </div>
          </div>
        )}

        {activeTab === 'panti' && (
          <div className="mt-3 p-3 bg-rose-50/80 border border-rose-200 rounded-lg text-xs text-rose-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Pembinaan Panti Wreda:</span>
              Pemantauan kesehatan berkala pada <strong>{metrics.pantiWreda} Panti Wreda / Panti Sosial Lansia</strong> dalam wilayah kerja Puskesmas binaan.
            </div>
          </div>
        )}

        {activeTab === 'nakes' && (
          <div className="mt-3 p-3 bg-indigo-50/80 border border-indigo-200 rounded-lg text-xs text-indigo-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fokus Distribusi Tenaga Kesehatan:</span>
              Ketersediaan tenaga dokter, perawat, bidan, dan nutrisionis pembina program lansia berjumlah <strong>{metrics.totalTenaga} orang</strong>, menghasilkan rasio <strong>{nakesRatio.toFixed(1)} Nakes per 1.000 Lansia Sasaran (60+)</strong>.
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards across the 5 programs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          title="Posyandu Lansia Aktif"
          value={metrics.posbinduAktif}
          unit="Pos Aktif"
          aggregationFormula="LAST VALUE status keaktifan pos periode berjalan"
          highlightColor="emerald"
          icon={<HeartPulse className="w-4 h-4" />}
        />

        <KpiCard
          title="Kunjungan Rumah (Home Care)"
          value={metrics.kunjunganRumah}
          unit="Kunjungan"
          delta={metrics.deltaKunjunganRumah}
          aggregationFormula="SUM kunjungan rumah oleh petugas ke lansia"
          highlightColor="blue"
          icon={<Home className="w-4 h-4" />}
        />

        <KpiCard
          title="Lansia Long Term Care (LTC)"
          value={metrics.ltcLansia}
          unit="Lansia Terbina"
          aggregationFormula="SUM sasaran lansia dalam perawatan jangka panjang"
          highlightColor="amber"
          icon={<Clock className="w-4 h-4" />}
        />

        <KpiCard
          title="Panti Wreda Dibina"
          value={metrics.pantiWreda}
          unit="Panti"
          aggregationFormula="LAST VALUE panti lansia dalam binaan puskesmas"
          highlightColor="rose"
          icon={<Heart className="w-4 h-4" />}
        />

        <KpiCard
          title="Tenaga Kesehatan Pembina"
          value={metrics.totalTenaga}
          unit={`Nakes (${nakesRatio.toFixed(1)}/1.000 Lansia)`}
          aggregationFormula="LAST VALUE jumlah petugas kesehatan (data stok fasilitas)"
          highlightColor="indigo"
          icon={<Stethoscope className="w-4 h-4" />}
        />
      </div>

      {/* Visualisasi Spesifik Berdasarkan Tab */}
      {(activeTab === 'all' || activeTab === 'home-care' || activeTab === 'ltc') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <TrendLineChart
              title="Tren Bulanan: Kunjungan Rumah & Long Term Care"
              subtitle={`Realisasi pelayanan lansia tirah baring Jan–Desember ${filters.year}`}
              series={[
                { name: 'Kunjungan Rumah (Home Care)', color: '#0284c7', data: trendHomeCare },
                { name: 'Long Term Care (LTC)', color: '#d97706', data: trendLTC },
              ]}
              periodLabel={`Tahun ${filters.year}`}
              yAxisUnit="Kegiatan"
            />
          </div>

          <div className="lg:col-span-5">
            <ComparisonBarChart
              title="Kunjungan Rumah per Puskesmas"
              subtitle="Puskesmas dengan aktivitas home care tertinggi"
              items={puskesmasStats.map((p) => ({
                label: p.puskesmas.replace('Puskesmas ', ''),
                sublabel: `${p.tenaga} Nakes Pembina`,
                value: p.kunjunganRumah,
                color: 'bg-sky-600',
              }))}
              valueUnit="Kunjungan"
              periodLabel={periodLabel}
              maxDisplay={12}
            />
          </div>
        </div>
      )}

      {/* Section 2: Posyandu & Tenaga Kesehatan */}
      {(activeTab === 'all' || activeTab === 'posyandu' || activeTab === 'nakes' || activeTab === 'panti') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComparisonBarChart
            title="Sebaran Posyandu Lansia Aktif per Puskesmas"
            subtitle="Kapasitas jangkauan pos pembinaan berbasis komunitas"
            items={puskesmasStats.map((p) => ({
              label: p.puskesmas.replace('Puskesmas ', ''),
              sublabel: `${p.kelurahanList.length} Kelurahan Binaan`,
              value: p.posbindu,
              color: 'bg-emerald-600',
            }))}
            valueUnit="Pos"
            periodLabel={periodLabel}
            maxDisplay={12}
          />

          <ComparisonBarChart
            title="Distribusi Tenaga Kesehatan Pembina Lansia"
            subtitle="Kekuatan SDM nakes di tiap wilayah kerja Puskesmas"
            items={puskesmasStats.map((p) => ({
              label: p.puskesmas.replace('Puskesmas ', ''),
              sublabel: `${(p.tenaga / (p.sasaran || 1) * 1000).toFixed(1)} nakes / 1.000 lansia (60+)`,
              value: p.tenaga,
              color: 'bg-indigo-600',
            }))}
            valueUnit="Nakes"
            periodLabel={periodLabel}
            maxDisplay={12}
          />
        </div>
      )}
    </div>
  );
};
