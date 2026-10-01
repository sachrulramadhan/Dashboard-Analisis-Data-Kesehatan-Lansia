import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { HealthRecord, FilterState, AggregatedMetrics, DiseaseStat, PuskesmasStat, KelurahanStat, UserRole } from '../types';
import { generateSeedHealthData, MONTH_NAMES } from '../data/mockHealthData';
import { USER_UPLOADED_HEALTH_DATA } from '../data/userRealDataset';
import { 
  filterRecords, 
  getPreviousPeriodRecords, 
  aggregateMetrics, 
  getDiseaseRanking, 
  getPuskesmasStats, 
  getKelurahanStats,
  normalizePuskesmasName 
} from '../utils/calculationEngine';

function cleanAndNormalizeDataset(records: HealthRecord[]): HealthRecord[] {
  const seen = new Set<string>();
  const list: HealthRecord[] = [];
  records.forEach((r) => {
    const normPuskesmas = normalizePuskesmasName(r.puskesmas);
    const key = `${r.tahun}-${r.bulan}-${normPuskesmas}-${(r.kelurahan || '').toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      list.push({
        ...r,
        puskesmas: normPuskesmas,
      });
    }
  });
  return list;
}

export type DataSourceType = 'demo' | 'user' | 'empty';

interface DashboardContextType {
  dataset: HealthRecord[];
  dataSourceType: DataSourceType;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedPuskesmasDetail: string | null;
  setSelectedPuskesmasDetail: (puskesmas: string | null) => void;
  filteredRecords: HealthRecord[];
  previousRecords: HealthRecord[];
  metrics: AggregatedMetrics;
  diseaseRanking: DiseaseStat[];
  puskesmasStats: PuskesmasStat[];
  kelurahanStats: KelurahanStat[];
  allPuskesmasList: string[];
  kelurahanOptions: string[];
  periodLabel: string;
  addRecords: (newRecords: HealthRecord[]) => Promise<void>;
  replaceDataset: (newRecords: HealthRecord[]) => Promise<void>;
  applyImportedRecords: (newRecords: HealthRecord[], mode: 'replace' | 'append', targetMonth: number, targetYear: number) => Promise<void>;
  clearDataset: () => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  isAdmin: boolean;
  requireAdmin: () => boolean;
  adminLoginOpen: boolean;
  setAdminLoginOpen: (val: boolean) => void;
  loginAdmin: (password: string) => Promise<string | null>;
  logoutAdmin: () => void;
  isServerLoading: boolean;
  loadDemoData: () => void;
  loadRealUploadedData: () => void;
  isAiAnalyzing: boolean;
  setIsAiAnalyzing: (val: boolean) => void;
}

const defaultFilters: FilterState = {
  year: 2026,
  month: 2, // Februari 2026
  puskesmas: 'ALL',
  kelurahan: 'ALL',
  gender: 'ALL',
  ageGroup: 'ALL',
  mode: 'monthly',
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data awal = data bawaan. Data terbaru dari server (Cloudflare KV) dimuat setelah halaman terbuka.
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>('user');
  const [dataset, setDataset] = useState<HealthRecord[]>(() =>
    cleanAndNormalizeDataset(USER_UPLOADED_HEALTH_DATA)
  );
  const [isServerLoading, setIsServerLoading] = useState<boolean>(true);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('lansia_admin_token');
    } catch {
      return null;
    }
  });
  const [adminLoginOpen, setAdminLoginOpen] = useState<boolean>(false);
  const isAdmin = !!adminToken;

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeMenu, setActiveMenu] = useState<string>('overview');
  const [userRole, setUserRole] = useState<UserRole>('pengelola');
  const [selectedPuskesmasDetail, setSelectedPuskesmasDetail] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  // Muat data terbaru dari server saat halaman dibuka
  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) setIsServerLoading(false);
    }, 8000);

    fetch('/api/dataset', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.records)) return;
        const records = cleanAndNormalizeDataset(data.records as HealthRecord[]);
        setDataset(records);
        setDataSourceType(records.length > 0 ? 'user' : 'empty');
        if (records.length > 0) {
          // Tampilkan periode terbaru yang ada di data
          const latest = records.reduce(
            (acc, r) =>
              r.tahun > acc.tahun || (r.tahun === acc.tahun && r.bulan > acc.bulan)
                ? { tahun: r.tahun, bulan: r.bulan }
                : acc,
            { tahun: records[0].tahun, bulan: records[0].bulan }
          );
          setFilters((prev) => ({ ...prev, year: latest.tahun, month: latest.bulan }));
        }
      })
      .catch(() => {
        // Server tidak tersedia (mis. saat pengembangan lokal): pakai data bawaan
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setIsServerLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const loginAdmin = async (password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        return data.error || 'Login gagal. Coba lagi.';
      }
      try {
        sessionStorage.setItem('lansia_admin_token', data.token);
      } catch {}
      setAdminToken(data.token);
      setAdminLoginOpen(false);
      return null;
    } catch {
      return 'Tidak dapat menghubungi server. Periksa koneksi internet Anda.';
    }
  };

  const logoutAdmin = () => {
    try {
      sessionStorage.removeItem('lansia_admin_token');
    } catch {}
    setAdminToken(null);
  };

  // Kembalikan true jika sudah login admin; jika belum, tampilkan form login
  const requireAdmin = (): boolean => {
    if (adminToken) return true;
    setAdminLoginOpen(true);
    return false;
  };

  const saveToServer = async (records: HealthRecord[]) => {
    const res = await fetch('/api/dataset', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ records }),
    });
    if (res.status === 401) {
      logoutAdmin();
      setAdminLoginOpen(true);
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Gagal menyimpan data ke server.');
    }
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'puskesmas' && value !== prev.puskesmas) {
        next.kelurahan = 'ALL';
      }
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setSelectedPuskesmasDetail(null);
  };

  const allPuskesmasList = useMemo(() => {
    return Array.from(new Set(dataset.map((r) => r.puskesmas))).sort();
  }, [dataset]);

  const kelurahanOptions = useMemo(() => {
    if (filters.puskesmas === 'ALL') {
      return Array.from(new Set(dataset.map((r) => r.kelurahan))).sort();
    }
    return Array.from(
      new Set(dataset.filter((r) => r.puskesmas === filters.puskesmas).map((r) => r.kelurahan))
    ).sort();
  }, [dataset, filters.puskesmas]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return filterRecords(dataset, filters);
  }, [dataset, filters]);

  // Previous period dataset
  const previousRecords = useMemo(() => {
    return getPreviousPeriodRecords(dataset, filters);
  }, [dataset, filters]);

  // Aggregated metrics
  const metrics = useMemo(() => {
    return aggregateMetrics(filteredRecords, previousRecords, filters);
  }, [filteredRecords, previousRecords, filters]);

  // Disease rankings
  const diseaseRanking = useMemo(() => {
    return getDiseaseRanking(filteredRecords, previousRecords);
  }, [filteredRecords, previousRecords]);

  // Puskesmas & Kelurahan stats
  const puskesmasStats = useMemo(() => {
    return getPuskesmasStats(filteredRecords, filters);
  }, [filteredRecords, filters]);

  const kelurahanStats = useMemo(() => {
    return getKelurahanStats(filteredRecords, filters);
  }, [filteredRecords, filters]);

  const periodLabel = useMemo(() => {
    if (filters.mode === 'monthly') {
      return `${MONTH_NAMES[filters.month - 1]} ${filters.year}`;
    }
    return `Akumulasi Januari–Desember ${filters.year}`;
  }, [filters.mode, filters.month, filters.year]);

  const addRecords = async (newRecords: HealthRecord[]) => {
    if (!requireAdmin()) throw new Error('Hanya admin yang dapat mengimpor data.');
    const next = cleanAndNormalizeDataset([...newRecords, ...dataset]);
    await saveToServer(next);
    setDataset(next);
    setDataSourceType('user');
  };

  const replaceDataset = async (newRecords: HealthRecord[]) => {
    if (!requireAdmin()) throw new Error('Hanya admin yang dapat mengimpor data.');
    const cleaned = cleanAndNormalizeDataset(newRecords);
    await saveToServer(cleaned);
    setDataset(cleaned);
    setDataSourceType(cleaned.length > 0 ? 'user' : 'empty');
  };

  /**
   * Impor data (khusus admin):
   * 1. Menyimpan data ke server (Cloudflare KV) agar tampil di semua pengguna
   * 2. Menyelaraskan filter dashboard ke periode data baru
   */
  const applyImportedRecords = async (
    newRecords: HealthRecord[],
    mode: 'replace' | 'append',
    targetMonth: number,
    targetYear: number
  ) => {
    if (!requireAdmin()) throw new Error('Hanya admin yang dapat mengimpor data.');
    const finalDataset =
      mode === 'replace'
        ? cleanAndNormalizeDataset(newRecords)
        : cleanAndNormalizeDataset([...newRecords, ...dataset]);

    await saveToServer(finalDataset);

    setDataset(finalDataset);
    setDataSourceType('user');
    setFilters({
      year: targetYear,
      month: targetMonth,
      mode: 'monthly',
      puskesmas: 'ALL',
      kelurahan: 'ALL',
      gender: 'ALL',
      ageGroup: 'ALL',
    });
  };

  const clearDataset = async () => {
    if (!requireAdmin()) return;
    try {
      await saveToServer([]);
      setDataset([]);
      setDataSourceType('empty');
    } catch (err: any) {
      alert(err?.message || 'Gagal mengosongkan data.');
    }
  };

  const resetToDefaultData = async () => {
    if (!requireAdmin()) return;
    try {
      const res = await fetch('/api/dataset', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal mengembalikan data bawaan.');
      }
      setDataset(cleanAndNormalizeDataset(USER_UPLOADED_HEALTH_DATA));
      setDataSourceType('user');
    } catch (err: any) {
      alert(err?.message || 'Gagal mengembalikan data bawaan.');
    }
  };

  const loadRealUploadedData = () => {
    const pristine = cleanAndNormalizeDataset(USER_UPLOADED_HEALTH_DATA);
    setDataset(pristine);
    setDataSourceType('user');
    setFilters((prev) => ({ ...prev, year: 2026, month: 2, puskesmas: 'ALL', kelurahan: 'ALL' }));
  };

  const loadDemoData = () => {
    const seed = generateSeedHealthData();
    setDataset(seed);
    setDataSourceType('demo');
  };

  return (
    <DashboardContext.Provider
      value={{
        dataset,
        dataSourceType,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        activeMenu,
        setActiveMenu,
        userRole,
        setUserRole,
        selectedPuskesmasDetail,
        setSelectedPuskesmasDetail,
        filteredRecords,
        previousRecords,
        metrics,
        diseaseRanking,
        puskesmasStats,
        kelurahanStats,
        allPuskesmasList,
        kelurahanOptions,
        periodLabel,
        addRecords,
        replaceDataset,
        applyImportedRecords,
        clearDataset,
        resetToDefaultData,
        loadDemoData,
        loadRealUploadedData,
        isAdmin,
        requireAdmin,
        adminLoginOpen,
        setAdminLoginOpen,
        loginAdmin,
        logoutAdmin,
        isServerLoading,
        isAiAnalyzing,
        setIsAiAnalyzing,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
