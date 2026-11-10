// Mutator cards. Each mutator is ONE object with apply()/remove() hooks (and optional update()).
// To add a new one: push an object into HC.MUTATORS. Set live:true if it can be switched on mid-point
// (Coach Thunder uses those). Mutators change match.mods (read by players/balls/world) or live state.
window.HC = window.HC || {};

HC.defaultMods = () => ({
  gravityMul: 1, ballScale: 1, ballRestitution: null, ballDensity: 1, ballAir: 0, ballStyle: 'normal',
  armScale: 1, legScale: 1, headScale: 1, slippery: false, playerBounce: 0, jumpMul: 1, jumpForwardMul: 1,
  groundDrag: 0, uprightMul: 1, doubleBall: false, bomb: false,
});

HC.MUTATORS = [
  { id: 'moon', name: 'Moon Gravity', icon: '🌙', color: '#8a8fd6', live: true, desc: 'Floaty low gravity for everything.',
    apply(m) { m.mods.gravityMul *= 0.4; m.refreshLive(); }, remove(m) { m.mods.gravityMul /= 0.4; m.refreshLive(); } },
  { id: 'giant', name: 'Giant Ball', icon: '🏐', color: '#f39c12', live: true, desc: 'The ball is HUGE.',
    apply(m) { m.mods.ballScale *= 1.8; m.refreshLive(); }, remove(m) { m.mods.ballScale /= 1.8; m.refreshLive(); } },
  { id: 'tiny', name: 'Tiny Ball', icon: '🔸', color: '#e67e22', live: true, desc: 'A pea-sized ball. Good luck.',
    apply(m) { m.mods.ballScale *= 0.6; m.refreshLive(); }, remove(m) { m.mods.ballScale /= 0.6; m.refreshLive(); } },
  { id: 'beach', name: 'Beach Ball', icon: '🏖️', color: '#3fc1ff', live: true, desc: 'Light, floaty and bouncy.',
    apply(m) { Object.assign(m.mods, { ballScale: m.mods.ballScale * 1.5, ballDensity: 0.25, ballAir: 0.012, ballRestitution: 0.9, ballStyle: 'beach' }); m.refreshLive(); },
    remove(m) { Object.assign(m.mods, { ballScale: m.mods.ballScale / 1.5, ballDensity: 1, ballAir: 0, ballRestitution: null, ballStyle: 'normal' }); m.refreshLive(); } },
  { id: 'bowling', name: 'Bowling Ball', icon: '🎳', color: '#34495e', live: true, desc: 'Heavy. Dead bounce. Knocks people over.',
    apply(m) { Object.assign(m.mods, { ballDensity: 5, ballRestitution: 0.25, ballStyle: 'bowling' }); m.refreshLive(); },
    remove(m) { Object.assign(m.mods, { ballDensity: 1, ballRestitution: null, ballStyle: 'normal' }); m.refreshLive(); } },
  { id: 'longarms', name: 'Long Arms', icon: '🦍', color: '#9b59b6', desc: 'Everyone gets noodle arms.',
    apply(m) { m.mods.armScale *= 1.75; }, remove(m) { m.mods.armScale /= 1.75; } },
  { id: 'shortlegs', name: 'Short Legs', icon: '🦵', color: '#16a085', desc: 'Stubby little legs.',
    apply(m) { m.mods.legScale *= 0.5; m.mods.jumpMul *= 1.1; }, remove(m) { m.mods.legScale /= 0.5; m.mods.jumpMul /= 1.1; } },
  { id: 'bigheads', name: 'Big Heads', icon: '🎃', color: '#d35400', desc: 'Massive noggins. Headers galore.',
    apply(m) { m.mods.headScale *= 2.1; }, remove(m) { m.mods.headScale /= 2.1; } },
  { id: 'slippery', name: 'Slippery Floor', icon: '🧊', color: '#74d3ff', live: true, desc: 'Freshly waxed. No grip.',
    apply(m) { m.mods.slippery = true; m.refreshLive(); }, remove(m) { m.mods.slippery = false; m.refreshLive(); } },
  { id: 'bounce', name: 'Super Bounce', icon: '🦘', color: '#2ecc71', live: true, desc: 'Ball and players bounce like crazy.',
    apply(m) { Object.assign(m.mods, { ballRestitution: 1.0, playerBounce: 0.85 }); m.mods.jumpMul *= 1.1; m.refreshLive(); },
    remove(m) { Object.assign(m.mods, { ballRestitution: null, playerBounce: 0 }); m.mods.jumpMul /= 1.1; m.refreshLive(); } },
  { id: 'double', name: 'Double Ball', icon: '⚾', color: '#c0392b', desc: 'Two balls in play at once!',
    apply(m) { m.mods.doubleBall = true; }, remove(m) { m.mods.doubleBall = false; } },
  { id: 'movinghoop', name: 'Moving Hoop', icon: '↕️', color: '#e84393', live: true, desc: 'Both hoops drift up and down.',
    apply(m) { this.t = 0; }, remove(m) { m.world.hoops.forEach(h => m.world.placeHoop(h, 0, 0)); },
    update(m, dt) { this.t += dt; m.world.hoops.forEach((h, i) => m.world.placeHoop(h, 0, Math.sin(this.t * 1.3 + i * 2) * 75, true)); } },
  { id: 'tilt', name: 'Tilting Court', icon: '📐', color: '#a0522d', live: true, desc: 'The floor rocks back and forth.',
    apply(m) { this.t = 0; }, remove(m) { m.setFloorAngle(0); },
    update(m, dt) { this.t += dt; m.setFloorAngle(Math.sin(this.t * 0.8) * 0.1); } },
  { id: 'blackout', name: 'Blackout', icon: '🌑', color: '#2c2c54', live: true, desc: 'The lights keep cutting out.',
    apply(m) { this.t = 0; }, remove(m) { m.darkMut = 0; },
    update(m, dt) { this.t += dt; const c = this.t % 5.5; m.darkMut = c > 3 ? Math.min(1, (c - 3) * 4, (5.5 - c) * 4) : 0; } },
  { id: 'wind', name: 'Wind Gusts', icon: '🌪️', color: '#7f8c8d', live: true, desc: 'Gusts shove everything sideways.',
    apply(m) { this.t = 0; this.dir = 1; }, remove(m) { m.windMut = 0; },
    update(m, dt) { this.t += dt; const c = this.t % 6; if (c < dt) { this.dir = Math.random() < 0.5 ? -1 : 1; HC.Audio.wind(); } m.windMut = c < 2.5 ? this.dir * Math.sin(c / 2.5 * Math.PI) : 0; } },
  { id: 'bomb', name: 'Bomb Ball', icon: '💣', color: '#111', desc: "Don't be holding it when it blows!",
    apply(m) { m.mods.bomb = true; }, remove(m) { m.mods.bomb = false; } },
  { id: 'megajump', name: 'Mega Jump', icon: '🚀', color: '#ff4757', live: true, desc: 'Everyone jumps 45% higher.',
    apply(m) { m.mods.jumpMul *= 1.45; }, remove(m) { m.mods.jumpMul /= 1.45; } },
  { id: 'butter', name: 'Butterfingers', icon: '🧈', color: '#f6e58d', live: true, desc: 'The ball keeps slipping out of hands.',
    apply(m) {}, remove(m) {},
    update(m, dt) { for (const b of m.balls) if (b.heldBy && b.holdTime > 0.6 && Math.random() < dt * 0.7) m.dropBall(b, true); } },
];
HC.mutatorById = (id) => HC.MUTATORS.find(x => x.id === id);

