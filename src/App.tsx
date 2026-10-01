/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNavBar } from './components/BottomNavBar';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { AdminLoginModal } from './components/AdminLoginModal';

// Views
import { OverviewView } from './views/OverviewView';
import { TrenTahunanView } from './views/TrenTahunanView';
import { SasaranKunjunganView } from './views/SasaranKunjunganView';
import { SkriningView } from './views/SkriningView';
import { KelompokUmurView } from './views/KelompokUmurView';
import { JenisKelaminView } from './views/JenisKelaminView';
import { KemandirianView } from './views/KemandirianView';
import { ProfilPenyakitView } from './views/ProfilPenyakitView';
import { PengobatanRujukanView } from './views/PengobatanRujukanView';
import { AnalisisPuskesmasView } from './views/AnalisisPuskesmasView';
import { AnalisisKelurahanView } from './views/AnalisisKelurahanView';
import { PetaGisView } from './views/PetaGisView';
import { LayananLansiaView } from './views/LayananLansiaView';
import { MonitoringAlertView } from './views/MonitoringAlertView';
import { AiAnalystView } from './views/AiAnalystView';
import { LaporanView } from './views/LaporanView';
import { DataExplorerView } from './views/DataExplorerView';

const MainContent: React.FC = () => {
  const { activeMenu, isServerLoading } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top with each menu switch
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeMenu]);

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'overview':
      case 'capaian-indikator':
        return <OverviewView />;

      case 'tren-tahunan':
      case 'perubahan-tren':
        return <TrenTahunanView />;

      case 'sasaran-kunjungan':
        return <SasaranKunjunganView />;

      case 'skrining':
        return <SkriningView />;

      case 'kelompok-umur':
        return <KelompokUmurView />;

      case 'jenis-kelamin':
        return <JenisKelaminView />;

      case 'kemandirian':
        return <KemandirianView />;

      case 'profil-penyakit':
      case 'kelainan-lansia':
      case 'faktor-risiko':
        return <ProfilPenyakitView />;

      case 'pengobatan':
      case 'rujukan':
        return <PengobatanRujukanView />;

      case 'analisis-puskesmas':
        return <AnalisisPuskesmasView />;

      case 'analisis-kelurahan':
        return <AnalisisKelurahanView />;

      case 'peta-gis':
        return <PetaGisView />;

      case 'posbindu-posyandu':
      case 'kunjungan-rumah':
      case 'long-term-care':
      case 'panti-wreda':
      case 'tenaga-kesehatan':
        return <LayananLansiaView />;

      case 'alert-masalah':
      case 'perbandingan-puskesmas':
        return <MonitoringAlertView />;

      case 'ai-analyst':
      case 'ai-otomatis':
      case 'ai-rekomendasi':
        return <AiAnalystView />;

      case 'laporan-bulanan':
      case 'laporan-triwulan':
      case 'laporan-semester':
      case 'laporan-tahunan':
        return <LaporanView />;

      case 'data-explorer':
      case 'import-data':
      case 'validasi-data':
      case 'export-data':
        return <DataExplorerView />;

      default:
        return <OverviewView />;
    }
  };

  if (isServerLoading) {
    return (
      <div className="h-screen h-[100dvh] w-full bg-slate-50 flex items-center justify-center text-sm text-slate-600">
        Memuat data terbaru…
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] w-full bg-slate-50 flex flex-col text-slate-800 overflow-hidden">
      <AdminLoginModal />
      <PwaInstallPrompt />
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main 
          ref={mainRef} 
          className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-28 sm:pb-24 lg:pb-12 scrollbar-thin touch-pan-y"
        >
          <div key={activeMenu} className="max-w-7xl mx-auto animate-fade-in">
            {renderActiveView()}
          </div>
        </main>
      </div>
      <BottomNavBar setSidebarOpen={setSidebarOpen} />
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <MainContent />
    </DashboardProvider>
  );
}

