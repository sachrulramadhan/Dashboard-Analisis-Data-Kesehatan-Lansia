import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  RotateCcw, 
  Download, 
  Printer, 
  Sparkles, 
  UserCheck, 
  Menu, 
  X, 
  FileSpreadsheet, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  SlidersHorizontal, 
  Calendar, 
  Check,
  Lock,
  LogOut
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { MONTH_NAMES } from '../data/mockHealthData';
import { exportSummaryToExcel, exportRecordsToExcel, triggerPrint } from '../utils/exportUtils';
import { UserRole } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    allPuskesmasList, 
    kelurahanOptions,
    metrics,
    puskesmasStats,
    filteredRecords,
    setActiveMenu,
    userRole,
    setUserRole,
    isAdmin,
    setAdminLoginOpen,
    logoutAdmin,
  } = useDashboard();

  const [exportOpen, setExportOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // ignore
    }
  };

  const handleExportExcel = () => {
    exportSummaryToExcel(metrics, puskesmasStats, filters);
    setExportOpen(false);
  };

  const handleExportRaw = () => {
    exportRecordsToExcel(filteredRecords, `Data_Lansia_Raw_${filters.year}`);
    setExportOpen(false);
  };

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    admin: { label: 'Administrator Dinkes', badge: 'bg-purple-100 text-purple-800' },
    pengelola: { label: 'Pengelola Program Lansia', badge: 'bg-blue-100 text-blue-800' },
    pimpinan: { label: 'Kepala Dinas / Pimpinan', badge: 'bg-emerald-100 text-emerald-800' },
  };

  return (
    <header className="bg-white border-b border-slate-200 shrink-0 z-30 shadow-xs w-full">
      {/* Top Bar: Title & User Info */}
      <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer touch-manipulation shrink-0"
            aria-label="Buka Menu Navigasi"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                  SIMETRI LANSIA
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  DINKES PALU
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block truncate">
                Sistem Monitoring & Evaluasi Terintegrasi Program Kesehatan Lanjut Usia
              </p>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Quick Button */}
          <button
            type="button"
            onClick={() => setActiveMenu('ai-analyst')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-xs hover:from-indigo-700 hover:to-blue-700 transition-all cursor-pointer touch-manipulation"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden md:inline">Analisis AI</span>
            <span className="md:hidden">AI</span>
          </button>

          {/* Login Admin */}
          <button
            type="button"
            onClick={() => (isAdmin ? logoutAdmin() : setAdminLoginOpen(true))}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer touch-manipulation ${
              isAdmin
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={isAdmin ? 'Keluar dari mode admin' : 'Masuk sebagai admin untuk mengubah data'}
          >
            {isAdmin ? <LogOut className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAdmin ? 'Keluar Admin' : 'Login Admin'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer touch-manipulation"
              aria-label="Menu Ekspor"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Ringkasan (Excel)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportRaw}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Export Data Lengkap (Excel)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerPrint();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Cetak / PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Fullscreen Button (Tablet & Desktop) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          {/* Role Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleOpen(!roleOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer touch-manipulation"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${roleLabels[userRole].badge}`}>
                {userRole.toUpperCase()}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {roleOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 font-semibold text-slate-400 text-[10px] uppercase">
                  Pilih Hak Akses / Profil:
                </div>
                {(['admin', 'pengelola', 'pimpinan'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setUserRole(r);
                      setRoleOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      userRole === r ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{roleLabels[r].label}</span>
                    {userRole === r && <span className="text-blue-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Quick Filter Header (< md screens) */}
      <div className="md:hidden px-3 py-2 bg-slate-50/95 border-t border-slate-200 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-between px-3 py-1.5 bg-white border border-blue-300 hover:border-blue-400 rounded-xl shadow-2xs text-left cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-900 block truncate">
                {filters.mode === 'monthly' ? `${MONTH_NAMES[filters.month - 1]} ${filters.year}` : `Akumulasi ${filters.year}`}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {filters.puskesmas === 'ALL' ? 'Semua Puskesmas' : filters.puskesmas.replace('Puskesmas ', '')}
                {filters.kelurahan !== 'ALL' ? ` • ${filters.kelurahan}` : ''}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            Ubah
          </span>
        </button>

        <button
          type="button"
          onClick={resetFilters}
          className="p-2 bg-white border border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 shadow-2xs shrink-0 cursor-pointer"
          title="Reset Filter"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Global Filter Bar (Tablet & Desktop: md:flex) */}
      <div className="hidden md:block px-4 lg:px-6 py-2 bg-slate-50/95 border-t border-slate-200 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-2.5 min-w-max">
          {/* Mode Switcher */}
          <div className="shrink-0 flex items-center bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() => updateFilter('mode', 'monthly')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filters.mode === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BULANAN
            </button>
            <button
              type="button"
              onClick={() => updateFilter('mode', 'cumulative')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filters.mode === 'cumulative'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AKUMULASI 1 TAHUN
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 mx-0.5 shrink-0" />

          {/* Tahun */}
          <div className="shrink-0 flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500">Tahun:</label>
            <select
              value={filters.year}
              onChange={(e) => updateFilter('year', Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs focus:outline-blue-500 cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* Bulan */}
          <div className="shrink-0 flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500">Bulan:</label>
            {filters.mode === 'monthly' ? (
              <select
                value={filters.month}
                onChange={(e) => updateFilter('month', Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs focus:outline-blue-500 cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-slate-200/80 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 cursor-not-allowed">
                Januari – Desember
              </div>
            )}
          </div>

          {/* Puskesmas */}
          <div className="shrink-0 flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500">Puskesmas:</label>
            <select
              value={filters.puskesmas}
              onChange={(e) => updateFilter('puskesmas', e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs focus:outline-blue-500 max-w-[170px] truncate cursor-pointer"
            >
              <option value="ALL">Semua Puskesmas (12)</option>
              {allPuskesmasList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Kelurahan */}
          <div className="shrink-0 flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500">Kelurahan:</label>
            <select
              value={filters.kelurahan}
              onChange={(e) => updateFilter('kelurahan', e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs focus:outline-blue-500 max-w-[170px] truncate cursor-pointer"
            >
              <option value="ALL">Semua Kelurahan</option>
              {kelurahanOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Jenis Kelamin */}
          <div className="shrink-0 flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500">Gender:</label>
            <select
              value={filters.gender}
              onChange={(e) => updateFilter('gender', e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs focus:outline-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Kelompok Umur */}
          <div className="shrink-0 flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500">Umur:</label>
            <select
              value={filters.ageGroup}
              onChange={(e) => updateFilter('ageGroup', e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs focus:outline-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Umur</option>
              <option value="45-59">45–59 (Pra-lansia)</option>
              <option value="60-69">60–69 (Lansia Muda)</option>
              <option value="70+">70+ (Lansia Risti)</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <button
            type="button"
            onClick={resetFilters}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
            title="Reset semua filter ke kondisi awal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet / Modal (Khusus HP & Tablet) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Filter Analisis Data</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs">
              {/* Mode Analisis */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Mode Analisis:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilter('mode', 'monthly')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      filters.mode === 'monthly'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilter('mode', 'cumulative')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      filters.mode === 'cumulative'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Akumulasi 1 Tahun
                  </button>
                </div>
              </div>

              {/* Tahun */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Tahun:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[2026, 2025].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => updateFilter('year', y)}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        filters.year === y
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulan Grid (jika mode bulanan) */}
              {filters.mode === 'monthly' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Bulan:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {MONTH_NAMES.map((name, idx) => {
                      const isSelected = filters.month === idx + 1;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => updateFilter('month', idx + 1)}
                          className={`py-2 px-1 text-center rounded-lg font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Puskesmas */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Puskesmas:</label>
                <select
                  value={filters.puskesmas}
                  onChange={(e) => updateFilter('puskesmas', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  <option value="ALL">Semua Puskesmas (14 Puskesmas Kota Palu)</option>
                  {allPuskesmasList.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kelurahan */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Kelurahan:</label>
                <select
                  value={filters.kelurahan}
                  onChange={(e) => updateFilter('kelurahan', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  <option value="ALL">Semua Kelurahan</option>
                  {kelurahanOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender & Umur */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => updateFilter('gender', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-800"
                  >
                    <option value="ALL">Semua</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Kelompok Umur:</label>
                  <select
                    value={filters.ageGroup}
                    onChange={(e) => updateFilter('ageGroup', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-800"
                  >
                    <option value="ALL">Semua Umur</option>
                    <option value="45-59">45–59 Thn</option>
                    <option value="60-69">60–69 Thn</option>
                    <option value="70+">70+ Thn</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3 shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setMobileFilterOpen(false);
                }}
                className="px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 text-xs hover:bg-slate-50 cursor-pointer"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
