// Physics world: Matter.js engine, arena, hoops (wobbling rim + swinging net) and balls.
window.HC = window.HC || {};

HC.U = {
  clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
  lerp: (a, b, t) => a + (b - a) * t,
  rand: (a, b) => a + Math.random() * (b - a),
  randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  wrapAngle(a) { a = (a + Math.PI) % (Math.PI * 2); if (a < 0) a += Math.PI * 2; return a - Math.PI; },
  dist: (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by),
  gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; },
};

// Collision categories
HC.CAT = { STATIC: 0x0001, PLAYER: 0x0002, BALL: 0x0004, HOOP: 0x0008, DEBRIS: 0x0010, BLOCKER: 0x0020 };

HC.World = class World {
  constructor(court) {
    const C = HC.CONFIG, M = Matter;
    this.court = court;
    this.engine = M.Engine.create();
    this.engine.positionIterations = 8;
    this.engine.velocityIterations = 6;
    this.engine.constraintIterations = 3;
    this.baseGravity = C.GRAVITY * (court.gravity || 1);
    this.engine.gravity.y = this.baseGravity;
    this.frame = 0;
    this.listeners = [];

    const st = { isStatic: true, collisionFilter: { category: HC.CAT.STATIC, mask: 0xffff } };
    this.floor = M.Bodies.rectangle(C.WIDTH / 2, C.FLOOR_Y + 60, C.WIDTH * 1.8, 120,
      Object.assign({ label: 'ground', friction: court.floorFriction != null ? court.floorFriction : 0.9 }, st));
    this.floorBaseFriction = this.floor.friction;
    this.wallL = M.Bodies.rectangle(-40, C.HEIGHT / 2 - 600, 80, C.HEIGHT + 2400, Object.assign({ label: 'wall', friction: 0.1 }, st));
    this.wallR = M.Bodies.rectangle(C.WIDTH + 40, C.HEIGHT / 2 - 600, 80, C.HEIGHT + 2400, Object.assign({ label: 'wall', friction: 0.1 }, st));
    this.ceiling = M.Bodies.rectangle(C.WIDTH / 2, -900, C.WIDTH * 2, 100, Object.assign({ label: 'wall' }, st));
    M.Composite.add(this.engine.world, [this.floor, this.wallL, this.wallR, this.ceiling]);

    this.hoops = [this.makeHoop(0), this.makeHoop(1)];

    const handler = (ev) => this.onCollision(ev);
    M.Events.on(this.engine, 'collisionStart', handler);
    M.Events.on(this.engine, 'collisionActive', (ev) => this.onActive(ev));
  }

  get gravity() { return this.engine.gravity.y; }

  makeHoop(side) {
    const C = HC.CONFIG, M = Matter;
    const cx = side === 0 ? C.HOOP_INSET : C.WIDTH - C.HOOP_INSET;
    const dir = side === 0 ? 1 : -1; // from backboard toward the front of the rim
    const hoop = { side, dir, baseX: cx, baseY: C.RIM_Y, x: cx, y: C.RIM_Y, ox: 0, oy: 0,
      scoreTeam: side === 1 ? 0 : 1, wob: 0, wobV: 0, glow: 0, visible: true };
    const f = { isStatic: true, collisionFilter: { category: HC.CAT.HOOP, mask: HC.CAT.BALL | HC.CAT.DEBRIS } };
    hoop.board = M.Bodies.rectangle(0, 0, 10, C.BACKBOARD_HEIGHT, Object.assign({ label: 'backboard', restitution: 0.5 }, f));
    hoop.rimBack = M.Bodies.circle(0, 0, 4, Object.assign({ label: 'rim', restitution: 0.55 }, f));
    hoop.rimFront = M.Bodies.circle(0, 0, 4, Object.assign({ label: 'rim', restitution: 0.55 }, f));
    hoop.board.hcHoop = hoop.rimBack.hcHoop = hoop.rimFront.hcHoop = hoop;
    M.Composite.add(this.engine.world, [hoop.board, hoop.rimBack, hoop.rimFront]);
    // net: strands of verlet points
    hoop.net = [];
    const strands = 6, pts = 5;
    for (let s = 0; s < strands; s++) {
      const strand = [];
      for (let p = 0; p < pts; p++) strand.push({ x: 0, y: 0, px: 0, py: 0 });
      hoop.net.push(strand);
    }
    this.placeHoop(hoop, 0, 0, false);
    for (const strand of hoop.net) strand.forEach((p, i) => { const a = this.netAnchor(hoop, hoop.net.indexOf(strand), i); p.x = p.px = a.x; p.y = p.py = a.y; });
    return hoop;
  }

  netAnchor(hoop, s, i) {
    const C = HC.CONFIG, n = hoop.net.length;
    const t = s / (n - 1) - 0.5;
    const topW = C.RIM_WIDTH, botW = C.RIM_WIDTH * 0.55;
    const k = i / (hoop.net[0].length - 1);
    return { x: hoop.x + t * HC.U.lerp(topW, botW, k), y: hoop.y + k * 52 };
  }

  placeHoop(hoop, ox, oy, updateVel) {
    const C = HC.CONFIG, M = Matter;
    hoop.ox = ox; hoop.oy = oy;
    hoop.x = hoop.baseX + ox; hoop.y = hoop.baseY + oy;
    const half = C.RIM_WIDTH / 2;
    const bx = hoop.x - hoop.dir * (half + 9);
    M.Body.setPosition(hoop.board, { x: bx, y: hoop.y - C.BACKBOARD_HEIGHT / 2 + 26 }, !!updateVel);
    M.Body.setPosition(hoop.rimBack, { x: hoop.x - hoop.dir * half, y: hoop.y }, !!updateVel);
    M.Body.setPosition(hoop.rimFront, { x: hoop.x + hoop.dir * half, y: hoop.y + hoop.wob * 0.15 }, !!updateVel);
  }

  resetHoops() { for (const h of this.hoops) { this.placeHoop(h, 0, 0, false); h.wob = 0; h.wobV = 0; } }

  addBody(b) { Matter.Composite.add(this.engine.world, b); }
  removeBody(b) { Matter.Composite.remove(this.engine.world, b); }

  onCollision(ev) {
    for (const pair of ev.pairs) {
      this.tagGround(pair);
      for (const fn of this.listeners) fn(pair.bodyA, pair.bodyB, pair);
    }
  }
  onActive(ev) { for (const pair of ev.pairs) this.tagGround(pair); }
  tagGround(pair) {
    const a = pair.bodyA, b = pair.bodyB;
    const leg = a.hcPart && (a.hcPart === 'legL' || a.hcPart === 'legR') ? a : (b.hcPart && (b.hcPart === 'legL' || b.hcPart === 'legR') ? b : null);
    if (!leg) return;
    const other = leg === a ? b : a;
    if (other.label === 'ground' || other.label === 'platform') leg.hcPlayer.lastGroundFrame = this.frame;
  }

  step(dt) {
    this.frame++;
    Matter.Engine.update(this.engine, 1000 / 60);
    for (const h of this.hoops) {
      // rim wobble spring
      h.wobV += -h.wob * 0.25; h.wobV *= 0.82; h.wob += h.wobV;
      h.glow = Math.max(0, h.glow - dt * 1.5);
      Matter.Body.setPosition(h.rimFront, { x: h.x + h.dir * HC.CONFIG.RIM_WIDTH / 2, y: h.y + h.wob * 0.15 });
    }
  }

  updateNets(balls) {
    const g = 0.35 * Math.max(0.3, this.gravity);
    for (const h of this.hoops) {
      const n = h.net;
      for (let s = 0; s < n.length; s++) {
        for (let i = 0; i < n[s].length; i++) {
          const p = n[s][i];
          if (i === 0) { const a = this.netAnchor(h, s, 0); p.x = p.px = a.x; p.y = p.py = a.y + (s === n.length - 1 || s === 0 ? 0 : h.wob * 0.1); continue; }
          const vx = (p.x - p.px) * 0.94, vy = (p.y - p.py) * 0.94;
          p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + g;
          // pull toward rest shape
          const a = this.netAnchor(h, s, i);
          p.x += (a.x - p.x) * 0.06; p.y += (a.y - p.y) * 0.06;
          for (const b of balls) {
            const bp = b.body.position, dx = p.x - bp.x, dy = p.y - bp.y, d = Math.hypot(dx, dy), r = b.r + 2;
            if (d < r && d > 0.01) { p.x = bp.x + dx / d * r; p.y = bp.y + dy / d * r; }
          }
        }
        // segment length constraints
        for (let k = 0; k < 2; k++) for (let i = 1; i < n[s].length; i++) {
          const a = n[s][i - 1], b = n[s][i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, rest = 13.5;
          const diff = (d - rest) / d;
          if (i === 1) { b.x -= dx * diff; b.y -= dy * diff; }
          else { a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; }
        }
      }
    }
  }

  snapshotHoops() {
    return this.hoops.map(h => ({ side: h.side, x: h.x, y: h.y, dir: h.dir, wob: h.wob, glow: h.glow, visible: h.visible,
      net: h.net.map(s => s.map(p => [p.x, p.y])) }));
  }
};

// ---------- Ball ----------
HC.Ball = class Ball {
  constructor(world, x, y, mods) {
    const C = HC.CONFIG;
    this.world = world;
    this.baseR = C.BALL_RADIUS;
    this.scale = 1;
    this.r = this.baseR;
    this.body = Matter.Bodies.circle(x, y, this.r, {
      label: 'ball', restitution: C.BALL_RESTITUTION, friction: 0.08, frictionAir: C.BALL_FRICTION_AIR,
      density: C.BALL_DENSITY, collisionFilter: { category: HC.CAT.BALL, mask: 0xffff },
    });
    this.body.hcBall = this;
    world.addBody(this.body);
    this.heldBy = null;      // player holding it
    this.holdTime = 0;
    this.lastTouch = null;   // {player, part}
    this.shot = null;        // info about the current shot in flight
    this.noGrab = new Map(); // player -> seconds of regrab cooldown
    this.bomb = null;        // {t, max} if it's a bomb
    this.style = 'normal';
    this.prevY = y;
    this.trail = [];
    if (mods) this.applyMods(mods);
  }

  applyMods(m) {
    this.setScale(m.ballScale || 1);
    const b = this.body;
    b.restitution = m.ballRestitution != null ? m.ballRestitution : HC.CONFIG.BALL_RESTITUTION;
    Matter.Body.setDensity(b, HC.CONFIG.BALL_DENSITY * (m.ballDensity || 1));
    b.frictionAir = m.ballAir || HC.CONFIG.BALL_FRICTION_AIR;
    this.style = m.ballStyle || 'normal';
  }

  setScale(k) {
    if (Math.abs(k - this.scale) < 0.001) return;
    Matter.Body.scale(this.body, k / this.scale, k / this.scale);
    this.scale = k; this.r = this.baseR * k;
  }

  get x() { return this.body.position.x; }
  get y() { return this.body.position.y; }

  setHeldPhysics(held) {
    this.body.collisionFilter.mask = held ? 0 : 0xffff;
  }

  remove() { this.world.removeBody(this.body); }

  snapshot() {
    const st = this.style === 'normal' ? (this.skin || 'classic') : this.style;
    return [this.body.position.x, this.body.position.y, this.body.angle, this.r, st, this.bomb ? this.bomb.t : -1, this.body.velocity.x, this.body.velocity.y];
  }
};

// ---------- Drawing helpers for world objects ----------
HC.drawHoop = function (ctx, h, opts) {
  const C = HC.CONFIG;
  if (!h.visible) return;
  const half = C.RIM_WIDTH / 2, glow = opts && opts.glow;
  const bx = h.x - h.dir * (half + 9);
  ctx.save();
  // pole + arm
  if (!(opts && opts.noPole)) {
    const poleX = h.side === 0 ? 24 : C.WIDTH - 24;
    const g = ctx.createLinearGradient(poleX - 8, 0, poleX + 8, 0); g.addColorStop(0, '#3b4252'); g.addColorStop(0.5, '#8a93a6'); g.addColorStop(1, '#2e3440');
    ctx.strokeStyle = g; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(poleX, C.FLOOR_Y); ctx.lineTo(poleX, h.y - 44); ctx.stroke();
    ctx.strokeStyle = '#4c566a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(poleX, h.y - 44); ctx.lineTo(bx - h.dir * 4, h.y - 44); ctx.stroke();
    ctx.fillStyle = '#1f6feb'; HC.rr(ctx, poleX - 11, C.FLOOR_Y - 120, 22, 110, 8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(poleX - 7, C.FLOOR_Y - 115, 4, 100);
  }
  // backboard (glass) - seen edge-on, with a little perspective face
  const top = h.y - C.BACKBOARD_HEIGHT + 26, bw = 12;
  const face = h.dir * 16;
  ctx.fillStyle = glow ? 'rgba(80,220,255,0.12)' : 'rgba(220,240,255,0.55)';
  ctx.beginPath(); ctx.moveTo(bx - bw / 2, top); ctx.lineTo(bx - bw / 2 + face, top + 8); ctx.lineTo(bx - bw / 2 + face, top + C.BACKBOARD_HEIGHT - 8); ctx.lineTo(bx - bw / 2, top + C.BACKBOARD_HEIGHT); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = glow ? '#4ef' : '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = glow ? '#4ef' : '#e63946'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(bx - bw / 2 + face * 0.5, h.y - 40); ctx.lineTo(bx - bw / 2 + face * 0.5, h.y - 6); ctx.stroke();
  const bg = ctx.createLinearGradient(bx - bw / 2, 0, bx + bw / 2, 0); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#c9d6e8');
  ctx.fillStyle = glow ? 'rgba(80,220,255,0.25)' : bg; ctx.strokeStyle = glow ? '#4ef' : '#e63946'; ctx.lineWidth = 3;
  HC.rr(ctx, bx - bw / 2, top, bw, C.BACKBOARD_HEIGHT, 3); ctx.fill(); ctx.stroke();
  // net
  ctx.strokeStyle = glow ? 'rgba(120,255,255,0.8)' : 'rgba(255,255,255,0.92)'; ctx.lineWidth = 1.8;
  const net = h.net;
  for (let s = 0; s < net.length; s++) {
    ctx.beginPath(); net[s].forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  }
  for (let i = 1; i < net[0].length; i++) {
    ctx.beginPath();
    for (let s = 0; s < net.length - 1; s++) {
      const a = net[s][i - 1], b = net[s + 1][i]; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      const c = net[s + 1][i - 1], d = net[s][i]; ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]);
    }
    ctx.stroke();
  }
  // rim
  if (glow || h.glow > 0) { ctx.shadowColor = glow ? '#4ef' : '#ffd23f'; ctx.shadowBlur = 22; }
  const fy = h.y + h.wob * 0.15;
  ctx.strokeStyle = glow ? '#6ff' : '#c2410c'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(h.x - h.dir * half, h.y); ctx.lineTo(h.x + h.dir * half, fy); ctx.stroke();
  ctx.strokeStyle = glow ? '#bff' : '#ff7a1a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(h.x - h.dir * half, h.y - 1); ctx.lineTo(h.x + h.dir * half, fy - 1); ctx.stroke();
  ctx.restore();
};

