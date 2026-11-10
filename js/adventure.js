// ADVENTURE MODE: 6 regions x 5 stages. Beat teams, earn stars & coins, unlock characters and cosmetics.
// Each stage is data - add more by editing HC.ADVENTURE.
//   team:   the CPU opponents   diff: CPU difficulty   win: points to win
//   mutator: a mutator that stays on all match (optional)   boss: boss id for boss stages
//   bonus:  the bonus-star objective  { type: 'three'|'dunk'|'trick'|'margin'|'clean', n }
//   reward: { coins, unlock: { kind: 'char'|'ball'|'jersey', id } }
window.HC = window.HC || {};

HC.ADVENTURE = [
  { id: 'gym', name: 'Gym District', court: 'gym', color: '#ff7a1a', icon: '🏫',
    story: 'Every legend starts in a squeaky school gym. Time to make a name for yourself.',
    stages: [
      { name: 'First Bounce', team: { name: 'The Benchwarmers', colors: { main: '#8d99ae', alt: '#2b2d42' }, chars: ['pip', 'nana'] }, diff: 'easy', win: 4, bonus: { type: 'three', n: 1 }, reward: { coins: 40 } },
      { name: 'Hall Pass', team: { name: 'Hall Monitors', colors: { main: '#f4a261', alt: '#264653' }, chars: ['bolt', 'pip'] }, diff: 'easy', win: 5, mutator: 'bigheads', bonus: { type: 'dunk', n: 1 }, reward: { coins: 50, unlock: { kind: 'ball', id: 'watermelon' } } },
      { name: 'Detention', team: { name: 'Noodle Factory', colors: { main: '#f1c40f', alt: '#333' }, chars: ['noodle', 'noodle'] }, diff: 'easy', win: 5, mutator: 'longarms', bonus: { type: 'margin', n: 4 }, reward: { coins: 60, unlock: { kind: 'jersey', id: 'lime' } } },
      { name: 'Pep Rally', team: { name: 'The Wobblers', colors: { main: '#8e44ad', alt: '#f1c40f' }, chars: ['noodle', 'blob'] }, diff: 'medium', win: 5, bonus: { type: 'trick', n: 2 }, reward: { coins: 70, unlock: { kind: 'char', id: 'zippy' } } },
      { name: 'BIG TONY', boss: 'bigTony', bonus: { type: 'bossclean', n: 3 }, reward: { coins: 150, unlock: { kind: 'ball', id: 'fire' } } },
    ] },
  { id: 'beach', name: 'Sunny Beach', court: 'beach', color: '#38d6ff', icon: '🏝️',
    story: 'Sand in your sneakers, waves at your ankles. The beach crews play rough.',
    stages: [
      { name: 'Sandy Start', team: { name: 'Jelly Jammers', colors: { main: '#27ae60', alt: '#ff0' }, chars: ['blob', 'pip'] }, diff: 'medium', win: 5, mutator: 'beach', bonus: { type: 'trick', n: 1 }, reward: { coins: 60 } },
      { name: 'Low Tide', team: { name: 'Granny Gang', colors: { main: '#d977b8', alt: '#fff' }, chars: ['nana', 'nana'] }, diff: 'medium', win: 5, bonus: { type: 'three', n: 2 }, reward: { coins: 70, unlock: { kind: 'jersey', id: 'aqua' } } },
      { name: 'Crab Walk', team: { name: 'Tiny Terrors', colors: { main: '#16a085', alt: '#fff' }, chars: ['pip', 'pip'] }, diff: 'medium', win: 5, mutator: 'shortlegs', bonus: { type: 'dunk', n: 1 }, reward: { coins: 70 } },
      { name: "Surf's Up", team: { name: 'Wave Riders', colors: { main: '#0077b6', alt: '#caf0f8' }, chars: ['rex', 'blob'] }, diff: 'medium', win: 6, mutator: 'bounce', bonus: { type: 'clean', n: 2 }, reward: { coins: 80, unlock: { kind: 'ball', id: 'ice' } } },
      { name: 'THE SWAMP KING', boss: 'swampKing', bonus: { type: 'bossclean', n: 3 }, reward: { coins: 180, unlock: { kind: 'char', id: 'flurry' } } },
    ] },
  { id: 'volcano', name: 'Volcano Peak', court: 'volcano', color: '#ff3d3d', icon: '🌋',
    story: 'The floor is literally lava. The Volcano Kings rule from the crater.',
    stages: [
      { name: 'Hot Feet', team: { name: 'Lava Lords', colors: { main: '#c0392b', alt: '#222' }, chars: ['bolt', 'rex'] }, diff: 'medium', win: 5, bonus: { type: 'trick', n: 2 }, reward: { coins: 80 } },
      { name: 'Ash Cloud', team: { name: 'Smoke Signals', colors: { main: '#5c5c66', alt: '#ffb703' }, chars: ['noodle', 'rex'] }, diff: 'medium', win: 6, mutator: 'blackout', bonus: { type: 'margin', n: 4 }, reward: { coins: 80, unlock: { kind: 'jersey', id: 'magma' } } },
      { name: 'Magma Rush', team: { name: 'Rust Buckets', colors: { main: '#a0522d', alt: '#ddd' }, chars: ['bolt', 'bolt'] }, diff: 'hard', win: 6, mutator: 'bowling', bonus: { type: 'dunk', n: 1 }, reward: { coins: 90 } },
      { name: 'Eruption', team: { name: 'Fire Ants', colors: { main: '#d00000', alt: '#ffba08' }, chars: ['pip', 'rex'] }, diff: 'hard', win: 6, mutator: 'megajump', bonus: { type: 'three', n: 2 }, reward: { coins: 100, unlock: { kind: 'ball', id: 'lava' } } },
      { name: 'VOLCANO KINGS', team: { name: 'Volcano Kings', colors: { main: '#370617', alt: '#ff7a1a' }, chars: ['tony', 'swamp'] }, diff: 'hard', win: 7, bonus: { type: 'clean', n: 3 }, reward: { coins: 200, unlock: { kind: 'char', id: 'mo' } }, finale: true },
    ] },
  { id: 'space', name: 'Orbit Station', court: 'space', color: '#c77dff', icon: '🛰️',
    story: 'Low gravity, flying space junk, and a robot that never misses.',
    stages: [
      { name: 'Liftoff', team: { name: 'Moon Bouncers', colors: { main: '#5d6dbe', alt: '#fff' }, chars: ['pip', 'blob'] }, diff: 'medium', win: 6, mutator: 'moon', bonus: { type: 'trick', n: 2 }, reward: { coins: 90 } },
      { name: 'Zero-G', team: { name: 'Star Pilots', colors: { main: '#3a0ca3', alt: '#4cc9f0' }, chars: ['rex', 'rex'] }, diff: 'hard', win: 6, bonus: { type: 'three', n: 2 }, reward: { coins: 100, unlock: { kind: 'jersey', id: 'cosmic' } } },
      { name: 'Asteroid Belt', team: { name: 'Comet Crew', colors: { main: '#495057', alt: '#ffd23f' }, chars: ['noodle', 'bolt'] }, diff: 'hard', win: 6, mutator: 'double', bonus: { type: 'margin', n: 4 }, reward: { coins: 100 } },
      { name: 'Dark Side', team: { name: 'Void Walkers', colors: { main: '#10002b', alt: '#e0aaff' }, chars: ['bolt', 'nana'] }, diff: 'hard', win: 6, mutator: 'blackout', bonus: { type: 'clean', n: 3 }, reward: { coins: 110, unlock: { kind: 'ball', id: 'galaxy' } } },
      { name: 'HOOPATRON 9000', boss: 'hoopatron', bonus: { type: 'bossclean', n: 3 }, reward: { coins: 220, unlock: { kind: 'char', id: 'clutch' } } },
    ] },
  { id: 'disco', name: 'Disco Club', court: 'disco', color: '#ff4fd8', icon: '🪩',
    story: 'The lights go out, the hoop starts sliding, and the crowd goes wild.',
    stages: [
      { name: 'Opening Night', team: { name: 'Funk Squad', colors: { main: '#ff006e', alt: '#ffbe0b' }, chars: ['blob', 'noodle'] }, diff: 'hard', win: 6, mutator: 'slippery', bonus: { type: 'trick', n: 2 }, reward: { coins: 110 } },
      { name: 'Dance Off', team: { name: 'Groove Bots', colors: { main: '#3a86ff', alt: '#fb5607' }, chars: ['bolt', 'hoopatron'] }, diff: 'hard', win: 6, bonus: { type: 'trick', n: 3 }, reward: { coins: 120, unlock: { kind: 'jersey', id: 'neon' } } },
      { name: 'Mirror Ball', team: { name: 'Glitter Gang', colors: { main: '#ff99c8', alt: '#5a189a' }, chars: ['pip', 'nana'] }, diff: 'hard', win: 7, mutator: 'tilt', bonus: { type: 'margin', n: 5 }, reward: { coins: 120 } },
      { name: 'Last Song', team: { name: 'Night Owls', colors: { main: '#14213d', alt: '#fca311' }, chars: ['rex', 'zippy'] }, diff: 'hard', win: 7, mutator: 'wind', bonus: { type: 'dunk', n: 1 }, reward: { coins: 130, unlock: { kind: 'ball', id: 'rainbow' } } },
      { name: 'DISCO INFERNO', team: { name: 'Disco Inferno', colors: { main: '#7209b7', alt: '#f72585' }, chars: ['mo', 'zippy'] }, diff: 'hard', win: 7, bonus: { type: 'clean', n: 3 }, reward: { coins: 250, unlock: { kind: 'char', id: 'ghostie' } }, finale: true },
    ] },
  { id: 'rooftop', name: 'Skyline Summit', court: 'rooftop', color: '#ffd23f', icon: '🌆',
    story: 'The top of the city. The best of the best. And Coach Thunder is waiting.',
    stages: [
      { name: 'Skyline', team: { name: 'Sky Rockets', colors: { main: '#e67e22', alt: '#fff' }, chars: ['rex', 'noodle'] }, diff: 'hard', win: 7, bonus: { type: 'trick', n: 2 }, reward: { coins: 130 } },
      { name: 'Gusty', team: { name: 'Wind Riders', colors: { main: '#90e0ef', alt: '#023e8a' }, chars: ['pip', 'flurry'] }, diff: 'hard', win: 7, mutator: 'wind', bonus: { type: 'three', n: 2 }, reward: { coins: 140 } },
      { name: 'Rooftop Rumble', team: { name: 'All-Stars', colors: { main: '#d62828', alt: '#fcbf49' }, chars: ['tony', 'nana'] }, diff: 'hard', win: 7, mutator: 'bomb', bonus: { type: 'clean', n: 3 }, reward: { coins: 150, unlock: { kind: 'jersey', id: 'royal' } } },
      { name: 'Penthouse', team: { name: 'Legends', colors: { main: '#212529', alt: '#ffd23f' }, chars: ['clutch', 'mo'] }, diff: 'hard', win: 7, bonus: { type: 'trick', n: 3 }, reward: { coins: 160, unlock: { kind: 'ball', id: 'gold' } } },
      { name: 'COACH THUNDER', boss: 'coach', bonus: { type: 'bossclean', n: 3 }, reward: { coins: 400, unlock: { kind: 'jersey', id: 'gold' } } },
    ] },
];

