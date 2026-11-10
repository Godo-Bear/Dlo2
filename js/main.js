// App: canvas scaling, input (one button per team + touch), game loop, screen flow, saving.
window.HC = window.HC || {};

// ---------------------------------------------------------------- Save (localStorage, always try/catch)
HC.Save = {
  key: 'hoopchaos_save_v1',
  defaults() {
    return { best: '', bestRank: -1, trophies: 0, unlocked: {}, bosses: {},
      coins: 0, items: {}, equip: { ball: 'classic', jersey: 'blue' }, adv: { stars: {}, cleared: {}, region: 0 },
      advTeam: ['pip', 'noodle'], lastPicks: [], admin: { enabled: false },
      settings: { volume: 0.7, winScore: HC.CONFIG.WIN_SCORE, matchTime: HC.CONFIG.MATCH_TIME, difficulty: 'medium', shake: true, unlockAll: false } };
  },
  data: null,
  merge(d) {
    const out = this.defaults();
    if (d && typeof d === 'object') { Object.assign(out, d); out.settings = Object.assign(this.defaults().settings, d.settings || {}); }
    return out;
  },
  load() {
    let d = null;
    try { const raw = localStorage.getItem(this.key); if (raw) d = JSON.parse(raw); } catch (e) { d = null; /* storage unavailable: play without saving */ }
    this.data = this.merge(d);
  },
  writeLocal() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* ignore */ } },
  save() { this.writeLocal(); if (HC.Auth) HC.Auth.queuePush(); },
  reset() { const st = this.data.settings; this.data = this.defaults(); this.data.settings = st; this.save(); },
};

HC.ROUND_NAMES = ['Quarter-Finalist', 'Semi-Finalist', 'Finalist', 'Champion 🏆'];