// Ball skins: classic + cosmetics unlocked in Adventure / the Locker
HC.BALL_SKINS = {
  classic:    { base: '#f07a1a', line: '#3a1a05', name: 'Classic' },
  retro:      { base: '#e63946', line: '#1d3557', name: 'Retro ABA', stripes: ['#e63946', '#fff', '#1d3557'] },
  fire:       { base: '#ff5a1f', line: '#5c1300', name: 'Fireball', trail: ['#ffd23f', '#ff7a1a', '#e63946'] },
  ice:        { base: '#bfe9ff', line: '#2a6f97', name: 'Ice Ball', trail: ['#e0f7ff', '#8fd3ff'] },
  galaxy:     { base: '#2b1055', line: '#c77dff', name: 'Galaxy', trail: ['#c77dff', '#7b2cbf', '#fff'] },
  gold:       { base: '#f5c518', line: '#7a5c00', name: 'Golden', trail: ['#fff3b0', '#ffd23f'] },
  rainbow:    { base: '#ff3d7f', line: '#222', name: 'Rainbow', trail: ['#ff3d7f', '#ffd23f', '#2ee6a6', '#38d6ff', '#c77dff'] },
  watermelon: { base: '#2f9e44', line: '#145a20', name: 'Watermelon' },
  lava:       { base: '#3a1a12', line: '#ff6a00', name: 'Lava Rock', trail: ['#ff6a00', '#ffd23f'] },
  eyeball:    { base: '#fafafa', line: '#9a2a2a', name: 'Eyeball' },
  disco:      { base: '#c0c6cf', line: '#555', name: 'Disco Ball', trail: ['#ff4fd8', '#4fd8ff', '#fff04f'] },
  pizza:      { base: '#f4c56a', line: '#a0522d', name: 'Pizza' },
};

