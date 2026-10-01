import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  HeartPulse, 
  Sparkles, 
  Menu
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface BottomNavBarProps {
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ setSidebarOpen }) => {
  const { activeMenu, setActiveMenu } = useDashboard();

  const isOverview = activeMenu === 'overview' || activeMenu === 'capaian-indikator';
  const isWilayah = activeMenu === 'peta-gis' || activeMenu === 'analisis-puskesmas' || activeMenu === 'analisis-kelurahan';
  const isKesehatan = activeMenu === 'profil-penyakit' || activeMenu === 'skrining' || activeMenu === 'kemandirian' || activeMenu === 'pengobatan';
  const isAi = activeMenu === 'ai-analyst' || activeMenu === 'ai-otomatis' || activeMenu === 'ai-rekomendasi';

  return (
    <nav 
      aria-label="Navigasi Bawah Seluler"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1"
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-12">
        {/* 1. Overview */}
        <button
          type="button"
          onClick={() => setActiveMenu('overview')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isOverview ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${isOverview ? 'bg-blue-50 scale-110' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Overview</span>
        </button>

        {/* 2. Wilayah / GIS */}
        <button
          type="button"
          onClick={() => setActiveMenu('peta-gis')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isWilayah ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${isWilayah ? 'bg-blue-50 scale-110' : ''}`}>
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Peta & PKM</span>
        </button>

        {/* 3. Kesehatan */}
        <button
          type="button"
          onClick={() => setActiveMenu('profil-penyakit')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isKesehatan ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${isKesehatan ? 'bg-blue-50 scale-110' : ''}`}>
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Kesehatan</span>
        </button>

        {/* 4. AI Analyst */}
        <button
          type="button"
          onClick={() => setActiveMenu('ai-analyst')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isAi ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${isAi ? 'bg-indigo-50 scale-110' : ''}`}>
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">AI Analyst</span>
        </button>

        {/* 5. Menu Lengkap & Data */}
        <button
          type="button"
          onClick={() => setSidebarOpen(prev => !prev)}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <div className="p-1 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
};
