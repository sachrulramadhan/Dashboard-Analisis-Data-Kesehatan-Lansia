import React from 'react';
import { ArrowDown, CheckCircle, AlertCircle, Send, HeartPulse, UserCheck, Users } from 'lucide-react';

interface FunnelStep {
  label: string;
  count: number;
  rateLabel: string;
  rateValue: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface FunnelChartProps {
  sasaran: number;
  kunjungan: number;
  skrining: number;
  kelainan: number;
  diobati: number;
  dirujuk: number;
  periodLabel: string;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  sasaran,
  kunjungan,
  skrining,
  kelainan,
  diobati,
  dirujuk,
  periodLabel,
}) => {
  const kunjunganRate = sasaran > 0 ? (kunjungan / sasaran) * 100 : 0;
  const skriningRate = sasaran > 0 ? (skrining / sasaran) * 100 : 0;
  const kelainanRate = skrining > 0 ? (kelainan / skrining) * 100 : 0;
  const pengobatanRate = kelainan > 0 ? (diobati / kelainan) * 100 : 0;
  const rujukanRate = kelainan > 0 ? (dirujuk / kelainan) * 100 : 0;

  const steps: FunnelStep[] = [
    {
      label: '1. Sasaran Lansia (60+ Thn)',
      count: sasaran,
      rateLabel: 'Target Pokok SPM',
      rateValue: 100,
      color: 'from-blue-600 to-blue-500',
      icon: <Users className="w-4 h-4 text-white" />,
      description: 'Populasi lansia usia ≥60 tahun sasaran program kesehatan',
    },
    {
      label: '2. Kunjungan Lansia',
      count: kunjungan,
      rateLabel: 'Rasio thd Sasaran',
      rateValue: kunjunganRate,
      color: 'from-sky-600 to-sky-500',
      icon: <HeartPulse className="w-4 h-4 text-white" />,
      description: 'Lansia hadir di Posyandu/Posbindu/Puskesmas',
    },
    {
      label: '3. Skrining Lansia (>60 Thn)',
      count: skrining,
      rateLabel: 'Cakupan Skrining SPM',
      rateValue: skriningRate,
      color: 'from-teal-600 to-teal-500',
      icon: <UserCheck className="w-4 h-4 text-white" />,
      description: 'Mendapat skrining kesehatan standar minimal',
    },
    {
      label: '4. Ditemukan Kelainan / Risiko',
      count: kelainan,
      rateLabel: '% Kelainan dr Skrining',
      rateValue: kelainanRate,
      color: 'from-amber-600 to-amber-500',
      icon: <AlertCircle className="w-4 h-4 text-white" />,
      description: 'Memiliki minimal 1 faktor risiko atau penyakit',
    },
    {
      label: '5. Mendapat Pengobatan',
      count: diobati,
      rateLabel: '% Diobati dr Kelainan',
      rateValue: pengobatanRate,
      color: 'from-emerald-600 to-emerald-500',
      icon: <CheckCircle className="w-4 h-4 text-white" />,
      description: 'Diberikan terapi/tatalaksana di Puskesmas',
    },
    {
      label: '6. Dirujuk ke FKRTL / RS',
      count: dirujuk,
      rateLabel: '% Dirujuk dr Kelainan',
      rateValue: rujukanRate,
      color: 'from-rose-600 to-rose-500',
      icon: <Send className="w-4 h-4 text-white" />,
      description: 'Dirujuk karena memerlukan tatalaksana lanjutan',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Funnel Analisis Pelayanan Kesehatan Lansia
          </h3>
          <p className="text-xs text-slate-500">
            Alur: Sasaran → Kunjungan → Skrining → Kelainan → Diobati → Dirujuk ({periodLabel})
          </p>
        </div>
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          Conversion Pipeline
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          // Calculate proportional width relative to sasaran (capped at min 28% for legibility)
          const baseWidthPercent = sasaran > 0 ? Math.max(25, Math.min(100, (step.count / sasaran) * 100)) : 100;

          return (
            <div key={step.label} className="relative">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{step.label}</span>
                  <span className="text-slate-400 hidden sm:inline">• {step.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {step.count.toLocaleString('id-ID')}
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-100 min-w-[70px] text-right">
                    {step.rateValue.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden p-0.5 border border-slate-200/60 flex items-center">
                <div
                  style={{ width: `${baseWidthPercent}%` }}
                  className={`h-full rounded-md bg-linear-to-r ${step.color} transition-all duration-500 flex items-center px-3 shadow-2xs`}
                >
                  <div className="flex items-center gap-1.5 text-white text-[11px] font-semibold">
                    {step.icon}
                    <span>{step.rateLabel}: {step.rateValue.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Arrow connector between steps */}
              {idx < steps.length - 1 && (
                <div className="flex justify-center my-0.5 text-slate-300">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Cakupan Skrining</span>
          <span className="text-base font-extrabold text-blue-700">{skriningRate.toFixed(1)}%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Rate Kelainan</span>
          <span className="text-base font-extrabold text-amber-700">{kelainanRate.toFixed(1)}%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Capaian Diobati</span>
          <span className="text-base font-extrabold text-emerald-700">{pengobatanRate.toFixed(1)}%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Rasio Rujukan</span>
          <span className="text-base font-extrabold text-rose-700">{rujukanRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