HC.App = {
  init() {
    const C = HC.CONFIG;
    HC.Save.load();
    this.settings = HC.Save.data.settings;
    HC.Audio.setVolume(this.settings.volume);
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.mouse = { x: -1, y: -1 }; this.hits = []; this.focus = -1;
    this.keys = {}; this.touch = [false, false]; this.prevBtn = [false, false]; this.edge = [false, false]; this.anyHit = false;
    this.screen = 'title'; this.params = {}; this.match = null; this.t = 0;
    this.resize(); window.addEventListener('resize', () => this.resize());
    this.bindInput();
    this.makeDemo();
    this.last = performance.now(); this.acc = 0;
    requestAnimationFrame((t) => this.frame(t));
    // accounts: restore the last session or show the login page
    HC.Auth.init().then((ok) => { if (!ok) HC.LoginPage.show(); }).catch(() => HC.LoginPage.show());
  },

  onProfileChanged() {
    this.settings = HC.Save.data.settings;
    HC.Audio.setVolume(this.settings.volume);
    if (this.screen !== 'play') this.go('title');
  },

  makeDemo() {
    try {
      const pool = HC.CHARACTERS.filter(c => !c.unlock).map(c => c.id);
      const t = HC.U.shuffle(HC.CPU_TEAMS);
      this.demo = new HC.Match(this, { mode: 'quick', demo: true, court: HC.U.pick(HC.COURTS).id, winScore: 999, mutators: false,
        teams: [Object.assign({}, t[0], { cpu: 'medium', chars: [HC.U.pick(pool), HC.U.pick(pool)] }), Object.assign({}, t[1], { cpu: 'medium', chars: [HC.U.pick(pool), HC.U.pick(pool)] })] });
    } catch (e) { console.error(e); this.demo = null; }
  },

  resize() {
    const C = HC.CONFIG, dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.scale = Math.min(w / C.WIDTH, h / C.HEIGHT);
    this.ox = (w - C.WIDTH * this.scale) / 2; this.oy = (h - C.HEIGHT * this.scale) / 2;
    this.dpr = dpr;
  },

  toLogical(cx, cy) { const r = this.canvas.getBoundingClientRect(); return { x: (cx - r.left - this.ox) / this.scale, y: (cy - r.top - this.oy) / this.scale }; },

  bindInput() {
    const gameKeys = ['KeyW', 'ArrowUp', 'Space', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    window.addEventListener('keydown', (e) => {
      if (HC.LoginPage.visible() || HC.Admin.modalVisible() || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
      HC.Audio.init();
      if (gameKeys.includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys[e.code] = true; this.anyHit = true;
      if (this.screen === 'play' && this.match) {
        if (e.code === 'Escape' || e.code === 'KeyP') this.togglePause();
        else if (this.match.paused) this.menuKey(e.code);
      } else this.menuKey(e.code);
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => { this.keys = {}; });
    this.canvas.addEventListener('mousemove', (e) => { this.mouse = this.toLogical(e.clientX, e.clientY); this.focus = -1; });
    this.canvas.addEventListener('mousedown', (e) => { HC.Audio.init(); const p = this.toLogical(e.clientX, e.clientY); this.mouse = p; this.mouseDown = true; this.click(p.x, p.y); });
    window.addEventListener('mouseup', () => { this.mouseDown = false; });
    this.canvas.addEventListener('touchstart', (e) => {
      HC.Audio.init(); e.preventDefault();
      for (const t of e.changedTouches) { const p = this.toLogical(t.clientX, t.clientY); this.mouse = p; this.click(p.x, p.y); }
      setTimeout(() => { this.mouse = { x: -1, y: -1 }; }, 200);
    }, { passive: false });
    // touch buttons
    const tb = (id, team) => {
      const el = document.getElementById(id);
      const on = (e) => { e.preventDefault(); HC.Audio.init(); this.touch[team] = true; this.anyHit = true; el.classList.add('down'); };
      const off = (e) => { e.preventDefault(); this.touch[team] = false; el.classList.remove('down'); };
      el.addEventListener('touchstart', on, { passive: false }); el.addEventListener('touchend', off, { passive: false }); el.addEventListener('touchcancel', off, { passive: false });
      el.addEventListener('mousedown', on); el.addEventListener('mouseup', off); el.addEventListener('mouseleave', off);
    };
    tb('touchP1', 0); tb('touchP2', 1);
    this.isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  },

  menuKey(code) {
    const hits = this.hits.filter(h => !h.disabled);
    if (!hits.length) return;
    let i = hits.indexOf(this.hits[this.focus]);
    if (['ArrowRight', 'ArrowDown', 'Tab', 'KeyS', 'KeyD'].includes(code)) { i = (i + 1) % hits.length; HC.Audio.select(); }
    else if (['ArrowLeft', 'ArrowUp', 'KeyA'].includes(code)) { i = (i - 1 + hits.length) % hits.length; HC.Audio.select(); }
    else if (code === 'Enter' || code === 'Space') { if (i >= 0) { hits[i].onClick(); HC.Audio.card(); } return; }
    else if (code === 'Escape') { const b = this.hits.find(h => h.back); if (b) b.onClick(); return; }
    else return;
    this.focus = this.hits.indexOf(hits[i]);
  },

  click(x, y) {
    this.anyHit = true;
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const h = this.hits[i];
      if (!h.disabled && x > h.x && x < h.x + h.w && y > h.y && y < h.y + h.h) { HC.Audio.card(); h.onClick(); return; }
    }
    if (this.screen === 'play' && this.match) this.match.click(x, y);
  },

  // ---------------- one-button-per-team input ----------------
  rawButton(team) {
    const k = this.keys;
    if (team === 0) return !!(k.KeyW || this.touch[0] || (this.humans === 1 && k.Space));
    return !!(k.ArrowUp || this.touch[1]);
  },
  button(team) { return this.rawButton(team); },
  pressedTeam(team) { return this.edge[team]; },
  anyPressed() { return this.edge[0] || this.edge[1] || this.anyHitStep; },

  // ---------------- screens ----------------
  go(name, params) {
    if (params) this.params = params;
    if (name !== this.screen && !(name === 'play' && this.screen === 'play')) this.transT = 1;
    this.screen = name; this.focus = -1; this.hits = [];
    const s = HC.Screens[name];
    if (s && s.enter) s.enter(this, this.params);
    this.updateTouch();
  },

  updateTouch() {
    const show = this.isTouch && this.screen === 'play';
    document.getElementById('touchP1').style.display = show ? 'flex' : 'none';
    document.getElementById('touchP2').style.display = show && this.humans === 2 ? 'flex' : 'none';
  },

  teamColors(team, p) {
    if (team === 0) return HC.Cosmetics.jersey();
    const j = HC.Cosmetics.jersey();
    return j.main.toLowerCase() === '#e63946' ? { main: '#2e86ff', alt: '#ffffff' } : { main: '#ff3b3b', alt: '#ffffff' };
  },
  cycleMatchTime() { const t = HC.MATCH_TIMES; this.setSetting('matchTime', t[(t.indexOf(this.settings.matchTime) + 1) % t.length]); },
  cycleDifficulty() { const d = ['easy', 'medium', 'hard']; this.setSetting('difficulty', d[(d.indexOf(this.settings.difficulty) + 1) % 3]); },
  setSetting(k, v) { this.settings[k] = v; if (k === 'volume') HC.Audio.setVolume(v); HC.Save.save(); },

  buildTeams(p) {
    const pool = HC.CHARACTERS.filter(c => !c.unlock).map(c => c.id);
    void pool;
    const n = p.mode === 'horse' ? 1 : 2;
    const t0 = { name: p.humans === 2 ? 'PLAYER 1' : 'YOU', colors: this.teamColors(0), chars: p.picks[0].slice(0, n), cpu: null };
    let t1;
    if (p.humans === 2) t1 = { name: 'PLAYER 2', colors: this.teamColors(1), chars: p.picks[1].slice(0, n), cpu: null };
    else {
      const ct = HC.U.pick(HC.CPU_TEAMS);
      const cpool = HC.CHARACTERS.filter(c => !c.unlock).map(c => c.id);
      t1 = { name: p.mode === 'horse' ? 'CPU' : ct.name, colors: p.mode === 'horse' ? this.teamColors(1) : ct.colors, chars: (p.mode === 'horse' ? [HC.U.pick(cpool)] : ct.chars.slice()), cpu: this.settings.difficulty };
    }
    return [t0, t1];
  },

  startMatch(p) {
    this.humans = p.humans || 1;
    let opts;
    if (p.mode === 'boss') {
      const b = HC.bossById(p.bossId);
      opts = { mode: 'boss', court: b.court, boss: b.id, mutators: false,
        teams: [{ name: 'YOU', colors: this.teamColors(0), chars: p.picks[0], cpu: null }, { name: b.name, colors: b.colors, chars: [b.charId], cpu: b.cpu }], ballSkin: HC.Cosmetics.ballSkin() };
    } else if (p.mode === 'tournament') {
      const tour = this.tournament, opp = tour.teams[tour.opponent()];
      opts = { mode: 'tournament', court: HC.U.pick(HC.COURTS).id, winScore: this.settings.winScore, matchTime: this.settings.matchTime, mutators: true,
        teams: [tour.teams[0], Object.assign({}, opp, { cpu: tour.difficulty() })], ballSkin: HC.Cosmetics.ballSkin() };
    } else {
      opts = { mode: p.mode, court: p.court, winScore: this.settings.winScore, matchTime: this.settings.matchTime, word: p.word || 'HORSE', mutators: p.mode !== 'horse', teams: this.buildTeams(p), ballSkin: HC.Cosmetics.ballSkin() };
    }
    this.matchOpts = opts;
    this.launch();
  },

  launch() {
    const o = JSON.parse(JSON.stringify(this.matchOpts));
    if (this.matchOpts.mode === 'tournament') o.teams[0] = this.matchOpts.teams[0];
    this.match = o.mode === 'horse' ? new HC.HorseMatch(this, o) : new HC.Match(this, o);
    this.go('play');
  },

  // ---------------- adventure ----------------
  startAdventure(r, s) {
    this.humans = 1;
    const reg = HC.ADVENTURE[r], st = reg.stages[s];
    const team = HC.Save.data.advTeam && HC.Save.data.advTeam.length >= 2 ? HC.Save.data.advTeam.slice(0, 2) : ['pip', 'noodle'];
    const mine = { name: 'YOU', colors: HC.Cosmetics.jersey(), chars: team, cpu: null };
    const base = { adventure: { r, s }, court: reg.court, ballSkin: HC.Cosmetics.ballSkin() };
    if (st.boss) {
      const b = HC.bossById(st.boss);
      this.matchOpts = Object.assign(base, { mode: 'boss', boss: b.id, mutators: false, teams: [mine, { name: b.name, colors: b.colors, chars: [b.charId], cpu: b.cpu }] });
      this.go('bossIntro', { mode: 'adventure', bossId: b.id, region: r, stage: s });
    } else {
      this.matchOpts = Object.assign(base, { mode: 'adventure', winScore: st.win, mutators: !st.mutator, fixedMutator: st.mutator || null,
        teams: [mine, { name: st.team.name, colors: st.team.colors, chars: st.team.chars.slice(), cpu: st.diff }] });
      this.launch();
    }
  },

  restartMatch() { if (this.matchOpts) this.launch(); },
  quitToMenu() { this.match = null; this.humans = 1; HC.Audio.setCrowd(0.05); this.go('title'); },
  togglePause() { if (this.match && this.screen === 'play') { this.match.paused = !this.match.paused; this.focus = -1; } },

  startTournament(picks) {
    this.humans = 1;
    this.tournament = new HC.Tournament({ name: 'YOU', colors: this.teamColors(0), chars: picks.slice(0, 2), cpu: null });
    this.go('bracket', { mode: 'tournament', humans: 1 });
  },
  playTournamentMatch() { this.startMatch({ mode: 'tournament', humans: 1 }); },

  onMatchEnd(match, w) {
    if (match !== this.match || match.opts.demo) return;
    const sv = HC.Save.data;
    const r = { match, winner: w, humanWon: w === 0 };
    const coins = (n) => { if (n > 0) { HC.Cosmetics.addCoins(n); r.note = (r.note ? r.note + '   ' : '') + '🪙 +' + n; } };
    if (match.opts.adventure) {
      const { r: ri, s: si } = match.opts.adventure;
      const sum = HC.Adventure.complete(ri, si, match, w === 0);
      r.adv = sum;
      if (w === 0) HC.Audio.fanfare(); else HC.Audio.sad();
      const reg = HC.ADVENTURE[ri];
      const btns = [];
      if (sum.champion) btns.push(['FINALE!', '#ffb300', () => this.go('trophy', { title: 'LEGEND!', line: 'You conquered every world in Adventure mode!' }), '🏆']);
      else if (w === 0) {
        let nr = ri, ns = si + 1;
        if (ns >= reg.stages.length) { nr = ri + 1; ns = 0; }
        if (nr < HC.ADVENTURE.length) btns.push(['NEXT STAGE', HC.UIC.green, () => { HC.Adventure.prog().region = nr; this.go('stage', { mode: 'adventure', humans: 1, region: nr, stage: ns }); }, '▶']);
      }
      btns.push(['RETRY', HC.UIC.orange, () => this.startAdventure(ri, si), '↻']);
      btns.push(['MAP', HC.UIC.purple, () => { this.match = null; this.go('adventure'); }, '🗺️']);
      r.buttons = btns;
      this.go('results', r);
      return;
    }
    if (match.mode === 'tournament') {
      const tour = this.tournament, round = tour.round;
      const res = tour.record(w === 0, match.score);
      const rank = res === 'champion' ? 3 : res === 'next' ? round + 1 : round;
      if (rank > sv.bestRank) { sv.bestRank = rank; sv.best = HC.ROUND_NAMES[rank]; }
      coins(w === 0 ? 40 * (round + 1) : 10);
      if (res === 'champion') {
        sv.trophies++; HC.Save.save(); coins(200);
        r.note = '🏆 TOURNAMENT CHAMPIONS! 🏆';
        r.buttons = [['CONTINUE ▶', '#ffb300', () => this.go('trophy', { teamName: tour.teams[0].name })]];
      } else if (res === 'next') {
        HC.Save.save();
        r.note = 'Advancing! Pick an upgrade next.';
        r.buttons = [['CONTINUE ▶', '#2ecc71', () => this.go('upgrade', { choices: tour.upgradeChoices() })]];
      } else {
        HC.Save.save();
        r.note = 'Eliminated - finished as ' + HC.ROUND_NAMES[round];
        r.buttons = [['SEE BRACKET', '#2e86ff', () => this.go('bracket')], ['MAIN MENU', '#555', () => this.quitToMenu()]];
      }
    } else if (match.mode === 'boss') {
      if (w === 0) {
        const b = match.boss.def;
        const first = !sv.bosses[b.id];
        sv.bosses[b.id] = true; sv.unlocked[b.charId] = true; HC.Save.save();
        r.note = first ? '🔓 UNLOCKED: ' + HC.charById(b.charId).name + ' is now playable!' : 'Boss defeated again!';
        coins(first ? 150 : 50);
        HC.Audio.fanfare();
      } else HC.Audio.sad();
      r.buttons = [['REMATCH', '#2ecc71', () => this.restartMatch()], ['BOSS SELECT', '#c0392b', () => { this.match = null; this.go('bossSelect'); }], ['MAIN MENU', '#555', () => this.quitToMenu()]];
    } else {
      if (this.humans === 1) { if (w === 0) HC.Audio.fanfare(); else HC.Audio.sad(); } else HC.Audio.fanfare();
      coins(match.mode === 'horse' ? (w === 0 ? 20 : 5) : (w === 0 || this.humans === 2 ? 30 : 10));
    }
    this.go('results', r);
  },

  // ---------------- loop ----------------
  frame(now) {
    const dtReal = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    this.acc += dtReal * (this.screen === 'play' ? HC.Admin.get('speed', 1) : 1);
    const step = 1 / 60;
    let steps = 0;
    while (this.acc >= step && steps < 8) {
      this.acc -= step; steps++;
      this.t += step;
      for (let t = 0; t < 2; t++) { const b = this.rawButton(t); this.edge[t] = b && !this.prevBtn[t]; this.prevBtn[t] = b; }
      this.anyHitStep = this.anyHit; this.anyHit = false;
      try {
        if (this.screen === 'play' && this.match) this.match.step(step);
        else if (this.demo && this.screen === 'title') {
          HC.Audio.muted = true; this.demo.step(step); HC.Audio.muted = false;
          if (this.demo.state === 'over' || this.demo.time > 90) this.makeDemo();
        }
      } catch (e) { HC.Audio.muted = false; console.error(e); this.lastError = e; }
    }
    if (this.acc > 0.25) this.acc = 0;
    HC.Audio.update();
    this.render();
    requestAnimationFrame((t) => this.frame(t));
  },

  render() {
    const ctx = this.ctx, C = HC.CONFIG, d = this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.scale * d, 0, 0, this.scale * d, this.ox * d, this.oy * d);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, C.WIDTH, C.HEIGHT); ctx.clip();
    this.hits = [];
    try {
      if (this.screen === 'play' && this.match) this.match.render(ctx);
      else { const s = HC.Screens[this.screen]; if (s) s.draw(ctx, this, this.t); }
    } catch (e) { console.error(e); this.lastError = e; }
    // screen transition wipe
    if (this.transT > 0) {
      const k = this.transT, x = C.WIDTH * 1.25 * (1 - k) - 150;
      ctx.fillStyle = HC.UIC.pink; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(C.WIDTH + 200, 0); ctx.lineTo(C.WIDTH + 200, C.HEIGHT); ctx.lineTo(x - 150, C.HEIGHT); ctx.fill();
      ctx.fillStyle = HC.UIC.bg1; ctx.beginPath(); ctx.moveTo(x + 40, 0); ctx.lineTo(C.WIDTH + 200, 0); ctx.lineTo(C.WIDTH + 200, C.HEIGHT); ctx.lineTo(x - 110, C.HEIGHT); ctx.fill();
      this.transT = Math.max(0, this.transT - 0.09);
    }
    ctx.restore();
  },
};

window.addEventListener('load', () => {
  if (typeof Matter === 'undefined') {
    document.body.innerHTML = '<div style="color:#fff;font:20px sans-serif;padding:40px">Hoop Chaos needs Matter.js from a CDN. Check your internet connection and reload.</div>';
    return;
  }
  HC.App.init();
});
