// UI: effects, HUD and every menu screen (immediate-mode canvas UI with a shared design system).
window.HC = window.HC || {};

// ================================================================ FX
HC.FX = class FX {
  constructor() { this.parts = []; this.pops = []; this.big = null; this.shakeAmt = 0; this.rings = []; }
  burst(x, y, n, colors, speed, life) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * (speed || 4);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: life || 0.6, max: life || 0.6, color: HC.U.pick(colors), size: 3 + Math.random() * 4, g: 0.15 });
    }
  }
  ring(x, y, color) { this.rings.push({ x, y, color: color || '#fff', t: 0 }); }
  confetti() {
    const cols = ['#ff3d7f', '#ffd23f', '#2ee6a6', '#38d6ff', '#c77dff', '#fff', '#ff7a1a'];
    for (let i = 0; i < 160; i++) this.parts.push({ x: Math.random() * HC.CONFIG.WIDTH, y: -20 - Math.random() * 300, vx: HC.U.rand(-1, 1), vy: HC.U.rand(1, 4), life: 4, max: 4, color: HC.U.pick(cols), size: 5 + Math.random() * 5, g: 0.03, rect: true, rot: Math.random() * 6 });
  }
  popup(text, x, y, color, size, life) { this.pops.push({ text, x, y, color: color || '#fff', size: size || 32, life: life || 1.3, max: life || 1.3 }); }
  bigText(text, color, life) { this.big = { text, color: color || '#fff', life: life || 1.8, max: life || 1.8 }; }
  shake(a) { if (HC.App && HC.App.settings && HC.App.settings.shake === false) return; this.shakeAmt = Math.max(this.shakeAmt, a); }
  shakeOffset() { const a = this.shakeAmt; return { x: (Math.random() - 0.5) * a, y: (Math.random() - 0.5) * a }; }
  update(dt) {
    this.shakeAmt *= 0.88; if (this.shakeAmt < 0.3) this.shakeAmt = 0;
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= dt; if (p.rot != null) p.rot += 0.1; }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const p of this.pops) { p.y -= 0.8; p.life -= dt; }
    this.pops = this.pops.filter(p => p.life > 0);
    for (const r of this.rings) r.t += dt;
    this.rings = this.rings.filter(r => r.t < 0.6);
    if (this.big) { this.big.life -= dt; if (this.big.life <= 0) this.big = null; }
  }
  draw(ctx) {
    for (const r of this.rings) { ctx.strokeStyle = r.color; ctx.globalAlpha = 1 - r.t / 0.6; ctx.lineWidth = 8 * (1 - r.t / 0.6) + 1; ctx.beginPath(); ctx.ellipse(r.x, r.y, 40 + r.t * 520, 12 + r.t * 90, 0, 0, 7); ctx.stroke(); }
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
    ctx.translate(C.WIDTH / 2, 210); ctx.scale(pop, pop); ctx.rotate(-0.04);
    let size = 62; ctx.font = size + 'px ' + HC.FONT_DISPLAY;
    while (ctx.measureText(b.text).width > C.WIDTH - 100 && size > 24) { size -= 4; ctx.font = size + 'px ' + HC.FONT_DISPLAY; }
    HC.UI.text(ctx, b.text, 0, 0, size, b.color, 'center', 9);
    ctx.restore();
  }
};

// ================================================================ design system
const UIC = { ink: '#1b1230', bg1: '#140a2e', bg2: '#3a0f5c', orange: '#ff7a1a', yellow: '#ffd23f', pink: '#ff3d7f', cyan: '#38d6ff', green: '#2ee6a6', purple: '#8b5cf6', red: '#ff4d5e', grey: '#5d5873' };
HC.UIC = UIC;

