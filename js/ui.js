// UI: effects (particles, popups, shake), HUD, and all menu screens (immediate-mode canvas buttons).
window.HC = window.HC || {};

// ---------------------------------------------------------------- FX
HC.FX = class FX {
  constructor() { this.parts = []; this.pops = []; this.big = null; this.shakeAmt = 0; }
  burst(x, y, n, colors, speed, life) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * (speed || 4);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: life || 0.6, max: life || 0.6, color: HC.U.pick(colors), size: 3 + Math.random() * 4, g: 0.15 });
    }
  }
  confetti() {
    const cols = ['#f33', '#ff0', '#3f3', '#3cf', '#f3f', '#fff', '#f90'];
    for (let i = 0; i < 160; i++) this.parts.push({ x: Math.random() * HC.CONFIG.WIDTH, y: -20 - Math.random() * 300, vx: HC.U.rand(-1, 1), vy: HC.U.rand(1, 4), life: 4, max: 4, color: HC.U.pick(cols), size: 5 + Math.random() * 4, g: 0.03, rect: true, rot: Math.random() * 6 });
  }
  popup(text, x, y, color, size, life) { this.pops.push({ text, x, y, color: color || '#fff', size: size || 32, life: life || 1.3, max: life || 1.3 }); }
  bigText(text, color, life) { this.big = { text, color: color || '#fff', life: life || 1.8, max: life || 1.8 }; }
  shake(a) { if (HC.App && HC.App.settings.shake === false) return; this.shakeAmt = Math.max(this.shakeAmt, a); }
  shakeOffset() { const a = this.shakeAmt; return { x: (Math.random() - 0.5) * a, y: (Math.random() - 0.5) * a }; }
  update(dt) {
    this.shakeAmt *= 0.88; if (this.shakeAmt < 0.3) this.shakeAmt = 0;
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= dt; if (p.rot != null) p.rot += 0.1; }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const p of this.pops) { p.y -= 0.8; p.life -= dt; }
    this.pops = this.pops.filter(p => p.life > 0);
    if (this.big) { this.big.life -= dt; if (this.big.life <= 0) this.big = null; }
  }
  draw(ctx) {
    for (const p of this.parts) {
      ctx.globalAlpha = Math.min(1, p.life / p.max * 2); ctx.fillStyle = p.color;
      if (p.rect) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore(); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.max), 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    for (const p of this.pops) {
      const k = p.life / p.max, s = p.size * (k > 0.85 ? 1 + (k - 0.85) * 4 : 1);
      ctx.globalAlpha = Math.min(1, k * 2);
      HC.UI.text(ctx, p.text, p.x, p.y, s, p.color, 'center');
    }
    ctx.globalAlpha = 1;
  }
  drawScreen(ctx) {
    if (!this.big) return;
    const b = this.big, k = b.life / b.max, C = HC.CONFIG;
    const pop = k > 0.85 ? 1 + (k - 0.85) * 5 : 1;
    ctx.save(); ctx.globalAlpha = Math.min(1, k * 3);
    ctx.translate(C.WIDTH / 2, 200); ctx.scale(pop, pop); ctx.rotate(-0.04);
    let size = 64; ctx.font = 'bold ' + size + 'px "Arial Black", Impact, sans-serif';
    while (ctx.measureText(b.text).width > C.WIDTH - 80 && size > 24) { size -= 4; ctx.font = 'bold ' + size + 'px "Arial Black", Impact, sans-serif'; }
    HC.UI.text(ctx, b.text, 0, 0, size, b.color, 'center', 8);
    ctx.restore();
  }
};

