// Worker: API penyimpanan data untuk SIMETRI LANSIA
// - GET    /api/dataset  : semua orang bisa membaca data terbaru
// - POST   /api/login    : admin masuk dengan password (secret ADMIN_PASSWORD)
// - PUT    /api/dataset  : simpan data (khusus admin)
// - DELETE /api/dataset  : kembali ke data bawaan (khusus admin)

interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

interface Env {
  DATA: KV;
  ASSETS: { fetch(request: Request): Promise<Response> };
  ADMIN_PASSWORD?: string;
}

const KEY = 'dataset';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam
const MAX_BODY_BYTES = 20 * 1024 * 1024; // batas KV 25 MB

const enc = new TextEncoder();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function makeToken(secret: string): Promise<string> {
  const exp = String(Date.now() + TOKEN_TTL_MS);
  return `${exp}.${await hmac(secret, `token:${exp}`)}`;
}

async function isValidToken(secret: string, token: string): Promise<boolean> {
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (!(Number(exp) > Date.now())) return false;
  return safeEqual(sig, await hmac(secret, `token:${exp}`));
}

async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  if (!env.ADMIN_PASSWORD) {
    return json({ error: 'ADMIN_PASSWORD belum diatur di Cloudflare.' }, 503);
  }
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !(await isValidToken(env.ADMIN_PASSWORD, token))) {
    return json({ error: 'Sesi admin tidak valid atau sudah berakhir. Silakan login ulang.' }, 401);
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    try {
      // ---- Baca data (publik) ----
      if (url.pathname === '/api/dataset' && request.method === 'GET') {
        const raw = await env.DATA.get(KEY);
        if (!raw) return json({ records: null });
        return new Response(raw, {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }

      // ---- Login admin ----
      if (url.pathname === '/api/login' && request.method === 'POST') {
        if (!env.ADMIN_PASSWORD) {
          return json({ error: 'ADMIN_PASSWORD belum diatur di Cloudflare.' }, 503);
        }
        const body = (await request.json().catch(() => ({}))) as { password?: string };
        const given = await hmac('login-check', String(body.password ?? ''));
        const expected = await hmac('login-check', env.ADMIN_PASSWORD);
        if (!safeEqual(given, expected)) {
          await new Promise((r) => setTimeout(r, 600)); // perlambat tebakan password
          return json({ error: 'Password salah.' }, 401);
        }
        return json({ token: await makeToken(env.ADMIN_PASSWORD) });
      }

      // ---- Simpan data (admin) ----
      if (url.pathname === '/api/dataset' && request.method === 'PUT') {
        const denied = await requireAdmin(request, env);
        if (denied) return denied;

        const text = await request.text();
        if (text.length > MAX_BODY_BYTES) {
          return json({ error: 'Data terlalu besar (maksimum sekitar 20 MB).' }, 413);
        }
        let parsed: { records?: unknown };
        try {
          parsed = JSON.parse(text);
        } catch {
          return json({ error: 'Format data tidak valid.' }, 400);
        }
        if (!Array.isArray(parsed.records)) {
          return json({ error: 'Field "records" harus berupa daftar.' }, 400);
        }
        const updatedAt = new Date().toISOString();
        await env.DATA.put(KEY, JSON.stringify({ records: parsed.records, updatedAt }));
        return json({ ok: true, count: parsed.records.length, updatedAt });
      }

      // ---- Kembali ke data bawaan (admin) ----
      if (url.pathname === '/api/dataset' && request.method === 'DELETE') {
        const denied = await requireAdmin(request, env);
        if (denied) return denied;
        await env.DATA.delete(KEY);
        return json({ ok: true });
      }

      return json({ error: 'Endpoint tidak ditemukan.' }, 404);
    } catch (err: any) {
      return json({ error: err?.message || 'Terjadi kesalahan di server.' }, 500);
    }
  },
};