HC.UI = {
  // display text (Luckiest Guy) with chunky outline + drop shadow
  text(ctx, str, x, y, size, color, align, stroke) {
    ctx.font = Math.round(size) + 'px ' + HC.FONT_DISPLAY;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    str = String(str);
    const yy = y + size * 0.06;
    if (stroke !== 0) {
      const sw = stroke || Math.max(3, size / 6.5);
      ctx.strokeStyle = UIC.ink; ctx.lineWidth = sw;
      ctx.fillStyle = UIC.ink; ctx.fillText(str, x, yy + sw * 0.55); ctx.strokeText(str, x, yy + sw * 0.55);
      ctx.strokeText(str, x, yy);
    }
    ctx.fillStyle = color || '#fff'; ctx.fillText(str, x, yy);
  },
  // display text shrunk to fit a max width
  fitText(ctx, str, x, y, size, maxW, color, align) {
    let s = size; ctx.font = s + 'px ' + HC.FONT_DISPLAY;
    while (ctx.measureText(str).width > maxW && s > 10) { s -= 1; ctx.font = s + 'px ' + HC.FONT_DISPLAY; }
    this.text(ctx, str, x, y, s, color, align, Math.max(3, s / 5));
  },
  // body text (Nunito)
  small(ctx, str, x, y, size, color, align, weight) {
    ctx.font = (weight || 700) + ' ' + Math.round(size || 16) + 'px ' + HC.FONT_BODY; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color || '#fff'; ctx.fillText(String(str), x, y);
  },
  wrap(ctx, str, x, y, maxW, lh, size, color, align, weight) {
    ctx.font = (weight || 700) + ' ' + Math.round(size || 15) + 'px ' + HC.FONT_BODY; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color || '#fff'; HC.wrapText(ctx, str, x, y, maxW, lh);
  },
  hover(app, r) { return app.mouse.x > r.x && app.mouse.x < r.x + r.w && app.mouse.y > r.y && app.mouse.y < r.y + r.h; },
  // register a custom clickable area; returns whether it's hovered/focused
  hit(app, r) { const idx = app.hits.length; app.hits.push(r); return !r.disabled && (app.focus === idx || this.hover(app, r)); },

  // chunky 3D button
  button(ctx, app, b) {
    const on = this.hit(app, b);
    const pressed = on && app.mouseDown;
    const base = b.disabled ? '#4a4560' : (b.color || UIC.orange);
    const lip = 6, lift = pressed ? -lip + 2 : on ? 3 : 0;
    const r = Math.min(18, b.h * 0.32);
    ctx.save(); ctx.translate(b.x, b.y);
    if (b.ghost) {
      ctx.fillStyle = on ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'; HC.rr(ctx, 0, 0, b.w, b.h, r); ctx.fill();
      ctx.strokeStyle = on ? '#fff' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; HC.rr(ctx, 0, 0, b.w, b.h, r); ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; HC.rr(ctx, 3, lip + 4, b.w, b.h, r); ctx.fill();
      ctx.fillStyle = HC.shade(base, -0.45); HC.rr(ctx, 0, lip, b.w, b.h, r); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = UIC.ink; ctx.stroke();
      ctx.translate(0, -lift);
      const g = ctx.createLinearGradient(0, 0, 0, b.h); g.addColorStop(0, HC.shade(base, on ? 0.32 : 0.2)); g.addColorStop(0.55, on ? HC.shade(base, 0.08) : base); g.addColorStop(1, HC.shade(base, -0.12));
      ctx.fillStyle = g; HC.rr(ctx, 0, 0, b.w, b.h, r); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; HC.rr(ctx, 6, 4, b.w - 12, b.h * 0.36, r * 0.7); ctx.fill();
      if (on && !b.disabled) { ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2; HC.rr(ctx, 3, 3, b.w - 6, b.h - 6, r - 2); ctx.stroke(); }
    }
    let cx = b.w / 2, align = 'center';
    if (b.icon) {
      const ir = Math.min(b.h * 0.34, 26), ix = b.iconOnly ? b.w / 2 : 12 + ir;
      if (!b.ghost && !b.iconOnly) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.arc(ix, b.h / 2, ir, 0, 7); ctx.fill(); }
      ctx.font = Math.round(ir * 1.15) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
      ctx.fillText(b.icon, ix, b.h / 2 + 2);
      if (!b.iconOnly) { cx = ix + ir + 10; align = 'left'; }
    }
    if (!b.iconOnly) {
      const fs = b.size || Math.min(30, b.h * 0.4);
      ctx.font = fs + 'px ' + HC.FONT_DISPLAY;
      let size = fs; const maxW = align === 'left' ? b.w - cx - 10 : b.w - 20;
      while (ctx.measureText(b.label).width > maxW && size > 12) { size -= 1; ctx.font = size + 'px ' + HC.FONT_DISPLAY; }
      this.text(ctx, b.label, cx, b.sub ? b.h * 0.38 : b.h / 2, size, b.disabled ? '#a29bb8' : '#fff', align, Math.max(3, size / 7));
      if (b.sub) this.small(ctx, b.sub, cx, b.h * 0.72, Math.max(11, Math.min(15, size * 0.5)), b.disabled ? '#a29bb8' : 'rgba(255,255,255,0.88)', align, 700);
    }
    if (b.badge) {
      ctx.save(); ctx.translate(b.w - 18, 0); ctx.rotate(0.18);
      ctx.fillStyle = UIC.pink; HC.rr(ctx, -30, -12, 60, 24, 12); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 2.5; ctx.stroke();
      this.text(ctx, b.badge, 0, 0, 14, '#fff', 'center', 3); ctx.restore();
    }
    ctx.restore();
    return on;
  },

  panel(ctx, x, y, w, h, opts) {
    opts = opts || {};
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; HC.rr(ctx, x + 4, y + 7, w, h, 20); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, opts.top || 'rgba(58,32,110,0.92)'); g.addColorStop(1, opts.bottom || 'rgba(26,14,58,0.94)');
    ctx.fillStyle = g; HC.rr(ctx, x, y, w, h, 20); ctx.fill();
    ctx.strokeStyle = opts.border || 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; HC.rr(ctx, x + 1, y + 1, w - 2, h - 2, 19); ctx.stroke();
    ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; HC.rr(ctx, x, y, w, h, 20); ctx.stroke();
    ctx.restore();
  },

  chip(ctx, x, y, icon, text, color, alignRight) {
    ctx.font = '800 17px ' + HC.FONT_BODY;
    const w = ctx.measureText(text).width + (icon ? 46 : 24);
    const xx = alignRight ? x - w : x;
    ctx.fillStyle = 'rgba(10,5,30,0.7)'; HC.rr(ctx, xx, y, w, 36, 18); ctx.fill();
    ctx.strokeStyle = color || 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    if (icon) { ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(icon, xx + 20, y + 19); }
    this.small(ctx, text, xx + (icon ? 36 : 12), y + 18, 17, '#fff', 'left', 800);
    return w;
  },

  wallet(ctx, x, y) {
    const sv = HC.Save.data;
    let w = this.chip(ctx, x, y, '🪙', String(sv.coins || 0), UIC.yellow, true);
    w += 8 + this.chip(ctx, x - w - 8, y, '⭐', HC.Adventure.totalStars() + '/' + HC.Adventure.maxStars(), UIC.yellow, true);
    return w;
  },

  star(ctx, x, y, r, filled, color) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.48 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath();
    ctx.fillStyle = filled ? (color || UIC.yellow) : 'rgba(255,255,255,0.15)'; ctx.fill();
    ctx.strokeStyle = UIC.ink; ctx.lineWidth = Math.max(2, r * 0.18); ctx.stroke();
    if (filled) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.25, r * 0.18, 0, 7); ctx.fill(); }
    ctx.restore();
  },

  bar(ctx, x, y, w, h, v, color, bg) {
    ctx.fillStyle = bg || 'rgba(0,0,0,0.4)'; HC.rr(ctx, x, y, w, h, h / 2); ctx.fill();
    if (v > 0) { ctx.fillStyle = color || UIC.green; HC.rr(ctx, x, y, Math.max(h, w * Math.min(1, v)), h, h / 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.3)'; HC.rr(ctx, x + 2, y + 1, Math.max(0, w * Math.min(1, v) - 4), h * 0.35, h / 4); ctx.fill(); }
  },

  // animated menu background
  bg(ctx, t, accent) {
    const W = HC.CONFIG.WIDTH, H = HC.CONFIG.HEIGHT;
    const g = ctx.createRadialGradient(W / 2, -100, 50, W / 2, H / 2, 950);
    g.addColorStop(0, accent ? HC.shade(accent, -0.35) : '#5b1f8a'); g.addColorStop(0.55, UIC.bg2); g.addColorStop(1, UIC.bg1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, -60); ctx.rotate(t * 0.05);
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let i = 0; i < 14; i++) { ctx.rotate(Math.PI / 7); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, 1300); ctx.lineTo(90, 1300); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(W / 2, H + 120, 330, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2, H + 120, 120, 0, 7); ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const x = (i * 157 + Math.sin(t * 0.3 + i) * 40) % W, y = H + 60 - ((t * (18 + i * 4) + i * 140) % (H + 160)), r = 14 + (i % 4) * 9;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.4 + i); ctx.globalAlpha = 0.09;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke(); ctx.restore();
    }
    const v = ctx.createLinearGradient(0, H - 200, 0, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = v; ctx.fillRect(0, H - 200, W, 200);
  },

  // screen header: title + back button + wallet
  header(ctx, app, title, onBack, opts) {
    opts = opts || {};
    const W = HC.CONFIG.WIDTH;
    if (onBack) this.button(ctx, app, { x: 22, y: 18, w: 120, h: 50, label: 'BACK', icon: '◀', color: UIC.grey, onClick: onBack, back: true, size: 20 });
    this.text(ctx, title, W / 2, 46, opts.size || 48, opts.color || UIC.yellow, 'center', 8);
    if (opts.sub) this.small(ctx, opts.sub, W / 2, 88, 17, 'rgba(255,255,255,0.85)', 'center', 700);
    if (opts.wallet !== false) this.wallet(ctx, W - 22, 24);
  },

  clock(sec) { sec = Math.ceil(Math.max(0, sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); },
  timeLabel(min) { return min > 0 ? min + ' MIN' : 'OFF'; },
  title(ctx, str, y, color) { this.text(ctx, str, HC.CONFIG.WIDTH / 2, y || 70, 50, color || UIC.yellow, 'center', 8); },
  backButton(ctx, app, onClick) { this.button(ctx, app, { x: 22, y: 18, w: 120, h: 50, label: 'BACK', icon: '◀', color: UIC.grey, onClick, back: true, size: 20 }); },

  // ------------------------------------------------------------ HUD
  drawHUD(ctx, m, s) {
    const C = HC.CONFIG, U = HC.UI, W = C.WIDTH;
    const app = m.app;
    if (m.state === 'replay') {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 56); ctx.fillRect(0, C.HEIGHT - 56, W, 56);
      if (Math.floor(performance.now() / 400) % 2) { ctx.fillStyle = UIC.red; ctx.beginPath(); ctx.arc(38, 28, 9, 0, 7); ctx.fill(); }
      U.text(ctx, m.replay.label, 58, 28, 28, '#fff', 'left', 0);
      U.small(ctx, 'SLOW-MO  •  press any key to skip', W - 20, C.HEIGHT - 28, 16, '#bbb', 'right');
      return;
    }
    if (m.mode === 'horse') this.drawHorseHUD(ctx, m);
    else if (m.boss) this.drawBossHUD(ctx, m);
    else this.drawScoreboard(ctx, m);
    // special meters
    if (m.abilitiesOn && m.mode !== 'horse') {
      const meter = (t, x, w, alignRight) => {
        const ready = m.specialReady(t), v = ready ? 1 : m.special[t];
        const y = m.boss ? 98 : 86;
        const col = ready ? (Math.floor(performance.now() / 160) % 2 ? UIC.pink : UIC.yellow) : UIC.cyan;
        U.bar(ctx, x, y, w, 12, v, col, 'rgba(10,5,30,0.7)');
        ctx.strokeStyle = UIC.ink; ctx.lineWidth = 2; HC.rr(ctx, x, y, w, 12, 6); ctx.stroke();
        const key = t === 0 ? 'W' : '↑';
        const label = ready ? (m.cpus[t] ? '⚡ SPECIAL READY' : '⚡ SPECIAL READY - HOLD ' + key + '!') : '⚡ SPECIAL';
        U.small(ctx, label, alignRight ? x + w : x, y + 24, 13, ready ? UIC.yellow : 'rgba(255,255,255,0.7)', alignRight ? 'right' : 'left', 900);
      };
      meter(0, W / 2 - 300, 220, false);
      if (!m.boss) meter(1, W / 2 + 80, 220, true);
    }
    // chips
    let cx = 14;
    const chip = (icon, label, col, flash) => {
      const c = flash && Math.floor(performance.now() / 150) % 2 ? UIC.red : col;
      cx += U.chip(ctx, cx, C.HEIGHT - 50, icon, label, c) + 8;
    };
    chip(m.court.icon, m.court.name);
    if (m.fixedMutator) chip(m.fixedMutator.icon, m.fixedMutator.name, UIC.purple);
    if (m.activeMutator) chip(m.activeMutator.icon, m.activeMutator.name, UIC.purple);
    if (m.boss && m.boss.coachMut) chip(m.boss.coachMut.icon, 'Coach: ' + m.boss.coachMut.name, UIC.yellow);
    if (m.evWarn) {
      const ce = m.court.event;
      chip(ce.icon, '⚠ ' + ce.name + ' in ' + Math.max(0, m.evTimer).toFixed(1), UIC.red, true);
      if (Math.floor(performance.now() / 200) % 2) {
        ctx.font = '64px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ce.icon, W / 2, 160);
        U.text(ctx, '⚠ ' + ce.name.toUpperCase(), W / 2, 210, 28, UIC.yellow, 'center', 5);
        if (m.evWarn.dir) HC.drawArrow(ctx, W / 2 + m.evWarn.dir * 130, 160, m.evWarn.dir, UIC.yellow);
      }
    } else if (m.ev) chip(m.court.event.icon, m.court.event.name, UIC.orange);

    // countdown
    if (m.state === 'countdown') {
      const n = Math.max(1, Math.ceil(m.stateT / (C.COUNTDOWN / 3)));
      const f = (m.stateT / (C.COUNTDOWN / 3)) % 1;
      ctx.save(); ctx.translate(W / 2, 310);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 80, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke();
      ctx.scale(1 + f * 0.4, 1 + f * 0.4); U.text(ctx, String(n), 0, 0, 110, n === 1 ? UIC.yellow : '#fff', 'center', 12); ctx.restore();
      if (m.pointsPlayed === 0 && m.mode !== 'horse' && !m.opts.demo) {
        const hint = m.cpus[1] ? 'HOLD W to wind up  •  RELEASE to jump  •  TAP in the air to SHOOT' : 'P1: W     P2: ↑     Hold = wind up  •  Release = jump  •  Tap in air = shoot';
        ctx.fillStyle = 'rgba(10,5,30,0.7)'; HC.rr(ctx, W / 2 - 400, 420, 800, 64, 20); ctx.fill();
        U.small(ctx, hint, W / 2, 440, 18, '#fff', 'center', 800);
        U.small(ctx, 'When ⚡ SPECIAL is full: keep holding past a full wind-up, then release!', W / 2, 466, 15, UIC.yellow, 'center', 800);
      }
    }
    // mutator card pick
    if (m.state === 'cards' && m.cards) {
      ctx.fillStyle = 'rgba(10,5,30,0.78)'; ctx.fillRect(0, 0, W, C.HEIGHT);
      const team = m.teams[m.cards.picker];
      U.text(ctx, team.name + ' PICKS A MUTATOR', W / 2, 120, 44, team.colors.main, 'center', 8);
      U.small(ctx, m.cpus[m.cards.picker] ? 'CPU is choosing...' : 'Press ' + (m.cards.picker === 0 ? 'W' : '↑') + ' on the glowing card, or click / tap one', W / 2, 172, 19, '#fff', 'center', 800);
      m.cardRects().forEach((r, i) => HC.drawCard(ctx, m.cards.list[i], r.x, r.y, r.w, r.h, i === m.cards.hl, m.cards.t));
      U.small(ctx, 'Lasts for the next point only', W / 2, 590, 16, 'rgba(255,255,255,0.6)', 'center');
    }
    if (m.state !== 'over') U.button(ctx, app, { x: W - 66, y: 12, w: 52, h: 46, label: '', icon: '⏸', iconOnly: true, color: UIC.grey, onClick: () => app.togglePause() });
    if (m.paused) this.drawPause(ctx, m);
  },

  drawScoreboard(ctx, m) {
    const C = HC.CONFIG, U = this, W = C.WIDTH;
    const t0 = m.teams[0], t1 = m.teams[1];
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; HC.rr(ctx, W / 2 - 316, 12, 640, 66, 22); ctx.fill();
    const side = (team, x, dir) => {
      const g = ctx.createLinearGradient(x, 0, x + dir * 240, 0); g.addColorStop(0, HC.shade(team.colors.main, -0.2)); g.addColorStop(1, team.colors.main);
      ctx.fillStyle = g; HC.rr(ctx, Math.min(x, x + dir * 250), 8, 250, 64, 18); ctx.fill();
      ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; HC.rr(ctx, Math.min(x, x + dir * 250) + 6, 12, 238, 20, 10); ctx.fill();
    };
    side(t0, W / 2 - 70, -1); side(t1, W / 2 + 70, 1);
    U.fitText(ctx, t0.name, W / 2 - 300, 40, 20, 160, '#fff', 'left');
    U.fitText(ctx, t1.name, W / 2 + 300, 40, 20, 160, '#fff', 'right');
    U.text(ctx, String(m.score[0]), W / 2 - 92, 42, 44, '#fff', 'right', 7);
    U.text(ctx, String(m.score[1]), W / 2 + 92, 42, 44, '#fff', 'left', 7);
    // centre clock
    ctx.fillStyle = UIC.bg1; ctx.beginPath(); ctx.arc(W / 2, 40, 42, 0, 7); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(W / 2, 40, 36, 0, 7); ctx.stroke();
    const pt = Math.max(0, Math.ceil(m.pointTime)), late = pt <= C.BUZZER_WINDOW;
    ctx.strokeStyle = late ? UIC.red : UIC.yellow; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(W / 2, 40, 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, m.pointTime) / C.POINT_TIME); ctx.stroke();
    U.text(ctx, String(pt), W / 2, 38, 30, late ? UIC.red : '#fff', 'center', 5);
    let sub = 'FIRST TO ' + m.winScore;
    if (m.overtime) sub = 'OVERTIME • NEXT BASKET WINS';
    else if (m.gameClock != null) sub += '  •  ⏱ ' + U.clock(m.gameClock);
    if (m.mode === 'hotpotato') sub = '💣 HOT POTATO  •  ' + sub;
    ctx.font = '900 13px ' + HC.FONT_BODY; const sw = ctx.measureText(sub).width + 24;
    ctx.fillStyle = 'rgba(10,5,30,0.85)'; HC.rr(ctx, W / 2 - sw / 2, 72, sw, 22, 11); ctx.fill();
    U.small(ctx, sub, W / 2, 83, 13, m.overtime || (m.gameClock != null && m.gameClock <= 10) ? UIC.red : '#fff', 'center', 900);
    ctx.restore();
  },

  drawBossHUD(ctx, m) {
    const C = HC.CONFIG, U = this, W = C.WIDTH, b = m.boss;
    U.panel(ctx, W / 2 - 330, 8, 660, 82, { top: 'rgba(80,10,20,0.92)', bottom: 'rgba(30,5,12,0.94)' });
    U.text(ctx, '👑 ' + b.def.name, W / 2, 28, 24, '#ff6b6b', 'center', 5);
    const k = b.health / b.maxHealth;
    const col = b.hurtT > 0 && Math.floor(performance.now() / 60) % 2 ? '#fff' : (k > 0.5 ? UIC.red : k > 0.25 ? UIC.orange : UIC.yellow);
    U.bar(ctx, W / 2 - 310, 46, 620, 20, k, col, 'rgba(0,0,0,0.5)');
    ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; HC.rr(ctx, W / 2 - 310, 46, 620, 20, 10); ctx.stroke();
    U.small(ctx, 'HP ' + b.health + '/' + b.maxHealth + '   •   BOSS SCORE ' + b.bossScore + '/' + C.BOSS_WIN_SCORE + '   •   ⏱ ' + Math.max(0, Math.ceil(m.pointTime)), W / 2, 78, 13, '#ffd6d6', 'center', 900);
  },

  drawHorseHUD(ctx, m) {
    const C = HC.CONFIG, U = this, W = C.WIDTH;
    U.panel(ctx, W / 2 - 370, 8, 740, 96);
    [0, 1].forEach(t => {
      const x = t === 0 ? W / 2 - 350 : W / 2 + 30, team = m.teams[t];
      const active = m.attempt && m.attempt.shooter === t;
      ctx.fillStyle = team.colors.main; HC.rr(ctx, x, 16, 320, 32, 12); ctx.fill();
      ctx.strokeStyle = active ? UIC.yellow : UIC.ink; ctx.lineWidth = active ? 4 : 2; ctx.stroke();
      U.text(ctx, (active ? '▶ ' : '') + team.name, x + 12, 32, 18, '#fff', 'left', 4);
      for (let i = 0; i < m.word.length; i++) {
        const got = i < m.letters[t];
        U.text(ctx, m.word[i], x + 34 + i * 60, 76, 36, got ? UIC.red : 'rgba(255,255,255,0.18)', 'center', got ? 6 : 0);
      }
    });
    U.text(ctx, m.horseMsg || '', W / 2, 126, 22, UIC.yellow, 'center', 5);
    if (m.attempt && !m.attempt.shot && m.state === 'play') U.small(ctx, 'Hop into position, then jump and tap again to shoot  •  ' + Math.max(0, Math.ceil(m.attempt.t)) + 's', W / 2, 154, 15, '#fff', 'center', 800);
  },

  drawPause(ctx, m) {
    const C = HC.CONFIG, W = C.WIDTH, app = m.app;
    ctx.fillStyle = 'rgba(10,5,30,0.75)'; ctx.fillRect(0, 0, W, C.HEIGHT);
    this.panel(ctx, W / 2 - 220, 150, 440, 400);
    this.text(ctx, 'PAUSED', W / 2, 205, 52, UIC.yellow, 'center', 8);
    this.button(ctx, app, { x: W / 2 - 170, y: 260, w: 340, h: 64, label: 'RESUME', icon: '▶', color: UIC.green, onClick: () => app.togglePause() });
    this.button(ctx, app, { x: W / 2 - 170, y: 342, w: 340, h: 64, label: 'RESTART', icon: '↻', color: UIC.orange, onClick: () => app.restartMatch() });
    this.button(ctx, app, { x: W / 2 - 170, y: 424, w: 340, h: 64, label: 'QUIT', icon: '✖', color: UIC.red, onClick: () => app.quitToMenu() });
    if (HC.Admin && HC.Admin.on()) this.button(ctx, app, { x: W / 2 - 170, y: 568, w: 340, h: 50, label: 'ADMIN: WIN MATCH', icon: '🦾', color: '#b5179e', size: 20, onClick: () => HC.Admin.winMatch() });
  },
};