// ---------------------------------------------------------------- UI helpers
HC.UI = {
  font: '"Arial Black", Impact, "Trebuchet MS", sans-serif',
  text(ctx, str, x, y, size, color, align, stroke) {
    ctx.font = 'bold ' + Math.round(size) + 'px ' + HC.UI.font;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    if (stroke !== 0) { ctx.strokeStyle = '#111'; ctx.lineWidth = stroke || Math.max(3, size / 7); ctx.strokeText(str, x, y); }
    ctx.fillStyle = color || '#fff'; ctx.fillText(str, x, y);
  },
  small(ctx, str, x, y, size, color, align) {
    ctx.font = (size || 16) + 'px "Trebuchet MS", sans-serif'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color || '#fff'; ctx.fillText(str, x, y);
  },
  // immediate-mode button: registers a hit area for this frame
  button(ctx, app, b) {
    const idx = app.hits.length;
    app.hits.push(b);
    const focused = !b.disabled && (app.focus === idx || (app.mouse.x > b.x && app.mouse.x < b.x + b.w && app.mouse.y > b.y && app.mouse.y < b.y + b.h));
    const col = b.disabled ? '#555' : (b.color || '#ff6a00');
    ctx.save();
    const s = focused ? 1.05 : 1;
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; HC.rr(ctx, -b.w / 2 + 5, -b.h / 2 + 7, b.w, b.h, 14); ctx.fill();
    ctx.fillStyle = col; HC.rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 14); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; HC.rr(ctx, -b.w / 2 + 4, -b.h / 2 + 4, b.w - 8, b.h * 0.42, 10); ctx.fill();
    ctx.strokeStyle = focused ? '#fff' : '#111'; ctx.lineWidth = focused ? 5 : 3; HC.rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 14); ctx.stroke();
    const fs = b.size || Math.min(30, b.h * 0.42);
    HC.UI.text(ctx, b.label, 0, b.sub ? -b.h * 0.13 : 2, fs, b.disabled ? '#aaa' : '#fff', 'center', 4);
    if (b.sub) HC.UI.small(ctx, b.sub, 0, b.h * 0.27, Math.max(12, fs * 0.5), b.disabled ? '#999' : '#fff', 'center');
    ctx.restore();
    return focused;
  },
  panel(ctx, x, y, w, h, col) {
    ctx.fillStyle = col || 'rgba(10,10,30,0.82)'; HC.rr(ctx, x, y, w, h, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; HC.rr(ctx, x, y, w, h, 18); ctx.stroke();
  },
  title(ctx, str, y, color) { HC.UI.text(ctx, str, HC.CONFIG.WIDTH / 2, y || 70, 54, color || '#ffde00', 'center', 8); },
  backButton(ctx, app, onClick) { HC.UI.button(ctx, app, { x: 30, y: 640, w: 160, h: 56, label: '◀ BACK', color: '#555', onClick, back: true }); },

  // ------------------------------------------------------------ HUD
  drawHUD(ctx, m, s) {
    const C = HC.CONFIG, U = HC.UI, W = C.WIDTH;
    const app = m.app;
    if (m.state === 'replay') {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 60); ctx.fillRect(0, C.HEIGHT - 60, W, 60);
      if (Math.floor(performance.now() / 400) % 2) { ctx.fillStyle = '#f22'; ctx.beginPath(); ctx.arc(40, 30, 10, 0, 7); ctx.fill(); }
      U.text(ctx, '▶ ' + m.replay.label, 60, 30, 30, '#fff', 'left', 0);
      U.small(ctx, 'SLOW-MO  •  press any key to skip', W - 20, C.HEIGHT - 30, 18, '#ccc', 'right');
      return;
    }
    // ---- scoreboard ----
    if (m.mode === 'horse') this.drawHorseHUD(ctx, m);
    else if (m.boss) this.drawBossHUD(ctx, m);
    else {
      const t0 = m.teams[0], t1 = m.teams[1];
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; HC.rr(ctx, W / 2 - 300, 8, 600, 66, 14); ctx.fill();
      ctx.fillStyle = t0.colors.main; HC.rr(ctx, W / 2 - 296, 12, 220, 58, 10); ctx.fill();
      ctx.fillStyle = t1.colors.main; HC.rr(ctx, W / 2 + 76, 12, 220, 58, 10); ctx.fill();
      U.text(ctx, t0.name, W / 2 - 286, 41, 20, '#fff', 'left', 3);
      U.text(ctx, t1.name, W / 2 + 286, 41, 20, '#fff', 'right', 3);
      U.text(ctx, String(m.score[0]), W / 2 - 100, 41, 40, '#fff', 'right', 5);
      U.text(ctx, String(m.score[1]), W / 2 + 100, 41, 40, '#fff', 'left', 5);
      const pt = Math.max(0, Math.ceil(m.pointTime));
      U.text(ctx, String(pt), W / 2, 34, 30, pt <= C.BUZZER_WINDOW ? '#f44' : '#ffde00', 'center', 4);
      U.small(ctx, 'FIRST TO ' + m.winScore, W / 2, 62, 13, '#ccc', 'center');
      if (m.mode === 'hotpotato') U.small(ctx, '💣 HOT POTATO', W / 2, 88, 16, '#f80', 'center');
    }
    // ---- mutator + court event chips ----
    let cx = 14;
    const chip = (icon, label, col, flash) => {
      ctx.font = 'bold 16px "Trebuchet MS", sans-serif';
      const w = ctx.measureText(label).width + 52;
      if (flash && Math.floor(performance.now() / 150) % 2) { ctx.fillStyle = '#f22'; } else ctx.fillStyle = col;
      HC.rr(ctx, cx, C.HEIGHT - 50, w, 38, 19); ctx.fill();
      ctx.font = '22px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(icon, cx + 8, C.HEIGHT - 31);
      U.small(ctx, label, cx + 40, C.HEIGHT - 31, 16, '#fff', 'left');
      cx += w + 10;
    };
    chip(m.court.icon, m.court.name, 'rgba(0,0,0,0.6)');
    if (m.activeMutator) chip(m.activeMutator.icon, m.activeMutator.name, 'rgba(60,0,90,0.75)');
    if (m.boss && m.boss.coachMut) chip(m.boss.coachMut.icon, 'Coach: ' + m.boss.coachMut.name, 'rgba(90,70,0,0.8)');
    if (m.evWarn) {
      const ce = m.court.event;
      chip(ce.icon, '⚠ ' + ce.name + ' in ' + Math.max(0, m.evTimer).toFixed(1), 'rgba(160,0,0,0.85)', true);
      // big flashing warning icon + arrow
      if (Math.floor(performance.now() / 200) % 2) {
        ctx.font = '64px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(ce.icon, W / 2, 140);
        U.text(ctx, '⚠ ' + ce.name.toUpperCase(), W / 2, 190, 26, '#ff4', 'center', 4);
        if (m.evWarn.dir) HC.drawArrow(ctx, W / 2 + m.evWarn.dir * 120, 140, m.evWarn.dir, '#ff4');
      }
    } else if (m.ev) chip(m.court.event.icon, m.court.event.name, 'rgba(200,90,0,0.85)');

    // ---- countdown ----
    if (m.state === 'countdown') {
      const n = Math.ceil(m.stateT / (C.COUNTDOWN / 3));
      const f = (m.stateT / (C.COUNTDOWN / 3)) % 1;
      ctx.save(); ctx.translate(W / 2, 300); ctx.scale(1 + f * 0.6, 1 + f * 0.6);
      U.text(ctx, String(Math.max(1, n)), 0, 0, 110, '#fff', 'center', 10); ctx.restore();
      if (m.pointsPlayed === 0 && m.mode !== 'horse') {
        const hint = m.cpus[1] ? 'HOLD W to wind up • RELEASE to jump • tap again in the air to SHOOT' : 'P1: W     P2: ↑     Hold = wind up • Release = jump • Tap in air = shoot';
        U.small(ctx, hint, W / 2, 400, 20, '#fff', 'center');
      }
    }
    // ---- mutator card pick ----
    if (m.state === 'cards' && m.cards) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, C.HEIGHT);
      const team = m.teams[m.cards.picker];
      U.text(ctx, team.name + ' PICKS A MUTATOR', W / 2, 120, 44, team.colors.main, 'center', 7);
      U.small(ctx, m.cpus[m.cards.picker] ? 'CPU is choosing...' : 'Press ' + (m.cards.picker === 0 ? 'W' : '↑') + ' on the highlighted card, or click / tap one', W / 2, 175, 20, '#fff', 'center');
      m.cardRects().forEach((r, i) => HC.drawCard(ctx, m.cards.list[i], r.x, r.y, r.w, r.h, i === m.cards.hl, m.cards.t));
      U.small(ctx, 'Lasts for the next point only', W / 2, 590, 16, '#aaa', 'center');
    }
    // pause button
    if (m.state !== 'over') U.button(ctx, app, { x: W - 70, y: 14, w: 54, h: 50, label: 'II', color: '#333', onClick: () => app.togglePause(), size: 22 });
    if (m.paused) this.drawPause(ctx, m);
  },

  drawBossHUD(ctx, m) {
    const C = HC.CONFIG, U = HC.UI, W = C.WIDTH, b = m.boss;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; HC.rr(ctx, W / 2 - 330, 8, 660, 80, 14); ctx.fill();
    U.text(ctx, b.def.name, W / 2, 26, 22, '#ff5555', 'center', 4);
    ctx.fillStyle = '#300'; HC.rr(ctx, W / 2 - 310, 42, 620, 22, 8); ctx.fill();
    const k = b.health / b.maxHealth;
    ctx.fillStyle = b.hurtT > 0 && Math.floor(performance.now() / 60) % 2 ? '#fff' : (k > 0.5 ? '#e33' : k > 0.25 ? '#f80' : '#ff0');
    HC.rr(ctx, W / 2 - 310, 42, 620 * k, 22, 8); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; HC.rr(ctx, W / 2 - 310, 42, 620, 22, 8); ctx.stroke();
    U.small(ctx, 'HP ' + b.health + ' / ' + b.maxHealth + '    •    BOSS SCORE ' + b.bossScore + ' / ' + C.BOSS_WIN_SCORE + '    •    shot clock ' + Math.max(0, Math.ceil(m.pointTime)), W / 2, 76, 14, '#ddd', 'center');
  },

  drawHorseHUD(ctx, m) {
    const C = HC.CONFIG, U = HC.UI, W = C.WIDTH;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; HC.rr(ctx, W / 2 - 360, 8, 720, 92, 14); ctx.fill();
    [0, 1].forEach(t => {
      const x = t === 0 ? W / 2 - 340 : W / 2 + 40, team = m.teams[t];
      const active = m.attempt && m.attempt.shooter === t;
      ctx.fillStyle = team.colors.main; HC.rr(ctx, x, 14, 300, 34, 8); ctx.fill();
      if (active) { ctx.strokeStyle = '#ff0'; ctx.lineWidth = 3; HC.rr(ctx, x, 14, 300, 34, 8); ctx.stroke(); }
      U.text(ctx, (active ? '▶ ' : '') + team.name, x + 10, 31, 18, '#fff', 'left', 3);
      for (let i = 0; i < m.word.length; i++) {
        const got = i < m.letters[t];
        U.text(ctx, m.word[i], x + 30 + i * 55, 72, 34, got ? '#ff3b3b' : 'rgba(255,255,255,0.25)', 'center', got ? 5 : 0);
      }
    });
    U.text(ctx, m.horseMsg || '', W / 2, 122, 22, '#ffde00', 'center', 4);
    if (m.attempt && !m.attempt.shot && m.state === 'play') U.small(ctx, 'Hop into position, then jump and tap again to shoot • ' + Math.max(0, Math.ceil(m.attempt.t)) + 's', W / 2, 150, 16, '#fff', 'center');
  },

  drawPause(ctx, m) {
    const C = HC.CONFIG, W = C.WIDTH, app = m.app;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, C.HEIGHT);
    HC.UI.title(ctx, 'PAUSED', 180);
    HC.UI.button(ctx, app, { x: W / 2 - 160, y: 260, w: 320, h: 66, label: 'RESUME', color: '#2ecc71', onClick: () => app.togglePause() });
    HC.UI.button(ctx, app, { x: W / 2 - 160, y: 345, w: 320, h: 66, label: 'RESTART', color: '#f39c12', onClick: () => app.restartMatch() });
    HC.UI.button(ctx, app, { x: W / 2 - 160, y: 430, w: 320, h: 66, label: 'QUIT TO MENU', color: '#e74c3c', onClick: () => app.quitToMenu() });
  },
};

