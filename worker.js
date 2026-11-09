// Hoop Chaos - Cloudflare Worker
// Serves the static game files and a tiny account API so progress can be saved online.
//
// Storage: a Workers KV namespace bound as SAVES (see wrangler.jsonc / README).
// Without SAVES bound, /api/health reports storage:false and the game falls back
// to on-device accounts automatically.
//
//   GET  /api/health                      -> { ok, storage }
//   POST /api/register  {name, password}  -> { token, name }
//   POST /api/login     {name, password}  -> { token, name, data }
//   POST /api/logout    (Bearer token)    -> { ok }
//   GET  /api/save      (Bearer token)    -> { data, updated }
//   PUT  /api/save      (Bearer token) {data} -> { ok, updated }

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days
const MAX_SAVE_BYTES = 64 * 1024;
const PBKDF2_ITERATIONS = 100000;
const NAME_RE = /^[A-Za-z0-9_-]{3,20}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      return await handleApi(request, env, url);
    } catch (e) {
      return json({ error: 'Server error' }, 500);
    }
  },
};

async function handleApi(request, env, url) {
  const path = url.pathname, method = request.method;
  if (path === '/api/health') return json({ ok: true, storage: !!env.SAVES });
  if (!env.SAVES) return json({ error: 'Online saving is not set up on this server.' }, 503);
  const kv = env.SAVES;

  if (path === '/api/register' && method === 'POST') {
    const { name, password } = await body(request);
    const err = validate(name, password);
    if (err) return json({ error: err }, 400);
    const key = 'user:' + name.toLowerCase();
    if (await kv.get(key)) return json({ error: 'That name is taken.' }, 409);
    const salt = randomHex(16);
    const hash = await hashPassword(password, salt);
    await kv.put(key, JSON.stringify({ name, salt, hash, created: Date.now() }));
    const token = await newSession(kv, name);
    return json({ token, name });
  }

  if (path === '/api/login' && method === 'POST') {
    const { name, password } = await body(request);
    if (typeof name !== 'string' || typeof password !== 'string') return json({ error: 'Enter a name and password.' }, 400);
    const user = await kv.get('user:' + name.toLowerCase(), 'json');
    if (!user || !timingSafeEqual(await hashPassword(password, user.salt), user.hash)) return json({ error: 'Wrong name or password.' }, 401);
    const token = await newSession(kv, user.name);
    const save = await kv.get('save:' + user.name.toLowerCase(), 'json');
    return json({ token, name: user.name, data: save ? save.data : null });
  }

  // everything below needs a session
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const name = /^[a-f0-9]{64}$/.test(token) ? await kv.get('session:' + token) : null;
  if (!name) return json({ error: 'Please log in again.' }, 401);

  if (path === '/api/logout' && method === 'POST') {
    await kv.delete('session:' + token);
    return json({ ok: true });
  }
  if (path === '/api/save' && method === 'GET') {
    const save = await kv.get('save:' + name.toLowerCase(), 'json');
    return json({ name, data: save ? save.data : null, updated: save ? save.updated : 0 });
  }
  if (path === '/api/save' && method === 'PUT') {
    const text = await request.text();
    if (text.length > MAX_SAVE_BYTES) return json({ error: 'Save too large.' }, 413);
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { return json({ error: 'Bad save data.' }, 400); }
    if (!parsed || typeof parsed.data !== 'object') return json({ error: 'Bad save data.' }, 400);
    const updated = Date.now();
    await kv.put('save:' + name.toLowerCase(), JSON.stringify({ data: parsed.data, updated }));
    return json({ ok: true, updated });
  }
  return json({ error: 'Not found' }, 404);
}

function validate(name, password) {
  if (typeof name !== 'string' || !NAME_RE.test(name)) return 'Name must be 3-20 letters, numbers, _ or -.';
  if (typeof password !== 'string' || password.length < 6 || password.length > 100) return 'Password must be at least 6 characters.';
  return null;
}

async function newSession(kv, name) {
  const token = randomHex(32);
  await kv.put('session:' + token, name, { expirationTtl: SESSION_TTL });
  return token;
}

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations: PBKDF2_ITERATIONS }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function randomHex(n) { return bytesToHex(crypto.getRandomValues(new Uint8Array(n))); }
function bytesToHex(b) { return Array.from(b, x => x.toString(16).padStart(2, '0')).join(''); }
function hexToBytes(h) { const out = new Uint8Array(h.length / 2); for (let i = 0; i < out.length; i++) out[i] = parseInt(h.substr(i * 2, 2), 16); return out; }
async function body(request) { try { return await request.json(); } catch (e) { return {}; } }
function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