// ================================================================ SCREENS
HC.Screens = {};
const S = HC.Screens;
const W = () => HC.CONFIG.WIDTH, H = () => HC.CONFIG.HEIGHT;
const UI = HC.UI;

function courtBackdrop(ctx, courtId, t, dark) {
  const c = HC.courtById(courtId);
  c.drawBg(ctx, null, t);
  ctx.fillStyle = c.floor.top; ctx.fillRect(0, HC.CONFIG.FLOOR_Y, W(), H());
  ctx.fillStyle = 'rgba(12,6,32,' + (dark == null ? 0.72 : dark) + ')'; ctx.fillRect(0, 0, W(), H());
}

// ---------------------------------------------------------------- TITLE
S.title = {
  draw(ctx, app, t) {
    if (app.demo) app.demo.render(ctx); else UI.bg(ctx, t);
    // left fade for the menu
    const g = ctx.createLinearGradient(0, 0, 900, 0);
    g.addColorStop(0, 'rgba(20,10,46,0.97)'); g.addColorStop(0.62, 'rgba(20,10,46,0.88)'); g.addColorStop(1, 'rgba(20,10,46,0.15)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H());
    const tg = ctx.createLinearGradient(0, 0, 0, 160); tg.addColorStop(0, 'rgba(20,10,46,0.6)'); tg.addColorStop(1, 'rgba(20,10,46,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W(), 160);

    // ---- logo ----
    drawLogo(ctx, 44, 30, t);

    // ---- featured adventure card ----
    const ar = { x: 40, y: 236, w: 520, h: 124 };
    const on = UI.hit(app, Object.assign({ onClick: () => app.go('adventure') }, ar));
    ctx.save(); ctx.translate(0, on ? -3 : 0);
    ctx.fillStyle = HC.shade(UIC.pink, -0.5); HC.rr(ctx, ar.x, ar.y + 7, ar.w, ar.h, 22); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; ctx.stroke();
    const ag = ctx.createLinearGradient(ar.x, ar.y, ar.x + ar.w, ar.y + ar.h); ag.addColorStop(0, '#ff7a1a'); ag.addColorStop(0.55, '#ff3d7f'); ag.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = ag; HC.rr(ctx, ar.x, ar.y, ar.w, ar.h, 22); ctx.fill(); ctx.stroke();
    ctx.save(); HC.rr(ctx, ar.x, ar.y, ar.w, ar.h, 22); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(ar.x + i * 90 - ((t * 30) % 90), ar.y); ctx.lineTo(ar.x + i * 90 + 40 - ((t * 30) % 90), ar.y); ctx.lineTo(ar.x + i * 90 - 60 - ((t * 30) % 90), ar.y + ar.h); ctx.lineTo(ar.x + i * 90 - 100 - ((t * 30) % 90), ar.y + ar.h); ctx.fill(); }
    HC.drawPortrait(ctx, 'zippy', ar.x + 360, ar.y + ar.h + 30, 140, { main: '#38d6ff', alt: '#fff' }, 'happy', { pose: 'cheer', noShadow: true });
    HC.drawPortrait(ctx, 'mo', ar.x + 425, ar.y + ar.h + 26, 150, { main: '#8b5cf6', alt: '#ffd23f' }, 'happy', { noShadow: true, facing: -1 });
    HC.drawPortrait(ctx, 'ghostie', ar.x + 480, ar.y + ar.h + 18, 120, { main: '#2ee6a6', alt: '#fff' }, 'happy', { noShadow: true, facing: -1, pose: 'cheer' });
    ctx.restore();
    if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; HC.rr(ctx, ar.x + 3, ar.y + 3, ar.w - 6, ar.h - 6, 20); ctx.stroke(); }
    UI.text(ctx, 'ADVENTURE', ar.x + 26, ar.y + 48, 46, '#fff', 'left', 8);
    UI.small(ctx, '6 worlds  •  30 stages  •  new heroes', ar.x + 28, ar.y + 86, 15, '#fff', 'left', 800);
    UI.star(ctx, ar.x + 38, ar.y + 108, 9, true); UI.small(ctx, HC.Adventure.totalStars() + ' / ' + HC.Adventure.maxStars() + ' stars', ar.x + 54, ar.y + 108, 14, '#fff', 'left', 900);
    ctx.save(); ctx.translate(ar.x + ar.w - 26, ar.y + 2); ctx.rotate(0.2); ctx.fillStyle = UIC.yellow; HC.rr(ctx, -34, -13, 68, 26, 13); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 2.5; ctx.stroke(); UI.text(ctx, 'NEW!', 0, 0, 15, UIC.ink, 'center', 0); ctx.restore();
    ctx.restore();

    // ---- mode grid ----
    const sv = HC.Save.data, bossUnlocked = sv.trophies > 0 || app.settings.unlockAll || HC.Admin.all() || Object.keys(sv.bosses).length > 0;
    const items = [
      ['QUICK MATCH', '1P vs CPU or 2P', '🏀', UIC.orange, () => app.go('players', { mode: 'quick' })],
      ['TOURNAMENT', '8-team ladder', '🏆', '#2e86ff', () => app.go('chars', { mode: 'tournament', humans: 1 })],
      ['HORSE', 'trick-shot duel', '🐴', '#9b5de5', () => app.go('players', { mode: 'horse' })],
      ['BOSSES', bossUnlocked ? 'giant bosses' : 'win a tournament', bossUnlocked ? '👹' : '🔒', '#e63946', () => app.go('bossSelect'), !bossUnlocked],
      ['HOT POTATO', 'the ball is a bomb', '💣', '#f3722c', () => app.go('players', { mode: 'hotpotato' })],
      ['LOCKER', 'balls & jerseys', '🎒', '#06a77d', () => app.go('locker')],
    ];
    items.forEach((it, i) => {
      const x = 40 + (i % 2) * 265, y = 384 + Math.floor(i / 2) * 82;
      UI.button(ctx, app, { x, y, w: 255, h: 70, label: it[0], sub: it[1], icon: it[2], color: it[3], onClick: it[4], disabled: it[5], size: 22 });
    });
    [['SETTINGS', '⚙️', () => app.go('settings')], ['ROSTER', '👥', () => app.go('roster')], ['HOW TO', '❓', () => app.go('help')]].forEach((b, i) =>
      UI.button(ctx, app, { x: 40 + i * 175, y: 640, w: 165, h: 50, label: b[0], icon: b[1], ghost: true, onClick: b[2], size: 18 }));

    // ---- profile card ----
    const pr = { x: W() - 330, y: 16, w: 310, h: 92 };
    const pon = UI.hit(app, Object.assign({ onClick: () => HC.LoginPage.show() }, pr));
    UI.panel(ctx, pr.x, pr.y, pr.w, pr.h, pon ? { border: '#fff' } : null);
    ctx.save(); HC.rr(ctx, pr.x + 10, pr.y + 10, 72, 72, 16); ctx.clip(); ctx.fillStyle = HC.Cosmetics.jersey().main; ctx.fillRect(pr.x + 10, pr.y + 10, 72, 72);
    HC.drawPortrait(ctx, (sv.advTeam || ['pip'])[0], pr.x + 46, pr.y + 140, 150, HC.Cosmetics.jersey(), 'happy', { noShadow: true }); ctx.restore();
    ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; HC.rr(ctx, pr.x + 10, pr.y + 10, 72, 72, 16); ctx.stroke();
    const u = HC.Auth.user;
    UI.text(ctx, u && u.mode !== 'guest' ? u.name : 'GUEST', pr.x + 96, pr.y + 30, 22, '#fff', 'left', 4);
    UI.small(ctx, u && u.mode === 'cloud' ? '☁ saved online' : u && u.mode === 'local' ? '💾 saved on this device' : 'tap to log in', pr.x + 96, pr.y + 52, 12, 'rgba(255,255,255,0.7)', 'left', 800);
    UI.small(ctx, '🪙 ' + (sv.coins || 0) + '   ⭐ ' + HC.Adventure.totalStars() + '   🏆 ' + sv.trophies, pr.x + 96, pr.y + 74, 15, UIC.yellow, 'left', 900);

    // ---- live demo tag ----
    if (app.demo) {
      const d = app.demo;
      const txt = d.teams[0].name + '  ' + d.score[0] + ' - ' + d.score[1] + '  ' + d.teams[1].name;
      ctx.font = '900 15px ' + HC.FONT_BODY; const w = ctx.measureText(txt).width + 80;
      ctx.fillStyle = 'rgba(10,5,30,0.75)'; HC.rr(ctx, W() - w - 20, H() - 54, w, 36, 18); ctx.fill();
      ctx.fillStyle = Math.floor(t * 2) % 2 ? UIC.red : '#a00'; ctx.beginPath(); ctx.arc(W() - w + 2, H() - 36, 6, 0, 7); ctx.fill();
      UI.small(ctx, 'LIVE', W() - w + 14, H() - 36, 13, UIC.red, 'left', 900);
      UI.small(ctx, txt, W() - 34, H() - 36, 15, '#fff', 'right', 900);
    }
  },
};

function drawLogo(ctx, x, y, t) {
  const word = (str, x0, y0, size, cols, phase) => {
    ctx.font = size + 'px ' + HC.FONT_DISPLAY; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    let xx = x0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i], w = ctx.measureText(ch).width;
      const bob = Math.sin(t * 3 + i * 0.7 + phase) * 4, rot = Math.sin(t * 2 + i + phase) * 0.05;
      ctx.save(); ctx.translate(xx + w / 2, y0 + bob); ctx.rotate(rot);
      for (let d = 9; d > 0; d -= 1) { ctx.fillStyle = d > 7 ? '#0b0518' : HC.shade(cols[1], -0.55); ctx.fillText(ch, -w / 2 + d * 0.5, d); }
      ctx.lineWidth = 9; ctx.strokeStyle = UIC.ink; ctx.lineJoin = 'round'; ctx.strokeText(ch, -w / 2, 0);
      const g = ctx.createLinearGradient(0, -size * 0.8, 0, 0); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]);
      ctx.fillStyle = g; ctx.fillText(ch, -w / 2, 0);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-w / 2 + 4, -size * 0.68, w * 0.5, size * 0.07);
      ctx.restore();
      xx += w + 2;
    }
    return xx;
  };
  const end = word('HOOP', x, y + 72, 80, ['#ffe066', '#ff7a1a'], 0);
  // spinning ball
  ctx.save(); ctx.translate(end + 40, y + 42); ctx.rotate(t * 2);
  HC.drawBall(ctx, [0, 0, 0, 29, 'classic', -1, 0, 0]); ctx.restore();
  word('CHAOS', x + 4, y + 152, 86, ['#ff8fb8', '#ff3d7f'], 2);
  ctx.save(); ctx.translate(x + 150, y + 184); ctx.rotate(-0.03);
  ctx.fillStyle = UIC.cyan; HC.rr(ctx, -150, -14, 300, 28, 14); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; ctx.stroke();
  UI.small(ctx, 'ONE-BUTTON RAGDOLL BASKETBALL', 0, 1, 14, UIC.ink, 'center', 900); ctx.restore();
}