// ---------------------------------------------------------------- SCREENS
HC.Screens = {};
const S = HC.Screens;
const W = () => HC.CONFIG.WIDTH, H = () => HC.CONFIG.HEIGHT;

function dim(ctx, a) { ctx.fillStyle = 'rgba(5,5,25,' + (a || 0.72) + ')'; ctx.fillRect(0, 0, W(), H()); }
function menuBg(ctx, app, t) {
  if (app.demo) { app.demo.render(ctx); dim(ctx, 0.62); }
  else { const g = ctx.createLinearGradient(0, 0, W(), H()); g.addColorStop(0, '#2b1055'); g.addColorStop(1, '#d53369'); ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H()); }
}

S.title = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    const word1 = 'HOOP', word2 = 'CHAOS', cols = ['#ff6a00', '#ffde00', '#ff3b3b', '#2ecc71', '#3fc1ff'];
    for (let i = 0; i < word1.length; i++) {
      const x = 330 + i * 80, y = 105 + Math.sin(t * 4 + i) * 10;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3 + i) * 0.12); HC.UI.text(ctx, word1[i], 0, 0, 96, cols[i % 5], 'center', 12); ctx.restore();
    }
    for (let i = 0; i < word2.length; i++) {
      const x = 680 + i * 72, y = 105 + Math.sin(t * 4 + i + 2) * 10;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3 + i + 2) * 0.15); HC.UI.text(ctx, word2[i], 0, 0, 96, cols[(i + 2) % 5], 'center', 12); ctx.restore();
    }
    HC.UI.small(ctx, 'one-button ragdoll basketball', W() / 2, 172, 22, '#fff', 'center');
    const sv = HC.Save.data, bossUnlocked = sv.trophies > 0 || app.settings.unlockAll;
    const items = [
      ['QUICK MATCH', '1P vs CPU or 2P local', '#ff6a00', () => app.go('players', { mode: 'quick' })],
      ['HORSE / TRICK', 'turn-based trick shots', '#9b59b6', () => app.go('players', { mode: 'horse' })],
      ['TOURNAMENT', '8-team ladder', '#2e86ff', () => app.go('chars', { mode: 'tournament', humans: 1 })],
      [bossUnlocked ? 'BOSS BATTLES' : '🔒 BOSS BATTLES', bossUnlocked ? 'giant bosses await' : 'win a tournament to unlock', '#c0392b', () => app.go('bossSelect'), !bossUnlocked],
      ['HOT POTATO', 'the ball is always a bomb', '#e67e22', () => app.go('players', { mode: 'hotpotato' })],
    ];
    items.forEach((it, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = i === 4 ? W() / 2 - 200 : (col === 0 ? W() / 2 - 415 : W() / 2 + 15), y = 215 + row * 100;
      HC.UI.button(ctx, app, { x, y, w: 400, h: 84, label: it[0], sub: it[1], color: it[2], onClick: it[3], disabled: it[4] });
    });
    HC.UI.button(ctx, app, { x: W() / 2 - 415, y: 530, w: 260, h: 58, label: 'SETTINGS', color: '#555', onClick: () => app.go('settings') });
    HC.UI.button(ctx, app, { x: W() / 2 - 130, y: 530, w: 260, h: 58, label: 'HOW TO PLAY', color: '#555', onClick: () => app.go('help'), size: 20 });
    HC.UI.button(ctx, app, { x: W() / 2 + 155, y: 530, w: 260, h: 58, label: 'ROSTER', color: '#555', onClick: () => app.go('roster') });
    const best = sv.best ? 'Best tournament: ' + sv.best : 'No tournament played yet';
    HC.UI.small(ctx, best + '   •   🏆 x' + sv.trophies + '   •   Bosses beaten: ' + Object.keys(sv.bosses).length + '/4', W() / 2, 625, 18, '#ffde00', 'center');
    HC.UI.small(ctx, 'P1 = W    P2 = ↑    Esc = pause', W() / 2, 660, 16, '#ccc', 'center');
  },
};

