import { HealthRecord, FilterState, AggregatedMetrics, DiseaseStat, PuskesmasStat, KelurahanStat } from '../types';

export function normalizePuskesmasName(name: string): string {
  if (!name) return 'Puskesmas Lainnya';
  const clean = name.trim();
  if (/^puskesmas\s+/i.test(clean)) {
    return 'Puskesmas ' + clean.replace(/^puskesmas\s+/i, '').trim();
  }
  return 'Puskesmas ' + clean;
}

export function filterRecords(records: HealthRecord[], filters: FilterState): HealthRecord[] {
  const filterPuskesmasNorm = filters.puskesmas !== 'ALL' ? normalizePuskesmasName(filters.puskesmas) : 'ALL';
  return records.filter((r) => {
    if (r.tahun !== filters.year) return false;
    if (filters.mode === 'monthly' && r.bulan !== filters.month) return false;
    if (filterPuskesmasNorm !== 'ALL' && normalizePuskesmasName(r.puskesmas) !== filterPuskesmasNorm) return false;
    if (filters.kelurahan !== 'ALL' && r.kelurahan.toLowerCase() !== filters.kelurahan.toLowerCase()) return false;
    return true;
  });
}

export function getPreviousPeriodRecords(records: HealthRecord[], filters: FilterState): HealthRecord[] {
  const filterPuskesmasNorm = filters.puskesmas !== 'ALL' ? normalizePuskesmasName(filters.puskesmas) : 'ALL';
  if (filters.mode === 'monthly') {
    let prevMonth = filters.month - 1;
    let prevYear = filters.year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = filters.year - 1;
    }
    return records.filter((r) => {
      if (r.tahun !== prevYear || r.bulan !== prevMonth) return false;
      if (filterPuskesmasNorm !== 'ALL' && normalizePuskesmasName(r.puskesmas) !== filterPuskesmasNorm) return false;
      if (filters.kelurahan !== 'ALL' && r.kelurahan.toLowerCase() !== filters.kelurahan.toLowerCase()) return false;
      return true;
    });
  } else {
    // Mode Akumulasi: bandingkan dengan tahun sebelumnya pada periode yang sama
    const prevYear = filters.year - 1;
    return records.filter((r) => {
      if (r.tahun !== prevYear) return false;
      if (filterPuskesmasNorm !== 'ALL' && normalizePuskesmasName(r.puskesmas) !== filterPuskesmasNorm) return false;
      if (filters.kelurahan !== 'ALL' && r.kelurahan.toLowerCase() !== filters.kelurahan.toLowerCase()) return false;
      return true;
    });
  }
}

