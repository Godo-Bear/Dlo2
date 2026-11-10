// Character abilities (active specials).
// Each team has a SPECIAL meter that fills during play. When it's full, HOLD your button past a full
// wind-up (the meter turns pink and says SPECIAL!) and release: every player on your team fires
// their own character's ability. Add a new ability by adding an entry here and setting
// `ability: '<id>'` on a character in players.js.
window.HC = window.HC || {};

(function () {
  const U = () => HC.U;
  const opponents = (m, p) => m.activePlayers().filter(o => o.team !== p.team);
  const nearestBall = (m, p) => { let best = null, bd = 1e9; for (const b of m.balls) { const d = Math.hypot(b.x - p.x, b.y - p.y); if (d < bd) { bd = d; best = b; } } return best; };

  HC.ABILITIES = {
    stretch: { name: 'Noodle Arms', icon: '🦒', desc: 'Arms stretch to double length for 6s.',
      activate(m, p) { p.setArmScale(1.9); p.addBuff('stretch', 6, () => p.setArmScale(1)); } },
    superhop: { name: 'Super Hop', icon: '🐇', desc: 'Next jump is 30% higher and floaty.',
      activate(m, p) { p.addBuff('superhop', 4); p.addBuff('float', 2.2); } },
    magnet: { name: 'Ball Magnet', icon: '🧲', desc: 'Pulls the ball to Bolt for 4s - even out of hands.',
      activate(m, p) { p.addBuff('magnet', 4); } ,
      tick(m, p) {
        const b = nearestBall(m, p); if (!b || (b.heldBy && b.heldBy.team === p.team)) return;
        const h = p.handPos(), dx = h.x - b.x, dy = h.y - b.y, d = Math.hypot(dx, dy) || 1;
        if (b.heldBy && d < 170 && !b.heldBy.has('shield') && !b.heldBy.has('phase')) { m.dropBall(b, false); m.grab(b, p); return; }
        if (!b.heldBy) Matter.Body.setVelocity(b.body, { x: b.body.velocity.x * 0.96 + dx / d * 0.9, y: b.body.velocity.y * 0.96 + dy / d * 0.9 });
      } },
    sureshot: { name: 'Sure Shot', icon: '🎯', desc: 'Your next shot within 8s flies perfectly.',
      activate(m, p) { p.addBuff('sure', 8); } },
    groundpound: { name: 'Jelly Quake', icon: '💥', desc: 'Shockwave knocks nearby rivals flying.',
      activate(m, p) {
        HC.Audio.stomp(); m.fx.shake(14); m.fx.ring(p.x, p.feetY(), '#77d968');
        for (const o of opponents(m, p)) { const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < 280) o.knockDown(Math.sign(o.x - p.x || 1) * 9 * (1 - d / 340), -8, 1.1); }
      } },
    afterburner: { name: 'Afterburner', icon: '🔥', desc: 'Unlimited jetpack boosts for 4s.',
      activate(m, p) { p.addBuff('afterburner', 4); p.setVel(p.facing * 4, -8, 0.4); HC.Audio.jet(); } },
    quake: { name: 'Earthquake', icon: '🌋', desc: 'Every rival on the ground gets knocked down.',
      activate(m, p) {
        HC.Audio.stomp(); m.fx.shake(24); m.fx.ring(p.x, HC.CONFIG.FLOOR_Y, '#c98b5b');
        for (const o of opponents(m, p)) if (o.feetY() > HC.CONFIG.FLOOR_Y - 60) o.knockDown(Math.sign(o.x - p.x || 1) * 4, -9, 1.2);
      } },
    wall: { name: 'Block Wall', icon: '🧱', desc: 'A force field guards your hoop for 5s.',
      activate(m, p) {
        const h = m.defendHoop(p.team);
        const body = Matter.Bodies.rectangle(h.x, h.y - 55, 120, 14, { isStatic: true, label: 'blocker', restitution: 0.8, collisionFilter: { category: HC.CAT.BLOCKER, mask: HC.CAT.BALL } });
        m.world.addBody(body); m.effects.push({ type: 'wall', body, t: 5, team: p.team, hoop: h });
        HC.Audio.zap();
      } },
    slime: { name: 'Slime Pit', icon: '🟢', desc: 'Rivals are slimed and slowed for 5s.',
      activate(m, p) { HC.Audio.slime(); for (const o of opponents(m, p)) { o.slow = 5; m.fx.burst(o.x, o.feetY() - 10, 12, ['#5c4', '#3a2', '#9f6'], 4, 0.6); } } },
    thunder: { name: 'Thunder Call', icon: '⚡', desc: 'Lightning strikes the rival nearest the ball.',
      activate(m, p) {
        const b = m.mainBall(); let target = null, bd = 1e9;
        for (const o of opponents(m, p)) { const d = Math.hypot(o.x - b.x, o.y - b.y); if (d < bd) { bd = d; target = o; } }
        HC.Audio.zap(); m.fx.shake(12);
        if (target) { m.effects.push({ type: 'bolt', x: target.x, y: target.y, t: 0.35 }); target.knockDown(0, -7, 1.2); target.stunT = 1.2; }
      } },
    turbo: { name: 'Turbo', icon: '⚡', desc: 'Double-speed wind-up and long jumps for 5s.',
      activate(m, p) { p.addBuff('turbo', 5); } },
    freeze: { name: 'Deep Freeze', icon: '❄️', desc: 'Rivals are frozen solid for 2.5s.',
      activate(m, p) {
        HC.Audio.zap();
        for (const o of opponents(m, p)) { if (o.has('shield')) continue; o.addBuff('frozen', 2.5); o.say(HC.U.pick(['brrr!', 'c-c-cold!']), 1.2); if (o.ball) m.dropBall(o.ball, true); }
      } },
    teleport: { name: 'Blink', icon: '✨', desc: 'With the ball: warp under the hoop. Without: warp to the ball.',
      activate(m, p) {
        const C = HC.CONFIG;
        m.fx.burst(p.x, p.y, 20, ['#c77dff', '#fff', '#7b2cbf'], 5, 0.6);
        if (p.ball) { const h = m.attackHoop(p.team); p.teleport(h.x + (h.x > C.WIDTH / 2 ? -150 : 150), C.FLOOR_Y - p.dims.lh - p.dims.th / 2 - 6); }
        else { const b = nearestBall(m, p); if (b) { p.teleport(HC.U.clamp(b.x - p.facing * 30, 60, C.WIDTH - 60), Math.min(C.FLOOR_Y - p.dims.lh - p.dims.th / 2 - 6, b.y + 30)); if (!b.heldBy) m.grab(b, p); } }
        m.fx.burst(p.x, p.y, 20, ['#c77dff', '#fff', '#7b2cbf'], 5, 0.6);
        HC.Audio.zap();
      } },
    shield: { name: 'Hero Shield', icon: '🛡️', desc: "Can't be knocked down or stripped for 6s.",
      activate(m, p) { p.addBuff('shield', 6); } },
    phase: { name: 'Phase Out', icon: '👻', desc: 'Float through rivals and keep the ball safe for 5s.',
      activate(m, p) { p.setPhase(true); p.addBuff('phase', 5, () => p.setPhase(false)); p.addBuff('float', 1.5); } },
  };
  HC.abilityOf = (def) => HC.ABILITIES[def.ability] || null;

  HC.Abilities = {
    activate(m, p) {
      const a = HC.abilityOf(p.def); if (!a) return;
      a.activate(m, p);
      m.fx.popup(a.icon + ' ' + a.name.toUpperCase(), p.x, p.y - p.dims.th - 40, '#ffd23f', 26, 1.4);
    },
    // per-frame upkeep: buff ticks and match-level effects
    update(m, dt) {
      for (const p of m.activePlayers()) {
        if (p.has('magnet')) HC.ABILITIES.magnet.tick(m, p);
      }
      for (const e of m.effects) {
        e.t -= dt;
        if (e.t <= 0 && e.body) m.world.removeBody(e.body);
      }
      m.effects = m.effects.filter(e => e.t > 0);
    },
    clear(m) { for (const e of m.effects || []) if (e.body) m.world.removeBody(e.body); m.effects = []; },
    draw(ctx, m) {
      for (const e of m.effects) {
        if (e.type === 'wall') {
          const b = e.body.position, a = 0.6 + Math.sin(m.time * 14) * 0.25;
          ctx.save(); ctx.shadowColor = '#5ff'; ctx.shadowBlur = 18;
          ctx.fillStyle = 'rgba(90,240,255,' + a * 0.5 + ')'; ctx.strokeStyle = 'rgba(180,255,255,' + a + ')'; ctx.lineWidth = 3;
          HC.rr(ctx, b.x - 60, b.y - 7, 120, 14, 7); ctx.fill(); ctx.stroke(); ctx.restore();
        } else if (e.type === 'bolt') {
          ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.shadowColor = '#8cf'; ctx.shadowBlur = 20;
          ctx.beginPath(); let x = e.x, y = 0; ctx.moveTo(x, y); while (y < e.y) { y += 40; x += HC.U.rand(-22, 22); ctx.lineTo(x, y); } ctx.stroke(); ctx.restore();
        }
      }
    },
  };
})();
