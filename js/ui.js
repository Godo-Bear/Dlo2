// UI: effects, HUD and every menu screen (immediate-mode canvas UI with a shared design system).
// Visual language: dark slate, single orange accent, condensed italic type, angled shapes, line icons.
window.HC = window.HC || {};

// ================================================================ design tokens
const UIC = {
  ink: '#07090f', bg1: '#07090f', bg2: '#111827', panel: '#131b2a', panel2: '#0c121d',
  line: 'rgba(255,255,255,0.09)', text: '#f3f5f9', muted: '#8b95a8', dim: '#5b6578',
  orange: '#ff6a13', yellow: '#ffb020', pink: '#ff6a13', cyan: '#3fa9f5', green: '#2fd38a',
  purple: '#3a4a68', red: '#ff4757', grey: '#232c3d', gold: '#e8b443',
};
HC.UIC = UIC;
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu;
const clean = (s) => String(s).replace(EMOJI, '').replace(/\s{2,}/g, ' ').trim();
HC.cleanText = clean;

// ================================================================ line icons
// HC.icon(ctx, name, x, y, size, color) - simple stroked glyphs (no emoji in the UI)
HC.ICON_ALIAS = { '▶': 'play', '◀': 'back', '⚙️': 'gear', '⚙': 'gear', '👥': 'users', '❓': 'help', '🔒': 'lock', '🏆': 'trophy', '🏀': 'ball',
  '🎒': 'bag', '💣': 'bomb', '🐴': 'target', '👹': 'crown', '👑': 'crown', '🪙': 'coin', '⭐': 'star', '✔': 'check', '✖': 'cross', '↻': 'refresh',
  '🗺️': 'map', '⌂': 'home', '⚡': 'bolt', '🎲': 'dice', '👤': 'user', '🔐': 'lock', '🗑': 'trash', '⚔️': 'play', '⏸': 'pause', '🦾': 'bolt' };
HC.icon = function (ctx, name, x, y, s, color) {
  name = HC.ICON_ALIAS[name] || name;
  const r = s / 2;
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = color || '#fff'; ctx.fillStyle = color || '#fff'; ctx.lineWidth = Math.max(1.6, s * 0.1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const P = (pts, close, fill) => { ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a * r, b * r) : ctx.moveTo(a * r, b * r)); if (close) ctx.closePath(); fill ? ctx.fill() : ctx.stroke(); };
  switch (name) {
    case 'play': P([[-0.5, -0.75], [0.75, 0], [-0.5, 0.75]], true, true); break;
    case 'back': P([[0.5, -0.75], [-0.6, 0], [0.5, 0.75]]); break;
    case 'pause': ctx.fillRect(-r * 0.55, -r * 0.7, r * 0.38, r * 1.4); ctx.fillRect(r * 0.17, -r * 0.7, r * 0.38, r * 1.4); break;
    case 'gear': ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, 7); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62); ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); ctx.stroke(); } ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, 7); ctx.stroke(); break;
    case 'user': ctx.beginPath(); ctx.arc(0, -r * 0.35, r * 0.35, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, r * 0.75, r * 0.65, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); break;
    case 'users': ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.3, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(-r * 0.3, r * 0.75, r * 0.55, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.4, -r * 0.35, r * 0.26, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.45, r * 0.6, r * 0.45, Math.PI * 1.2, Math.PI * 1.9); ctx.stroke(); break;
    case 'help': ctx.beginPath(); ctx.arc(0, -r * 0.25, r * 0.42, Math.PI * 1.05, Math.PI * 0.45); ctx.lineTo(0, r * 0.35); ctx.stroke(); ctx.beginPath(); ctx.arc(0, r * 0.72, r * 0.08, 0, 7); ctx.fill(); break;
    case 'lock': ctx.strokeRect(-r * 0.6, -r * 0.1, r * 1.2, r * 0.9); ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.4, Math.PI, 0); ctx.stroke(); break;
    case 'trophy': P([[-0.55, -0.75], [0.55, -0.75], [0.45, -0.1], [0, 0.2], [-0.45, -0.1]], true); ctx.beginPath(); ctx.moveTo(0, r * 0.2); ctx.lineTo(0, r * 0.6); ctx.moveTo(-r * 0.4, r * 0.75); ctx.lineTo(r * 0.4, r * 0.75); ctx.stroke(); ctx.beginPath(); ctx.arc(-r * 0.62, -r * 0.45, r * 0.22, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.62, -r * 0.45, r * 0.22, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); break;
    case 'ball': ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 7); ctx.moveTo(-r * 0.8, 0); ctx.lineTo(r * 0.8, 0); ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(-r * 0.9, 0, r * 0.6, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.9, 0, r * 0.6, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke(); break;
    case 'bag': ctx.strokeRect(-r * 0.6, -r * 0.3, r * 1.2, r * 1.05); ctx.beginPath(); ctx.arc(0, -r * 0.3, r * 0.32, Math.PI, 0); ctx.stroke(); break;
    case 'bomb': ctx.beginPath(); ctx.arc(-r * 0.1, r * 0.15, r * 0.6, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(r * 0.3, -r * 0.3); ctx.quadraticCurveTo(r * 0.6, -r * 0.8, r * 0.85, -r * 0.6); ctx.stroke(); break;
    case 'target': ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 0.12, 0, 7); ctx.fill(); break;
    case 'crown': P([[-0.75, 0.55], [-0.75, -0.45], [-0.35, 0.05], [0, -0.65], [0.35, 0.05], [0.75, -0.45], [0.75, 0.55]], true); break;
    case 'coin': ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, 7); ctx.stroke(); break;
    case 'star': ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r * 0.9; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); break;
    case 'check': P([[-0.6, 0], [-0.15, 0.5], [0.65, -0.5]]); break;
    case 'cross': P([[-0.5, -0.5], [0.5, 0.5]]); P([[0.5, -0.5], [-0.5, 0.5]]); break;
    case 'refresh': ctx.beginPath(); ctx.arc(0, 0, r * 0.6, -0.3, Math.PI * 1.6); ctx.stroke(); P([[0.62, -0.62], [0.62, -0.08], [0.12, -0.2]], true, true); break;
    case 'map': P([[-0.75, -0.55], [-0.25, -0.75], [0.25, -0.55], [0.75, -0.75], [0.75, 0.55], [0.25, 0.75], [-0.25, 0.55], [-0.75, 0.75]], true); ctx.beginPath(); ctx.moveTo(-r * 0.25, -r * 0.75); ctx.lineTo(-r * 0.25, r * 0.55); ctx.moveTo(r * 0.25, -r * 0.55); ctx.lineTo(r * 0.25, r * 0.75); ctx.stroke(); break;
    case 'home': P([[-0.7, 0], [0, -0.65], [0.7, 0]]); ctx.strokeRect(-r * 0.45, 0, r * 0.9, r * 0.7); break;
    case 'bolt': P([[0.15, -0.85], [-0.45, 0.1], [0, 0.1], [-0.15, 0.85], [0.45, -0.1], [0, -0.1]], true, true); break;
    case 'dice': ctx.strokeRect(-r * 0.65, -r * 0.65, r * 1.3, r * 1.3); [[-0.3, -0.3], [0.3, 0.3], [0, 0]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a * r, b * r, r * 0.1, 0, 7); ctx.fill(); }); break;
    case 'trash': ctx.strokeRect(-r * 0.45, -r * 0.4, r * 0.9, r * 1.1); P([[-0.65, -0.45], [0.65, -0.45]]); P([[-0.2, -0.65], [0.2, -0.65]]); break;
    case 'warn': P([[0, -0.8], [0.85, 0.7], [-0.85, 0.7]], true); ctx.beginPath(); ctx.moveTo(0, -r * 0.25); ctx.lineTo(0, r * 0.2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, r * 0.45, r * 0.06, 0, 7); ctx.fill(); break;
    default: break;
  }
  ctx.restore();
};

// ================================================================ FX
HC.FX = class FX {
  constructor() { this.parts = []; this.pops = []; this.big = null; this.shakeAmt = 0; this.rings = []; }
  burst(x, y, n, colors, speed, life) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * (speed || 4);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: life || 0.6, max: life || 0.6, color: HC.U.pick(colors), size: 2.5 + Math.random() * 3.5, g: 0.15 });
    }
  }
  ring(x, y, color) { this.rings.push({ x, y, color: color || '#fff', t: 0 }); }
  confetti() {
    const cols = ['#ff6a13', '#ffb020', '#ffffff', '#3fa9f5', '#e8b443'];
    for (let i = 0; i < 140; i++) this.parts.push({ x: Math.random() * HC.CONFIG.WIDTH, y: -20 - Math.random() * 300, vx: HC.U.rand(-1, 1), vy: HC.U.rand(1, 4), life: 4, max: 4, color: HC.U.pick(cols), size: 4 + Math.random() * 4, g: 0.03, rect: true, rot: Math.random() * 6 });
  }
  popup(text, x, y, color, size, life) { this.pops.push({ text, x, y, color: color || '#fff', size: (size || 32) * 0.85, life: life || 1.3, max: life || 1.3 }); }
  bigText(text, color, life) { this.big = { text: clean(text), color: color || '#fff', life: life || 1.8, max: life || 1.8 }; }
  shake(a) { if (HC.App && HC.App.settings && HC.App.settings.shake === false) return; this.shakeAmt = Math.max(this.shakeAmt, a); }
  shakeOffset() { const a = this.shakeAmt; return { x: (Math.random() - 0.5) * a, y: (Math.random() - 0.5) * a }; }
  update(dt) {
    this.shakeAmt *= 0.88; if (this.shakeAmt < 0.3) this.shakeAmt = 0;
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= dt; if (p.rot != null) p.rot += 0.1; }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const p of this.pops) { p.y -= 0.7; p.life -= dt; }
    this.pops = this.pops.filter(p => p.life > 0);
    for (const r of this.rings) r.t += dt;
    this.rings = this.rings.filter(r => r.t < 0.6);
    if (this.big) { this.big.life -= dt; if (this.big.life <= 0) this.big = null; }
  }
  draw(ctx) {
    for (const r of this.rings) { ctx.strokeStyle = r.color; ctx.globalAlpha = 1 - r.t / 0.6; ctx.lineWidth = 6 * (1 - r.t / 0.6) + 1; ctx.beginPath(); ctx.ellipse(r.x, r.y, 40 + r.t * 520, 12 + r.t * 90, 0, 0, 7); ctx.stroke(); }
    for (const p of this.parts) {
      ctx.globalAlpha = Math.min(1, p.life / p.max * 2); ctx.fillStyle = p.color;
      if (p.rect) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore(); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.max), 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    for (const p of this.pops) {
      const k = p.life / p.max, s = p.size * (k > 0.88 ? 1 + (k - 0.88) * 2.5 : 1);
      ctx.globalAlpha = Math.min(1, k * 2);
      HC.UI.text(ctx, p.text, p.x, p.y, s, p.color, 'center', 3);
    }
    ctx.globalAlpha = 1;
  }
  // broadcast-style banner for big moments
  drawScreen(ctx) {
    if (!this.big) return;
    const b = this.big, k = b.life / b.max, C = HC.CONFIG;
    const inT = Math.min(1, (1 - k) * b.max * 6), outT = Math.min(1, k * b.max * 5);
    const a = Math.min(inT, outT);
    let size = 54; ctx.font = HC.dfont(size);
    while (ctx.measureText(b.text).width > C.WIDTH - 220 && size > 24) { size -= 2; ctx.font = HC.dfont(size); }
    const w = ctx.measureText(b.text).width + 120, h = size * 1.35, y = 205;
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(C.WIDTH / 2 + (1 - inT) * -120, y);
    const sk = h * 0.35;
    ctx.fillStyle = 'rgba(7,9,15,0.88)';
    ctx.beginPath(); ctx.moveTo(-w / 2 + sk, -h / 2); ctx.lineTo(w / 2 + sk, -h / 2); ctx.lineTo(w / 2 - sk, h / 2); ctx.lineTo(-w / 2 - sk, h / 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = UIC.orange; ctx.beginPath(); ctx.moveTo(-w / 2 + sk, -h / 2); ctx.lineTo(-w / 2 + sk + 10, -h / 2); ctx.lineTo(-w / 2 - sk + 10, h / 2); ctx.lineTo(-w / 2 - sk, h / 2); ctx.closePath(); ctx.fill();
    ctx.fillRect(-w / 2, h / 2 - 3, w * inT, 3);
    HC.UI.text(ctx, b.text, 4, 2, size, b.color === '#fff' || b.color === '#ffffff' ? '#fff' : b.color, 'center', 0);
    ctx.restore();
  }
};

