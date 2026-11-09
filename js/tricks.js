// Trick-shot detection, combo labels and the replay recorder.
window.HC = window.HC || {};

// order matters: it's the word order used to build combo labels
HC.TRICKS = [
  { id: 'buzzer', prefix: 'BUZZER-BEATING', noun: 'BUZZER BEATER', big: false },
  { id: 'upside', prefix: 'UPSIDE-DOWN', noun: 'UPSIDE-DOWN SHOT', big: true },
  { id: 'fullcourt', prefix: 'FULL-COURT', noun: 'FULL-COURT SHOT', big: true },
  { id: 'rim', prefix: 'NO-LOOK', noun: 'OFF-THE-RIM ROLL', big: false },
  { id: 'bank', prefix: 'BANK', noun: 'BANK SHOT', big: false },
  { id: 'header', prefix: 'HEADER', noun: 'HEADER', big: true },
  { id: 'dunk', prefix: 'SLAM', noun: 'DUNK', big: true },
];
HC.trickById = (id) => HC.TRICKS.find(t => t.id === id);

HC.Tricks = {
  // returns array of trick ids for a made basket
  detect(match, ball, hoop) {
    const C = HC.CONFIG, out = [], shot = ball.shot;
    const team = hoop.scoreTeam;
    // dunk: held through the rim, or a scoring-team hand right at the rim
    let dunk = !!ball.heldBy;
    if (!dunk) {
      for (const p of match.activePlayers()) {
        if (p.team !== team) continue;
        for (const w of ['armF', 'armB']) { const h = p.handPos(w); if (HC.U.dist(h.x, h.y, hoop.x, hoop.y) < 62) dunk = true; }
      }
    }
    if (shot && shot.team === team) {
      if (shot.board) out.push('bank');
      if (shot.rimHits >= 2) out.push('rim');
      if (Math.abs(shot.angle) > (120 * Math.PI / 180)) out.push('upside');
      const ownHalf = team === 0 ? shot.x < C.WIDTH / 2 : shot.x > C.WIDTH / 2;
      if (ownHalf && !shot.header && !dunk) out.push('fullcourt');
      if (shot.header) out.push('header');
    }
    if (dunk && !out.includes('header')) out.push('dunk');
    if (match.timed && match.pointTime <= C.BUZZER_WINDOW && match.pointTime > -0.5) out.push('buzzer');
    return HC.TRICKS.filter(t => out.includes(t.id)).map(t => t.id);
  },

  label(ids) {
    if (!ids.length) return '';
    const defs = ids.map(HC.trickById);
    if (defs.length === 1) return defs[0].noun + '!';
    return defs.slice(0, -1).map(d => d.prefix).join(' ') + ' ' + defs[defs.length - 1].noun + '!';
  },

  isBig(ids) { return ids.length >= 2 || ids.some(id => HC.trickById(id).big); },
};

// Records snapshots of the last few seconds for slow-mo replays.
HC.Recorder = class Recorder {
  constructor(seconds) { this.max = Math.round((seconds || 4) * 60); this.frames = []; }
  push(snap) { this.frames.push(snap); if (this.frames.length > this.max) this.frames.shift(); }
  clear() { this.frames = []; }
  clip(seconds) { const n = Math.round(seconds * 60); return this.frames.slice(Math.max(0, this.frames.length - n)); }
};
