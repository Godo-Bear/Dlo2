// Living courts. Each court is ONE data object: theme + physics tweaks + a live event.
// Add a court by pushing another object into HC.COURTS.
//   gravity / floorFriction / mods  -> physics tweaks
//   drawBg(ctx, m, t)               -> background (static parts are cached)
//   floor: { top, bottom, line }    -> floor colors; drawFloorDetail(ctx) draws in floor space
//   init(m) / update(m, dt)         -> continuous behaviour
//   event: { name, icon, every:[min,max], duration, start, update, end, draw }
window.HC = window.HC || {};

(function () {
  const W = () => HC.CONFIG.WIDTH, FY = () => HC.CONFIG.FLOOR_Y;

  function cached(court, draw) {
    if (!court._bg) {
      const c = document.createElement('canvas'); c.width = HC.CONFIG.WIDTH; c.height = HC.CONFIG.HEIGHT;
      draw(c.getContext('2d')); court._bg = c;
    }
    return court._bg;
  }
  function sky(ctx, a, b) { const g = ctx.createLinearGradient(0, 0, 0, HC.CONFIG.HEIGHT); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, HC.CONFIG.WIDTH, HC.CONFIG.HEIGHT); }
  function crowd(ctx, m, t, y0, rows, colors) {
    const ex = m ? m.excitement : 0.2;
    for (let r = 0; r < rows; r++) for (let i = 0; i < 46; i++) {
      const x = 20 + i * 27 + (r % 2) * 13, bob = Math.max(0, Math.sin(t * (4 + ex * 8) + i * 1.7 + r)) * (2 + ex * 9);
      ctx.fillStyle = colors[(i * 7 + r * 3) % colors.length];
      const y = y0 + r * 30 - bob;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); ctx.fillRect(x - 9, y + 7, 18, 16);
      if (ex > 0.6 && (i + r) % 3 === 0) { ctx.fillRect(x - 10, y - 14 - bob, 4, 12); ctx.fillRect(x + 6, y - 14 - bob, 4, 12); }
    }
  }
  function arrow(ctx, x, y, dir, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.fillStyle = col || '#ff0'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-40, -12); ctx.lineTo(10, -12); ctx.lineTo(10, -28); ctx.lineTo(42, 0); ctx.lineTo(10, 28); ctx.lineTo(10, 12); ctx.lineTo(-40, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  HC.drawArrow = arrow;

  HC.COURTS = [
    // ------------------------------------------------------------ GYM
    { id: 'gym', name: 'School Gym', icon: '🏫', desc: 'The floor tilts like a seesaw every 15 seconds.',
      floor: { top: '#d9a35c', bottom: '#a8743a', line: '#fff' }, floorFriction: 0.9,
      drawBg(ctx, m, t) {
        ctx.drawImage(cached(this, (c) => {
          sky(c, '#151b27', '#2a3242');
          // rafters + arena lights
          c.fillStyle = '#0d1119'; c.fillRect(0, 0, W(), 70);
          c.strokeStyle = '#1c2230'; c.lineWidth = 4; for (let x = -40; x < W(); x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 80, 70); c.moveTo(x + 80, 0); c.lineTo(x, 70); c.stroke(); }
          for (let i = 0; i < 6; i++) { const lx = 110 + i * 212; const lg = c.createRadialGradient(lx, 70, 4, lx, 70, 160); lg.addColorStop(0, 'rgba(255,240,210,0.35)'); lg.addColorStop(1, 'rgba(255,240,210,0)'); c.fillStyle = lg; c.fillRect(lx - 160, 60, 320, 200); c.fillStyle = '#fff6e0'; c.fillRect(lx - 18, 66, 36, 6); }
          // championship banners
          [['2019', '#1d3a6e'], ['2021', '#5c1a1a'], ['2023', '#1d3a6e'], ['2024', '#5c1a1a']].forEach(([yr, col], i) => {
            const bx = 230 + i * 250 + (i > 1 ? 120 : 0); c.fillStyle = col; c.beginPath(); c.moveTo(bx, 72); c.lineTo(bx + 70, 72); c.lineTo(bx + 70, 170); c.lineTo(bx + 35, 186); c.lineTo(bx, 170); c.fill();
            c.fillStyle = '#d8b25a'; c.fillRect(bx + 8, 80, 54, 3); c.fillRect(bx + 8, 150, 54, 2);
            c.font = 'italic 800 22px "Barlow Condensed", Arial Narrow, sans-serif'; c.textAlign = 'center'; c.fillText(yr, bx + 35, 128); c.font = '700 9px Inter, Arial, sans-serif'; c.fillText('CHAMPIONS', bx + 35, 104);
          });
          // jumbotron
          c.fillStyle = '#05070b'; c.fillRect(540, 92, 200, 104); c.strokeStyle = '#2a3242'; c.lineWidth = 3; c.strokeRect(540, 92, 200, 104);
          c.fillStyle = '#0d1420'; c.fillRect(550, 102, 180, 84); c.fillStyle = '#ff6a13'; c.fillRect(550, 102, 180, 3);
          c.fillStyle = '#e8edf5'; c.font = 'italic 800 34px "Barlow Condensed", Arial Narrow, sans-serif'; c.textAlign = 'center'; c.fillText('HOOP CHAOS', 640, 158);
          // stands
          c.fillStyle = '#1e2533'; c.fillRect(0, 300, W(), 340);
          for (let i = 0; i < 5; i++) { c.fillStyle = '#161b26'; c.fillRect(0, 330 + i * 60, W(), 8); }
          c.fillStyle = '#0f131b'; c.fillRect(0, 296, W(), 6);
        }), 0, 0);
        crowd(ctx, m, t, 340, 5, ['#3b4458', '#2b3243', '#4a546a', '#566079', '#30384a', '#7a2a2a', '#23406e', '#8c95a8']);
      },
      drawFloorDetail(ctx) { ctx.strokeStyle = 'rgba(90,50,10,0.35)'; ctx.lineWidth = 2; for (let x = -800; x < 800; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 200); ctx.stroke(); } },
      event: { name: 'Seesaw!', icon: '⚖️', every: [15, 15], duration: 5,
        start(m, ev) { ev.dir = Math.random() < 0.5 ? -1 : 1; HC.Audio.whistle(); },
        update(m, dt, ev, p) { m.setFloorAngle(ev.dir * 0.13 * Math.sin(Math.PI * p)); },
        end(m) { m.setFloorAngle(0); } } },

    // ------------------------------------------------------------ ROOFTOP
    { id: 'rooftop', name: 'Rooftop', icon: '🌆', desc: 'Wind gusts push players and the ball sideways.',
      floor: { top: '#6b6f78', bottom: '#45484f', line: '#ffcc00' }, floorFriction: 0.85,
      drawBg(ctx, m, t) {
        ctx.drawImage(cached(this, (c) => {
          sky(c, '#0d1b3e', '#d9566b');
          for (let i = 0; i < 80; i++) { c.fillStyle = 'rgba(255,255,255,' + Math.random() * 0.8 + ')'; c.fillRect(Math.random() * W(), Math.random() * 250, 2, 2); }
          c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(1000, 110, 40, 0, 7); c.fill();
          for (let i = 0; i < 26; i++) {
            const bw = 40 + (i * 37) % 60, bh = 120 + (i * 83) % 260, x = i * 52 - 20;
            c.fillStyle = i % 2 ? '#1b2238' : '#232c48'; c.fillRect(x, FY() - bh, bw, bh);
            c.fillStyle = 'rgba(255,220,120,0.7)';
            for (let wy = FY() - bh + 10; wy < FY() - 20; wy += 18) for (let wx = x + 6; wx < x + bw - 8; wx += 12) if ((wx * 7 + wy * 3) % 5 < 2) c.fillRect(wx, wy, 5, 8);
          }
          c.fillStyle = '#555'; c.fillRect(150, FY() - 120, 60, 80); c.fillRect(160, FY() - 40, 6, 40); c.fillRect(195, FY() - 40, 6, 40);
        }), 0, 0);
        const w = m ? m.wind : 0;
        if (Math.abs(w) > 0.05) {
          ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.6, Math.abs(w) * 0.6) + ')'; ctx.lineWidth = 2;
          for (let i = 0; i < 30; i++) { const y = (i * 53) % 600 + 20, x = ((t * 900 * Math.sign(w) + i * 211) % (W() + 200) + W() + 200) % (W() + 200) - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.sign(w) * 60, y); ctx.stroke(); }
        }
      },
      drawFloorDetail(ctx) { ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let x = -800; x < 800; x += 90) ctx.fillRect(x, 4, 3, 200); },
      event: { name: 'Wind Gust!', icon: '💨', every: [7, 11], duration: 3.5, arrow: true,
        start(m, ev) { HC.Audio.wind(); },
        prepare(m, ev) { ev.dir = Math.random() < 0.5 ? -1 : 1; },
        update(m, dt, ev, p) { m.windCourt = ev.dir * Math.sin(Math.PI * p) * 1.2; },
        end(m) { m.windCourt = 0; } } },

    // ------------------------------------------------------------ BEACH
    { id: 'beach', name: 'Sunny Beach', icon: '🏝️', desc: 'Sand slows you down. Waves wash in and knock players over.',
      floor: { top: '#f2d48a', bottom: '#d6b062', line: '#fff6' }, floorFriction: 1, mods: { groundDrag: 0.05, jumpForwardMul: 0.78 },
      drawBg(ctx, m, t) {
        ctx.drawImage(cached(this, (c) => {
          sky(c, '#4fc3f7', '#c8f1ff');
          c.fillStyle = '#ffe066'; c.beginPath(); c.arc(220, 120, 60, 0, 7); c.fill();
          c.fillStyle = '#1e88c7'; c.fillRect(0, 420, W(), 230);
          c.fillStyle = 'rgba(255,255,255,0.4)'; for (let i = 0; i < 30; i++) c.fillRect((i * 97) % W(), 440 + (i * 31) % 150, 40, 3);
          for (const px of [80, 1180]) { c.strokeStyle = '#7a4f24'; c.lineWidth = 14; c.beginPath(); c.moveTo(px, FY()); c.quadraticCurveTo(px + 30, 450, px + 10, 330); c.stroke();
            c.fillStyle = '#2e9e4e'; for (let a = 0; a < 6; a++) { c.beginPath(); c.ellipse(px + 10 + Math.cos(a) * 50, 330 + Math.sin(a) * 18, 60, 14, a, 0, 7); c.fill(); } }
        }), 0, 0);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let i = 0; i < 6; i++) { const x = (t * 30 + i * 230) % (W() + 100) - 50; ctx.beginPath(); ctx.ellipse(x, 430 + Math.sin(t + i) * 4, 50, 5, 0, 0, 7); ctx.fill(); }
      },
      drawFloorDetail(ctx) { ctx.fillStyle = 'rgba(160,120,50,0.25)'; for (let i = 0; i < 120; i++) ctx.fillRect(((i * 137) % 1600) - 800, (i * 23) % 80 + 5, 4, 3); },
      event: { name: 'Big Wave!', icon: '🌊', every: [9, 13], duration: 2.8, arrow: true,
        prepare(m, ev) { ev.dir = Math.random() < 0.5 ? -1 : 1; },
        start(m, ev) { ev.hit = new Set(); HC.Audio.splash(); },
        update(m, dt, ev, p) {
          ev.front = ev.dir > 0 ? -100 + p * (W() + 200) : W() + 100 - p * (W() + 200);
          for (const pl of m.activePlayers()) {
            if (ev.hit.has(pl)) continue;
            if (Math.abs(pl.x - ev.front) < 50 && pl.feetY() > FY() - 90) { ev.hit.add(pl); pl.knockDown(ev.dir * 7, -6, 1.0); pl.say(HC.U.pick(['GLUB!', 'wave!!', 'blub blub']), 1.2); }
          }
          for (const b of m.balls) if (!b.heldBy && Math.abs(b.x - ev.front) < 60 && b.y > FY() - 100) Matter.Body.setVelocity(b.body, { x: ev.dir * 9, y: -5 });
        },
        draw(ctx, m, ev) {
          if (ev.front == null) return;
          const x = ev.front, d = ev.dir;
          ctx.fillStyle = 'rgba(40,150,230,0.85)';
          ctx.beginPath(); ctx.moveTo(x - d * 600, FY() + 5); ctx.lineTo(x - d * 600, FY() - 30); ctx.quadraticCurveTo(x - d * 60, FY() - 50, x, FY() - 85);
          ctx.quadraticCurveTo(x + d * 30, FY() - 40, x + d * 40, FY() + 5); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(x, FY() - 80, 14, 0, 7); ctx.arc(x - d * 22, FY() - 72, 10, 0, 7); ctx.fill();
        } } },

    // ------------------------------------------------------------ SPACE
    { id: 'space', name: 'Space Station', icon: '🛰️', desc: 'Low gravity and floating debris that bounces the ball around.',
      gravity: 0.45, floor: { top: '#6c7a89', bottom: '#3d4652', line: '#00e5ff' }, floorFriction: 0.85,
      drawBg(ctx, m, t) {
        ctx.drawImage(cached(this, (c) => {
          sky(c, '#05030f', '#1a1440');
          for (let i = 0; i < 160; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + Math.random() * 0.7) + ')'; c.fillRect(Math.random() * W(), Math.random() * FY(), 1.5, 1.5); }
          const g = c.createRadialGradient(1000, 160, 10, 1000, 160, 120); g.addColorStop(0, '#ff9f5a'); g.addColorStop(1, '#7a2d6b'); c.fillStyle = g; c.beginPath(); c.arc(1000, 160, 110, 0, 7); c.fill();
          c.strokeStyle = 'rgba(255,220,180,0.6)'; c.lineWidth = 6; c.beginPath(); c.ellipse(1000, 160, 180, 30, -0.3, 0, 7); c.stroke();
          c.fillStyle = '#2b3240'; c.fillRect(0, 0, W(), 50); c.fillRect(0, 520, W(), 120);
          for (let x = 30; x < W(); x += 160) { c.fillStyle = '#11151d'; c.fillRect(x, 540, 120, 60); c.fillStyle = '#00e5ff44'; c.fillRect(x + 6, 546, 108, 48); }
        }), 0, 0);
        ctx.fillStyle = Math.sin(t * 4) > 0 ? '#f33' : '#600'; ctx.beginPath(); ctx.arc(640, 25, 6, 0, 7); ctx.fill();
      },
      drawFloorDetail(ctx) { ctx.strokeStyle = 'rgba(0,229,255,0.3)'; ctx.lineWidth = 2; for (let x = -800; x < 800; x += 80) { ctx.strokeRect(x, 6, 76, 40); } },
      init(m) { m.spawnDebris(3, false); },
      update(m, dt) { m.updateDebris(); },
      event: { name: 'Meteor Shower!', icon: '☄️', every: [10, 14], duration: 6,
        start(m, ev) { m.spawnDebris(5, true); HC.Audio.zap(); },
        update() {}, end(m) { m.clearDebris(true); } } },

    // ------------------------------------------------------------ VOLCANO
    { id: 'volcano', name: 'Volcano', icon: '🌋', desc: 'Lava rises from the sides. Touch it and you respawn.',
      floor: { top: '#4a3a36', bottom: '#2a1f1d', line: '#ff7b00' }, floorFriction: 0.9,
      drawBg(ctx, m, t) {
        ctx.drawImage(cached(this, (c) => {
          sky(c, '#2b0909', '#ff5e1a');
          c.fillStyle = '#3a1712'; c.beginPath(); c.moveTo(300, FY()); c.lineTo(560, 160); c.lineTo(720, 160); c.lineTo(980, FY()); c.fill();
          c.fillStyle = '#ff6a00'; c.beginPath(); c.moveTo(560, 160); c.lineTo(600, 230); c.lineTo(640, 190); c.lineTo(680, 240); c.lineTo(720, 160); c.fill();
          c.fillStyle = '#24100d'; for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(i * 100 - 40, FY()); c.lineTo(i * 100 + 20, FY() - 60 - (i * 37) % 70); c.lineTo(i * 100 + 80, FY()); c.fill(); }
        }), 0, 0);
        for (let i = 0; i < 8; i++) { const y = 160 - ((t * 40 + i * 50) % 160); ctx.fillStyle = 'rgba(80,60,60,' + (y / 200) + ')'; ctx.beginPath(); ctx.arc(640 + Math.sin(t + i) * 30, y, 20 + (160 - y) * 0.2, 0, 7); ctx.fill(); }
      },
      drawFloorDetail(ctx) { ctx.strokeStyle = 'rgba(255,120,0,0.35)'; ctx.lineWidth = 2; for (let x = -800; x < 800; x += 70) { ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x + 30, 40); ctx.lineTo(x + 10, 80); ctx.stroke(); } },
      init(m) { m.lavaH = 0; },
      update(m, dt) { m.checkLava(); },
      drawFg(ctx, m, t) {
        const h = m.lavaH || 0; if (h <= 1) return;
        const pool = HC.COURTS_LAVA_W;
        for (const side of [0, 1]) {
          const x0 = side === 0 ? 0 : W() - pool;
          const g = ctx.createLinearGradient(0, FY() - h, 0, FY()); g.addColorStop(0, '#ffdd33'); g.addColorStop(0.3, '#ff6a00'); g.addColorStop(1, '#a01800');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, FY() + 10);
          for (let x = 0; x <= pool; x += 10) ctx.lineTo(x0 + x, FY() - h + Math.sin(t * 5 + x * 0.1) * 5);
          ctx.lineTo(x0 + pool, FY() + 10); ctx.fill();
        }
      },
      event: { name: 'Lava Surge!', icon: '🔥', every: [8, 12], duration: 7,
        start(m) { HC.Audio.sizzle(); },
        update(m, dt, ev, p) { m.lavaH = 170 * Math.min(1, Math.sin(Math.PI * p) * 1.4); },
        end(m) { m.lavaH = 0; } } },

    // ------------------------------------------------------------ DISCO
    { id: 'disco', name: 'Disco Club', icon: '🪩', desc: 'Random blackouts - only the ball and rims glow. One hoop slides on a rail.',
      floor: { top: '#2b1640', bottom: '#12081c', line: '#ff4fd8' }, floorFriction: 0.85,
      drawBg(ctx, m, t) {
        ctx.drawImage(cached(this, (c) => { sky(c, '#12051f', '#3a0f4f'); }), 0, 0);
        const cols = ['#ff4fd8', '#4fd8ff', '#fff04f', '#7dff4f'];
        for (let i = 0; i < 4; i++) {
          const a = Math.sin(t * 0.8 + i * 1.6) * 0.6;
          ctx.save(); ctx.translate(200 + i * 290, 0); ctx.rotate(a);
          const g = ctx.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, cols[i] + '88'); g.addColorStop(1, cols[i] + '00');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(120, 640); ctx.lineTo(-120, 640); ctx.fill(); ctx.restore();
        }
        ctx.save(); ctx.translate(640, 80); ctx.rotate(t);
        ctx.fillStyle = '#ccc'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fill();
        for (let i = 0; i < 24; i++) { ctx.fillStyle = (i + Math.floor(t * 6)) % 3 ? '#fff' : '#88f'; ctx.fillRect(Math.cos(i) * 22 - 4, Math.sin(i * 1.7) * 22 - 4, 8, 8); }
        ctx.restore(); ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.moveTo(640, 0); ctx.lineTo(640, 46); ctx.stroke();
        // rail for the sliding hoop
        const h = m && m.world.hoops[1];
        if (h) { ctx.fillStyle = '#888'; ctx.fillRect(h.baseX - h.dir * (HC.CONFIG.RIM_WIDTH / 2 + 9) - 4, h.baseY - 220, 8, 360); }
      },
      drawFloorDetail(ctx, t) {
        for (let x = -800, i = 0; x < 800; x += 80, i++) for (let y = 0; y < 3; y++) {
          ctx.fillStyle = ['#ff4fd8', '#4fd8ff', '#fff04f', '#7dff4f'][(i + y + Math.floor((t || 0) * 2)) % 4] + '55'; ctx.fillRect(x + 2, y * 30 + 2, 76, 26);
        }
      },
      init(m) { this.t = 0; },
      update(m, dt) { this.t += dt; m.world.placeHoop(m.world.hoops[1], 0, Math.sin(this.t * 0.9) * 110, true); },
      event: { name: 'Blackout!', icon: '🌑', every: [7, 11], duration: 4,
        start(m) { HC.Audio.zap(); },
        update(m, dt, ev, p) { m.darkCourt = Math.min(1, p * 8, (1 - p) * 8); },
        end(m) { m.darkCourt = 0; } } },
  ];
  HC.COURTS_LAVA_W = 160;
  HC.courtById = (id) => HC.COURTS.find(c => c.id === id) || HC.COURTS[0];
})();
