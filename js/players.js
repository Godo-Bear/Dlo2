// Ragdoll players, original characters, CPU controller and character drawing.
window.HC = window.HC || {};

// ---------- Original characters ----------
// scale: overall size | torso/leg/arm/head: part size multipliers | jump: jump multiplier
// accuracy: >1 = tighter shots | stability: >1 = harder to knock over | bounce: body restitution
// ability: active special (see abilities.js) | unlock: how it's earned (boss id, or 'adv' = Adventure)
HC.CHARACTERS = [
  { id: 'noodle', name: 'Noodle', perk: 'Very tall & floppy - huge reach', skin: '#f6c9a0', hair: '#ffc93c', eye: '#3a7bd5', style: 'noodle', ability: 'stretch',
    scale: 1, torso: 1.3, leg: 1.4, arm: 1.35, head: 0.92, w: 0.8, jump: 1.0, accuracy: 1.0, stability: 0.6, bounce: 0, density: 1 },
  { id: 'pip', name: 'Pip', perk: 'Tiny but jumps sky-high', skin: '#ffd9b3', hair: '#7a3b12', eye: '#4a2c0f', style: 'pip', ability: 'superhop',
    scale: 0.74, torso: 1, leg: 1, arm: 1, head: 1.18, w: 1, jump: 1.3, accuracy: 1.1, stability: 0.9, bounce: 0, density: 1 },
  { id: 'bolt', name: 'Bolt', perk: 'Robot - very hard to knock over', skin: '#9fb0c4', hair: '#ffdd00', eye: '#4ff', style: 'bolt', ability: 'magnet',
    scale: 1.05, torso: 1.05, leg: 0.95, arm: 1, head: 1, w: 1.25, jump: 0.96, accuracy: 1.0, stability: 2.3, bounce: 0, density: 1.6 },
  { id: 'nana', name: 'Nana Hoops', perk: 'Grandma - deadly accurate shots', skin: '#f1c7a0', hair: '#f2f2f2', eye: '#6b4c9a', style: 'nana', ability: 'sureshot',
    scale: 0.92, torso: 1, leg: 0.9, arm: 1, head: 1.05, w: 1.05, jump: 0.94, accuracy: 2.4, stability: 1.0, bounce: 0, density: 1 },
  { id: 'blob', name: 'Blob', perk: 'Squishy & bouncy - springs off everything', skin: '#77d968', hair: '#3c9e33', eye: '#1d5c1a', style: 'blob', ability: 'groundpound',
    scale: 1, torso: 0.9, leg: 0.85, arm: 0.95, head: 1.3, w: 1.3, jump: 1.05, accuracy: 0.95, stability: 1.3, bounce: 0.75, density: 0.9 },
  { id: 'rex', name: 'Rocket Rex', perk: 'Jetpack - tap in the air for a boost', skin: '#c98b5b', hair: '#e63946', eye: '#3b2412', style: 'rex', ability: 'afterburner',
    scale: 0.95, torso: 1, leg: 1, arm: 1, head: 1.05, w: 1, jump: 1.0, accuracy: 1.0, stability: 1.0, bounce: 0, density: 1, jet: true },
  // ----- unlocked by beating bosses -----
  { id: 'tony', name: 'Big Tony', perk: 'Huge & heavy', skin: '#e0a37a', hair: '#222', eye: '#3b2412', style: 'tony', unlock: 'bigTony', ability: 'quake',
    scale: 1.32, torso: 1.1, leg: 1, arm: 1.1, head: 1.05, w: 1.45, jump: 0.9, accuracy: 1.0, stability: 2.0, bounce: 0, density: 1.4 },
  { id: 'hoopatron', name: 'Hoopatron 9000', perk: 'Shooting machine - pinpoint aim', skin: '#c0c6cf', hair: '#ff3b3b', eye: '#f33', style: 'hoopatron', unlock: 'hoopatron', ability: 'wall',
    scale: 1.1, torso: 1, leg: 1, arm: 1.1, head: 1, w: 1.2, jump: 0.98, accuracy: 2.6, stability: 1.7, bounce: 0, density: 1.4 },
  { id: 'swamp', name: 'The Swamp King', perk: 'Slimy blob - mega bounce', skin: '#5aa04a', hair: '#ffd23f', eye: '#c7a600', style: 'swamp', unlock: 'swampKing', ability: 'slime',
    scale: 1.1, torso: 0.95, leg: 0.8, arm: 1, head: 1.35, w: 1.4, jump: 1.1, accuracy: 1.0, stability: 1.5, bounce: 0.8, density: 1 },
  { id: 'coach', name: 'Coach Thunder', perk: 'Good at everything', skin: '#e8b68f', hair: '#bbb', eye: '#2b4d7a', style: 'coach', unlock: 'coach', ability: 'thunder',
    scale: 1.08, torso: 1.05, leg: 1.05, arm: 1.05, head: 1, w: 1.1, jump: 1.12, accuracy: 1.6, stability: 1.5, bounce: 0, density: 1.1 },
  // ----- unlocked in Adventure mode -----
  { id: 'zippy', name: 'Zippy', perk: 'Speedster - lightning-fast wind-up', skin: '#e9a86f', hair: '#3fa9ff', eye: '#1b4f8a', style: 'zippy', unlock: 'adv', ability: 'turbo',
    scale: 0.9, torso: 1, leg: 1.1, arm: 1, head: 1, w: 0.9, jump: 1.08, accuracy: 0.95, stability: 0.9, bounce: 0, density: 0.9, windup: 1.35 },
  { id: 'flurry', name: 'Flurry', perk: 'Snow kid - chilly and steady', skin: '#f2f8ff', hair: '#3a86ff', eye: '#222', style: 'flurry', unlock: 'adv', ability: 'freeze',
    scale: 1.0, torso: 1.05, leg: 0.85, arm: 0.95, head: 1.15, w: 1.25, jump: 0.98, accuracy: 1.2, stability: 1.6, bounce: 0.1, density: 1.2 },
  { id: 'mo', name: 'Mystic Mo', perk: 'Wizard - floaty jumps', skin: '#f0c49b', hair: '#7b2cbf', eye: '#7b2cbf', style: 'mo', unlock: 'adv', ability: 'teleport',
    scale: 0.95, torso: 1.05, leg: 1, arm: 1.05, head: 1, w: 1, jump: 1.1, accuracy: 1.3, stability: 1.0, bounce: 0, density: 0.9 },
  { id: 'clutch', name: 'Captain Clutch', perk: 'Hero - great at everything late', skin: '#d99a6c', hair: '#1d1d1d', eye: '#2a6f4f', style: 'clutch', unlock: 'adv', ability: 'shield',
    scale: 1.05, torso: 1.1, leg: 1.05, arm: 1.05, head: 1, w: 1.1, jump: 1.1, accuracy: 1.4, stability: 1.5, bounce: 0, density: 1.1 },
  { id: 'ghostie', name: 'Ghostie', perk: 'Spooky - floats and slips through', skin: '#f4f2ff', hair: '#c9c2ff', eye: '#222', style: 'ghost', unlock: 'adv', ability: 'phase',
    scale: 0.95, torso: 1, leg: 0.9, arm: 1, head: 1.15, w: 1.05, jump: 1.15, accuracy: 1.1, stability: 0.9, bounce: 0.2, density: 0.7 },
];
HC.charById = (id) => HC.CHARACTERS.find(c => c.id === id) || HC.CHARACTERS[0];
HC.isUnlocked = (def) => {
  if (!def.unlock) return true;
  const sv = HC.Save && HC.Save.data;
  return !!(sv && (sv.unlocked[def.id] || (sv.admin && sv.admin.unlockAll) || (sv.settings && sv.settings.unlockAll)));
};
// 0-1 stat bars for menus
HC.charStats = (d) => ({
  jump: Math.min(1, (d.jump - 0.85) / 0.5),
  aim: Math.min(1, (d.accuracy - 0.8) / 2),
  power: Math.min(1, (d.stability - 0.5) / 1.9),
  size: Math.min(1, (d.scale * (d.torso + d.leg) / 2 - 0.65) / 0.75),
});

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
    this.buff = {};          // active ability effects: name -> { t, end }
    this.armK = 1;
    this.stats = { points: 0, shots: 0, makes: 0, steals: 0, tricks: {} };
    this.build(x);
  }

  build(x) {
    const C = HC.CONFIG, M = Matter, d = this.def, m = this.match.mods || {};
    const s = d.scale * (this.opts.scale || 1);
    const dims = this.dims = {
      tw: 24 * s * d.w, th: 46 * s * d.torso, hr: 15 * s * d.head * (m.headScale || 1),
      lw: 11 * s * Math.min(1.3, d.w), lh: 44 * s * d.leg * (m.legScale || 1),
      aw: 8.5 * s, ah: 38 * s * d.arm * (m.armScale || 1) * (this.opts.armMul || 1), s,
    };
    const ty = C.FLOOR_Y - dims.lh - dims.th / 2 - 4;
    const group = M.Body.nextGroup(true);
    const dens = 0.002 * (d.density || 1) * (this.opts.density || 1);
    const rest = d.bounce || (m.playerBounce || 0);
    const cf = { group, category: HC.CAT.PLAYER, mask: HC.CAT.STATIC | HC.CAT.PLAYER | HC.CAT.BALL | HC.CAT.DEBRIS };
    const base = { collisionFilter: cf, restitution: rest, frictionAir: 0.012 };
    const legFr = m.slippery ? 0.02 : 0.9;
    const mk = (fn) => Object.assign({}, base, { collisionFilter: Object.assign({}, cf) }, fn);
    const P = this.parts = {
      torso: M.Bodies.rectangle(x, ty, dims.tw, dims.th, mk({ density: dens, chamfer: { radius: dims.tw * 0.4 }, friction: 0.4 })),
      head: M.Bodies.circle(x, ty - dims.th / 2 - dims.hr + 3, dims.hr, mk({ density: dens * 0.45, friction: 0.4 })),
      legL: M.Bodies.rectangle(x + 3, ty + dims.th / 2 + dims.lh / 2 - 4, dims.lw, dims.lh, mk({ density: dens, chamfer: { radius: dims.lw * 0.45 }, friction: legFr })),
      legR: M.Bodies.rectangle(x - 3, ty + dims.th / 2 + dims.lh / 2 - 4, dims.lw, dims.lh, mk({ density: dens, chamfer: { radius: dims.lw * 0.45 }, friction: legFr })),
      armF: M.Bodies.rectangle(x, ty - dims.th / 2 + 6 + dims.ah / 2, dims.aw, dims.ah, mk({ density: dens * 0.5, chamfer: { radius: dims.aw * 0.45 }, friction: 0.6 })),
      armB: M.Bodies.rectangle(x, ty - dims.th / 2 + 6 + dims.ah / 2, dims.aw, dims.ah, mk({ density: dens * 0.5, chamfer: { radius: dims.aw * 0.45 }, friction: 0.6 })),
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
  has(b) { return !!this.buff[b]; }
  addBuff(name, t, end) { const old = this.buff[name]; this.buff[name] = { t, end: end || (old && old.end) }; }
  clearBuffs() { for (const k in this.buff) { const b = this.buff[k]; delete this.buff[k]; if (b.end) b.end(); } }

  handPos(which) {
    const a = this.parts[which || 'armF'], L = this.dims.ah / 2 - 2;
    return { x: a.position.x - Math.sin(a.angle) * L, y: a.position.y + Math.cos(a.angle) * L };
  }
  headPos() { return this.parts.head.position; }
  feetY() { return Math.max(this.parts.legL.position.y, this.parts.legR.position.y) + this.dims.lh / 2; }

  // stretch both arms (Noodle's ability) - rescales the bodies and re-pins the shoulders
  setArmScale(k) {
    const r = k / this.armK; if (Math.abs(r - 1) < 0.001) return;
    this.armK = k; this.dims.ah *= r;
    for (const [arm, ci] of [[this.parts.armF, 3], [this.parts.armB, 4]]) {
      Matter.Body.scale(arm, 1, r);
      this.constraints[ci].pointB = { x: 0, y: -this.dims.ah / 2 + 3 };
    }
  }

  setPhase(on) {
    for (const b of this.bodies) b.collisionFilter.mask = on ? (HC.CAT.STATIC | HC.CAT.BALL) : (HC.CAT.STATIC | HC.CAT.PLAYER | HC.CAT.BALL | HC.CAT.DEBRIS);
  }

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
    if (this.has('shield')) { this.push(vx * 0.15, vy * 0.1); return; }
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

  // holding past a full wind-up while the team special meter is full fires the special on release
  get overReady() {
    const C = HC.CONFIG;
    return this.holding && this.holdTime >= C.WINDUP_TIME + C.OVERCHARGE_TIME && this.match.specialReady && this.match.specialReady(this.team);
  }

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
    for (const k in this.buff) { const b = this.buff[k]; b.t -= dt; if (b.t <= 0) { delete this.buff[k]; if (b.end) b.end(); } }

    // frozen solid: no input, barely moves
    if (this.has('frozen')) {
      for (const b of this.bodies) { M.Body.setVelocity(b, { x: b.velocity.x * 0.8, y: b.velocity.y * 0.9 }); M.Body.setAngularVelocity(b, b.angularVelocity * 0.7); }
      this.holding = false; this.prevDown = down; return;
    }

    const ang = U.wrapAngle(T.angle);
    // fall over check
    if (this.knock > 0) this.knock -= dt;
    else if (grounded && Math.abs(ang) > C.KNOCKDOWN_ANGLE * Math.min(1.6, 0.8 + st * 0.2)) {
      this.knock = C.GETUP_TIME / Math.min(2, st);
      this.setMood('ouch', 1.2);
      if (Math.random() < 0.35) this.say(U.pick(HC.SAY.faceplant), 1.2);
      HC.Audio.thud();
      if (this.ball && st < 2 && !this.has('shield')) this.match.dropBall(this.ball, true);
    }

    // facing: only flips on the ground and not mid wind-up
    if (this.desiredFacing && this.desiredFacing !== this.facing && grounded && !this.holding) this.facing = this.desiredFacing;

    // ---- one-button input ----
    if (this.stunT > 0) { this.stunT -= dt; down = false; }
    if (down && !this.prevDown) { this.holding = true; this.holdTime = 0; }
    const wm = (this.opts.windupMul || 1) * (this.def.windup || 1) * (this.has('turbo') ? 1.8 : 1);
    if (this.holding) this.holdTime += dt * wm;
    if (!down && this.prevDown && this.holding) { const over = this.overReady; this.holding = false; this.release(grounded, over); }
    if (!down) this.holding = false;
    this.prevDown = down;
    if (this.swingT > 0) this.swingT -= dt;
    if (this.has('afterburner')) this.jetUsed = false;
    if (this.has('float') && !grounded) { const g = this.match.world.engine.gravity; for (const b of this.bodies) M.Body.applyForce(b, b.position, { x: 0, y: -b.mass * g.y * g.scale * 0.35 }); }

    // ---- torso self-righting ----
    let target = this.holding && grounded ? this.facing * C.CROUCH_LEAN : this.facing * 0.04;
    let k = (grounded ? C.UPRIGHT_GROUND : C.UPRIGHT_AIR) * Math.min(2.5, st);
    let damp = grounded ? C.UPRIGHT_DAMP : 0.02;
    if (this.knock > 0) { k = 0.002; damp = 0.03; }
    if (m.uprightMul) k *= m.uprightMul;
    const diff = U.wrapAngle(target - T.angle);
    M.Body.setAngularVelocity(T, T.angularVelocity + diff * k - T.angularVelocity * damp);
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
    const legOff = grounded ? 0 : -this.facing * 0.25;
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

  release(grounded, over) {
    const C = HC.CONFIG, U = HC.U, m = this.match.mods || {};
    if (over && this.match.fireSpecial) this.match.fireSpecial(this);
    this.swingT = C.ARM_SWING_TIME;
    if (grounded) {
      const c = U.clamp(this.holdTime / C.WINDUP_TIME, C.MIN_CHARGE, 1);
      let jm = this.def.jump * (m.jumpMul || 1) * (this.opts.jumpMul || 1);
      if (this.slow > 0) jm *= 0.55;
      if (this.has('superhop')) { jm *= 1.3; delete this.buff.superhop; }
      const a = this.parts.torso.angle;
      let J = C.JUMP_FORCE * jm * (0.45 + 0.55 * c);
      if (this.knock > 0) J *= 0.45;
      const fwd = (m.jumpForwardMul || 1) * (this.slow > 0 ? 0.4 : 1) * (this.has('turbo') ? 1.9 : 1);
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
    const fx = {};
    for (const k in this.buff) fx[k] = 1;
    if (this.overReady) fx.ready = 1;
    return { p: this, d: out, mood: this.mood, facing: this.facing, flame: this.flame, hold: this.holding ? Math.min(1, this.holdTime / HC.CONFIG.WINDUP_TIME) : 0,
      over: this.holding ? Math.min(1, Math.max(0, (this.holdTime - HC.CONFIG.WINDUP_TIME) / HC.CONFIG.OVERCHARGE_TIME)) : 0,
      bubble: this.bubble, knock: this.knock > 0, slow: this.slow > 0, hidden: !!this.hidden, ghost: !!this.ghost, fx, ah: this.dims.ah };
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
  windup(p, c) {
    const C = HC.CONFIG, wm = (p.opts.windupMul || 1) * (p.def.windup || 1) * (p.has('turbo') ? 1.8 : 1);
    // use the team special when it's ready (holds past a full wind-up)
    if (this.match.specialReady && this.match.specialReady(this.team) && Math.random() < 0.5) return (C.WINDUP_TIME + C.OVERCHARGE_TIME + 0.08) / wm;
    return c * C.WINDUP_TIME / wm;
  }

  update(dt) {
    const m = this.match, cfg = this.cfg, U = HC.U;
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
        this.press(this.windup(p, c));
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
      this.press(this.windup(p, c));
      return true;
    }
    const hp = p.handPos();
    if (U.dist(hp.x, hp.y, target.x, target.y) < 95 && p.swingT <= 0) { this.press(0.03); return true; }
    return false;
  }
};

// ---------- Drawing ----------
const INK = '#151a24';
HC.drawPlayer = function (ctx, snap, opts) {
  opts = opts || {};
  const p = snap.p, d = snap.d, dm = p.dims, def = p.def;
  const col = p.colors, f = snap.facing || 1, fx = snap.fx || {};
  const ah = snap.ah || dm.ah;
  const part = (i) => ({ x: d[i * 3], y: d[i * 3 + 1], a: d[i * 3 + 2] });
  const torso = part(0), head = part(1), legL = part(2), legR = part(3), armF = part(4), armB = part(5);
  const t = performance.now() / 1000;
  ctx.save();
  // floor shadow
  const floorY = opts.floorY != null ? opts.floorY : HC.CONFIG.FLOOR_Y;
  if (!opts.noShadow) {
    const h = Math.max(0, floorY - (Math.max(legL.y, legR.y) + dm.lh / 2));
    const k = Math.max(0.25, 1 - h / 300);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.28 * k) + ')';
    ctx.beginPath(); ctx.ellipse(torso.x, floorY + 2, (dm.tw * 0.9 + 14) * k, 6 * k, 0, 0, 7); ctx.fill();
  }
  if (snap.ghost) ctx.globalAlpha = 0.35;
  if (fx.phase || def.style === 'ghost') ctx.globalAlpha *= fx.phase ? 0.45 : 0.92;
  // aura: special ready / active buffs
  if (fx.ready || snap.over > 0) {
    const r = dm.th * 1.25 + Math.sin(t * 18) * 4;
    const g = ctx.createRadialGradient(torso.x, torso.y, 4, torso.x, torso.y, r);
    g.addColorStop(0, 'rgba(255,240,120,0.0)'); g.addColorStop(0.6, hexA(col.main, 0.25 + snap.over * 0.3)); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(torso.x, torso.y, r, 0, 7); ctx.fill();
  }
  if (fx.turbo) { ctx.strokeStyle = 'rgba(80,200,255,0.6)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { const y = torso.y - 30 + i * 18; ctx.beginPath(); ctx.moveTo(torso.x - f * 30, y); ctx.lineTo(torso.x - f * (70 + (i % 2) * 25), y); ctx.stroke(); } }

  const metal = def.style === 'bolt' || def.style === 'hoopatron';
  const limbSkin = metal ? '#8592a6' : def.skin;
  const outline = 1.8;
  const caps = (pt, w, h, fill, back) => {
    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.a);
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, shade(fill, back ? -0.25 : -0.12)); g.addColorStop(0.45, back ? shade(fill, -0.12) : fill); g.addColorStop(1, shade(fill, back ? -0.32 : -0.22));
    ctx.fillStyle = g; ctx.strokeStyle = INK; ctx.lineWidth = outline;
    rr(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.48); ctx.fill(); ctx.stroke(); ctx.restore();
  };
  const leg = (pt, back) => {
    caps(pt, dm.lw, dm.lh, limbSkin, back);
    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.a);
    // shorts
    ctx.fillStyle = back ? shade(col.main, -0.35) : shade(col.main, -0.15); ctx.strokeStyle = INK; ctx.lineWidth = outline;
    rr(ctx, -dm.lw / 2 - 2, -dm.lh / 2 - 1, dm.lw + 4, dm.lh * 0.45, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col.alt; ctx.fillRect(-dm.lw / 2 - 1, -dm.lh / 2 + dm.lh * 0.38, dm.lw + 2, 2.5);
    // sock + sneaker
    ctx.fillStyle = '#fff'; ctx.fillRect(-dm.lw / 2 + 1, dm.lh / 2 - 13, dm.lw - 2, 5);
    const sw = dm.lw + 9, sx = -dm.lw / 2 - 1 + (f > 0 ? 0 : -8);
    ctx.fillStyle = back ? shade(col.main, -0.2) : col.main; rr(ctx, sx, dm.lh / 2 - 8, sw, 9, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillRect(sx + 1, dm.lh / 2 - 1, sw - 2, 2.5);
    ctx.restore();
  };
  const arm = (pt, back) => {
    const w = dm.aw, h = ah;
    caps(pt, w, h, limbSkin, back);
    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.a);
    ctx.fillStyle = back ? shade(col.main, -0.3) : col.main; ctx.strokeStyle = INK; ctx.lineWidth = outline;
    rr(ctx, -w / 2 - 2, -h / 2 - 1, w + 4, Math.min(h * 0.32, 16), 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = back ? shade(limbSkin, -0.2) : limbSkin; ctx.beginPath(); ctx.arc(0, h / 2 - 2, w * 0.78, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  // cape (behind everything)
  if (def.style === 'clutch') {
    ctx.save(); ctx.translate(torso.x, torso.y); ctx.rotate(torso.a);
    const wv = Math.sin(t * 8) * 6;
    ctx.fillStyle = '#d62839'; ctx.strokeStyle = INK; ctx.lineWidth = outline;
    ctx.beginPath(); ctx.moveTo(-dm.tw * 0.45, -dm.th / 2 + 3); ctx.lineTo(dm.tw * 0.45, -dm.th / 2 + 3);
    ctx.quadraticCurveTo(-f * 18 + dm.tw * 0.4, dm.th * 0.4, -f * (26 + wv) + dm.tw * 0.3, dm.th * 0.85);
    ctx.lineTo(-f * (34 + wv) - dm.tw * 0.3, dm.th * 0.75); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  // jetpack
  if (def.jet) {
    ctx.save(); ctx.translate(torso.x, torso.y); ctx.rotate(torso.a);
    const jx = -f * (dm.tw / 2 + 7);
    ctx.fillStyle = '#9aa3b2'; ctx.strokeStyle = INK; ctx.lineWidth = outline; rr(ctx, jx - 7, -dm.th / 2 + 3, 14, dm.th * 0.68, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e63946'; ctx.fillRect(jx - 7, -dm.th / 2 + 8, 14, 5);
    if (snap.flame > 0 || fx.afterburner) {
      const fl = 22 + Math.random() * 14 + (fx.afterburner ? 18 : 0);
      const g = ctx.createLinearGradient(0, dm.th * 0.2, 0, dm.th * 0.2 + fl); g.addColorStop(0, '#fff6a0'); g.addColorStop(0.5, '#ff9f1c'); g.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(jx - 6, dm.th * 0.2); ctx.quadraticCurveTo(jx, dm.th * 0.2 + fl * 1.2, jx + 6, dm.th * 0.2); ctx.fill();
    }
    ctx.restore();
  }
  arm(armB, true); leg(legR, true);
  // torso / jersey
  ctx.save(); ctx.translate(torso.x, torso.y); ctx.rotate(torso.a);
  const jg = ctx.createLinearGradient(-dm.tw / 2, 0, dm.tw / 2, 0);
  jg.addColorStop(0, shade(col.main, f > 0 ? -0.25 : 0.12)); jg.addColorStop(0.5, col.main); jg.addColorStop(1, shade(col.main, f > 0 ? 0.12 : -0.25));
  ctx.fillStyle = jg; ctx.strokeStyle = INK; ctx.lineWidth = outline + 0.6;
  rr(ctx, -dm.tw / 2, -dm.th / 2, dm.tw, dm.th, dm.tw * 0.42); ctx.fill(); ctx.stroke();
  ctx.save(); rr(ctx, -dm.tw / 2, -dm.th / 2, dm.tw, dm.th, dm.tw * 0.42); ctx.clip();
  ctx.fillStyle = col.alt; ctx.fillRect(-dm.tw / 2, -dm.th / 2, 3.5, dm.th); ctx.fillRect(dm.tw / 2 - 3.5, -dm.th / 2, 3.5, dm.th);
  ctx.beginPath(); ctx.arc(0, -dm.th / 2, dm.tw * 0.28, 0, Math.PI); ctx.lineWidth = 3; ctx.strokeStyle = col.alt; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-dm.tw / 2 + 5, -dm.th / 2 + 4, dm.tw * 0.18, dm.th - 8);
  ctx.restore();
  const num = String(p.number != null && p.number !== '' ? p.number : '');
  if (num) {
    ctx.font = HC.dfont(dm.th * 0.42); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeText(num, 0, 2); ctx.fillStyle = col.alt; ctx.fillText(num, 0, 2);
  }
  if (def.style === 'coach') { ctx.strokeStyle = '#eee'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-dm.tw * 0.3, -dm.th / 2 + 2); ctx.lineTo(0, -dm.th * 0.12); ctx.lineTo(dm.tw * 0.3, -dm.th / 2 + 2); ctx.stroke(); ctx.fillStyle = '#d9d9d9'; ctx.beginPath(); ctx.arc(0, -dm.th * 0.1, 3.5, 0, 7); ctx.fill(); ctx.stroke(); }
  if (def.style === 'clutch') { ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -dm.th * 0.32); ctx.lineTo(dm.tw * 0.28, -dm.th * 0.12); ctx.lineTo(0, dm.th * 0.08); ctx.lineTo(-dm.tw * 0.28, -dm.th * 0.12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (def.style === 'flurry') { ctx.fillStyle = '#3a86ff'; ctx.fillRect(-dm.tw / 2 + 2, -dm.th / 2 + 4, dm.tw - 4, 6); }
  if (def.style === 'mo') { ctx.fillStyle = '#ffd23f'; for (const [sx, sy] of [[-0.2, 0.15], [0.22, 0.3], [0, -0.2]]) star(ctx, sx * dm.tw, sy * dm.th, 4); }
  ctx.restore();
  leg(legL, false);
  drawHead(ctx, head, dm.hr, def, snap, f, t);
  arm(armF, false);

  // ---- ability overlays ----
  if (fx.shield) {
    ctx.strokeStyle = 'rgba(120,230,255,' + (0.6 + Math.sin(t * 10) * 0.3) + ')'; ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(120,230,255,0.15)';
    ctx.beginPath(); ctx.arc(torso.x, torso.y - 6, dm.th * 1.15, 0, 7); ctx.fill(); ctx.stroke();
  }
  if (fx.frozen) {
    ctx.save(); ctx.translate(torso.x, torso.y - dm.th * 0.25); ctx.rotate(torso.a * 0.5);
    const w = dm.tw + 40, h = dm.th + dm.lh + dm.hr * 2 + 10;
    ctx.fillStyle = 'rgba(170,225,255,0.55)'; ctx.strokeStyle = '#e8f8ff'; ctx.lineWidth = 3;
    rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h / 2 + 18); ctx.lineTo(-w / 2 + 18, -h / 2 + 8); ctx.stroke();
    ctx.restore();
  }
  if (fx.magnet) {
    ctx.strokeStyle = 'rgba(255,230,60,0.85)'; ctx.lineWidth = 2;
    const hp = { x: armF.x - Math.sin(armF.a) * ah / 2, y: armF.y + Math.cos(armF.a) * ah / 2 };
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(hp.x, hp.y, 10 + ((t * 60 + i * 12) % 36), 0, 7); ctx.stroke(); }
  }
  // wind-up + overcharge meter
  if (snap.hold > 0 && !opts.noUi) {
    const x = torso.x - 22, y = head.y - dm.hr - 24;
    ctx.fillStyle = 'rgba(15,10,35,0.75)'; rr(ctx, x - 2, y - 2, 48, 10, 5); ctx.fill();
    ctx.fillStyle = snap.hold >= 1 ? '#ffd23f' : '#2ee6a6'; rr(ctx, x, y, 44 * snap.hold, 6, 3); ctx.fill();
    if (snap.over > 0 && p.match && p.match.specialReady && p.match.specialReady(p.team)) {
      ctx.fillStyle = '#ff6a13'; rr(ctx, x, y, 44 * snap.over, 6, 3); ctx.fill();
      if (snap.over >= 1) { ctx.font = HC.dfont(16); ctx.textAlign = 'center'; ctx.fillStyle = '#ff6a13'; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeText('SPECIAL!', torso.x, y - 10); ctx.fillText('SPECIAL!', torso.x, y - 10); }
    }
  }
  ctx.restore();
};

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fill();
}
HC.star = star;

function drawHead(ctx, h, r, def, snap, f, t) {
  ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.a);
  const st = def.style, mood = snap.mood;
  const determined = snap.hold > 0.3 && mood === 'neutral';
  ctx.lineWidth = 2; ctx.strokeStyle = INK;
  // ---------- robots ----------
  if (st === 'bolt' || st === 'hoopatron') {
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, shade(def.skin, 0.3)); g.addColorStop(1, shade(def.skin, -0.25));
    ctx.fillStyle = g; rr(ctx, -r, -r, r * 2, r * 2, r * 0.38); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r - 11); ctx.stroke();
    if (st === 'hoopatron') { ctx.fillStyle = '#f07a1a'; ctx.beginPath(); ctx.arc(0, -r - 14, 5, 0, 7); ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = Math.sin(t * 6) > 0 ? def.hair : shade(def.hair, -0.5); ctx.beginPath(); ctx.arc(0, -r - 12, 4, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#16213a'; rr(ctx, -r * 0.82 + f * 2, -r * 0.48, r * 1.64, r * 0.78, 6); ctx.fill(); ctx.stroke();
    const glow = mood === 'sad' ? '#5b8cff' : mood === 'ouch' ? '#ff4d4d' : mood === 'happy' ? '#7dff9a' : def.eye;
    ctx.fillStyle = glow; ctx.shadowColor = glow; ctx.shadowBlur = 8;
    if (st === 'hoopatron') ctx.fillRect(-r * 0.7 + f * 2, -r * 0.18, r * 1.4, r * 0.22);
    else { const ey = mood === 'happy' ? -r * 0.2 : -r * 0.12; ctx.fillRect(-r * 0.48 + f * r * 0.22, ey, r * 0.3, mood === 'happy' ? r * 0.14 : r * 0.3); ctx.fillRect(r * 0.18 + f * r * 0.22, ey, r * 0.3, mood === 'happy' ? r * 0.14 : r * 0.3); }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#555'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * r * 0.78, r * 0.6, 2.2, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#333'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * r * 0.18 - 1.5 + f * 2, r * 0.48, 3, r * 0.22);
    ctx.restore(); return;
  }
  // ---------- back-of-head items ----------
  if (st === 'mo') { ctx.fillStyle = '#f5f5f5'; ctx.beginPath(); ctx.moveTo(-r * 0.75, r * 0.15); ctx.quadraticCurveTo(f * r * 0.2, r * 2.2, r * 0.75, r * 0.15); ctx.fill(); ctx.stroke(); }
  // ---------- face base ----------
  const blobby = st === 'blob' || st === 'swamp' || st === 'ghost';
  const sg = ctx.createRadialGradient(-r * 0.3 + f * r * 0.2, -r * 0.35, r * 0.1, 0, 0, r * 1.1);
  sg.addColorStop(0, shade(def.skin, 0.25)); sg.addColorStop(0.7, def.skin); sg.addColorStop(1, shade(def.skin, -0.18));
  ctx.fillStyle = sg;
  ctx.beginPath();
  if (st === 'ghost') { ctx.arc(0, 0, r, Math.PI, 0); ctx.lineTo(r, r * 0.9); for (let i = 0; i < 4; i++) { const x0 = r - (i + 0.5) * r / 2; ctx.quadraticCurveTo(x0, r * (0.9 + 0.3 * Math.sin(t * 6 + i)), x0 - r / 4, r * 0.9); } ctx.lineTo(-r, r * 0.9); ctx.closePath(); }
  else if (blobby) { const w = 1 + Math.sin(t * 8) * 0.05; ctx.ellipse(0, 0, r * w, r / w, 0, 0, 7); }
  else ctx.arc(0, 0, r, 0, 7);
  ctx.fill(); ctx.stroke();
  // ear
  if (!blobby && st !== 'flurry' && st !== 'rex') { ctx.fillStyle = shade(def.skin, -0.08); ctx.beginPath(); ctx.ellipse(-f * r * 0.62, r * 0.05, r * 0.2, r * 0.26, 0, 0, 7); ctx.fill(); ctx.stroke(); }
  // ---------- hair / hats ----------
  ctx.fillStyle = def.hair; ctx.strokeStyle = INK; ctx.lineWidth = 2.4;
  if (st === 'noodle') { for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(i * r * 0.24, -r * 0.88, r * 0.17, r * 0.55, i * 0.28 + Math.sin(t * 5 + i) * 0.22, 0, 7); ctx.fill(); ctx.stroke(); } ctx.fillStyle = '#c96'; for (const fx2 of [0.35, 0.55]) { ctx.beginPath(); ctx.arc(f * r * fx2, r * 0.18, 1.4, 0, 7); ctx.fill(); } }
  else if (st === 'pip') { ctx.fillStyle = '#ff4757'; ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 1.02, Math.PI * 1.02, -0.02); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); rr(ctx, f > 0 ? -r * 1.55 : r * 0.1, -r * 0.33, r * 1.45, r * 0.22, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -r * 0.62, r * 0.18, 0, 7); ctx.fill(); }
  else if (st === 'nana') { ctx.beginPath(); ctx.arc(0, -r * 0.35, r * 0.98, Math.PI * 1.02, -0.02); ctx.fill(); ctx.stroke(); for (const [cx, cy] of [[-0.6, -0.55], [-0.2, -0.9], [0.25, -0.88], [0.62, -0.55]]) { ctx.beginPath(); ctx.arc(cx * r, cy * r, r * 0.28, 0, 7); ctx.fill(); ctx.stroke(); } ctx.beginPath(); ctx.arc(-f * r * 0.35, -r * 1.12, r * 0.42, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ff9ec7'; ctx.beginPath(); ctx.arc(-f * r * 0.62, r * 0.35, 2.5, 0, 7); ctx.fill(); }
  else if (st === 'rex') { ctx.fillStyle = 'rgba(200,235,255,0.35)'; ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 1.18, 0, 7); ctx.fill(); ctx.strokeStyle = '#dfe6ee'; ctx.lineWidth = 4; ctx.stroke(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 1.26, 0, 7); ctx.stroke(); ctx.fillStyle = def.hair; ctx.beginPath(); ctx.moveTo(-r * 0.22, -r * 1.2); ctx.quadraticCurveTo(0, -r * 2, r * 0.28, -r * 1.2); ctx.fill(); ctx.stroke(); }
  else if (st === 'tony') { ctx.beginPath(); ctx.moveTo(-r * 0.95, -r * 0.15); ctx.quadraticCurveTo(-r, -r * 1.15, f * r * 0.4, -r * 1.05); ctx.quadraticCurveTo(r * 1.05, -r * 0.9, r * 0.95, -r * 0.2); ctx.quadraticCurveTo(0, -r * 0.6, -r * 0.95, -r * 0.15); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(40,40,60,0.18)'; ctx.beginPath(); ctx.arc(f * r * 0.1, r * 0.4, r * 0.55, 0.2, Math.PI - 0.2); ctx.fill(); }
  else if (st === 'swamp') { ctx.fillStyle = def.hair; ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.72); for (let i = 0; i < 5; i++) { ctx.lineTo(-r * 0.7 + i * r * 0.35 + r * 0.17, -r * 1.4); ctx.lineTo(-r * 0.7 + (i + 1) * r * 0.35, -r * 0.78); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e63946'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-r * 0.35 + i * r * 0.35, -r * 0.95, 2.6, 0, 7); ctx.fill(); } ctx.fillStyle = 'rgba(40,120,30,0.6)'; ctx.beginPath(); ctx.ellipse(r * 0.2, r * 0.95, r * 0.12, r * 0.3, 0, 0, 7); ctx.fill(); }
  else if (st === 'coach') { ctx.fillStyle = '#d62839'; ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 1.03, Math.PI * 1.02, -0.02); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); rr(ctx, f > 0 ? 0 : -r * 1.55, -r * 0.33, r * 1.55, r * 0.22, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = HC.dfont(r * 0.7); ctx.textAlign = 'center'; ctx.fillText('C', 0, -r * 0.48); }
  else if (st === 'blob') { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.5, r * 0.28, r * 0.15, -0.5, 0, 7); ctx.fill(); ctx.fillStyle = def.hair; ctx.beginPath(); ctx.moveTo(0, -r * 0.95); ctx.quadraticCurveTo(r * 0.3, -r * 1.6, r * 0.05, -r * 1.55); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.08, -r * 1.55, 4, 0, 7); ctx.fill(); ctx.stroke(); }
  else if (st === 'zippy') { for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-r * 0.8 + i * r * 0.36, -r * 0.6); ctx.lineTo(-f * r * 0.5 - r * 0.6 + i * r * 0.36, -r * 1.45); ctx.lineTo(-r * 0.5 + i * r * 0.36, -r * 0.7); ctx.fill(); ctx.stroke(); } ctx.fillStyle = '#ffd23f'; ctx.fillRect(-r, -r * 0.52, r * 2, r * 0.24); ctx.strokeRect(-r, -r * 0.52, r * 2, r * 0.24); ctx.fillStyle = '#ff3d7f'; ctx.beginPath(); ctx.moveTo(f * r * 0.1, -r * 0.55); ctx.lineTo(f * r * 0.35, -r * 0.4); ctx.lineTo(f * r * 0.2, -r * 0.4); ctx.lineTo(f * r * 0.45, -r * 0.22); ctx.lineTo(f * r * 0.12, -r * 0.38); ctx.lineTo(f * r * 0.28, -r * 0.38); ctx.closePath(); ctx.fill(); }
  else if (st === 'flurry') { ctx.fillStyle = '#3a86ff'; ctx.beginPath(); ctx.arc(0, -r * 0.25, r * 1.02, Math.PI * 1.02, -0.02); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-r * 1.02, -r * 0.38, r * 2.04, r * 0.2); ctx.strokeRect(-r * 1.02, -r * 0.38, r * 2.04, r * 0.2); ctx.beginPath(); ctx.arc(0, -r * 1.3, r * 0.25, 0, 7); ctx.fill(); ctx.stroke(); }
  else if (st === 'mo') { ctx.fillStyle = def.hair; ctx.beginPath(); ctx.moveTo(-r * 1.25, -r * 0.45); ctx.lineTo(r * 1.25, -r * 0.45); ctx.lineTo(-f * r * 0.5, -r * 2.4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffd23f'; star(ctx, -f * r * 0.1, -r * 1.2, r * 0.25); star(ctx, f * r * 0.35, -r * 0.75, r * 0.16); }
  else if (st === 'clutch') { ctx.beginPath(); ctx.arc(0, -r * 0.3, r * 0.98, Math.PI * 1.05, -0.05); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(f * r * 0.1, -r * 0.95); ctx.quadraticCurveTo(f * r * 0.6, -r * 0.6, f * r * 0.3, -r * 0.35); ctx.stroke(); }
  // ---------- eyes ----------
  const ex = f * r * 0.3;
  const eyeR = r * (st === 'pip' || st === 'ghost' ? 0.28 : 0.23);
  const ey = -r * 0.05;
  if (st === 'clutch') { ctx.fillStyle = '#d62839'; rr(ctx, ex - r * 0.62, ey - eyeR * 1.3, r * 1.24, eyeR * 2.6, eyeR); ctx.fill(); ctx.stroke(); }
  for (const o of [-0.27, 0.27]) {
    const x = ex + o * r;
    if (mood === 'happy') { ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(x, ey + eyeR * 0.3, eyeR * 0.75, Math.PI * 1.15, -0.15); ctx.stroke(); continue; }
    if (mood === 'ouch') { ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - eyeR * 0.6, ey - eyeR * 0.6); ctx.lineTo(x + eyeR * 0.6, ey + eyeR * 0.6); ctx.moveTo(x + eyeR * 0.6, ey - eyeR * 0.6); ctx.lineTo(x - eyeR * 0.6, ey + eyeR * 0.6); ctx.stroke(); continue; }
    ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(x, ey, eyeR, eyeR * 1.12, 0, 0, 7); ctx.fill(); ctx.stroke();
    const px = x + f * eyeR * 0.32, py = ey + (mood === 'sad' ? eyeR * 0.25 : 0);
    ctx.fillStyle = def.eye || '#3a2a1a'; ctx.beginPath(); ctx.arc(px, py, eyeR * 0.58, 0, 7); ctx.fill();
    ctx.fillStyle = '#0d0820'; ctx.beginPath(); ctx.arc(px, py, eyeR * 0.3, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - eyeR * 0.2, py - eyeR * 0.25, eyeR * 0.18, 0, 7); ctx.fill();
  }
  // brows
  if (st !== 'ghost' && st !== 'blob') {
    ctx.strokeStyle = st === 'nana' || st === 'mo' ? '#bbb' : shade(def.hair === '#ffc93c' ? '#a0701a' : def.hair, -0.2); ctx.lineWidth = st === 'tony' ? 4 : 2.6; ctx.lineCap = 'round';
    for (const o of [-0.27, 0.27]) {
      const x = ex + o * r, inner = (o > 0) === (f > 0) ? -1 : 1;
      const tilt = determined ? 0.3 : mood === 'sad' ? -0.3 : 0;
      ctx.beginPath(); ctx.moveTo(x - eyeR * 0.9, ey - eyeR * 1.55 + inner * tilt * eyeR * -1); ctx.lineTo(x + eyeR * 0.9, ey - eyeR * 1.55 - inner * tilt * eyeR * -1); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }
  if (st === 'nana') { ctx.strokeStyle = '#6b4c9a'; ctx.lineWidth = 1.8; for (const o of [-0.27, 0.27]) { ctx.beginPath(); ctx.arc(ex + o * r, ey, eyeR * 1.4, 0, 7); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(ex - r * 0.1, ey); ctx.lineTo(ex + r * 0.1, ey); ctx.stroke(); }
  // nose
  if (st === 'flurry') { ctx.fillStyle = '#ff8c1a'; ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(ex, r * 0.12); ctx.lineTo(ex + f * r * 0.75, r * 0.25); ctx.lineTo(ex, r * 0.36); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  // ---------- mouth ----------
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4;
  const mx = ex + f * r * 0.05, my = r * 0.5;
  if (st === 'tony' || st === 'coach') { ctx.fillStyle = st === 'coach' ? '#ccc' : '#2a1a10'; ctx.beginPath(); ctx.ellipse(mx, my - r * 0.14, r * 0.38, r * 0.12, 0, 0, 7); ctx.fill(); }
  if (mood === 'happy' || mood === 'ouch') {
    ctx.fillStyle = '#5a1020'; ctx.beginPath();
    if (mood === 'happy') { ctx.moveTo(mx - r * 0.3, my - r * 0.08); ctx.quadraticCurveTo(mx, my + r * 0.42, mx + r * 0.3, my - r * 0.08); ctx.closePath(); }
    else ctx.ellipse(mx, my, r * 0.14, r * 0.2, 0, 0, 7);
    ctx.fill(); ctx.stroke();
    if (mood === 'happy') { ctx.fillStyle = '#fff'; ctx.fillRect(mx - r * 0.2, my - r * 0.07, r * 0.4, r * 0.09); }
  } else if (mood === 'sad') { ctx.beginPath(); ctx.arc(mx, my + r * 0.15, r * 0.22, Math.PI + 0.35, -0.35); ctx.stroke(); }
  else if (determined) { ctx.fillStyle = '#fff'; rr(ctx, mx - r * 0.22, my - r * 0.08, r * 0.44, r * 0.16, 3); ctx.fill(); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(mx - r * 0.18, my); ctx.quadraticCurveTo(mx, my + r * 0.1, mx + r * 0.18, my); ctx.stroke(); }
  if (mood === 'sad') { ctx.fillStyle = '#5ab0ff'; const tt = (t * 2.5) % 1; ctx.beginPath(); ctx.arc(ex - r * 0.27, ey + eyeR + tt * r * 0.9, 3, 0, 7); ctx.fill(); }
  // swamp king crown already drawn; coach whistle handled on torso
  ctx.restore();
}

function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function shade(hex, amt) {
  let c = String(hex).replace('#', '');
  if (c.startsWith('rgb')) return hex;
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c.slice(0, 6), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
}
function hexA(hex, a) {
  let c = String(hex).replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c.slice(0, 6), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
HC.rr = rr; HC.shade = shade; HC.hexA = hexA;
HC.FONT_DISPLAY = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
HC.FONT_BODY = '"Inter", "Segoe UI", Arial, sans-serif';
HC.dfont = (px, w) => 'italic ' + (w || 800) + ' ' + Math.round(px) + 'px ' + HC.FONT_DISPLAY;

// Character portrait for menus (no physics): draws a standing pose with feet at (x, y)
HC.drawPortrait = function (ctx, charId, x, y, size, colors, mood, opts) {
  const def = HC.charById(charId);
  const s = def.scale;
  const dims = { tw: 24 * s * def.w, th: 46 * s * def.torso, hr: 15 * s * def.head, lw: 11 * s * Math.min(1.3, def.w), lh: 44 * s * def.leg, aw: 8.5 * s, ah: 38 * s * def.arm };
  const fake = { def, dims, colors: colors || { main: '#36f', alt: '#fff' }, slot: 0, number: (opts && opts.number) || '' };
  const ty = -dims.lh - dims.th / 2;
  const sw = opts && opts.pose === 'cheer' ? 1 : 0;
  const armA = sw ? -2.6 : -0.4, armB = sw ? 2.5 : 0.3;
  const d = [0, ty, 0, 0, ty - dims.th / 2 - dims.hr + 3, 0, 3, ty + dims.th / 2 + dims.lh / 2 - 4, -0.15, -3, ty + dims.th / 2 + dims.lh / 2 - 4, 0.15,
    Math.sin(-armA) * dims.ah / 2, ty - dims.th / 2 + 7 + Math.cos(armA) * dims.ah / 2 - 3, armA, Math.sin(-armB) * dims.ah / 2, ty - dims.th / 2 + 7 + Math.cos(armB) * dims.ah / 2 - 3, armB];
  const total = dims.lh + dims.th + dims.hr * 2;
  const k = size / Math.max(total, 120);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  HC.drawPlayer(ctx, { p: fake, d, mood: mood || 'happy', facing: (opts && opts.facing) || 1, flame: 0, hold: 0, fx: {} }, { noUi: true, floorY: 0, noShadow: opts && opts.noShadow });
  ctx.restore();
};
