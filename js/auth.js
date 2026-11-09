// Accounts + login page. Progress is saved per account:
//   - "cloud" accounts use the Worker API (/api/*) when online saving is available
//   - otherwise "local" accounts live in this browser's localStorage
//   - "guest" plays without an account (saved on this device only)
window.HC = window.HC || {};

HC.Auth = {
  user: null,           // { name, mode: 'cloud' | 'local' | 'guest', token }
  cloud: false,         // is the online API available?
  SESSION_KEY: 'hoopchaos_session',
  ACCOUNTS_KEY: 'hoopchaos_accounts',

  // ---------- storage helpers (always try/catch) ----------
  lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  saveKeyFor(user) {
    if (!user || user.mode === 'guest') return 'hoopchaos_save_v1';
    return 'hoopchaos_save_v1:' + user.mode + ':' + user.name.toLowerCase();
  },

  async api(path, opts) {
    opts = opts || {};
    const headers = { 'Content-Type': 'application/json' };
    if (this.user && this.user.token) headers.Authorization = 'Bearer ' + this.user.token;
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(path, { method: opts.method || 'GET', headers, body: opts.body ? JSON.stringify(opts.body) : undefined, signal: ctrl.signal });
      let data = {}; try { data = await r.json(); } catch (e) { /* empty */ }
      if (!r.ok) throw Object.assign(new Error(data.error || ('Error ' + r.status)), { status: r.status });
      return data;
    } finally { clearTimeout(to); }
  },

  async init() {
    if (location.protocol.startsWith('http')) {
      try { const h = await this.api('/api/health'); this.cloud = !!h.storage; } catch (e) { this.cloud = false; }
    }
    let sess = null;
    try { sess = JSON.parse(this.lsGet(this.SESSION_KEY) || 'null'); } catch (e) { sess = null; }
    if (sess && sess.mode === 'cloud' && this.cloud) {
      this.user = sess;
      try { const r = await this.api('/api/save'); this.applyProfile(r.data); return true; }
      catch (e) {
        if (e.status === 401) { this.user = null; this.lsDel(this.SESSION_KEY); return false; }
        this.applyProfile(null); return true; // offline: use cached copy
      }
    }
    if (sess && (sess.mode === 'local' || sess.mode === 'guest' || sess.mode === 'cloud')) {
      if (sess.mode === 'cloud') { this.user = sess; this.applyProfile(null); return true; } // server unreachable: cached copy
      this.user = sess; this.applyProfile(null); return true;
    }
    return false;
  },

  // load the user's save (remote data wins when given), point HC.Save at their key
  applyProfile(remoteData, carryOver) {
    const S = HC.Save;
    S.key = this.saveKeyFor(this.user);
    if (carryOver) { S.data = carryOver; S.save(); }
    else if (remoteData) { S.data = S.merge(remoteData); S.writeLocal(); }
    else S.load();
    this.lsSet(this.SESSION_KEY, JSON.stringify(this.user));
    if (HC.App && HC.App.onProfileChanged) HC.App.onProfileChanged();
  },

  guestData() {
    const S = HC.Save, old = S.key;
    S.key = 'hoopchaos_save_v1'; S.load(); const d = S.data; S.key = old;
    return d;
  },

  async register(name, password) {
    name = (name || '').trim();
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(name)) throw new Error('Name must be 3-20 letters, numbers, _ or -.');
    if ((password || '').length < 6) throw new Error('Password must be at least 6 characters.');
    const carry = this.guestData(); // new accounts keep any guest progress
    if (this.cloud) {
      const r = await this.api('/api/register', { method: 'POST', body: { name, password } });
      this.user = { name: r.name, mode: 'cloud', token: r.token };
      this.applyProfile(null, carry);
      return;
    }
    const accounts = this.localAccounts(), k = name.toLowerCase();
    if (accounts[k]) throw new Error('That name is taken on this device.');
    const salt = this.randomHex(16);
    accounts[k] = { name, salt, hash: await this.hash(password, salt) };
    this.lsSet(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    this.user = { name, mode: 'local' };
    this.applyProfile(null, carry);
  },

  async login(name, password) {
    name = (name || '').trim();
    if (!name || !password) throw new Error('Enter a name and password.');
    if (this.cloud) {
      const r = await this.api('/api/login', { method: 'POST', body: { name, password } });
      this.user = { name: r.name, mode: 'cloud', token: r.token };
      this.applyProfile(r.data);
      if (!r.data) this.pushNow();
      return;
    }
    const acc = this.localAccounts()[name.toLowerCase()];
    if (!acc || (await this.hash(password, acc.salt)) !== acc.hash) throw new Error('Wrong name or password.');
    this.user = { name: acc.name, mode: 'local' };
    this.applyProfile(null);
  },

  guest() { this.user = { name: 'Guest', mode: 'guest' }; this.applyProfile(null); },

  async logout() {
    if (this.user && this.user.mode === 'cloud') { await this.pushNow(); try { await this.api('/api/logout', { method: 'POST' }); } catch (e) { /* ignore */ } }
    this.user = null; this.lsDel(this.SESSION_KEY);
    HC.Save.key = 'hoopchaos_save_v1'; HC.Save.load();
    if (HC.App && HC.App.onProfileChanged) HC.App.onProfileChanged();
  },

  // called by HC.Save.save(): upload cloud saves (debounced)
  queuePush() {
    if (!this.user || this.user.mode !== 'cloud') return;
    clearTimeout(this._pushT);
    this._pushT = setTimeout(() => this.pushNow(), 1200);
  },
  async pushNow() {
    clearTimeout(this._pushT);
    if (!this.user || this.user.mode !== 'cloud' || !this.cloud) return;
    try { await this.api('/api/save', { method: 'PUT', body: { data: HC.Save.data } }); this.syncError = null; }
    catch (e) { this.syncError = e.message; if (e.status === 401) { this.syncError = 'Session expired - log in again to keep saving online.'; } }
  },

  localAccounts() { try { return JSON.parse(this.lsGet(this.ACCOUNTS_KEY) || '{}'); } catch (e) { return {}; } },
  randomHex(n) { const a = new Uint8Array(n); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 256; }); return Array.from(a, x => x.toString(16).padStart(2, '0')).join(''); },
  async hash(pw, salt) {
    const text = salt + ':' + pw;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf), x => x.toString(16).padStart(2, '0')).join('');
    }
    let h = 2166136261; for (let r = 0; r < 1000; r++) for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i) + r; h = Math.imul(h, 16777619) >>> 0; }
    return 'f' + h.toString(16);
  },

  label() {
    if (!this.user) return 'Not signed in';
    if (this.user.mode === 'guest') return 'Guest (saved on this device)';
    return this.user.name + (this.user.mode === 'cloud' ? ' (saved online)' : ' (saved on this device)');
  },
};

