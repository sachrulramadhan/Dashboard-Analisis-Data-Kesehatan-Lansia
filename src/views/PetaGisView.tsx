import React from 'react';
import { Map, Info } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';
import { PaluGisMap } from '../components/charts/PaluGisMap';

export const PetaGisView: React.FC = () => {
  const { puskesmasStats, filteredRecords, periodLabel } = useDashboard();

  return (
    <div className="space-y-6">
      <PeriodBanner />

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Map className="w-5 h-5 text-blue-600" />
              Sistem Informasi Geografis (GIS) Kesehatan Lansia Kota Palu
            </h2>
            <p className="text-xs text-slate-500">
              Visualisasi sebaran spasial, klaster penyakit, dan disparitas pelayanan primer antar wilayah • {periodLabel}
            </p>
          </div>
        </div>

        <PaluGisMap
          puskesmasStats={puskesmasStats}
          rawRecords={filteredRecords}
          periodLabel={periodLabel}
        />
      </div>
    </div>
  );
};
