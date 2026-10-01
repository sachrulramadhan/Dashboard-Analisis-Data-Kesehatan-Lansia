import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Health check compatible with Cloudflare D1 monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    engine: 'Cloudflare D1 & Pages Compatible Server',
    database: {
      type: 'Cloudflare D1 (Serverless SQLite)',
      binding: 'env.DB',
      status: 'ready_for_cloudflare_deployment',
    },
    timestamp: new Date().toISOString() 
  });
});

// Serve schema and migration SQL files for in-app download
app.get('/schema.sql', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'schema.sql'));
});
app.use('/migrations', express.static(path.resolve(__dirname, 'migrations')));

// Shared Dataset Path for multi-user synchronization
const SHARED_DATA_FILE = path.resolve(__dirname, 'src', 'data', 'shared_dataset.json');

// GET /api/shared-dataset - Mengambil dataset bersama terkini untuk semua pengguna
app.get('/api/shared-dataset', async (req, res) => {
  try {
    const fs = await import('fs');
    if (fs.existsSync(SHARED_DATA_FILE)) {
      const raw = fs.readFileSync(SHARED_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return res.json({
        success: true,
        dataset: parsed.dataset || [],
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        source: parsed.source || 'user_import'
      });
    }
    return res.json({ success: false, dataset: [], message: 'Shared dataset not yet initialized' });
  } catch (err: any) {
    console.error('Error reading shared dataset:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shared-dataset - Menyimpan dataset hasil import agar otomatis tampil di semua pengguna lain
app.post('/api/shared-dataset', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const fs = await import('fs');
    const { dataset, source } = req.body || {};
    if (!Array.isArray(dataset)) {
      return res.status(400).json({ success: false, error: 'Dataset must be an array' });
    }

    const payload = {
      dataset,
      updatedAt: new Date().toISOString(),
      source: source || 'user_import'
    };

    fs.writeFileSync(SHARED_DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`[Shared Database] Updated with ${dataset.length} records at ${payload.updatedAt}`);

    return res.json({
      success: true,
      totalRecords: dataset.length,
      updatedAt: payload.updatedAt
    });
  } catch (err: any) {
    console.error('Error saving shared dataset:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Server-side AI Analyst endpoint using @google/genai
app.post('/api/ai-analyst', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { prompt, datasetSummary } = req.body || {};

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return res.status(200).json({
        fallback: true,
        message: 'GEMINI_API_KEY tidak dikonfigurasi. Menggunakan analisis analitik deterministik lokal.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const fullPrompt = `Anda adalah Senior Epidemiolog dan Analis Kebijakan Kesehatan Lansia untuk Dinas Kesehatan.
Tugas Anda adalah menganalisis data program kesehatan lansia yang diberikan di bawah ini secara objektif, ilmiah, dan berbasis data.

PANDUAN KETAT:
1. JANGAN PERNAH mengarang angka, penyebab medis yang tidak ada dalam data, atau data fiktif.
2. JANGAN memberikan diagnosis medis individual kepada pasien.
3. Seluruh temuan, angka, dan persentase HARUS dapat diverifikasi langsung dari ringkasan data yang diberikan.
4. Format output dalam 5 bagian:
   ### 1. Ringkasan Eksekutif (Apa yang terjadi pada periode ini)
   ### 2. Temuan Utama (Indikator paling menonjol)
   ### 3. Dinamika & Perubahan (Tren peningkatan atau penurunan)
   ### 4. Wilayah Prioritas Perhatian (Puskesmas/Kelurahan dengan capaian rendah atau anomali)
   ### 5. Rekomendasi Tindak Lanjut Program (Langkah manajerial puskesmas/dinkes berbasis data)

DATASET YANG DIANALISIS:
${datasetSummary}

PERTANYAAN / FOKUS PENGGUNA:
${prompt || 'Lakukan analisis menyeluruh terhadap capaian program kesehatan lansia pada periode ini.'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
    });

    return res.json({
      fallback: false,
      text: response.text,
    });
  } catch (err: any) {
    console.error('Error generating AI analysis:', err);
    return res.status(200).json({
      fallback: true,
      error: err.message || 'Model AI sedang mengalami lonjakan lalu lintas. Menggunakan analisis cerdas berbasis data riil.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);

    // Serve index.html for non-API routes
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const templatePath = path.resolve(__dirname, 'index.html');
        const fs = await import('fs');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