S.players = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    const p = app.params, name = { quick: 'QUICK MATCH', horse: 'HORSE / TRICK', hotpotato: 'HOT POTATO' }[p.mode];
    HC.UI.title(ctx, name, 80);
    HC.UI.button(ctx, app, { x: W() / 2 - 420, y: 170, w: 400, h: 120, label: '1 PLAYER', sub: 'You (W) vs CPU (' + app.settings.difficulty + ')', color: '#2e86ff', onClick: () => app.go('chars', Object.assign({}, p, { humans: 1 })) });
    HC.UI.button(ctx, app, { x: W() / 2 + 20, y: 170, w: 400, h: 120, label: '2 PLAYERS', sub: 'P1 = W   vs   P2 = ↑ (local)', color: '#e74c3c', onClick: () => app.go('chars', Object.assign({}, p, { humans: 2 })) });
    HC.UI.button(ctx, app, { x: W() / 2 - 200, y: 320, w: 400, h: 64, label: 'CPU: ' + app.settings.difficulty.toUpperCase(), color: '#8e44ad', onClick: () => app.cycleDifficulty() });
    if (p.mode === 'horse') {
      HC.UI.small(ctx, 'Word to spell:', W() / 2, 420, 22, '#fff', 'center');
      ['HORSE', 'PIG', 'HOOP'].forEach((wd, i) => HC.UI.button(ctx, app, { x: W() / 2 - 310 + i * 210, y: 445, w: 190, h: 64, label: wd, color: (p.word || 'HORSE') === wd ? '#2ecc71' : '#555', onClick: () => { p.word = wd; } }));
      HC.UI.small(ctx, 'Make a shot, then your rival must copy it from the same spot (same tricks too!). Miss a copy = get a letter.', W() / 2, 545, 17, '#ddd', 'center');
    }
    if (p.mode === 'hotpotato') HC.UI.small(ctx, 'The ball is ALWAYS a bomb. If it blows up in your hands, the other team gets ' + HC.CONFIG.BOMB_POINTS + ' points!', W() / 2, 440, 18, '#fff', 'center');
    HC.UI.backButton(ctx, app, () => app.go('title'));
  },
};

S.chars = {
  enter(app) { const p = app.params; p.pickTeam = 0; p.picks = [[], []]; p.need = p.mode === 'horse' ? 1 : 2; },
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    const p = app.params, team = p.pickTeam, picks = p.picks[team];
    const tc = app.teamColors(team, p);
    HC.UI.title(ctx, (p.humans === 2 ? (team === 0 ? 'PLAYER 1' : 'PLAYER 2') : 'CHOOSE YOUR') + (p.need === 2 ? ' - PICK 2' : ' - PICK 1'), 60, tc.main);
    const chars = HC.CHARACTERS;
    const cols = 5, cw = 210, ch = 200, x0 = W() / 2 - (cols * cw) / 2;
    chars.forEach((c, i) => {
      const x = x0 + (i % cols) * cw, y = 110 + Math.floor(i / cols) * (ch + 10);
      const locked = c.unlock && !HC.Save.data.unlocked[c.id] && !app.settings.unlockAll;
      const sel = picks.includes(c.id);
      const idx = app.hits.length;
      app.hits.push({ x: x + 5, y, w: cw - 10, h: ch, disabled: locked, onClick: () => { if (picks.length < p.need) { picks.push(c.id); HC.Audio.select(); } } });
      const hov = !locked && (app.focus === idx || (app.mouse.x > x && app.mouse.x < x + cw && app.mouse.y > y && app.mouse.y < y + ch));
      ctx.fillStyle = sel ? 'rgba(255,222,0,0.35)' : hov ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.5)'; HC.rr(ctx, x + 5, y, cw - 10, ch, 14); ctx.fill();
      if (hov || sel) { ctx.strokeStyle = sel ? '#ffde00' : '#fff'; ctx.lineWidth = 4; HC.rr(ctx, x + 5, y, cw - 10, ch, 14); ctx.stroke(); }
      if (locked) {
        ctx.globalAlpha = 0.25; HC.drawPortrait(ctx, c.id, x + cw / 2, y + 140, 120, { main: '#222', alt: '#444' }); ctx.globalAlpha = 1;
        HC.UI.text(ctx, '🔒', x + cw / 2, y + 80, 40, '#fff', 'center', 0);
        HC.UI.small(ctx, 'Beat the boss to unlock', x + cw / 2, y + 180, 13, '#aaa', 'center');
      } else {
        HC.drawPortrait(ctx, c.id, x + cw / 2, y + 140, 120, tc, hov ? 'happy' : 'neutral');
        HC.UI.small(ctx, c.perk, x + cw / 2, y + 182, 12, '#ddd', 'center');
      }
      HC.UI.text(ctx, c.name, x + cw / 2, y + 160, 18, '#fff', 'center', 3);
      const n = picks.filter(id => id === c.id).length;
      if (n) HC.UI.text(ctx, 'x' + n, x + cw - 30, y + 24, 24, '#ffde00', 'center', 4);
    });
    // slots
    HC.UI.small(ctx, 'Team: ' + (picks.map(id => HC.charById(id).name).join(' + ') || '—'), W() / 2, 556, 20, '#fff', 'center');
    HC.UI.button(ctx, app, { x: W() / 2 - 330, y: 590, w: 200, h: 56, label: 'RANDOM', color: '#8e44ad', onClick: () => { const pool = HC.CHARACTERS.filter(c => !c.unlock || HC.Save.data.unlocked[c.id] || app.settings.unlockAll); p.picks[team] = []; for (let i = 0; i < p.need; i++) p.picks[team].push(HC.U.pick(pool).id); } });
    HC.UI.button(ctx, app, { x: W() / 2 - 110, y: 590, w: 200, h: 56, label: 'CLEAR', color: '#555', onClick: () => { p.picks[team] = []; } });
    const ready = picks.length >= p.need;
    HC.UI.button(ctx, app, { x: W() / 2 + 110, y: 590, w: 220, h: 56, label: team === 0 && p.humans === 2 ? 'NEXT ▶' : 'READY ▶', color: '#2ecc71', disabled: !ready, onClick: () => {
      if (team === 0 && p.humans === 2) { p.pickTeam = 1; app.focus = -1; return; }
      if (p.mode === 'tournament') app.startTournament(p.picks[0]);
      else if (p.mode === 'boss') app.go('bossIntro', p);
      else app.go('court', p);
    } });
    HC.UI.backButton(ctx, app, () => { if (team === 1) p.pickTeam = 0; else app.go(p.mode === 'tournament' ? 'title' : p.mode === 'boss' ? 'bossSelect' : 'players', p); });
  },
};