// ---------------------------------------------------------------- MATCH SETUP
S.players = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    const p = app.params, name = { quick: 'QUICK MATCH', horse: 'HORSE / TRICK', hotpotato: 'HOT POTATO' }[p.mode];
    UI.header(ctx, app, name, () => app.go('title'));
    const card = (x, label, sub, color, icon, humans) => {
      const r = { x, y: 130, w: 440, h: 200 };
      const on = UI.hit(app, Object.assign({ onClick: () => app.go('chars', Object.assign({}, p, { humans })) }, r));
      ctx.save(); ctx.translate(0, on ? -4 : 0);
      ctx.fillStyle = HC.shade(color, -0.5); HC.rr(ctx, r.x, r.y + 8, r.w, r.h, 24); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; ctx.stroke();
      const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, HC.shade(color, 0.2)); g.addColorStop(1, color);
      ctx.fillStyle = g; HC.rr(ctx, r.x, r.y, r.w, r.h, 24); ctx.fill(); ctx.stroke();
      if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; HC.rr(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 20); ctx.stroke(); }
      ctx.save(); HC.rr(ctx, r.x, r.y, r.w, r.h, 24); ctx.clip();
      icon.forEach((c, i) => HC.drawPortrait(ctx, c, r.x + 330 + i * 70, r.y + r.h + 20, 170, { main: i ? '#ff3b3b' : '#2e86ff', alt: '#fff' }, 'happy', { noShadow: true, facing: i ? -1 : 1, pose: on ? 'cheer' : '' }));
      ctx.restore();
      UI.text(ctx, label, r.x + 28, r.y + 62, 44, '#fff', 'left', 8);
      UI.small(ctx, sub, r.x + 30, r.y + 108, 17, '#fff', 'left', 800);
      ctx.restore();
    };
    card(W() / 2 - 460, '1 PLAYER', 'You (W) vs the CPU', '#2e86ff', ['pip'], 1);
    card(W() / 2 + 20, '2 PLAYERS', 'W vs ↑ on one keyboard', '#e63946', ['noodle', 'blob'], 2);
    // options
    UI.panel(ctx, W() / 2 - 460, 370, 920, p.mode === 'horse' ? 250 : 170);
    UI.text(ctx, 'CPU', W() / 2 - 430, 412, 24, UIC.yellow, 'left', 4);
    ['easy', 'medium', 'hard'].forEach((d, i) => UI.button(ctx, app, { x: W() / 2 - 330 + i * 140, y: 390, w: 130, h: 46, label: d.toUpperCase(), color: app.settings.difficulty === d ? UIC.green : UIC.grey, size: 18, onClick: () => app.setSetting('difficulty', d) }));
    if (p.mode !== 'horse') {
      UI.text(ctx, 'TIME', W() / 2 - 430, 482, 24, UIC.yellow, 'left', 4);
      HC.MATCH_TIMES.forEach((m, i) => UI.button(ctx, app, { x: W() / 2 - 330 + i * 100, y: 460, w: 90, h: 46, label: m ? m + 'm' : 'OFF', color: app.settings.matchTime === m ? UIC.green : UIC.grey, size: 18, onClick: () => app.setSetting('matchTime', m) }));
      UI.small(ctx, 'First to ' + app.settings.winScore + ' (change in Settings)', W() / 2 + 300, 482, 14, 'rgba(255,255,255,0.7)', 'center', 800);
    } else {
      UI.text(ctx, 'WORD', W() / 2 - 430, 482, 24, UIC.yellow, 'left', 4);
      ['HORSE', 'PIG', 'HOOP'].forEach((wd, i) => UI.button(ctx, app, { x: W() / 2 - 330 + i * 160, y: 460, w: 150, h: 46, label: wd, color: (p.word || 'HORSE') === wd ? UIC.green : UIC.grey, size: 20, onClick: () => { p.word = wd; } }));
      UI.wrap(ctx, 'Make a shot, then your rival must copy it from the same spot - same tricks too! Miss a copy and you get a letter. Spell the word and you lose.', W() / 2, 560, 840, 22, 16, '#fff', 'center', 700);
    }
    if (p.mode === 'hotpotato') UI.small(ctx, '💣 The ball is ALWAYS a bomb. If it blows up in your hands, the other team gets ' + HC.CONFIG.BOMB_POINTS + ' points!', W() / 2, 660, 17, UIC.yellow, 'center', 800);
  },
};

// ---------------------------------------------------------------- CHARACTER SELECT
S.chars = {
  enter(app) {
    const p = app.params; p.pickTeam = 0; p.need = p.mode === 'horse' ? 1 : 2;
    const last = (HC.Save.data.lastPicks || []).filter(id => HC.isUnlocked(HC.charById(id)));
    p.picks = [p.mode === 'adventure' ? (HC.Save.data.advTeam || []).slice(0, p.need) : last.slice(0, p.need), []];
    p.preview = p.picks[0][0] || 'pip';
  },
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    const p = app.params, team = p.pickTeam, picks = p.picks[team];
    const tc = p.mode === 'adventure' || (p.humans !== 2 && team === 0) ? HC.Cosmetics.jersey() : app.teamColors(team);
    const who = p.humans === 2 ? (team === 0 ? 'PLAYER 1' : 'PLAYER 2') : 'CHOOSE YOUR TEAM';
    UI.header(ctx, app, who, () => { if (team === 1) p.pickTeam = 0; else app.go(p.backTo || (p.mode === 'tournament' || p.mode === 'adventure' ? (p.mode === 'adventure' ? 'stage' : 'title') : p.mode === 'boss' ? 'bossSelect' : 'players'), p); },
      { sub: 'Pick ' + p.need + (p.need > 1 ? ' players' : ' player') + '  •  click a card to add it', color: tc.main === '#2e86ff' ? UIC.yellow : tc.main });
    const chars = HC.CHARACTERS;
    const cols = 5, cw = 160, ch = 146, x0 = 28, y0 = 112;
    let hovered = null;
    chars.forEach((c, i) => {
      const x = x0 + (i % cols) * (cw + 8), y = y0 + Math.floor(i / cols) * (ch + 8);
      const locked = !HC.isUnlocked(c);
      const r = { x, y, w: cw, h: ch, disabled: locked, onClick: () => { if (picks.length < p.need) { picks.push(c.id); HC.Audio.select(); } p.preview = c.id; } };
      const on = UI.hit(app, r);
      if (on || (locked && UI.hover(app, r))) hovered = c.id;
      const sel = picks.includes(c.id);
      ctx.save(); ctx.translate(0, on ? -3 : 0);
      const g = ctx.createLinearGradient(0, y, 0, y + ch);
      g.addColorStop(0, locked ? '#2a2540' : HC.shade(tc.main, 0.15)); g.addColorStop(1, locked ? '#1a1630' : HC.shade(tc.main, -0.45));
      ctx.fillStyle = g; HC.rr(ctx, x, y, cw, ch, 16); ctx.fill();
      ctx.save(); HC.rr(ctx, x, y, cw, ch, 16); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(x + cw / 2, y + 40, 60, 0, 7); ctx.fill();
      if (locked) { ctx.globalAlpha = 0.25; HC.drawPortrait(ctx, c.id, x + cw / 2, y + ch - 30, 104, { main: '#111', alt: '#333' }, 'neutral', { noShadow: true }); ctx.globalAlpha = 1; }
      else HC.drawPortrait(ctx, c.id, x + cw / 2, y + ch - 30, 104, tc, on || sel ? 'happy' : 'neutral', { noShadow: true, pose: on ? 'cheer' : '' });
      ctx.fillStyle = 'rgba(10,5,30,0.82)'; ctx.fillRect(x, y + ch - 30, cw, 30);
      ctx.restore();
      ctx.strokeStyle = sel ? UIC.yellow : on ? '#fff' : UIC.ink; ctx.lineWidth = sel || on ? 4 : 3; HC.rr(ctx, x, y, cw, ch, 16); ctx.stroke();
      UI.text(ctx, locked ? '???' : c.name, x + cw / 2, y + ch - 15, c.name.length > 11 ? 14 : 17, locked ? '#888' : '#fff', 'center', 3);
      if (locked) { UI.text(ctx, '🔒', x + cw / 2, y + 50, 34, '#fff', 'center', 0); }
      const ab = HC.abilityOf(c);
      if (ab && !locked) { ctx.fillStyle = 'rgba(10,5,30,0.75)'; ctx.beginPath(); ctx.arc(x + cw - 20, y + 20, 15, 0, 7); ctx.fill(); ctx.font = '17px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ab.icon, x + cw - 20, y + 21); }
      const n = picks.filter(id => id === c.id).length;
      if (n) { ctx.fillStyle = UIC.yellow; ctx.beginPath(); ctx.arc(x + 20, y + 20, 15, 0, 7); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 2.5; ctx.stroke(); UI.text(ctx, n > 1 ? 'x' + n : '✓', x + 20, y + 21, 16, UIC.ink, 'center', 0); }
      ctx.restore();
    });
    // ---- detail panel ----
    const id = hovered || p.preview || 'pip', def = HC.charById(id), locked = !HC.isUnlocked(def);
    const px = 878, py = 112, pw = 376, ph = 454;
    UI.panel(ctx, px, py, pw, ph);
    ctx.save(); HC.rr(ctx, px + 12, py + 12, pw - 24, 200, 14); ctx.clip();
    const dg = ctx.createRadialGradient(px + pw / 2, py + 120, 10, px + pw / 2, py + 120, 220); dg.addColorStop(0, HC.shade(tc.main, 0.1)); dg.addColorStop(1, HC.shade(tc.main, -0.6));
    ctx.fillStyle = dg; ctx.fillRect(px + 12, py + 12, pw - 24, 200);
    if (locked) ctx.globalAlpha = 0.25;
    HC.drawPortrait(ctx, id, px + pw / 2, py + 200, 180, locked ? { main: '#111', alt: '#333' } : tc, 'happy', { pose: 'cheer', noShadow: true });
    ctx.restore();
    UI.text(ctx, locked ? '???' : def.name, px + pw / 2, py + 240, 30, '#fff', 'center', 6);
    UI.small(ctx, locked ? unlockHint(def) : def.perk, px + pw / 2, py + 270, 14, 'rgba(255,255,255,0.8)', 'center', 800);
    const st = HC.charStats(def);
    [['JUMP', st.jump, UIC.green], ['AIM', st.aim, UIC.cyan], ['POWER', st.power, UIC.orange], ['SIZE', st.size, UIC.purple]].forEach(([lb, v, c], i) => {
      UI.small(ctx, lb, px + 26, py + 300 + i * 24, 13, 'rgba(255,255,255,0.75)', 'left', 900);
      UI.bar(ctx, px + 96, py + 293 + i * 24, pw - 122, 13, locked ? 0 : 0.12 + v * 0.88, c);
    });
    const ab = HC.abilityOf(def);
    if (ab) {
      ctx.fillStyle = 'rgba(255,61,127,0.18)'; HC.rr(ctx, px + 14, py + 392, pw - 28, 50, 12); ctx.fill();
      UI.small(ctx, ab.icon + '  SPECIAL: ' + (locked ? '???' : ab.name.toUpperCase()), px + 26, py + 407, 15, UIC.yellow, 'left', 900);
      UI.small(ctx, locked ? 'Unlock to find out!' : ab.desc, px + 26, py + 428, 13, '#fff', 'left', 700);
    }
    // ---- team slots + buttons ----
    UI.panel(ctx, 28, 586, 820, 116);
    UI.text(ctx, 'YOUR TEAM', 50, 610, 18, UIC.yellow, 'left', 3);
    for (let i = 0; i < p.need; i++) {
      const x = 50 + i * 130, y = 626;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; HC.rr(ctx, x, y, 118, 66, 12); ctx.fill();
      ctx.setLineDash(picks[i] ? [] : [6, 5]); ctx.strokeStyle = picks[i] ? UIC.yellow : 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
      if (picks[i]) {
        ctx.save(); HC.rr(ctx, x, y, 118, 66, 12); ctx.clip(); HC.drawPortrait(ctx, picks[i], x + 30, y + 100, 120, tc, 'happy', { noShadow: true }); ctx.restore();
        UI.small(ctx, HC.charById(picks[i]).name, x + 64, y + 33, 12, '#fff', 'left', 900);
      } else UI.small(ctx, 'EMPTY', x + 59, y + 33, 13, 'rgba(255,255,255,0.4)', 'center', 900);
    }
    UI.button(ctx, app, { x: 320, y: 630, w: 150, h: 54, label: 'RANDOM', icon: '🎲', color: UIC.purple, size: 18, onClick: () => { const pool = HC.CHARACTERS.filter(c => HC.isUnlocked(c)); p.picks[team] = []; for (let i = 0; i < p.need; i++) p.picks[team].push(HC.U.pick(pool).id); } });
    UI.button(ctx, app, { x: 482, y: 630, w: 130, h: 54, label: 'CLEAR', color: UIC.grey, size: 18, onClick: () => { p.picks[team] = []; } });
    const ready = picks.length >= p.need;
    UI.button(ctx, app, { x: 624, y: 630, w: 210, h: 54, label: team === 0 && p.humans === 2 ? 'NEXT' : 'READY!', icon: '▶', color: UIC.green, disabled: !ready, size: 24, onClick: () => {
      if (team === 0 && p.humans === 2) { p.pickTeam = 1; app.focus = -1; return; }
      HC.Save.data.lastPicks = p.picks[0].slice(); HC.Save.save();
      if (p.mode === 'adventure') { HC.Save.data.advTeam = p.picks[0].slice(); HC.Save.save(); app.go('stage', p); }
      else if (p.mode === 'tournament') app.startTournament(p.picks[0]);
      else if (p.mode === 'boss') app.go('bossIntro', p);
      else app.go('court', p);
    } });
    UI.wrap(ctx, '⚡ Specials: when your SPECIAL meter is full, hold past a full wind-up, then release.', 1066, 600, 350, 16, 13, 'rgba(255,255,255,0.7)', 'center', 800);
  },
};
function unlockHint(def) {
  if (def.unlock === 'adv') { for (const r of HC.ADVENTURE) for (const st of r.stages) if (st.reward.unlock && st.reward.unlock.kind === 'char' && st.reward.unlock.id === def.id) return 'Unlock: beat "' + st.name + '" in ' + r.name; return 'Unlock in Adventure'; }
  return 'Unlock: defeat ' + HC.bossById(def.unlock).name;
}

