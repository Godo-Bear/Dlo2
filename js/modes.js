// Match engine + game modes (Quick Match, Hot Potato, Tournament, Boss, Horse/Trick).
window.HC = window.HC || {};

HC.Match = class Match {
  // opts: { mode, teams:[{name, colors, chars:[id,id], cpu:'easy'|null, upgrades:{}}], court, winScore, boss, mutators:bool, word }
  constructor(app, opts) {
    const C = HC.CONFIG;
    this.app = app; this.opts = opts; this.mode = opts.mode;
    this.court = HC.courtById(opts.court);
    this.world = new HC.World(this.court);
    this.world.listeners.push((a, b, pair) => this.onCollide(a, b, pair));
    this.mods = HC.defaultMods();
    Object.assign(this.mods, this.court.mods || {});
    this.fx = new HC.FX();
    this.teams = opts.teams;
    this.score = [0, 0];
    this.winScore = opts.winScore || C.WIN_SCORE;
    this.cpus = this.teams.map((t, i) => (t.cpu ? new HC.Cpu(this, i, t.cpu) : null));
    this.players = []; this.balls = []; this.debris = []; this.cannons = [];
    this.time = 0; this.hitPause = 0;
    this.activeMutator = null; this.mutatorsOn = opts.mutators !== false;
    this.recorder = new HC.Recorder(4);
    this.timed = true; this.pointTime = C.POINT_TIME;
    // optional whole-game time limit (minutes, 0 = off). When it runs out the leader wins;
    // a tie goes to overtime where the next basket wins.
    const mt = opts.matchTime || 0;
    this.gameClock = mt > 0 && ['quick', 'hotpotato', 'tournament'].includes(opts.mode) ? mt * 60 : null;
    this.overtime = false;
    this.excitement = 0.2; this.wind = 0; this.windMut = 0; this.windCourt = 0; this.windBoss = 0;
    this.darkMut = 0; this.darkCourt = 0; this.lavaH = 0; this.floorAngle = 0;
    this.statsPlayers = []; // persistent stat holders per (team,slot)
    this.paused = false; this.over = false;
    this.boss = opts.boss ? new HC.BossFight(this, opts.boss) : null;
    // team special meters (abilities) + per-team stats used by Adventure objectives
    this.special = [0, 0]; this.effects = [];
    this.abilitiesOn = this.mode !== 'horse' && !opts.noAbilities;
    this.teamStats = [{ tricks: 0, threes: 0, dunks: 0 }, { tricks: 0, threes: 0, dunks: 0 }];
    this.ballSkin = opts.ballSkin || 'classic';
    // a mutator that stays on for the whole match (Adventure stages, admin)
    this.fixedMutator = opts.fixedMutator ? HC.mutatorById(opts.fixedMutator) : null;
    if (!this.fixedMutator && !opts.demo && HC.Admin && HC.Admin.get('forceMut', null) && this.mode !== 'horse') this.fixedMutator = HC.mutatorById(HC.Admin.get('forceMut'));
    if (this.fixedMutator) this.fixedMutator.apply(this);
    this.chaos = !opts.demo && this.mode !== 'horse' && HC.Admin && HC.Admin.get('chaos', false);
    if (this.chaos && !this.fixedMutator) { this.activeMutator = HC.U.pick(HC.MUTATORS); this.activeMutator.apply(this); }
    this.pointsPlayed = 0;
    this.resetPoint(true);
  }

  // ---------------- setup ----------------
  spawnList() {
    const C = HC.CONFIG, W = C.WIDTH, out = [];
    this.teams.forEach((t, ti) => {
      const chars = t.chars;
      if (this.boss && ti === 1) { out.push({ team: 1, slot: 0, char: this.boss.def.charId, x: W - 380, opts: this.boss.playerOpts() }); return; }
      chars.forEach((c, si) => {
        const x = ti === 0 ? (si === 0 ? 470 : 250) : (si === 0 ? W - 470 : W - 250);
        out.push({ team: ti, slot: si, char: c, x });
      });
    });
    return out;
  }

  buildPlayers() {
    for (const p of this.players) p.destroy();
    this.players = [];
    for (const s of this.spawnList()) {
      const t = this.teams[s.team], up = t.upgrades || {};
      const adminJump = !t.cpu && HC.Admin && !this.opts.demo ? HC.Admin.get('jump', 1) : 1;
      const opts = Object.assign({ colors: t.colors, jumpMul: (up.jumpMul || 1) * adminJump, windupMul: up.windupMul || 1, sticky: up.sticky || 0, accuracyMul: up.accuracyMul || 1, stability: up.stability || 1 }, s.opts || {});
      const p = new HC.Player(this, s.team, s.slot, s.char, s.x, opts);
      const key = s.team + ':' + s.slot;
      let st = this.statsPlayers.find(x => x.key === key);
      if (!st) { st = { key, team: s.team, name: p.def.name, char: s.char, stats: p.stats }; this.statsPlayers.push(st); }
      p.stats = st.stats; p.number = [7, 23, 11, 3, 33, 8][(s.team * 2 + s.slot) % 6];
      this.players.push(p);
    }
  }

  activePlayers() { return this.players.filter(p => !p.hidden); }
  mainBall() { return this.balls[0]; }
  defendHoop(team) { return this.mode === 'horse' ? this.world.hoops[1] : this.world.hoops[team === 0 ? 0 : 1]; }
  specialReady(team) {
    if (!this.abilitiesOn || (this.boss && team === 1)) return false;
    const adm = HC.Save && HC.Save.data && HC.Save.data.admin;
    if (adm && adm.enabled && adm.infiniteSpecial && !this.cpus[team]) return true;
    return this.special[team] >= 1;
  }
  fireSpecial(p) {
    if (!this.specialReady(p.team)) return;
    this.special[p.team] = 0;
    const mine = this.activePlayers().filter(o => o.team === p.team);
    for (const o of mine) HC.Abilities.activate(this, o);
    const names = mine.map(o => { const a = HC.abilityOf(o.def); return a ? a.icon + ' ' + a.name.toUpperCase() : ''; }).filter(Boolean);
    this.fx.bigText(names.join('  +  '), this.teams[p.team].colors.main, 1.3);
    HC.Audio.trick(); this.fx.shake(6);
  }
  attackHoop(team) { return this.mode === 'horse' ? this.world.hoops[1] : this.world.hoops[team === 0 ? 1 : 0]; }

  resetPoint(first) {
    const C = HC.CONFIG;
    // end court event
    if (this.ev && this.court.event.end) this.court.event.end(this, this.ev);
    this.ev = null; this.evWarn = null;
    this.evTimer = HC.U.rand(...this.court.event.every);
    if (this.boss) this.boss.reset();
    this.world.resetHoops();
    this.setFloorAngle(0);
    this.windCourt = this.windBoss = 0; this.darkCourt = 0; this.lavaH = 0;
    this.clearDebris(false);
    if (HC.Abilities) HC.Abilities.clear(this);
    for (const c of this.cannons) this.world.removeBody(c); this.cannons = [];
    for (const b of this.balls) b.remove(); this.balls = [];
    this.refreshLive();
    this.buildPlayers();
    if (this.court.init) this.court.init(this);
    this.spawnBalls();
    this.pointTime = C.POINT_TIME;
    this.state = 'countdown'; this.stateT = C.COUNTDOWN;
    this.recorder.clear();
    this.lastScore = null;
    this.lastCount = -1;
  }

  spawnBalls() {
    const xs = this.mods.doubleBall ? [560, 720] : [640];
    for (const x of xs) {
      const b = new HC.Ball(this.world, x, 230, this.mods);
      b.spawn = { x, y: 230 }; b.skin = this.ballSkin;
      if (this.mods.bomb || this.mode === 'hotpotato') b.bomb = { t: HC.U.rand(...HC.CONFIG.BOMB_TIME) };
      this.balls.push(b);
    }
  }

  refreshLive() {
    const m = this.mods;
    this.world.engine.gravity.y = this.world.baseGravity * m.gravityMul * (this.boss ? this.boss.gravityMul : 1);
    this.world.floor.friction = m.slippery ? 0.005 : this.world.floorBaseFriction;
    for (const p of this.players) { p.parts.legL.friction = p.parts.legR.friction = m.slippery ? 0.02 : 0.9; for (const b of p.bodies) b.restitution = p.def.bounce || m.playerBounce || 0; }
    for (const b of this.balls) b.applyMods(m);
  }

  setFloorAngle(a) {
    this.floorAngle = a;
    Matter.Body.setAngle(this.world.floor, a);
  }

  // ---------------- debris (space court) ----------------
  spawnDebris(n, temp) {
    const C = HC.CONFIG;
    for (let i = 0; i < n; i++) {
      const r = HC.U.rand(12, 24);
      const x = temp ? HC.U.rand(200, C.WIDTH - 200) : HC.U.rand(250, C.WIDTH - 250);
      const y = temp ? -40 - i * 60 : HC.U.rand(120, 420);
      const b = Matter.Bodies.polygon(x, y, 7, r, { label: 'debris', restitution: 1, friction: 0, frictionAir: 0, density: 0.002,
        collisionFilter: { category: HC.CAT.DEBRIS, mask: 0xffff } });
      b.hcTemp = temp; b.hcR = r;
      Matter.Body.setVelocity(b, temp ? { x: HC.U.rand(-3, 3), y: HC.U.rand(4, 7) } : { x: HC.U.rand(-2.5, 2.5), y: HC.U.rand(-2, 2) });
      Matter.Body.setAngularVelocity(b, HC.U.rand(-0.05, 0.05));
      this.world.addBody(b); this.debris.push(b);
    }
  }
  updateDebris() {
    const g = this.world.engine.gravity;
    for (const b of this.debris) {
      Matter.Body.applyForce(b, b.position, { x: 0, y: -b.mass * g.y * g.scale });
      const sp = Math.hypot(b.velocity.x, b.velocity.y);
      if (sp < 1.5) Matter.Body.setVelocity(b, { x: b.velocity.x * 1.05 + 0.05, y: b.velocity.y * 1.05 });
      if (b.position.y > HC.CONFIG.FLOOR_Y - 30 && b.velocity.y > 0) Matter.Body.setVelocity(b, { x: b.velocity.x, y: -Math.abs(b.velocity.y) });
      if (b.position.y < 60 && b.velocity.y < 0 && !b.hcTemp) Matter.Body.setVelocity(b, { x: b.velocity.x, y: Math.abs(b.velocity.y) });
    }
  }
  clearDebris(tempOnly) {
    this.debris = this.debris.filter(b => { if (!tempOnly || b.hcTemp) { this.world.removeBody(b); return false; } return true; });
  }

  // ---------------- lava (volcano court) ----------------
  checkLava() {
    const C = HC.CONFIG, h = this.lavaH, LW = HC.COURTS_LAVA_W;
    if (h <= 2) return;
    const inLava = (x, y) => (x < LW || x > C.WIDTH - LW) && y > C.FLOOR_Y - h;
    for (const p of this.activePlayers()) {
      if (p.bodies.some(b => inLava(b.position.x, b.bounds.max.y))) {
        this.fx.burst(p.x, C.FLOOR_Y - h, 25, ['#ff0', '#f80', '#f30', '#555'], 6, 0.7);
        HC.Audio.sizzle();
        if (p.ball) this.dropBall(p.ball, false);
        p.teleport(p.team === 0 ? 470 : C.WIDTH - 470, p.y < C.FLOOR_Y - 200 ? C.FLOOR_Y - 200 : p.y);
        p.teleport(p.team === 0 ? 470 : C.WIDTH - 470, C.FLOOR_Y - p.dims.lh - p.dims.th / 2 - 10);
        p.say(HC.U.pick(HC.SAY.lava), 1.2); p.setMood('ouch', 1);
      }
    }
    for (const b of this.balls) if (!b.heldBy && inLava(b.x, b.y + b.r)) this.respawnBall(b);
  }

  respawnBall(b) {
    this.fx.burst(b.x, b.y, 12, ['#fff', '#aaa'], 4, 0.5);
    if (b.heldBy) this.dropBall(b, false);
    Matter.Body.setPosition(b.body, { x: 640, y: 200 }); Matter.Body.setVelocity(b.body, { x: 0, y: 0 });
    b.shot = null; b.prevY = 200;
  }

  // ---------------- ball handling ----------------
  grab(ball, p) {
    if (p.ball) return false;
    ball.heldBy = p; p.ball = ball; ball.holdTime = 0;
    ball.setHeldPhysics(true);
    ball.lastTouch = { player: p, part: 'hand' };
    ball.shot = null;
    HC.Audio.grab();
    if (this.onGrab) this.onGrab(ball, p);
    return true;
  }

  dropBall(ball, knocked) {
    const p = ball.heldBy; if (!p) return;
    p.ball = null; ball.heldBy = null; ball.setHeldPhysics(false);
    ball.noGrab.set(p, 0.35);
    if (knocked) Matter.Body.setVelocity(ball.body, { x: HC.U.rand(-4, 4), y: HC.U.rand(-7, -4) });
  }

  shoot(p) {
    const C = HC.CONFIG, U = HC.U, ball = p.ball; if (!ball) return;
    const hoop = this.attackHoop(p.team);
    const bx = ball.x, by = ball.y;
    const tx = hoop.x, ty = hoop.y - 4;
    const dx = tx - bx, dy = ty - by;
    const T = Math.round(C.SHOT_ARC_STEPS * U.clamp(0.6 + Math.abs(dx) / 1000, 0.65, 1.6) * (this.mods.gravityMul < 0.8 ? 1.3 : 1));
    const a = this.world.engine.gravity.y * this.world.engine.gravity.scale * Math.pow(1000 / 60, 2);
    let vx = dx / T, vy = (dy - a * T * (T + 1) / 2) / T;
    // aim error
    const acc = p.def.accuracy * (p.opts.accuracyMul || 1);
    const cpu = this.cpus[p.team];
    let err = C.SHOT_ERROR_BASE + C.SHOT_ERROR_TIMING * U.clamp(Math.abs(p.vy) / 6, 0, 1) + C.SHOT_ERROR_DIST * Math.abs(dx);
    err /= acc; if (cpu) err *= cpu.cfg.aimMul;
    const sure = p.has && p.has('sure');
    if (sure) { err = 0; delete p.buff.sure; this.fx.popup('🎯', p.x, p.y - 80, '#ffd23f', 34, 0.8); }
    if (this.mode === 'horse') err *= 0.8;
    const ang = U.gauss() * err, pw = sure ? 1 : 1 + U.gauss() * C.SHOT_POWER_ERROR / acc;
    const cs = Math.cos(ang), sn = Math.sin(ang);
    const rvx = (vx * cs - vy * sn) * pw, rvy = (vx * sn + vy * cs) * pw;
    this.dropBall(ball, false);
    ball.noGrab.set(p, C.REGRAB_COOLDOWN);
    Matter.Body.setVelocity(ball.body, { x: rvx, y: rvy });
    ball.body.collisionFilter.mask = 0xffff & ~HC.CAT.PLAYER; ball.ghostT = 0.16;
    ball.shot = { player: p, team: p.team, x: p.x, y: p.y, angle: p.angle, board: false, rimHits: 0, header: false, t: this.time, clock: this.pointTime, ground: false };
    ball.lastTouch = { player: p, part: 'hand' };
    p.stats.shots++;
    HC.Audio.shoot();
    if (this.onShot) this.onShot(ball, p);
  }

  onJump(p) { if (p.ball && this.onPlayerJump) this.onPlayerJump(p); }

  onCollide(a, b, pair) {
    const U = HC.U;
    const ballBody = a.hcBall ? a : b.hcBall ? b : null;
    if (ballBody) {
      const ball = ballBody.hcBall, other = ballBody === a ? b : a;
      const sp = Math.hypot(ballBody.velocity.x - other.velocity.x, ballBody.velocity.y - other.velocity.y);
      if (other.label === 'rim') {
        if (ball.shot && this.time - (ball.lastRim || 0) > 0.12) ball.shot.rimHits++;
        ball.lastRim = this.time;
        other.hcHoop.wobV += U.clamp(sp, 1, 8) * 0.9 * (Math.random() < 0.5 ? 1 : -1);
        if (sp > 1.5) HC.Audio.rim();
      } else if (other.label === 'backboard') {
        if (ball.shot) ball.shot.board = true;
        if (sp > 1.5) HC.Audio.backboard();
      } else if (other.label === 'ground') {
        if (ball.shot) ball.shot.ground = true;
        if (sp > 2) HC.Audio.bounce(sp);
      } else if (other.hcPlayer) {
        const p = other.hcPlayer;
        if (other.hcPart === 'head' && !ball.heldBy) {
          ball.shot = { player: p, team: p.team, x: p.x, y: p.y, angle: p.angle, board: false, rimHits: 0, header: true, t: this.time, clock: this.pointTime, ground: false };
          HC.Audio.bounce(6);
          if (this.onHeader) this.onHeader(ball, p);
        } else if (ball.shot && ball.shot.team !== p.team) ball.shot = null;
        ball.lastTouch = { player: p, part: other.hcPart };
        if (this.mods.ballDensity > 3 && sp > 7) { p.knockDown(ballBody.velocity.x * 0.4, -3, 0.8); }
      }
      return;
    }
    // player vs player / debris / cannons
    const pa = a.hcPlayer, pb = b.hcPlayer;
    const sp = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
    if (pa && pb && pa.team !== pb.team && sp > HC.CONFIG.KNOCK_LOOSE_SPEED) {
      for (const [p, o] of [[pa, pb], [pb, pa]]) {
        if (p.ball && p.ball.holdTime > HC.CONFIG.STEAL_COOLDOWN && Math.random() < 0.5 * (1 - (p.opts.sticky || 0))) this.dropBall(p.ball, true);
      }
    }
    const pl = pa || pb, other = pa ? b : a;
    if (pl && (other.label === 'cannon' || other.label === 'debris') && sp > 7) pl.knockDown(other.velocity.x * 0.5, -4, 0.9);
  }

  updateBalls(dt) {
    const C = HC.CONFIG, U = HC.U;
    for (const ball of this.balls) {
      for (const [p, t] of ball.noGrab) { if (t - dt <= 0) ball.noGrab.delete(p); else ball.noGrab.set(p, t - dt); }
      if (ball.ghostT > 0) { ball.ghostT -= dt; if (ball.ghostT <= 0 && !ball.heldBy) ball.body.collisionFilter.mask = 0xffff; }
      if (ball.heldBy) {
        const p = ball.heldBy, arm = p.parts.armF, hp = p.handPos('armF');
        const dx = hp.x - arm.position.x, dy = hp.y - arm.position.y, d = Math.hypot(dx, dy) || 1;
        const off = ball.r * 0.75 + p.dims.aw * 0.4;
        Matter.Body.setPosition(ball.body, { x: hp.x + dx / d * off, y: hp.y + dy / d * off });
        Matter.Body.setVelocity(ball.body, { x: arm.velocity.x, y: arm.velocity.y });
        ball.holdTime += dt;
        if (this.state === 'play' && ball.holdTime > C.STEAL_COOLDOWN && !p.has('shield') && !p.has('phase')) {
          for (const o of this.activePlayers()) {
            if (o.team === p.team || o.knock > 0 || o.ball) continue;
            for (const w of ['armF', 'armB']) {
              const h = o.handPos(w);
              if (U.dist(h.x, h.y, ball.x, ball.y) < ball.r + o.dims.aw * 0.7 + 4 && Math.random() < 1 - (p.opts.sticky || 0) * 0.8) {
                this.dropBall(ball, false); this.grab(ball, o); o.stats.steals++;
                this.special[o.team] = Math.min(1, this.special[o.team] + C.SPECIAL_ON_STEAL);
                if (Math.random() < 0.5) o.say(U.pick(HC.SAY.steal), 1); p.setMood('sad', 0.8);
                this.fx.burst(ball.x, ball.y, 8, ['#fff', '#ff0'], 3, 0.35);
                break;
              }
            }
            if (ball.heldBy !== p) break;
          }
        }
      } else if (this.state === 'play' || this.state === 'scored') {
        if (this.state === 'play' && !(this.canGrab && !this.canGrab(ball))) {
          let done = false;
          for (const p of this.activePlayers()) {
            if (done) break;
            if (p.ball || ball.noGrab.has(p) || p.knock > 0.3) continue;
            for (const w of ['armF', 'armB']) {
              const h = p.handPos(w);
              if (U.dist(h.x, h.y, ball.x, ball.y) < ball.r + p.dims.aw * 0.75 + C.GRAB_EXTRA) { this.grab(ball, p); done = true; break; }
            }
          }
        }
      }
      // keep inside the arena
      if (ball.y > C.FLOOR_Y + 120 || ball.x < -60 || ball.x > C.WIDTH + 60) this.respawnBall(ball);
      // bomb
      if (ball.bomb && this.state === 'play') {
        const before = ball.bomb.t; ball.bomb.t -= dt;
        if (ball.bomb.t < 3 && Math.floor(before * 2) !== Math.floor(ball.bomb.t * 2)) HC.Audio.beep(ball.bomb.t < 1);
        if (ball.bomb.t <= 0) this.explode(ball);
      }
      // scoring
      if (this.state === 'play') {
        for (const hoop of this.world.hoops) {
          if (!hoop.visible) continue;
          if (ball.prevY < hoop.y && ball.y >= hoop.y && Math.abs(ball.x - hoop.x) < C.RIM_WIDTH / 2 - ball.r * 0.15 && ball.body.velocity.y > -1) {
            this.onBasket(ball, hoop); break;
          }
        }
      }
      ball.prevY = ball.y;
    }
  }

  explode(ball) {
    const C = HC.CONFIG, U = HC.U;
    const x = ball.x, y = ball.y, holder = ball.heldBy;
    HC.Audio.explode(); this.fx.shake(22); this.hitPause = 5;
    this.fx.burst(x, y, 50, ['#ff0', '#f80', '#f30', '#333', '#fff'], 9, 0.9);
    this.fx.popup('KABOOM!', x, y - 40, '#f80', 54);
    for (const p of this.activePlayers()) {
      const d = U.dist(p.x, p.y, x, y);
      if (d < 260) { const k = 1 - d / 260, nx = (p.x - x) / (d || 1); p.knockDown(nx * C.BOMB_FORCE * k, -C.BOMB_FORCE * 0.7 * k, 1.2); }
    }
    if (holder) this.dropBall(ball, false);
    if (holder && this.mode !== 'horse') {
      const team = 1 - holder.team;
      holder.say('...oops', 1.5);
      this.awardPoints(team, C.BOMB_POINTS, null, [], 'KABOOM! +' + C.BOMB_POINTS);
    } else {
      // fresh fuse, back to centre
      ball.bomb.t = U.rand(...C.BOMB_TIME);
      this.respawnBall(ball);
    }
  }

  onBasket(ball, hoop) {
    const C = HC.CONFIG;
    if (this.mode === 'horse') return this.onHorseBasket(ball, hoop);
    const team = hoop.scoreTeam;
    const shot = ball.shot;
    let base = 2;
    if (shot && shot.team === team && !shot.header && Math.abs(shot.x - hoop.baseX) > C.THREE_PT_DIST) base = 3;
    const tricks = HC.Tricks.detect(this, ball, hoop);
    let scorer = null;
    if (ball.heldBy && ball.heldBy.team === team) scorer = ball.heldBy;
    else if (shot && shot.team === team) scorer = shot.player;
    else if (ball.lastTouch && ball.lastTouch.player.team === team) scorer = ball.lastTouch.player;
    if (ball.heldBy) this.dropBall(ball, false);
    hoop.glow = 1;
    HC.Audio.swish();
    if (tricks.includes('dunk')) { this.fx.shake(C.SHAKE_DUNK); this.hitPause = C.HITPAUSE_FRAMES; HC.Audio.stomp(); }
    this.fx.burst(hoop.x, hoop.y + 20, 30, [this.teams[team].colors.main, '#fff', '#ff0'], 6, 0.8);
    const pts = base + tricks.length;
    const ts = this.teamStats[team]; ts.tricks += tricks.length; if (base === 3) ts.threes++; if (tricks.includes('dunk')) ts.dunks++;
    this.awardPoints(team, pts, scorer, tricks, null, base);
  }

  awardPoints(team, pts, scorer, tricks, customLabel, base) {
    const C = HC.CONFIG, U = HC.U;
    if (this.boss && team === 0) this.boss.damage(pts); else if (this.boss) this.boss.bossScore += pts; else this.score[team] += pts;
    this.special[1 - team] = Math.min(1, this.special[1 - team] + C.SPECIAL_ON_SCORED);
    if (scorer) {
      scorer.stats.points += pts; scorer.stats.makes++;
      for (const t of tricks) scorer.stats.tricks[t] = (scorer.stats.tricks[t] || 0) + 1;
    }
    for (const p of this.activePlayers()) {
      if (p.team === team) { p.setMood('happy', 2.5); if (p === scorer || Math.random() < 0.4) p.say(U.pick(HC.SAY.score), 1.8); }
      else { p.setMood('sad', 2.5); if (Math.random() < 0.6) p.say(U.pick(HC.SAY.scoredOn), 1.8); }
    }
    const col = this.teams[team].colors.main;
    if (customLabel) this.fx.bigText(customLabel, '#f80');
    else if (tricks.length) {
      this.fx.bigText(HC.Tricks.label(tricks) + ' +' + tricks.length, '#ffde00');
      HC.Audio.trick();
      this.fx.popup('+' + base, this.attackHoop(team).x, this.attackHoop(team).y - 50, col, 46);
    } else this.fx.popup(base === 3 ? '+3 DOWNTOWN!' : '+' + base, this.attackHoop(team).x, this.attackHoop(team).y - 50, col, 46);
    HC.Audio.cheer();
    this.excitement = 1;
    this.state = 'scored'; this.stateT = C.SCORE_PAUSE;
    this.lastScore = { team, tricks, big: tricks.length > 0 && HC.Tricks.isBig(tricks) };
    this.pointsPlayed++;
  }

  winner() {
    if (this.boss) { if (this.boss.health <= 0) return 0; if (this.boss.bossScore >= HC.CONFIG.BOSS_WIN_SCORE) return 1; return -1; }
    if (this.score[0] >= this.winScore) return 0;
    if (this.score[1] >= this.winScore) return 1;
    if (this.gameClock != null && this.gameClock <= 0 && this.score[0] !== this.score[1]) return this.score[0] > this.score[1] ? 0 : 1;
    return -1;
  }

  startReplay(then, label) {
    const clip = this.recorder.clip(HC.CONFIG.REPLAY_SECONDS);
    if (clip.length < 20) { then(); return; }
    this.replay = { frames: clip, i: 0, then, label: label || 'INSTANT REPLAY' };
    this.state = 'replay';
  }

  afterScore() {
    const w = this.winner();
    if (w >= 0) {
      this.startReplay(() => this.finish(w), 'WINNING POINT');
      return;
    }
    const go = () => {
      if (this.mutatorsOn && this.lastScore) this.startCards(1 - this.lastScore.team);
      else this.nextPoint(null);
    };
    if (this.lastScore && this.lastScore.big) this.startReplay(go); else go();
  }

  startCards(picker) {
    const pool = HC.U.shuffle(HC.MUTATORS.filter(m => !this.activeMutator || m.id !== this.activeMutator.id));
    this.cards = { picker, list: pool.slice(0, 3), hl: 0, t: 0, cycle: 0, cpuT: 1.4, picked: -1 };
    this.state = 'cards';
  }

  pickCard(i) {
    if (!this.cards || this.cards.picked >= 0) return;
    this.cards.picked = i; this.cards.hl = i; this.cards.pickT = 0.7;
    HC.Audio.card();
  }

  nextPoint(mut) {
    if (this.activeMutator) { this.activeMutator.remove(this); this.activeMutator = null; }
    if (!mut && this.chaos && !this.fixedMutator) mut = HC.U.pick(HC.MUTATORS);
    if (mut) { this.activeMutator = mut; mut.apply(this); }
    this.cards = null;
    this.resetPoint(false);
  }

  finish(w) {
    this.over = true; this.state = 'over';
    for (const p of this.activePlayers()) {
      if (p.team === w) { p.setMood('happy', 99); p.say(HC.U.pick(HC.SAY.win), 3); }
      else { p.setMood('sad', 99); p.say(HC.U.pick(HC.SAY.lose), 3); }
    }
    this.fx.confetti();
    setTimeout(() => this.app.onMatchEnd(this, w), 1600);
  }

  // ---------------- main step ----------------
  step(dt) {
    const C = HC.CONFIG;
    if (this.paused) return;
    this.fx.update(dt);
    if (this.state === 'replay') {
      this.replay.i += C.REPLAY_SPEED;
      if (this.app.anyPressed()) this.replay.i = 1e9;
      if (this.replay.i >= this.replay.frames.length - 1) { const t = this.replay.then; this.replay = null; this.state = 'post'; t(); }
      return;
    }
    if (this.state === 'cards') { this.stepCards(dt); return; }
    if (this.hitPause > 0) { this.hitPause--; return; }
    this.time += dt;

    // inputs
    const btn = [false, false];
    for (let t = 0; t < 2; t++) btn[t] = this.cpus[t] ? (this.state === 'play' ? this.cpus[t].update(dt) : false) : this.app.button(t);
    if (this.state === 'countdown' || this.state === 'over') { btn[0] = btn[1] = false; }
    if (this.state === 'countdown') {
      this.stateT -= dt;
      const n = Math.ceil(this.stateT / (C.COUNTDOWN / 3));
      if (n !== this.lastCount && n > 0) { this.lastCount = n; HC.Audio.beep(false); }
      for (const b of this.balls) { Matter.Body.setPosition(b.body, b.spawn || { x: 640, y: 230 }); Matter.Body.setVelocity(b.body, { x: 0, y: 0 }); b.prevY = b.y; }
      if (this.stateT <= 0) { this.state = 'play'; HC.Audio.whistle(); this.fx.bigText('GO!', '#fff', 0.7); for (const b of this.balls) Matter.Body.setVelocity(b.body, { x: HC.U.rand(-0.5, 0.5), y: 0 }); }
    }

    // facing
    for (const p of this.activePlayers()) p.desiredFacing = this.facingFor(p);
    for (const p of this.activePlayers()) p.update(dt, btn[p.team]);

    if (this.state === 'play') {
      if (this.activeMutator && this.activeMutator.update) this.activeMutator.update(this, dt);
      if (this.fixedMutator && this.fixedMutator.update) this.fixedMutator.update(this, dt);
      if (this.abilitiesOn) for (let t = 0; t < 2; t++) this.special[t] = Math.min(1, this.special[t] + dt / C.SPECIAL_FILL_TIME);
      HC.Abilities.update(this, dt);
      if (this.boss) this.boss.update(dt);
      this.updateCourtEvent(dt);
    }
    if (this.court.update) this.court.update(this, dt);

    // wind
    this.wind = this.windMut + this.windCourt + this.windBoss;
    if (Math.abs(this.wind) > 0.01) {
      for (const p of this.activePlayers()) { const k = p.grounded ? 0.06 : 0.16; for (const b of p.bodies) Matter.Body.setVelocity(b, { x: b.velocity.x + this.wind * k, y: b.velocity.y }); }
      for (const b of this.balls) if (!b.heldBy) Matter.Body.setVelocity(b.body, { x: b.body.velocity.x + this.wind * 0.1, y: b.body.velocity.y });
    }

    this.world.step(dt);
    this.world.updateNets(this.balls);
    this.updateBalls(dt);
    for (const c of this.cannons.slice()) { c.hcLife -= dt; if (c.hcLife <= 0) { this.world.removeBody(c); this.cannons.splice(this.cannons.indexOf(c), 1); } }

    // timers / state
    if (this.state === 'play' && this.timed) {
      const before = this.pointTime;
      this.pointTime -= dt;
      if (before > 3 && this.pointTime <= 3) HC.Audio.beep(true);
      if (this.pointTime <= 0) {
        const live = this.balls.some(b => b.shot && !b.heldBy && !b.shot.ground && b.shot.clock > 0);
        if (!live || this.pointTime < -2.5) this.shotClockExpired();
      }
    }
    if (this.gameClock != null && this.state === 'play' && !this.overtime) {
      const before = this.gameClock;
      this.gameClock = Math.max(0, this.gameClock - dt);
      if (before > 10 && this.gameClock <= 10) HC.Audio.beep(true);
      if (this.gameClock <= 0) {
        const live = this.balls.some(b => b.shot && !b.heldBy && !b.shot.ground);
        this.timeGrace = (this.timeGrace || 0) + dt;
        if (!live || this.timeGrace > 2.5) this.gameTimeUp();
      }
    }
    if (this.state === 'scored') { this.stateT -= dt; if (this.stateT <= 0) { this.state = 'post'; this.afterScore(); } }
    if (this.modeStep) this.modeStep(dt);

    // crowd excitement builds in close games and late in the point
    const closeness = this.boss ? 0.5 : 1 - Math.min(1, Math.abs(this.score[0] - this.score[1]) / Math.max(2, this.winScore * 0.6));
    const late = this.boss ? 0.5 : Math.max(this.score[0], this.score[1]) / this.winScore;
    const target = 0.15 + closeness * 0.35 + late * 0.3;
    this.excitement += (target - this.excitement) * dt * 0.8;
    HC.Audio.setCrowd(this.excitement);

    this.snap = this.snapshot();
    if (this.state === 'play' || this.state === 'scored') this.recorder.push(this.snap);
  }

  gameTimeUp() {
    HC.Audio.buzzer();
    const w = this.score[0] === this.score[1] ? -1 : (this.score[0] > this.score[1] ? 0 : 1);
    if (w >= 0) { this.fx.bigText("TIME'S UP!", '#ffde00', 1.5); this.finish(w); }
    else { this.overtime = true; this.fx.bigText('OVERTIME! NEXT BASKET WINS', '#ff5555', 2); HC.Audio.whistle(); }
  }

  shotClockExpired() {
    HC.Audio.buzzer();
    this.fx.bigText('SHOT CLOCK!', '#f44');
    for (const p of this.activePlayers()) p.setMood('sad', 1.5);
    this.state = 'scored'; this.stateT = 1.4; this.lastScore = null;
  }

  facingFor(p) {
    const holdTeam = this.balls.find(b => b.heldBy && b.heldBy.team === p.team);
    if (holdTeam || this.mode === 'horse') { const h = this.attackHoop(p.team); return Math.sign(h.x - p.x) || p.facing; }
    let target = null, bd = 1e9;
    for (const b of this.balls) { const d = Math.abs(b.x - p.x); if (d < bd) { bd = d; target = b; } }
    if (!target) return p.facing;
    const dx = target.x - p.x;
    return Math.abs(dx) > 30 ? Math.sign(dx) : p.facing;
  }

  updateCourtEvent(dt) {
    const ce = this.court.event, C = HC.CONFIG;
    if (!ce) return;
    if (!this.ev) {
      this.evTimer -= dt;
      if (this.evTimer <= C.EVENT_WARNING && !this.evWarn) { this.evWarn = {}; if (ce.prepare) ce.prepare(this, this.evWarn); HC.Audio.beep(true); }
      if (this.evTimer <= 0) {
        this.ev = this.evWarn || {}; this.evWarn = null; this.ev.t = 0;
        if (ce.start) ce.start(this, this.ev);
        this.fx.bigText(ce.icon + ' ' + ce.name.toUpperCase(), '#fff', 1.1);
      }
    } else {
      this.ev.t += dt;
      const p = Math.min(1, this.ev.t / ce.duration);
      if (ce.update) ce.update(this, dt, this.ev, p);
      if (p >= 1) { if (ce.end) ce.end(this, this.ev); this.ev = null; this.evTimer = HC.U.rand(...ce.every); }
    }
  }

  stepCards(dt) {
    const c = this.cards; c.t += dt;
    if (c.picked >= 0) {
      c.pickT -= dt;
      if (c.pickT <= 0) { const mut = c.list[c.picked]; this.fx.bigText(mut.icon + ' ' + mut.name.toUpperCase(), mut.color === '#111' ? '#f55' : '#fff', 1.2); this.nextPoint(mut); }
      return;
    }
    if (this.cpus[c.picker]) {
      c.cpuT -= dt; c.cycle += dt;
      if (c.cycle > 0.35) { c.cycle = 0; c.hl = (c.hl + 1) % 3; HC.Audio.select(); }
      if (c.cpuT <= 0) this.pickCard(HC.U.randInt(0, 2));
      return;
    }
    // one-button pick: highlight cycles, press to choose (or click/tap a card)
    c.cycle += dt;
    if (c.cycle > 0.9) { c.cycle = 0; c.hl = (c.hl + 1) % 3; HC.Audio.select(); }
    if (c.t > 0.6 && this.app.pressedTeam(c.picker)) this.pickCard(c.hl);
  }

  cardRects() {
    const w = 230, h = 320, gap = 40, x0 = HC.CONFIG.WIDTH / 2 - (w * 3 + gap * 2) / 2;
    return [0, 1, 2].map(i => ({ x: x0 + i * (w + gap), y: 220, w, h }));
  }

  click(x, y) {
    if (this.state === 'cards' && this.cards && !this.cpus[this.cards.picker]) {
      this.cardRects().forEach((r, i) => { if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) this.pickCard(i); });
    }
  }

  snapshot() {
    return {
      players: this.players.filter(p => !p.hidden).map(p => p.snapshot()),
      balls: this.balls.map(b => b.snapshot()),
      held: this.balls.map(b => !!b.heldBy),
      hoops: this.world.snapshotHoops(),
      floorAngle: this.floorAngle, lavaH: this.lavaH,
      dark: Math.max(this.darkMut, this.darkCourt),
      debris: this.debris.map(b => [b.position.x, b.position.y, b.angle, b.hcR, b.hcTemp]),
      cannons: this.cannons.map(b => [b.position.x, b.position.y]),
      wave: this.ev && this.court.id === 'beach' ? { front: this.ev.front, dir: this.ev.dir } : null,
      boss: this.boss ? this.boss.snapshot() : null,
    };
  }

  // ---------------- rendering ----------------
  render(ctx) {
    const C = HC.CONFIG;
    const s = this.state === 'replay' ? this.replay.frames[Math.floor(this.replay.i)] : (this.snap || this.snapshot());
    const t = this.time;
    ctx.save();
    const sh = this.fx.shakeOffset(); ctx.translate(sh.x, sh.y);
    this.court.drawBg(ctx, this, t);
    // floor
    ctx.save(); ctx.translate(C.WIDTH / 2, C.FLOOR_Y + 60); ctx.rotate(s.floorAngle); ctx.translate(0, -60);
    const fl = this.court.floor, g = ctx.createLinearGradient(0, 0, 0, 120);
    g.addColorStop(0, fl.top); g.addColorStop(1, fl.bottom); ctx.fillStyle = g; ctx.fillRect(-C.WIDTH, 0, C.WIDTH * 2, 200);
    if (this.court.drawFloorDetail) this.court.drawFloorDetail(ctx, t);
    const sheen = ctx.createLinearGradient(0, 0, 0, 70); sheen.addColorStop(0, 'rgba(255,255,255,0.22)'); sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen; ctx.fillRect(-C.WIDTH, 0, C.WIDTH * 2, 70);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-C.WIDTH, 0, C.WIDTH * 2, 3);
    ctx.strokeStyle = fl.line; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-C.WIDTH, 2); ctx.lineTo(C.WIDTH, 2); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 80); ctx.stroke();
    // 3pt lines
    if (this.mode !== 'horse') for (const hx of [C.HOOP_INSET, C.WIDTH - C.HOOP_INSET]) { const d = hx < C.WIDTH / 2 ? 1 : -1; const lx = hx + d * C.THREE_PT_DIST - C.WIDTH / 2; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 60); ctx.stroke(); }
    else { const lx = C.WIDTH - C.HOOP_INSET - C.THREE_PT_DIST - C.WIDTH / 2; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 60); ctx.stroke(); }
    ctx.restore();

    if (this.drawUnder) this.drawUnder(ctx, s);
    for (const h of s.hoops) HC.drawHoop(ctx, h);
    if (s.wave && this.court.event.draw) this.court.event.draw(ctx, this, s.wave);
    for (const d of s.debris) drawRock(ctx, d);
    for (const c of s.cannons) { ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(c[0], c[1], 12, 0, 7); ctx.fill(); ctx.strokeStyle = '#f33'; ctx.lineWidth = 2; ctx.stroke(); }
    if (s.boss) this.boss.drawBack(ctx, s.boss);
    for (const p of s.players) HC.drawPlayer(ctx, p);
    if (this.state !== 'replay') HC.Abilities.draw(ctx, this);
    for (const b of s.balls) { const h = Math.max(0, C.FLOOR_Y - b[1]); if (h < 420) { const k = 1 - h / 420; ctx.fillStyle = 'rgba(0,0,0,' + (0.3 * k) + ')'; ctx.beginPath(); ctx.ellipse(b[0], C.FLOOR_Y + 2, b[3] * (0.6 + k * 0.6), 4 * k + 1, 0, 0, 7); ctx.fill(); } }
    s.balls.forEach((b) => HC.drawBall(ctx, b));
    if (this.court.drawFg) this.court.drawFg(ctx, this, t);
    if (s.boss) this.boss.drawFront(ctx, s.boss);
    this.fx.draw(ctx);
    // darkness: only the ball and rims glow
    if (s.dark > 0.01) {
      ctx.fillStyle = 'rgba(0,0,0,' + (0.94 * s.dark) + ')'; ctx.fillRect(-50, -50, C.WIDTH + 100, C.HEIGHT + 100);
      ctx.globalAlpha = s.dark;
      for (const h of s.hoops) HC.drawHoop(ctx, h, { glow: true, noPole: true });
      for (const b of s.balls) HC.drawBall(ctx, b, { glow: true });
      ctx.globalAlpha = 1;
    }
    // speech bubbles
    for (const p of s.players) if (p.bubble) drawBubble(ctx, p);
    ctx.restore();
    if (this.opts.demo) return;
    if (HC.Admin && HC.Admin.get('debug', false)) HC.Admin.drawDebug(ctx, this);
    HC.UI.drawHUD(ctx, this, s);
    if (this.state !== 'cards') this.fx.drawScreen(ctx);
  }
};

