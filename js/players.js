// Ragdoll players, original characters, CPU controller and character drawing.
window.HC = window.HC || {};

// ---------- Original characters ----------
// scale: overall size | torso/leg/arm/head: part size multipliers | jump: jump multiplier
// accuracy: >1 = tighter shots | stability: >1 = harder to knock over | bounce: body restitution
HC.CHARACTERS = [
  { id: 'noodle', name: 'Noodle', perk: 'Very tall & floppy - huge reach', skin: '#f6c9a0', hair: '#f4b400', style: 'noodle',
    scale: 1, torso: 1.3, leg: 1.4, arm: 1.35, head: 0.92, w: 0.8, jump: 1.0, accuracy: 1.0, stability: 0.6, bounce: 0, density: 1 },
  { id: 'pip', name: 'Pip', perk: 'Tiny but jumps sky-high', skin: '#ffd9b3', hair: '#7a3b12', style: 'pip',
    scale: 0.74, torso: 1, leg: 1, arm: 1, head: 1.18, w: 1, jump: 1.3, accuracy: 1.1, stability: 0.9, bounce: 0, density: 1 },
  { id: 'bolt', name: 'Bolt', perk: 'Robot - very hard to knock over', skin: '#9fb0c4', hair: '#ffdd00', style: 'bolt',
    scale: 1.05, torso: 1.05, leg: 0.95, arm: 1, head: 1, w: 1.25, jump: 0.96, accuracy: 1.0, stability: 2.3, bounce: 0, density: 1.6 },
  { id: 'nana', name: 'Nana Hoops', perk: 'Grandma - deadly accurate shots', skin: '#f1c7a0', hair: '#eeeeee', style: 'nana',
    scale: 0.92, torso: 1, leg: 0.9, arm: 1, head: 1.05, w: 1.05, jump: 0.94, accuracy: 2.4, stability: 1.0, bounce: 0, density: 1 },
  { id: 'blob', name: 'Blob', perk: 'Squishy & bouncy - springs off everything', skin: '#77d968', hair: '#3c9e33', style: 'blob',
    scale: 1, torso: 0.9, leg: 0.85, arm: 0.95, head: 1.3, w: 1.3, jump: 1.05, accuracy: 0.95, stability: 1.3, bounce: 0.75, density: 0.9 },
  { id: 'rex', name: 'Rocket Rex', perk: 'Jetpack - tap in the air for a boost', skin: '#c98b5b', hair: '#d33', style: 'rex',
    scale: 0.95, torso: 1, leg: 1, arm: 1, head: 1.05, w: 1, jump: 1.0, accuracy: 1.0, stability: 1.0, bounce: 0, density: 1, jet: true },
  // ----- unlocked by beating bosses -----
  { id: 'tony', name: 'Big Tony', perk: 'Huge & heavy', skin: '#e0a37a', hair: '#222', style: 'tony', unlock: 'bigTony',
    scale: 1.32, torso: 1.1, leg: 1, arm: 1.1, head: 1.05, w: 1.45, jump: 0.9, accuracy: 1.0, stability: 2.0, bounce: 0, density: 1.4 },
  { id: 'hoopatron', name: 'Hoopatron 9000', perk: 'Shooting machine - pinpoint aim', skin: '#c0c6cf', hair: '#f33', style: 'hoopatron', unlock: 'hoopatron',
    scale: 1.1, torso: 1, leg: 1, arm: 1.1, head: 1, w: 1.2, jump: 0.98, accuracy: 2.6, stability: 1.7, bounce: 0, density: 1.4 },
  { id: 'swamp', name: 'The Swamp King', perk: 'Slimy blob - mega bounce', skin: '#5aa04a', hair: '#e9c400', style: 'swamp', unlock: 'swampKing',
    scale: 1.1, torso: 0.95, leg: 0.8, arm: 1, head: 1.35, w: 1.4, jump: 1.1, accuracy: 1.0, stability: 1.5, bounce: 0.8, density: 1 },
  { id: 'coach', name: 'Coach Thunder', perk: 'Good at everything', skin: '#e8b68f', hair: '#bbb', style: 'coach', unlock: 'coach',
    scale: 1.08, torso: 1.05, leg: 1.05, arm: 1.05, head: 1, w: 1.1, jump: 1.12, accuracy: 1.6, stability: 1.5, bounce: 0, density: 1.1 },
];
HC.charById = (id) => HC.CHARACTERS.find(c => c.id === id) || HC.CHARACTERS[0];