// ---------------------------------------------------------------- COURT SELECT
S.court = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    const p = app.params;
    UI.header(ctx, app, 'PICK A COURT', () => app.go('chars', p), { sub: 'Every court has a live event - watch for the ⚠ warning!' });
    const list = HC.COURTS.concat([{ id: 'random', name: 'Random', icon: '🎲', desc: 'Surprise me!' }]);
    const cols = 4, cw = 290, ch = 236, gap = 18, x0 = W() / 2 - (cols * cw + (cols - 1) * gap) / 2;
    list.forEach((c, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = 122 + Math.floor(i / cols) * (ch + gap);
      const on = UI.hit(app, { x, y, w: cw, h: ch, onClick: () => { p.court = c.id === 'random' ? HC.U.pick(HC.COURTS).id : c.id; app.startMatch(p); } });
      ctx.save(); ctx.translate(0, on ? -4 : 0);
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; HC.rr(ctx, x + 3, y + 8, cw, ch, 18); ctx.fill();
      ctx.save(); HC.rr(ctx, x, y, cw, ch, 18); ctx.clip();
      if (c.drawBg) { ctx.translate(x, y); ctx.scale(cw / W(), (ch - 64) / (H() - 80)); c.drawBg(ctx, null, t); ctx.fillStyle = c.floor.top; ctx.fillRect(0, HC.CONFIG.FLOOR_Y, W(), 200); }
      else { const g = ctx.createLinearGradient(x, y, x + cw, y + ch); g.addColorStop(0, UIC.purple); g.addColorStop(1, UIC.pink); ctx.fillStyle = g; ctx.fillRect(x, y, cw, ch); ctx.font = '90px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🎲', x + cw / 2, y + 80); }
      ctx.restore();
      ctx.fillStyle = 'rgba(14,7,34,0.92)'; HC.rr(ctx, x, y + ch - 76, cw, 76, 0); ctx.fill();
      ctx.strokeStyle = on ? UIC.yellow : UIC.ink; ctx.lineWidth = on ? 5 : 3; HC.rr(ctx, x, y, cw, ch, 18); ctx.stroke();
      UI.text(ctx, c.icon + ' ' + c.name, x + 14, y + ch - 54, 22, '#fff', 'left', 4);
      UI.wrap(ctx, c.desc, x + 14, y + ch - 28, cw - 28, 16, 13, 'rgba(255,255,255,0.8)', 'left', 700);
      ctx.restore();
    });
  },
};

// ---------------------------------------------------------------- RESULTS
S.results = {
  enter(app) { app.params.t0 = app.t; },
  draw(ctx, app, t) {
    const r = app.params, m = r.match, w = r.winner, adv = r.adv;
    courtBackdrop(ctx, m.court.id, t, 0.78);
    const humanWon = r.humanWon;
    let headline = w >= 0 ? m.teams[w].name + ' WIN!' : 'GAME OVER';
    if (m.boss) headline = w === 0 ? m.boss.def.name + ' DEFEATED!' : m.boss.def.name + ' WINS...';
    if (adv) headline = w === 0 ? 'STAGE CLEAR!' : 'DEFEATED...';
    const col = adv || m.boss ? (humanWon ? UIC.green : UIC.red) : (w >= 0 ? m.teams[w].colors.main : '#fff');
    const k = Math.min(1, (app.t - r.t0) * 3);
    ctx.save(); ctx.translate(W() / 2, 58); ctx.scale(0.6 + k * 0.4, 0.6 + k * 0.4); UI.text(ctx, headline, 0, 0, 54, col, 'center', 9); ctx.restore();
    let sub = '';
    if (m.mode === 'horse') sub = m.teams[0].name + ' "' + m.word.slice(0, m.letters[0]) + '"   •   ' + m.teams[1].name + ' "' + m.word.slice(0, m.letters[1]) + '"';
    else if (m.boss) sub = 'Boss HP left: ' + m.boss.health + ' / ' + m.boss.maxHealth;
    if (sub) UI.small(ctx, sub, W() / 2, 104, 18, '#fff', 'center', 800);
    else UI.text(ctx, m.score[0] + '  -  ' + m.score[1], W() / 2, 108, 40, '#fff', 'center', 6);
    if (r.note) UI.text(ctx, r.note, W() / 2, 148, 22, UIC.yellow, 'center', 5);
    if (adv) this.drawAdventure(ctx, app, r, t);
    else this.drawStats(ctx, m, w, 120, 180, 1040, 370);
    const btns = r.buttons || [['REMATCH', UIC.green, () => app.restartMatch(), '↻'], ['MENU', UIC.grey, () => app.quitToMenu(), '⌂']];
    const bw = 250, total = btns.length * bw + (btns.length - 1) * 20;
    btns.forEach((b, i) => UI.button(ctx, app, { x: W() / 2 - total / 2 + i * (bw + 20), y: 600, w: bw, h: 70, label: b[0], color: b[1], onClick: b[2], icon: b[3], size: 24 }));
  },
  drawStats(ctx, m, w, x, y, pw, ph) {
    UI.panel(ctx, x, y, pw, ph);
    const cols = [['PLAYER', 30], ['PTS', 340], ['MADE/SHOTS', 440], ['STEALS', 590], ['TRICK SHOTS', 700]];
    cols.forEach(([h, cx]) => UI.small(ctx, h, x + cx, y + 26, 13, 'rgba(255,255,255,0.6)', 'left', 900));
    const rows = m.statsPlayers.slice().sort((a, b) => a.team - b.team);
    const rh = Math.min(76, (ph - 50) / Math.max(1, rows.length));
    rows.forEach((sp, i) => {
      const yy = y + 46 + i * rh, team = m.teams[sp.team];
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'; HC.rr(ctx, x + 12, yy, pw - 24, rh - 6, 12); ctx.fill();
      ctx.save(); HC.rr(ctx, x + 18, yy + 4, 56, rh - 14, 10); ctx.clip(); ctx.fillStyle = team.colors.main; ctx.fillRect(x + 18, yy + 4, 56, rh - 14);
      HC.drawPortrait(ctx, sp.char, x + 46, yy + rh + 26, 110, team.colors, sp.team === w ? 'happy' : 'sad', { noShadow: true }); ctx.restore();
      UI.text(ctx, sp.name, x + 88, yy + rh * 0.36, 19, '#fff', 'left', 4);
      UI.small(ctx, team.name, x + 88, yy + rh * 0.68, 13, team.colors.main === '#1f2233' ? '#bbb' : HC.shade(team.colors.main, 0.4), 'left', 800);
      UI.text(ctx, String(sp.stats.points), x + 350, yy + rh / 2 - 3, 26, UIC.yellow, 'left', 4);
      UI.small(ctx, sp.stats.makes + ' / ' + sp.stats.shots, x + 450, yy + rh / 2 - 3, 18, '#fff', 'left', 800);
      UI.small(ctx, String(sp.stats.steals), x + 610, yy + rh / 2 - 3, 18, '#fff', 'left', 800);
      const tr = Object.entries(sp.stats.tricks).map(([k, n]) => HC.trickById(k).noun + ' x' + n).join(', ') || '—';
      UI.wrap(ctx, tr, x + 700, yy + rh * 0.38, pw - 720, 16, 13, UIC.cyan, 'left', 800);
    });
  },
  drawAdventure(ctx, app, r, t) {
    const a = r.adv, el = app.t - r.t0;
    UI.panel(ctx, 120, 170, 500, 400);
    UI.text(ctx, 'STARS', 370, 200, 26, UIC.yellow, 'center', 5);
    for (let i = 0; i < 3; i++) {
      const got = i < a.stars, appear = Math.min(1, Math.max(0, (el - 0.4 - i * 0.35) * 4));
      ctx.save(); ctx.translate(250 + i * 120, 270 - (i === 1 ? 14 : 0));
      const s = got ? (appear < 1 ? 0.3 + appear * 1.1 : 1 + Math.sin(t * 4 + i) * 0.04) : 1;
      ctx.scale(s, s); UI.star(ctx, 0, 0, 46, got && appear > 0); ctx.restore();
      if (got && appear > 0 && appear < 0.3 && !r['snd' + i]) { r['snd' + i] = true; HC.Audio.card(); }
    }
    a.objs.forEach((o, i) => {
      const y = 350 + i * 44;
      ctx.fillStyle = o.met ? 'rgba(46,230,166,0.15)' : 'rgba(255,255,255,0.05)'; HC.rr(ctx, 146, y - 18, 448, 36, 10); ctx.fill();
      UI.star(ctx, 170, y, 11, o.met);
      UI.small(ctx, o.text, 192, y, 16, o.met ? '#fff' : 'rgba(255,255,255,0.55)', 'left', 800);
      UI.small(ctx, o.met ? '✔' : '✖', 576, y, 18, o.met ? UIC.green : UIC.red, 'right', 900);
    });
    UI.panel(ctx, 660, 170, 500, 400);
    UI.text(ctx, 'REWARDS', 910, 200, 26, UIC.yellow, 'center', 5);
    UI.text(ctx, '🪙 +' + a.coins, 910, 262, 44, UIC.yellow, 'center', 7);
    if (!a.coins) UI.small(ctx, 'Win to earn coins', 910, 300, 15, 'rgba(255,255,255,0.6)', 'center', 800);
    a.unlocks.forEach((u, i) => {
      const y = 330 + i * 92;
      ctx.fillStyle = 'rgba(255,210,63,0.14)'; HC.rr(ctx, 690, y, 440, 80, 14); ctx.fill(); ctx.strokeStyle = UIC.yellow; ctx.lineWidth = 2; ctx.stroke();
      drawItemIcon(ctx, u, 735, y + 40, 32, t);
      UI.text(ctx, 'UNLOCKED!', 790, y + 26, 20, UIC.pink, 'left', 4);
      UI.small(ctx, HC.Adventure.unlockLabel(u), 790, y + 54, 16, '#fff', 'left', 800);
    });
    if (a.milestone) UI.small(ctx, '⭐ ' + a.milestone + '-star milestone reached!', 910, 548, 15, UIC.yellow, 'center', 900);
  },
};

function drawItemIcon(ctx, u, x, y, r, t) {
  if (u.kind === 'ball') { ctx.save(); ctx.translate(x, y); ctx.rotate(t); HC.drawBall(ctx, [0, 0, 0, r * 0.8, u.id, -1, 0, 0]); ctx.restore(); }
  else if (u.kind === 'jersey') { const j = HC.JERSEYS[u.id]; drawJersey(ctx, x, y, r * 1.6, j); }
  else { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ctx.fillStyle = HC.Cosmetics.jersey().main; ctx.fillRect(x - r, y - r, r * 2, r * 2); HC.drawPortrait(ctx, u.id, x, y + r * 2.6, r * 4.2, HC.Cosmetics.jersey(), 'happy', { noShadow: true }); ctx.restore(); }
}
function drawJersey(ctx, x, y, s, j) {
  ctx.save(); ctx.translate(x, y); const k = s / 60; ctx.scale(k, k);
  ctx.fillStyle = j.main; ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-18, -26); ctx.lineTo(-30, -18); ctx.lineTo(-26, 0); ctx.lineTo(-20, -2); ctx.lineTo(-20, 28); ctx.lineTo(20, 28); ctx.lineTo(20, -2); ctx.lineTo(26, 0); ctx.lineTo(30, -18); ctx.lineTo(18, -26); ctx.quadraticCurveTo(0, -12, -18, -26); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = j.alt; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-16, -22); ctx.quadraticCurveTo(0, -8, 16, -22); ctx.stroke();
  ctx.font = '24px ' + HC.FONT_DISPLAY; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = j.alt; ctx.fillText('7', 0, 10);
  ctx.restore();
}
HC.drawJersey = drawJersey; HC.drawItemIcon = drawItemIcon;