function drawRock(ctx, d) {
  ctx.save(); ctx.translate(d[0], d[1]); ctx.rotate(d[2]);
  ctx.fillStyle = d[4] ? '#8a5a3a' : '#7b8494'; ctx.strokeStyle = '#2d3138'; ctx.lineWidth = 2;
  ctx.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; ctx.lineTo(Math.cos(a) * d[3], Math.sin(a) * d[3]); } ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(d[3] * 0.3, -d[3] * 0.2, d[3] * 0.25, 0, 7); ctx.fill();
  if (d[4]) { ctx.rotate(-d[2]); ctx.fillStyle = 'rgba(255,150,0,0.5)'; ctx.beginPath(); ctx.moveTo(-d[3], 0); ctx.lineTo(0, -d[3] * 3); ctx.lineTo(d[3], 0); ctx.fill(); }
  ctx.restore();
}

function drawBubble(ctx, snap) {
  const hx = snap.d[3], hy = snap.d[4], r = snap.p.dims.hr;
  const text = HC.cleanText ? HC.cleanText(snap.bubble).toUpperCase() : snap.bubble;
  if (!text) return;
  ctx.save();
  ctx.font = HC.dfont(17);
  const w = ctx.measureText(text).width + 22, h = 26;
  const x = HC.U.clamp(hx - w / 2, 4, HC.CONFIG.WIDTH - w - 4), y = Math.max(40, hy - r - 54);
  ctx.fillStyle = 'rgba(9,12,20,0.88)';
  ctx.beginPath(); ctx.moveTo(x + 7, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 7, y + h); ctx.lineTo(hx + 6, y + h); ctx.lineTo(hx, y + h + 7); ctx.lineTo(hx - 4, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = snap.p.colors.main; ctx.fillRect(x + 7, y, w - 7, 2);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

// =====================================================================
//  HORSE / TRICK MODE  (1v1, turn based, one hoop, no defender)
// =====================================================================
HC.HorseMatch = class HorseMatch extends HC.Match {
  constructor(app, opts) {
    opts.mutators = false;
    super(app, opts);
  }

  resetPoint(first) {
    if (first) {
      this.word = (this.opts.word || 'HORSE').toUpperCase();
      this.letters = [0, 0]; this.setter = 0; this.phase = 'set'; this.required = null;
      this.timed = false;
    }
    super.resetPoint(first);
    this.world.hoops[0].visible = false;
    this.world.placeHoop(this.world.hoops[0], 0, -3000);
    this.attempt = { shooter: this.shooterTeam(), shot: false, t: 12, after: 0, done: false, trail: [], made: false };
    this.horseMsg = this.phase === 'set' ? (this.teams[this.attempt.shooter].name + ': SET A SHOT') : (this.teams[this.attempt.shooter].name + ': MATCH IT!');
  }

  shooterTeam() { return this.phase === 'set' ? this.setter : 1 - this.setter; }

  spawnList() {
    const C = HC.CONFIG, team = this.shooterTeam ? this.shooterTeam() : 0;
    let x;
    if (this.phase === 'match' && this.required) x = this.required.x;
    else x = HC.U.rand(330, 880);
    if (!this.teams) return [];
    return [{ team, slot: 0, char: this.teams[team].chars[0], x }];
  }

  spawnBalls() {
    const p = this.players[0];
    const b = new HC.Ball(this.world, p.x, p.y - 80, this.mods);
    b.skin = this.ballSkin;
    b.spawn = { x: p.x, y: p.y - 80 };
    this.balls.push(b);
    this.pendingGrab = b;
  }

  canGrab() { return !this.attempt || !this.attempt.shot; }

  step(dt) {
    if (this.state === 'countdown' && this.pendingGrab) {
      const p = this.players[0];
      this.grab(this.pendingGrab, p); this.pendingGrab = null;
    }
    super.step(dt);
  }

  modeStep(dt) {
    const a = this.attempt;
    if (this.state !== 'play' || a.done) return;
    a.t -= dt;
    if (a.shot) {
      a.after += dt;
      const b = this.balls[0];
      if (this.world.frame % 3 === 0) a.trail.push([b.x, b.y]);
      if ((b.shot && b.shot.ground) || a.after > 5 || (!b.shot && a.after > 0.3 && !b.heldBy)) this.horseResult(false, []);
    } else if (a.t <= 0) { this.fx.bigText('TOO SLOW!', '#f44'); this.horseResult(false, []); }
  }

  onShot(ball, p) {
    const a = this.attempt; a.shot = true; a.x = p.x; a.after = 0;
    a.pose = p.snapshot(); a.pose.ghost = true; a.pose.bubble = null;
  }

  onHorseBasket(ball, hoop) {
    if (!this.attempt.shot && !ball.heldBy) return;
    if (!this.attempt.shot) { this.attempt.shot = true; this.attempt.x = ball.heldBy.x; }
    const tricks = HC.Tricks.detect(this, ball, hoop).filter(t => t !== 'buzzer');
    if (ball.heldBy) this.dropBall(ball, false);
    hoop.glow = 1; HC.Audio.swish();
    this.fx.burst(hoop.x, hoop.y + 20, 25, ['#fff', '#ff0'], 5, 0.7);
    if (tricks.includes('dunk')) { this.fx.shake(HC.CONFIG.SHAKE_DUNK); this.hitPause = HC.CONFIG.HITPAUSE_FRAMES; }
    this.attempt.trail.push([ball.x, ball.y]);
    this.horseResult(true, tricks);
  }

  horseResult(made, tricks) {
    const a = this.attempt; if (a.done) return;
    a.done = true;
    const U = HC.U, shooter = a.shooter, p = this.players[0];
    let msg = '', col = '#fff', letterTo = -1;
    if (this.phase === 'set') {
      if (made) {
        this.required = { x: a.x, tricks, trail: a.trail.slice(), pose: a.pose };
        const lbl = tricks.length ? HC.Tricks.label(tricks).replace('!', '') : 'SHOT';
        msg = 'MATCH THIS ' + lbl + '!'; col = '#5f5'; this.phase = 'match';
        p.stats.makes++; p.stats.points += 1; for (const t of tricks) p.stats.tricks[t] = (p.stats.tricks[t] || 0) + 1;
        p.setMood('happy', 2); p.say(U.pick(HC.SAY.score), 1.5); HC.Audio.cheer();
        if (tricks.length) HC.Audio.trick();
      } else {
        msg = 'MISSED! TURN PASSES'; col = '#f88'; this.setter = 1 - this.setter; this.required = null;
        p.setMood('sad', 2); HC.Audio.groan();
      }
    } else {
      const req = this.required;
      const spotOk = Math.abs(a.x - req.x) < 90;
      const missing = req.tricks.filter(t => !tricks.includes(t));
      if (made && spotOk && !missing.length) {
        msg = 'MATCHED IT!'; col = '#5f5'; p.setMood('happy', 2); p.say('copied!', 1.5); HC.Audio.cheer();
        p.stats.makes++; for (const t of tricks) p.stats.tricks[t] = (p.stats.tricks[t] || 0) + 1;
      } else {
        letterTo = shooter;
        this.letters[shooter]++;
        const L = this.word[this.letters[shooter] - 1];
        msg = (made ? (!spotOk ? 'WRONG SPOT! ' : 'NEEDED ' + missing.map(t => HC.trickById(t).noun).join(' + ') + '! ') : 'MISSED! ') + '"' + L + '"';
        col = '#f55'; p.setMood('sad', 2); p.say(U.pick(HC.SAY.scoredOn), 1.5); HC.Audio.groan();
      }
      this.phase = 'set'; this.required = null;
    }
    this.fx.bigText(msg, col, 1.6);
    this.state = 'scored'; this.stateT = 2.2; this.lastScore = null;
    this.horseLost = this.letters.findIndex(n => n >= this.word.length);
  }

  afterScore() {
    if (this.horseLost >= 0) { this.finish(1 - this.horseLost); return; }
    this.resetPoint(false);
  }

  winner() { return this.horseLost >= 0 ? 1 - this.horseLost : -1; }

  drawUnder(ctx) {
    const C = HC.CONFIG;
    if (this.phase === 'match' && this.required) {
      const r = this.required, pulse = 0.5 + Math.sin(this.time * 6) * 0.3;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,0,' + pulse + ')'; ctx.beginPath(); ctx.ellipse(r.x, C.FLOOR_Y + 2, 70, 12, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#ff0'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(r.x - 90, C.FLOOR_Y - 4); ctx.lineTo(r.x - 90, C.FLOOR_Y - 30); ctx.moveTo(r.x + 90, C.FLOOR_Y - 4); ctx.lineTo(r.x + 90, C.FLOOR_Y - 30); ctx.stroke();
      ctx.setLineDash([]);
      if (r.pose) HC.drawPlayer(ctx, r.pose, { noUi: true });
      ctx.globalAlpha = 0.45; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([4, 8]);
      ctx.beginPath(); r.trail.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
      // ghost ball replays A's shot
      if (r.trail.length) { const k = Math.floor((this.time * 20) % (r.trail.length + 15)); if (k < r.trail.length) { ctx.fillStyle = 'rgba(255,160,60,0.6)'; ctx.beginPath(); ctx.arc(r.trail[k][0], r.trail[k][1], 15, 0, 7); ctx.fill(); } }
      ctx.restore();
      ctx.fillStyle = '#ff0'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SHOOT FROM HERE', r.x, C.FLOOR_Y + 30);
      if (r.tricks.length) ctx.fillText('MUST BE: ' + r.tricks.map(t => HC.trickById(t).noun).join(' + '), r.x, C.FLOOR_Y + 50);
    }
  }
};

// =====================================================================
//  TOURNAMENT LADDER (8 teams: you + 7 CPU teams)
// =====================================================================
HC.CPU_TEAMS = [
  { name: 'The Wobblers', colors: { main: '#8e44ad', alt: '#f1c40f' }, chars: ['noodle', 'blob'] },
  { name: 'Lava Lords', colors: { main: '#c0392b', alt: '#222' }, chars: ['bolt', 'rex'] },
  { name: 'Moon Bouncers', colors: { main: '#5d6dbe', alt: '#fff' }, chars: ['pip', 'blob'] },
  { name: 'Granny Gang', colors: { main: '#d977b8', alt: '#fff' }, chars: ['nana', 'nana'] },
  { name: 'Rust Buckets', colors: { main: '#a0522d', alt: '#ddd' }, chars: ['bolt', 'bolt'] },
  { name: 'Jelly Jammers', colors: { main: '#27ae60', alt: '#ff0' }, chars: ['blob', 'pip'] },
  { name: 'Sky Rockets', colors: { main: '#e67e22', alt: '#fff' }, chars: ['rex', 'noodle'] },
  { name: 'Noodle Factory', colors: { main: '#f1c40f', alt: '#333' }, chars: ['noodle', 'noodle'] },
  { name: 'Tiny Terrors', colors: { main: '#16a085', alt: '#fff' }, chars: ['pip', 'pip'] },
];

HC.UPGRADES = [
  { id: 'jump', name: 'Spring Shoes', icon: '👟', color: '#2ecc71', desc: '+10% jump height', apply(u) { u.jumpMul = (u.jumpMul || 1) * (1 + HC.CONFIG.UPGRADE_JUMP); } },
  { id: 'sticky', name: 'Sticky Hands', icon: '🍯', color: '#f39c12', desc: 'Much harder to steal from', apply(u) { u.sticky = Math.min(0.9, (u.sticky || 0) + HC.CONFIG.UPGRADE_STICKY); } },
  { id: 'windup', name: 'Quick Wind-Up', icon: '⚡', color: '#3498db', desc: 'Charge jumps 20% faster', apply(u) { u.windupMul = (u.windupMul || 1) * (1 + HC.CONFIG.UPGRADE_WINDUP); } },
  { id: 'aim', name: 'Laser Sights', icon: '🎯', color: '#e74c3c', desc: '+30% shot accuracy', apply(u) { u.accuracyMul = (u.accuracyMul || 1) * 1.3; } },
  { id: 'anchor', name: 'Heavy Boots', icon: '⚓', color: '#7f8c8d', desc: 'Harder to knock over', apply(u) { u.stability = (u.stability || 1) * 1.35; } },
];

HC.Tournament = class Tournament {
  constructor(playerTeam) {
    const cpu = HC.U.shuffle(HC.CPU_TEAMS).slice(0, 7).map(t => Object.assign({}, t));
    this.teams = [playerTeam].concat(cpu);
    playerTeam.upgrades = {};
    this.upgradeNames = {};
    this.rounds = [[[0, 1], [2, 3], [4, 5], [6, 7]]];
    this.results = [[]];
    this.round = 0; this.done = false; this.champion = null;
  }
  opponent() { const pr = this.rounds[this.round][0]; return pr[0] === 0 ? pr[1] : pr[0]; }
  difficulty() { return HC.CONFIG.TOURNAMENT_ROUND_DIFFICULTY[this.round]; }
  addUpgrade(u) { u.apply(this.teams[0].upgrades); this.upgradeNames[u.name] = (this.upgradeNames[u.name] || 0) + 1; }
  upgradeChoices() { return HC.U.shuffle(HC.UPGRADES).slice(0, 3); }
  // record the player's match, simulate the rest of the round and build the next one
  record(playerWon, score) {
    const r = this.round, pairs = this.rounds[r];
    const opp = this.opponent();
    this.results[r][0] = { winner: playerWon ? 0 : opp, score: pairs[0][0] === 0 ? score : [score[1], score[0]] };
    for (let i = 1; i < pairs.length; i++) {
      const win = HC.U.randInt(0, 1), ws = HC.App.settings.winScore, ls = HC.U.randInt(0, ws - 1);
      this.results[r][i] = { winner: pairs[i][win], score: win === 0 ? [ws, ls] : [ls, ws] };
    }
    if (!playerWon) { this.done = true; this.finish(r); return 'lost'; }
    if (r === 2) { this.done = true; this.champion = 0; return 'champion'; }
    const winners = this.results[r].map(x => x.winner);
    const next = [];
    for (let i = 0; i < winners.length; i += 2) next.push([winners[i], winners[i + 1]]);
    this.rounds.push(next); this.results.push([]); this.round++;
    return 'next';
  }
  finish(r) {
    // simulate the remaining bracket so it fills in
    let cur = r;
    while (cur < 2) {
      const winners = this.results[cur].map(x => x.winner), next = [];
      for (let i = 0; i < winners.length; i += 2) next.push([winners[i], winners[i + 1]]);
      cur++; this.rounds[cur] = next; this.results[cur] = next.map(pr => { const w = HC.U.randInt(0, 1), ws = HC.App.settings.winScore, ls = HC.U.randInt(0, ws - 1); return { winner: pr[w], score: w === 0 ? [ws, ls] : [ls, ws] }; });
    }
    this.champion = this.results[2][0].winner;
  }
};