S.court = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    const p = app.params;
    HC.UI.title(ctx, 'PICK A COURT', 60);
    const list = HC.COURTS.concat([{ id: 'random', name: 'Random', icon: '🎲', desc: 'Surprise me!' }]);
    const cols = 4, cw = 290, ch = 200, x0 = W() / 2 - (cols * cw) / 2;
    list.forEach((c, i) => {
      const x = x0 + (i % cols) * cw, y = 110 + Math.floor(i / cols) * (ch + 20);
      const idx = app.hits.length;
      app.hits.push({ x: x + 6, y, w: cw - 12, h: ch, onClick: () => { p.court = c.id === 'random' ? HC.U.pick(HC.COURTS).id : c.id; app.startMatch(p); } });
      const hov = app.focus === idx || (app.mouse.x > x && app.mouse.x < x + cw && app.mouse.y > y && app.mouse.y < y + ch);
      ctx.save();
      HC.rr(ctx, x + 6, y, cw - 12, ch, 14); ctx.clip();
      if (c.drawBg) { ctx.translate(x + 6, y); ctx.scale((cw - 12) / W(), ch / H() * 1.0); c.drawBg(ctx, null, t); ctx.fillStyle = c.floor.top; ctx.fillRect(0, HC.CONFIG.FLOOR_Y, W(), 200); }
      else { ctx.fillStyle = '#333'; ctx.fillRect(x, y, cw, ch); }
      ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x + 6, y + ch - 70, cw - 12, 70);
      HC.UI.text(ctx, c.icon + ' ' + c.name, x + cw / 2, y + ch - 50, 22, '#fff', 'center', 3);
      ctx.save(); ctx.font = '13px "Trebuchet MS", sans-serif'; ctx.fillStyle = '#ddd'; ctx.textAlign = 'center'; HC.wrapText(ctx, c.desc, x + cw / 2, y + ch - 26, cw - 30, 15); ctx.restore();
      ctx.strokeStyle = hov ? '#ffde00' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = hov ? 5 : 2; HC.rr(ctx, x + 6, y, cw - 12, ch, 14); ctx.stroke();
    });
    HC.UI.backButton(ctx, app, () => app.go('chars', p));
  },
};

S.results = {
  draw(ctx, app, t) {
    const r = app.params;
    menuBg(ctx, app, t);
    const m = r.match, w = r.winner;
    const humanWon = r.humanWon;
    let headline = w >= 0 ? m.teams[w].name + ' WIN!' : 'GAME OVER';
    if (m.boss) headline = w === 0 ? m.boss.def.name + ' DEFEATED!' : m.boss.def.name + ' WINS...';
    HC.UI.title(ctx, headline, 64, w >= 0 && !m.boss ? m.teams[w].colors.main : (humanWon ? '#2ecc71' : '#e74c3c'));
    if (m.mode === 'horse') HC.UI.small(ctx, 'Letters: ' + m.teams[0].name + ' "' + m.word.slice(0, m.letters[0]) + '"  •  ' + m.teams[1].name + ' "' + m.word.slice(0, m.letters[1]) + '"', W() / 2, 112, 20, '#fff', 'center');
    else if (m.boss) HC.UI.small(ctx, 'Boss HP left: ' + m.boss.health + ' / ' + m.boss.maxHealth, W() / 2, 112, 20, '#fff', 'center');
    else HC.UI.text(ctx, m.score[0] + '  -  ' + m.score[1], W() / 2, 116, 40, '#fff', 'center', 5);
    if (r.note) HC.UI.text(ctx, r.note, W() / 2, 160, 24, '#ffde00', 'center', 4);
    // stats table
    HC.UI.panel(ctx, 140, 185, 1000, 360);
    const cols = [['PLAYER', 170], ['PTS', 470], ['MADE/SHOTS', 590], ['STEALS', 730], ['TRICK SHOTS', 850]];
    cols.forEach(([h, x]) => HC.UI.small(ctx, h, x, 210, 16, '#aaa'));
    m.statsPlayers.slice().sort((a, b) => a.team - b.team).forEach((sp, i) => {
      const y = 250 + i * 70, team = m.teams[sp.team];
      HC.drawPortrait(ctx, sp.char, 195, y + 32, 60, team.colors, sp.team === w ? 'happy' : 'sad');
      HC.UI.text(ctx, sp.name, 230, y + 4, 20, team.colors.main, 'left', 3);
      HC.UI.small(ctx, team.name, 230, y + 26, 13, '#bbb');
      HC.UI.text(ctx, String(sp.stats.points), 480, y + 10, 24, '#fff', 'left', 3);
      HC.UI.small(ctx, sp.stats.makes + ' / ' + sp.stats.shots, 600, y + 10, 20, '#fff');
      HC.UI.small(ctx, String(sp.stats.steals), 750, y + 10, 20, '#fff');
      const tr = Object.entries(sp.stats.tricks).map(([k, n]) => HC.trickById(k).noun + ' x' + n).join(', ') || '—';
      ctx.save(); ctx.font = '15px "Trebuchet MS", sans-serif'; ctx.fillStyle = '#ffde00'; ctx.textAlign = 'left'; HC.wrapText(ctx, tr, 850, y + 4, 280, 17); ctx.restore();
    });
    const btns = r.buttons || [['REMATCH', '#2ecc71', () => app.restartMatch()], ['MAIN MENU', '#555', () => app.quitToMenu()]];
    btns.forEach((b, i) => HC.UI.button(ctx, app, { x: W() / 2 - btns.length * 140 + i * 280 + 10, y: 580, w: 260, h: 70, label: b[0], color: b[1], onClick: b[2] }));
  },
};

