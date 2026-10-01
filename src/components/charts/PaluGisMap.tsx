import React, { useState } from 'react';
import { MapPin, Info, Layers, Eye, X } from 'lucide-react';
import { PuskesmasStat, HealthRecord } from '../../types';

interface PaluGisMapProps {
  puskesmasStats: PuskesmasStat[];
  rawRecords: HealthRecord[];
  periodLabel: string;
}

type MapIndicator = 
  | 'persenSkrining'
  | 'kunjungan'
  | 'skrining'
  | 'kelainan'
  | 'hipertensi'
  | 'diabetes'
  | 'kolesterol'
  | 'asamUrat'
  | 'gangguanGinjal'
  | 'gangguanPenglihatan'
  | 'gangguanPendengaran'
  | 'diobati'
  | 'dirujuk'
  | 'kunjunganRumah';

// SVG map representation of Kota Palu's 14 Puskesmas regions
interface RegionShape {
  id: string;
  name: string;
  d: string;
  centerX: number;
  centerY: number;
}

const PALU_REGIONS: RegionShape[] = [
  {
    id: 'Puskesmas Pantoloan',
    name: 'Puskesmas Pantoloan',
    d: 'M 440,30 L 530,25 L 560,90 L 510,140 L 430,110 Z',
    centerX: 490,
    centerY: 75,
  },
  {
    id: 'Puskesmas Tawaeli',
    name: 'Puskesmas Tawaeli',
    d: 'M 430,70 L 520,60 L 510,130 L 420,110 Z',
    centerX: 465,
    centerY: 95,
  },
  {
    id: 'Puskesmas Mamboro',
    name: 'Puskesmas Mamboro',
    d: 'M 430,110 L 510,140 L 480,210 L 390,180 L 400,130 Z',
    centerX: 445,
    centerY: 160,
  },
  {
    id: 'Puskesmas Talise',
    name: 'Puskesmas Talise',
    d: 'M 390,180 L 480,210 L 450,280 L 370,260 L 360,200 Z',
    centerX: 410,
    centerY: 235,
  },
  {
    id: 'Puskesmas Tipo',
    name: 'Puskesmas Tipo',
    d: 'M 140,160 L 230,170 L 250,260 L 160,280 L 120,210 Z',
    centerX: 180,
    centerY: 220,
  },
  {
    id: 'Puskesmas Lere',
    name: 'Puskesmas Lere',
    d: 'M 220,280 L 270,270 L 280,310 L 210,320 Z',
    centerX: 245,
    centerY: 295,
  },
  {
    id: 'Puskesmas Singgani',
    name: 'Puskesmas Singgani',
    d: 'M 250,260 L 310,265 L 305,320 L 235,325 L 220,280 Z',
    centerX: 265,
    centerY: 290,
  },
  {
    id: 'Puskesmas Kamonji',
    name: 'Puskesmas Kamonji',
    d: 'M 310,265 L 365,270 L 360,330 L 305,320 Z',
    centerX: 335,
    centerY: 295,
  },
  {
    id: 'Puskesmas Mabelopura',
    name: 'Puskesmas Mabelopura',
    d: 'M 365,270 L 430,280 L 415,340 L 360,330 Z',
    centerX: 395,
    centerY: 305,
  },
  {
    id: 'Puskesmas Nosarara',
    name: 'Puskesmas Nosarara',
    d: 'M 235,325 L 305,320 L 295,385 L 210,380 Z',
    centerX: 260,
    centerY: 350,
  },
  {
    id: 'Puskesmas Sangurara',
    name: 'Puskesmas Sangurara',
    d: 'M 210,380 L 295,385 L 280,460 L 180,450 Z',
    centerX: 240,
    centerY: 415,
  },
  {
    id: 'Puskesmas Bulili',
    name: 'Puskesmas Bulili',
    d: 'M 305,320 L 380,335 L 365,410 L 295,385 Z',
    centerX: 340,
    centerY: 365,
  },
  {
    id: 'Puskesmas Birobuli',
    name: 'Puskesmas Birobuli',
    d: 'M 365,410 L 460,400 L 440,490 L 350,480 L 295,385 Z',
    centerX: 390,
    centerY: 440,
  },
  {
    id: 'Puskesmas Kawatuna',
    name: 'Puskesmas Kawatuna',
    d: 'M 430,280 L 520,290 L 510,410 L 440,400 Z',
    centerX: 475,
    centerY: 345,
  },
];