export function calculateDelta(current: number, previous: number | null | undefined): number | null {
  if (previous === null || previous === undefined || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export function aggregateMetrics(currentRecords: HealthRecord[], previousRecords: HealthRecord[], filters: FilterState): AggregatedMetrics {
  // If no data
  if (currentRecords.length === 0) {
    return {
      totalSasaran: 0,
      totalSasaran60Plus: 0,
      totalSasaranSemuaUmur: 0,
      totalSasaranPraLansia: 0,
      totalSasaranLansiaMuda: 0,
      totalSasaranLansiaRisti: 0,
      totalKunjungan: 0,
      totalSkrining: 0,
      persentaseSkrining: 0,
      formulaSkrining: '(Jumlah Skrining / Sasaran Lansia 60 Ke Atas) × 100%',
      rasioKunjunganSasaran: 0,
      lansiaDenganKelainan: 0,
      persentaseKelainan: 0,
      totalKasusPenyakit: 0,
      diobati: 0,
      persentasePengobatan: 0,
      tidakDiobati: 0,
      persentaseTidakDiobati: 0,
      dirujuk: 0,
      persentaseRujukan: 0,
      kunjunganRumah: 0,
      posbinduAktif: 0,
      kelompokLansia: 0,
      pantiWreda: 0,
      ltcLansia: 0,
      totalTenaga: 0,
      jumlahPuskesmas: 0,
      jumlahKelurahan: 0,
      aggregationNotes: {
        totalSasaran: 'Sasaran Lansia 60+ Tahun (Fokus Pokok Program & Standar SPM)',
        totalSasaranSemuaUmur: 'Total stok sasaran termasuk Pra-lansia 45-59 tahun',
        kunjungan: 'SUM data bulanan',
        skrining: 'SUM data bulanan',
        cakupan: 'Rumus: (Total Skrining / Sasaran Lansia 60 Ke Atas) × 100%',
        tenaga: 'LAST VALUE dari bulan terakhir pada periode',
      },
    };
  }

  // Determine unique puskesmas and kelurahan
  const uniquePuskesmas = new Set(currentRecords.map((r) => r.puskesmas));
  const uniqueKelurahan = new Set(currentRecords.map((r) => `${r.puskesmas}__${r.kelurahan}`));

  // 1. Sasaran Lansia (Fokus Utama: Lansia Usia 60 Tahun ke Atas):
  // Sasaran adalah data stok target per wilayah kelurahan (MAX unik).
  const kelurahanSasaran60PlusMap = new Map<string, number>();
  const kelurahanSasaranAllMap = new Map<string, number>();
  const kelurahanSasaranPraLansiaMap = new Map<string, number>();
  const kelurahanSasaran60_69Map = new Map<string, number>();
  const kelurahanSasaran70PlusMap = new Map<string, number>();

  currentRecords.forEach((r) => {
    const key = `${r.puskesmas}__${r.kelurahan}`;

    // Sasaran 60 ke atas (60-69 tahun + 70+ tahun)
    let s60Plus = (r.sasaranUmur60_69 || 0) + (r.sasaranUmur70Plus || 0);
    // Jika rincian umur kosong, fallback ke sasaranLansia
    if (s60Plus === 0 && r.sasaranLansia > 0) {
      s60Plus = r.sasaranLansia;
    }

    let sAll = r.sasaranLansia || s60Plus;
    let sPra = r.sasaranUmur45_59 || 0;
    let sMuda = r.sasaranUmur60_69 || 0;
    let sRisti = r.sasaranUmur70Plus || 0;

    // Filter gender adjustment jika dipilih spesifik
    if (filters.gender === 'Laki-laki' && r.sasaranLansia > 0) {
      const ratioL = r.sasaranLaki / r.sasaranLansia;
      s60Plus = Math.round(s60Plus * ratioL);
      sAll = r.sasaranLaki;
      sPra = Math.round(sPra * ratioL);
      sMuda = Math.round(sMuda * ratioL);
      sRisti = Math.round(sRisti * ratioL);
    } else if (filters.gender === 'Perempuan' && r.sasaranLansia > 0) {
      const ratioP = r.sasaranPerempuan / r.sasaranLansia;
      s60Plus = Math.round(s60Plus * ratioP);
      sAll = r.sasaranPerempuan;
      sPra = Math.round(sPra * ratioP);
      sMuda = Math.round(sMuda * ratioP);
      sRisti = Math.round(sRisti * ratioP);
    }

    if (s60Plus > (kelurahanSasaran60PlusMap.get(key) || 0)) {
      kelurahanSasaran60PlusMap.set(key, s60Plus);
    }
    if (sAll > (kelurahanSasaranAllMap.get(key) || 0)) {
      kelurahanSasaranAllMap.set(key, sAll);
    }
    if (sPra > (kelurahanSasaranPraLansiaMap.get(key) || 0)) {
      kelurahanSasaranPraLansiaMap.set(key, sPra);
    }
    if (sMuda > (kelurahanSasaran60_69Map.get(key) || 0)) {
      kelurahanSasaran60_69Map.set(key, sMuda);
    }
    if (sRisti > (kelurahanSasaran70PlusMap.get(key) || 0)) {
      kelurahanSasaran70PlusMap.set(key, sRisti);
    }
  });

  let totalSasaran60Plus = 0;
  kelurahanSasaran60PlusMap.forEach((v) => (totalSasaran60Plus += v));

  let totalSasaranSemuaUmur = 0;
  kelurahanSasaranAllMap.forEach((v) => (totalSasaranSemuaUmur += v));

  let totalSasaranPraLansia = 0;
  kelurahanSasaranPraLansiaMap.forEach((v) => (totalSasaranPraLansia += v));

  let totalSasaranLansiaMuda = 0;
  kelurahanSasaran60_69Map.forEach((v) => (totalSasaranLansiaMuda += v));

  let totalSasaranLansiaRisti = 0;
  kelurahanSasaran70PlusMap.forEach((v) => (totalSasaranLansiaRisti += v));

  // Tentukan Sasaran Utama berdasarkan Filter Umur:
  // Fokus Utama Laporan: Lansia 60 Tahun ke Atas (60-69 + 70+)
  let totalSasaran = totalSasaran60Plus;
  if (filters.ageGroup === '45-59') {
    totalSasaran = totalSasaranPraLansia;
  } else if (filters.ageGroup === '60-69') {
    totalSasaran = totalSasaranLansiaMuda;
  } else if (filters.ageGroup === '70+') {
    totalSasaran = totalSasaranLansiaRisti;
  }

  // Previous Sasaran
  const prevKelurahanSasaran60PlusMap = new Map<string, number>();
  previousRecords.forEach((r) => {
    const key = `${r.puskesmas}__${r.kelurahan}`;
    let s60Plus = (r.sasaranUmur60_69 || 0) + (r.sasaranUmur70Plus || 0);
    if (s60Plus === 0 && r.sasaranLansia > 0) s60Plus = r.sasaranLansia;

    if (filters.gender === 'Laki-laki' && r.sasaranLansia > 0) {
      s60Plus = Math.round(s60Plus * (r.sasaranLaki / r.sasaranLansia));
    } else if (filters.gender === 'Perempuan' && r.sasaranLansia > 0) {
      s60Plus = Math.round(s60Plus * (r.sasaranPerempuan / r.sasaranLansia));
    }

    if (filters.ageGroup === '45-59') s60Plus = r.sasaranUmur45_59 || 0;
    if (filters.ageGroup === '60-69') s60Plus = r.sasaranUmur60_69 || 0;
    if (filters.ageGroup === '70+') s60Plus = r.sasaranUmur70Plus || 0;

    if (s60Plus > (prevKelurahanSasaran60PlusMap.get(key) || 0)) {
      prevKelurahanSasaran60PlusMap.set(key, s60Plus);
    }
  });

  let prevTotalSasaran = 0;
  prevKelurahanSasaran60PlusMap.forEach((val) => {
    prevTotalSasaran += val;
  });

  // 2. Kumulatif Sums
  let totalKunjungan = 0;
  let totalSkrining = 0;
  let lansiaDenganKelainan = 0;
  let totalKasusPenyakit = 0;
  let diobati = 0;
  let tidakDiobati = 0;
  let dirujuk = 0;
  let kunjunganRumah = 0;
  let ltcLansia = 0;

  currentRecords.forEach((r) => {
    let k = r.kunjunganLansia;
    let s = r.skriningLansia;
    let kel = r.lansiaDenganKelainan;

    if (filters.gender === 'Laki-laki') {
      k = r.kunjunganLaki;
      s = r.skriningLaki;
      kel = r.lansiaKelainanLaki;
    } else if (filters.gender === 'Perempuan') {
      k = r.kunjunganPerempuan;
      s = r.skriningPerempuan;
      kel = r.lansiaKelainanPerempuan;
    }

    if (filters.ageGroup === '45-59') {
      k = r.kunjunganUmur45_59;
      s = r.skriningUmur45_59;
    } else if (filters.ageGroup === '60-69') {
      k = r.kunjunganUmur60_69;
      s = r.skriningUmur60_69;
    } else if (filters.ageGroup === '70+') {
      k = r.kunjunganUmur70Plus;
      s = r.skriningUmur70Plus;
    }

    totalKunjungan += k;
    totalSkrining += s;
    lansiaDenganKelainan += kel;
    totalKasusPenyakit += r.totalPenyakitBulanIni;
    diobati += r.diobati;
    tidakDiobati += r.tidakDiobati;
    dirujuk += r.dirujuk;
    kunjunganRumah += r.jumlahKunjunganRumah;
    ltcLansia += r.longTermCareLansia;
  });

  // Previous Cumulative Sums
  let prevKunjungan = 0;
  let prevSkrining = 0;
  let prevKelainan = 0;
  let prevPenyakit = 0;
  let prevDiobati = 0;
  let prevDirujuk = 0;
  let prevKunjunganRumah = 0;

  previousRecords.forEach((r) => {
    let k = r.kunjunganLansia;
    let s = r.skriningLansia;
    let kel = r.lansiaDenganKelainan;

    if (filters.gender === 'Laki-laki') {
      k = r.kunjunganLaki;
      s = r.skriningLaki;
      kel = r.lansiaKelainanLaki;
    } else if (filters.gender === 'Perempuan') {
      k = r.kunjunganPerempuan;
      s = r.skriningPerempuan;
      kel = r.lansiaKelainanPerempuan;
    }

    if (filters.ageGroup === '45-59') {
      k = r.kunjunganUmur45_59;
      s = r.skriningUmur45_59;
    } else if (filters.ageGroup === '60-69') {
      k = r.kunjunganUmur60_69;
      s = r.skriningUmur60_69;
    } else if (filters.ageGroup === '70+') {
      k = r.kunjunganUmur70Plus;
      s = r.skriningUmur70Plus;
    }

    prevKunjungan += k;
    prevSkrining += s;
    prevKelainan += kel;
    prevPenyakit += r.totalPenyakitBulanIni;
    prevDiobati += r.diobati;
    prevDirujuk += r.dirujuk;
    prevKunjunganRumah += r.jumlahKunjunganRumah;
  });

  // 3. Stok (Tenaga Kesehatan, Posbindu Aktif, Panti Wreda)
  // Ambil data bulan terakhir yang tersedia dalam currentRecords untuk setiap kelurahan/puskesmas unik
  const maxMonthInRecord = Math.max(...currentRecords.map((r) => r.bulan));
  const latestRecords = currentRecords.filter((r) => r.bulan === maxMonthInRecord);

  const kelurahanTenagaMap = new Map<string, number>();
  const kelurahanPosbinduMap = new Map<string, number>();
  const kelurahanKelompokMap = new Map<string, number>();
  const kelurahanPantiMap = new Map<string, number>();

  latestRecords.forEach((r) => {
    const key = `${r.puskesmas}__${r.kelurahan}`;
    kelurahanTenagaMap.set(key, r.totalTenagaKesehatan);
    kelurahanPosbinduMap.set(key, r.posyanduLansiaAktif);
    kelurahanKelompokMap.set(key, r.kelompokLansia);
    kelurahanPantiMap.set(key, r.pantiWredaDibina);
  });

  let totalTenaga = 0;
  kelurahanTenagaMap.forEach((v) => (totalTenaga += v));

  let posbinduAktif = 0;
  kelurahanPosbinduMap.forEach((v) => (posbinduAktif += v));

  let kelompokLansia = 0;
  kelurahanKelompokMap.forEach((v) => (kelompokLansia += v));

  let pantiWreda = 0;
  kelurahanPantiMap.forEach((v) => (pantiWreda += v));

  // 4. Dynamic Percentages (Never sum raw %!)
  // Rumus Capaian Skrining: (Jumlah Skrining / Sasaran Lansia 60 Ke Atas) * 100
  const persentaseSkrining = totalSasaran > 0 ? (totalSkrining / totalSasaran) * 100 : 0;
  const rasioKunjunganSasaran = totalSasaran > 0 ? (totalKunjungan / totalSasaran) * 100 : 0;
  const persentaseKelainan = totalSkrining > 0 ? (lansiaDenganKelainan / totalSkrining) * 100 : 0;
  const persentasePengobatan = lansiaDenganKelainan > 0 ? (diobati / lansiaDenganKelainan) * 100 : 0;
  const persentaseTidakDiobati = lansiaDenganKelainan > 0 ? (tidakDiobati / lansiaDenganKelainan) * 100 : 0;
  const persentaseRujukan = lansiaDenganKelainan > 0 ? (dirujuk / lansiaDenganKelainan) * 100 : 0;

  // 5. Deltas
  const deltaSasaran = previousRecords.length > 0 ? calculateDelta(totalSasaran, prevTotalSasaran) : null;
  const deltaKunjungan = previousRecords.length > 0 ? calculateDelta(totalKunjungan, prevKunjungan) : null;
  const deltaSkrining = previousRecords.length > 0 ? calculateDelta(totalSkrining, prevSkrining) : null;
  const deltaKelainan = previousRecords.length > 0 ? calculateDelta(lansiaDenganKelainan, prevKelainan) : null;
  const deltaPenyakit = previousRecords.length > 0 ? calculateDelta(totalKasusPenyakit, prevPenyakit) : null;
  const deltaDiobati = previousRecords.length > 0 ? calculateDelta(diobati, prevDiobati) : null;
  const deltaDirujuk = previousRecords.length > 0 ? calculateDelta(dirujuk, prevDirujuk) : null;
  const deltaKunjunganRumah = previousRecords.length > 0 ? calculateDelta(kunjunganRumah, prevKunjunganRumah) : null;

  return {
    totalSasaran, // Sasaran Lansia 60+ (Fokus Utama Standar SPM)
    totalSasaran60Plus, // Sasaran Lansia Usia 60 Tahun ke Atas (60-69 + 70+)
    totalSasaranSemuaUmur, // Total Stok Sasaran Seluruh Kelompok Umur (termasuk Pra-lansia 45-59)
    totalSasaranPraLansia,
    totalSasaranLansiaMuda,
    totalSasaranLansiaRisti,

    totalKunjungan,
    totalSkrining,
    persentaseSkrining,
    formulaSkrining: '(Jumlah Skrining / Sasaran Lansia 60 Ke Atas) × 100%',
    rasioKunjunganSasaran,

    lansiaDenganKelainan,
    persentaseKelainan,
    totalKasusPenyakit,

    diobati,
    persentasePengobatan,
    tidakDiobati,
    persentaseTidakDiobati,

    dirujuk,
    persentaseRujukan,

    kunjunganRumah,
    posbinduAktif,
    kelompokLansia,
    pantiWreda,
    ltcLansia,
    totalTenaga,

    jumlahPuskesmas: uniquePuskesmas.size,
    jumlahKelurahan: uniqueKelurahan.size,

    deltaSasaran,
    deltaKunjungan,
    deltaSkrining,
    deltaKelainan,
    deltaPenyakit,
    deltaDiobati,
    deltaDirujuk,
    deltaKunjunganRumah,

    aggregationNotes: {
      totalSasaran: filters.mode === 'cumulative' 
        ? 'Sasaran Lansia 60+ Tahun (MAX per Kelurahan unik, bukan akumulasi bulanan)' 
        : 'Sasaran Lansia 60+ Tahun (Fokus Pokok Program & Standar SPM)',
      totalSasaranSemuaUmur: 'Total estimasi populasi termasuk pra-lansia usia 45-59 tahun',
      totalKunjungan: filters.mode === 'cumulative' 
        ? 'SUM akumulasi kunjungan Jan-Desember' 
        : 'SUM kunjungan bulan berjalan',
      totalSkrining: filters.mode === 'cumulative' 
        ? 'SUM akumulasi skrining Jan-Desember' 
        : 'SUM skrining bulan berjalan',
      persentaseSkrining: 'Rumus: (Total Skrining / Sasaran Lansia 60 Ke Atas) × 100%',
      tenagaKesehatan: 'LAST VALUE dari bulan terakhir (data posisi/stok tenaga)',
      posbinduAktif: 'LAST VALUE / Status aktif fasilitas periode',
    },
  };
}

export function getDiseaseRanking(records: HealthRecord[], prevRecords: HealthRecord[] = []): DiseaseStat[] {
  const currentDiseases = {
    hipertensi: 0,
    diabetesMelitus: 0,
    kolesterolTinggi: 0,
    asamUratTinggi: 0,
    gangguanPenglihatan: 0,
    gangguanPendengaran: 0,
    anemiaHbKurang: 0,
    imtLebihObesitas: 0,
    gangguanKognitif: 0,
    imtKurang: 0,
    gangguanGinjal: 0,
    gangguanMetabolikLain: 0,
  };

  const prevDiseases = { ...currentDiseases };

  let totalCases = 0;
  let totalScreened = 0;

  records.forEach((r) => {
    currentDiseases.hipertensi += r.hipertensi;
    currentDiseases.diabetesMelitus += r.diabetesMelitus;
    currentDiseases.kolesterolTinggi += r.kolesterolTinggi;
    currentDiseases.asamUratTinggi += r.asamUratTinggi;
    currentDiseases.gangguanPenglihatan += r.gangguanPenglihatan;
    currentDiseases.gangguanPendengaran += r.gangguanPendengaran;
    currentDiseases.anemiaHbKurang += r.anemiaHbKurang;
    currentDiseases.imtLebihObesitas += r.imtLebihObesitas;
    currentDiseases.gangguanKognitif += r.gangguanKognitif;
    currentDiseases.imtKurang += r.imtKurang;
    currentDiseases.gangguanGinjal += r.gangguanGinjal;
    currentDiseases.gangguanMetabolikLain += r.gangguanMetabolikLain;

    totalScreened += r.skriningLansia;
  });

  prevRecords.forEach((r) => {
    prevDiseases.hipertensi += r.hipertensi;
    prevDiseases.diabetesMelitus += r.diabetesMelitus;
    prevDiseases.kolesterolTinggi += r.kolesterolTinggi;
    prevDiseases.asamUratTinggi += r.asamUratTinggi;
    prevDiseases.gangguanPenglihatan += r.gangguanPenglihatan;
    prevDiseases.gangguanPendengaran += r.gangguanPendengaran;
    prevDiseases.anemiaHbKurang += r.anemiaHbKurang;
    prevDiseases.imtLebihObesitas += r.imtLebihObesitas;
    prevDiseases.gangguanKognitif += r.gangguanKognitif;
    prevDiseases.imtKurang += r.imtKurang;
    prevDiseases.gangguanGinjal += r.gangguanGinjal;
    prevDiseases.gangguanMetabolikLain += r.gangguanMetabolikLain;
  });

  Object.values(currentDiseases).forEach((v) => (totalCases += v));

  const diseaseNames: Record<keyof typeof currentDiseases, { name: string; category: string }> = {
    hipertensi: { name: 'Hipertensi / Tekanan Darah Tinggi', category: 'Kardiovaskular' },
    diabetesMelitus: { name: 'Diabetes Melitus', category: 'Endokrin / Metabolik' },
    kolesterolTinggi: { name: 'Hiperkolesterolemia / Kolesterol Tinggi', category: 'Metabolik' },
    asamUratTinggi: { name: 'Hiperurisemia / Asam Urat Tinggi', category: 'Metabolik' },
    gangguanPenglihatan: { name: 'Gangguan Penglihatan (Katarak/Refraksi)', category: 'Indera' },
    gangguanPendengaran: { name: 'Gangguan Pendengaran (Presbikusis)', category: 'Indera' },
    anemiaHbKurang: { name: 'Anemia / Hb Kurang', category: 'Hematologi' },
    imtLebihObesitas: { name: 'IMT Lebih / Obesitas', category: 'Status Gizi' },
    gangguanKognitif: { name: 'Gangguan Kognitif / Demensia', category: 'Neurologi' },
    imtKurang: { name: 'IMT Kurang / KEK', category: 'Status Gizi' },
    gangguanGinjal: { name: 'Gangguan Fungsi Ginjal', category: 'Nefrologi' },
    gangguanMetabolikLain: { name: 'Gangguan Metabolik Lainnya', category: 'Metabolik' },
  };

  const list: DiseaseStat[] = (Object.keys(currentDiseases) as Array<keyof typeof currentDiseases>).map((key) => {
    const cases = currentDiseases[key];
    const prev = prevDiseases[key];
    const delta = prevRecords.length > 0 ? calculateDelta(cases, prev) : null;
    return {
      id: key,
      name: diseaseNames[key].name,
      category: diseaseNames[key].category,
      cases,
      prevCases: prevRecords.length > 0 ? prev : null,
      delta,
      percentageOfScreened: totalScreened > 0 ? (cases / totalScreened) * 100 : 0,
      percentageOfCases: totalCases > 0 ? (cases / totalCases) * 100 : 0,
    };
  });

  // Sort descending by cases
  return list.sort((a, b) => b.cases - a.cases);
}

export function getPuskesmasStats(records: HealthRecord[], filters: FilterState): PuskesmasStat[] {
  const puskesmasMap = new Map<string, {
    kelurahanSasaran60Plus: Map<string, number>;
    kelurahanSasaranAll: Map<string, number>;
    kunjungan: number;
    skrining: number;
    kelainan: number;
    penyakit: number;
    diobati: number;
    dirujuk: number;
    kunjunganRumah: number;
    posbindu: number;
    tenaga: number;
    kelurahanList: Set<string>;
  }>();

  records.forEach((r) => {
    const puskesmasName = normalizePuskesmasName(r.puskesmas);
    if (!puskesmasMap.has(puskesmasName)) {
      puskesmasMap.set(puskesmasName, {
        kelurahanSasaran60Plus: new Map(),
        kelurahanSasaranAll: new Map(),
        kunjungan: 0,
        skrining: 0,
        kelainan: 0,
        penyakit: 0,
        diobati: 0,
        dirujuk: 0,
        kunjunganRumah: 0,
        posbindu: 0,
        tenaga: 0,
        kelurahanList: new Set(),
      });
    }

    const item = puskesmasMap.get(puskesmasName)!;
    item.kelurahanList.add(r.kelurahan);

    // Sasaran 60 ke atas (60-69 tahun + 70+ tahun) - Fokus Utama Program
    let s60Plus = (r.sasaranUmur60_69 || 0) + (r.sasaranUmur70Plus || 0);
    if (s60Plus === 0 && r.sasaranLansia > 0) s60Plus = r.sasaranLansia;
    let sAll = r.sasaranLansia || s60Plus;

    if (filters.gender === 'Laki-laki' && r.sasaranLansia > 0) {
      s60Plus = Math.round(s60Plus * (r.sasaranLaki / r.sasaranLansia));
      sAll = r.sasaranLaki;
    } else if (filters.gender === 'Perempuan' && r.sasaranLansia > 0) {
      s60Plus = Math.round(s60Plus * (r.sasaranPerempuan / r.sasaranLansia));
      sAll = r.sasaranPerempuan;
    }

    if (filters.ageGroup === '45-59') {
      s60Plus = r.sasaranUmur45_59 || 0;
    } else if (filters.ageGroup === '60-69') {
      s60Plus = r.sasaranUmur60_69 || 0;
    } else if (filters.ageGroup === '70+') {
      s60Plus = r.sasaranUmur70Plus || 0;
    }

    const curMax60 = item.kelurahanSasaran60Plus.get(r.kelurahan) || 0;
    if (s60Plus > curMax60) item.kelurahanSasaran60Plus.set(r.kelurahan, s60Plus);

    const curMaxAll = item.kelurahanSasaranAll.get(r.kelurahan) || 0;
    if (sAll > curMaxAll) item.kelurahanSasaranAll.set(r.kelurahan, sAll);

    let k = r.kunjunganLansia;
    let s = r.skriningLansia;
    let kel = r.lansiaDenganKelainan;

    if (filters.gender === 'Laki-laki') {
      k = r.kunjunganLaki;
      s = r.skriningLaki;
      kel = r.lansiaKelainanLaki;
    } else if (filters.gender === 'Perempuan') {
      k = r.kunjunganPerempuan;
      s = r.skriningPerempuan;
      kel = r.lansiaKelainanPerempuan;
    }

    if (filters.ageGroup === '45-59') {
      k = r.kunjunganUmur45_59;
      s = r.skriningUmur45_59;
    } else if (filters.ageGroup === '60-69') {
      k = r.kunjunganUmur60_69;
      s = r.skriningUmur60_69;
    } else if (filters.ageGroup === '70+') {
      k = r.kunjunganUmur70Plus;
      s = r.skriningUmur70Plus;
    }

    item.kunjungan += k;
    item.skrining += s;
    item.kelainan += kel;
    item.penyakit += r.totalPenyakitBulanIni;
    item.diobati += r.diobati;
    item.dirujuk += r.dirujuk;
    item.kunjunganRumah += r.jumlahKunjunganRumah;
  });

  // Determine stock of tenaga & posbindu from latest month for each puskesmas
  const maxMonth = Math.max(...records.map((r) => r.bulan));
  const latestRecords = records.filter((r) => r.bulan === maxMonth);
  latestRecords.forEach((r) => {
    const item = puskesmasMap.get(normalizePuskesmasName(r.puskesmas));
    if (item) {
      item.tenaga += r.totalTenagaKesehatan;
      item.posbindu += r.posyanduLansiaAktif;
    }
  });

  const result: PuskesmasStat[] = [];
  puskesmasMap.forEach((val, puskesmasName) => {
    let totalSasaran60Plus = 0;
    val.kelurahanSasaran60Plus.forEach((v) => (totalSasaran60Plus += v));

    let totalSasaranAll = 0;
    val.kelurahanSasaranAll.forEach((v) => (totalSasaranAll += v));

    const targetSasaran = totalSasaran60Plus > 0 ? totalSasaran60Plus : totalSasaranAll;
    // Rumus: (Skrining / Sasaran 60 Ke Atas) * 100
    const persenSkrining = targetSasaran > 0 ? (val.skrining / targetSasaran) * 100 : 0;

    result.push({
      puskesmas: puskesmasName,
      sasaran: targetSasaran, // Sasaran Lansia 60+ (Fokus Utama)
      sasaran60Plus: totalSasaran60Plus,
      sasaranTotalSemuaUmur: totalSasaranAll,
      kunjungan: val.kunjungan,
      skrining: val.skrining,
      persenSkrining,
      kelainan: val.kelainan,
      penyakit: val.penyakit,
      diobati: val.diobati,
      dirujuk: val.dirujuk,
      kunjunganRumah: val.kunjunganRumah,
      posbindu: val.posbindu,
      tenaga: val.tenaga,
      kelurahanList: Array.from(val.kelurahanList),
    });
  });

  return result.sort((a, b) => b.kunjungan - a.kunjungan);
}

export function getKelurahanStats(records: HealthRecord[], filters: FilterState): KelurahanStat[] {
  const kelMap = new Map<string, {
    puskesmas: string;
    kelurahan: string;
    sasaran: number;
    sasaran60Plus: number;
    sasaranTotalSemuaUmur: number;
    kunjungan: number;
    skrining: number;
    kelainan: number;
    penyakit: number;
    diobati: number;
    dirujuk: number;
    kunjunganRumah: number;
  }>();

  records.forEach((r) => {
    const normP = normalizePuskesmasName(r.puskesmas);
    const key = `${normP}__${r.kelurahan}`;
    if (!kelMap.has(key)) {
      kelMap.set(key, {
        puskesmas: normP,
        kelurahan: r.kelurahan,
        sasaran: 0,
        sasaran60Plus: 0,
        sasaranTotalSemuaUmur: 0,
        kunjungan: 0,
        skrining: 0,
        kelainan: 0,
        penyakit: 0,
        diobati: 0,
        dirujuk: 0,
        kunjunganRumah: 0,
      });
    }

    const item = kelMap.get(key)!;

    // Sasaran 60+ (Fokus Utama)
    let s60Plus = (r.sasaranUmur60_69 || 0) + (r.sasaranUmur70Plus || 0);
    if (s60Plus === 0 && r.sasaranLansia > 0) s60Plus = r.sasaranLansia;
    let sAll = r.sasaranLansia || s60Plus;

    if (filters.gender === 'Laki-laki' && r.sasaranLansia > 0) {
      s60Plus = Math.round(s60Plus * (r.sasaranLaki / r.sasaranLansia));
      sAll = r.sasaranLaki;
    } else if (filters.gender === 'Perempuan' && r.sasaranLansia > 0) {
      s60Plus = Math.round(s60Plus * (r.sasaranPerempuan / r.sasaranLansia));
      sAll = r.sasaranPerempuan;
    }

    if (filters.ageGroup === '45-59') {
      s60Plus = r.sasaranUmur45_59 || 0;
    } else if (filters.ageGroup === '60-69') {
      s60Plus = r.sasaranUmur60_69 || 0;
    } else if (filters.ageGroup === '70+') {
      s60Plus = r.sasaranUmur70Plus || 0;
    }

    if (s60Plus > item.sasaran60Plus) item.sasaran60Plus = s60Plus;
    if (sAll > item.sasaranTotalSemuaUmur) item.sasaranTotalSemuaUmur = sAll;
    item.sasaran = item.sasaran60Plus > 0 ? item.sasaran60Plus : item.sasaranTotalSemuaUmur;

    let k = r.kunjunganLansia;
    let s = r.skriningLansia;
    let kel = r.lansiaDenganKelainan;

    if (filters.gender === 'Laki-laki') {
      k = r.kunjunganLaki;
      s = r.skriningLaki;
      kel = r.lansiaKelainanLaki;
    } else if (filters.gender === 'Perempuan') {
      k = r.kunjunganPerempuan;
      s = r.skriningPerempuan;
      kel = r.lansiaKelainanPerempuan;
    }

    if (filters.ageGroup === '45-59') {
      k = r.kunjunganUmur45_59;
      s = r.skriningUmur45_59;
    } else if (filters.ageGroup === '60-69') {
      k = r.kunjunganUmur60_69;
      s = r.skriningUmur60_69;
    } else if (filters.ageGroup === '70+') {
      k = r.kunjunganUmur70Plus;
      s = r.skriningUmur70Plus;
    }

    item.kunjungan += k;
    item.skrining += s;
    item.kelainan += kel;
    item.penyakit += r.totalPenyakitBulanIni;
    item.diobati += r.diobati;
    item.dirujuk += r.dirujuk;
    item.kunjunganRumah += r.jumlahKunjunganRumah;
  });

  const result: KelurahanStat[] = [];
  kelMap.forEach((v) => {
    // Rumus: (Skrining / Sasaran 60 Ke Atas) * 100
    const persenSkrining = v.sasaran > 0 ? (v.skrining / v.sasaran) * 100 : 0;
    result.push({
      ...v,
      persenSkrining,
    });
  });

  return result.sort((a, b) => b.kunjungan - a.kunjungan);
}
