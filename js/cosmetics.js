// Cosmetics + coins: jerseys and ball skins you unlock in Adventure or buy in the Locker.
window.HC = window.HC || {};

HC.JERSEYS = {
  blue:   { name: 'Classic Blue', main: '#2e86ff', alt: '#ffffff' },
  red:    { name: 'Fire Red', main: '#e63946', alt: '#ffffff', price: 80 },
  lime:   { name: 'Lime Time', main: '#7ccf2b', alt: '#14361a' },
  aqua:   { name: 'Aqua Splash', main: '#18c7c7', alt: '#ffffff' },
  magma:  { name: 'Magma', main: '#ff5a1f', alt: '#2b0a00' },
  cosmic: { name: 'Cosmic', main: '#5b2bd6', alt: '#ffd23f' },
  neon:   { name: 'Neon Night', main: '#ff3df0', alt: '#13002b' },
  royal:  { name: 'Royal', main: '#3a0ca3', alt: '#ffd23f' },
  gold:   { name: 'Solid Gold', main: '#e8b10e', alt: '#3b2a00' },
  pink:   { name: 'Bubblegum', main: '#ff7eb6', alt: '#ffffff', price: 120 },
  black:  { name: 'Midnight', main: '#1f2233', alt: '#ff7a1a', price: 150 },
  mint:   { name: 'Mint', main: '#2ee6a6', alt: '#0d3b2e', price: 120 },
};

// how each cosmetic is obtained: price (Locker) or source text (Adventure reward)
HC.SHOP = [
  { kind: 'ball', id: 'retro', price: 150 },
  { kind: 'ball', id: 'pizza', price: 220 },
  { kind: 'ball', id: 'disco', price: 300 },
  { kind: 'jersey', id: 'red', price: 80 },
  { kind: 'jersey', id: 'pink', price: 120 },
  { kind: 'jersey', id: 'mint', price: 120 },
  { kind: 'jersey', id: 'black', price: 150 },
];

HC.Cosmetics = {
  owned(kind, id) {
    const sv = HC.Save.data;
    if ((kind === 'ball' && id === 'classic') || (kind === 'jersey' && id === 'blue')) return true;
    if (sv.admin && sv.admin.enabled && sv.admin.unlockAll) return true;
    return !!(sv.items && sv.items[kind + ':' + id]);
  },
  give(kind, id) { const sv = HC.Save.data; sv.items = sv.items || {}; sv.items[kind + ':' + id] = true; },
  buy(item) {
    const sv = HC.Save.data;
    if (this.owned(item.kind, item.id) || sv.coins < item.price) return false;
    sv.coins -= item.price; this.give(item.kind, item.id); HC.Save.save(); return true;
  },
  equip(kind, id) { const sv = HC.Save.data; sv.equip = sv.equip || {}; sv.equip[kind] = id; HC.Save.save(); },
  jersey() { const id = (HC.Save.data.equip || {}).jersey || 'blue'; const j = HC.JERSEYS[id] || HC.JERSEYS.blue; return { main: j.main, alt: j.alt }; },
  ballSkin() { return (HC.Save.data.equip || {}).ball || 'classic'; },
  addCoins(n) { const sv = HC.Save.data; sv.coins = (sv.coins || 0) + n; HC.Save.save(); },
  label(kind, id) { return kind === 'ball' ? (HC.BALL_SKINS[id] || {}).name || id : kind === 'jersey' ? (HC.JERSEYS[id] || {}).name || id : HC.charById(id).name; },
};
