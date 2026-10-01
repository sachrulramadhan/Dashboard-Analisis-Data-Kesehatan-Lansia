import React, { useState } from 'react';
import { MONTH_NAMES } from '../../data/mockHealthData';

interface TrendSeries {
  name: string;
  color: string;
  data: number[]; // 12 elements for Jan-Dec
}

interface TrendLineChartProps {
  title: string;
  subtitle?: string;
  series: TrendSeries[];
  periodLabel: string;
  yAxisUnit?: string;
  height?: number;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  title,
  subtitle,
  series,
  periodLabel,
  yAxisUnit = '',
  height = 240,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compute max value for scaling
  const allValues = series.flatMap((s) => s.data);
  const maxValue = Math.max(...allValues, 10);
  const paddingX = 40;
  const paddingY = 30;
  const width = 680;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const pointsForSeries = (data: number[]) => {
    return data.map((val, idx) => {
      const x = paddingX + (idx / 11) * chartWidth;
      const y = height - paddingY - (val / maxValue) * chartHeight;
      return { x, y, val };
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {periodLabel}
          </span>
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * chartHeight;
            const gridVal = Math.round(ratio * maxValue);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {gridVal.toLocaleString('id-ID')}
                </text>
              </g>
            );
          })}

          {/* Lines and Areas */}
          {series.map((s) => {
            const points = pointsForSeries(s.data);
            const pathD = points.reduce((acc, p, idx) => {
              return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
            }, '');

            const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

            return (
              <g key={s.name}>
                {/* Gradient area */}
                <path d={areaD} fill={s.color} fillOpacity="0.08" />
                {/* Stroke line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dots */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={hoverIndex === idx ? 5 : 3.5}
                    fill={hoverIndex === idx ? '#ffffff' : s.color}
                    stroke={s.color}
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                  />
                ))}
              </g>
            );
          })}

          {/* Hover highlight column */}
          {hoverIndex !== null && (
            <line
              x1={paddingX + (hoverIndex / 11) * chartWidth}
              y1={paddingY}
              x2={paddingX + (hoverIndex / 11) * chartWidth}
              y2={height - paddingY}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* X Axis Months */}
          {MONTH_NAMES.map((name, idx) => {
            const x = paddingX + (idx / 11) * chartWidth;
            const shortName = name.slice(0, 3);
            return (
              <g
                key={name}
                onMouseEnter={() => setHoverIndex(idx)}
                className="cursor-pointer"
              >
                {/* Transparent hit area */}
                <rect
                  x={x - chartWidth / 24}
                  y={0}
                  width={chartWidth / 12}
                  height={height}
                  fill="transparent"
                />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    hoverIndex === idx ? 'fill-blue-600 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {shortName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg shadow-xl p-2.5 text-xs -translate-x-1/2 -top-2"
            style={{
              left: `${((paddingX + (hoverIndex / 11) * chartWidth) / width) * 100}%`,
            }}
          >
            <div className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1.5">
              {MONTH_NAMES[hoverIndex]}
            </div>
            {series.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}:
                </span>
                <span className="font-extrabold text-white">
                  {s.data[hoverIndex].toLocaleString('id-ID')} {yAxisUnit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