HC.SAY = {
  score: ['BUCKETS!', 'SPLASH!', 'COOKED!', 'EZ!', 'NOTHING BUT NET!', 'SWISH CITY!', 'GET THAT OUTTA HERE!'],
  scoredOn: ['my ankles...', 'nooo!', 'ref??', 'lag!', 'I slipped!', 'ugh'],
  faceplant: ['ow', 'my face!', 'oof', 'I meant that', '*crunch*'],
  win: ['CHAMPS!', 'WE DID IT!', 'TOO EASY!'],
  lose: ['*sob*', 'waaah', 'gg...'],
  steal: ['MINE!', 'yoink!', 'cookies!'],
  lava: ['HOT HOT HOT!', 'AAAH!'],
};

// ---------- Ragdoll player ----------
HC.Player = class Player {
  constructor(match, team, slot, charId, x, opts) {
    this.match = match; this.team = team; this.slot = slot;
    this.def = HC.charById(charId);
    this.opts = opts || {};
    this.colors = this.opts.colors || { main: '#e33', alt: '#fff' };
    this.facing = team === 0 ? 1 : -1;
    this.spawnX = x;
    this.lastGroundFrame = -100;
    this.prevDown = false; this.holding = false; this.holdTime = 0;
    this.swingT = 0; this.knock = 0; this.airTime = 0; this.jetUsed = false; this.flame = 0;
    this.mood = 'neutral'; this.moodT = 0; this.bubble = null; this.bubbleT = 0;
    this.ball = null; this.stunT = 0; this.slow = 0;
    this.stats = { points: 0, shots: 0, makes: 0, steals: 0, tricks: {} };
    this.build(x);
  }

  build(x) {
    const C = HC.CONFIG, M = Matter, d = this.def, m = this.match.mods || {};
    const s = d.scale * (this.opts.scale || 1);
    const dims = this.dims = {
      tw: 24 * s * d.w, th: 46 * s * d.torso, hr: 15 * s * d.head * (m.headScale || 1),
      lw: 11 * s * Math.min(1.3, d.w), lh: 44 * s * d.leg * (m.legScale || 1),
      aw: 8.5 * s, ah: 38 * s * d.arm * (m.armScale || 1), s,
    };
    const ty = C.FLOOR_Y - dims.lh - dims.th / 2 - 4;
    const group = M.Body.nextGroup(true);
    const dens = 0.002 * (d.density || 1) * (this.opts.density || 1);
    const rest = d.bounce || (m.playerBounce || 0);
    const cf = { group, category: HC.CAT.PLAYER, mask: HC.CAT.STATIC | HC.CAT.PLAYER | HC.CAT.BALL | HC.CAT.DEBRIS };
    const base = { collisionFilter: cf, restitution: rest, frictionAir: 0.012 };
    const legFr = m.slippery ? 0.02 : 0.9;
    const P = this.parts = {
      torso: M.Bodies.rectangle(x, ty, dims.tw, dims.th, Object.assign({ density: dens, chamfer: { radius: dims.tw * 0.4 }, friction: 0.4 }, base)),
      head: M.Bodies.circle(x, ty - dims.th / 2 - dims.hr + 3, dims.hr, Object.assign({ density: dens * 0.45, friction: 0.4 }, base)),
      legL: M.Bodies.rectangle(x + 3, ty + dims.th / 2 + dims.lh / 2 - 4, dims.lw, dims.lh, Object.assign({ density: dens, chamfer: { radius: dims.lw * 0.45 }, friction: legFr }, base)),
      legR: M.Bodies.rectangle(x - 3, ty + dims.th / 2 + dims.lh / 2 - 4, dims.lw, dims.lh, Object.assign({ density: dens, chamfer: { radius: dims.lw * 0.45 }, friction: legFr }, base)),
      armF: M.Bodies.rectangle(x, ty - dims.th / 2 + 6 + dims.ah / 2, dims.aw, dims.ah, Object.assign({ density: dens * 0.5, chamfer: { radius: dims.aw * 0.45 }, friction: 0.6 }, base)),
      armB: M.Bodies.rectangle(x, ty - dims.th / 2 + 6 + dims.ah / 2, dims.aw, dims.ah, Object.assign({ density: dens * 0.5, chamfer: { radius: dims.aw * 0.45 }, friction: 0.6 }, base)),
    };
    for (const k in P) { P[k].hcPlayer = this; P[k].hcPart = k; P[k].label = 'player'; }
    const pin = (a, pa, b, pb, stiff) => M.Constraint.create({ bodyA: a, pointA: pa, bodyB: b, pointB: pb, length: 0, stiffness: stiff || 1, damping: 0.1 });
    this.constraints = [
      pin(P.torso, { x: 0, y: -dims.th / 2 + 1 }, P.head, { x: 0, y: dims.hr - 3 }, 0.9),
      pin(P.torso, { x: 2, y: dims.th / 2 - 4 }, P.legL, { x: 0, y: -dims.lh / 2 + 4 }),
      pin(P.torso, { x: -2, y: dims.th / 2 - 4 }, P.legR, { x: 0, y: -dims.lh / 2 + 4 }),
      pin(P.torso, { x: 0, y: -dims.th / 2 + 7 }, P.armF, { x: 0, y: -dims.ah / 2 + 3 }),
      pin(P.torso, { x: 0, y: -dims.th / 2 + 7 }, P.armB, { x: 0, y: -dims.ah / 2 + 3 }),
    ];
    this.bodies = Object.values(P);
    this.match.world.addBody(this.bodies.concat(this.constraints));
  }

  destroy() {
    for (const b of this.bodies) this.match.world.removeBody(b);
    for (const c of this.constraints) this.match.world.removeBody(c);
  }

  get x() { return this.parts.torso.position.x; }
  get y() { return this.parts.torso.position.y; }
  get vx() { return this.parts.torso.velocity.x; }
  get vy() { return this.parts.torso.velocity.y; }
  get angle() { return HC.U.wrapAngle(this.parts.torso.angle); }
  get grounded() { return this.match.world.frame - this.lastGroundFrame <= 3; }

  handPos(which) {
    const a = this.parts[which || 'armF'], L = this.dims.ah / 2 - 2;
    return { x: a.position.x - Math.sin(a.angle) * L, y: a.position.y + Math.cos(a.angle) * L };
  }
  headPos() { return this.parts.head.position; }
  feetY() { return Math.max(this.parts.legL.position.y, this.parts.legR.position.y) + this.dims.lh / 2; }

  teleport(x, y) {
    const dx = x - this.x, dy = y - this.y;
    for (const b of this.bodies) {
      Matter.Body.setPosition(b, { x: b.position.x + dx, y: b.position.y + dy });
      Matter.Body.setVelocity(b, { x: 0, y: 0 }); Matter.Body.setAngularVelocity(b, 0);
    }
  }

  freeze() { for (const b of this.bodies) { Matter.Body.setVelocity(b, { x: 0, y: Math.min(0, b.velocity.y) }); } }

  setVel(vx, vy, keep) {
    for (const b of this.bodies) Matter.Body.setVelocity(b, { x: b.velocity.x * (keep || 0) + vx, y: b.velocity.y * (keep || 0) + vy });
  }

  push(fx, fy) { for (const b of this.bodies) Matter.Body.setVelocity(b, { x: b.velocity.x + fx, y: b.velocity.y + fy }); }

  knockDown(vx, vy, time) {
    const st = this.def.stability * (this.opts.stability || 1);
    const k = st > 1.8 ? 0.5 : 1;
    this.push(vx * k, vy * k);
    Matter.Body.setAngularVelocity(this.parts.torso, (Math.random() - 0.5) * 0.4 * k);
    this.knock = Math.max(this.knock, (time || HC.CONFIG.GETUP_TIME) * k);
    this.setMood('ouch', 1.2);
    if (this.ball) this.match.dropBall(this.ball, true);
  }

  say(text, t) { this.bubble = text; this.bubbleT = t || 1.6; }
  setMood(m, t) { this.mood = m; this.moodT = t || 1.5; }

  update(dt, down) {
    const C = HC.CONFIG, M = Matter, U = HC.U, P = this.parts, m = this.match.mods || {};
    const T = P.torso;
    const grounded = this.grounded;
    const st = this.def.stability * (this.opts.stability || 1);
    if (grounded) {
      if (this.airTime > 0.2) { this.jetUsed = false; this.onLand(); }
      this.airTime = 0;
    } else this.airTime += dt;
    if (this.moodT > 0) { this.moodT -= dt; if (this.moodT <= 0) this.mood = 'neutral'; }
    if (this.bubbleT > 0) { this.bubbleT -= dt; if (this.bubbleT <= 0) this.bubble = null; }
    this.flame = Math.max(0, this.flame - dt);
    this.slow = Math.max(0, this.slow - dt);

    const ang = U.wrapAngle(T.angle);
    // fall over check
    if (this.knock > 0) this.knock -= dt;
    else if (grounded && Math.abs(ang) > C.KNOCKDOWN_ANGLE * Math.min(1.6, 0.8 + st * 0.2)) {
      this.knock = C.GETUP_TIME / Math.min(2, st);
      this.setMood('ouch', 1.2);
      if (Math.random() < 0.35) this.say(U.pick(HC.SAY.faceplant), 1.2);
      HC.Audio.thud();
      if (this.ball && st < 2) this.match.dropBall(this.ball, true);
    }

    // facing: only flips on the ground and not mid wind-up
    if (this.desiredFacing && this.desiredFacing !== this.facing && grounded && !this.holding) this.facing = this.desiredFacing;

    // ---- one-button input ----
    if (this.stunT > 0) { this.stunT -= dt; down = false; }
    if (down && !this.prevDown) { this.holding = true; this.holdTime = 0; }
    if (this.holding) this.holdTime += dt * (this.opts.windupMul || 1);
    if (!down && this.prevDown && this.holding) { this.holding = false; this.release(grounded); }
    if (!down) this.holding = false;
    this.prevDown = down;
    if (this.swingT > 0) this.swingT -= dt;

    // ---- torso self-righting ----
    let target = this.holding && grounded ? this.facing * C.CROUCH_LEAN : this.facing * 0.04;
    let k = (grounded ? C.UPRIGHT_GROUND : C.UPRIGHT_AIR) * Math.min(2.5, st);
    let damp = grounded ? C.UPRIGHT_DAMP : 0.02;
    if (this.knock > 0) { k = 0.002; damp = 0.03; }
    if (m.uprightMul) k *= m.uprightMul;
    const diff = U.wrapAngle(target - T.angle);
    M.Body.setAngularVelocity(T, T.angularVelocity + diff * k - T.angularVelocity * damp);
    // getting up: little push upward when lying and timer done
    if (this.knock <= 0 && grounded && Math.abs(ang) > 0.9) {
      M.Body.setVelocity(T, { x: T.velocity.x, y: T.velocity.y - 0.5 });
    }

    // ---- head stays roughly aligned ----
    const hd = U.wrapAngle(T.angle - P.head.angle);
    M.Body.setAngularVelocity(P.head, P.head.angularVelocity * 0.7 + hd * 0.15);

    // ---- legs ----
    const crouch = this.holding && grounded;
    const spread = crouch ? 0.62 : grounded ? 0.16 : 0.35;
    const legK = C.LEG_MOTOR * (this.knock > 0 ? 0.2 : 1);
    const legOff = grounded ? 0 : -this.facing * 0.25; // tuck forward in the air
    for (const [leg, sgn] of [[P.legL, -1], [P.legR, 1]]) {
      const tgt = T.angle + sgn * spread * this.facing + legOff;
      const dd = U.wrapAngle(tgt - leg.angle);
      M.Body.setAngularVelocity(leg, leg.angularVelocity * 0.55 + dd * legK);
    }

    // ---- arms ----
    let rel;
    if (this.swingT > 0) rel = 2.75;
    else if (this.holding) rel = -0.95;
    else if (this.ball) rel = 1.35;
    else rel = 0.3 + Math.sin(this.match.time * 3 + this.slot) * 0.1;
    const armK = C.ARM_MOTOR * (this.def.stability < 0.8 ? 0.7 : 1);
    const fT = T.angle - this.facing * rel, bT = T.angle - this.facing * (rel * 0.8 - 0.25);
    for (const [arm, tgt] of [[P.armF, fT], [P.armB, bT]]) {
      const dd = U.wrapAngle(tgt - arm.angle);
      M.Body.setAngularVelocity(arm, arm.angularVelocity * 0.5 + dd * armK);
    }

    // ---- environment drag (sand / slime) ----
    const drag = (grounded ? (m.groundDrag || 0) : 0) + (this.slow > 0 ? 0.08 : 0);
    if (drag > 0) for (const b of this.bodies) M.Body.setVelocity(b, { x: b.velocity.x * (1 - drag), y: b.velocity.y });
  }

  onLand() {
    if (this.def.bounce > 0.5 && Math.abs(this.vy) > 3) HC.Audio.boing(1.4);
  }

  release(grounded) {
    const C = HC.CONFIG, U = HC.U, m = this.match.mods || {};
    this.swingT = C.ARM_SWING_TIME;
    if (grounded) {
      const c = U.clamp(this.holdTime / C.WINDUP_TIME, C.MIN_CHARGE, 1);
      let jm = this.def.jump * (m.jumpMul || 1) * (this.opts.jumpMul || 1);
      if (this.slow > 0) jm *= 0.55;
      const a = this.parts.torso.angle;
      let J = C.JUMP_FORCE * jm * (0.45 + 0.55 * c);
      if (this.knock > 0) J *= 0.45;
      const fwd = (m.jumpForwardMul || 1) * (this.slow > 0 ? 0.4 : 1);
      const vx = this.facing * C.JUMP_FORWARD * (0.3 + 0.7 * c) * fwd + Math.sin(a) * J * 0.3;
      const vy = -J * Math.max(0.35, Math.cos(a));
      this.setVel(vx, vy, 0.3);
      const T = this.parts.torso;
      Matter.Body.setAngularVelocity(T, T.angularVelocity + this.facing * C.JUMP_SPIN * c * (0.5 + Math.random()));
      this.lastGroundFrame = -100;
      HC.Audio.boing(0.8 + (1 - c) * 0.6 + (this.def.scale < 0.8 ? 0.4 : 0));
      this.match.onJump(this);
    } else {
      if (this.ball) this.match.shoot(this);
      else if (this.def.jet && !this.jetUsed) {
        this.jetUsed = true; this.flame = 0.45;
        this.setVel(this.facing * 2.5, -C.JETPACK_FORCE, 0.5);
        HC.Audio.jet();
        this.match.fx.burst(this.x - this.facing * 10, this.y + 10, 14, ['#ff0', '#f80', '#f30'], 4, 0.4);
      }
    }
  }

  snapshot() {
    const P = this.parts, out = [];
    for (const k of HC.Player.ORDER) { const b = P[k]; out.push(b.position.x, b.position.y, b.angle); }
    return { p: this, d: out, mood: this.mood, facing: this.facing, flame: this.flame, hold: this.holding ? Math.min(1, this.holdTime / HC.CONFIG.WINDUP_TIME) : 0,
      bubble: this.bubble, knock: this.knock > 0, slow: this.slow > 0, hidden: !!this.hidden, ghost: !!this.ghost };
  }
};
HC.Player.ORDER = ['torso', 'head', 'legL', 'legR', 'armF', 'armB'];

