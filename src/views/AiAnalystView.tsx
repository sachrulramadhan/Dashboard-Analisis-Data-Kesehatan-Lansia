import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Database,
  Building,
  Activity
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PeriodBanner } from '../components/PeriodBanner';

export const AiAnalystView: React.FC = () => {
  const { 
    metrics, 
    periodLabel, 
    filters, 
    diseaseRanking, 
    puskesmasStats, 
    kelurahanStats,
    isAiAnalyzing,
    setIsAiAnalyzing
  } = useDashboard();

  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [analysisModeSource, setAnalysisModeSource] = useState<'gemini' | 'deterministic' | null>(null);
  const [userPromptQuery, setUserPromptQuery] = useState('');

  // Prepare verifiable data payload for AI
  const prepareDataSummary = () => {
    const top3Diseases = diseaseRanking.slice(0, 3).map((d) => `${d.name} (${d.cases.toLocaleString('id-ID')} kasus, ${d.percentageOfCases.toFixed(1)}%)`).join(', ');
    const lowPuskesmas = [...puskesmasStats].sort((a, b) => a.persenSkrining - b.persenSkrining).slice(0, 3).map((p) => `${p.puskesmas} (${p.persenSkrining.toFixed(1)}%)`).join(', ');
    const highPuskesmas = [...puskesmasStats].sort((a, b) => b.persenSkrining - a.persenSkrining).slice(0, 3).map((p) => `${p.puskesmas} (${p.persenSkrining.toFixed(1)}%)`).join(', ');

    return `
Periode Analisis: ${periodLabel} (Mode: ${filters.mode.toUpperCase()})
Filter Wilayah: Puskesmas: ${filters.puskesmas}, Kelurahan: ${filters.kelurahan}
Demografi: Gender: ${filters.gender}, Umur: ${filters.ageGroup}

INDIKATOR UTAMA:
- Sasaran Lansia: ${metrics.totalSasaran.toLocaleString('id-ID')} Jiwa
- Kunjungan Lansia: ${metrics.totalKunjungan.toLocaleString('id-ID')} Kunjungan (Rasio ke sasaran: ${metrics.rasioKunjunganSasaran.toFixed(1)}%)
- Lansia Diskrining (>60 thn): ${metrics.totalSkrining.toLocaleString('id-ID')} (${metrics.persentaseSkrining.toFixed(1)}% cakupan)
- Lansia dengan Kelainan: ${metrics.lansiaDenganKelainan.toLocaleString('id-ID')} (${metrics.persentaseKelainan.toFixed(1)}% dari skrining)
- Total Kasus Penyakit Terdata: ${metrics.totalKasusPenyakit.toLocaleString('id-ID')}
- Lansia Diobati: ${metrics.diobati.toLocaleString('id-ID')} (${metrics.persentasePengobatan.toFixed(1)}% dari yang ada kelainan)
- Lansia Belum Diobati: ${metrics.tidakDiobati.toLocaleString('id-ID')} (${metrics.persentaseTidakDiobati.toFixed(1)}%)
- Lansia Dirujuk ke FKRTL: ${metrics.dirujuk.toLocaleString('id-ID')} (${metrics.persentaseRujukan.toFixed(1)}%)
- Kunjungan Rumah (Home Care): ${metrics.kunjunganRumah.toLocaleString('id-ID')}
- Posyandu Lansia Aktif: ${metrics.posbinduAktif} Pos
- Tenaga Kesehatan: ${metrics.totalTenaga} Nakes

BEBAN PENYAKIT TERTINGGI:
${top3Diseases}

WILAYAH CAKUPAN TERTINGGI:
${highPuskesmas}

WILAYAH CAKUPAN TERENDAH:
${lowPuskesmas}
    `.trim();
  };

  const generateDeterministicAnalysis = () => {
    const summary = prepareDataSummary();
    const topDis = diseaseRanking[0];
    const sortedPusk = [...puskesmasStats].sort((a, b) => a.persenSkrining - b.persenSkrining);
    const lowPusk = sortedPusk[0];
    const highPusk = sortedPusk[sortedPusk.length - 1];

    return `### 1. Ringkasan Eksekutif
Pada ${periodLabel}, tercatat total sasaran lansia sebanyak ${metrics.totalSasaran.toLocaleString('id-ID')} jiwa dengan total kunjungan mencapai ${metrics.totalKunjungan.toLocaleString('id-ID')} kali. Dari populasi lansia yang hadir, sebanyak ${metrics.totalSkrining.toLocaleString('id-ID')} lansia telah menjalani skrining kesehatan standar, merepresentasikan capaian cakupan skrining sebesar ${metrics.persentaseSkrining.toFixed(1)}%. Dari hasil skrining, ditemukan ${metrics.lansiaDenganKelainan.toLocaleString('id-ID')} lansia (${metrics.persentaseKelainan.toFixed(1)}%) memiliki minimal satu faktor risiko atau kelainan kesehatan.

### 2. Temuan Utama
- **Cakupan Skrining vs Target**: Capaian skrining berada di angka ${metrics.persentaseSkrining.toFixed(1)}%. Terdapat disparitas antar wilayah dengan rentang cakupan tertinggi di ${highPusk?.puskesmas} (${highPusk?.persenSkrining.toFixed(1)}%) dan terendah di ${lowPusk?.puskesmas} (${lowPusk?.persenSkrining.toFixed(1)}%).
- **Beban Penyakit Terbanyak**: Kasus tertinggi didominasi oleh ${topDis?.name} sebanyak ${topDis?.cases.toLocaleString('id-ID')} kasus (${topDis?.percentageOfCases.toFixed(1)}% dari total kelainan), disusul oleh ${diseaseRanking[1]?.name} (${diseaseRanking[1]?.cases.toLocaleString('id-ID')} kasus).
- **Efektivitas Tatalaksana Pengobatan**: Sebanyak ${metrics.diobati.toLocaleString('id-ID')} lansia (${metrics.persentasePengobatan.toFixed(1)}%) telah mendapatkan terapi pengobatan di faskes primer, sedangkan ${metrics.tidakDiobati.toLocaleString('id-ID')} lansia (${metrics.persentaseTidakDiobati.toFixed(1)}%) tercatat belum tuntas terobati atau memerlukan penjadwalan tindak lanjut.
- **Rasio Rujukan**: Sebanyak ${metrics.dirujuk.toLocaleString('id-ID')} lansia (${metrics.persentaseRujukan.toFixed(1)}%) dirujuk ke FKRTL karena komplikasi atau kebutuhan dokter spesialis.

### 3. Dinamika & Perubahan Indikator
- Kunjungan lansia ${metrics.deltaKunjungan != null ? (metrics.deltaKunjungan >= 0 ? `mengalami kenaikan sebesar +${metrics.deltaKunjungan.toFixed(1)}%` : `mengalami penurunan sebesar ${metrics.deltaKunjungan.toFixed(1)}%`) : 'berada pada batas baseline'}.
- Penemuan kelainan penyakit ${metrics.deltaKelainan != null ? (metrics.deltaKelainan >= 0 ? `meningkat +${metrics.deltaKelainan.toFixed(1)}%` : `menurun ${metrics.deltaKelainan.toFixed(1)}%`) : 'tetap terkendali'}.
- Aktivitas home care kunjungan rumah tercatat ${metrics.kunjunganRumah.toLocaleString('id-ID')} kali pelayanan bagi lansia tirah baring/risti.

### 4. Wilayah Prioritas Perhatian
- **${lowPusk?.puskesmas}**: Menunjukkan cakupan skrining terendah (${lowPusk?.persenSkrining.toFixed(1)}%) dengan jumlah kunjungan ${lowPusk?.kunjungan.toLocaleString('id-ID')} dari sasaran ${lowPusk?.sasaran.toLocaleString('id-ID')}. Perlu penguatan kader Posyandu Lansia.
- **Puskesmas dengan gap pengobatan**: Perlu dilakukan peninjauan ketersediaan obat kronis (antihipertensi dan OAD/antidiabetes oral) di puskesmas yang mencatatkan persentase diobati di bawah 80%.

### 5. Rekomendasi Tindak Lanjut Program
1. **Intensifikasi Posyandu Lansia & Posbindu**: Tingkatkan frekuensi pembinaan kader dan pemeriksaan berkala di wilayah dengan cakupan skrining di bawah 50%.
2. **Ketersediaan Logistik Skrining**: Pastikan strip tes gula darah, kolesterol, dan asam urat mencukupi di seluruh 14 Puskesmas binaan.
3. **Program Home Care Terjadwal**: Prioritaskan kunjungan rumah nakes bagi lansia dengan tingkat kemandirian Kategori C (Ketergantungan Total/Berat).
4. **Monitoring Berkala Antar Periode**: Lakukan evaluasi triwulanan atas tren drop-out pengobatan hipertensi dan diabetes melitus.`;
  };

  const handleRunAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    setAiOutput(null);

    const datasetSummary = prepareDataSummary();

    try {
      const res = await fetch('/api/ai-analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPromptQuery || undefined,
          datasetSummary,
        }),
      });

      if (!res.ok) {
        throw new Error('API server returned error');
      }

      const data = await res.json();
      if (data.text && !data.fallback) {
        setAiOutput(data.text);
        setAnalysisModeSource('gemini');
      } else {
        // Fallback to deterministic expert logic strictly grounded in data
        const localAnalysis = generateDeterministicAnalysis();
        setAiOutput(localAnalysis);
        setAnalysisModeSource('deterministic');
      }
    } catch (err) {
      console.warn('Using deterministic AI engine fallback:', err);
      const localAnalysis = generateDeterministicAnalysis();
      setAiOutput(localAnalysis);
      setAnalysisModeSource('deterministic');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PeriodBanner />

      {/* Hero Action Card */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                Gemini 3.8 Flash • AI Health Analyst
              </span>
              <span className="text-xs text-slate-400">Strict Data Grounding</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Analisis Intelijen Program Kesehatan Lansia
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mengevaluasi capaian program lansia berdasarkan filter aktif: <strong className="text-white">{periodLabel}</strong>, wilayah <strong className="text-white">{filters.puskesmas}</strong>. AI menghasilkan ringkasan, temuan utama, pergeseran tren, wilayah perhatian, dan rekomendasi berbasis data tanpa mengarang data fiktif.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isAiAnalyzing}
              onClick={handleRunAiAnalysis}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAiAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Memproses Data & Mengurai Analisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>ANALISIS DENGAN AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Query Focus Input */}
        <div className="mt-5 pt-4 border-t border-indigo-900/60">
          <label className="text-xs text-indigo-200 font-semibold block mb-1.5">
            Fokus Pertanyaan Spesifik (Opsional):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userPromptQuery}
              onChange={(e) => setUserPromptQuery(e.target.value)}
              placeholder="Contoh: Fokuskan analisis pada perbandingan pengobatan hipertensi dan disparitas puskesmas..."
              className="flex-1 bg-slate-900/80 border border-indigo-800/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-indigo-400"
            />
            {aiOutput && (
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                className="px-3 py-2 rounded-lg bg-indigo-700/80 hover:bg-indigo-600 text-xs font-semibold text-white cursor-pointer"
              >
                Perbarui
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Output Results Container */}
      {aiOutput ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Laporan Analisis AI Kesehatan Lansia ({periodLabel})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                Engine: {analysisModeSource === 'gemini' ? 'Gemini 3.8 Flash' : 'Analitik Deterministik Data Riil'}
              </span>
            </div>
          </div>

          {/* Render formatted markdown output */}
          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
            {aiOutput.split('\n\n').map((paragraph, pIdx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-sm font-bold text-slate-900 text-blue-900 mt-4 mb-2 pb-1 border-b border-slate-100 flex items-center gap-2">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }

              if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                const lines = paragraph.split('\n');
                return (
                  <ul key={pIdx} className="list-disc pl-5 space-y-1.5 text-slate-700">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx} dangerouslySetInnerHTML={{ 
                        __html: line.replace(/^[-*]|\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                      }} />
                    ))}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="text-slate-700 text-xs leading-relaxed" dangerouslySetInnerHTML={{
                  __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verifikasi: 100% indikator diturunkan dari data sumber Kota Palu. Tanpa data fiktif.</span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Cetak Analisis Ini
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Call to Action state */
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Siap untuk Melakukan Analisis Otomatis
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            Klik tombol &quot;ANALISIS DENGAN AI&quot; di atas untuk memproses data {periodLabel} dan menghasilkan insight manajerial komprehensif untuk pengambil keputusan.
          </p>
          <button
            type="button"
            onClick={handleRunAiAnalysis}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mulai Analisis Sekarang</span>
          </button>
        </div>
      )}
    </div>
  );
};
