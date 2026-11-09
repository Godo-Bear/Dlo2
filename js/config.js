// =====================================================================
//  HOOP CHAOS - TUNING CONFIG
//  Every "feel" number in the game lives here. Tweak, save, refresh.
//  Units: pixels, physics steps (1 step = 1/60 s) and seconds.
// =====================================================================
window.HC = window.HC || {};

HC.CONFIG = {
  // ---------- Screen / arena ----------
  WIDTH: 1280,            // logical canvas width (scaled to fit the window)
  HEIGHT: 720,            // logical canvas height
  FLOOR_Y: 640,           // y of the court surface
  GRAVITY: 1.0,           // Matter.js gravity (1 = normal). Courts/mutators multiply this.

  // ---------- Players / ragdolls ----------
  JUMP_FORCE: 11.8,       // upward launch speed at full wind-up (px/step)
  JUMP_FORWARD: 4.6,      // forward launch speed at full wind-up (px/step)
  MIN_CHARGE: 0.35,       // a quick tap still gives this fraction of a full jump
  WINDUP_TIME: 0.55,      // seconds of holding for a full charge
  JUMP_SPIN: 0.06,        // forward spin added on jump (makes flips possible)
  ARM_MOTOR: 0.32,        // how hard arms chase their target angle (0-1)
  ARM_SWING_TIME: 0.32,   // seconds the arms stay up after a swing
  LEG_MOTOR: 0.28,        // how hard legs chase their target angle
  UPRIGHT_GROUND: 0.11,   // self-righting strength while feet are on the floor
  UPRIGHT_AIR: 0.018,     // self-righting strength in the air (low = floppy flips)
  UPRIGHT_DAMP: 0.18,     // damping on torso spin while righting
  CROUCH_LEAN: 0.32,      // radians the torso leans forward while winding up
  KNOCKDOWN_ANGLE: 1.25,  // torso tilt (rad) on the floor that counts as "fallen over"
  GETUP_TIME: 0.75,       // seconds lying on the floor before getting back up
  JETPACK_FORCE: 7.5,     // Rocket Rex mid-air boost speed

  // ---------- Ball ----------
  BALL_RADIUS: 15,
  BALL_RESTITUTION: 0.72, // bounciness
  BALL_DENSITY: 0.0012,
  BALL_FRICTION_AIR: 0.0, // keep 0 so the shot-assist math stays exact
  GRAB_EXTRA: 9,          // extra grab reach around a hand (px)
  STEAL_COOLDOWN: 0.45,   // seconds a new holder is immune to being stripped
  REGRAB_COOLDOWN: 0.45,  // seconds a shooter can't re-catch their own shot
  KNOCK_LOOSE_SPEED: 9,   // body hit speed that can knock the ball loose
  SHOT_ARC_STEPS: 52,     // base flight time of a shot (higher = loftier arc)
  SHOT_ERROR_BASE: 0.035, // radians of aim error on a perfect-timing shot
  SHOT_ERROR_TIMING: 0.16,// extra radians of error for releasing far from the jump's apex
  SHOT_ERROR_DIST: 0.00003,// extra error per px of distance
  SHOT_POWER_ERROR: 0.07, // random speed error fraction

  // ---------- Hoops ----------
  RIM_Y: 330,             // rim height (y)
  HOOP_INSET: 92,         // rim centre distance from the side walls
  RIM_WIDTH: 64,          // inside width of the rim
  BACKBOARD_HEIGHT: 112,
  THREE_PT_DIST: 420,     // horizontal distance from rim that counts as a 3

  // ---------- Match rules ----------
  WIN_SCORE: 5,           // default points to win (settings can change it)
  MATCH_TIME: 0,          // default whole-game time limit in minutes (0 = no limit; settings can change it)
  POINT_TIME: 20,         // seconds per point before the buzzer (timed points)
  BUZZER_WINDOW: 3,       // last N seconds count for "Buzzer Beater"
  COUNTDOWN: 2.4,         // seconds of countdown after a reset
  SCORE_PAUSE: 1.8,       // seconds of celebration after a basket
  HITPAUSE_FRAMES: 6,     // frozen frames on a dunk / big hit
  SHAKE_DUNK: 16,         // screen shake strength on dunks

  // ---------- Replays ----------
  REPLAY_SECONDS: 2.8,    // length of a replay clip
  REPLAY_SPEED: 0.35,     // replay playback speed (0.35 = slow-mo)

  // ---------- Bomb / Hot Potato ----------
  BOMB_TIME: [7, 11],     // random fuse length range (seconds)
  BOMB_FORCE: 18,         // explosion knockback speed
  BOMB_POINTS: 2,         // points the other team gets when the bomb blows in your hands

  // ---------- CPU ----------
  CPU: {
    easy:   { reaction: 0.42, apexNoise: 0.22, idle: 0.35, shootRange: 300, aimMul: 1.6 },
    medium: { reaction: 0.24, apexNoise: 0.12, idle: 0.15, shootRange: 380, aimMul: 1.1 },
    hard:   { reaction: 0.10, apexNoise: 0.05, idle: 0.04, shootRange: 470, aimMul: 0.75 },
  },

  // ---------- Tournament ----------
  TOURNAMENT_ROUND_DIFFICULTY: ['easy', 'medium', 'hard'],
  UPGRADE_JUMP: 0.10,     // +10% jump per pick
  UPGRADE_WINDUP: 0.2,    // 20% faster wind-up per pick
  UPGRADE_STICKY: 0.35,   // 35% less likely to lose the ball per pick

  // ---------- Bosses ----------
  BOSS_WIN_SCORE: 6,      // the boss wins when it scores this many points
  BOSS: {
    bigTony:   { scale: 3.0, health: 10, jumpMul: 0.7, specialEvery: [6, 9],  tell: 1.3 },
    hoopatron: { scale: 1.9, health: 10, jumpMul: 0.9, specialEvery: [5, 8],  tell: 1.1 },
    swampKing: { scale: 2.3, health: 10, jumpMul: 0.8, specialEvery: [7, 10], tell: 1.4 },
    coach:     { scale: 2.1, health: 12, jumpMul: 0.9, specialEvery: [5, 7],  tell: 1.2 },
  },

  // ---------- Courts ----------
  EVENT_WARNING: 2.0,     // seconds of warning before a court event fires
};

// Choices offered for the game time limit (minutes, 0 = off)
HC.MATCH_TIMES = [0, 1, 2, 3, 5, 10];