// Draw a mutator card (dark broadcast style)
HC.drawCard = function (ctx, mut, x, y, w, h, hl, t) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 - (hl ? 10 : 0));
  const W2 = w / 2, H2 = h / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; HC.rr(ctx, -W2 + 3, -H2 + 6, w, h, 8); ctx.fill();
  const g = ctx.createLinearGradient(0, -H2, 0, H2); g.addColorStop(0, '#1b2436'); g.addColorStop(1, '#0c111b');
  ctx.fillStyle = g; HC.rr(ctx, -W2, -H2, w, h, 8); ctx.fill();
  // colour band + large index
  const band = ctx.createLinearGradient(-W2, -H2, W2, -H2 + h * 0.45); band.addColorStop(0, HC.hexA(mut.color === '#111' ? '#ff4757' : mut.color, 0.55)); band.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); HC.rr(ctx, -W2, -H2, w, h, 8); ctx.clip(); ctx.fillStyle = band; ctx.fillRect(-W2, -H2, w, h * 0.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; for (let i = -6; i < 10; i++) { ctx.beginPath(); ctx.moveTo(-W2 + i * 28, -H2); ctx.lineTo(-W2 + i * 28 - 60, -H2 + h * 0.5); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = hl ? '#ff6a13' : (mut.color === '#111' ? '#ff4757' : mut.color); ctx.fillRect(-W2, -H2, w, 4);
  ctx.strokeStyle = hl ? '#ff6a13' : 'rgba(255,255,255,0.12)'; ctx.lineWidth = hl ? 2 : 1; HC.rr(ctx, -W2 + 0.5, -H2 + 0.5, w - 1, h - 1, 8); ctx.stroke();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '700 11px ' + HC.FONT_BODY; if ('letterSpacing' in ctx) ctx.letterSpacing = '2px'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('MUTATOR', -W2 + 20, -H2 + 26); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.font = HC.dfont(Math.round(h * 0.4)); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.textAlign = 'right'; ctx.fillText(String(HC.MUTATORS.indexOf(mut) + 1).padStart(2, '0'), W2 - 14, -H2 + h * 0.24);
  ctx.textAlign = 'left';
  let fs = Math.round(h * 0.1); ctx.font = HC.dfont(fs);
  const name = mut.name.toUpperCase();
  while (ctx.measureText(name).width > w - 40 && fs > 14) { fs--; ctx.font = HC.dfont(fs); }
  ctx.fillStyle = '#fff'; ctx.fillText(name, -W2 + 20, -H2 + h * 0.56);
  ctx.fillStyle = '#ff6a13'; ctx.fillRect(-W2 + 20, -H2 + h * 0.56 + fs * 0.62, 36, 3);
  ctx.font = '500 ' + Math.round(h * 0.047) + 'px ' + HC.FONT_BODY; ctx.fillStyle = '#9aa4b6';
  HC.wrapText(ctx, mut.desc, -W2 + 20, -H2 + h * 0.74, w - 40, h * 0.065);
  if (hl) { ctx.font = '700 11px ' + HC.FONT_BODY; ctx.fillStyle = '#ff6a13'; if ('letterSpacing' in ctx) ctx.letterSpacing = '2px'; ctx.fillText('SELECT', -W2 + 20, H2 - 20); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'; }
  ctx.restore();
};

HC.wrapText = function (ctx, text, x, y, maxW, lh) {
  const words = String(text).split(' '); let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; }
    else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
};