// ---------- CPU controller (presses the team's one button) ----------
HC.Cpu = class Cpu {
  constructor(match, team, difficulty) {
    this.match = match; this.team = team; this.setDifficulty(difficulty || 'medium');
    this.down = false; this.holdLeft = 0; this.cool = 0.5; this.airShotDone = false;
  }
  setDifficulty(d) { this.diff = d; this.cfg = HC.CONFIG.CPU[d] || HC.CONFIG.CPU.medium; }
  press(t) { this.down = true; this.holdLeft = t; }

  update(dt) {
    const m = this.match, cfg = this.cfg, U = HC.U, C = HC.CONFIG;
    if (this.down) {
      this.holdLeft -= dt;
      if (this.holdLeft <= 0) { this.down = false; this.cool = cfg.reaction * (0.5 + Math.random()); }
      return true;
    }
    if (this.cool > 0) { this.cool -= dt; return false; }
    const mine = m.activePlayers().filter(p => p.team === this.team);
    if (!mine.length) return false;
    const ball = m.mainBall();
    if (!ball) return false;
    const holder = ball.heldBy;
    if (mine.every(p => p.grounded)) this.airShotDone = false;

    if (holder && holder.team === this.team) {
      const p = holder, hoop = m.attackHoop(this.team);
      const dist = Math.abs(hoop.x - p.x);
      if (p.grounded) {
        if (Math.random() < cfg.idle * 0.2) { this.cool = 0.2; return false; }
        const c = dist > cfg.shootRange ? U.rand(0.75, 1) : dist < 160 ? U.rand(0.8, 1) : U.rand(0.55, 1);
        this.press(c * C.WINDUP_TIME / (p.opts.windupMul || 1));
        return true;
      }
      if (!this.airShotDone && dist < cfg.shootRange + (m.mode === 'horse' ? 900 : 0)) {
        const trigger = -0.6 - Math.random() * cfg.apexNoise * 18;
        if (p.vy > trigger) { this.airShotDone = true; this.press(0.04); return true; }
      }
      return false;
    }
    // defense / chase the ball
    const target = holder ? holder.parts.torso.position : ball.body.position;
    let best = null, bd = 1e9;
    for (const p of mine) { const d = Math.abs(p.x - target.x) + Math.abs(p.y - target.y) * 0.3; if (d < bd) { bd = d; best = p; } }
    const p = best;
    if (p.grounded) {
      if (Math.random() < cfg.idle * 0.15) { this.cool = 0.25; return false; }
      const dx = Math.abs(target.x - p.x);
      let c = U.clamp(dx / 420, 0.3, 1);
      if (target.y < p.y - 180 && dx < 200) c = 1;
      this.press(c * C.WINDUP_TIME / (p.opts.windupMul || 1));
      return true;
    }
    // airborne: swipe if close to ball
    const hp = p.handPos();
    if (U.dist(hp.x, hp.y, target.x, target.y) < 95 && p.swingT <= 0) { this.press(0.03); return true; }
    return false;
  }
};