// ================================================================ UI kit
HC.UI = {
  // display text: condensed italic, soft shadow (stroke arg kept for compatibility: >0 adds a thin dark edge)
  text(ctx, str, x, y, size, color, align, stroke) {
    str = clean(str); if (!str) return;
    ctx.font = HC.dfont(size); ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    if ('letterSpacing' in ctx) ctx.letterSpacing = size > 30 ? '1px' : '0.5px';
    const yy = y + size * 0.04;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillText(str, x + 1, yy + Math.max(2, size * 0.05));
    if (stroke) { ctx.strokeStyle = 'rgba(7,9,15,0.85)'; ctx.lineWidth = Math.min(4, Math.max(2, size / 14)); ctx.strokeText(str, x, yy); }
    ctx.fillStyle = color || '#fff'; ctx.fillText(str, x, yy);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  },
  fitText(ctx, str, x, y, size, maxW, color, align) {
    let s = size; ctx.font = HC.dfont(s);
    while (ctx.measureText(clean(str)).width > maxW && s > 10) { s -= 1; ctx.font = HC.dfont(s); }
    this.text(ctx, str, x, y, s, color, align, 0);
  },
  small(ctx, str, x, y, size, color, align, weight) {
    str = clean(str); if (!str) return;
    ctx.font = Math.min(800, weight || 600) + ' ' + Math.round((size || 16) * 0.92) + 'px ' + HC.FONT_BODY; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color || UIC.text; ctx.fillText(str, x, y);
  },
  caps(ctx, str, x, y, size, color, align) { // small spaced uppercase label
    ctx.font = '700 ' + Math.round(size || 12) + 'px ' + HC.FONT_BODY; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    ctx.fillStyle = color || UIC.muted; ctx.fillText(clean(str).toUpperCase(), x, y);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  },
  wrap(ctx, str, x, y, maxW, lh, size, color, align, weight) {
    ctx.font = Math.min(800, weight || 500) + ' ' + Math.round((size || 15) * 0.92) + 'px ' + HC.FONT_BODY; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color || UIC.text; HC.wrapText(ctx, clean(str), x, y, maxW, lh);
  },
  hover(app, r) { return app.mouse.x > r.x && app.mouse.x < r.x + r.w && app.mouse.y > r.y && app.mouse.y < r.y + r.h; },
  hit(app, r) { const idx = app.hits.length; app.hits.push(r); return !r.disabled && (app.focus === idx || this.hover(app, r)); },

  slant(ctx, x, y, w, h, s) {
    ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - s, y + h); ctx.lineTo(x, y + h); ctx.closePath();
  },

  // angled button
  button(ctx, app, b) {
    const on = this.hit(app, b);
    const pressed = on && app.mouseDown;
    const s = Math.min(12, b.h * 0.22);
    const base = b.disabled ? '#1a2131' : (b.color || UIC.orange);
    const primary = !b.ghost && base !== UIC.grey && base !== '#1a2131';
    ctx.save(); ctx.translate(b.x + (pressed ? 1 : 0), b.y + (pressed ? 1 : 0));
    if (b.ghost) {
      this.slant(ctx, 0, 0, b.w, b.h, s);
      ctx.fillStyle = on ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'; ctx.fill();
      ctx.strokeStyle = on ? 'rgba(255,255,255,0.6)' : UIC.line; ctx.lineWidth = 1.2; ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; this.slant(ctx, 2, 4, b.w, b.h, s); ctx.fill();
      const g = ctx.createLinearGradient(0, 0, 0, b.h);
      if (primary) { g.addColorStop(0, HC.shade(base, on ? 0.18 : 0.06)); g.addColorStop(1, HC.shade(base, on ? -0.05 : -0.18)); }
      else { g.addColorStop(0, on ? '#33405a' : '#253048'); g.addColorStop(1, on ? '#26314a' : '#1a2234'); }
      this.slant(ctx, 0, 0, b.w, b.h, s); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = on ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(s, 1, b.w - s - 1, 1);
      if (!primary && on) { ctx.fillStyle = UIC.orange; this.slant(ctx, 0, 0, 5 + s, b.h, s); ctx.fill(); }
    }
    let cx = b.w / 2, align = 'center';
    const iconName = b.icon ? (HC.ICON_ALIAS[b.icon] || b.icon) : null;
    const hasIcon = iconName && /^[a-z]+$/.test(iconName);
    if (hasIcon) {
      const is = Math.min(b.h * 0.42, 22);
      if (b.iconOnly) HC.icon(ctx, iconName, b.w / 2, b.h / 2, is, b.disabled ? UIC.dim : '#fff');
      else { HC.icon(ctx, iconName, s + 12 + is / 2, b.h / 2, is, b.disabled ? UIC.dim : '#fff'); cx = s + 22 + is; align = 'left'; }
    }
    if (!b.iconOnly) {
      const fs = (b.size || Math.min(30, b.h * 0.42)) * 1.08;
      const label = clean(b.label);
      let size = fs; ctx.font = HC.dfont(size);
      const maxW = align === 'left' ? b.w - cx - 14 : b.w - 2 * s - 16;
      while (ctx.measureText(label).width > maxW && size > 12) { size -= 1; ctx.font = HC.dfont(size); }
      this.text(ctx, label.toUpperCase(), cx, b.sub ? b.h * 0.36 : b.h / 2, size, b.disabled ? UIC.dim : '#fff', align, 0);
      if (b.sub) this.small(ctx, b.sub, cx, b.h * 0.72, Math.max(11, Math.min(14, size * 0.5)), b.disabled ? UIC.dim : 'rgba(255,255,255,0.75)', align, 500);
    }
    if (b.badge) {
      ctx.fillStyle = UIC.orange; ctx.fillRect(b.w - 52, -9, 44, 18);
      this.caps(ctx, b.badge, b.w - 30, 0, 10, '#fff', 'center');
    }
    ctx.restore();
    return on;
  },

  panel(ctx, x, y, w, h, opts) {
    opts = opts || {};
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; HC.rr(ctx, x + 2, y + 5, w, h, 8); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, opts.top || 'rgba(22,30,46,0.94)'); g.addColorStop(1, opts.bottom || 'rgba(11,16,26,0.96)');
    ctx.fillStyle = g; HC.rr(ctx, x, y, w, h, 8); ctx.fill();
    ctx.strokeStyle = opts.border || UIC.line; ctx.lineWidth = opts.border ? 1.5 : 1; HC.rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 8); ctx.stroke();
    if (opts.accent) { ctx.fillStyle = opts.accent; ctx.fillRect(x + 12, y, Math.min(80, w - 24), 3); }
    ctx.restore();
  },

  chip(ctx, x, y, icon, text, color, alignRight) {
    text = clean(text);
    ctx.font = '600 15px ' + HC.FONT_BODY;
    const iconName = icon ? (HC.ICON_ALIAS[icon] || icon) : null, hasIcon = iconName && /^[a-z]+$/.test(iconName);
    const w = ctx.measureText(text).width + (hasIcon ? 44 : 24);
    const xx = alignRight ? x - w : x;
    ctx.fillStyle = 'rgba(7,9,15,0.78)'; this.slant(ctx, xx, y, w, 34, 8); ctx.fill();
    ctx.strokeStyle = color && color[0] === '#' ? HC.hexA(color, 0.7) : UIC.line; ctx.lineWidth = 1; ctx.stroke();
    if (color) { ctx.fillStyle = color; this.slant(ctx, xx, y, 12, 34, 8); ctx.fill(); }
    if (hasIcon) HC.icon(ctx, iconName, xx + 26, y + 17, 15, iconName === 'coin' || iconName === 'star' ? UIC.gold : '#fff');
    this.small(ctx, text, xx + (hasIcon ? 38 : 16), y + 17, 15, '#fff', 'left', 600);
    return w;
  },

  wallet(ctx, x, y) {
    const sv = HC.Save.data;
    let w = this.chip(ctx, x, y, 'coin', String(sv.coins || 0), null, true);
    w += 8 + this.chip(ctx, x - w - 8, y, 'star', HC.Adventure.totalStars() + ' / ' + HC.Adventure.maxStars(), null, true);
    return w;
  },

  star(ctx, x, y, r, filled) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath();
    if (filled) { ctx.fillStyle = UIC.gold; ctx.fill(); }
    else { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.stroke(); }
    ctx.restore();
  },

  bar(ctx, x, y, w, h, v, color, bg) {
    ctx.fillStyle = bg || 'rgba(255,255,255,0.08)'; ctx.fillRect(x, y, w, h);
    if (v > 0) { ctx.fillStyle = color || UIC.orange; ctx.fillRect(x, y, w * Math.min(1, v), h); }
  },

  // calm dark background with faint court lines
  bg(ctx, t, accent) {
    const W = HC.CONFIG.WIDTH, H = HC.CONFIG.HEIGHT;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f1522'); g.addColorStop(1, '#06080d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const rg = ctx.createRadialGradient(W * 0.75, -50, 20, W * 0.75, -50, 800);
    rg.addColorStop(0, HC.hexA(accent || UIC.orange, 0.16)); rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(W / 2, H + 40, 260, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H + 40, 90, Math.PI, 0); ctx.stroke();
    ctx.strokeRect(-10, H - 180, 220, 200); ctx.strokeRect(W - 210, H - 180, 220, 200);
    ctx.beginPath(); ctx.arc(-10, H - 80, 520, -0.95, 0.95); ctx.stroke();
    ctx.beginPath(); ctx.arc(W + 10, H - 80, 520, Math.PI - 0.95, Math.PI + 0.95); ctx.stroke();
    const sx = ((t * 60) % (W + 800)) - 400;
    const lg = ctx.createLinearGradient(sx - 200, 0, sx + 200, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.025)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  },

  header(ctx, app, title, onBack, opts) {
    opts = opts || {};
    const W = HC.CONFIG.WIDTH;
    if (onBack) this.button(ctx, app, { x: 24, y: 22, w: 112, h: 42, label: 'Back', icon: 'back', color: UIC.grey, onClick: onBack, back: true, size: 18 });
    const tx = onBack ? 160 : 40;
    if (opts.kicker) this.caps(ctx, opts.kicker, tx, 30, 12, UIC.orange, 'left');
    this.text(ctx, String(title).toUpperCase(), tx, opts.kicker ? 58 : 44, opts.size || 40, '#fff', 'left', 0);
    if (opts.sub) this.small(ctx, opts.sub, tx, opts.kicker ? 88 : 78, 14, UIC.muted, 'left', 500);
    if (opts.wallet !== false) this.wallet(ctx, W - 24, 26);
  },

  clock(sec) { sec = Math.ceil(Math.max(0, sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); },
  timeLabel(min) { return min > 0 ? min + ' MIN' : 'OFF'; },
  title(ctx, str, y, color) { this.text(ctx, str, HC.CONFIG.WIDTH / 2, y || 70, 44, color || '#fff', 'center', 0); },
  backButton(ctx, app, onClick) { this.button(ctx, app, { x: 24, y: 22, w: 112, h: 42, label: 'Back', icon: 'back', color: UIC.grey, onClick, back: true, size: 18 }); },

  // ------------------------------------------------------------ HUD
  drawHUD(ctx, m, s) {
    const C = HC.CONFIG, U = HC.UI, W = C.WIDTH;
    const app = m.app;
    if (m.state === 'replay') {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 50); ctx.fillRect(0, C.HEIGHT - 50, W, 50);
      if (Math.floor(performance.now() / 500) % 2) { ctx.fillStyle = UIC.red; ctx.beginPath(); ctx.arc(34, 25, 6, 0, 7); ctx.fill(); }
      U.text(ctx, m.replay.label, 50, 26, 24, '#fff', 'left', 0);
      U.caps(ctx, 'Slow motion  ·  press any key to skip', W - 24, C.HEIGHT - 25, 11, UIC.muted, 'right');
      return;
    }
    if (m.mode === 'horse') this.drawHorseHUD(ctx, m);
    else if (m.boss) this.drawBossHUD(ctx, m);
    else this.drawScoreboard(ctx, m);
    if (m.abilitiesOn && m.mode !== 'horse') {
      const meter = (t, x, w, alignRight) => {
        const ready = m.specialReady(t), v = ready ? 1 : m.special[t];
        const y = m.boss ? 96 : 92;
        U.bar(ctx, x, y, w, 5, v, ready ? (Math.floor(performance.now() / 250) % 2 ? UIC.orange : UIC.yellow) : 'rgba(255,255,255,0.55)', 'rgba(7,9,15,0.7)');
        const key = t === 0 ? 'W' : 'UP';
        const label = ready ? (m.cpus[t] ? 'Special ready' : 'Special ready · hold ' + key) : 'Special';
        U.caps(ctx, label, alignRight ? x + w : x, y + 15, 10, ready ? UIC.yellow : UIC.muted, alignRight ? 'right' : 'left');
      };
      meter(0, W / 2 - 300, 190, false);
      if (!m.boss) meter(1, W / 2 + 110, 190, true);
    }
    let cx = 14;
    const chip = (label, col, flash) => { cx += U.chip(ctx, cx, C.HEIGHT - 48, null, label, flash && Math.floor(performance.now() / 180) % 2 ? UIC.red : col) + 8; };
    chip(m.court.name, '#8b95a8');
    if (m.fixedMutator) chip(m.fixedMutator.name, UIC.cyan);
    if (m.activeMutator) chip(m.activeMutator.name, UIC.cyan);
    if (m.boss && m.boss.coachMut) chip('Coach: ' + m.boss.coachMut.name, UIC.yellow);
    if (m.evWarn) {
      const ce = m.court.event;
      chip(ce.name + ' in ' + Math.max(0, m.evTimer).toFixed(1), UIC.red, true);
      const a = 0.65 + Math.sin(performance.now() / 90) * 0.35;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(7,9,15,0.85)'; U.slant(ctx, W / 2 - 170, 132, 340, 48, 12); ctx.fill();
      ctx.fillStyle = UIC.red; ctx.fillRect(W / 2 - 158, 177, 316, 3);
      HC.icon(ctx, 'warn', W / 2 - 130, 156, 26, UIC.yellow);
      U.text(ctx, clean(ce.name).toUpperCase(), W / 2 + 14, 156, 26, '#fff', 'center', 0);
      if (m.evWarn.dir) { ctx.fillStyle = UIC.yellow; const ax = W / 2 + m.evWarn.dir * 200; ctx.beginPath(); ctx.moveTo(ax + m.evWarn.dir * 24, 156); ctx.lineTo(ax - m.evWarn.dir * 6, 140); ctx.lineTo(ax - m.evWarn.dir * 6, 172); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    } else if (m.ev) chip(m.court.event.name, UIC.orange);

    if (m.state === 'countdown') {
      const n = Math.max(1, Math.ceil(m.stateT / (C.COUNTDOWN / 3)));
      const f = (m.stateT / (C.COUNTDOWN / 3)) % 1;
      ctx.save(); ctx.translate(W / 2, 300);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 74, 0, 7); ctx.stroke();
      ctx.strokeStyle = UIC.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 74, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke();
      U.text(ctx, String(n), 0, 0, 96, '#fff', 'center', 0); ctx.restore();
      if (m.pointsPlayed === 0 && m.mode !== 'horse' && !m.opts.demo) {
        ctx.fillStyle = 'rgba(7,9,15,0.8)'; U.slant(ctx, W / 2 - 400, 418, 800, 64, 14); ctx.fill();
        const hint = m.cpus[1] ? 'Hold W to wind up  ·  release to jump  ·  tap in the air to shoot' : 'P1: W   ·   P2: Up arrow   ·   hold to wind up, release to jump, tap in the air to shoot';
        U.small(ctx, hint, W / 2, 440, 16, '#fff', 'center', 600);
        U.small(ctx, 'When SPECIAL is full: keep holding past a full wind-up, then release', W / 2, 464, 13, UIC.yellow, 'center', 500);
      }
    }
    if (m.state === 'cards' && m.cards) {
      ctx.fillStyle = 'rgba(5,7,12,0.86)'; ctx.fillRect(0, 0, W, C.HEIGHT);
      const team = m.teams[m.cards.picker];
      U.caps(ctx, 'Mutator draft', W / 2, 92, 13, UIC.orange, 'center');
      U.text(ctx, (team.name + ' pick a mutator').toUpperCase(), W / 2, 126, 40, '#fff', 'center', 0);
      U.small(ctx, m.cpus[m.cards.picker] ? 'CPU is choosing...' : 'Press ' + (m.cards.picker === 0 ? 'W' : 'Up') + ' on the highlighted card, or click one', W / 2, 166, 15, UIC.muted, 'center', 500);
      m.cardRects().forEach((r, i) => HC.drawCard(ctx, m.cards.list[i], r.x, r.y, r.w, r.h, i === m.cards.hl, m.cards.t));
      U.caps(ctx, 'Lasts for the next point only', W / 2, 592, 11, UIC.dim, 'center');
    }
    if (m.state !== 'over') U.button(ctx, app, { x: W - 66, y: 16, w: 50, h: 40, label: '', icon: 'pause', iconOnly: true, color: UIC.grey, onClick: () => app.togglePause() });
    if (m.paused) this.drawPause(ctx, m);
  },

  drawScoreboard(ctx, m) {
    const C = HC.CONFIG, U = this, W = C.WIDTH;
    const t0 = m.teams[0], t1 = m.teams[1];
    const y = 14, h = 50, half = 300;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; U.slant(ctx, W / 2 - half + 2, y + 4, half * 2, h, 14); ctx.fill();
    ctx.fillStyle = 'rgba(9,12,20,0.94)'; U.slant(ctx, W / 2 - half, y, half * 2, h, 14); ctx.fill();
    ctx.fillStyle = t0.colors.main; U.slant(ctx, W / 2 - half, y, 18, h, 14); ctx.fill();
    ctx.fillStyle = t1.colors.main; U.slant(ctx, W / 2 + half - 18, y, 18, h, 14); ctx.fill();
    U.fitText(ctx, t0.name.toUpperCase(), W / 2 - half + 26, y + h / 2, 22, 140, '#fff', 'left');
    U.fitText(ctx, t1.name.toUpperCase(), W / 2 + half - 30, y + h / 2, 22, 140, '#fff', 'right');
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(W / 2 - 128, y, 70, h); ctx.fillRect(W / 2 + 58, y, 70, h);
    U.text(ctx, String(m.score[0]), W / 2 - 93, y + h / 2, 38, '#fff', 'center', 0);
    U.text(ctx, String(m.score[1]), W / 2 + 93, y + h / 2, 38, '#fff', 'center', 0);
    const pt = Math.max(0, Math.ceil(m.pointTime)), late = pt <= C.BUZZER_WINDOW;
    ctx.fillStyle = late ? UIC.red : UIC.orange; ctx.fillRect(W / 2 - 50, y, 100, h);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(W / 2 - 50, y + h - 4, 100 * (1 - Math.max(0, m.pointTime) / C.POINT_TIME), 4);
    U.text(ctx, String(pt), W / 2, y + h / 2 - 1, 34, '#fff', 'center', 0);
    let sub = 'First to ' + m.winScore;
    if (m.overtime) sub = 'Overtime · next basket wins';
    else if (m.gameClock != null) sub += '  ·  ' + U.clock(m.gameClock);
    if (m.mode === 'hotpotato') sub = 'Hot potato  ·  ' + sub;
    ctx.font = '700 11px ' + HC.FONT_BODY; const sw = Math.max(130, ctx.measureText(sub.toUpperCase()).width + 50);
    ctx.fillStyle = 'rgba(9,12,20,0.94)'; U.slant(ctx, W / 2 - sw / 2, y + h, sw, 20, 6); ctx.fill();
    U.caps(ctx, sub, W / 2, y + h + 10, 10, m.overtime || (m.gameClock != null && m.gameClock <= 10) ? UIC.red : UIC.muted, 'center');
    ctx.restore();
  },

  drawBossHUD(ctx, m) {
    const C = HC.CONFIG, U = this, W = C.WIDTH, b = m.boss;
    ctx.fillStyle = 'rgba(9,12,20,0.94)'; U.slant(ctx, W / 2 - 330, 12, 660, 72, 16); ctx.fill();
    ctx.fillStyle = UIC.red; U.slant(ctx, W / 2 - 330, 12, 18, 72, 16); ctx.fill();
    U.caps(ctx, 'Boss', W / 2 - 296, 30, 11, UIC.red, 'left');
    U.fitText(ctx, b.def.name, W / 2 - 296, 54, 24, 240, '#fff', 'left');
    const k = b.health / b.maxHealth, flash = b.hurtT > 0 && Math.floor(performance.now() / 60) % 2;
    U.bar(ctx, W / 2 - 40, 32, 340, 12, k, flash ? '#fff' : UIC.red, 'rgba(255,255,255,0.08)');
    U.caps(ctx, 'HP ' + b.health + ' / ' + b.maxHealth, W / 2 - 40, 62, 10, UIC.muted, 'left');
    U.caps(ctx, 'Boss score ' + b.bossScore + ' / ' + C.BOSS_WIN_SCORE + '   ·   ' + Math.max(0, Math.ceil(m.pointTime)) + 's', W / 2 + 300, 62, 10, UIC.muted, 'right');
  },

  drawHorseHUD(ctx, m) {
    const C = HC.CONFIG, U = this, W = C.WIDTH;
    ctx.fillStyle = 'rgba(9,12,20,0.94)'; U.slant(ctx, W / 2 - 370, 12, 740, 86, 16); ctx.fill();
    [0, 1].forEach(t => {
      const x = t === 0 ? W / 2 - 340 : W / 2 + 30, team = m.teams[t];
      const active = m.attempt && m.attempt.shooter === t;
      ctx.fillStyle = team.colors.main; ctx.fillRect(x, 24, 4, 22);
      U.text(ctx, team.name.toUpperCase(), x + 14, 35, 20, active ? '#fff' : UIC.muted, 'left', 0);
      if (active) U.caps(ctx, 'Shooting', x + 300, 35, 10, UIC.orange, 'right');
      for (let i = 0; i < m.word.length; i++) {
        const got = i < m.letters[t];
        U.text(ctx, m.word[i], x + 22 + i * 54, 72, 32, got ? UIC.red : 'rgba(255,255,255,0.14)', 'center', 0);
      }
    });
    U.text(ctx, m.horseMsg || '', W / 2, 124, 20, UIC.yellow, 'center', 2);
    if (m.attempt && !m.attempt.shot && m.state === 'play') U.small(ctx, 'Hop into position, then jump and tap again to shoot  ·  ' + Math.max(0, Math.ceil(m.attempt.t)) + 's', W / 2, 150, 14, '#fff', 'center', 500);
  },

  drawPause(ctx, m) {
    const C = HC.CONFIG, W = C.WIDTH, app = m.app;
    ctx.fillStyle = 'rgba(5,7,12,0.82)'; ctx.fillRect(0, 0, W, C.HEIGHT);
    this.panel(ctx, W / 2 - 210, 160, 420, 380, { accent: UIC.orange });
    this.caps(ctx, 'Game paused', W / 2, 200, 12, UIC.orange, 'center');
    this.text(ctx, 'PAUSED', W / 2, 232, 44, '#fff', 'center', 0);
    this.button(ctx, app, { x: W / 2 - 160, y: 280, w: 320, h: 58, label: 'Resume', icon: 'play', color: UIC.orange, onClick: () => app.togglePause() });
    this.button(ctx, app, { x: W / 2 - 160, y: 352, w: 320, h: 58, label: 'Restart', icon: 'refresh', color: UIC.grey, onClick: () => app.restartMatch() });
    this.button(ctx, app, { x: W / 2 - 160, y: 424, w: 320, h: 58, label: 'Quit to menu', icon: 'home', color: UIC.grey, onClick: () => app.quitToMenu() });
    if (HC.Admin && HC.Admin.on()) this.button(ctx, app, { x: W / 2 - 160, y: 560, w: 320, h: 46, label: 'Admin: win match', icon: 'bolt', color: UIC.grey, size: 18, onClick: () => HC.Admin.winMatch() });
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
  ctx.fillStyle = 'rgba(6,8,13,' + (dark == null ? 0.78 : dark) + ')'; ctx.fillRect(0, 0, W(), H());
}
function cardFrame(ctx, x, y, w, h, on, sel) {
  ctx.strokeStyle = sel ? UIC.orange : on ? 'rgba(255,255,255,0.7)' : UIC.line; ctx.lineWidth = sel ? 2 : 1;
  HC.rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 6); ctx.stroke();
  if (sel) { ctx.fillStyle = UIC.orange; ctx.fillRect(x, y, w, 3); }
}
function seg(ctx, app, x, y, options, current, onPick, w) {
  w = w || 120;
  options.forEach(([val, label], i) => UI.button(ctx, app, { x: x + i * (w + 8), y, w, h: 42, label, color: current === val ? UIC.orange : UIC.grey, size: 17, onClick: () => onPick(val) }));
}

