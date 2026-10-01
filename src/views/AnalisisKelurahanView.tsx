import React, { useState, useMemo } from 'react';
import { MapPin, Search, ArrowUpDown, Filter, Building } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { KelurahanStat } from '../types';

export const AnalisisKelurahanView: React.FC = () => {
  const { kelurahanStats, periodLabel, allPuskesmasList, filters, updateFilter } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPuskesmasFilter, setSelectedPuskesmasFilter] = useState('ALL');
  const [sortField, setSortField] = useState<keyof KelurahanStat>('kunjungan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const handleSort = (field: keyof KelurahanStat) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredList = useMemo(() => {
    return kelurahanStats.filter((k) => {
      const matchSearch =
        k.kelurahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.puskesmas.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPusk =
        selectedPuskesmasFilter === 'ALL' || k.puskesmas === selectedPuskesmasFilter;
      return matchSearch && matchPusk;
    });
  }, [kelurahanStats, searchTerm, selectedPuskesmasFilter]);

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

  return (
    <div className="space-y-6">
      <PeriodBanner />

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        {/* Drill down & Controls (Section 16) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Tabel Analisis Capaian Kelurahan se-Kota Palu
            </h2>
            <p className="text-xs text-slate-500">
              Drill-down: Kota Palu → Puskesmas Pembina → Kelurahan Wilayah Kerja • {periodLabel}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Puskesmas */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Filter Puskesmas:</span>
              <select
                value={selectedPuskesmasFilter}
                onChange={(e) => {
                  setSelectedPuskesmasFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="ALL">Semua Puskesmas</option>
                {allPuskesmasList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Kelurahan..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-blue-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 select-none">
              <tr>
                <th onClick={() => handleSort('kelurahan')} className="py-2.5 px-3 cursor-pointer hover:text-slate-900">
                  <div className="flex items-center gap-1">
                    <span>Kelurahan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('puskesmas')} className="py-2.5 px-3 cursor-pointer hover:text-slate-900">
                  <div className="flex items-center gap-1">
                    <span>Puskesmas Pembina</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('sasaran')} className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Sasaran</span>
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
                    <span>% Skrining</span>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.map((k) => (
                <tr key={`${k.puskesmas}_${k.kelurahan}`} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{k.kelurahan}</td>
                  <td className="py-2.5 px-3 text-slate-600">{k.puskesmas}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{k.sasaran.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{k.kunjungan.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right text-teal-800 font-semibold">{k.skrining.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-blue-700">{k.persenSkrining.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right text-amber-800 font-semibold">{k.kelainan.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{k.diobati.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right text-rose-700">{k.dirujuk.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Menampilkan {paginatedList.length} dari {sortedList.length} Kelurahan</span>
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
    </div>
  );
};