// ---------- Drawing ----------
HC.drawPlayer = function (ctx, snap, opts) {
  const p = snap.p, d = snap.d, dm = p.dims, def = p.def, U = HC.U;
  const col = p.colors, f = snap.facing;
  const part = (i) => ({ x: d[i * 3], y: d[i * 3 + 1], a: d[i * 3 + 2] });
  const torso = part(0), head = part(1), legL = part(2), legR = part(3), armF = part(4), armB = part(5);
  ctx.save();
  if (snap.ghost) ctx.globalAlpha = 0.35;
  const metal = def.style === 'bolt' || def.style === 'hoopatron';
  const limbSkin = metal ? '#7d8a9b' : def.skin;
  const caps = (pt, w, h, fill, stroke) => {
    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.a);
    ctx.fillStyle = fill; ctx.strokeStyle = stroke || 'rgba(0,0,0,0.55)'; ctx.lineWidth = 2;
    rr(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.48); ctx.fill(); ctx.stroke(); ctx.restore();
  };
  const leg = (pt, back) => {
    caps(pt, dm.lw, dm.lh, back ? shade(limbSkin, -0.15) : limbSkin);
    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.a);
    ctx.fillStyle = back ? shade(col.alt, -0.2) : col.alt; rr(ctx, -dm.lw / 2 - 1, -dm.lh / 2, dm.lw + 2, dm.lh * 0.42, 4); ctx.fill();
    ctx.fillStyle = metal ? '#444' : '#222'; rr(ctx, -dm.lw / 2 - 1 + f * 2, dm.lh / 2 - 6, dm.lw + 6, 8, 3); ctx.fill();
    ctx.restore();
  };
  const arm = (pt, back) => {
    caps(pt, dm.aw, dm.ah, back ? shade(limbSkin, -0.15) : limbSkin);
    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.a);
    ctx.fillStyle = back ? shade(col.main, -0.2) : col.main; rr(ctx, -dm.aw / 2 - 1, -dm.ah / 2, dm.aw + 2, dm.ah * 0.3, 3); ctx.fill();
    ctx.fillStyle = back ? shade(limbSkin, -0.15) : limbSkin; ctx.beginPath(); ctx.arc(0, dm.ah / 2 - 2, dm.aw * 0.75, 0, 7); ctx.fill();
    ctx.restore();
  };
  // jetpack flame / pack
  if (def.jet) {
    ctx.save(); ctx.translate(torso.x, torso.y); ctx.rotate(torso.a);
    ctx.fillStyle = '#888'; rr(ctx, -f * dm.tw / 2 - f * 8 - 6, -dm.th / 2 + 4, 12, dm.th * 0.65, 4); ctx.fill();
    if (snap.flame > 0) { ctx.fillStyle = Math.random() < 0.5 ? '#ff0' : '#f60'; ctx.beginPath(); ctx.moveTo(-f * dm.tw / 2 - f * 8 - 6, dm.th * 0.2); ctx.lineTo(-f * dm.tw / 2 - f * 8, dm.th * 0.2 + 26 + Math.random() * 10); ctx.lineTo(-f * dm.tw / 2 - f * 8 + 6, dm.th * 0.2); ctx.fill(); }
    ctx.restore();
  }
  arm(armB, true); leg(legR, true);
  // torso
  ctx.save(); ctx.translate(torso.x, torso.y); ctx.rotate(torso.a);
  ctx.fillStyle = col.main; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2.5;
  rr(ctx, -dm.tw / 2, -dm.th / 2, dm.tw, dm.th, dm.tw * 0.4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col.alt; ctx.fillRect(-dm.tw / 2 + 2, -dm.th / 2 + 4, dm.tw - 4, 3);
  ctx.font = 'bold ' + Math.round(dm.th * 0.32) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = col.alt; ctx.fillText(p.number || (p.slot + 1) * 7 % 100, 0, 2);
  if (def.style === 'nana') { ctx.strokeStyle = '#c66'; ctx.lineWidth = 2; ctx.strokeRect(-dm.tw / 2 + 3, -dm.th / 2 + 8, dm.tw - 6, dm.th - 16); }
  if (def.style === 'coach') { ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-dm.tw * 0.3, -dm.th / 2 + 2); ctx.lineTo(0, -dm.th * 0.1); ctx.lineTo(dm.tw * 0.3, -dm.th / 2 + 2); ctx.stroke(); ctx.fillStyle = '#ccc'; ctx.beginPath(); ctx.arc(0, -dm.th * 0.08, 3, 0, 7); ctx.fill(); }
  ctx.restore();
  leg(legL, false);
  drawHead(ctx, head, dm.hr, def, snap, f, torso);
  arm(armF, false);
  // wind-up meter
  if (snap.hold > 0 && !(opts && opts.noUi)) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(torso.x - 20, head.y - dm.hr - 22, 40, 6);
    ctx.fillStyle = snap.hold >= 1 ? '#ff3' : '#5f5'; ctx.fillRect(torso.x - 20, head.y - dm.hr - 22, 40 * snap.hold, 6);
  }
  if (snap.slow) { ctx.fillStyle = 'rgba(90,200,60,0.55)'; ctx.beginPath(); ctx.ellipse(torso.x, p.match ? HC.CONFIG.FLOOR_Y - 4 : torso.y + 60, 26, 7, 0, 0, 7); ctx.fill(); }
  ctx.restore();
};