// ---------------------------------------------------------------- TITLE
S.title = {
  draw(ctx, app, t) {
    if (app.demo) app.demo.render(ctx); else UI.bg(ctx, t);
    const g = ctx.createLinearGradient(0, 0, 860, 0);
    g.addColorStop(0, 'rgba(6,8,13,0.97)'); g.addColorStop(0.6, 'rgba(6,8,13,0.9)'); g.addColorStop(1, 'rgba(6,8,13,0.2)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H());
    const vg = ctx.createLinearGradient(0, H() - 140, 0, H()); vg.addColorStop(0, 'rgba(6,8,13,0)'); vg.addColorStop(1, 'rgba(6,8,13,0.7)'); ctx.fillStyle = vg; ctx.fillRect(0, H() - 140, W(), 140);

    drawLogo(ctx, 44, 36, t);

    const ar = { x: 44, y: 214, w: 520, h: 132 };
    const on = UI.hit(app, Object.assign({ onClick: () => app.go('adventure') }, ar));
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; HC.rr(ctx, ar.x + 2, ar.y + 5, ar.w, ar.h, 8); ctx.fill();
    ctx.save(); HC.rr(ctx, ar.x, ar.y, ar.w, ar.h, 8); ctx.clip();
    ctx.save(); ctx.translate(ar.x, ar.y - 60); ctx.scale(ar.w / W(), ar.w / W()); HC.courtById('rooftop').drawBg(ctx, null, t); ctx.restore();
    const cg = ctx.createLinearGradient(ar.x, 0, ar.x + ar.w, 0); cg.addColorStop(0, 'rgba(8,10,16,0.97)'); cg.addColorStop(0.55, 'rgba(8,10,16,0.72)'); cg.addColorStop(1, 'rgba(8,10,16,0.2)');
    ctx.fillStyle = cg; ctx.fillRect(ar.x, ar.y, ar.w, ar.h);
    HC.drawPortrait(ctx, 'clutch', ar.x + 400, ar.y + ar.h + 28, 150, HC.Cosmetics.jersey(), 'neutral', { noShadow: true });
    HC.drawPortrait(ctx, 'zippy', ar.x + 470, ar.y + ar.h + 34, 140, HC.Cosmetics.jersey(), 'neutral', { noShadow: true, facing: -1 });
    ctx.restore();
    ctx.fillStyle = UIC.orange; ctx.fillRect(ar.x, ar.y, 4, ar.h);
    ctx.strokeStyle = on ? 'rgba(255,255,255,0.7)' : UIC.line; ctx.lineWidth = 1; HC.rr(ctx, ar.x + 0.5, ar.y + 0.5, ar.w - 1, ar.h - 1, 8); ctx.stroke();
    UI.caps(ctx, 'Career mode', ar.x + 24, ar.y + 26, 11, UIC.orange);
    UI.text(ctx, 'ADVENTURE', ar.x + 22, ar.y + 60, 46, '#fff', 'left', 0);
    UI.small(ctx, '6 regions · 30 games · unlock players and gear', ar.x + 24, ar.y + 94, 13, UIC.muted, 'left', 500);
    const tot = HC.Adventure.totalStars(), max = HC.Adventure.maxStars();
    UI.bar(ctx, ar.x + 24, ar.y + 112, 200, 4, tot / max, UIC.gold);
    UI.caps(ctx, tot + ' / ' + max + ' stars', ar.x + 234, ar.y + 114, 10, UIC.muted, 'left');
    if (on) HC.icon(ctx, 'play', ar.x + 330, ar.y + 60, 18, UIC.orange);
    ctx.restore();

    const sv = HC.Save.data, bossUnlocked = sv.trophies > 0 || app.settings.unlockAll || HC.Admin.all() || Object.keys(sv.bosses).length > 0;
    const items = [
      ['Quick Match', '1P vs CPU or 2P local', 'ball', () => app.go('players', { mode: 'quick' })],
      ['Tournament', '8-team knockout', 'trophy', () => app.go('chars', { mode: 'tournament', humans: 1 })],
      ['Horse', 'Trick-shot duel', 'target', () => app.go('players', { mode: 'horse' })],
      ['Boss Battles', bossUnlocked ? 'Giant opponents' : 'Win a tournament', bossUnlocked ? 'crown' : 'lock', () => app.go('bossSelect'), !bossUnlocked],
      ['Hot Potato', 'The ball is a bomb', 'bomb', () => app.go('players', { mode: 'hotpotato' })],
      ['Locker', 'Ball skins and jerseys', 'bag', () => app.go('locker')],
    ];
    items.forEach((it, i) => {
      const x = 44 + (i % 2) * 264, y = 368 + Math.floor(i / 2) * 76;
      UI.button(ctx, app, { x, y, w: 254, h: 64, label: it[0], sub: it[1], icon: it[2], color: UIC.grey, onClick: it[3], disabled: it[4], size: 22 });
    });
    [['Settings', 'gear', () => app.go('settings')], ['Roster', 'users', () => app.go('roster')], ['How to play', 'help', () => app.go('help')]].forEach((b, i) =>
      UI.button(ctx, app, { x: 44 + i * 176, y: 604, w: 166, h: 44, label: b[0], icon: b[1], ghost: true, onClick: b[2], size: 17 }));

    const pr = { x: W() - 324, y: 22, w: 300, h: 80 };
    const pon = UI.hit(app, Object.assign({ onClick: () => HC.LoginPage.show() }, pr));
    UI.panel(ctx, pr.x, pr.y, pr.w, pr.h, pon ? { border: 'rgba(255,255,255,0.6)' } : null);
    ctx.save(); HC.rr(ctx, pr.x + 10, pr.y + 10, 60, 60, 6); ctx.clip();
    const pj = HC.Cosmetics.jersey(); ctx.fillStyle = HC.shade(pj.main, -0.55); ctx.fillRect(pr.x + 10, pr.y + 10, 60, 60);
    HC.drawPortrait(ctx, (sv.advTeam || ['pip'])[0], pr.x + 40, pr.y + 122, 130, pj, 'neutral', { noShadow: true }); ctx.restore();
    const u = HC.Auth.user;
    UI.text(ctx, (u && u.mode !== 'guest' ? u.name : 'Guest').toUpperCase(), pr.x + 84, pr.y + 24, 22, '#fff', 'left', 0);
    UI.caps(ctx, u && u.mode === 'cloud' ? 'Saved online' : u && u.mode === 'local' ? 'Saved on this device' : 'Click to sign in', pr.x + 84, pr.y + 45, 9, UIC.muted);
    let sx = pr.x + 84;
    for (const [ic, v] of [['coin', sv.coins || 0], ['star', HC.Adventure.totalStars()], ['trophy', sv.trophies]]) {
      HC.icon(ctx, ic, sx + 6, pr.y + 64, 12, UIC.gold); UI.small(ctx, String(v), sx + 16, pr.y + 64, 13, '#fff', 'left', 700); sx += 66;
    }

    if (app.demo) {
      const d = app.demo;
      const txt = d.teams[0].name.toUpperCase() + '   ' + d.score[0] + ' – ' + d.score[1] + '   ' + d.teams[1].name.toUpperCase();
      ctx.font = HC.dfont(17); const w = ctx.measureText(txt).width + 90;
      ctx.fillStyle = 'rgba(7,9,15,0.85)'; UI.slant(ctx, W() - w - 22, H() - 56, w, 34, 10); ctx.fill();
      ctx.fillStyle = UIC.red; UI.slant(ctx, W() - w - 22, H() - 56, 52, 34, 10); ctx.fill();
      UI.caps(ctx, 'Live', W() - w + 4, H() - 39, 10, '#fff', 'center');
      UI.text(ctx, txt, W() - 36, H() - 39, 17, '#fff', 'right', 0);
    }
  },
};

function drawLogo(ctx, x, y, t) {
  ctx.save();
  ctx.font = HC.dfont(92, 800); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
  const hw = ctx.measureText('HOOP').width;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillText('HOOP', x + 3, y + 86); ctx.fillText('CHAOS', x + hw + 21, y + 86);
  ctx.fillStyle = '#fff'; ctx.fillText('HOOP', x, y + 82);
  const og = ctx.createLinearGradient(0, y + 10, 0, y + 82); og.addColorStop(0, '#ff8a3d'); og.addColorStop(1, '#ff5a00');
  ctx.fillStyle = og; ctx.fillText('CHAOS', x + hw + 18, y + 82);
  const total = hw + 18 + ctx.measureText('CHAOS').width;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = UIC.orange; ctx.fillRect(x + 4, y + 98, 64, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 74, y + 99, total - 74, 1);
  UI.caps(ctx, 'One-button ragdoll basketball', x + 4, y + 124, 12, UIC.muted);
  ctx.restore();
  ctx.save(); ctx.translate(x + total + 34, y + 50); ctx.rotate(t * 0.6); HC.drawBall(ctx, [0, 0, 0, 22, 'classic', -1, 0, 0]); ctx.restore();
}

// ---------------------------------------------------------------- MATCH SETUP
S.players = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    const p = app.params, name = { quick: 'Quick Match', horse: 'Horse', hotpotato: 'Hot Potato' }[p.mode];
    UI.header(ctx, app, name, () => app.go('title'), { kicker: 'Match setup' });
    const card = (x, label, sub, chars, humans) => {
      const r = { x, y: 128, w: 440, h: 210 };
      const on = UI.hit(app, Object.assign({ onClick: () => app.go('chars', Object.assign({}, p, { humans })) }, r));
      UI.panel(ctx, r.x, r.y, r.w, r.h, on ? { border: 'rgba(255,255,255,0.6)' } : null);
      ctx.save(); HC.rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.clip();
      chars.forEach((c, i) => HC.drawPortrait(ctx, c, r.x + 300 + i * 80, r.y + r.h + 24, 190, i ? { main: '#c0392b', alt: '#fff' } : HC.Cosmetics.jersey(), 'neutral', { noShadow: true, facing: i ? -1 : 1 }));
      const fg = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0); fg.addColorStop(0, 'rgba(12,17,27,0.95)'); fg.addColorStop(0.6, 'rgba(12,17,27,0.4)'); fg.addColorStop(1, 'rgba(12,17,27,0)');
      ctx.fillStyle = fg; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.restore();
      if (on) { ctx.fillStyle = UIC.orange; ctx.fillRect(r.x, r.y, 4, r.h); }
      UI.caps(ctx, humans === 1 ? 'Single player' : 'Local multiplayer', r.x + 28, r.y + 40, 11, UIC.orange);
      UI.text(ctx, label, r.x + 26, r.y + 82, 46, '#fff', 'left', 0);
      UI.small(ctx, sub, r.x + 28, r.y + 122, 14, UIC.muted, 'left', 500);
    };
    card(W() / 2 - 460, '1 PLAYER', 'You (W) against the CPU', ['clutch'], 1);
    card(W() / 2 + 20, '2 PLAYERS', 'W vs Up arrow on one keyboard', ['noodle', 'bolt'], 2);
    UI.panel(ctx, W() / 2 - 460, 366, 920, p.mode === 'horse' ? 250 : 166);
    UI.caps(ctx, 'CPU difficulty', W() / 2 - 430, 400, 11);
    seg(ctx, app, W() / 2 - 250, 380, [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], app.settings.difficulty, (v) => app.setSetting('difficulty', v));
    if (p.mode !== 'horse') {
      UI.caps(ctx, 'Time limit', W() / 2 - 430, 460, 11);
      seg(ctx, app, W() / 2 - 250, 440, HC.MATCH_TIMES.map(m => [m, m ? m + ' min' : 'Off']), app.settings.matchTime, (v) => app.setSetting('matchTime', v), 98);
      UI.caps(ctx, 'First to ' + app.settings.winScore + ' (change in settings)', W() / 2 + 430, 512, 10, UIC.dim, 'right');
    } else {
      UI.caps(ctx, 'Word', W() / 2 - 430, 460, 11);
      seg(ctx, app, W() / 2 - 250, 440, [['HORSE', 'HORSE'], ['PIG', 'PIG'], ['HOOP', 'HOOP']], p.word || 'HORSE', (v) => { p.word = v; }, 140);
      UI.wrap(ctx, 'Make a shot, then your rival must copy it from the same spot, with the same tricks. Miss a copy and you take a letter. Spell the word and you lose.', W() / 2 - 430, 530, 860, 22, 15, UIC.muted, 'left', 500);
    }
    if (p.mode === 'hotpotato') UI.small(ctx, 'The ball is always a bomb. If it goes off in your hands, the other team scores ' + HC.CONFIG.BOMB_POINTS + '.', W() / 2, 580, 14, UIC.yellow, 'center', 500);
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
    const who = p.humans === 2 ? (team === 0 ? 'Player 1' : 'Player 2') : 'Select players';
    UI.header(ctx, app, who, () => { if (team === 1) p.pickTeam = 0; else app.go(p.backTo || (p.mode === 'adventure' ? 'stage' : p.mode === 'tournament' ? 'title' : p.mode === 'boss' ? 'bossSelect' : 'players'), p); },
      { kicker: 'Roster', sub: 'Pick ' + p.need + (p.need > 1 ? ' players' : ' player') });
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
      ctx.save();
      const g = ctx.createLinearGradient(0, y, 0, y + ch);
      g.addColorStop(0, locked ? '#10151f' : on ? '#26324a' : '#1a2234'); g.addColorStop(1, '#0c111b');
      ctx.fillStyle = g; HC.rr(ctx, x, y, cw, ch, 6); ctx.fill();
      ctx.save(); HC.rr(ctx, x, y, cw, ch, 6); ctx.clip();
      if (!locked) { const tg = ctx.createRadialGradient(x + cw / 2, y + ch, 10, x + cw / 2, y + ch, 120); tg.addColorStop(0, HC.hexA(tc.main, 0.35)); tg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = tg; ctx.fillRect(x, y, cw, ch); }
      if (locked) { ctx.globalAlpha = 0.18; HC.drawPortrait(ctx, c.id, x + cw / 2, y + ch - 28, 104, { main: '#000', alt: '#222' }, 'neutral', { noShadow: true }); ctx.globalAlpha = 1; }
      else HC.drawPortrait(ctx, c.id, x + cw / 2, y + ch - 28, 104, tc, sel ? 'happy' : 'neutral', { noShadow: true });
      ctx.fillStyle = 'rgba(7,9,15,0.9)'; ctx.fillRect(x, y + ch - 28, cw, 28);
      ctx.restore();
      cardFrame(ctx, x, y, cw, ch, on, sel);
      UI.fitText(ctx, locked ? 'LOCKED' : c.name.toUpperCase(), x + cw / 2, y + ch - 14, 17, cw - 16, locked ? UIC.dim : '#fff', 'center');
      if (locked) HC.icon(ctx, 'lock', x + cw / 2, y + 56, 26, 'rgba(255,255,255,0.6)');
      const n = picks.filter(id => id === c.id).length;
      if (n) { ctx.fillStyle = UIC.orange; ctx.fillRect(x + cw - 34, y + 10, 26, 20); UI.text(ctx, n > 1 ? 'x' + n : String(picks.indexOf(c.id) + 1), x + cw - 21, y + 20, 14, '#fff', 'center', 0); }
      ctx.restore();
    });
    const id = hovered || p.preview || 'pip', def = HC.charById(id), locked = !HC.isUnlocked(def);
    const px = 878, py = 112, pw = 376, ph = 454;
    UI.panel(ctx, px, py, pw, ph, { accent: UIC.orange });
    ctx.save(); HC.rr(ctx, px + 12, py + 14, pw - 24, 196, 6); ctx.clip();
    const dg = ctx.createRadialGradient(px + pw / 2, py + 210, 10, px + pw / 2, py + 210, 230); dg.addColorStop(0, HC.hexA(tc.main, 0.45)); dg.addColorStop(1, '#0b0f18');
    ctx.fillStyle = dg; ctx.fillRect(px + 12, py + 14, pw - 24, 196);
    if (locked) ctx.globalAlpha = 0.2;
    HC.drawPortrait(ctx, id, px + pw / 2, py + 200, 180, locked ? { main: '#000', alt: '#222' } : tc, 'neutral', { noShadow: true });
    ctx.restore();
    UI.text(ctx, locked ? 'LOCKED' : def.name.toUpperCase(), px + 24, py + 240, 30, '#fff', 'left', 0);
    UI.small(ctx, locked ? unlockHint(def) : def.perk, px + 24, py + 268, 13, UIC.muted, 'left', 500);
    const st = HC.charStats(def);
    [['Jump', st.jump], ['Aim', st.aim], ['Power', st.power], ['Size', st.size]].forEach(([lb, v], i) => {
      UI.caps(ctx, lb, px + 24, py + 300 + i * 22, 10);
      UI.bar(ctx, px + 96, py + 297 + i * 22, pw - 122, 6, locked ? 0 : 0.12 + v * 0.88, UIC.orange);
    });
    const ab = HC.abilityOf(def);
    if (ab) {
      ctx.fillStyle = 'rgba(255,106,19,0.08)'; ctx.fillRect(px + 14, py + 392, pw - 28, 50); ctx.fillStyle = UIC.orange; ctx.fillRect(px + 14, py + 392, 3, 50);
      UI.caps(ctx, 'Special · ' + (locked ? '???' : ab.name), px + 28, py + 407, 11, UIC.orange);
      UI.small(ctx, locked ? 'Unlock to find out.' : ab.desc, px + 28, py + 428, 13, '#fff', 'left', 500);
    }
    UI.panel(ctx, 28, 586, 820, 116);
    UI.caps(ctx, 'Your team', 50, 606, 11, UIC.orange);
    for (let i = 0; i < p.need; i++) {
      const x = 50 + i * 130, y = 622;
      ctx.fillStyle = 'rgba(255,255,255,0.03)'; HC.rr(ctx, x, y, 118, 66, 6); ctx.fill();
      ctx.setLineDash(picks[i] ? [] : [5, 5]); ctx.strokeStyle = picks[i] ? UIC.orange : 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      if (picks[i]) {
        ctx.save(); HC.rr(ctx, x, y, 118, 66, 6); ctx.clip(); HC.drawPortrait(ctx, picks[i], x + 30, y + 100, 120, tc, 'neutral', { noShadow: true }); ctx.restore();
        UI.fitText(ctx, HC.charById(picks[i]).name.toUpperCase(), x + 62, y + 33, 14, 54, '#fff', 'left');
      } else UI.caps(ctx, 'Empty', x + 59, y + 33, 10, UIC.dim, 'center');
    }
    UI.button(ctx, app, { x: 320, y: 628, w: 150, h: 50, label: 'Random', icon: 'dice', color: UIC.grey, size: 18, onClick: () => { const pool = HC.CHARACTERS.filter(c => HC.isUnlocked(c)); p.picks[team] = []; for (let i = 0; i < p.need; i++) p.picks[team].push(HC.U.pick(pool).id); } });
    UI.button(ctx, app, { x: 482, y: 628, w: 130, h: 50, label: 'Clear', color: UIC.grey, size: 18, onClick: () => { p.picks[team] = []; } });
    const ready = picks.length >= p.need;
    UI.button(ctx, app, { x: 624, y: 628, w: 210, h: 50, label: team === 0 && p.humans === 2 ? 'Next' : 'Confirm', icon: 'play', color: UIC.orange, disabled: !ready, size: 22, onClick: () => {
      if (team === 0 && p.humans === 2) { p.pickTeam = 1; app.focus = -1; return; }
      HC.Save.data.lastPicks = p.picks[0].slice(); HC.Save.save();
      if (p.mode === 'adventure') { HC.Save.data.advTeam = p.picks[0].slice(); HC.Save.save(); app.go(p.backTo === 'adventure' ? 'adventure' : 'stage', p); }
      else if (p.mode === 'tournament') app.startTournament(p.picks[0]);
      else if (p.mode === 'boss') app.go('bossIntro', p);
      else app.go('court', p);
    } });
    UI.wrap(ctx, 'Specials: when your SPECIAL meter is full, hold past a full wind-up, then release.', 1066, 594, 350, 16, 12, UIC.dim, 'center', 500);
  },
};
function unlockHint(def) {
  if (def.unlock === 'adv') { for (const r of HC.ADVENTURE) for (const st of r.stages) if (st.reward.unlock && st.reward.unlock.kind === 'char' && st.reward.unlock.id === def.id) return 'Unlock: win "' + st.name + '" in ' + r.name; return 'Unlock in Adventure'; }
  return 'Unlock: defeat ' + HC.bossById(def.unlock).name;
}

