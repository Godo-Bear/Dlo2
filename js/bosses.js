// Boss battles: your 2 players vs 1 giant boss with a health bar and telegraphed special moves.
window.HC = window.HC || {};

HC.BOSSES = [
  { id: 'bigTony', charId: 'tony', name: 'BIG TONY', title: 'Three times the size. Three times the stomp.',
    colors: { main: '#7a1010', alt: '#ffd700' }, specials: ['stomp'], cpu: 'medium', court: 'gym' },
  { id: 'hoopatron', charId: 'hoopatron', name: 'HOOPATRON 9000', title: 'A shooting machine with a block-o-matic arm.',
    colors: { main: '#333a44', alt: '#ff3b3b' }, specials: ['barrage', 'block'], cpu: 'hard', court: 'space' },
  { id: 'swampKing', charId: 'swamp', name: 'THE SWAMP KING', title: 'Ruler of the slime. Very sticky. Very rude.',
    colors: { main: '#2f5d2a', alt: '#e9c400' }, specials: ['slime'], cpu: 'medium', court: 'beach' },
  { id: 'coach', charId: 'coach', name: 'COACH THUNDER', title: 'The final boss. He makes the rules. And the weather.',
    colors: { main: '#1b1b3a', alt: '#ffe14d' }, specials: ['mutate', 'lightning'], cpu: 'hard', court: 'rooftop', final: true },
];
HC.bossById = (id) => HC.BOSSES.find(b => b.id === id);