S.bracket = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    const tour = app.tournament;
    HC.UI.title(ctx, 'TOURNAMENT', 52);
    const names = ['QUARTER-FINALS', 'SEMI-FINALS', 'FINAL'];
    const colX = [70, 420, 770], boxW = 300, boxH = 30;
    for (let r = 0; r < 3; r++) {
      HC.UI.small(ctx, names[r], colX[r] + boxW / 2, 100, 18, r === tour.round ? '#ffde00' : '#aaa', 'center');
      const pairs = tour.rounds[r] || [];
      const n = r === 0 ? 4 : r === 1 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const span = 520 / n, cy = 125 + span * i + span / 2;
        const pr = pairs[i], res = tour.results[r] && tour.results[r][i];
        [0, 1].forEach(k => {
          const y = cy - boxH - 3 + k * (boxH + 6);
          const ti = pr ? pr[k] : null, team = ti != null ? tour.teams[ti] : null;
          const lost = res && res.winner !== ti, won = res && res.winner === ti;
          ctx.fillStyle = team ? (lost ? 'rgba(60,60,60,0.8)' : team.colors.main) : 'rgba(255,255,255,0.1)';
          HC.rr(ctx, colX[r], y, boxW, boxH, 8); ctx.fill();
          if (ti === 0) { ctx.strokeStyle = '#ffde00'; ctx.lineWidth = 3; HC.rr(ctx, colX[r], y, boxW, boxH, 8); ctx.stroke(); }
          if (team) {
            HC.UI.text(ctx, team.name, colX[r] + 10, y + boxH / 2 + 1, 16, lost ? '#999' : '#fff', 'left', 3);
            if (res) HC.UI.text(ctx, String(res.score[k]) + (won ? ' ✔' : ''), colX[r] + boxW - 10, y + boxH / 2 + 1, 16, '#fff', 'right', 3);
          } else HC.UI.small(ctx, 'TBD', colX[r] + 10, y + boxH / 2, 14, '#888');
        });
        if (r < 2) { ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(colX[r] + boxW, cy); ctx.lineTo(colX[r] + boxW + 25, cy); ctx.stroke(); }
      }
    }
    // champion slot
    const champ = tour.champion != null ? tour.teams[tour.champion] : null;
    ctx.font = '60px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🏆', 1170, 340);
    HC.UI.small(ctx, champ ? champ.name : 'CHAMPION', 1170, 400, 16, '#ffde00', 'center');
    const up = Object.entries(tour.upgradeNames).map(([k, n]) => k + (n > 1 ? ' x' + n : '')).join(', ');
    HC.UI.small(ctx, 'Your upgrades: ' + (up || 'none yet'), W() / 2, 618, 16, '#ddd', 'center');
    if (tour.done) {
      HC.UI.button(ctx, app, { x: W() / 2 - 150, y: 640, w: 300, h: 64, label: 'MAIN MENU', color: '#555', onClick: () => app.quitToMenu() });
    } else {
      const opp = tour.teams[tour.opponent()];
      HC.UI.button(ctx, app, { x: W() / 2 - 230, y: 640, w: 460, h: 64, label: 'PLAY ' + names[tour.round] + ' vs ' + opp.name, color: '#2ecc71', onClick: () => app.playTournamentMatch(), size: 20 });
      HC.UI.backButton(ctx, app, () => app.quitToMenu());
    }
  },
};

S.upgrade = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    HC.UI.title(ctx, 'PICK AN UPGRADE', 90);
    HC.UI.small(ctx, 'Permanent for the rest of the tournament', W() / 2, 140, 20, '#fff', 'center');
    const list = app.params.choices;
    list.forEach((u, i) => {
      const x = W() / 2 - 450 + i * 310;
      HC.UI.button(ctx, app, { x, y: 220, w: 280, h: 260, label: u.icon + ' ' + u.name, sub: u.desc, color: u.color, size: 24, onClick: () => { app.tournament.addUpgrade(u); HC.Audio.card(); app.go('bracket'); } });
    });
  },
};

