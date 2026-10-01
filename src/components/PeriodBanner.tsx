import React from 'react';
import { Calendar, Layers, Database, Upload, Sparkles } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const PeriodBanner: React.FC = () => {
  const { filters, updateFilter, periodLabel, dataSourceType, dataset, setActiveMenu } = useDashboard();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
        <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0 mt-0.5 sm:mt-0">
          {filters.mode === 'monthly' ? (
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Periode Analisis:
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-800">
              {filters.mode === 'monthly' ? 'BULANAN' : 'AKUMULASI 1 TAHUN'}
            </span>

            {/* Data Source Badge */}
            {dataSourceType === 'demo' && (
              <span 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                title="Data simulasi 12 Puskesmas Kota Palu"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Simulasi ({dataset.length} baris)
              </span>
            )}

            {dataSourceType === 'user' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Database className="w-3 h-3 text-emerald-600" />
                Data Riil ({dataset.length} baris)
              </span>
            )}

            {dataSourceType === 'empty' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                <Database className="w-3 h-3 text-rose-600" />
                Data Kosong (0)
              </span>
            )}
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-words">
            {periodLabel}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => updateFilter('mode', 'monthly')}
            className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filters.mode === 'monthly'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulanan
          </button>
          <button
            type="button"
            onClick={() => updateFilter('mode', 'cumulative')}
            className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filters.mode === 'cumulative'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Akumulasi
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveMenu('data-explorer')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
          title="Kelola data, unduh template, atau impor data laporan Anda"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span>Kelola Data</span>
        </button>
      </div>
    </div>
  );
};
