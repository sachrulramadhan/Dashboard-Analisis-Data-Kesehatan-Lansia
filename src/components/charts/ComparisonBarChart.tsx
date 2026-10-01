import React from 'react';

interface BarItem {
  label: string;
  sublabel?: string;
  value: number;
  percentage?: number;
  color?: string;
}

interface ComparisonBarChartProps {
  title: string;
  subtitle?: string;
  items: BarItem[];
  valueUnit?: string;
  maxDisplay?: number;
  periodLabel: string;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  title,
  subtitle,
  items,
  valueUnit = '',
  maxDisplay = 10,
  periodLabel,
}) => {
  const displayItems = items.slice(0, maxDisplay);
  const maxValue = Math.max(...displayItems.map((i) => i.value), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {periodLabel}
        </span>
      </div>

      <div className="space-y-3">
        {displayItems.map((item, idx) => {
          const widthPct = Math.max(3, (item.value / maxValue) * 100);
          return (
            <div key={`${item.label}-${idx}`} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 w-4 text-right">{idx + 1}.</span>
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  {item.sublabel && (
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      ({item.sublabel})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">
                    {item.value.toLocaleString('id-ID')} {valueUnit}
                  </span>
                  {item.percentage !== undefined && (
                    <span className="text-slate-500 text-[11px] min-w-[42px] text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  style={{ width: `${widthPct}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.color || 'bg-blue-600'
                  } group-hover:brightness-110`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