export const PaluGisMap: React.FC<PaluGisMapProps> = ({
  puskesmasStats,
  rawRecords,
  periodLabel,
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<MapIndicator>('persenSkrining');
  const [activeRegion, setActiveRegion] = useState<PuskesmasStat | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Compute specific indicator value per Puskesmas
  const getIndicatorData = (puskesmasName: string) => {
    const clean = (name: string) =>
      name.toLowerCase().replace(/puskesmas/g, '').replace(/mabelopalu/g, 'mabelopura').trim();
    const target = clean(puskesmasName);
    const stat = puskesmasStats.find(
      (p) => clean(p.puskesmas) === target || clean(p.puskesmas).includes(target) || target.includes(clean(p.puskesmas))
    );
    const pRecords = rawRecords.filter(
      (r) => clean(r.puskesmas) === target || clean(r.puskesmas).includes(target) || target.includes(clean(r.puskesmas))
    );

    if (!stat) return { value: 0, formatted: '0', unit: '' };

    let value = 0;
    let formatted = '0';
    let unit = '';

    switch (selectedIndicator) {
      case 'persenSkrining':
        value = stat.persenSkrining;
        formatted = `${value.toFixed(1)}%`;
        unit = '%';
        break;
      case 'kunjungan':
        value = stat.kunjungan;
        formatted = value.toLocaleString('id-ID');
        unit = 'Kunjungan';
        break;
      case 'skrining':
        value = stat.skrining;
        formatted = value.toLocaleString('id-ID');
        unit = 'Lansia';
        break;
      case 'kelainan':
        value = stat.kelainan;
        formatted = value.toLocaleString('id-ID');
        unit = 'Kasus';
        break;
      case 'hipertensi':
        value = pRecords.reduce((acc, r) => acc + r.hipertensi, 0);
        formatted = value.toLocaleString('id-ID');
        unit = 'Kasus';
        break;
      case 'diabetes':
        value = pRecords.reduce((acc, r) => acc + r.diabetesMelitus, 0);
        formatted = value.toLocaleString('id-ID');
        unit = 'Kasus';
        break;
      case 'kolesterol':
        value = pRecords.reduce((acc, r) => acc + r.kolesterolTinggi, 0);
        formatted = value.toLocaleString('id-ID');
        unit = 'Kasus';
        break;
      case 'asamUrat':
        value = pRecords.reduce((acc, r) => acc + r.asamUratTinggi, 0);
        formatted = value.toLocaleString('id-ID');
        unit = 'Kasus';
        break;
      case 'gangguanGinjal':
        value = pRecords.reduce((acc, r) => acc + r.gangguanGinjal, 0);
        formatted = value.toLocaleString('id-ID');
        unit = 'Kasus';
        break;
      case 'gangguanPenglihatan':
        value = pRecords.reduce((acc, r) => acc + r.gangguanPenglihatan, 0);
        formatted = value.toLocaleString('id-ID');
        unit = 'Kasus';
        break;
      case 'gangguanPendengaran':
        value = pRecords.reduce((acc, r) => acc + r.gangguanPendengaran, 0);
        formatted = value.toLocaleString('id-ID');
        unit = 'Kasus';
        break;
      case 'diobati':
        value = stat.diobati;
        formatted = value.toLocaleString('id-ID');
        unit = 'Lansia';
        break;
      case 'dirujuk':
        value = stat.dirujuk;
        formatted = value.toLocaleString('id-ID');
        unit = 'Lansia';
        break;
      case 'kunjunganRumah':
        value = stat.kunjunganRumah;
        formatted = value.toLocaleString('id-ID');
        unit = 'Kunjungan';
        break;
    }

    return { value, formatted, unit };
  };

  // Calculate min and max for choropleth scale
  const allValues = puskesmasStats.map((p) => getIndicatorData(p.puskesmas).value);
  const minVal = Math.min(...allValues, 0);
  const maxVal = Math.max(...allValues, 1);

  const getColorForValue = (val: number) => {
    const ratio = maxVal > minVal ? (val - minVal) / (maxVal - minVal) : 0.5;
    // Blue/Teal gradient choropleth
    if (ratio >= 0.8) return '#1e40af'; // deep blue
    if (ratio >= 0.6) return '#2563eb';
    if (ratio >= 0.4) return '#3b82f6';
    if (ratio >= 0.2) return '#60a5fa';
    return '#93c5fd'; // light blue
  };

  const indicatorOptions: { id: MapIndicator; label: string }[] = [
    { id: 'persenSkrining', label: 'Cakupan Skrining (%)' },
    { id: 'kunjungan', label: 'Total Kunjungan' },
    { id: 'skrining', label: 'Lansia Diskrining' },
    { id: 'kelainan', label: 'Lansia dengan Kelainan' },
    { id: 'hipertensi', label: 'Hipertensi (Tekanan Darah)' },
    { id: 'diabetes', label: 'Diabetes Melitus' },
    { id: 'kolesterol', label: 'Kolesterol Tinggi' },
    { id: 'asamUrat', label: 'Asam Urat' },
    { id: 'gangguanPenglihatan', label: 'Gangguan Penglihatan' },
    { id: 'gangguanPendengaran', label: 'Gangguan Pendengaran' },
    { id: 'gangguanGinjal', label: 'Gangguan Ginjal' },
    { id: 'diobati', label: 'Lansia Diobati' },
    { id: 'dirujuk', label: 'Lansia Dirujuk' },
    { id: 'kunjunganRumah', label: 'Kunjungan Rumah' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Peta GIS Interaktif Kota Palu
            </h3>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              14 Puskesmas
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Sebaran spasial kesehatan lansia di Kota Palu • {periodLabel}
          </p>
        </div>

        {/* Indicator Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Pilih Indikator:</label>
          <select
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value as MapIndicator)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-blue-500"
          >
            {indicatorOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Interactive Map */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
          {/* Teluk Palu Water mark */}
          <div className="absolute top-1/4 left-1/3 text-[22px] font-black text-sky-200/50 pointer-events-none tracking-widest uppercase rotate-[-30deg]">
            Teluk Palu
          </div>

          <svg
            viewBox="100 10 500 500"
            className="w-full max-w-[560px] h-auto drop-shadow-xs"
          >
            {/* Water path representation */}
            <path
              d="M 230,170 Q 280,240 360,200 L 400,130 L 440,30 L 360,40 Z"
              fill="#e0f2fe"
              stroke="#bae6fd"
              strokeWidth="1.5"
            />

            {/* Regions */}
            {PALU_REGIONS.map((region) => {
              const info = getIndicatorData(region.name);
              const color = getColorForValue(info.value);
              const isHovered = hoveredRegion === region.name;
              const isSelected = activeRegion?.puskesmas === region.name;

              return (
                <g key={region.id} className="cursor-pointer">
                  <path
                    d={region.d}
                    fill={color}
                    stroke={isSelected ? '#f59e0b' : isHovered ? '#0f172a' : '#ffffff'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                    className="transition-all duration-200 hover:brightness-110"
                    onMouseEnter={() => setHoveredRegion(region.name)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => {
                      const stat = puskesmasStats.find((p) => p.puskesmas === region.name);
                      if (stat) setActiveRegion(stat);
                    }}
                  />
                  <text
                    x={region.centerX}
                    y={region.centerY}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-white pointer-events-none drop-shadow-sm select-none"
                  >
                    {region.name.replace('Puskesmas ', '')}
                  </text>
                  <text
                    x={region.centerX}
                    y={region.centerY + 12}
                    textAnchor="middle"
                    className="text-[8px] font-medium fill-slate-100 pointer-events-none drop-shadow-sm select-none"
                  >
                    {info.formatted}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Choropleth Legend */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-slate-200 text-[10px] flex items-center gap-2 shadow-xs">
            <span className="font-semibold text-slate-600">Rendah ({minVal.toLocaleString('id-ID')})</span>
            <div className="flex h-2.5 w-24 rounded-xs overflow-hidden">
              <span className="w-1/5 bg-[#93c5fd]" />
              <span className="w-1/5 bg-[#60a5fa]" />
              <span className="w-1/5 bg-[#3b82f6]" />
              <span className="w-1/5 bg-[#2563eb]" />
              <span className="w-1/5 bg-[#1e40af]" />
            </div>
            <span className="font-semibold text-slate-800">Tinggi ({maxVal.toLocaleString('id-ID')})</span>
          </div>
        </div>

        {/* Right Info Panel & Ranking List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Ranking Capaian Wilayah
            </h4>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
              {puskesmasStats
                .map((p) => ({
                  name: p.puskesmas,
                  ...getIndicatorData(p.puskesmas),
                  stat: p,
                }))
                .sort((a, b) => b.value - a.value)
                .map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    type="button"
                    onClick={() => setActiveRegion(item.stat)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${
                      activeRegion?.puskesmas === item.name
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-bold opacity-60 w-3">{idx + 1}.</span>
                      <span className="truncate">{item.name.replace('Puskesmas ', '')}</span>
                    </div>
                    <span className="font-extrabold shrink-0">{item.formatted}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Popup when a region is clicked */}
      {activeRegion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Profil Wilayah Puskesmas
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeRegion.puskesmas}</h3>
                <p className="text-xs text-slate-500">Periode: {periodLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveRegion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 text-[10px] block">Sasaran Lansia</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {activeRegion.sasaran.toLocaleString('id-ID')} Jiwa
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-50/50 border border-sky-100">
                <span className="text-slate-500 text-[10px] block">Kunjungan</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {activeRegion.kunjungan.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
                <span className="text-slate-500 text-[10px] block">Cakupan Skrining</span>
                <span className="font-extrabold text-teal-700 text-sm">
                  {activeRegion.persenSkrining.toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                <span className="text-slate-500 text-[10px] block">Kelainan Ditemukan</span>
                <span className="font-extrabold text-amber-700 text-sm">
                  {activeRegion.kelainan.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="text-slate-500 text-[10px] block">Diobati</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {activeRegion.diobati.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100">
                <span className="text-slate-500 text-[10px] block">Dirujuk</span>
                <span className="font-extrabold text-rose-700 text-sm">
                  {activeRegion.dirujuk.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Kelurahan di Wilayah Kerja:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeRegion.kelurahanList.map((k, kIdx) => (
                  <span
                    key={`${k}-${kIdx}`}
                    className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
