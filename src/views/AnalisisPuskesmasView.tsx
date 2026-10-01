import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Search, 
  ArrowUpDown, 
  Download, 
  Eye, 
  X, 
  Activity, 
  MapPin, 
  HeartPulse, 
  UserCheck, 
  Pill, 
  Send,
  Home,
  Users
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { PuskesmasStat } from '../types';
import { exportSummaryToExcel } from '../utils/exportUtils';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';

export const AnalisisPuskesmasView: React.FC = () => {
  const { puskesmasStats, periodLabel, filters, dataset, metrics } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof PuskesmasStat>('kunjungan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [activeModalPuskesmas, setActiveModalPuskesmas] = useState<PuskesmasStat | null>(null);

  const handleSort = (field: keyof PuskesmasStat) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredList = useMemo(() => {
    return puskesmasStats.filter((p) =>
      p.puskesmas.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [puskesmasStats, searchTerm]);

  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredList, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedList.length / pageSize) || 1;
  const paginatedList = sortedList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Modal data for active puskesmas
  const modalRecords = useMemo(() => {
    if (!activeModalPuskesmas) return [];
    return dataset.filter((r) => r.puskesmas === activeModalPuskesmas.puskesmas && r.tahun === filters.year);
  }, [activeModalPuskesmas, dataset, filters.year]);

  const modalTrendKunjungan = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return modalRecords.filter((r) => r.bulan === month).reduce((acc, r) => acc + r.kunjunganLansia, 0);
  });

  const modalTrendSkrining = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return modalRecords.filter((r) => r.bulan === month).reduce((acc, r) => acc + r.skriningLansia, 0);
  });

  return (
    <div className="space-y-6">
      <PeriodBanner />

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        {/* Controls: Search, Export, Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Tabel Komparasi & Kinerja 14 Puskesmas Kota Palu
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi kinerja program lansia (Fokus Utama: Lansia Usia ≥60 Tahun Standar SPM) • {periodLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Puskesmas..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-blue-500 text-slate-800"
              />
            </div>

            {/* Export Excel button */}
            <button
              type="button"
              onClick={() => exportSummaryToExcel(metrics, puskesmasStats, filters)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 select-none">
              <tr>
                <th
                  onClick={() => handleSort('puskesmas')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Puskesmas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('sasaran')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span title="Sasaran Lansia Usia 60 Tahun ke Atas (Standar SPM)">Sasaran (60+)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('kunjungan')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Kunjungan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('skrining')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Skrining</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('persenSkrining')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span title="Rumus: (Skrining ÷ Sasaran 60 Ke Atas) × 100%">% Skrining (60+)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('kelainan')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Kelainan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('diobati')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Diobati</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('dirujuk')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Dirujuk</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('kunjunganRumah')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Kunj. Rumah</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('posbindu')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Posbindu</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('tenaga')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Tenaga</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.map((p, idx) => (
                <tr key={`${p.puskesmas}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-blue-700 hover:text-blue-900 cursor-pointer" onClick={() => setActiveModalPuskesmas(p)}>
                    {p.puskesmas}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{p.sasaran.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{p.kunjungan.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right text-teal-800 font-semibold">{p.skrining.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-blue-700">{p.persenSkrining.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right text-amber-800">{p.kelainan.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{p.diobati.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right text-rose-700">{p.dirujuk.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{p.kunjunganRumah.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{p.posbindu}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{p.tenaga}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveModalPuskesmas(p)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Lihat Detail Puskesmas"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Menampilkan {paginatedList.length} dari {sortedList.length} Puskesmas</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2.5 py-1 border border-slate-300 rounded-md disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="font-semibold text-slate-800">{currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2.5 py-1 border border-slate-300 rounded-md disabled:opacity-40"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Puskesmas (Section 15 requirement) */}
      {activeModalPuskesmas && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Detail Profil Puskesmas
                </span>
                <h3 className="text-xl font-bold text-slate-900">{activeModalPuskesmas.puskesmas}</h3>
                <p className="text-xs text-slate-500">Periode: {periodLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalPuskesmas(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                <span className="text-slate-500 block">Sasaran Lansia</span>
                <span className="text-lg font-extrabold text-blue-900">
                  {activeModalPuskesmas.sasaran.toLocaleString('id-ID')} Jiwa
                </span>
              </div>
              <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200">
                <span className="text-slate-500 block">Cakupan Skrining</span>
                <span className="text-lg font-extrabold text-teal-900">
                  {activeModalPuskesmas.persenSkrining.toFixed(1)}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <span className="text-slate-500 block">Lansia Diobati</span>
                <span className="text-lg font-extrabold text-emerald-900">
                  {activeModalPuskesmas.diobati.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200">
                <span className="text-slate-500 block">Tenaga Kesehatan</span>
                <span className="text-lg font-extrabold text-indigo-900">
                  {activeModalPuskesmas.tenaga} Nakes
                </span>
              </div>
            </div>

            {/* Monthly Trend Chart for this puskesmas */}
            <div className="mb-6">
              <TrendLineChart
                title={`Tren Bulanan ${activeModalPuskesmas.puskesmas}`}
                subtitle={`Kunjungan & Skrining Januari–Desember ${filters.year}`}
                series={[
                  { name: 'Kunjungan', color: '#2563eb', data: modalTrendKunjungan },
                  { name: 'Skrining', color: '#0d9488', data: modalTrendSkrining },
                ]}
                periodLabel={`Tahun ${filters.year}`}
                height={200}
              />
            </div>

            {/* Kelurahan working areas */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Daftar Kelurahan di Wilayah Kerja ({activeModalPuskesmas.kelurahanList.length} Kelurahan):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeModalPuskesmas.kelurahanList.map((k, kIdx) => (
                  <span key={`${k}-${kIdx}`} className="px-2.5 py-1 bg-white text-slate-800 border border-slate-200 rounded-md font-semibold text-[11px]">
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