// star-count milestones
HC.ADV_MILESTONES = [
  { stars: 30, reward: { kind: 'ball', id: 'eyeball' }, coins: 200 },
  { stars: 60, reward: { kind: 'ball', id: 'disco' }, coins: 400 },
  { stars: 90, reward: { kind: 'jersey', id: 'gold' }, coins: 1000 },
];

HC.Adventure = {
  sid(r, s) { return HC.ADVENTURE[r].id + '-' + s; },
  prog() { const sv = HC.Save.data; sv.adv = sv.adv || { stars: {}, cleared: {}, region: 0 }; return sv.adv; },
  stars(r, s) { return this.prog().stars[this.sid(r, s)] || 0; },
  totalStars() { return Object.values(this.prog().stars).reduce((a, b) => a + b, 0); },
  maxStars() { return HC.ADVENTURE.reduce((a, r) => a + r.stages.length * 3, 0); },
  adminAll() { const a = HC.Save.data.admin; return !!(a && a.enabled && a.unlockAll); },
  regionUnlocked(r) { return r === 0 || this.adminAll() || this.stars(r - 1, HC.ADVENTURE[r - 1].stages.length - 1) > 0; },
  stageUnlocked(r, s) { return this.regionUnlocked(r) && (s === 0 || this.adminAll() || this.stars(r, s - 1) > 0); },
  regionStars(r) { return HC.ADVENTURE[r].stages.reduce((a, _, s) => a + this.stars(r, s), 0); },

  objectives(st) {
    const win = st.boss ? null : st.win;
    const list = [{ type: 'win' }, st.bonus];
    if (st.boss) list.push({ type: 'bossclean', n: 1 });
    else if (st.bonus.type === 'clean') list.push({ type: 'trick', n: 1 });
    else list.push({ type: 'clean', n: Math.floor(win / 2) });
    return list;
  },
  objText(o) {
    switch (o.type) {
      case 'win': return 'Win the match';
      case 'three': return 'Make ' + o.n + ' three-pointer' + (o.n > 1 ? 's' : '');
      case 'dunk': return 'Throw down ' + o.n + ' dunk' + (o.n > 1 ? 's' : '');
      case 'trick': return 'Score ' + o.n + ' trick shot' + (o.n > 1 ? 's' : '');
      case 'margin': return 'Win by ' + o.n + '+ points';
      case 'clean': return 'Let them score ' + o.n + ' or less';
      case 'bossclean': return 'Boss scores ' + o.n + ' or less';
    }
    return '';
  },
  objMet(o, m, won) {
    if (!won) return false;
    const ts = m.teamStats[0];
    switch (o.type) {
      case 'win': return true;
      case 'three': return ts.threes >= o.n;
      case 'dunk': return ts.dunks >= o.n;
      case 'trick': return ts.tricks >= o.n;
      case 'margin': return m.score[0] - m.score[1] >= o.n;
      case 'clean': return m.score[1] <= o.n;
      case 'bossclean': return m.boss && m.boss.bossScore <= o.n;
    }
    return false;
  },

  // record a finished stage; returns a summary for the results screen
  complete(r, s, m, won) {
    const st = HC.ADVENTURE[r].stages[s], p = this.prog(), id = this.sid(r, s);
    const objs = this.objectives(st).map(o => ({ text: this.objText(o), met: this.objMet(o, m, won) }));
    const got = objs.filter(o => o.met).length;
    const before = p.stars[id] || 0, firstClear = won && before === 0;
    const out = { objs, stars: got, prevStars: before, coins: 0, unlocks: [], firstClear };
    if (got > before) p.stars[id] = got;
    if (won) {
      out.coins = firstClear ? st.reward.coins : Math.round(st.reward.coins * 0.25);
      out.coins += Math.max(0, got - before) * 15;
      if (firstClear && st.reward.unlock) out.unlocks.push(this.grant(st.reward.unlock));
      if (firstClear && st.boss) { const b = HC.bossById(st.boss); HC.Save.data.bosses[b.id] = true; if (!HC.Save.data.unlocked[b.charId]) { HC.Save.data.unlocked[b.charId] = true; out.unlocks.push({ kind: 'char', id: b.charId }); } }
      if (firstClear && r === HC.ADVENTURE.length - 1 && s === HC.ADVENTURE[r].stages.length - 1) out.champion = true;
    }
    // milestones
    const total = this.totalStars(); p.milestones = p.milestones || {};
    for (const ms of HC.ADV_MILESTONES) if (total >= ms.stars && !p.milestones[ms.stars]) { p.milestones[ms.stars] = true; out.unlocks.push(this.grant(ms.reward)); out.coins += ms.coins; out.milestone = ms.stars; }
    if (out.coins) HC.Save.data.coins = (HC.Save.data.coins || 0) + out.coins;
    HC.Save.save();
    return out;
  },
  grant(u) {
    if (u.kind === 'char') HC.Save.data.unlocked[u.id] = true; else HC.Cosmetics.give(u.kind, u.id);
    return u;
  },
  unlockLabel(u) {
    if (!u) return '';
    return (u.kind === 'char' ? 'Character: ' : u.kind === 'ball' ? 'Ball: ' : 'Jersey: ') + HC.Cosmetics.label(u.kind, u.id);
  },
};
