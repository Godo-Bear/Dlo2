// Synthesized sound effects via the Web Audio API (no audio files).
window.HC = window.HC || {};

HC.Audio = (function () {
  let ctx = null, master = null, crowdGain = null, crowdFilter = null, noiseBuf = null;
  let volume = 0.7, crowdTarget = 0.05;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // looping crowd murmur
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      crowdFilter = ctx.createBiquadFilter(); crowdFilter.type = 'bandpass'; crowdFilter.frequency.value = 700; crowdFilter.Q.value = 0.6;
      crowdGain = ctx.createGain(); crowdGain.gain.value = 0;
      src.connect(crowdFilter); crowdFilter.connect(crowdGain); crowdGain.connect(master); src.start();
    } catch (e) { ctx = null; }
  }

  function ok() { return ctx && ctx.state === 'running' && !api.muted; }

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ok()) return;
    const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, filterType, freq, vol, freqTo, delay) {
    if (!ok()) return;
    const t = ctx.currentTime + (delay || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filterType || 'lowpass'; f.frequency.setValueAtTime(freq || 1000, t);
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  const api = {
    muted: false,
    init,
    setVolume(v) { volume = v; if (master) master.gain.value = v; },
    getVolume() { return volume; },
    boing(p) { p = p || 1; tone(180 * p, 0.25, 'sine', 0.25, 420 * p); },
    thud() { tone(90, 0.12, 'triangle', 0.25, 50); noise(0.06, 'lowpass', 400, 0.15); },
    bounce(v) { tone(140, 0.08, 'sine', Math.min(0.3, 0.05 + v * 0.02), 90); },
    swish() { noise(0.45, 'bandpass', 3000, 0.35, 900); },
    rim() { tone(520, 0.25, 'square', 0.08, 480); tone(780, 0.2, 'triangle', 0.08); },
    backboard() { tone(160, 0.12, 'square', 0.1, 120); noise(0.08, 'lowpass', 900, 0.15); },
    grab() { tone(600, 0.06, 'sine', 0.12, 800); },
    shoot() { noise(0.15, 'highpass', 1500, 0.12); tone(300, 0.12, 'sine', 0.1, 600); },
    buzzer() { tone(110, 0.9, 'sawtooth', 0.22); tone(112, 0.9, 'square', 0.12); },
    whistle() { tone(2100, 0.35, 'sine', 0.18, 2300); tone(2350, 0.35, 'sine', 0.08); },
    beep(hi) { tone(hi ? 880 : 520, hi ? 0.35 : 0.15, 'square', 0.12); },
    card() { tone(700, 0.08, 'triangle', 0.15, 1100); tone(1100, 0.1, 'triangle', 0.1, 1500, 0.07); },
    select() { tone(500, 0.06, 'triangle', 0.15, 700); },
    trick() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'square', 0.1, null, i * 0.07)); },
    cheer() { noise(1.4, 'bandpass', 1200, 0.35, 700); noise(1.2, 'bandpass', 2400, 0.15); },
    groan() { tone(260, 0.8, 'sawtooth', 0.06, 140); },
    explode() { noise(0.9, 'lowpass', 1800, 0.6, 60); tone(70, 0.6, 'sine', 0.4, 30); },
    splash() { noise(0.6, 'bandpass', 1500, 0.3, 300); },
    jet() { noise(0.25, 'bandpass', 600, 0.2, 1800); },
    zap() { noise(0.5, 'highpass', 2000, 0.4, 400); tone(90, 0.5, 'sawtooth', 0.2, 40); },
    stomp() { tone(55, 0.6, 'sine', 0.55, 28); noise(0.5, 'lowpass', 300, 0.5); },
    sizzle() { noise(0.5, 'highpass', 3000, 0.2); },
    wind() { noise(1.6, 'bandpass', 400, 0.25, 900); },
    slime() { tone(150, 0.4, 'sine', 0.2, 60); tone(220, 0.3, 'sine', 0.12, 90, 0.1); },
    sting() { // dramatic boss intro
      [[146, 0], [138, 0.35], [110, 0.7]].forEach(([f, d]) => { tone(f, 0.6, 'sawtooth', 0.18, null, d); tone(f * 1.5, 0.6, 'square', 0.06, null, d); });
      noise(1.5, 'lowpass', 200, 0.4, 60, 0.7); tone(55, 1.5, 'sine', 0.4, 40, 0.7);
    },
    fanfare() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0.25, 'square', 0.1, null, i * 0.13)); },
    sad() { [392, 370, 349, 330].forEach((f, i) => tone(f, 0.35, 'triangle', 0.15, null, i * 0.3)); },
    setCrowd(level) { crowdTarget = Math.max(0, Math.min(1, level)); },
    update() {
      if (!ok() || !crowdGain) return;
      const g = crowdGain.gain.value + (crowdTarget * 0.22 - crowdGain.gain.value) * 0.05;
      crowdGain.gain.value = g;
      crowdFilter.frequency.value = 600 + crowdTarget * 900;
    },
  };
  return api;
})();