// ---------------------------------------------------------------- COURT SELECT
S.court = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    const p = app.params;
    UI.header(ctx, app, 'Select court', () => app.go('chars', p), { kicker: 'Venue', sub: 'Every court has a live event. Watch for the warning.' });
    const list = HC.COURTS.concat([{ id: 'random', name: 'Random', desc: 'Pick one for me.' }]);
    const cols = 4, cw = 290, ch = 236, gap = 18, x0 = W() / 2 - (cols * cw + (cols - 1) * gap) / 2;
    list.forEach((c, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = 124 + Math.floor(i / cols) * (ch + gap);
      const on = UI.hit(app, { x, y, w: cw, h: ch, onClick: () => { p.court = c.id === 'random' ? HC.U.pick(HC.COURTS).id : c.id; app.startMatch(p); } });
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; HC.rr(ctx, x + 2, y + 5, cw, ch, 8); ctx.fill();
      ctx.save(); HC.rr(ctx, x, y, cw, ch, 8); ctx.clip();
      if (c.drawBg) { ctx.save(); ctx.translate(x, y); ctx.scale(cw / W(), (ch - 70) / (H() - 80)); c.drawBg(ctx, null, t); ctx.fillStyle = c.floor.top; ctx.fillRect(0, HC.CONFIG.FLOOR_Y, W(), 200); ctx.restore(); if (!on) { ctx.fillStyle = 'rgba(6,8,13,0.35)'; ctx.fillRect(x, y, cw, ch); } }
      else { ctx.fillStyle = '#141b2a'; ctx.fillRect(x, y, cw, ch); HC.icon(ctx, 'dice', x + cw / 2, y + 80, 60, 'rgba(255,255,255,0.5)'); }
      ctx.fillStyle = 'rgba(8,11,18,0.95)'; ctx.fillRect(x, y + ch - 74, cw, 74);
      ctx.restore();
      cardFrame(ctx, x, y, cw, ch, on, false);
      if (on) { ctx.fillStyle = UIC.orange; ctx.fillRect(x, y + ch - 74, cw, 3); }
      UI.text(ctx, c.name.toUpperCase(), x + 16, y + ch - 50, 22, '#fff', 'left', 0);
      UI.wrap(ctx, c.desc, x + 16, y + ch - 26, cw - 30, 15, 12, UIC.muted, 'left', 500);
      ctx.restore();
    });
  },
};