// ---------------------------------------------------------------- ADVENTURE MAP
const NODE_POS = [[170, 540], [395, 420], [630, 530], [865, 410], [1095, 500]];
S.adventure = {
  enter(app) { const p = HC.Adventure.prog(); app.params = { region: Math.min(p.region || 0, HC.ADVENTURE.length - 1) }; },
  draw(ctx, app, t) {
    const A = HC.Adventure, ri = app.params.region, reg = HC.ADVENTURE[ri];
    courtBackdrop(ctx, reg.court, t, 0.55);
    const vg = ctx.createLinearGradient(0, 0, 0, H()); vg.addColorStop(0, 'rgba(14,7,34,0.85)'); vg.addColorStop(0.35, 'rgba(14,7,34,0.2)'); vg.addColorStop(1, 'rgba(14,7,34,0.8)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W(), H());
    UI.header(ctx, app, 'ADVENTURE', () => app.go('title'));
    // region tabs
    HC.ADVENTURE.forEach((rg, i) => {
      const x = W() / 2 - 3 * 92 + i * 92 + 46, y = 128, unlocked = A.regionUnlocked(i), sel = i === ri;
      const r = { x: x - 36, y: y - 36, w: 72, h: 72, disabled: !unlocked, onClick: () => { app.params.region = i; A.prog().region = i; HC.Audio.select(); } };
      const on = UI.hit(app, r);
      ctx.fillStyle = sel ? rg.color : unlocked ? 'rgba(20,10,46,0.85)' : 'rgba(20,10,46,0.6)';
      ctx.beginPath(); ctx.arc(x, y, sel ? 36 : 30, 0, 7); ctx.fill();
      ctx.strokeStyle = sel ? '#fff' : on ? UIC.yellow : UIC.ink; ctx.lineWidth = sel ? 4 : 3; ctx.stroke();
      ctx.font = (sel ? 34 : 28) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = unlocked ? 1 : 0.4; ctx.fillText(unlocked ? rg.icon : '🔒', x, y + 2); ctx.globalAlpha = 1;
      if (unlocked) UI.small(ctx, A.regionStars(i) + '/15', x, y + 48, 12, UIC.yellow, 'center', 900);
    });
    // region title
    UI.text(ctx, reg.name.toUpperCase(), W() / 2, 214, 40, reg.color, 'center', 7);
    UI.small(ctx, reg.story, W() / 2, 250, 16, '#fff', 'center', 700);
    // path
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 7; ctx.setLineDash([2, 16]); ctx.lineCap = 'round';
    ctx.beginPath(); NODE_POS.forEach(([x, y], i) => { if (!i) ctx.moveTo(x, y); else { const [px, py] = NODE_POS[i - 1]; ctx.bezierCurveTo(px + 90, py, x - 90, y, x, y); } }); ctx.stroke(); ctx.restore();
    // nodes
    let tip = null, next = -1;
    reg.stages.forEach((st, si) => { if (next < 0 && A.stageUnlocked(ri, si) && A.stars(ri, si) === 0) next = si; });
    reg.stages.forEach((st, si) => {
      const [x, y] = NODE_POS[si], big = !!(st.boss || st.finale), R = big ? 54 : 42;
      const unlocked = A.stageUnlocked(ri, si), stars = A.stars(ri, si);
      const r = { x: x - R, y: y - R, w: R * 2, h: R * 2, disabled: !unlocked, onClick: () => app.go('stage', { mode: 'adventure', humans: 1, region: ri, stage: si }) };
      const on = UI.hit(app, r);
      if (UI.hover(app, r)) tip = { st, x, y: y - R - 16, unlocked };
      const bob = si === next ? Math.sin(t * 4) * 4 : 0;
      ctx.save(); ctx.translate(x, y + bob);
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, R + 10, R * 0.9, 10, 0, 0, 7); ctx.fill();
      ctx.fillStyle = HC.shade(unlocked ? reg.color : '#555', -0.45); ctx.beginPath(); ctx.arc(0, 7, R, 0, 7); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 4; ctx.stroke();
      const g = ctx.createLinearGradient(0, -R, 0, R); g.addColorStop(0, HC.shade(unlocked ? reg.color : '#666', 0.3)); g.addColorStop(1, unlocked ? reg.color : '#444');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, on ? -3 : 0, R, 0, 7); ctx.fill(); ctx.stroke();
      if (on || si === next) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, on ? -3 : 0, R - 5, 0, 7); ctx.stroke(); }
      if (!unlocked) UI.text(ctx, '🔒', 0, 0, R * 0.8, '#fff', 'center', 0);
      else if (st.boss) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R - 6, 0, 7); ctx.clip(); HC.drawPortrait(ctx, HC.bossById(st.boss).charId, 0, R + 50, R * 3.4, HC.bossById(st.boss).colors, 'happy', { noShadow: true }); ctx.restore(); UI.text(ctx, '👑', 0, -R - 2, 30, '#fff', 'center', 0); }
      else if (st.finale) { UI.text(ctx, '🔥', 0, 2, 44, '#fff', 'center', 0); }
      else UI.text(ctx, String(si + 1), 0, 2, R * 0.95, '#fff', 'center', 6);
      for (let i = 0; i < 3; i++) UI.star(ctx, (i - 1) * 24, R + 6 - (i === 1 ? 6 : 0), 11, i < stars);
      if (si === next) { ctx.save(); ctx.translate(0, -R - 30 + Math.sin(t * 6) * 5); ctx.fillStyle = UIC.yellow; ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(14, -14); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.restore();
    });
    if (tip) {
      const txt = tip.unlocked ? tip.st.name + (tip.st.team ? '  vs  ' + tip.st.team.name : '') : 'Clear the previous stage first';
      ctx.font = '900 15px ' + HC.FONT_BODY; const w = ctx.measureText(txt).width + 28;
      const x = HC.U.clamp(tip.x - w / 2, 10, W() - w - 10);
      ctx.fillStyle = 'rgba(10,5,30,0.92)'; HC.rr(ctx, x, tip.y - 44, w, 34, 17); ctx.fill(); ctx.strokeStyle = UIC.yellow; ctx.lineWidth = 2; ctx.stroke();
      UI.small(ctx, txt, x + w / 2, tip.y - 27, 15, '#fff', 'center', 900);
    }
    // milestone bar
    const total = A.totalStars(), nextMs = HC.ADV_MILESTONES.find(ms => total < ms.stars);
    if (nextMs) {
      UI.panel(ctx, 20, 650, 420, 56);
      drawItemIcon(ctx, nextMs.reward, 52, 678, 18, t);
      UI.small(ctx, 'Next star reward at ' + nextMs.stars + ' ⭐', 82, 666, 14, '#fff', 'left', 900);
      UI.bar(ctx, 82, 682, 340, 12, total / nextMs.stars, UIC.yellow);
    }
    UI.button(ctx, app, { x: W() - 230, y: 646, w: 210, h: 56, label: 'TEAM', icon: '👥', color: UIC.purple, size: 22, onClick: () => app.go('chars', { mode: 'adventure', humans: 1, backTo: 'adventure', region: ri, stage: -1 }) });
  },
};

// ---------------------------------------------------------------- STAGE BRIEFING
S.stage = {
  draw(ctx, app, t) {
    const p = app.params;
    if (p.stage < 0 || p.stage == null) { app.go('adventure'); return; }
    const A = HC.Adventure, reg = HC.ADVENTURE[p.region], st = reg.stages[p.stage];
    courtBackdrop(ctx, reg.court, t, 0.7);
    UI.header(ctx, app, st.name, () => app.go('adventure'), { sub: reg.icon + ' ' + reg.name + '  •  Stage ' + (p.stage + 1) + ' of 5', color: reg.color });
    const mine = (HC.Save.data.advTeam && HC.Save.data.advTeam.length >= 2) ? HC.Save.data.advTeam : ['pip', 'noodle'];
    const jc = HC.Cosmetics.jersey();
    // your team
    UI.panel(ctx, 30, 120, 330, 420);
    UI.text(ctx, 'YOUR TEAM', 195, 150, 24, UIC.cyan, 'center', 5);
    mine.slice(0, 2).forEach((id, i) => HC.drawPortrait(ctx, id, 120 + i * 150, 420, 210, jc, 'happy', { pose: Math.sin(t * 2 + i) > 0.6 ? 'cheer' : '' }));
    UI.small(ctx, mine.slice(0, 2).map(id => HC.charById(id).name).join(' + '), 195, 450, 16, '#fff', 'center', 900);
    UI.button(ctx, app, { x: 85, y: 470, w: 220, h: 50, label: 'CHANGE', icon: '👥', color: UIC.purple, size: 20, onClick: () => app.go('chars', { mode: 'adventure', humans: 1, backTo: 'stage', region: p.region, stage: p.stage }) });
    // opponents
    UI.panel(ctx, W() - 360, 120, 330, 420, { top: 'rgba(110,20,40,0.9)', bottom: 'rgba(40,6,18,0.94)' });
    if (st.boss) {
      const b = HC.bossById(st.boss);
      UI.text(ctx, 'BOSS', W() - 195, 150, 24, UIC.red, 'center', 5);
      ctx.save(); HC.rr(ctx, W() - 350, 170, 310, 300, 16); ctx.clip(); HC.drawPortrait(ctx, b.charId, W() - 195, 520, 380, b.colors, 'happy', { facing: -1 }); ctx.restore();
      UI.text(ctx, b.name, W() - 195, 490, 22, '#fff', 'center', 5);
      UI.wrap(ctx, b.title, W() - 195, 516, 300, 16, 13, 'rgba(255,255,255,0.8)', 'center', 700);
    } else {
      UI.text(ctx, 'OPPONENTS', W() - 195, 150, 24, UIC.red, 'center', 5);
      st.team.chars.forEach((id, i) => HC.drawPortrait(ctx, id, W() - 270 + i * 150, 420, 210, st.team.colors, 'neutral', { facing: -1 }));
      ctx.fillStyle = st.team.colors.main; HC.rr(ctx, W() - 340, 440, 290, 36, 12); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; ctx.stroke();
      UI.text(ctx, st.team.name, W() - 195, 459, 20, '#fff', 'center', 4);
      UI.small(ctx, 'CPU: ' + st.diff.toUpperCase() + '   •   first to ' + st.win, W() - 195, 500, 15, '#fff', 'center', 900);
    }
    // centre: VS, rules, objectives, rewards
    UI.text(ctx, 'VS', W() / 2, 150, 60, UIC.yellow, 'center', 9);
    UI.panel(ctx, 390, 190, 500, 350);
    let y = 216;
    if (st.mutator) {
      const mu = HC.mutatorById(st.mutator);
      ctx.fillStyle = mu.color; HC.rr(ctx, 410, y - 14, 460, 44, 12); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 2; ctx.stroke();
      UI.small(ctx, mu.icon + '  ALL-MATCH MUTATOR: ' + mu.name.toUpperCase(), 426, y + 8, 15, '#fff', 'left', 900); y += 52;
    } else { UI.small(ctx, st.boss ? '👑 Drain the boss HP before it scores ' + HC.CONFIG.BOSS_WIN_SCORE : '🃏 Mutator cards after each point', 640, y + 6, 15, 'rgba(255,255,255,0.75)', 'center', 800); y += 40; }
    UI.small(ctx, 'OBJECTIVES', 410, y, 13, 'rgba(255,255,255,0.6)', 'left', 900); y += 24;
    const best = A.stars(p.region, p.stage);
    A.objectives(st).forEach((o, i) => { UI.star(ctx, 424, y, 11, i < best); UI.small(ctx, A.objText(o), 444, y, 16, '#fff', 'left', 800); y += 32; });
    y += 6;
    UI.small(ctx, best ? 'REPLAY REWARD' : 'FIRST-CLEAR REWARD', 410, y, 13, 'rgba(255,255,255,0.6)', 'left', 900); y += 34;
    UI.text(ctx, '🪙 ' + (best ? Math.round(st.reward.coins * 0.25) : st.reward.coins), 424, y, 26, UIC.yellow, 'left', 5);
    const u = st.reward.unlock;
    if (u) {
      drawItemIcon(ctx, u, 600, y, 22, t);
      UI.small(ctx, HC.Adventure.unlockLabel(u), 630, y - 8, 14, best ? 'rgba(255,255,255,0.5)' : '#fff', 'left', 900);
      UI.small(ctx, best ? 'CLAIMED ✔' : 'NEW!', 630, y + 12, 13, best ? UIC.green : UIC.pink, 'left', 900);
    }
    UI.button(ctx, app, { x: W() / 2 - 160, y: 580, w: 320, h: 84, label: 'PLAY!', icon: '▶', color: UIC.green, size: 40, onClick: () => app.startAdventure(p.region, p.stage) });
  },
};

// ---------------------------------------------------------------- LOCKER
S.locker = {
  enter(app) { app.params = { tab: (app.params && app.params.tab) || 'ball' }; },
  draw(ctx, app, t) {
    UI.bg(ctx, t, '#06a77d');
    UI.header(ctx, app, 'LOCKER', () => app.go('title'), { sub: 'Equip ball skins and jerseys. Earn coins in every mode, unlock rare gear in Adventure.' });
    const p = app.params, sv = HC.Save.data;
    [['ball', 'BALLS', '🏀'], ['jersey', 'JERSEYS', '👕']].forEach(([k, lb, ic], i) => UI.button(ctx, app, { x: W() / 2 - 250 + i * 260, y: 112, w: 240, h: 54, label: lb, icon: ic, color: p.tab === k ? UIC.orange : UIC.grey, size: 22, onClick: () => { p.tab = k; } }));
    const ids = p.tab === 'ball' ? Object.keys(HC.BALL_SKINS) : Object.keys(HC.JERSEYS);
    const cols = 6, cw = 190, ch = 210, gap = 14, x0 = W() / 2 - (cols * cw + (cols - 1) * gap) / 2;
    const equipped = p.tab === 'ball' ? HC.Cosmetics.ballSkin() : ((sv.equip || {}).jersey || 'blue');
    ids.forEach((id, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = 190 + Math.floor(i / cols) * (ch + gap);
      const owned = HC.Cosmetics.owned(p.tab, id), shop = HC.SHOP.find(s => s.kind === p.tab && s.id === id);
      const isEq = equipped === id;
      const r = { x, y, w: cw, h: ch, onClick: () => {
        if (owned) { HC.Cosmetics.equip(p.tab, id); HC.Audio.card(); }
        else if (shop && (sv.coins || 0) >= shop.price) { HC.Cosmetics.buy(shop); HC.Cosmetics.equip(p.tab, id); HC.Audio.fanfare(); }
        else HC.Audio.groan();
      } };
      const on = UI.hit(app, r);
      ctx.save(); ctx.translate(0, on ? -3 : 0);
      UI.panel(ctx, x, y, cw, ch, isEq ? { border: UIC.yellow, top: 'rgba(90,60,20,0.92)' } : on ? { border: '#fff' } : null);
      if (!owned) ctx.globalAlpha = 0.45;
      if (p.tab === 'ball') { ctx.save(); ctx.translate(x + cw / 2, y + 80); ctx.rotate(t * (on ? 3 : 0.6)); HC.drawBall(ctx, [0, 0, 0, 46, id, -1, 0, 0]); ctx.restore(); }
      else drawJersey(ctx, x + cw / 2, y + 80, 100, HC.JERSEYS[id]);
      ctx.globalAlpha = 1;
      const name = p.tab === 'ball' ? HC.BALL_SKINS[id].name : HC.JERSEYS[id].name;
      UI.text(ctx, name, x + cw / 2, y + 150, 17, '#fff', 'center', 4);
      let status, scol;
      if (isEq) { status = 'EQUIPPED'; scol = UIC.yellow; }
      else if (owned) { status = 'TAP TO EQUIP'; scol = UIC.green; }
      else if (shop) { status = '🪙 ' + shop.price; scol = (sv.coins || 0) >= shop.price ? UIC.yellow : UIC.red; }
      else { status = '🔒 ADVENTURE'; scol = 'rgba(255,255,255,0.6)'; }
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; HC.rr(ctx, x + 14, y + 172, cw - 28, 26, 13); ctx.fill();
      UI.small(ctx, status, x + cw / 2, y + 185, 13, scol, 'center', 900);
      ctx.restore();
    });
    // preview
    UI.small(ctx, 'Your look:', 70, 650, 15, '#fff', 'left', 900);
    HC.drawPortrait(ctx, (sv.advTeam || ['pip'])[0], 190, 700, 110, HC.Cosmetics.jersey(), 'happy', { noShadow: true });
    ctx.save(); ctx.translate(250, 660); ctx.rotate(t); HC.drawBall(ctx, [0, 0, 0, 18, HC.Cosmetics.ballSkin(), -1, 0, 0]); ctx.restore();
  },
};

