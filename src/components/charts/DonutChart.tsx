import React from 'react';

interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  subtitle?: string;
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  periodLabel: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  subtitle,
  segments,
  centerLabel,
  centerValue,
  periodLabel,
}) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0);

  // SVG parameters
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

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

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Segments */}
            {segments.map((seg, idx) => {
              const pct = total > 0 ? seg.value / total : 0;
              const strokeDasharray = `${circumference * pct} ${circumference * (1 - pct)}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += pct;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-xs font-semibold text-slate-500 leading-tight">
              {centerLabel || 'Total'}
            </span>
            <span className="text-lg font-extrabold text-slate-900 leading-tight">
              {centerValue !== undefined
                ? typeof centerValue === 'number'
                  ? centerValue.toLocaleString('id-ID')
                  : centerValue
                : total.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Legend with percentages */}
        <div className="space-y-2.5 w-full sm:w-auto">
          {segments.map((seg) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0;
            return (
              <div key={seg.name} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-semibold text-slate-700">{seg.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {seg.value.toLocaleString('id-ID')}
                  </span>
                  <span className="text-slate-500 font-medium min-w-[42px] text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