// ---------------------------------------------------------------- RESULTS
S.results = {
  enter(app) { app.params.t0 = app.t; },
  draw(ctx, app, t) {
    const r = app.params, m = r.match, w = r.winner, adv = r.adv;
    courtBackdrop(ctx, m.court.id, t, 0.84);
    let headline = w >= 0 ? m.teams[w].name + ' win' : 'Game over';
    if (m.boss) headline = w === 0 ? m.boss.def.name + ' defeated' : m.boss.def.name + ' wins';
    if (adv) headline = w === 0 ? 'Stage clear' : 'Defeat';
    const good = adv || m.boss ? r.humanWon : true;
    const k = Math.min(1, (app.t - r.t0) * 3);
    UI.caps(ctx, 'Final', W() / 2, 34, 12, good ? UIC.orange : UIC.red, 'center');
    ctx.save(); ctx.globalAlpha = k; UI.text(ctx, headline.toUpperCase(), W() / 2, 70, 50, '#fff', 'center', 0); ctx.restore();
    let sub = '';
    if (m.mode === 'horse') sub = m.teams[0].name + ' "' + m.word.slice(0, m.letters[0]) + '"   ·   ' + m.teams[1].name + ' "' + m.word.slice(0, m.letters[1]) + '"';
    else if (m.boss) sub = 'Boss HP left: ' + m.boss.health + ' / ' + m.boss.maxHealth;
    if (sub) UI.small(ctx, sub, W() / 2, 110, 16, UIC.muted, 'center', 500);
    else UI.text(ctx, m.score[0] + '  –  ' + m.score[1], W() / 2, 114, 36, '#fff', 'center', 0);
    if (r.note) UI.small(ctx, r.note, W() / 2, 150, 15, UIC.yellow, 'center', 600);
    if (adv) this.drawAdventure(ctx, app, r, t);
    else this.drawStats(ctx, m, w, 120, 176, 1040, 380);
    const btns = r.buttons || [['Rematch', UIC.orange, () => app.restartMatch(), 'refresh'], ['Menu', UIC.grey, () => app.quitToMenu(), 'home']];
    const bw = 240, total = btns.length * bw + (btns.length - 1) * 16;
    btns.forEach((b, i) => UI.button(ctx, app, { x: W() / 2 - total / 2 + i * (bw + 16), y: 600, w: bw, h: 60, label: b[0], color: i === 0 ? UIC.orange : UIC.grey, onClick: b[2], icon: b[3], size: 22 }));
  },
  drawStats(ctx, m, w, x, y, pw, ph) {
    UI.panel(ctx, x, y, pw, ph, { accent: UIC.orange });
    [['Player', 30], ['Pts', 340], ['FG', 440], ['Steals', 590], ['Trick shots', 700]].forEach(([h, cx]) => UI.caps(ctx, h, x + cx, y + 26, 10));
    const rows = m.statsPlayers.slice().sort((a, b) => a.team - b.team);
    const rh = Math.min(76, (ph - 50) / Math.max(1, rows.length));
    rows.forEach((sp, i) => {
      const yy = y + 44 + i * rh, team = m.teams[sp.team];
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.045)'; ctx.fillRect(x + 12, yy, pw - 24, rh - 6);
      ctx.fillStyle = team.colors.main; ctx.fillRect(x + 12, yy, 3, rh - 6);
      ctx.save(); ctx.beginPath(); ctx.rect(x + 22, yy + 4, 52, rh - 14); ctx.clip(); ctx.fillStyle = '#0b0f18'; ctx.fillRect(x + 22, yy + 4, 52, rh - 14);
      HC.drawPortrait(ctx, sp.char, x + 48, yy + rh + 26, 110, team.colors, 'neutral', { noShadow: true }); ctx.restore();
      UI.text(ctx, sp.name.toUpperCase(), x + 88, yy + rh * 0.36, 19, '#fff', 'left', 0);
      UI.caps(ctx, team.name, x + 88, yy + rh * 0.68, 9, UIC.muted);
      UI.text(ctx, String(sp.stats.points), x + 350, yy + rh / 2 - 3, 26, sp.team === w ? UIC.orange : '#fff', 'left', 0);
      UI.small(ctx, sp.stats.makes + ' / ' + sp.stats.shots, x + 450, yy + rh / 2 - 3, 15, '#fff', 'left', 600);
      UI.small(ctx, String(sp.stats.steals), x + 610, yy + rh / 2 - 3, 15, '#fff', 'left', 600);
      const tr = Object.entries(sp.stats.tricks).map(([k, n]) => HC.trickById(k).noun.toLowerCase().replace(/^\w/, c => c.toUpperCase()) + ' ×' + n).join(', ') || '–';
      UI.wrap(ctx, tr, x + 700, yy + rh * 0.4, pw - 720, 16, 13, UIC.muted, 'left', 500);
    });
  },
  drawAdventure(ctx, app, r, t) {
    const a = r.adv, el = app.t - r.t0;
    UI.panel(ctx, 120, 176, 500, 390, { accent: UIC.orange });
    UI.caps(ctx, 'Rating', 144, 204, 11, UIC.orange);
    for (let i = 0; i < 3; i++) {
      const got = i < a.stars, appear = Math.min(1, Math.max(0, (el - 0.4 - i * 0.3) * 4));
      ctx.save(); ctx.translate(250 + i * 120, 262); const s = got ? 0.6 + appear * 0.4 : 1; ctx.scale(s, s); UI.star(ctx, 0, 0, 38, got && appear > 0); ctx.restore();
      if (got && appear > 0 && appear < 0.3 && !r['snd' + i]) { r['snd' + i] = true; HC.Audio.card(); }
    }
    a.objs.forEach((o, i) => {
      const y = 348 + i * 44;
      ctx.fillStyle = o.met ? 'rgba(47,211,138,0.07)' : 'rgba(255,255,255,0.03)'; ctx.fillRect(144, y - 18, 452, 36);
      UI.star(ctx, 166, y, 9, o.met);
      UI.small(ctx, o.text, 186, y, 15, o.met ? '#fff' : UIC.muted, 'left', 500);
      HC.icon(ctx, o.met ? 'check' : 'cross', 576, y, 14, o.met ? UIC.green : UIC.red);
    });
    UI.panel(ctx, 660, 176, 500, 390, { accent: UIC.gold });
    UI.caps(ctx, 'Rewards', 684, 204, 11, UIC.gold);
    HC.icon(ctx, 'coin', 700, 254, 30, UIC.gold);
    UI.text(ctx, '+' + a.coins, 724, 254, 40, '#fff', 'left', 0);
    if (!a.coins) UI.small(ctx, 'Win the game to earn coins.', 684, 296, 14, UIC.muted, 'left', 500);
    a.unlocks.forEach((u, i) => {
      const y = 318 + i * 86;
      ctx.fillStyle = 'rgba(232,180,67,0.07)'; ctx.fillRect(684, y, 452, 74); ctx.fillStyle = UIC.gold; ctx.fillRect(684, y, 3, 74);
      drawItemIcon(ctx, u, 730, y + 37, 28, t);
      UI.caps(ctx, 'Unlocked', 780, y + 24, 10, UIC.gold);
      UI.small(ctx, HC.Adventure.unlockLabel(u), 780, y + 48, 15, '#fff', 'left', 600);
    });
    if (a.milestone) UI.caps(ctx, a.milestone + '-star milestone reached', 910, 548, 10, UIC.gold, 'center');
  },
};

