import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  UserCheck, 
  CalendarRange, 
  Scale, 
  HeartHandshake, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Pill, 
  Send, 
  Building, 
  MapPin, 
  Map, 
  HeartPulse, 
  Home, 
  Clock, 
  Heart, 
  Stethoscope, 
  Target, 
  BellRing, 
  GitCompare, 
  LineChart, 
  Sparkles, 
  BrainCircuit, 
  Lightbulb, 
  FileText, 
  CalendarDays, 
  Calendar, 
  Award, 
  Database, 
  Upload, 
  CheckCircle2, 
  Download,
  Cloud
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { activeMenu, setActiveMenu } = useDashboard();

  const menuSections: MenuSection[] = [
    {
      title: 'DASHBOARD',
      items: [
        { id: 'overview', label: 'Overview Utama', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'tren-tahunan', label: 'Tren Capaian Tahunan', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      title: 'LANSIA',
      items: [
        { id: 'sasaran-kunjungan', label: 'Sasaran & Kunjungan', icon: <Users className="w-4 h-4" /> },
        { id: 'skrining', label: 'Skrining Lansia (60+)', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'kelompok-umur', label: 'Distribusi Kelompok Umur', icon: <CalendarRange className="w-4 h-4" /> },
        { id: 'jenis-kelamin', label: 'Proporsi Jenis Kelamin', icon: <Scale className="w-4 h-4" /> },
        { id: 'kemandirian', label: 'Tingkat Kemandirian', icon: <HeartHandshake className="w-4 h-4" /> },
      ],
    },
    {
      title: 'KESEHATAN',
      items: [
        { id: 'profil-penyakit', label: 'Profil Seluruh Morbiditas', icon: <Activity className="w-4 h-4" /> },
        { id: 'kelainan-lansia', label: 'Kelainan Fungsional Geriatri', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
        { id: 'faktor-risiko', label: 'Faktor Risiko PTM & Metabolik', icon: <ShieldAlert className="w-4 h-4 text-rose-500" /> },
        { id: 'pengobatan', label: 'Pengobatan Lansia', icon: <Pill className="w-4 h-4 text-emerald-500" /> },
        { id: 'rujukan', label: 'Rujukan ke RS (FKRTL)', icon: <Send className="w-4 h-4 text-indigo-500" /> },
      ],
    },
    {
      title: 'WILAYAH',
      items: [
        { id: 'analisis-puskesmas', label: 'Kinerja 12 Puskesmas', icon: <Building className="w-4 h-4" /> },
        { id: 'analisis-kelurahan', label: 'Sebaran 46 Kelurahan', icon: <MapPin className="w-4 h-4" /> },
        { id: 'peta-gis', label: 'Peta Spasial GIS', icon: <Map className="w-4 h-4" /> },
      ],
    },
    {
      title: 'LAYANAN',
      items: [
        { id: 'posbindu-posyandu', label: 'Posyandu / Posbindu', icon: <HeartPulse className="w-4 h-4" /> },
        { id: 'kunjungan-rumah', label: 'Kunjungan Rumah (Home Care)', icon: <Home className="w-4 h-4" /> },
        { id: 'long-term-care', label: 'Long Term Care (LTC)', icon: <Clock className="w-4 h-4" /> },
        { id: 'panti-wreda', label: 'Pembinaan Panti Wreda', icon: <Heart className="w-4 h-4" /> },
        { id: 'tenaga-kesehatan', label: 'Tenaga Kesehatan Pembina', icon: <Stethoscope className="w-4 h-4" /> },
      ],
    },
    {
      title: 'MONITORING',
      items: [
        { id: 'alert-masalah', label: 'Deteksi Alert & Masalah Kinerja', icon: <BellRing className="w-4 h-4 text-amber-500" /> },
        { id: 'perbandingan-puskesmas', label: 'Komparasi Kinerja Puskesmas', icon: <GitCompare className="w-4 h-4 text-indigo-500" /> },
      ],
    },
    {
      title: 'AI ANALYST',
      items: [
        { id: 'ai-analyst', label: 'AI Health Analyst & Insight', icon: <Sparkles className="w-4 h-4 text-indigo-500" /> },
      ],
    },
    {
      title: 'LAPORAN',
      items: [
        { id: 'laporan-bulanan', label: 'Laporan Bulanan', icon: <FileText className="w-4 h-4" /> },
        { id: 'laporan-triwulan', label: 'Laporan Triwulan', icon: <CalendarDays className="w-4 h-4" /> },
        { id: 'laporan-semester', label: 'Laporan Semester', icon: <Calendar className="w-4 h-4" /> },
        { id: 'laporan-tahunan', label: 'Laporan Tahunan', icon: <Award className="w-4 h-4" /> },
      ],
    },
    {
      title: 'DATA',
      items: [
        { id: 'data-explorer', label: 'Tabel Eksplorasi Data', icon: <Database className="w-4 h-4" /> },
        { id: 'import-data', label: 'Import File Excel / CSV', icon: <Upload className="w-4 h-4 text-blue-500" /> },
        { id: 'validasi-data', label: 'Audit & Validasi Kualitas Data', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
        { id: 'export-data', label: 'Export Data & Laporan', icon: <Download className="w-4 h-4 text-indigo-500" /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-200 ease-in-out
          fixed inset-y-0 left-0 z-50 w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:inset-auto lg:top-auto lg:bottom-auto lg:h-full lg:w-64 lg:translate-x-0 lg:z-20
        `}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveMenu(item.id);
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* System info / Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Dinkes Kota Palu</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">v2.6</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Program Kes. Lanjut Usia</p>
        </div>
      </aside>
    </>
  );
};
