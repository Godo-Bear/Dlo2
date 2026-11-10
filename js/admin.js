// Admin panel: Settings -> ADMIN PANEL, unlocked with the secret code.
// (This is a client-side game, so the panel is a fun cheat menu - not a security feature.)
window.HC = window.HC || {};

HC.Admin = {
  CODE_HASH: 'b6be2b85', // hash of the normalised code phrase
  hash(s) { let h = 2166136261; for (let r = 0; r < 64; r++) for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i) + r; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); },
  normalise(s) { return String(s || '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim(); },
  check(input) { return this.hash(this.normalise(input)) === this.CODE_HASH; },

  state() {
    const sv = HC.Save.data;
    sv.admin = Object.assign({ enabled: false, unlockAll: false, infiniteSpecial: false, debug: false, chaos: false, speed: 1, jump: 1, forceMut: null }, sv.admin || {});
    return sv.admin;
  },
  on() { return !!(HC.Save.data && HC.Save.data.admin && HC.Save.data.admin.enabled); },
  all() { return this.on() && !!HC.Save.data.admin.unlockAll; },
  get(k, def) { return this.on() ? (HC.Save.data.admin[k] != null ? HC.Save.data.admin[k] : def) : def; },

  open() {
    if (this.on()) { HC.App.go('admin'); return; }
    this.showModal();
  },

  // ---- code entry modal (HTML, so phone keyboards work) ----
  el: null,
  modalVisible() { return this.el && this.el.style.display !== 'none'; },
  showModal() {
    this.el = this.el || document.getElementById('adminModal');
    const box = this.el.querySelector('.login-box');
    box.innerHTML = `
      <h1>ADMIN <span>ACCESS</span></h1>
      <p class="kicker">Restricted</p>
      <p class="sub">Enter the access code to open the admin panel.</p>
      <form id="adminForm" autocomplete="off">
        <input id="adminCode" type="password" placeholder="Access code" maxlength="60" autocomplete="off" autocapitalize="off" spellcheck="false">
        <p class="err" id="adminErr"></p>
        <button type="submit" class="primary">Unlock</button>
        <button type="button" id="adminCancel">Cancel</button>
      </form>`;
    this.el.style.display = 'flex';
    const input = box.querySelector('#adminCode'), err = box.querySelector('#adminErr');
    setTimeout(() => input.focus(), 50);
    box.querySelector('#adminCancel').onclick = () => this.hideModal();
    box.querySelector('#adminForm').onsubmit = (e) => {
      e.preventDefault();
      if (this.check(input.value)) {
        this.state().enabled = true; HC.Save.save();
        HC.Audio.init(); HC.Audio.fanfare();
        this.hideModal(); HC.App.go('admin');
      } else {
        err.textContent = 'Access denied.'; HC.Audio.init(); HC.Audio.groan();
        box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
        input.select();
      }
    };
  },
  hideModal() { if (this.el) this.el.style.display = 'none'; },

  // ---- actions ----
  winMatch() {
    const m = HC.App.match; if (!m || m.over) return;
    m.paused = false;
    if (m.boss) m.boss.health = 0;
    else if (m.mode === 'horse') { m.letters[1] = m.word.length; m.horseLost = 1; }
    else m.score[0] = Math.max(m.score[0], m.winScore, m.score[1] + 1);
    m.finish(0);
  },
  maxAdventure() {
    const p = HC.Adventure.prog();
    HC.ADVENTURE.forEach((reg, r) => reg.stages.forEach((st, s) => {
      p.stars[HC.Adventure.sid(r, s)] = 3;
      if (st.reward.unlock) HC.Adventure.grant(st.reward.unlock);
      if (st.boss) { const b = HC.bossById(st.boss); HC.Save.data.bosses[b.id] = true; HC.Save.data.unlocked[b.charId] = true; }
    }));
    p.milestones = p.milestones || {};
    for (const ms of HC.ADV_MILESTONES) { p.milestones[ms.stars] = true; HC.Adventure.grant(ms.reward); }
    HC.Save.save();
  },
  beatBosses() { for (const b of HC.BOSSES) { HC.Save.data.bosses[b.id] = true; HC.Save.data.unlocked[b.charId] = true; } HC.Save.save(); },
  allGear() { for (const id in HC.BALL_SKINS) HC.Cosmetics.give('ball', id); for (const id in HC.JERSEYS) HC.Cosmetics.give('jersey', id); for (const c of HC.CHARACTERS) if (c.unlock) HC.Save.data.unlocked[c.id] = true; HC.Save.save(); },

  // physics debug overlay
  drawDebug(ctx, m) {
    ctx.save(); ctx.lineWidth = 1.5;
    for (const b of Matter.Composite.allBodies(m.world.engine.world)) {
      ctx.strokeStyle = b.isStatic ? 'rgba(0,255,120,0.8)' : b.hcBall ? 'rgba(255,220,0,0.9)' : 'rgba(255,60,200,0.8)';
      const parts = b.parts.length > 1 ? b.parts.slice(1) : [b];
      for (const p of parts) { ctx.beginPath(); p.vertices.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath(); ctx.stroke(); }
    }
    ctx.restore();
  },
};