function drawItemIcon(ctx, u, x, y, r, t) {
  if (u.kind === 'ball') { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.5); HC.drawBall(ctx, [0, 0, 0, r * 0.8, u.id, -1, 0, 0]); ctx.restore(); }
  else if (u.kind === 'jersey') { drawJersey(ctx, x, y, r * 1.6, HC.JERSEYS[u.id]); }
  else { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ctx.fillStyle = '#0b0f18'; ctx.fillRect(x - r, y - r, r * 2, r * 2); HC.drawPortrait(ctx, u.id, x, y + r * 2.6, r * 4.2, HC.Cosmetics.jersey(), 'neutral', { noShadow: true }); ctx.restore(); ctx.strokeStyle = UIC.line; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); }
}
function drawJersey(ctx, x, y, s, j) {
  ctx.save(); ctx.translate(x, y); const k = s / 60; ctx.scale(k, k);
  const g = ctx.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, HC.shade(j.main, -0.25)); g.addColorStop(0.5, j.main); g.addColorStop(1, HC.shade(j.main, -0.25));
  ctx.fillStyle = g; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-14, -26); ctx.lineTo(-24, -20); ctx.quadraticCurveTo(-20, -6, -20, 4); ctx.lineTo(-20, 28); ctx.lineTo(20, 28); ctx.lineTo(20, 4); ctx.quadraticCurveTo(20, -6, 24, -20); ctx.lineTo(14, -26); ctx.quadraticCurveTo(0, -12, -14, -26); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = j.alt; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-13, -23); ctx.quadraticCurveTo(0, -10, 13, -23); ctx.stroke();
  ctx.font = HC.dfont(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = j.alt; ctx.fillText('7', 0, 10);
  ctx.restore();
}
HC.drawJersey = drawJersey; HC.drawItemIcon = drawItemIcon;

// ---------------------------------------------------------------- ADVENTURE MAP
const NODE_POS = [[170, 520], [395, 410], [630, 510], [865, 400], [1095, 490]];
S.adventure = {
  enter(app) { const p = HC.Adventure.prog(); app.params = { region: Math.min(p.region || 0, HC.ADVENTURE.length - 1) }; },
  draw(ctx, app, t) {
    const A = HC.Adventure, ri = app.params.region, reg = HC.ADVENTURE[ri];
    courtBackdrop(ctx, reg.court, t, 0.62);
    const vg = ctx.createLinearGradient(0, 0, 0, H()); vg.addColorStop(0, 'rgba(6,8,13,0.92)'); vg.addColorStop(0.4, 'rgba(6,8,13,0.25)'); vg.addColorStop(1, 'rgba(6,8,13,0.9)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W(), H());
    UI.header(ctx, app, 'Adventure', () => app.go('title'), { kicker: 'Career mode' });
    const tw = 168;
    HC.ADVENTURE.forEach((rg, i) => {
      const x = W() / 2 - (tw * 6 + 8 * 5) / 2 + i * (tw + 8), y = 104, unlocked = A.regionUnlocked(i), sel = i === ri;
      const r = { x, y, w: tw, h: 50, disabled: !unlocked, onClick: () => { app.params.region = i; A.prog().region = i; HC.Audio.select(); } };
      const on = UI.hit(app, r);
      ctx.fillStyle = sel ? 'rgba(22,30,46,0.95)' : 'rgba(10,14,22,0.8)'; UI.slant(ctx, x, y, tw, 50, 10); ctx.fill();
      ctx.strokeStyle = sel ? rg.color : on ? 'rgba(255,255,255,0.5)' : UIC.line; ctx.lineWidth = 1; ctx.stroke();
      if (sel) { ctx.fillStyle = rg.color; ctx.fillRect(x + 10, y + 47, tw - 20, 3); }
      UI.caps(ctx, 'Region ' + (i + 1), x + 22, y + 16, 9, sel ? rg.color : UIC.dim);
      if (unlocked) { UI.fitText(ctx, rg.name.toUpperCase(), x + 20, y + 34, 17, tw - 70, sel ? '#fff' : UIC.muted, 'left'); HC.icon(ctx, 'star', x + tw - 46, y + 33, 10, UIC.gold); UI.small(ctx, String(A.regionStars(i)), x + tw - 38, y + 34, 12, UIC.muted, 'left', 600); }
      else { HC.icon(ctx, 'lock', x + 28, y + 34, 13, UIC.dim); UI.caps(ctx, 'Locked', x + 42, y + 34, 9, UIC.dim); }
    });
    UI.text(ctx, reg.name.toUpperCase(), 48, 200, 38, '#fff', 'left', 0);
    ctx.fillStyle = reg.color; ctx.fillRect(50, 224, 50, 3);
    UI.small(ctx, reg.story, 48, 248, 14, UIC.muted, 'left', 500);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
    ctx.beginPath(); NODE_POS.forEach(([x, y], i) => { if (!i) ctx.moveTo(x, y); else { const [px, py] = NODE_POS[i - 1]; ctx.bezierCurveTo(px + 90, py, x - 90, y, x, y); } }); ctx.stroke(); ctx.restore();
    let tip = null, next = -1;
    reg.stages.forEach((st, si) => { if (next < 0 && A.stageUnlocked(ri, si) && A.stars(ri, si) === 0) next = si; });
    reg.stages.forEach((st, si) => {
      const [x, y] = NODE_POS[si], big = !!(st.boss || st.finale), R = big ? 46 : 36;
      const unlocked = A.stageUnlocked(ri, si), stars = A.stars(ri, si);
      const r = { x: x - R, y: y - R, w: R * 2, h: R * 2, disabled: !unlocked, onClick: () => app.go('stage', { mode: 'adventure', humans: 1, region: ri, stage: si }) };
      const on = UI.hit(app, r);
      if (UI.hover(app, r)) tip = { st, x, y: y - R - 14, unlocked };
      ctx.save(); ctx.translate(x, y);
      if (si === next) { ctx.strokeStyle = HC.hexA(reg.color, 0.4 + Math.sin(t * 4) * 0.3); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R + 9, 0, 7); ctx.stroke(); }
      const ng = ctx.createLinearGradient(0, -R, 0, R); ng.addColorStop(0, unlocked ? '#222d43' : '#141a26'); ng.addColorStop(1, unlocked ? '#111827' : '#0c1018');
      ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
      ctx.strokeStyle = !unlocked ? UIC.line : on || si === next ? reg.color : stars ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = on || si === next ? 3 : 1.5; ctx.stroke();
      if (!unlocked) HC.icon(ctx, 'lock', 0, 0, R * 0.6, UIC.dim);
      else if (st.boss || st.finale) { HC.icon(ctx, 'crown', 0, -6, R * 0.7, st.boss ? UIC.red : reg.color); UI.caps(ctx, st.boss ? 'Boss' : 'Final', 0, R * 0.42, 9, UIC.muted, 'center'); }
      else UI.text(ctx, String(si + 1).padStart(2, '0'), 0, 0, R * 0.95, '#fff', 'center', 0);
      for (let i = 0; i < 3; i++) UI.star(ctx, (i - 1) * 20, R + 16, 8, i < stars);
      ctx.restore();
      if (unlocked) UI.caps(ctx, st.name, x, y + R + 36, 9, si === next ? '#fff' : UIC.muted, 'center');
    });
    if (tip) {
      const txt = tip.unlocked ? (tip.st.team ? 'vs ' + tip.st.team.name : 'Boss: ' + HC.bossById(tip.st.boss).name) : 'Win the previous game first';
      ctx.font = '600 13px ' + HC.FONT_BODY; const w = ctx.measureText(txt).width + 28;
      const x = HC.U.clamp(tip.x - w / 2, 10, W() - w - 10);
      ctx.fillStyle = 'rgba(7,9,15,0.95)'; ctx.fillRect(x, tip.y - 40, w, 30); ctx.fillStyle = UIC.orange; ctx.fillRect(x, tip.y - 12, w, 2);
      UI.small(ctx, txt, x + w / 2, tip.y - 25, 13, '#fff', 'center', 600);
    }
    const total = A.totalStars(), nextMs = HC.ADV_MILESTONES.find(ms => total < ms.stars);
    if (nextMs) {
      UI.panel(ctx, 24, 644, 420, 56);
      drawItemIcon(ctx, nextMs.reward, 56, 672, 16, t);
      UI.caps(ctx, 'Next star reward · ' + nextMs.stars + ' stars', 86, 662, 10, UIC.muted);
      UI.bar(ctx, 86, 678, 340, 5, total / nextMs.stars, UIC.gold);
    }
    UI.button(ctx, app, { x: W() - 230, y: 646, w: 206, h: 52, label: 'Edit team', icon: 'users', color: UIC.grey, size: 20, onClick: () => app.go('chars', { mode: 'adventure', humans: 1, backTo: 'adventure', region: ri, stage: -1 }) });
  },
};

// ---------------------------------------------------------------- STAGE BRIEFING
S.stage = {
  draw(ctx, app, t) {
    const p = app.params;
    if (p.stage < 0 || p.stage == null) { app.go('adventure'); return; }
    const A = HC.Adventure, reg = HC.ADVENTURE[p.region], st = reg.stages[p.stage];
    courtBackdrop(ctx, reg.court, t, 0.78);
    UI.header(ctx, app, st.name, () => app.go('adventure'), { kicker: reg.name + ' · game ' + (p.stage + 1) + ' of 5' });
    const mine = (HC.Save.data.advTeam && HC.Save.data.advTeam.length >= 2) ? HC.Save.data.advTeam : ['pip', 'noodle'];
    const jc = HC.Cosmetics.jersey();
    UI.panel(ctx, 30, 118, 330, 420, { accent: jc.main });
    UI.caps(ctx, 'Your team', 52, 146, 11, UIC.muted);
    mine.slice(0, 2).forEach((id, i) => HC.drawPortrait(ctx, id, 120 + i * 150, 420, 210, jc, 'neutral'));
    UI.text(ctx, mine.slice(0, 2).map(id => HC.charById(id).name).join(' / ').toUpperCase(), 195, 452, 18, '#fff', 'center', 0);
    UI.button(ctx, app, { x: 90, y: 474, w: 210, h: 46, label: 'Change', icon: 'users', color: UIC.grey, size: 18, onClick: () => app.go('chars', { mode: 'adventure', humans: 1, backTo: 'stage', region: p.region, stage: p.stage }) });
    UI.panel(ctx, W() - 360, 118, 330, 420, { accent: st.boss ? UIC.red : st.team.colors.main });
    if (st.boss) {
      const b = HC.bossById(st.boss);
      UI.caps(ctx, 'Boss', W() - 338, 146, 11, UIC.red);
      ctx.save(); HC.rr(ctx, W() - 350, 160, 310, 310, 6); ctx.clip(); HC.drawPortrait(ctx, b.charId, W() - 195, 520, 380, b.colors, 'neutral', { facing: -1 }); ctx.restore();
      UI.fitText(ctx, b.name, W() - 195, 488, 22, 300, '#fff', 'center');
      UI.wrap(ctx, b.title, W() - 195, 514, 300, 16, 12, UIC.muted, 'center', 500);
    } else {
      UI.caps(ctx, 'Opponent', W() - 338, 146, 11, UIC.muted);
      st.team.chars.forEach((id, i) => HC.drawPortrait(ctx, id, W() - 270 + i * 150, 420, 210, st.team.colors, 'neutral', { facing: -1 }));
      UI.text(ctx, st.team.name.toUpperCase(), W() - 195, 452, 20, '#fff', 'center', 0);
      UI.caps(ctx, 'CPU ' + st.diff + '   ·   first to ' + st.win, W() - 195, 480, 10, UIC.muted, 'center');
    }
    UI.caps(ctx, 'Game details', 412, 172, 11, UIC.orange);
    UI.panel(ctx, 390, 190, 500, 350);
    let y = 222;
    if (st.mutator) {
      const mu = HC.mutatorById(st.mutator);
      ctx.fillStyle = 'rgba(63,169,245,0.08)'; ctx.fillRect(410, y - 18, 460, 40); ctx.fillStyle = UIC.cyan; ctx.fillRect(410, y - 18, 3, 40);
      UI.caps(ctx, 'Match rule', 424, y - 4, 9, UIC.cyan); UI.small(ctx, mu.name + ' all game', 424, y + 12, 14, '#fff', 'left', 600); y += 54;
    } else { UI.small(ctx, st.boss ? 'Drain the boss HP before it scores ' + HC.CONFIG.BOSS_WIN_SCORE + '.' : 'Mutator draft after every point.', 412, y, 14, UIC.muted, 'left', 500); y += 38; }
    UI.caps(ctx, 'Objectives', 412, y, 10); y += 26;
    const best = A.stars(p.region, p.stage);
    A.objectives(st).forEach((o, i) => { UI.star(ctx, 424, y, 9, i < best); UI.small(ctx, A.objText(o), 442, y, 15, '#fff', 'left', 500); y += 30; });
    y += 10;
    UI.caps(ctx, best ? 'Replay reward' : 'First-win reward', 412, y, 10); y += 30;
    HC.icon(ctx, 'coin', 426, y, 22, UIC.gold);
    UI.text(ctx, String(best ? Math.round(st.reward.coins * 0.25) : st.reward.coins), 444, y, 26, '#fff', 'left', 0);
    const u = st.reward.unlock;
    if (u) {
      drawItemIcon(ctx, u, 600, y, 20, t);
      UI.small(ctx, HC.Adventure.unlockLabel(u), 630, y - 8, 13, best ? UIC.muted : '#fff', 'left', 600);
      UI.caps(ctx, best ? 'Claimed' : 'New', 630, y + 12, 9, best ? UIC.green : UIC.orange);
    }
    UI.button(ctx, app, { x: W() / 2 - 150, y: 580, w: 300, h: 70, label: 'Play', icon: 'play', color: UIC.orange, size: 34, onClick: () => app.startAdventure(p.region, p.stage) });
  },
};