// ---------------------------------------------------------------- TOURNAMENT
S.bracket = {
  draw(ctx, app, t) {
    UI.bg(ctx, t, '#2e86ff');
    const tour = app.tournament;
    UI.header(ctx, app, 'TOURNAMENT', tour.done ? null : () => app.quitToMenu());
    const names = ['QUARTER-FINALS', 'SEMI-FINALS', 'FINAL'];
    const colX = [60, 410, 760], boxW = 300, boxH = 32;
    for (let r = 0; r < 3; r++) {
      UI.small(ctx, names[r], colX[r] + boxW / 2, 108, 15, r === tour.round && !tour.done ? UIC.yellow : 'rgba(255,255,255,0.55)', 'center', 900);
      const pairs = tour.rounds[r] || [];
      const n = r === 0 ? 4 : r === 1 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const span = 500 / n, cy = 130 + span * i + span / 2;
        const pr = pairs[i], res = tour.results[r] && tour.results[r][i];
        [0, 1].forEach(k => {
          const y = cy - boxH - 3 + k * (boxH + 6);
          const ti = pr ? pr[k] : null, team = ti != null ? tour.teams[ti] : null;
          const lost = res && res.winner !== ti, won = res && res.winner === ti;
          ctx.fillStyle = team ? (lost ? 'rgba(40,30,70,0.85)' : team.colors.main) : 'rgba(255,255,255,0.08)';
          HC.rr(ctx, colX[r], y, boxW, boxH, 10); ctx.fill();
          ctx.strokeStyle = ti === 0 ? UIC.yellow : UIC.ink; ctx.lineWidth = ti === 0 ? 4 : 2.5; ctx.stroke();
          if (team) {
            UI.text(ctx, team.name, colX[r] + 12, y + boxH / 2, 16, lost ? '#8a83a6' : '#fff', 'left', 3);
            if (res) UI.text(ctx, String(res.score[k]) + (won ? ' ✔' : ''), colX[r] + boxW - 12, y + boxH / 2, 16, '#fff', 'right', 3);
          } else UI.small(ctx, 'TBD', colX[r] + 12, y + boxH / 2, 13, 'rgba(255,255,255,0.4)', 'left', 900);
        });
        if (r < 2) { ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(colX[r] + boxW, cy); ctx.lineTo(colX[r] + boxW + 50, cy); ctx.stroke(); }
      }
    }
    const champ = tour.champion != null ? tour.teams[tour.champion] : null;
    ctx.font = '84px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🏆', 1160, 360 + Math.sin(t * 2) * 5);
    UI.text(ctx, champ ? champ.name : 'CHAMPION', 1160, 430, 16, UIC.yellow, 'center', 3);
    const up = Object.entries(tour.upgradeNames).map(([k, n]) => k + (n > 1 ? ' x' + n : '')).join(', ');
    UI.small(ctx, '⬆ Your upgrades: ' + (up || 'none yet'), W() / 2, 610, 15, '#fff', 'center', 800);
    if (tour.done) UI.button(ctx, app, { x: W() / 2 - 150, y: 636, w: 300, h: 64, label: 'MENU', icon: '⌂', color: UIC.grey, onClick: () => app.quitToMenu() });
    else {
      const opp = tour.teams[tour.opponent()];
      UI.button(ctx, app, { x: W() / 2 - 260, y: 636, w: 520, h: 66, label: 'PLAY ' + names[tour.round] + ' vs ' + opp.name, icon: '▶', color: UIC.green, size: 20, onClick: () => app.playTournamentMatch() });
    }
  },
};

S.upgrade = {
  draw(ctx, app, t) {
    UI.bg(ctx, t, '#2e86ff');
    UI.header(ctx, app, 'PICK AN UPGRADE', null, { sub: 'Permanent for the rest of the tournament' });
    app.params.choices.forEach((u, i) => {
      const x = W() / 2 - 465 + i * 320, y = 190, r = { x, y, w: 290, h: 330, onClick: () => { app.tournament.addUpgrade(u); HC.Audio.card(); app.go('bracket'); } };
      const on = UI.hit(app, r);
      ctx.save(); ctx.translate(0, on ? -8 : 0);
      ctx.fillStyle = HC.shade(u.color, -0.5); HC.rr(ctx, x, y + 8, 290, 330, 24); ctx.fill(); ctx.strokeStyle = UIC.ink; ctx.lineWidth = 3; ctx.stroke();
      const g = ctx.createLinearGradient(0, y, 0, y + 330); g.addColorStop(0, HC.shade(u.color, 0.25)); g.addColorStop(1, u.color);
      ctx.fillStyle = g; HC.rr(ctx, x, y, 290, 330, 24); ctx.fill(); ctx.stroke();
      if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; HC.rr(ctx, x + 5, y + 5, 280, 320, 20); ctx.stroke(); }
      ctx.font = '96px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(u.icon, x + 145, y + 110);
      UI.text(ctx, u.name, x + 145, y + 210, 28, '#fff', 'center', 6);
      UI.small(ctx, u.desc, x + 145, y + 255, 17, '#fff', 'center', 800);
      ctx.restore();
    });
  },
};

S.trophy = {
  enter(app) { app.trophyFx = new HC.FX(); HC.Audio.fanfare(); HC.Audio.cheer(); },
  draw(ctx, app, t) {
    const g = ctx.createRadialGradient(W() / 2, 300, 50, W() / 2, 300, 760); g.addColorStop(0, '#6b4a00'); g.addColorStop(1, '#130900'); ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H());
    for (let i = 0; i < 16; i++) { ctx.save(); ctx.translate(W() / 2, 320); ctx.rotate(t * 0.3 + i * Math.PI / 8); ctx.fillStyle = 'rgba(255,215,0,0.07)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -800); ctx.lineTo(60, -800); ctx.fill(); ctx.restore(); }
    if (Math.random() < 0.08) app.trophyFx.confetti();
    app.trophyFx.update(1 / 60);
    ctx.save(); ctx.translate(W() / 2, 330 + Math.sin(t * 2) * 6);
    const gold = ctx.createLinearGradient(-90, 0, 90, 0); gold.addColorStop(0, '#b8860b'); gold.addColorStop(0.5, '#ffe970'); gold.addColorStop(1, '#b8860b');
    ctx.fillStyle = gold; ctx.strokeStyle = '#5a3d00'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-90, -130); ctx.lineTo(90, -130); ctx.quadraticCurveTo(90, 10, 0, 30); ctx.quadraticCurveTo(-90, 10, -90, -130); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 14; ctx.strokeStyle = gold; ctx.beginPath(); ctx.arc(-95, -80, 40, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(95, -80, 40, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.fillStyle = gold; ctx.fillRect(-18, 25, 36, 60); ctx.fillRect(-70, 85, 140, 30);
    HC.drawBall(ctx, [0, -60, t, 34, 'gold', -1, 0, 0]);
    ctx.restore();
    app.trophyFx.draw(ctx);
    UI.text(ctx, app.params.title || 'CHAMPIONS!', W() / 2, 90, 80, UIC.yellow, 'center', 11);
    UI.small(ctx, app.params.line || (app.params.teamName + ' won the Hoop Chaos Tournament!'), W() / 2, 150, 22, '#fff', 'center', 800);
    if (!app.params.line) UI.text(ctx, '🔓 BOSS BATTLES UNLOCKED!', W() / 2, 530, 30, '#ff6b6b', 'center', 6);
    UI.button(ctx, app, { x: W() / 2 - 330, y: 590, w: 300, h: 70, label: app.params.line ? 'ADVENTURE' : 'BOSSES', icon: app.params.line ? '🗺️' : '👹', color: UIC.red, onClick: () => app.go(app.params.line ? 'adventure' : 'bossSelect') });
    UI.button(ctx, app, { x: W() / 2 + 30, y: 590, w: 300, h: 70, label: 'MENU', icon: '⌂', color: UIC.grey, onClick: () => app.quitToMenu() });
  },
};

// ---------------------------------------------------------------- BOSSES
S.bossSelect = {
  draw(ctx, app, t) {
    UI.bg(ctx, t, '#e63946');
    UI.header(ctx, app, 'BOSS BATTLES', () => app.quitToMenu(), { color: '#ff6b6b', sub: 'Your 2 players vs 1 giant boss. Drain its HP before it scores ' + HC.CONFIG.BOSS_WIN_SCORE + '.' });
    const sv = HC.Save.data;
    HC.BOSSES.forEach((b, i) => {
      const x = W() / 2 - 610 + i * 305, y = 130;
      const locked = b.final && !app.settings.unlockAll && !HC.Admin.all() && HC.BOSSES.filter(o => !o.final).some(o => !sv.bosses[o.id]);
      const beaten = sv.bosses[b.id];
      const on = UI.hit(app, { x: x + 10, y, w: 285, h: 440, disabled: locked, onClick: () => app.go('chars', { mode: 'boss', humans: 1, bossId: b.id }) });
      ctx.save(); ctx.translate(0, on ? -5 : 0);
      UI.panel(ctx, x + 10, y, 285, 440, { top: 'rgba(110,20,40,0.92)', bottom: 'rgba(30,5,12,0.95)', border: on ? '#ff6b6b' : null });
      ctx.save(); HC.rr(ctx, x + 18, y + 8, 269, 300, 14); ctx.clip();
      const g = ctx.createRadialGradient(x + 152, y + 160, 10, x + 152, y + 160, 200); g.addColorStop(0, HC.shade(b.colors.main, 0.3)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 300, 320);
      ctx.globalAlpha = locked ? 0.15 : 1; HC.drawPortrait(ctx, b.charId, x + 152, y + 330, 300, b.colors, on ? 'happy' : 'neutral', { noShadow: true }); ctx.restore();
      UI.text(ctx, locked ? '???' : b.name, x + 152, y + 336, 22, '#fff', 'center', 5);
      UI.wrap(ctx, locked ? 'Beat the other 3 bosses to unlock the final boss.' : b.title, x + 152, y + 368, 250, 17, 14, 'rgba(255,255,255,0.8)', 'center', 700);
      if (locked) UI.text(ctx, '🔒', x + 152, y + 160, 64, '#fff', 'center', 0);
      if (beaten) { ctx.fillStyle = UIC.green; HC.rr(ctx, x + 92, y + 404, 120, 26, 13); ctx.fill(); UI.small(ctx, '✔ BEATEN', x + 152, y + 417, 14, UIC.ink, 'center', 900); }
      ctx.restore();
    });
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
    HC.drawPortrait(ctx, b.charId, W() * 0.28 - (1 - px) * 600, 660, 580, b.colors, 'happy');
    if (k > 0.7) {
      const s = Math.max(1, 3 - (k - 0.7) * 10);
      ctx.save(); ctx.translate(W() * 0.66, 250); ctx.scale(s, s); ctx.rotate(-0.06);
      UI.text(ctx, b.name, 0, 0, 70, '#ff3b3b', 'center', 11); ctx.restore();
    }
    if (k > 1.2) {
      UI.small(ctx, b.title, W() * 0.66, 330, 21, '#fff', 'center', 800);
      UI.small(ctx, 'Special: ' + b.specials.map(id => HC.SPECIALS[id].icon + ' ' + HC.SPECIALS[id].name).join('   '), W() * 0.66, 370, 19, UIC.yellow, 'center', 900);
      UI.small(ctx, 'Watch for the ⚠ warning - then get out of the way!', W() * 0.66, 404, 15, '#ccc', 'center', 700);
    }
    if (k > 1.6) UI.button(ctx, app, { x: W() * 0.66 - 160, y: 470, w: 320, h: 80, label: 'FIGHT!', icon: '⚔️', color: '#c0392b', size: 36, onClick: () => { const p = app.params; if (p.mode === 'adventure') app.launch(); else { p.court = b.court; app.startMatch(p); } } });
  },
};

// ---------------------------------------------------------------- SETTINGS
S.settings = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'SETTINGS', () => app.go('title'));
    const st = app.settings;
    UI.panel(ctx, W() / 2 - 420, 110, 840, 470);
    const row = (y, label, value, minus, plus) => {
      UI.text(ctx, label, W() / 2 - 380, y + 26, 24, '#fff', 'left', 4);
      UI.button(ctx, app, { x: W() / 2 + 90, y, w: 56, h: 50, label: '–', color: UIC.grey, onClick: minus, size: 26 });
      UI.text(ctx, value, W() / 2 + 230, y + 26, 24, UIC.yellow, 'center', 4);
      UI.button(ctx, app, { x: W() / 2 + 314, y, w: 56, h: 50, label: '+', color: UIC.grey, onClick: plus, size: 26 });
    };
    row(130, 'VOLUME', Math.round(st.volume * 100) + '%', () => app.setSetting('volume', Math.max(0, +(st.volume - 0.1).toFixed(2))), () => app.setSetting('volume', Math.min(1, +(st.volume + 0.1).toFixed(2))));
    row(195, 'POINTS TO WIN', String(st.winScore), () => app.setSetting('winScore', Math.max(2, st.winScore - 1)), () => app.setSetting('winScore', Math.min(30, st.winScore + 1)));
    const diffs = ['easy', 'medium', 'hard'];
    row(260, 'CPU DIFFICULTY', st.difficulty.toUpperCase(), () => app.setSetting('difficulty', diffs[Math.max(0, diffs.indexOf(st.difficulty) - 1)]), () => app.setSetting('difficulty', diffs[Math.min(2, diffs.indexOf(st.difficulty) + 1)]));
    const times = HC.MATCH_TIMES, ti = Math.max(0, times.indexOf(st.matchTime));
    row(325, 'GAME TIME LIMIT', UI.timeLabel(st.matchTime), () => app.setSetting('matchTime', times[Math.max(0, ti - 1)]), () => app.setSetting('matchTime', times[Math.min(times.length - 1, ti + 1)]));
    row(390, 'SCREEN SHAKE', st.shake ? 'ON' : 'OFF', () => app.setSetting('shake', !st.shake), () => app.setSetting('shake', !st.shake));
    row(455, 'UNLOCK ALL (testing)', st.unlockAll ? 'ON' : 'OFF', () => app.setSetting('unlockAll', !st.unlockAll), () => app.setSetting('unlockAll', !st.unlockAll));
    UI.small(ctx, 'Signed in: ' + HC.Auth.label(), W() / 2, 545, 15, 'rgba(255,255,255,0.7)', 'center', 800);
    UI.button(ctx, app, { x: W() / 2 - 410, y: 610, w: 260, h: 60, label: 'ACCOUNT', icon: '👤', color: '#1b6d5a', size: 22, onClick: () => HC.LoginPage.show() });
    UI.button(ctx, app, { x: W() / 2 - 130, y: 610, w: 260, h: 60, label: 'ADMIN PANEL', icon: '🔐', color: '#b5179e', size: 20, onClick: () => HC.Admin.open() });
    UI.button(ctx, app, { x: W() / 2 + 150, y: 610, w: 260, h: 60, label: 'RESET SAVE', icon: '🗑', color: UIC.red, size: 20, onClick: () => { if (confirm('Erase all progress on this profile?')) HC.Save.reset(); } });
  },
};