// ---------------------------------------------------------------- Login page (HTML overlay)
HC.LoginPage = {
  el: null,
  show() {
    this.el = this.el || document.getElementById('login');
    this.render(); this.el.style.display = 'flex';
    const n = document.getElementById('loginName'); if (n && !HC.Auth.user) setTimeout(() => n.focus(), 50);
  },
  hide() { if (this.el) this.el.style.display = 'none'; },
  visible() { return this.el && this.el.style.display !== 'none'; },
  render() {
    const A = HC.Auth, signedIn = A.user && A.user.mode !== 'guest';
    const where = A.cloud ? 'Accounts are saved online - log in on any device to keep your progress.'
      : 'Online saving isn\'t available here, so accounts are saved on this device.';
    const box = this.el.querySelector('.login-box');
    if (signedIn) {
      box.innerHTML = `
        <h1>HOOP <span>CHAOS</span></h1>
        <p class="who">Signed in as <b></b></p>
        <p class="where">${A.user.mode === 'cloud' ? 'Your progress is saved online.' : 'Your progress is saved on this device.'}</p>
        ${A.syncError ? '<p class="err"></p>' : ''}
        <button id="loginPlay" class="primary">PLAY</button>
        <button id="loginLogout">LOG OUT</button>`;
      box.querySelector('.who b').textContent = A.user.name;
      if (A.syncError) box.querySelector('.err').textContent = A.syncError;
      box.querySelector('#loginPlay').onclick = () => this.hide();
      box.querySelector('#loginLogout').onclick = async () => { await A.logout(); this.render(); };
      return;
    }
    box.innerHTML = `
      <h1>HOOP <span>CHAOS</span></h1>
      <p class="sub">Log in to save your trophies, unlocked characters and bosses beaten.</p>
      <form id="loginForm" autocomplete="on">
        <input id="loginName" name="username" placeholder="Name" maxlength="20" autocomplete="username" autocapitalize="off" spellcheck="false">
        <input id="loginPass" name="password" type="password" placeholder="Password" maxlength="100" autocomplete="current-password">
        <p class="err" id="loginErr"></p>
        <button type="submit" class="primary" id="loginBtn">LOG IN</button>
        <button type="button" id="registerBtn">CREATE ACCOUNT</button>
      </form>
      <button id="guestBtn" class="ghost">Play as guest</button>
      <p class="where">${where}</p>`;
    const err = box.querySelector('#loginErr');
    const busy = (b) => box.querySelectorAll('button').forEach(x => { x.disabled = b; });
    const run = async (fn) => {
      err.textContent = ''; busy(true);
      try { await fn(box.querySelector('#loginName').value, box.querySelector('#loginPass').value); HC.Audio.init(); HC.Audio.card(); this.hide(); }
      catch (e) { err.textContent = e.message || 'Something went wrong.'; }
      busy(false);
    };
    box.querySelector('#loginForm').onsubmit = (e) => { e.preventDefault(); run((n, p) => A.login(n, p)); };
    box.querySelector('#registerBtn').onclick = () => run((n, p) => A.register(n, p));
    box.querySelector('#guestBtn').onclick = () => { A.guest(); this.hide(); };
  },
};