// ---------------------------------------------------------------- LOCKER
S.locker = {
  enter(app) { app.params = { tab: (app.params && app.params.tab) || 'ball' }; },
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'Locker', () => app.go('title'), { kicker: 'Customise', sub: 'Earn coins in every mode. Rare gear comes from Adventure.' });
    const p = app.params, sv = HC.Save.data;
    seg(ctx, app, 40, 118, [['ball', 'Ball skins'], ['jersey', 'Jerseys']], p.tab, (v) => { p.tab = v; }, 180);
    const ids = p.tab === 'ball' ? Object.keys(HC.BALL_SKINS) : Object.keys(HC.JERSEYS);
    const cols = 6, cw = 190, ch = 210, gap = 14, x0 = W() / 2 - (cols * cw + (cols - 1) * gap) / 2;
    const equipped = p.tab === 'ball' ? HC.Cosmetics.ballSkin() : ((sv.equip || {}).jersey || 'blue');
    ids.forEach((id, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = 182 + Math.floor(i / cols) * (ch + gap);
      const owned = HC.Cosmetics.owned(p.tab, id), shop = HC.SHOP.find(s => s.kind === p.tab && s.id === id);
      const isEq = equipped === id;
      const on = UI.hit(app, { x, y, w: cw, h: ch, onClick: () => {
        if (owned) { HC.Cosmetics.equip(p.tab, id); HC.Audio.card(); }
        else if (shop && (sv.coins || 0) >= shop.price) { HC.Cosmetics.buy(shop); HC.Cosmetics.equip(p.tab, id); HC.Audio.fanfare(); }
        else HC.Audio.groan();
      } });
      UI.panel(ctx, x, y, cw, ch, isEq ? { border: UIC.orange } : on ? { border: 'rgba(255,255,255,0.5)' } : null);
      if (isEq) { ctx.fillStyle = UIC.orange; ctx.fillRect(x, y, cw, 3); }
      if (!owned) ctx.globalAlpha = 0.35;
      if (p.tab === 'ball') { ctx.save(); ctx.translate(x + cw / 2, y + 80); ctx.rotate(t * (on ? 2 : 0.4)); HC.drawBall(ctx, [0, 0, 0, 44, id, -1, 0, 0]); ctx.restore(); }
      else drawJersey(ctx, x + cw / 2, y + 80, 100, HC.JERSEYS[id]);
      ctx.globalAlpha = 1;
      const name = p.tab === 'ball' ? HC.BALL_SKINS[id].name : HC.JERSEYS[id].name;
      UI.text(ctx, name.toUpperCase(), x + cw / 2, y + 150, 17, '#fff', 'center', 0);
      let status, scol;
      if (isEq) { status = 'Equipped'; scol = UIC.orange; }
      else if (owned) { status = 'Click to equip'; scol = UIC.green; }
      else if (shop) { status = shop.price + ' coins'; scol = (sv.coins || 0) >= shop.price ? UIC.gold : UIC.red; }
      else { status = 'Adventure reward'; scol = UIC.dim; }
      UI.caps(ctx, status, x + cw / 2, y + 184, 9, scol, 'center');
    });
    UI.caps(ctx, 'Current look', 40, 660, 10);
    HC.drawPortrait(ctx, (sv.advTeam || ['pip'])[0], 160, 706, 100, HC.Cosmetics.jersey(), 'neutral', { noShadow: true });
    ctx.save(); ctx.translate(214, 672); ctx.rotate(t); HC.drawBall(ctx, [0, 0, 0, 16, HC.Cosmetics.ballSkin(), -1, 0, 0]); ctx.restore();
  },
};

// ---------------------------------------------------------------- TOURNAMENT
S.bracket = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    const tour = app.tournament;
    UI.header(ctx, app, 'Tournament', tour.done ? null : () => app.quitToMenu(), { kicker: 'Knockout bracket' });
    const names = ['Quarter-finals', 'Semi-finals', 'Final'];
    const colX = [60, 410, 760], boxW = 300, boxH = 32;
    for (let r = 0; r < 3; r++) {
      UI.caps(ctx, names[r], colX[r], 110, 11, r === tour.round && !tour.done ? UIC.orange : UIC.dim);
      const pairs = tour.rounds[r] || [];
      const n = r === 0 ? 4 : r === 1 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const span = 490 / n, cy = 130 + span * i + span / 2;
        const pr = pairs[i], res = tour.results[r] && tour.results[r][i];
        [0, 1].forEach(k => {
          const y = cy - boxH - 2 + k * (boxH + 4);
          const ti = pr ? pr[k] : null, team = ti != null ? tour.teams[ti] : null;
          const lost = res && res.winner !== ti, won = res && res.winner === ti;
          ctx.fillStyle = team ? (lost ? 'rgba(15,20,30,0.85)' : 'rgba(26,34,52,0.95)') : 'rgba(255,255,255,0.03)'; ctx.fillRect(colX[r], y, boxW, boxH);
          if (team) { ctx.fillStyle = lost ? HC.hexA(team.colors.main, 0.4) : team.colors.main; ctx.fillRect(colX[r], y, 4, boxH); }
          if (ti === 0) { ctx.strokeStyle = UIC.orange; ctx.lineWidth = 1.5; ctx.strokeRect(colX[r] + 0.5, y + 0.5, boxW - 1, boxH - 1); }
          if (team) {
            UI.text(ctx, team.name.toUpperCase(), colX[r] + 14, y + boxH / 2, 16, lost ? UIC.dim : '#fff', 'left', 0);
            if (res) UI.text(ctx, String(res.score[k]), colX[r] + boxW - 12, y + boxH / 2, 17, won ? UIC.orange : UIC.dim, 'right', 0);
          } else UI.caps(ctx, 'TBD', colX[r] + 14, y + boxH / 2, 9, UIC.dim);
        });
        if (r < 2) { ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(colX[r] + boxW, cy); ctx.lineTo(colX[r] + boxW + 50, cy); ctx.stroke(); }
      }
    }
    const champ = tour.champion != null ? tour.teams[tour.champion] : null;
    HC.icon(ctx, 'trophy', 1160, 350, 70, UIC.gold);
    UI.caps(ctx, 'Champion', 1160, 410, 10, UIC.dim, 'center');
    UI.text(ctx, champ ? champ.name.toUpperCase() : 'TBD', 1160, 432, 16, champ ? UIC.gold : UIC.dim, 'center', 0);
    const up = Object.entries(tour.upgradeNames).map(([k, n]) => k + (n > 1 ? ' ×' + n : '')).join(', ');
    UI.small(ctx, 'Upgrades: ' + (up || 'none yet'), W() / 2, 606, 13, UIC.muted, 'center', 500);
    if (tour.done) UI.button(ctx, app, { x: W() / 2 - 150, y: 632, w: 300, h: 58, label: 'Main menu', icon: 'home', color: UIC.grey, onClick: () => app.quitToMenu() });
    else {
      const opp = tour.teams[tour.opponent()];
      UI.button(ctx, app, { x: W() / 2 - 260, y: 632, w: 520, h: 60, label: 'Play ' + names[tour.round] + ' vs ' + opp.name, icon: 'play', color: UIC.orange, size: 20, onClick: () => app.playTournamentMatch() });
    }
  },
};

S.upgrade = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'Choose an upgrade', null, { kicker: 'Between rounds', sub: 'Lasts for the rest of the tournament.' });
    app.params.choices.forEach((u, i) => {
      const x = W() / 2 - 465 + i * 320, y = 190, r = { x, y, w: 290, h: 320, onClick: () => { app.tournament.addUpgrade(u); HC.Audio.card(); app.go('bracket'); } };
      const on = UI.hit(app, r);
      UI.panel(ctx, x, y, 290, 320, on ? { border: UIC.orange } : null);
      ctx.fillStyle = on ? UIC.orange : 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y, 290, 3);
      UI.caps(ctx, 'Upgrade ' + (i + 1), x + 24, y + 36, 10, UIC.orange);
      UI.text(ctx, u.name.toUpperCase(), x + 22, y + 140, 34, '#fff', 'left', 0);
      UI.wrap(ctx, u.desc, x + 24, y + 186, 240, 20, 15, UIC.muted, 'left', 500);
      if (on) UI.caps(ctx, 'Select', x + 24, y + 290, 10, UIC.orange);
    });
  },
};

S.trophy = {
  enter(app) { app.trophyFx = new HC.FX(); HC.Audio.fanfare(); HC.Audio.cheer(); },
  draw(ctx, app, t) {
    UI.bg(ctx, t, UIC.gold);
    const sp = ctx.createRadialGradient(W() / 2, 320, 20, W() / 2, 320, 360); sp.addColorStop(0, 'rgba(232,180,67,0.22)'); sp.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sp; ctx.fillRect(0, 0, W(), H());
    if (Math.random() < 0.05) app.trophyFx.confetti();
    app.trophyFx.update(1 / 60);
    ctx.save(); ctx.translate(W() / 2, 340);
    const gold = ctx.createLinearGradient(-90, 0, 90, 0); gold.addColorStop(0, '#9c7417'); gold.addColorStop(0.5, '#f6dc8a'); gold.addColorStop(1, '#9c7417');
    ctx.fillStyle = gold; ctx.strokeStyle = '#5a4210'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-80, -130); ctx.lineTo(80, -130); ctx.quadraticCurveTo(80, 10, 0, 30); ctx.quadraticCurveTo(-80, 10, -80, -130); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 10; ctx.strokeStyle = gold; ctx.beginPath(); ctx.arc(-86, -80, 34, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(86, -80, 34, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.fillStyle = gold; ctx.fillRect(-14, 25, 28, 60); ctx.fillRect(-64, 85, 128, 26);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-56, 90, 112, 16);
    ctx.restore();
    app.trophyFx.draw(ctx);
    UI.caps(ctx, app.params.line ? 'Adventure complete' : 'Tournament complete', W() / 2, 60, 12, UIC.gold, 'center');
    UI.text(ctx, (app.params.title || 'Champions').toUpperCase(), W() / 2, 104, 70, '#fff', 'center', 0);
    UI.small(ctx, app.params.line || (app.params.teamName + ' won the Hoop Chaos Tournament.'), W() / 2, 150, 16, UIC.muted, 'center', 500);
    if (!app.params.line) UI.caps(ctx, 'Boss Battles unlocked', W() / 2, 530, 13, UIC.orange, 'center');
    UI.button(ctx, app, { x: W() / 2 - 320, y: 584, w: 300, h: 62, label: app.params.line ? 'Adventure' : 'Boss Battles', icon: app.params.line ? 'map' : 'crown', color: UIC.orange, onClick: () => app.go(app.params.line ? 'adventure' : 'bossSelect') });
    UI.button(ctx, app, { x: W() / 2 + 20, y: 584, w: 300, h: 62, label: 'Main menu', icon: 'home', color: UIC.grey, onClick: () => app.quitToMenu() });
  },
};

// ---------------------------------------------------------------- BOSSES
S.bossSelect = {
  draw(ctx, app, t) {
    UI.bg(ctx, t, UIC.red);
    UI.header(ctx, app, 'Boss Battles', () => app.quitToMenu(), { kicker: 'Challenge', sub: 'Your two players against one giant. Drain its HP before it scores ' + HC.CONFIG.BOSS_WIN_SCORE + '.' });
    const sv = HC.Save.data;
    HC.BOSSES.forEach((b, i) => {
      const x = W() / 2 - 610 + i * 305, y = 130;
      const locked = b.final && !app.settings.unlockAll && !HC.Admin.all() && HC.BOSSES.filter(o => !o.final).some(o => !sv.bosses[o.id]);
      const beaten = sv.bosses[b.id];
      const on = UI.hit(app, { x: x + 10, y, w: 285, h: 440, disabled: locked, onClick: () => app.go('chars', { mode: 'boss', humans: 1, bossId: b.id }) });
      UI.panel(ctx, x + 10, y, 285, 440, on ? { border: UIC.red } : null);
      ctx.fillStyle = on ? UIC.red : 'rgba(255,255,255,0.12)'; ctx.fillRect(x + 10, y, 285, 3);
      ctx.save(); HC.rr(ctx, x + 18, y + 10, 269, 300, 6); ctx.clip();
      const g = ctx.createRadialGradient(x + 152, y + 300, 10, x + 152, y + 300, 240); g.addColorStop(0, HC.hexA(b.colors.main, 0.6)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 300, 320);
      ctx.globalAlpha = locked ? 0.12 : 1; HC.drawPortrait(ctx, b.charId, x + 152, y + 330, 300, b.colors, 'neutral', { noShadow: true }); ctx.restore();
      UI.caps(ctx, 'Boss ' + (i + 1), x + 30, y + 330, 10, UIC.red);
      UI.fitText(ctx, locked ? 'LOCKED' : b.name, x + 28, y + 356, 22, 250, '#fff', 'left');
      UI.wrap(ctx, locked ? 'Beat the other three bosses to unlock the final boss.' : b.title, x + 30, y + 386, 250, 16, 12, UIC.muted, 'left', 500);
      if (locked) HC.icon(ctx, 'lock', x + 152, y + 160, 50, 'rgba(255,255,255,0.5)');
      if (beaten) { HC.icon(ctx, 'check', x + 270, y + 330, 14, UIC.green); UI.caps(ctx, 'Beaten', x + 258, y + 330, 9, UIC.green, 'right'); }
    });
  },
};