function drawHead(ctx, h, r, def, snap, f, torso) {
  ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.a);
  const st = def.style;
  ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  // head base
  if (st === 'bolt' || st === 'hoopatron') {
    ctx.fillStyle = def.skin; rr(ctx, -r, -r, r * 2, r * 2, r * 0.35); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r - 10); ctx.stroke();
    ctx.fillStyle = def.hair; ctx.beginPath(); ctx.arc(0, -r - 11, 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#123'; rr(ctx, -r * 0.8 + f * 2, -r * 0.45, r * 1.6, r * 0.7, 4); ctx.fill();
    const glow = snap.mood === 'sad' ? '#48f' : snap.mood === 'ouch' ? '#f44' : '#4ff';
    ctx.fillStyle = glow; ctx.fillRect(-r * 0.45 + f * r * 0.25, -r * 0.25, r * 0.3, r * 0.3); ctx.fillRect(r * 0.15 + f * r * 0.25, -r * 0.25, r * 0.3, r * 0.3);
    if (st === 'hoopatron') { ctx.fillStyle = '#f33'; ctx.fillRect(-r, r * 0.55, r * 2, 3); }
    ctx.restore(); return;
  }
  const blobby = st === 'blob' || st === 'swamp';
  ctx.fillStyle = def.skin;
  ctx.beginPath();
  if (blobby) { const w = 1 + Math.sin(performance.now() / 120) * 0.04; ctx.ellipse(0, 0, r * w, r / w, 0, 0, 7); }
  else ctx.arc(0, 0, r, 0, 7);
  ctx.fill(); ctx.stroke();
  // hair / hats
  ctx.fillStyle = def.hair;
  if (st === 'noodle') { for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(i * r * 0.25, -r * 0.85, r * 0.18, r * 0.5, i * 0.25 + Math.sin(performance.now() / 150 + i) * 0.2, 0, 7); ctx.fill(); } }
  else if (st === 'pip') { ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 1.02, Math.PI, 0); ctx.fill(); ctx.fillRect(f > 0 ? 0 : -r * 1.7, -r * 0.35, r * 1.7, r * 0.25); }
  else if (st === 'nana') { ctx.beginPath(); ctx.arc(0, -r * 0.35, r * 0.95, Math.PI * 1.05, -0.05); ctx.fill(); ctx.beginPath(); ctx.arc(-f * r * 0.3, -r * 1.05, r * 0.45, 0, 7); ctx.fill(); }
  else if (st === 'rex') { ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 1.1, Math.PI * 0.95, Math.PI * 2.05); ctx.fill(); ctx.stroke(); ctx.fillStyle = def.hair; ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 1.2); ctx.lineTo(0, -r * 1.7); ctx.lineTo(r * 0.2, -r * 1.2); ctx.fill(); }
  else if (st === 'tony') { ctx.beginPath(); ctx.arc(0, -r * 0.3, r * 0.95, Math.PI * 1.1, -0.1); ctx.fill(); ctx.fillStyle = '#333'; ctx.fillRect(-r * 0.5 + f * r * 0.2, r * 0.35, r, r * 0.18); }
  else if (st === 'swamp') { ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.7); for (let i = 0; i < 5; i++) { ctx.lineTo(-r * 0.7 + i * r * 0.35 + r * 0.17, -r * 1.35); ctx.lineTo(-r * 0.7 + (i + 1) * r * 0.35 - 0.01, -r * 0.75); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (st === 'coach') { ctx.fillStyle = '#c22'; ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 1.02, Math.PI, 0); ctx.fill(); ctx.fillRect(f > 0 ? 0 : -r * 1.6, -r * 0.3, r * 1.6, r * 0.22); ctx.fillStyle = '#aaa'; ctx.fillRect(-r * 0.6 + f * r * 0.3, r * 0.45, r * 0.9, r * 0.3); }
  else if (st === 'blob') { ctx.beginPath(); ctx.ellipse(r * 0.3, -r * 0.5, r * 0.25, r * 0.15, 0.4, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill(); }
  // face
  const ex = f * r * 0.32, mood = snap.mood;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
  const eyeR = r * (st === 'pip' ? 0.3 : 0.24);
  for (const o of [-0.28, 0.28]) {
    ctx.beginPath(); ctx.arc(ex + o * r, -r * 0.08, eyeR, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#000';
    if (mood === 'ouch') { ctx.font = 'bold ' + Math.round(eyeR * 2) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('x', ex + o * r, -r * 0.08); }
    else { ctx.beginPath(); ctx.arc(ex + o * r + f * eyeR * 0.35, -r * 0.08, eyeR * 0.5, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#fff';
  }
  if (st === 'nana') { ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5; for (const o of [-0.28, 0.28]) { ctx.beginPath(); ctx.arc(ex + o * r, -r * 0.08, eyeR * 1.35, 0, 7); ctx.stroke(); } }
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath();
  const mx = ex + f * r * 0.05, my = r * 0.42;
  if (mood === 'happy') { ctx.arc(mx, my - r * 0.1, r * 0.3, 0.1, Math.PI - 0.1); }
  else if (mood === 'sad') { ctx.arc(mx, my + r * 0.12, r * 0.25, Math.PI + 0.3, -0.3); }
  else if (mood === 'ouch') { ctx.ellipse(mx, my, r * 0.15, r * 0.2, 0, 0, 7); }
  else { ctx.moveTo(mx - r * 0.18, my); ctx.lineTo(mx + r * 0.18, my); }
  ctx.stroke();
  if (mood === 'sad') { ctx.fillStyle = '#5af'; const t = (performance.now() / 400) % 1; ctx.beginPath(); ctx.arc(ex - r * 0.3, r * 0.1 + t * r * 0.9, 3, 0, 7); ctx.fill(); }
  ctx.restore();
}

function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function shade(hex, amt) {
  let c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
}
HC.rr = rr; HC.shade = shade;

// Character portrait for menus (no physics): draws a standing pose
HC.drawPortrait = function (ctx, charId, x, y, size, colors, mood) {
  const def = HC.charById(charId);
  const s = def.scale;
  const dims = { tw: 24 * s * def.w, th: 46 * s * def.torso, hr: 15 * s * def.head, lw: 11 * s * Math.min(1.3, def.w), lh: 44 * s * def.leg, aw: 8.5 * s, ah: 38 * s * def.arm };
  const fake = { def, dims, colors: colors || { main: '#36f', alt: '#fff' }, slot: 0, number: '' };
  const ty = -dims.lh - dims.th / 2;
  const d = [0, ty, 0, 0, ty - dims.th / 2 - dims.hr + 3, 0, 3, ty + dims.th / 2 + dims.lh / 2 - 4, -0.15, -3, ty + dims.th / 2 + dims.lh / 2 - 4, 0.15,
    6, ty - dims.th / 2 + 6 + dims.ah / 2, -0.4, -6, ty - dims.th / 2 + 6 + dims.ah / 2, 0.3];
  const total = dims.lh + dims.th + dims.hr * 2;
  const k = size / Math.max(total, 120);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  HC.drawPlayer(ctx, { p: fake, d, mood: mood || 'happy', facing: 1, flame: 0, hold: 0 }, { noUi: true });
  ctx.restore();
};