S.trophy = {
  enter(app) { app.trophyFx = new HC.FX(); HC.Audio.fanfare(); HC.Audio.cheer(); },
  draw(ctx, app, t) {
    const g = ctx.createRadialGradient(W() / 2, 300, 50, W() / 2, 300, 700); g.addColorStop(0, '#5a3d00'); g.addColorStop(1, '#120a00'); ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H());
    for (let i = 0; i < 16; i++) { ctx.save(); ctx.translate(W() / 2, 320); ctx.rotate(t * 0.3 + i * Math.PI / 8); ctx.fillStyle = 'rgba(255,215,0,0.07)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -800); ctx.lineTo(60, -800); ctx.fill(); ctx.restore(); }
    if (Math.random() < 0.08) app.trophyFx.confetti();
    app.trophyFx.update(1 / 60);
    // trophy
    ctx.save(); ctx.translate(W() / 2, 330 + Math.sin(t * 2) * 6);
    const gold = ctx.createLinearGradient(-90, 0, 90, 0); gold.addColorStop(0, '#b8860b'); gold.addColorStop(0.5, '#ffe970'); gold.addColorStop(1, '#b8860b');
    ctx.fillStyle = gold; ctx.strokeStyle = '#5a3d00'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-90, -130); ctx.lineTo(90, -130); ctx.quadraticCurveTo(90, 10, 0, 30); ctx.quadraticCurveTo(-90, 10, -90, -130); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 14; ctx.strokeStyle = gold; ctx.beginPath(); ctx.arc(-95, -80, 40, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(95, -80, 40, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.fillStyle = gold; ctx.fillRect(-18, 25, 36, 60); ctx.fillRect(-70, 85, 140, 30);
    ctx.fillStyle = '#f07a1a'; ctx.beginPath(); ctx.arc(0, -60, 34, 0, 7); ctx.fill(); ctx.strokeStyle = '#3a1a05'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-34, -60); ctx.lineTo(34, -60); ctx.moveTo(0, -94); ctx.lineTo(0, -26); ctx.stroke();
    ctx.restore();
    app.trophyFx.draw(ctx);
    HC.UI.text(ctx, 'CHAMPIONS!', W() / 2, 90, 80, '#ffde00', 'center', 10);
    HC.UI.small(ctx, app.params.teamName + ' won the Hoop Chaos Tournament!', W() / 2, 150, 24, '#fff', 'center');
    HC.UI.text(ctx, '🔓 BOSS BATTLES UNLOCKED!', W() / 2, 530, 30, '#ff5555', 'center', 5);
    HC.UI.button(ctx, app, { x: W() / 2 - 330, y: 590, w: 300, h: 70, label: 'BOSS BATTLES', color: '#c0392b', onClick: () => app.go('bossSelect') });
    HC.UI.button(ctx, app, { x: W() / 2 + 30, y: 590, w: 300, h: 70, label: 'MAIN MENU', color: '#555', onClick: () => app.quitToMenu() });
  },
};

S.bossSelect = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    HC.UI.title(ctx, 'BOSS BATTLES', 60, '#ff5555');
    HC.UI.small(ctx, 'Your 2 players vs 1 giant boss. Score to drain its health before it scores ' + HC.CONFIG.BOSS_WIN_SCORE + '.', W() / 2, 105, 18, '#fff', 'center');
    const sv = HC.Save.data;
    HC.BOSSES.forEach((b, i) => {
      const x = W() / 2 - 600 + i * 300, y = 140;
      const locked = b.final && !app.settings.unlockAll && HC.BOSSES.filter(o => !o.final).some(o => !sv.bosses[o.id]);
      const beaten = sv.bosses[b.id];
      const idx = app.hits.length;
      app.hits.push({ x: x + 10, y, w: 280, h: 400, disabled: locked, onClick: () => app.go('chars', { mode: 'boss', humans: 1, bossId: b.id }) });
      const hov = !locked && (app.focus === idx || (app.mouse.x > x + 10 && app.mouse.x < x + 290 && app.mouse.y > y && app.mouse.y < y + 400));
      ctx.fillStyle = hov ? 'rgba(120,0,0,0.75)' : 'rgba(0,0,0,0.6)'; HC.rr(ctx, x + 10, y, 280, 400, 16); ctx.fill();
      ctx.strokeStyle = hov ? '#ff5555' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = hov ? 5 : 2; HC.rr(ctx, x + 10, y, 280, 400, 16); ctx.stroke();
      ctx.globalAlpha = locked ? 0.2 : 1;
      HC.drawPortrait(ctx, b.charId, x + 150, y + 270, 230, b.colors, hov ? 'happy' : 'neutral');
      ctx.globalAlpha = 1;
      HC.UI.text(ctx, b.name, x + 150, y + 300, 22, '#fff', 'center', 4);
      ctx.save(); ctx.font = '14px "Trebuchet MS", sans-serif'; ctx.fillStyle = '#ddd'; ctx.textAlign = 'center'; HC.wrapText(ctx, locked ? 'Beat the other 3 bosses to unlock the final boss.' : b.title, x + 150, y + 330, 250, 17); ctx.restore();
      if (locked) HC.UI.text(ctx, '🔒', x + 150, y + 150, 60, '#fff', 'center', 0);
      if (beaten) HC.UI.text(ctx, '✔ BEATEN', x + 150, y + 380, 20, '#2ecc71', 'center', 3);
    });
    HC.UI.backButton(ctx, app, () => app.quitToMenu());
  },
};

S.bossIntro = {
  enter(app) { HC.Audio.sting(); app.introT = 0; },
  draw(ctx, app, t) {
    app.introT += 1 / 60;
    const b = HC.bossById(app.params.bossId), k = app.introT;
    ctx.fillStyle = '#0a0000'; ctx.fillRect(0, 0, W(), H());
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#2a0000' : '#3a0505'; ctx.save(); ctx.translate(W() / 2, H() / 2); ctx.rotate(-0.2); ctx.fillRect(-900, -400 + i * 110 + ((k * 300) % 220) - 220, 1800, 55); ctx.restore(); }
    if (k > 0.7 && k < 0.9) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W(), H()); }
    const px = Math.min(1, k / 0.7);
    HC.drawPortrait(ctx, b.charId, W() * 0.3 - (1 - px) * 600, 640, 560, b.colors, 'happy');
    if (k > 0.7) {
      const s = Math.max(1, 3 - (k - 0.7) * 10);
      ctx.save(); ctx.translate(W() * 0.66, 260); ctx.scale(s, s); ctx.rotate(-0.06);
      HC.UI.text(ctx, b.name, 0, 0, 72, '#ff3b3b', 'center', 10); ctx.restore();
    }
    if (k > 1.2) {
      HC.UI.small(ctx, b.title, W() * 0.66, 340, 22, '#fff', 'center');
      HC.UI.small(ctx, 'Special: ' + b.specials.map(id => HC.SPECIALS[id].icon + ' ' + HC.SPECIALS[id].name).join('   '), W() * 0.66, 380, 20, '#ffde00', 'center');
      HC.UI.small(ctx, 'Watch for the ⚠ warning - then get out of the way!', W() * 0.66, 415, 16, '#ccc', 'center');
    }
    if (k > 1.6) HC.UI.button(ctx, app, { x: W() * 0.66 - 150, y: 480, w: 300, h: 76, label: 'FIGHT!', color: '#c0392b', onClick: () => { const p = app.params; p.court = b.court; app.startMatch(p); } });
  },
};

