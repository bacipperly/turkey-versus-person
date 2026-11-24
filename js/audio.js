// Every sound is synthesized with the Web Audio API: no files to host.
import { load, save } from './storage.js';

let ctx = null;
let master = null;
let muted = !!load('muted', false);

/** Create/resume the audio context. Must run inside a tap or key press (iOS). */
export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
      // A silent buffer fully unlocks audio on older iOS.
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    /* no audio available */
  }
}

export const isMuted = () => muted;

export function setMuted(value) {
  muted = value;
  save('muted', value);
  if (master) master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.02);
}

function tone(freq, { type = 'sine', dur = 0.15, vol = 0.25, at = 0, to = null, attack = 0.005 } = {}) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + Math.max(0, at);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// --- Effects -------------------------------------------------------------

export function countBeep(n) {
  const freq = { 3: 440, 2: 554, 1: 659 }[n] || 440;
  tone(freq, { type: 'square', dur: 0.16, vol: 0.14 });
}

export function go() {
  tone(880, { type: 'square', dur: 0.4, vol: 0.16 });
  tone(1320, { type: 'triangle', dur: 0.4, vol: 0.12 });
}

/** Soft plop whose pitch rises as the stack grows. */
export function plop(height) {
  const f = Math.min(300 + height * 30, 1500);
  tone(f * 1.6, { type: 'sine', dur: 0.12, to: f, vol: 0.4 });
}

export function hammer() {
  tone(190, { type: 'square', dur: 0.05, vol: 0.06, to: 120 });
}

export function bonk() {
  tone(320, { type: 'square', dur: 0.22, to: 70, vol: 0.14 });
  tone(160, { type: 'triangle', dur: 0.3, to: 50, vol: 0.35 });
}

export function gobble() {
  for (let i = 0; i < 7; i++) {
    tone(i % 2 ? 640 : 480, { type: 'sawtooth', dur: 0.06, at: i * 0.065, to: i % 2 ? 420 : 340, vol: 0.08 });
  }
}

export function tick() {
  tone(1600, { type: 'square', dur: 0.03, vol: 0.07 });
}

export function horn() {
  [196, 247, 294].forEach((f) => tone(f, { type: 'sawtooth', dur: 0.85, vol: 0.08, attack: 0.03 }));
}

export function fanfare() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    const last = i === notes.length - 1;
    tone(f, { type: 'triangle', dur: last ? 0.7 : 0.18, at: i * 0.14, vol: 0.28 });
    tone(f / 2, { type: 'square', dur: last ? 0.7 : 0.18, at: i * 0.14, vol: 0.05 });
  });
}

export function wahwah() {
  const steps = [[392, 370], [370, 349], [349, 330], [330, 247]];
  steps.forEach(([a, b], i) => {
    const last = i === steps.length - 1;
    tone(a, { type: 'sawtooth', dur: last ? 0.8 : 0.3, at: i * 0.32, to: b, vol: 0.07, attack: 0.03 });
  });
}

export function tie() {
  tone(523, { type: 'triangle', dur: 0.2, vol: 0.2 });
  tone(523, { type: 'triangle', dur: 0.3, at: 0.22, vol: 0.2 });
}

// --- Background tune -----------------------------------------------------

const MELODY = [392, 0, 494, 587, 523, 494, 440, 0, 392, 0, 494, 587, 659, 587, 523, 494];
const BASS = [196, 0, 0, 0, 247, 0, 0, 0, 220, 0, 0, 0, 147, 0, 0, 0];
let musicTimer = null;
let step = 0;
let nextNoteTime = 0;
let fast = false;

function scheduleMusic() {
  if (!ctx) return;
  while (nextNoteTime < ctx.currentTime + 0.15) {
    const stepDur = fast ? 0.1 : 0.16;
    const at = nextNoteTime - ctx.currentTime;
    const m = MELODY[step % MELODY.length];
    const b = BASS[step % BASS.length];
    if (m) tone(m, { type: 'triangle', dur: stepDur * 0.9, vol: 0.06, at });
    if (b) tone(b, { type: 'sine', dur: stepDur * 3, vol: 0.1, at });
    nextNoteTime += stepDur;
    step++;
  }
}

export function startMusic() {
  if (!ctx) return;
  stopMusic();
  step = 0;
  nextNoteTime = ctx.currentTime + 0.05;
  musicTimer = setInterval(scheduleMusic, 40);
}

export function setMusicFast(value) {
  fast = value;
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
  fast = false;
}