// ---------------------------------------------------------------- HELP
S.help = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'HOW TO PLAY', () => app.go('title'));
    const box = (x, y, w, h, title, icon, lines, col) => {
      UI.panel(ctx, x, y, w, h);
      UI.text(ctx, icon + ' ' + title, x + 22, y + 32, 24, col, 'left', 5);
      lines.forEach((l, i) => UI.wrap(ctx, l, x + 24, y + 70 + i * 46, w - 48, 19, 15, '#fff', 'left', 700));
    };
    box(40, 110, 590, 270, 'ONE BUTTON', '🎮', ['Player 1 = W   •   Player 2 = ↑   •   touch: big buttons', 'HOLD to crouch & wind up, RELEASE to jump and swing.', 'Holding the ball? Jump, then TAP again near the top of the jump to SHOOT.', 'Touch the ball to grab it - swipe a rival\'s ball to steal it.'], UIC.yellow);
    box(650, 110, 590, 270, 'SPECIALS', '⚡', ['Every character has an ability. Your team\'s SPECIAL meter fills during play.', 'When it\'s full, keep HOLDING past a full wind-up (the bar turns pink) and release.', 'Both of your players fire their abilities at once!', 'Steals and getting scored on fill the meter faster.'], UIC.pink);
    box(40, 400, 590, 280, 'SCORING', '🏀', ['2 points inside the line, 3 outside. Every trick shot adds +1:', 'Bank • Dunk • Header • Full-Court • Upside-Down • Buzzer Beater • Off-the-Rim', 'After each basket, the team that got scored on picks a MUTATOR card.', 'Watch for the flashing ⚠ - every court has a live event!'], UIC.cyan);
    box(650, 400, 590, 280, 'PROGRESS', '🗺️', ['ADVENTURE: 6 worlds, 30 stages, 3 stars each. Unlock heroes & gear.', 'Earn 🪙 coins in every mode and spend them in the LOCKER.', 'Win a TOURNAMENT to unlock BOSS BATTLES. Beat bosses to play as them.', 'Log in to keep your progress - Esc / P pauses.'], UIC.green);
  },
};

S.roster = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'ROSTER', () => app.go('title'), { sub: HC.CHARACTERS.filter(c => HC.isUnlocked(c)).length + ' / ' + HC.CHARACTERS.length + ' unlocked' });
    HC.CHARACTERS.forEach((c, i) => {
      const cw = 232, x = 26 + (i % 5) * (cw + 12), y = 108 + Math.floor(i / 5) * 200;
      const locked = !HC.isUnlocked(c), ab = HC.abilityOf(c);
      UI.panel(ctx, x, y, cw, 188);
      ctx.save(); HC.rr(ctx, x + 8, y + 8, 92, 172, 12); ctx.clip();
      ctx.fillStyle = locked ? '#1a1630' : '#2e86ff'; ctx.fillRect(x + 8, y + 8, 92, 172);
      ctx.globalAlpha = locked ? 0.2 : 1; HC.drawPortrait(ctx, c.id, x + 54, y + 170, 140, { main: '#2e86ff', alt: '#fff' }, 'happy', { noShadow: true }); ctx.restore();
      if (locked) UI.text(ctx, '🔒', x + 54, y + 90, 34, '#fff', 'center', 0);
      UI.text(ctx, locked ? '???' : c.name, x + 110, y + 26, c.name.length > 11 ? 15 : 18, '#fff', 'left', 4);
      UI.wrap(ctx, locked ? unlockHint(c) : c.perk, x + 110, y + 54, cw - 118, 15, 12, 'rgba(255,255,255,0.8)', 'left', 700);
      if (ab) { UI.small(ctx, ab.icon + ' ' + (locked ? '???' : ab.name), x + 110, y + 124, 13, UIC.yellow, 'left', 900); if (!locked) UI.wrap(ctx, ab.desc, x + 110, y + 146, cw - 118, 14, 11, 'rgba(255,255,255,0.7)', 'left', 700); }
    });
  },
};

// ---------------------------------------------------------------- ADMIN PANEL
S.admin = {
  draw(ctx, app, t) {
    UI.bg(ctx, t, '#b5179e');
    UI.header(ctx, app, 'ADMIN PANEL', () => app.go('settings'), { color: '#ff7ae5', sub: '🦾 Welcome back. Changes save to this profile.' });
    const a = HC.Admin.state();
    const toggle = (x, y, label, key, desc) => {
      UI.panel(ctx, x, y, 400, 74);
      UI.text(ctx, label, x + 18, y + 26, 19, '#fff', 'left', 4);
      UI.small(ctx, desc, x + 18, y + 52, 12, 'rgba(255,255,255,0.7)', 'left', 700);
      UI.button(ctx, app, { x: x + 300, y: y + 14, w: 86, h: 44, label: a[key] ? 'ON' : 'OFF', color: a[key] ? UIC.green : UIC.grey, size: 18, onClick: () => { a[key] = !a[key]; HC.Save.save(); } });
    };
    toggle(30, 110, 'UNLOCK EVERYTHING', 'unlockAll', 'All characters, gear, stages & bosses');
    toggle(30, 194, 'INFINITE SPECIAL', 'infiniteSpecial', 'Your SPECIAL is always ready');
    toggle(30, 278, 'SHOW HITBOXES', 'debug', 'Draws physics bodies in matches');
    toggle(30, 362, 'CHAOS MODE', 'chaos', 'A random mutator is always on');
    // speed
    UI.panel(ctx, 30, 446, 400, 110);
    UI.text(ctx, 'GAME SPEED', 48, 474, 19, '#fff', 'left', 4);
    [0.5, 1, 1.5, 2].forEach((s, i) => UI.button(ctx, app, { x: 48 + i * 94, y: 496, w: 84, h: 44, label: s + 'x', color: (a.speed || 1) === s ? UIC.green : UIC.grey, size: 18, onClick: () => { a.speed = s; HC.Save.save(); } }));
    // jump power
    UI.panel(ctx, 30, 570, 400, 110);
    UI.text(ctx, 'JUMP POWER', 48, 598, 19, '#fff', 'left', 4);
    [1, 1.3, 1.6, 2].forEach((s, i) => UI.button(ctx, app, { x: 48 + i * 94, y: 620, w: 84, h: 44, label: s + 'x', color: (a.jump || 1) === s ? UIC.green : UIC.grey, size: 18, onClick: () => { a.jump = s; HC.Save.save(); } }));
    // actions
    UI.panel(ctx, 460, 110, 790, 296);
    UI.text(ctx, 'QUICK ACTIONS', 480, 140, 22, UIC.yellow, 'left', 4);
    const acts = [
      ['+1,000 COINS', '🪙', () => { HC.Cosmetics.addCoins(1000); HC.Audio.fanfare(); }],
      ['3-STAR ADVENTURE', '⭐', () => { HC.Admin.maxAdventure(); HC.Audio.fanfare(); }],
      ['BEAT ALL BOSSES', '👑', () => { HC.Admin.beatBosses(); HC.Audio.fanfare(); }],
      ['GIVE ALL GEAR', '🎒', () => { HC.Admin.allGear(); HC.Audio.fanfare(); }],
      ['ADD A TROPHY', '🏆', () => { HC.Save.data.trophies++; HC.Save.save(); HC.Audio.fanfare(); }],
      ['RESET ADVENTURE', '♻️', () => { if (confirm('Reset all Adventure stars?')) { HC.Save.data.adv = { stars: {}, cleared: {}, region: 0 }; HC.Save.save(); } }],
    ];
    acts.forEach((b, i) => UI.button(ctx, app, { x: 480 + (i % 3) * 252, y: 166 + Math.floor(i / 3) * 104, w: 238, h: 84, label: b[0], icon: b[1], color: i === 5 ? UIC.red : '#7209b7', size: 17, onClick: b[2] }));
    // CPU override + test match
    UI.panel(ctx, 460, 420, 790, 260);
    UI.text(ctx, 'TEST MATCH', 480, 450, 22, UIC.yellow, 'left', 4);
    UI.small(ctx, 'Opponent CPU level:', 480, 490, 15, '#fff', 'left', 800);
    ['easy', 'medium', 'hard'].forEach((d, i) => UI.button(ctx, app, { x: 650 + i * 130, y: 468, w: 120, h: 44, label: d.toUpperCase(), color: app.settings.difficulty === d ? UIC.green : UIC.grey, size: 16, onClick: () => app.setSetting('difficulty', d) }));
    UI.small(ctx, 'Force mutator:', 480, 546, 15, '#fff', 'left', 800);
    const mutIdx = HC.MUTATORS.findIndex(m => m.id === a.forceMut);
    const mut = HC.MUTATORS[mutIdx];
    UI.button(ctx, app, { x: 650, y: 524, w: 380, h: 44, label: mut ? mut.icon + ' ' + mut.name : 'NONE', color: mut ? mut.color === '#111' ? '#333' : mut.color : UIC.grey, size: 17, onClick: () => { const next = mutIdx + 1; a.forceMut = next < HC.MUTATORS.length ? HC.MUTATORS[next].id : null; HC.Save.save(); } });
    UI.small(ctx, '(click to cycle)', 1040, 546, 12, 'rgba(255,255,255,0.6)', 'left', 700);
    UI.button(ctx, app, { x: 480, y: 592, w: 360, h: 70, label: 'PLAY TEST MATCH', icon: '▶', color: UIC.green, size: 22, onClick: () => app.startMatch({ mode: 'quick', humans: 1, picks: [HC.Save.data.lastPicks && HC.Save.data.lastPicks.length >= 2 ? HC.Save.data.lastPicks : ['pip', 'noodle'], []], court: HC.U.pick(HC.COURTS).id }) });
    UI.button(ctx, app, { x: 860, y: 592, w: 370, h: 70, label: 'LOCK ADMIN', icon: '🔒', color: UIC.red, size: 22, onClick: () => { a.enabled = false; HC.Save.save(); app.go('settings'); } });
  },
};
