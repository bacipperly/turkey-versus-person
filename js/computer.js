// The Person Team: a timer, not real AI. It places one house piece every few
// hundred milliseconds with a little randomness, plus one or two pauses.
import * as C from './config.js';
import { HOUSE_ORDER } from './art.js';
import { restartClass } from './stack.js';

const rand = (a, b) => a + Math.random() * (b - a);

export class Computer {
  constructor({ builderEl, onPlace }) {
    this.builderEl = builderEl;
    this.onPlace = onPlace; // (houseType) => void
    this.active = false;
  }

  start(now, difficultyKey) {
    this.d = C.DIFFICULTIES[difficultyKey] || C.DIFFICULTIES[C.DEFAULT_DIFFICULTY];
    this.i = 0;
    this.next = now + this.interval();
    const P = C.PAUSE_BEATS;
    const n = Math.round(rand(P.minCount, P.maxCount));
    this.pauses = Array.from({ length: n }, () => ({
      at: now + rand(P.windowStartMs, P.windowEndMs),
      dur: rand(P.minMs, P.maxMs),
    })).sort((a, b) => a.at - b.at);
    this.active = true;
  }

  interval() {
    return this.d.interval + (Math.random() * 2 - 1) * this.d.jitter;
  }

  update(now) {
    if (!this.active) return;
    while (now >= this.next) {
      if (this.pauses.length && this.pauses[0].at <= this.next) {
        const p = this.pauses.shift();
        this.next += p.dur;
        this.wipe(p.dur);
        continue;
      }
      this.place();
      this.next += this.interval();
    }
  }

  place() {
    const type = HOUSE_ORDER[this.i % HOUSE_ORDER.length];
    this.i++;
    this.builderEl.classList.remove('wiping');
    restartClass(this.builderEl, 'hammer');
    this.onPlace(type);
  }

  wipe(ms) {
    this.builderEl.classList.add('wiping');
    clearTimeout(this.wipeTimer);
    this.wipeTimer = setTimeout(() => this.builderEl.classList.remove('wiping'), ms);
  }

  stop() {
    this.active = false;
    clearTimeout(this.wipeTimer);
    this.builderEl.classList.remove('wiping');
  }
}