S.bossIntro = {
  enter(app) { HC.Audio.sting(); app.introT = 0; },
  draw(ctx, app, t) {
    app.introT += 1 / 60;
    const b = HC.bossById(app.params.bossId), k = app.introT;
    ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, W(), H());
    const rg = ctx.createRadialGradient(W() * 0.3, H(), 20, W() * 0.3, H(), 700); rg.addColorStop(0, HC.hexA(b.colors.main, 0.55)); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W(), H());
    for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(255,71,87,0.05)'; ctx.save(); ctx.translate(W() / 2, H() / 2); ctx.rotate(-0.2); ctx.fillRect(-900, -400 + i * 150 + ((k * 200) % 300) - 300, 1800, 3); ctx.restore(); }
    if (k > 0.7 && k < 0.85) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W(), H()); }
    const px = Math.min(1, k / 0.7);
    HC.drawPortrait(ctx, b.charId, W() * 0.28 - (1 - px) * 600, 660, 580, b.colors, 'neutral');
    if (k > 0.7) {
      const s = Math.max(1, 2 - (k - 0.7) * 6);
      UI.caps(ctx, 'Boss battle', W() * 0.58, 200, 13, UIC.red);
      ctx.save(); ctx.translate(W() * 0.58, 248); ctx.scale(s, s); UI.text(ctx, b.name, 0, 0, 68, '#fff', 'left', 0); ctx.restore();
      ctx.fillStyle = UIC.red; ctx.fillRect(W() * 0.58, 290, 80, 4);
    }
    if (k > 1.2) {
      UI.small(ctx, b.title, W() * 0.58, 326, 17, UIC.muted, 'left', 500);
      UI.caps(ctx, 'Special moves', W() * 0.58, 368, 10, UIC.orange);
      UI.small(ctx, b.specials.map(id => clean(HC.SPECIALS[id].name)).join('  ·  '), W() * 0.58, 392, 16, '#fff', 'left', 600);
      UI.small(ctx, 'Watch for the warning, then get out of the way.', W() * 0.58, 422, 13, UIC.dim, 'left', 500);
    }
    if (k > 1.6) UI.button(ctx, app, { x: W() * 0.58, y: 470, w: 280, h: 66, label: 'Fight', icon: 'play', color: UIC.red, size: 30, onClick: () => { const p = app.params; if (p.mode === 'adventure') app.launch(); else { p.court = b.court; app.startMatch(p); } } });
  },
};

// ---------------------------------------------------------------- SETTINGS
S.settings = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'Settings', () => app.go('title'), { kicker: 'Options' });
    const st = app.settings;
    UI.panel(ctx, W() / 2 - 420, 112, 840, 456, { accent: UIC.orange });
    const row = (y, label, value, minus, plus) => {
      ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fillRect(W() / 2 - 400, y - 4, 800, 54);
      UI.text(ctx, label.toUpperCase(), W() / 2 - 376, y + 23, 21, '#fff', 'left', 0);
      UI.button(ctx, app, { x: W() / 2 + 110, y: y + 2, w: 46, h: 42, label: '–', color: UIC.grey, onClick: minus, size: 24 });
      UI.text(ctx, value, W() / 2 + 240, y + 23, 22, UIC.orange, 'center', 0);
      UI.button(ctx, app, { x: W() / 2 + 324, y: y + 2, w: 46, h: 42, label: '+', color: UIC.grey, onClick: plus, size: 24 });
    };
    row(132, 'Volume', Math.round(st.volume * 100) + '%', () => app.setSetting('volume', Math.max(0, +(st.volume - 0.1).toFixed(2))), () => app.setSetting('volume', Math.min(1, +(st.volume + 0.1).toFixed(2))));
    row(194, 'Points to win', String(st.winScore), () => app.setSetting('winScore', Math.max(2, st.winScore - 1)), () => app.setSetting('winScore', Math.min(30, st.winScore + 1)));
    const diffs = ['easy', 'medium', 'hard'];
    row(256, 'CPU difficulty', st.difficulty.toUpperCase(), () => app.setSetting('difficulty', diffs[Math.max(0, diffs.indexOf(st.difficulty) - 1)]), () => app.setSetting('difficulty', diffs[Math.min(2, diffs.indexOf(st.difficulty) + 1)]));
    const times = HC.MATCH_TIMES, ti = Math.max(0, times.indexOf(st.matchTime));
    row(318, 'Game time limit', UI.timeLabel(st.matchTime), () => app.setSetting('matchTime', times[Math.max(0, ti - 1)]), () => app.setSetting('matchTime', times[Math.min(times.length - 1, ti + 1)]));
    row(380, 'Screen shake', st.shake ? 'ON' : 'OFF', () => app.setSetting('shake', !st.shake), () => app.setSetting('shake', !st.shake));
    row(442, 'Unlock all (testing)', st.unlockAll ? 'ON' : 'OFF', () => app.setSetting('unlockAll', !st.unlockAll), () => app.setSetting('unlockAll', !st.unlockAll));
    UI.caps(ctx, 'Account: ' + HC.Auth.label(), W() / 2, 536, 10, UIC.dim, 'center');
    UI.button(ctx, app, { x: W() / 2 - 410, y: 604, w: 260, h: 54, label: 'Account', icon: 'user', color: UIC.grey, size: 20, onClick: () => HC.LoginPage.show() });
    UI.button(ctx, app, { x: W() / 2 - 130, y: 604, w: 260, h: 54, label: 'Admin panel', icon: 'lock', color: UIC.grey, size: 20, onClick: () => HC.Admin.open() });
    UI.button(ctx, app, { x: W() / 2 + 150, y: 604, w: 260, h: 54, label: 'Reset save', icon: 'trash', color: '#7a1f2b', size: 20, onClick: () => { if (confirm('Erase all progress on this profile?')) HC.Save.reset(); } });
  },
};

// ---------------------------------------------------------------- HELP
S.help = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'How to play', () => app.go('title'), { kicker: 'Guide' });
    const box = (x, y, w, h, title, lines) => {
      UI.panel(ctx, x, y, w, h, { accent: UIC.orange });
      UI.text(ctx, title.toUpperCase(), x + 24, y + 34, 24, '#fff', 'left', 0);
      lines.forEach((l, i) => UI.wrap(ctx, l, x + 24, y + 74 + i * 44, w - 48, 18, 14, UIC.muted, 'left', 500));
    };
    box(40, 110, 590, 270, 'One button', ['Player 1 is W, player 2 is the Up arrow. On touch screens use the buttons at the bottom.', 'Hold to crouch and wind up. Release to jump and swing your arms.', 'Holding the ball? Jump, then tap again near the top of the jump to shoot.', 'Touch the ball to grab it. Swipe at a rival\'s ball to steal it.']);
    box(650, 110, 590, 270, 'Specials', ['Every player has an ability. Your team\'s SPECIAL meter fills during play.', 'When it\'s full, keep holding past a full wind-up and release.', 'Both of your players use their ability at the same time.', 'Steals and conceding a basket fill the meter faster.']);
    box(40, 400, 590, 280, 'Scoring', ['Two points inside the line, three outside. Each trick shot adds one more:', 'bank, dunk, header, full-court, upside-down, buzzer beater and off-the-rim.', 'After each basket, the team that conceded picks a mutator for the next point.', 'Every court has a live event. Watch for the warning banner.']);
    box(650, 400, 590, 280, 'Progress', ['Adventure: 6 regions, 30 games, up to 3 stars each. Unlock players and gear.', 'Coins are earned in every mode and spent in the Locker.', 'Win a tournament to unlock Boss Battles. Beat a boss to play as them.', 'Sign in to keep your progress. Esc or P pauses.']);
  },
};

S.roster = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'Roster', () => app.go('title'), { kicker: HC.CHARACTERS.filter(c => HC.isUnlocked(c)).length + ' of ' + HC.CHARACTERS.length + ' unlocked' });
    HC.CHARACTERS.forEach((c, i) => {
      const cw = 232, x = 26 + (i % 5) * (cw + 12), y = 108 + Math.floor(i / 5) * 200;
      const locked = !HC.isUnlocked(c), ab = HC.abilityOf(c);
      UI.panel(ctx, x, y, cw, 188);
      ctx.save(); HC.rr(ctx, x + 8, y + 8, 92, 172, 6); ctx.clip();
      const jg = ctx.createLinearGradient(0, y, 0, y + 180); jg.addColorStop(0, '#1d2638'); jg.addColorStop(1, HC.hexA(HC.Cosmetics.jersey().main, locked ? 0 : 0.35)); ctx.fillStyle = jg; ctx.fillRect(x + 8, y + 8, 92, 172);
      ctx.globalAlpha = locked ? 0.15 : 1; HC.drawPortrait(ctx, c.id, x + 54, y + 170, 140, HC.Cosmetics.jersey(), 'neutral', { noShadow: true }); ctx.restore();
      if (locked) HC.icon(ctx, 'lock', x + 54, y + 90, 26, 'rgba(255,255,255,0.5)');
      UI.fitText(ctx, locked ? 'LOCKED' : c.name.toUpperCase(), x + 112, y + 26, 18, cw - 120, '#fff', 'left');
      UI.wrap(ctx, locked ? unlockHint(c) : c.perk, x + 112, y + 54, cw - 120, 15, 12, UIC.muted, 'left', 500);
      if (ab) { UI.caps(ctx, locked ? '???' : ab.name, x + 112, y + 124, 9, UIC.orange); if (!locked) UI.wrap(ctx, ab.desc, x + 112, y + 146, cw - 120, 14, 11, UIC.dim, 'left', 500); }
    });
  },
};

// ---------------------------------------------------------------- ADMIN PANEL
S.admin = {
  draw(ctx, app, t) {
    UI.bg(ctx, t);
    UI.header(ctx, app, 'Admin panel', () => app.go('settings'), { kicker: 'Restricted', sub: 'Changes are saved to this profile.' });
    const a = HC.Admin.state();
    const toggle = (x, y, label, key, desc) => {
      UI.panel(ctx, x, y, 400, 70);
      UI.text(ctx, label.toUpperCase(), x + 18, y + 25, 18, '#fff', 'left', 0);
      UI.small(ctx, desc, x + 18, y + 49, 12, UIC.muted, 'left', 500);
      UI.button(ctx, app, { x: x + 300, y: y + 14, w: 84, h: 42, label: a[key] ? 'On' : 'Off', color: a[key] ? UIC.orange : UIC.grey, size: 17, onClick: () => { a[key] = !a[key]; HC.Save.save(); } });
    };
    toggle(30, 110, 'Unlock everything', 'unlockAll', 'All players, gear, games and bosses');
    toggle(30, 190, 'Infinite special', 'infiniteSpecial', 'Your SPECIAL is always ready');
    toggle(30, 270, 'Show hitboxes', 'debug', 'Draws physics bodies during games');
    toggle(30, 350, 'Chaos mode', 'chaos', 'A random mutator is always on');
    UI.panel(ctx, 30, 430, 400, 116);
    UI.caps(ctx, 'Game speed', 48, 456, 10);
    [0.5, 1, 1.5, 2].forEach((s, i) => UI.button(ctx, app, { x: 48 + i * 94, y: 476, w: 84, h: 42, label: s + 'x', color: (a.speed || 1) === s ? UIC.orange : UIC.grey, size: 17, onClick: () => { a.speed = s; HC.Save.save(); } }));
    UI.panel(ctx, 30, 560, 400, 116);
    UI.caps(ctx, 'Jump power', 48, 586, 10);
    [1, 1.3, 1.6, 2].forEach((s, i) => UI.button(ctx, app, { x: 48 + i * 94, y: 606, w: 84, h: 42, label: s + 'x', color: (a.jump || 1) === s ? UIC.orange : UIC.grey, size: 17, onClick: () => { a.jump = s; HC.Save.save(); } }));
    UI.panel(ctx, 460, 110, 790, 290, { accent: UIC.orange });
    UI.caps(ctx, 'Quick actions', 480, 136, 11, UIC.orange);
    const acts = [
      ['+1,000 coins', 'coin', () => { HC.Cosmetics.addCoins(1000); HC.Audio.fanfare(); }],
      ['3-star Adventure', 'star', () => { HC.Admin.maxAdventure(); HC.Audio.fanfare(); }],
      ['Beat all bosses', 'crown', () => { HC.Admin.beatBosses(); HC.Audio.fanfare(); }],
      ['Give all gear', 'bag', () => { HC.Admin.allGear(); HC.Audio.fanfare(); }],
      ['Add a trophy', 'trophy', () => { HC.Save.data.trophies++; HC.Save.save(); HC.Audio.fanfare(); }],
      ['Reset Adventure', 'refresh', () => { if (confirm('Reset all Adventure stars?')) { HC.Save.data.adv = { stars: {}, cleared: {}, region: 0 }; HC.Save.save(); } }],
    ];
    acts.forEach((b, i) => UI.button(ctx, app, { x: 480 + (i % 3) * 252, y: 160 + Math.floor(i / 3) * 106, w: 238, h: 80, label: b[0], icon: b[1], color: i === 5 ? '#7a1f2b' : UIC.grey, size: 18, onClick: b[2] }));
    UI.panel(ctx, 460, 416, 790, 260);
    UI.caps(ctx, 'Test game', 480, 442, 11, UIC.orange);
    UI.small(ctx, 'Opponent CPU', 480, 484, 14, '#fff', 'left', 600);
    seg(ctx, app, 650, 462, [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], app.settings.difficulty, (v) => app.setSetting('difficulty', v), 120);
    UI.small(ctx, 'Forced mutator', 480, 540, 14, '#fff', 'left', 600);
    const mutIdx = HC.MUTATORS.findIndex(m => m.id === a.forceMut), mut = HC.MUTATORS[mutIdx];
    UI.button(ctx, app, { x: 650, y: 518, w: 380, h: 42, label: mut ? mut.name : 'None', color: mut ? UIC.orange : UIC.grey, size: 17, onClick: () => { const next = mutIdx + 1; a.forceMut = next < HC.MUTATORS.length ? HC.MUTATORS[next].id : null; HC.Save.save(); } });
    UI.caps(ctx, 'Click to cycle', 1044, 540, 9, UIC.dim);
    UI.button(ctx, app, { x: 480, y: 590, w: 360, h: 62, label: 'Play test game', icon: 'play', color: UIC.orange, size: 22, onClick: () => app.startMatch({ mode: 'quick', humans: 1, picks: [HC.Save.data.lastPicks && HC.Save.data.lastPicks.length >= 2 ? HC.Save.data.lastPicks : ['pip', 'noodle'], []], court: HC.U.pick(HC.COURTS).id }) });
    UI.button(ctx, app, { x: 860, y: 590, w: 370, h: 62, label: 'Lock admin', icon: 'lock', color: UIC.grey, size: 22, onClick: () => { a.enabled = false; HC.Save.save(); app.go('settings'); } });
  },
};