HC.SPECIALS = {
  // ---- Big Tony: STOMP ----
  stomp: {
    name: 'STOMP!', icon: '🦶',
    tell(f, ctx, s) { const b = s.pos; ctx.fillStyle = 'rgba(255,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(b.x, HC.CONFIG.FLOOR_Y, 520, 30, 0, 0, 7); ctx.fill(); },
    tellTick(f) { if (Math.random() < 0.3) f.match.fx.shake(3); },
    run(f) {
      const m = f.match, C = HC.CONFIG;
      HC.Audio.stomp(); m.fx.shake(26); m.hitPause = 4;
      m.fx.burst(f.player.x, C.FLOOR_Y, 50, ['#b98', '#876', '#fff'], 8, 0.8);
      for (const p of m.activePlayers()) {
        if (p.team !== 0) continue;
        if (p.feetY() > C.FLOOR_Y - 60) { p.knockDown(Math.sign(p.x - f.player.x) * 5, -9, 1.2); p.say(HC.U.pick(['WHOA!', 'earthquake!!', 'my knees']), 1.2); }
      }
      for (const b of m.balls) if (!b.heldBy && b.y > C.FLOOR_Y - 80) Matter.Body.setVelocity(b.body, { x: b.body.velocity.x, y: -12 });
    },
  },
  // ---- Hoopatron: BALL BARRAGE ----
  barrage: {
    name: 'BALL BARRAGE!', icon: '🎯',
    tell(f, ctx) {
      for (const p of f.match.activePlayers()) if (p.team === 0) {
        ctx.strokeStyle = '#f33'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 34, 0, 7); ctx.moveTo(p.x - 46, p.y); ctx.lineTo(p.x + 46, p.y); ctx.moveTo(p.x, p.y - 46); ctx.lineTo(p.x, p.y + 46); ctx.stroke();
      }
    },
    run(f) {
      const m = f.match, src = f.player.headPos();
      HC.Audio.zap();
      for (const p of m.activePlayers()) {
        if (p.team !== 0) continue;
        for (let k = 0; k < 2; k++) {
          const c = Matter.Bodies.circle(src.x - 30, src.y, 12, { label: 'cannon', restitution: 0.6, density: 0.004, frictionAir: 0,
            collisionFilter: { category: HC.CAT.DEBRIS, mask: HC.CAT.STATIC | HC.CAT.PLAYER | HC.CAT.BALL } });
          c.hcLife = 3.5;
          const T = 34 + k * 8, g = m.world.engine.gravity.y * 0.001 * Math.pow(1000 / 60, 2);
          const dx = p.x - c.position.x, dy = p.y - c.position.y;
          Matter.Body.setVelocity(c, { x: dx / T, y: (dy - g * T * (T + 1) / 2) / T });
          m.world.addBody(c); m.cannons.push(c);
        }
      }
    },
  },
  // ---- Hoopatron: ROBOT ARM BLOCK ----
  block: {
    name: 'BLOCK-O-MATIC!', icon: '🦾', duration: 3,
    tell(f, ctx) {
      const h = f.match.attackHoop(0); ctx.save(); ctx.strokeStyle = '#ff0'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
      ctx.strokeRect(h.x - 60, h.y - 70, 120, 18); ctx.restore();
    },
    run(f) {
      const m = f.match, h = m.attackHoop(0);
      HC.Audio.zap();
      f.arm = Matter.Bodies.rectangle(h.x, h.y - 60, 120, 16, { isStatic: true, label: 'blocker', restitution: 0.8,
        collisionFilter: { category: HC.CAT.BLOCKER, mask: HC.CAT.BALL } });
      m.world.addBody(f.arm); f.armT = this.duration;
    },
  },
  // ---- Swamp King: SLIME FLOOD ----
  slime: {
    name: 'SLIME FLOOD!', icon: '🟢',
    tell(f, ctx) {
      const C = HC.CONFIG;
      for (let i = 0; i < 14; i++) { const x = 80 + i * 85, y = C.FLOOR_Y - ((f.match.time * 80 + i * 37) % 60); ctx.fillStyle = 'rgba(90,200,60,0.7)'; ctx.beginPath(); ctx.arc(x, y, 6 + (i % 3) * 2, 0, 7); ctx.fill(); }
    },
    run(f) { HC.Audio.slime(); f.slimeT = 6; f.match.fx.burst(f.player.x, HC.CONFIG.FLOOR_Y - 20, 40, ['#5c4', '#3a2', '#9f6'], 7, 0.8); },
  },
  // ---- Coach Thunder: NEW PLAY (changes the mutator mid-point) ----
  mutate: {
    name: 'NEW PLAY!', icon: '📋',
    tell(f, ctx) { const p = f.player.headPos(); ctx.font = '50px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Math.sin(f.match.time * 20) > 0 ? '📋' : '📣', p.x, p.y - 110); },
    run(f) {
      const m = f.match;
      HC.Audio.whistle();
      if (f.coachMut) { f.coachMut.remove(m); f.coachMut = null; }
      const pool = HC.MUTATORS.filter(x => x.live && (!m.activeMutator || x.id !== m.activeMutator.id));
      const mut = HC.U.pick(pool); mut.apply(m); f.coachMut = mut;
      m.fx.bigText('COACH CALLS: ' + mut.icon + ' ' + mut.name.toUpperCase(), '#ffe14d', 1.4);
    },
  },
  // ---- Coach Thunder: LIGHTNING moves your hoop ----
  lightning: {
    name: 'LIGHTNING!', icon: '⚡',
    tell(f, ctx) {
      const h = f.match.attackHoop(0);
      ctx.fillStyle = Math.sin(f.match.time * 25) > 0 ? '#555' : '#333';
      for (const [dx, dy, r] of [[-40, 0, 34], [0, -14, 42], [40, 0, 34], [10, 12, 30]]) { ctx.beginPath(); ctx.arc(h.x + dx - 30, 90 + dy, r, 0, 7); ctx.fill(); }
    },
    run(f) {
      const m = f.match, h = m.attackHoop(0);
      HC.Audio.zap(); m.fx.shake(14); f.flash = 0.35;
      f.bolt = { x: h.x, y: h.y, t: 0.4 };
      m.world.placeHoop(h, HC.U.rand(-170, 0), HC.U.rand(-110, 90));
      m.fx.burst(h.x, h.y, 30, ['#fff', '#ff0', '#8cf'], 7, 0.6);
    },
  },
};

HC.BossFight = class BossFight {
  constructor(match, id) {
    this.match = match; this.def = HC.bossById(id); this.id = id;
    this.cfg = HC.CONFIG.BOSS[id];
    this.health = this.maxHealth = this.cfg.health;
    this.bossScore = 0; this.gravityMul = 1;
    this.timer = HC.U.rand(...this.cfg.specialEvery);
    this.tellT = 0; this.special = null;
  }
  get player() { return this.match.players.find(p => p.team === 1); }
  playerOpts() { const def = HC.charById(this.def.charId); return { scale: this.cfg.scale / def.scale, jumpMul: this.cfg.jumpMul, colors: this.def.colors, density: 1.2 }; }

  damage(pts) {
    this.health = Math.max(0, this.health - pts);
    this.hurtT = 0.6;
    const p = this.player; if (p) { p.say(HC.U.pick(['GRRR!', 'LUCKY SHOT!', 'IMPOSSIBLE!', 'ARGH!']), 1.6); }
  }

  reset() {
    this.cleanup();
    this.timer = HC.U.rand(...this.cfg.specialEvery) * 0.7;
    this.tellT = 0; this.special = null;
  }
  cleanup() {
    const m = this.match;
    if (this.arm) { m.world.removeBody(this.arm); this.arm = null; }
    if (this.coachMut) { this.coachMut.remove(m); this.coachMut = null; }
    this.slimeT = 0; this.bolt = null; this.flash = 0;
  }

  update(dt) {
    const m = this.match, U = HC.U, p = this.player;
    if (!p) return;
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.coachMut && this.coachMut.update) this.coachMut.update(m, dt);
    if (this.flash > 0) this.flash -= dt;
    if (this.bolt) { this.bolt.t -= dt; if (this.bolt.t <= 0) this.bolt = null; }
    if (this.arm) { this.armT -= dt; if (this.armT <= 0) { m.world.removeBody(this.arm); this.arm = null; } }
    if (this.slimeT > 0) {
      this.slimeT -= dt;
      for (const pl of m.activePlayers()) if (pl.team === 0 && pl.feetY() > HC.CONFIG.FLOOR_Y - 20) pl.slow = 0.25;
    }
    if (this.special) {
      this.tellT -= dt;
      const sp = HC.SPECIALS[this.special];
      if (sp.tellTick) sp.tellTick(this);
      if (this.tellT <= 0) { sp.run(this); this.special = null; this.timer = U.rand(...this.cfg.specialEvery); }
      return;
    }
    this.timer -= dt;
    if (this.timer <= 0) {
      this.special = U.pick(this.def.specials);
      this.tellT = this.cfg.tell;
      const sp = HC.SPECIALS[this.special];
      m.fx.bigText('⚠ ' + sp.icon + ' ' + sp.name, '#ff4444', this.cfg.tell);
      HC.Audio.beep(true);
      p.say(sp.name, this.cfg.tell);
    }
  }

  snapshot() { return { special: this.special, pos: { x: this.player ? this.player.x : 0, y: this.player ? this.player.y : 0 } }; }

  drawBack(ctx, s) {
    const C = HC.CONFIG;
    if (this.slimeT > 0) {
      ctx.fillStyle = 'rgba(80,190,50,0.75)'; ctx.beginPath(); ctx.moveTo(0, C.FLOOR_Y + 6);
      for (let x = 0; x <= C.WIDTH; x += 20) ctx.lineTo(x, C.FLOOR_Y - 10 + Math.sin(this.match.time * 4 + x * 0.05) * 5);
      ctx.lineTo(C.WIDTH, C.FLOOR_Y + 6); ctx.fill();
    }
    if (s.special && this.special) {
      // glowing tell around the boss
      const p = this.player; if (p) { ctx.fillStyle = 'rgba(255,40,40,' + (0.2 + Math.abs(Math.sin(this.match.time * 12)) * 0.3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.dims.th * 1.4, 0, 7); ctx.fill(); }
    }
  }

  drawFront(ctx, s) {
    const C = HC.CONFIG;
    if (s.special && this.special) {
      HC.SPECIALS[this.special].tell(this, ctx, s);
      const p = this.player;
      if (p) { ctx.font = 'bold 60px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff2'; ctx.strokeStyle = '#000'; ctx.lineWidth = 5; const y = p.headPos().y - p.dims.hr - 40; ctx.strokeText('!', p.x, y); ctx.fillText('!', p.x, y); }
    }
    if (this.arm) {
      const b = this.arm.position, h = this.match.attackHoop(0);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(h.x - h.dir * 50, h.y - 100); ctx.lineTo(b.x - h.dir * 40, b.y); ctx.stroke();
      ctx.fillStyle = '#c0c6cf'; ctx.strokeStyle = '#f33'; ctx.lineWidth = 3; HC.rr(ctx, b.x - 60, b.y - 8, 120, 16, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f33'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillText('BLOCKED', b.x, b.y + 4);
    }
    if (this.bolt) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.shadowColor = '#8cf'; ctx.shadowBlur = 20;
      ctx.beginPath(); let x = this.bolt.x, y = 0; ctx.moveTo(x, y);
      while (y < this.bolt.y) { y += 40; x += HC.U.rand(-25, 25); ctx.lineTo(x, y); }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (this.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + this.flash * 2 + ')'; ctx.fillRect(0, 0, C.WIDTH, C.HEIGHT); }
  }
};
