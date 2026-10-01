import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: number | null;
  periodCompareLabel?: string;
  isPositiveWhenRising?: boolean;
  aggregationFormula?: string;
  icon?: React.ReactNode;
  highlightColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
  empty?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  delta,
  periodCompareLabel = 'periode sebelumnya',
  isPositiveWhenRising = true,
  aggregationFormula,
  icon,
  highlightColor = 'blue',
  empty = false,
}) => {
  // Determine delta trend status
  let status: 'meningkat' | 'menurun' | 'stabil' | 'na' = 'na';
  if (delta !== null && delta !== undefined) {
    if (Math.abs(delta) < 0.2) {
      status = 'stabil';
    } else if (delta > 0) {
      status = 'meningkat';
    } else {
      status = 'menurun';
    }
  }

  // Determine trend color based on whether rising is good or bad
  let trendBadgeClass = 'bg-slate-100 text-slate-600';
  let trendIcon = <Minus className="w-3.5 h-3.5" />;

  if (status === 'meningkat') {
    if (isPositiveWhenRising) {
      trendBadgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else {
      trendBadgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
    }
    trendIcon = <TrendingUp className="w-3.5 h-3.5" />;
  } else if (status === 'menurun') {
    if (isPositiveWhenRising) {
      trendBadgeClass = 'bg-amber-50 text-amber-700 border border-amber-200';
    } else {
      trendBadgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    trendIcon = <TrendingDown className="w-3.5 h-3.5" />;
  } else if (status === 'stabil') {
    trendBadgeClass = 'bg-slate-100 text-slate-700 border border-slate-200';
    trendIcon = <Minus className="w-3.5 h-3.5" />;
  }

  const colorStyles: Record<string, string> = {
    blue: 'border-l-blue-600 bg-blue-50/20',
    emerald: 'border-l-emerald-600 bg-emerald-50/20',
    amber: 'border-l-amber-500 bg-amber-50/20',
    rose: 'border-l-rose-600 bg-rose-50/20',
    indigo: 'border-l-indigo-600 bg-indigo-50/20',
    slate: 'border-l-slate-600 bg-slate-50/20',
  };

  const formattedValue = typeof value === 'number' ? value.toLocaleString('id-ID') : value;

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden border-l-4 ${
        colorStyles[highlightColor] || colorStyles.blue
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-600 tracking-wide line-clamp-1">
          {title}
        </span>
        {icon && <div className="text-slate-500 shrink-0">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        {empty ? (
          <span className="text-lg font-medium text-slate-400 italic">Data kosong</span>
        ) : (
          <>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formattedValue}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
          </>
        )}
      </div>

      {/* Delta & Status */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
        {status !== 'na' && delta !== null && delta !== undefined ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${trendBadgeClass}`}>
              {trendIcon}
              <span>{delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {status.toUpperCase()} vs {periodCompareLabel}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">Data pembanding tidak tersedia</span>
        )}

        {aggregationFormula && (
          <div className="group relative inline-block cursor-help ml-auto">
            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
            <div className="invisible group-hover:visible absolute right-0 bottom-full mb-1.5 z-30 w-52 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg pointer-events-none">
              <p className="font-semibold text-slate-200 mb-0.5">Metode Perhitungan:</p>
              <p className="text-slate-300 leading-relaxed">{aggregationFormula}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
