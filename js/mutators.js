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

// Draw a mutator card
HC.drawCard = function (ctx, mut, x, y, w, h, hl, t) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  const s = hl ? 1.08 + Math.sin((t || 0) * 8) * 0.015 : 1;
  ctx.scale(s, s); ctx.rotate(hl ? Math.sin((t || 0) * 5) * 0.015 : 0);
  if (hl) { ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 40; }
  ctx.fillStyle = '#1b1230'; HC.rr(ctx, -w / 2 + 4, -h / 2 + 8, w, h, 18); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff8ec'; HC.rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill();
  ctx.strokeStyle = hl ? '#ffd23f' : '#1b1230'; ctx.lineWidth = hl ? 6 : 4; ctx.stroke();
  const g = ctx.createLinearGradient(0, -h / 2, 0, -h / 2 + h * 0.52);
  g.addColorStop(0, HC.shade(mut.color, 0.25)); g.addColorStop(1, HC.shade(mut.color, -0.15));
  ctx.fillStyle = g; HC.rr(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h * 0.5, 12); ctx.fill();
  ctx.strokeStyle = '#1b1230'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-w / 2 + 10 + i * 50, -h / 2 + 10 + h * 0.5, 20, Math.PI, 0); ctx.fill(); }
  ctx.font = Math.round(h * 0.25) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(mut.icon, 0, -h / 2 + 10 + h * 0.25);
  ctx.font = Math.round(h * 0.085) + 'px ' + HC.FONT_DISPLAY; ctx.fillStyle = '#1b1230';
  ctx.fillText(mut.name.toUpperCase(), 0, h * 0.14);
  ctx.font = '700 ' + Math.round(h * 0.055) + 'px ' + HC.FONT_BODY; ctx.fillStyle = '#4a3f66';
  HC.wrapText(ctx, mut.desc, 0, h * 0.26, w - 34, h * 0.07);
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
