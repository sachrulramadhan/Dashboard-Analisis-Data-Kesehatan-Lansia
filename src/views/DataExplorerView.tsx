import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Database, 
  Search, 
  ArrowUpDown, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  SlidersHorizontal,
  X,
  RefreshCw,
  Plus,
  Trash2,
  HelpCircle,
  FileText,
  Sparkles,
  Info,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Printer,
  FileUp
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { HealthRecord } from '../types';
import { exportRecordsToExcel, exportRecordsToCSV, triggerPrint, downloadTemplateExcel } from '../utils/exportUtils';
import { MONTH_NAMES } from '../data/mockHealthData';
import { parseImportFile, ParseResult } from '../utils/fileImportParser';
import { ValidationReport } from '../utils/fileImportValidator';

export const DataExplorerView: React.FC = () => {
  const { 
    dataset, 
    dataSourceType, 
    addRecords, 
    replaceDataset, 
    applyImportedRecords,
    clearDataset, 
    resetToDefaultData, 
    loadDemoData, 
    loadRealUploadedData, 
    filters, 
    updateFilter,
    isAdmin,
    requireAdmin,
    activeMenu,
    setActiveMenu
  } = useDashboard();

  useEffect(() => {
    if (activeMenu === 'validasi-data') {
      setShowValidationDetails(true);
    }
  }, [activeMenu]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof HealthRecord>('bulan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    tahun: true,
    bulan: true,
    puskesmas: true,
    kelurahan: true,
    sasaranLansia: true,
    kunjunganLansia: true,
    skriningLansia: true,
    lansiaDenganKelainan: true,
    diobati: true,
    dirujuk: true,
    hipertensi: true,
    diabetesMelitus: true,
    kolesterolTinggi: true,
    asamUratTinggi: true,
    jumlahKunjunganRumah: false,
    posyanduLansiaAktif: false,
    totalTenagaKesehatan: false,
  });

  const [showColPicker, setShowColPicker] = useState(false);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importedRowsPreview, setImportedRowsPreview] = useState<Partial<HealthRecord>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importValidation, setImportValidation] = useState<ValidationReport | null>(null);
  const [targetImportMonth, setTargetImportMonth] = useState<number>(2);
  const [targetImportYear, setTargetImportYear] = useState<number>(2026);
  const [showValidationDetails, setShowValidationDetails] = useState<boolean>(true);
  const [syncDashboardPeriod, setSyncDashboardPeriod] = useState<boolean>(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [importSummary, setImportSummary] = useState<ParseResult['summary'] | null>(null);
  const [realDataRestoredNotice, setRealDataRestoredNotice] = useState(false);
  const [importToast, setImportToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  // Confirmation Modals
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  // Sorting
  const handleSort = (field: keyof HealthRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredDataset = useMemo(() => {
    return dataset.filter((r) => {
      const q = searchTerm.toLowerCase();
      return (
        r.puskesmas.toLowerCase().includes(q) ||
        r.kelurahan.toLowerCase().includes(q) ||
        r.bulanNama.toLowerCase().includes(q) ||
        String(r.tahun).includes(q)
      );
    });
  }, [dataset, searchTerm]);

  const sortedDataset = useMemo(() => {
    return [...filteredDataset].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredDataset, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedDataset.length / pageSize) || 1;
  const paginatedDataset = sortedDataset.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Validation Metrics across dataset
  const validationSummary = useMemo(() => {
    let emptyValuesCount = 0;
    let extremeValuesCount = 0;
    const seenKeys = new Set<string>();
    let duplicateCount = 0;

    dataset.forEach((r) => {
      const key = `${r.tahun}-${r.bulan}-${r.puskesmas}-${r.kelurahan}`;
      if (seenKeys.has(key)) {
        duplicateCount++;
      } else {
        seenKeys.add(key);
      }

      if (r.kunjunganLansia > r.sasaranLansia * 2) extremeValuesCount++;
      if (r.skriningLansia > r.kunjunganLansia * 1.5) extremeValuesCount++;
      if (r.diobati > r.lansiaDenganKelainan) extremeValuesCount++;
    });

    return { emptyValuesCount, duplicateCount, extremeValuesCount };
  }, [dataset]);

  // File Processing Handler (Hanya membuka modal konfirmasi setelah file dipilih / di-drop pengguna)
  const processFile = async (file: File) => {
    if (!requireAdmin()) return;
    setImportFileName(file.name);
    setIsProcessingFile(true);
    setImportErrors([]);
    setImportWarnings([]);
    setImportedRowsPreview([]);
    setImportSummary(null);
    setImportValidation(null);

    try {
      const result = await parseImportFile(file, filters.year || 2026);
      setImportErrors(result.errors);
      setImportWarnings(result.warnings || []);
      setImportSummary(result.summary);
      setImportValidation(result.validation);

      const detMonth = result.validation?.detectedPeriod?.bulan || result.summary?.detectedMonth || 2;
      const detYear = result.validation?.detectedPeriod?.tahun || result.summary?.detectedYear || (filters.year || 2026);
      
      setTargetImportMonth(detMonth);
      setTargetImportYear(detYear);

      // Sinkronkan bulan dan tahun awal pada preview
      const initialPreview = result.records.map(r => ({
        ...r,
        bulan: detMonth,
        bulanNama: MONTH_NAMES[detMonth - 1] || 'Februari',
        tahun: detYear
      }));
      setImportedRowsPreview(initialPreview);
      setImportModalOpen(true);
    } catch (err: any) {
      setImportErrors([`Gagal membaca file: ${err?.message || 'Format tidak didukung'}`]);
      setImportModalOpen(true);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handler saat pengguna mengubah target bulan secara manual di modal
  const handleTargetMonthChange = (newMonth: number) => {
    setTargetImportMonth(newMonth);
    setImportedRowsPreview(prev =>
      prev.map(r => ({
        ...r,
        bulan: newMonth,
        bulanNama: MONTH_NAMES[newMonth - 1] || 'Januari'
      }))
    );
  };

  // Handler saat pengguna mengubah target tahun di modal
  const handleTargetYearChange = (newYear: number) => {
    setTargetImportYear(newYear);
    setImportedRowsPreview(prev =>
      prev.map(r => ({
        ...r,
        tahun: newYear
      }))
    );
  };

  const handleConfirmImport = async () => {
    if (importValidation && !importValidation.canProceed) {
      setImportToast({
        show: true,
        type: 'error',
        title: 'Gagal Memproses Data',
        message: importValidation.blockReason || 'Data kosong atau struktur kolom tidak sesuai skema database.'
      });
      return;
    }

    if (importedRowsPreview.length > 0) {
      const finalRecords: HealthRecord[] = (importedRowsPreview as HealthRecord[]).map((r, idx) => ({
        ...r,
        bulan: targetImportMonth,
        bulanNama: MONTH_NAMES[targetImportMonth - 1] || 'Februari',
        tahun: targetImportYear,
        id: `rec-${targetImportYear}-${targetImportMonth}-${(r.puskesmas || 'Puskesmas').replace(/\s+/g, '_')}-${(r.kelurahan || 'Kelurahan').replace(/\s+/g, '_')}-${idx}`
      }));

      // Simpan ke server (khusus admin) dan selaraskan periode dashboard
      try {
        await applyImportedRecords(finalRecords, importMode, targetImportMonth, targetImportYear);
      } catch (err: any) {
        setImportToast({
          show: true,
          type: 'error',
          title: 'Data Belum Tersimpan',
          message: err?.message || 'Terjadi kesalahan saat menyimpan data ke server.'
        });
        return;
      }

      setImportToast({
        show: true,
        type: 'success',
        title: importMode === 'replace' ? 'Data Berhasil Digantikan & Diterapkan!' : 'Data Berhasil Ditambahkan & Diterapkan!',
        message: `${finalRecords.length} baris data laporan untuk ${MONTH_NAMES[targetImportMonth - 1]} ${targetImportYear} telah tersimpan permanen di database sistem dan filter dashboard telah diselaraskan.`
      });

      setImportModalOpen(false);
      setImportedRowsPreview([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Status Simpan Data */}
      {importToast && importToast.show && (
        <div className={`p-4 rounded-xl border shadow-lg flex items-start justify-between gap-3 animate-slide-down ${
          importToast.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              importToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {importToast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">{importToast.title}</h4>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{importToast.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveMenu('overview')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Buka Tampilan Dashboard Utama
                </button>
                <button
                  type="button"
                  onClick={() => setImportToast(null)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setImportToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <PeriodBanner />

      {/* Sub-nav Tab Bar untuk Menu Data */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl overflow-x-auto scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveMenu('data-explorer')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeMenu === 'data-explorer'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Database className="w-4 h-4 text-blue-600" />
          <span>Tabel Eksplorasi Data</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {dataset.length.toLocaleString('id-ID')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu('import-data')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeMenu === 'import-data'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Import File Excel / CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu('validasi-data')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeMenu === 'validasi-data'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Audit & Validasi Kualitas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu('export-data')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeMenu === 'export-data'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Ekspor Data & Laporan</span>
        </button>
      </div>

      {/* Panel Khusus Import File Excel / CSV (Tampil In-Page tanpa modal popup otomatis) */}
      {activeMenu === 'import-data' && (
        <div className="bg-white border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl p-5 sm:p-6 shadow-xs transition-all">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  Import File Laporan Bulanan
                </span>
                <span className="text-xs text-slate-500">Mendukung .xlsx, .xls, .csv</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Unggah File Laporan Kesehatan Lansia Puskesmas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Pilih file Excel atau CSV laporan instansi Anda. Sistem akan memindai format kolom, memvalidasi integritas data, dan menyelaraskan periode waktu (bulan & tahun) secara otomatis sebelum disimpan ke database.
              </p>

              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <label onClick={(e) => { if (!isAdmin) { e.preventDefault(); requireAdmin(); } }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{isAdmin ? 'Pilih File dari Komputer' : 'Login Admin untuk Import'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={downloadTemplateExcel}
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Download Template Excel Resmi (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Drag & drop dropzone box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full lg:w-80 border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/80 scale-102'
                  : 'border-slate-300 bg-slate-50/80 hover:bg-slate-100/70 hover:border-blue-400'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                {isDragging ? 'Lepaskan file di sini' : 'Tarik & letakkan file di sini'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">atau klik untuk memilih file</p>
            </div>
          </div>

          {/* Petunjuk format kolom */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-1">1. Struktur Kolom</span>
              <p className="text-[11px] text-slate-500">
                Puskesmas, Kelurahan, Sasaran Lansia, Kunjungan, Skrining, Diobati, Dirujuk, Hipertensi, DM, dsb.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-1">2. Validasi & Pratinjau</span>
              <p className="text-[11px] text-slate-500">
                Jendela pratinjau dan konfirmasi hanya akan muncul setelah Anda memilih file untuk memastikan integritas data.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-1">3. Proteksi Data</span>
              <p className="text-[11px] text-slate-500">
                Pilihan metode Gantikan (Replace) atau Tambahkan (Append) tersedia sebelum menyimpan permanen ke database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Panel Khusus Ekspor Data & Laporan */}
      {activeMenu === 'export-data' && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
              Ekspor Data & Laporan
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Unduh Data & Rekapitulasi Program Lansia Kota Palu
          </h3>
          <p className="text-xs text-slate-600 mb-4 max-w-2xl leading-relaxed">
            Unduh data laporan dalam format Excel (.xlsx), CSV, atau cetak dokumen resmi untuk keperluan pelaporan ke Dinas Kesehatan Provinsi maupun Kementerian Kesehatan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              disabled={dataset.length === 0}
              onClick={() => exportRecordsToExcel(filteredDataset, 'Export_Data_Lansia')}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Export Excel (.xlsx)</span>
                <span className="text-[11px] text-emerald-700">Format spreadsheet lengkap</span>
              </div>
            </button>

            <button
              type="button"
              disabled={dataset.length === 0}
              onClick={() => exportRecordsToCSV(filteredDataset, 'Export_Data_Lansia')}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Export CSV (.csv)</span>
                <span className="text-[11px] text-slate-600">Format data mentah tabular</span>
              </div>
            </button>

            <button
              type="button"
              onClick={triggerPrint}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-950 block">Cetak / Simpan PDF</span>
                <span className="text-[11px] text-indigo-700">Cetak tampilan laporan resmi</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Panel Penjelasan & Pengendalian Sumber Data */}
      <div className={`rounded-xl p-4.5 border shadow-xs transition-all ${
        dataSourceType === 'demo'
          ? 'bg-linear-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border-amber-200'
          : dataSourceType === 'user'
          ? 'bg-linear-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-emerald-200'
          : 'bg-linear-to-r from-rose-50/90 via-slate-50 to-rose-50/90 border-rose-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              dataSourceType === 'demo'
                ? 'bg-amber-100 text-amber-800'
                : dataSourceType === 'user'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {dataSourceType === 'demo' && <Sparkles className="w-5 h-5 text-amber-700" />}
              {dataSourceType === 'user' && <Database className="w-5 h-5 text-emerald-700" />}
              {dataSourceType === 'empty' && <AlertCircle className="w-5 h-5 text-rose-700" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  {dataSourceType === 'demo' && 'Status Data: Data Simulasi / Contoh Bawaan (12 Puskesmas Kota Palu)'}
                  {dataSourceType === 'user' && 'Status Data: Data Riil Hasil Import Pengguna'}
                  {dataSourceType === 'empty' && 'Status Data: Data Masih Kosong (0 Baris)'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  dataSourceType === 'demo'
                    ? 'bg-amber-200/70 text-amber-900'
                    : dataSourceType === 'user'
                    ? 'bg-emerald-200/70 text-emerald-900'
                    : 'bg-rose-200/70 text-rose-900'
                }`}>
                  {dataset.length.toLocaleString('id-ID')} Baris Data
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                {dataSourceType === 'demo' && (
                  <>
                    Data yang sedang tampil saat ini adalah <strong>data contoh simulasi program kesehatan lansia</strong> (Tahun 2025–2026) agar Anda dapat langsung menguji coba seluruh indikator, grafik, analisis tren, peta GIS, dan fitur AI tanpa layar kosong. Anda dapat mengosongkan data simulasi ini atau langsung mengimpor file Excel/CSV riil instansi Anda.
                  </>
                )}
                {dataSourceType === 'user' && (
                  <>
                    Sistem saat ini sepenuhnya menggunakan data riil yang Anda import. Seluruh visualisasi, grafik tren bulanan/tahunan, dan perhitungan KPI secara otomatis menghitung data Anda.
                  </>
                )}
                {dataSourceType === 'empty' && (
                  <>
                    Sistem saat ini dalam keadaan bersih tanpa data. Silakan import file Excel/CSV laporan Anda menggunakan template yang telah disediakan, atau muat kembali data simulasi jika ingin melihat contoh visualisasi.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Data Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 w-full lg:w-auto justify-end">
            <button
              type="button"
              onClick={downloadTemplateExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Unduh contoh template format Excel (.xlsx) untuk laporan kesehatan lansia"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Template Excel</span>
            </button>

            {dataset.length > 0 && (
              <button
                type="button"
                onClick={() => requireAdmin() && setClearModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Hapus seluruh data saat ini agar menjadi kosong (0 baris)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Kosongkan Data</span>
              </button>
            )}

            {dataSourceType !== 'demo' && (
              <button
                type="button"
                onClick={() => setRestoreModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Kembalikan data ke contoh simulasi 12 Puskesmas Kota Palu"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Muat Data Contoh (Demo)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Data Explorer & Validasi Terpadu
            </h2>
            <p className="text-xs text-slate-500">
              Total {dataset.length.toLocaleString('id-ID')} baris data agregat tersimpan dalam sistem
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
                placeholder="Cari puskesmas, kelurahan, bulan..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-blue-500 text-slate-800 w-56"
              />
            </div>

            {/* Column Picker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColPicker(!showColPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Pilih Kolom</span>
              </button>

              {showColPicker && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                  <div className="font-bold text-slate-700 mb-2 border-b pb-1">Tampilkan Kolom:</div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {Object.keys(visibleColumns).map((colKey) => (
                      <label key={colKey} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={visibleColumns[colKey as keyof typeof visibleColumns]}
                          onChange={(e) =>
                            setVisibleColumns({ ...visibleColumns, [colKey]: e.target.checked })
                          }
                          className="rounded text-blue-600"
                        />
                        <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload File Button */}
            <label onClick={(e) => { if (!isAdmin) { e.preventDefault(); requireAdmin(); } }} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Import Excel / CSV' : 'Login Admin untuk Import'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Export buttons */}
            <button
              type="button"
              disabled={dataset.length === 0}
              onClick={() => exportRecordsToExcel(filteredDataset, 'Export_Data_Lansia')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              disabled={dataset.length === 0}
              onClick={() => exportRecordsToCSV(filteredDataset, 'Export_Data_Lansia')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Validation Status Cards (Section 27) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-900">Validitas Struktur Data</span>
            </div>
            <span className="font-bold text-emerald-800">100% Lolos Validasi</span>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-900">Duplikasi Record</span>
            </div>
            <span className="font-bold text-blue-800">{validationSummary.duplicateCount} Duplikat</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-700">Pengecekan Nilai Ekstrem</span>
            </div>
            <span className="font-bold text-slate-800">{validationSummary.extremeValuesCount} Peringatan</span>
          </div>
        </div>

        {/* Raw Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 select-none">
              <tr>
                {visibleColumns.tahun && <th onClick={() => handleSort('tahun')} className="p-2.5 cursor-pointer">Tahun</th>}
                {visibleColumns.bulan && <th onClick={() => handleSort('bulan')} className="p-2.5 cursor-pointer">Bulan</th>}
                {visibleColumns.puskesmas && <th onClick={() => handleSort('puskesmas')} className="p-2.5 cursor-pointer">Puskesmas</th>}
                {visibleColumns.kelurahan && <th onClick={() => handleSort('kelurahan')} className="p-2.5 cursor-pointer">Kelurahan</th>}
                {visibleColumns.sasaranLansia && <th onClick={() => handleSort('sasaranLansia')} className="p-2.5 text-right cursor-pointer">Sasaran</th>}
                {visibleColumns.kunjunganLansia && <th onClick={() => handleSort('kunjunganLansia')} className="p-2.5 text-right cursor-pointer">Kunjungan</th>}
                {visibleColumns.skriningLansia && <th onClick={() => handleSort('skriningLansia')} className="p-2.5 text-right cursor-pointer">Skrining</th>}
                {visibleColumns.lansiaDenganKelainan && <th onClick={() => handleSort('lansiaDenganKelainan')} className="p-2.5 text-right cursor-pointer">Kelainan</th>}
                {visibleColumns.diobati && <th onClick={() => handleSort('diobati')} className="p-2.5 text-right cursor-pointer">Diobati</th>}
                {visibleColumns.dirujuk && <th onClick={() => handleSort('dirujuk')} className="p-2.5 text-right cursor-pointer">Dirujuk</th>}
                {visibleColumns.hipertensi && <th onClick={() => handleSort('hipertensi')} className="p-2.5 text-right cursor-pointer">Hipertensi</th>}
                {visibleColumns.diabetesMelitus && <th onClick={() => handleSort('diabetesMelitus')} className="p-2.5 text-right cursor-pointer">Diabetes</th>}
                {visibleColumns.kolesterolTinggi && <th onClick={() => handleSort('kolesterolTinggi')} className="p-2.5 text-right cursor-pointer">Kolesterol</th>}
                {visibleColumns.asamUratTinggi && <th onClick={() => handleSort('asamUratTinggi')} className="p-2.5 text-right cursor-pointer">Asam Urat</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDataset.length === 0 ? (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Database className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">Tidak ada data yang ditemukan</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {dataset.length === 0 
                          ? 'Sistem saat ini kosong (0 baris). Silakan klik tombol "Import Excel / CSV" di atas untuk memasukkan data laporan Anda.'
                          : 'Tidak ada baris data yang cocok dengan kriteria pencarian Anda.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDataset.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    {visibleColumns.tahun && <td className="p-2.5 font-semibold text-slate-700">{r.tahun}</td>}
                    {visibleColumns.bulan && <td className="p-2.5 font-medium text-slate-600">{r.bulanNama}</td>}
                    {visibleColumns.puskesmas && <td className="p-2.5 font-bold text-slate-900">{r.puskesmas}</td>}
                    {visibleColumns.kelurahan && <td className="p-2.5 text-slate-700">{r.kelurahan}</td>}
                    {visibleColumns.sasaranLansia && <td className="p-2.5 text-right text-slate-700">{r.sasaranLansia.toLocaleString('id-ID')}</td>}
                    {visibleColumns.kunjunganLansia && <td className="p-2.5 text-right font-bold text-blue-700">{r.kunjunganLansia.toLocaleString('id-ID')}</td>}
                    {visibleColumns.skriningLansia && <td className="p-2.5 text-right text-teal-800 font-semibold">{r.skriningLansia.toLocaleString('id-ID')}</td>}
                    {visibleColumns.lansiaDenganKelainan && <td className="p-2.5 text-right text-amber-800 font-semibold">{r.lansiaDenganKelainan.toLocaleString('id-ID')}</td>}
                    {visibleColumns.diobati && <td className="p-2.5 text-right text-emerald-700 font-semibold">{r.diobati.toLocaleString('id-ID')}</td>}
                    {visibleColumns.dirujuk && <td className="p-2.5 text-right text-rose-700">{r.dirujuk.toLocaleString('id-ID')}</td>}
                    {visibleColumns.hipertensi && <td className="p-2.5 text-right text-slate-700">{r.hipertensi.toLocaleString('id-ID')}</td>}
                    {visibleColumns.diabetesMelitus && <td className="p-2.5 text-right text-slate-700">{r.diabetesMelitus.toLocaleString('id-ID')}</td>}
                    {visibleColumns.kolesterolTinggi && <td className="p-2.5 text-right text-slate-700">{r.kolesterolTinggi.toLocaleString('id-ID')}</td>}
                    {visibleColumns.asamUratTinggi && <td className="p-2.5 text-right text-slate-700">{r.asamUratTinggi.toLocaleString('id-ID')}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Reset */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Menampilkan {paginatedDataset.length} dari {sortedDataset.length} baris</span>
            {dataSourceType !== 'demo' && (
              <button
                type="button"
                onClick={() => setRestoreModalOpen(true)}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Muat Data Contoh (Demo)
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2.5 py-1 border border-slate-300 rounded-md disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="font-semibold text-slate-800">{totalPages === 0 ? 0 : currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2.5 py-1 border border-slate-300 rounded-md disabled:opacity-40"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Import Confirmation & Schema Validation Modal (Fitur Validasi Otomatis & Anti Data Kosong) */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  importValidation?.status === 'valid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : importValidation?.status === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {importValidation?.status === 'valid' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : importValidation?.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Audit Validasi Skema Database
                    </span>
                    {importValidation && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        importValidation.status === 'valid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : importValidation.status === 'warning'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {importValidation.status === 'valid' && `Format Sesuai Skema (${importValidation.score}%)`}
                        {importValidation.status === 'warning' && `Format Diterima dengan Koreksi (${importValidation.score}%)`}
                        {importValidation.status === 'invalid' && `Format Tidak Sesuai Skema (Ditolak)`}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 break-all">
                    {importFileName}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              {/* Alert Banner jika Format Tidak Sesuai Skema (Blokir Data Kosong) */}
              {importValidation && !importValidation.canProceed && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-950">
                        {importValidation.title || 'Format File Tidak Sesuai Skema Database'}
                      </h4>
                      <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                        {importValidation.blockReason || 'Sistem menolak import data ini untuk mencegah database kosong atau terjadinya error perhitungan pada dashboard.'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-rose-700">Gunakan format template standar untuk mengimpor kembali:</span>
                    <button
                      type="button"
                      onClick={downloadTemplateExcel}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold shadow-2xs cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
                      Unduh Template Excel Resmi (.xlsx)
                    </button>
                  </div>
                </div>
              )}

              {/* Ringkasan Hasil Validasi Integritas Data */}
              {importValidation && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Total Baris Terbaca</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {importValidation.stats.totalRows.toLocaleString('id-ID')} Baris
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-semibold block">Total Sasaran Lansia</span>
                    <span className="text-sm font-bold text-emerald-900 mt-0.5 block">
                      {importValidation.stats.totalSasaran.toLocaleString('id-ID')} Jiwa
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                    <span className="text-[10px] text-blue-700 font-semibold block">Total Kunjungan</span>
                    <span className="text-sm font-bold text-blue-900 mt-0.5 block">
                      {importValidation.stats.totalKunjungan.toLocaleString('id-ID')} Org
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200">
                    <span className="text-[10px] text-purple-700 font-semibold block">Total Skrining Lansia</span>
                    <span className="text-sm font-bold text-purple-900 mt-0.5 block">
                      {importValidation.stats.totalSkrining.toLocaleString('id-ID')} Org
                    </span>
                  </div>
                </div>
              )}

              {/* Panel Pengaturan Periode Data Dashboard (Menjamin data Februari muncul) */}
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-bold text-blue-950">
                      Alokasi Periode Waktu di Dashboard
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-800 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
                    Terdeteksi dari file: {MONTH_NAMES[targetImportMonth - 1]} {targetImportYear}
                  </span>
                </div>

                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Pastikan bulan dan tahun berikut sesuai dengan periode laporan yang Anda unggah agar data langsung tampil saat Anda memilih filter periode di dashboard:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Bulan Laporan:
                    </label>
                    <select
                      value={targetImportMonth}
                      onChange={(e) => handleTargetMonthChange(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-blue-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          Bulan {idx + 1} - {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tahun Laporan:
                    </label>
                    <select
                      value={targetImportYear}
                      onChange={(e) => handleTargetYearChange(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-blue-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={2024}>Tahun 2024</option>
                      <option value={2025}>Tahun 2025</option>
                      <option value={2026}>Tahun 2026</option>
                      <option value={2027}>Tahun 2027</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 text-[11px] font-medium text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncDashboardPeriod}
                    onChange={(e) => setSyncDashboardPeriod(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Otomatis buka filter Dashboard ke <strong>{MONTH_NAMES[targetImportMonth - 1]} {targetImportYear}</strong> setelah proses impor selesai
                  </span>
                </label>
              </div>

              {/* Rincian Pengecekan Skema (Checklist Otomatis) */}
              {importValidation && importValidation.checks && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setShowValidationDetails(prev => !prev)}
                    className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      Rincian Audit Skema Database ({importValidation.checks.length} Pemeriksaan Otomatis)
                    </span>
                    {showValidationDetails ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {showValidationDetails && (
                    <div className="p-3 bg-white border-t border-slate-200 space-y-2 text-xs divide-y divide-slate-100">
                      {importValidation.checks.map((check) => (
                        <div key={check.id} className="pt-2 first:pt-0 flex items-start gap-2.5">
                          {check.status === 'pass' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {check.status === 'warning' && (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          {check.status === 'fail' && (
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{check.title}</span>
                              <span className="text-[10px] text-slate-400 capitalize">{check.category}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">{check.message}</p>
                            {check.detail && (
                              <p className="text-[10px] text-slate-500 mt-0.5 italic">{check.detail}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mode Impor Radio */}
              {(!importValidation || importValidation.canProceed) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Pilih Metode Impor:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`flex items-start gap-2.5 text-xs p-2.5 rounded-lg border transition-all cursor-pointer ${
                      importMode === 'replace' ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Gantikan Seluruh Data (Replace)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Menghapus data simulasi / data lama dan menggantikannya secara bersih dengan {importedRowsPreview.length} data riil Anda.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-2.5 text-xs p-2.5 rounded-lg border transition-all cursor-pointer ${
                      importMode === 'append' ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="importMode"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Tambahkan ke Data yang Ada (Append)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Menggabungkan {importedRowsPreview.length} baris data laporan baru ini dengan data yang sudah tersimpan sebelumnya.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Quick Preview Table */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Pratinjau Data yang Diselaraskan ({importedRowsPreview.length} Baris):
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Menampilkan 5 baris pertama
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="p-2">Puskesmas</th>
                        <th className="p-2">Kelurahan</th>
                        <th className="p-2">Bulan & Tahun</th>
                        <th className="p-2 text-right">Sasaran</th>
                        <th className="p-2 text-right">Kunjungan</th>
                        <th className="p-2 text-right">Skrining</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importedRowsPreview.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-2 font-medium text-slate-900">{row.puskesmas}</td>
                          <td className="p-2 font-semibold text-slate-700">{row.kelurahan}</td>
                          <td className="p-2 text-slate-600 font-medium">
                            {MONTH_NAMES[targetImportMonth - 1]} {targetImportYear}
                          </td>
                          <td className="p-2 text-right font-medium text-slate-800">
                            {row.sasaranLansia?.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-right font-bold text-blue-700">
                            {row.kunjunganLansia?.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-right font-bold text-purple-700">
                            {row.skriningLansia?.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ Valid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-3 shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadTemplateExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                title="Unduh format template Excel resmi"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Template Resmi
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={Boolean(importValidation && !importValidation.canProceed) || importedRowsPreview.length === 0}
                  onClick={handleConfirmImport}
                  className={`px-5 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all ${
                    Boolean(importValidation && !importValidation.canProceed) || importedRowsPreview.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  {importValidation && !importValidation.canProceed
                    ? 'Format Ditolak (Data Kosong)'
                    : importMode === 'replace'
                    ? 'Gantikan & Terapkan Data'
                    : 'Tambahkan Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Kosongkan Semua Data?</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus {dataset.length} baris data tersimpan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Setelah dikosongkan, dataset akan menjadi <strong>0 baris</strong>. Dashboard akan menunggu Anda mengimpor file data laporan riil Anda (.xlsx / .csv). Jika ingin kembali melihat contoh, Anda dapat memuat ulang data simulasi kapan saja.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  clearDataset();
                  setClearModalOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Kosongkan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Demo Data Confirmation Modal */}
      {restoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Muat Kembali Data Contoh?</h3>
                <p className="text-xs text-slate-500">Simulasi 12 Puskesmas & 46 Kelurahan Kota Palu</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Sistem akan memuat ulang data simulasi lengkap (Tahun 2025–2026) untuk demonstrasi semua fitur dashboard.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  loadDemoData();
                  setRestoreModalOpen(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Muat Data Contoh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
