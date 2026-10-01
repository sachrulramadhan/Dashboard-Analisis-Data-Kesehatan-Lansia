import React from 'react';

export interface StackSegment {
  name: string;
  value: number;
  color: string;
}

export interface StackedRow {
  label: string;
  segments: StackSegment[];
}

interface StackedBarChartProps {
  title: string;
  subtitle?: string;
  rows: StackedRow[];
  periodLabel: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  title,
  subtitle,
  rows,
  periodLabel,
}) => {
  // Extract unique segment categories for legend
  const legendMap = new Map<string, string>();
  rows.forEach((r) => {
    r.segments.forEach((s) => {
      if (!legendMap.has(s.name)) {
        legendMap.set(s.name, s.color);
      }
    });
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {periodLabel}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        {Array.from(legendMap.entries()).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: color }} />
            <span>{name}</span>
          </div>
        ))}
      </div>

      {/* Stacked Bars */}
      <div className="space-y-3.5">
        {rows.map((row, rIdx) => {
          const rowTotal = row.segments.reduce((acc, s) => acc + s.value, 0);

          return (
            <div key={`${row.label}-${rIdx}`} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800">{row.label}</span>
                <span className="font-bold text-slate-900">
                  Total: {rowTotal.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-md h-5 overflow-hidden flex shadow-2xs">
                {row.segments.map((seg, sIdx) => {
                  const pct = rowTotal > 0 ? (seg.value / rowTotal) * 100 : 0;
                  if (pct <= 0) return null;

                  return (
                    <div
                      key={sIdx}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: seg.color,
                      }}
                      className="h-full relative group/item hover:brightness-110 transition-all flex items-center justify-center text-[10px] text-white font-bold overflow-hidden"
                      title={`${seg.name}: ${seg.value.toLocaleString('id-ID')} (${pct.toFixed(1)}%)`}
                    >
                      {pct > 12 && <span>{pct.toFixed(0)}%</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