S.settings = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    HC.UI.title(ctx, 'SETTINGS', 70);
    const st = app.settings;
    const row = (y, label, value, minus, plus) => {
      HC.UI.text(ctx, label, W() / 2 - 300, y + 28, 26, '#fff', 'left', 4);
      HC.UI.button(ctx, app, { x: W() / 2 + 60, y, w: 60, h: 56, label: '-', color: '#555', onClick: minus });
      HC.UI.text(ctx, value, W() / 2 + 200, y + 28, 26, '#ffde00', 'center', 4);
      HC.UI.button(ctx, app, { x: W() / 2 + 280, y, w: 60, h: 56, label: '+', color: '#555', onClick: plus });
    };
    row(140, 'VOLUME', Math.round(st.volume * 100) + '%', () => app.setSetting('volume', Math.max(0, +(st.volume - 0.1).toFixed(2))), () => app.setSetting('volume', Math.min(1, +(st.volume + 0.1).toFixed(2))));
    row(210, 'POINTS TO WIN', String(st.winScore), () => app.setSetting('winScore', Math.max(2, st.winScore - 1)), () => app.setSetting('winScore', Math.min(30, st.winScore + 1)));
    const diffs = ['easy', 'medium', 'hard'];
    row(280, 'CPU DIFFICULTY', st.difficulty.toUpperCase(), () => app.setSetting('difficulty', diffs[Math.max(0, diffs.indexOf(st.difficulty) - 1)]), () => app.setSetting('difficulty', diffs[Math.min(2, diffs.indexOf(st.difficulty) + 1)]));
    row(350, 'SCREEN SHAKE', st.shake ? 'ON' : 'OFF', () => app.setSetting('shake', !st.shake), () => app.setSetting('shake', !st.shake));
    row(420, 'UNLOCK ALL (testing)', st.unlockAll ? 'ON' : 'OFF', () => app.setSetting('unlockAll', !st.unlockAll), () => app.setSetting('unlockAll', !st.unlockAll));
    HC.UI.button(ctx, app, { x: W() / 2 - 150, y: 510, w: 300, h: 56, label: 'RESET SAVE DATA', color: '#c0392b', size: 18, onClick: () => { if (confirm('Erase all progress?')) HC.Save.reset(); } });
    HC.UI.backButton(ctx, app, () => app.go('title'));
  },
};

S.help = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    HC.UI.title(ctx, 'HOW TO PLAY', 60);
    HC.UI.panel(ctx, 120, 100, 1040, 520);
    const lines = [
      ['ONE BUTTON PER TEAM', '#ffde00'], ['Player 1 = W      Player 2 = ↑ (Up Arrow)      Touch: big buttons at the bottom', '#fff'],
      ['HOLD to crouch & wind up. RELEASE to jump and swing your arms.', '#fff'],
      ['Holding the ball? Jump, then TAP again near the top of the jump to SHOOT.', '#fff'],
      ['Touch the ball with a hand to grab it. Swipe an opponent\'s ball to steal it.', '#fff'],
      ['SCORING', '#ffde00'], ['2 points inside the line, 3 outside. TRICK SHOTS add +1 each:', '#fff'],
      ['Bank Shot • Dunk • Header • Full-Court • Upside-Down • Buzzer Beater • Off-the-Rim', '#5fd'],
      ['MUTATORS', '#ffde00'], ['After each basket, the team that got scored on picks a mutator card for the next point.', '#fff'],
      ['LIVING COURTS', '#ffde00'], ['Every court has a live event. Watch for the flashing ⚠ warning 2 seconds before it hits.', '#fff'],
      ['Esc / P = pause', '#aaa'],
    ];
    lines.forEach(([s, c], i) => { if (c === '#ffde00') HC.UI.text(ctx, s, 160, 135 + i * 37, 22, c, 'left', 3); else HC.UI.small(ctx, s, 160, 135 + i * 37, 19, c); });
    HC.UI.backButton(ctx, app, () => app.go('title'));
  },
};

S.roster = {
  draw(ctx, app, t) {
    menuBg(ctx, app, t);
    HC.UI.title(ctx, 'ROSTER', 60);
    HC.CHARACTERS.forEach((c, i) => {
      const x = 130 + (i % 5) * 230, y = 110 + Math.floor(i / 5) * 260;
      const locked = c.unlock && !HC.Save.data.unlocked[c.id] && !app.settings.unlockAll;
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; HC.rr(ctx, x - 100, y, 200, 240, 14); ctx.fill();
      ctx.globalAlpha = locked ? 0.2 : 1;
      HC.drawPortrait(ctx, c.id, x, y + 170, 150, { main: '#2e86ff', alt: '#fff' }, 'happy');
      ctx.globalAlpha = 1;
      HC.UI.text(ctx, locked ? '???' : c.name, x, y + 195, 18, '#fff', 'center', 3);
      ctx.save(); ctx.font = '13px "Trebuchet MS", sans-serif'; ctx.fillStyle = '#ddd'; ctx.textAlign = 'center'; HC.wrapText(ctx, locked ? 'Beat ' + HC.bossById(c.unlock).name + ' to unlock' : c.perk, x, y + 218, 180, 15); ctx.restore();
      if (locked) HC.UI.text(ctx, '🔒', x, y + 90, 44, '#fff', 'center', 0);
    });
    HC.UI.backButton(ctx, app, () => app.go('title'));
  },
};