HC.drawBall = function (ctx, s, opts) {
  const [x, y, a, r, style, bombT] = s;
  const vx = s[6] || 0, vy = s[7] || 0;
  const sk = HC.BALL_SKINS[style] || (style === 'beach' || style === 'bowling' ? null : HC.BALL_SKINS.classic);
  ctx.save();
  // motion trail for fancy skins
  if (sk && sk.trail && Math.hypot(vx, vy) > 4) {
    for (let i = 1; i <= 5; i++) { ctx.globalAlpha = 0.28 - i * 0.045; ctx.fillStyle = sk.trail[i % sk.trail.length]; ctx.beginPath(); ctx.arc(x - vx * i * 1.3, y - vy * i * 1.3, r * (1 - i * 0.12), 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  ctx.translate(x, y); ctx.rotate(a);
  const glow = opts && opts.glow;
  if (glow) { ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 25; }
  let fill = sk ? sk.base : '#f07a1a', line = sk ? sk.line : '#3a1a05';
  if (style === 'beach') fill = '#fff';
  if (style === 'bowling') { fill = '#2a2a5a'; line = '#000'; }
  if (bombT >= 0) { fill = '#222'; line = '#000'; }
  if (style === 'rainbow' && bombT < 0) fill = 'hsl(' + ((performance.now() / 6) % 360) + ',90%,60%)';
  ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(1.5, r * 0.1); ctx.strokeStyle = line;
  const clip = bombT < 0;
  if (clip) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); }
  if (style === 'beach' && bombT < 0) {
    const cols = ['#e33', '#fc0', '#29f'];
    for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 1, i * 2.09, i * 2.09 + 1.05); ctx.fill(); }
  } else if (style === 'bowling' && bombT < 0) {
    ctx.fillStyle = '#000';
    [[-0.3, -0.35], [0.05, -0.45], [-0.05, -0.1]].forEach(([u, v]) => { ctx.beginPath(); ctx.arc(u * r, v * r, r * 0.12, 0, 7); ctx.fill(); });
  } else if (bombT >= 0) {
    ctx.save(); ctx.rotate(-a);
    ctx.fillStyle = '#666'; ctx.fillRect(-r * 0.25, -r - 6, r * 0.5, 7);
    ctx.strokeStyle = '#a86'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -r - 6); ctx.quadraticCurveTo(6, -r - 14, 3, -r - 18); ctx.stroke();
    const flick = Math.random() * 4;
    ctx.fillStyle = bombT < 2 ? '#f22' : '#fd3'; ctx.beginPath(); ctx.arc(3, -r - 19, 3 + flick, 0, 7); ctx.fill();
    ctx.fillStyle = bombT < 2 ? '#f44' : '#fff'; ctx.font = Math.round(r * 0.95) + 'px ' + (HC.FONT_DISPLAY || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(bombT), 0, 2);
    ctx.restore();
  } else if (style === 'eyeball') {
    ctx.fillStyle = '#3a86ff'; ctx.beginPath(); ctx.arc(r * 0.25, 0, r * 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(r * 0.32, 0, r * 0.24, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(200,40,40,0.6)'; ctx.lineWidth = 1; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-r * 0.9, (i - 2) * r * 0.25); ctx.quadraticCurveTo(-r * 0.5, (i - 2) * r * 0.1, -r * 0.2, (i - 2) * r * 0.15); ctx.stroke(); }
  } else if (style === 'watermelon') {
    ctx.strokeStyle = '#145a20'; ctx.lineWidth = r * 0.12; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * r * 0.35, -r); ctx.quadraticCurveTo(i * r * 0.5, 0, i * r * 0.35, r); ctx.stroke(); }
  } else if (style === 'galaxy') {
    ctx.fillStyle = '#fff'; for (let i = 0; i < 7; i++) { const aa = i * 2.4, rr2 = r * (0.2 + (i % 3) * 0.25); ctx.fillRect(Math.cos(aa) * rr2, Math.sin(aa) * rr2, 2, 2); }
    ctx.strokeStyle = 'rgba(199,125,255,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r * 0.3, 0.6, 0, 7); ctx.stroke();
  } else if (style === 'disco') {
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { if (i * i + j * j > 10) continue; ctx.fillStyle = (i + j + Math.floor(performance.now() / 150)) % 3 ? '#e8ecf2' : '#8ab4ff'; ctx.fillRect(i * r * 0.28 - r * 0.12, j * r * 0.28 - r * 0.12, r * 0.24, r * 0.24); }
  } else if (style === 'pizza') {
    ctx.fillStyle = '#d62828'; for (const [u, v] of [[-0.4, -0.3], [0.35, -0.2], [0, 0.4], [0.3, 0.45], [-0.45, 0.3]]) { ctx.beginPath(); ctx.arc(u * r, v * r, r * 0.16, 0, 7); ctx.fill(); }
  } else {
    if (sk && sk.stripes) { ctx.fillStyle = sk.stripes[1]; ctx.fillRect(-r, -r * 0.33, r * 2, r * 0.66); ctx.fillStyle = sk.stripes[2]; ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 0.2, Math.PI * 0.8); ctx.fill(); }
    if (style === 'lava') { ctx.strokeStyle = '#ff6a00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.3); ctx.lineTo(-r * 0.1, 0); ctx.lineTo(r * 0.5, -r * 0.5); ctx.moveTo(-r * 0.1, 0); ctx.lineTo(r * 0.1, r * 0.7); ctx.stroke(); }
    else {
      ctx.beginPath();
      ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r);
      ctx.moveTo(-r * 0.7, -r * 0.7); ctx.quadraticCurveTo(0, 0, -r * 0.7, r * 0.7);
      ctx.moveTo(r * 0.7, -r * 0.7); ctx.quadraticCurveTo(0, 0, r * 0.7, r * 0.7);
      ctx.stroke();
    }
  }
  if (clip) ctx.restore();
  ctx.rotate(-a);
  // shading + highlight
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, 'rgba(255,255,255,0.45)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = line; ctx.lineWidth = Math.max(1.5, r * 0.1); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  ctx.restore();
};
