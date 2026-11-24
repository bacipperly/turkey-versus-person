// One 10-second race: countdown → playing → time's up → results (or tie).
import * as C from './config.js';
import * as audio from './audio.js';

export class Round {
  constructor(deps) {
    // deps: { ps, cs, player, computer, hud, fx, setState, getDifficulty, onResult }
    Object.assign(this, deps);
    this.phase = 'idle';
    this.token = 0;
    this.tick = this.tick.bind(this);
  }

  /** setTimeout that is ignored if the round was restarted or abandoned. */
  later(ms, fn) {
    const t = this.token;
    setTimeout(() => { if (t === this.token) fn(); }, ms);
  }

  abort() {
    this.token++;
    this.phase = 'idle';
    this.player.setActive(false);
    this.computer.stop();
    audio.stopMusic();
    this.hud.clearCountdown();
  }

  start() {
    this.abort();
    this.difficulty = this.getDifficulty();
    this.fx.reset();
    this.phase = 'countdown';
    this.setState('countdown');
    const step = C.COUNTDOWN_STEP_MS;
    [3, 2, 1].forEach((n, i) => this.later(i * step, () => {
      this.hud.showCountdown(String(n));
      audio.countBeep(n);
    }));
    this.later(3 * step, () => this.go());
  }

  go() {
    this.hud.showCountdown('GO!', true);
    audio.go();
    this.phase = 'playing';
    this.setState('playing');
    this.startTime = performance.now();
    this.endTime = this.startTime + C.ROUND_SECONDS * 1000;
    this.nextTick = this.endTime - C.HURRY_SECONDS * 1000;
    this.player.setActive(true);
    this.computer.start(this.startTime, this.difficulty);
    audio.startMusic();
    requestAnimationFrame(this.tick);
  }

  /** True while input still counts (locks exactly at 0.0 s). */
  isLive() {
    return this.phase === 'playing' && performance.now() < this.endTime;
  }

  tick() {
    if (this.phase !== 'playing') return;
    const now = performance.now();
    const remaining = Math.max(0, this.endTime - now);
    const hurry = remaining > 0 && remaining <= C.HURRY_SECONDS * 1000;
    this.hud.setTime(remaining, hurry);
    this.computer.update(Math.min(now, this.endTime));
    if (hurry) {
      audio.setMusicFast(true);
      if (now >= this.nextTick) {
        audio.tick();
        this.nextTick = now + (remaining > 2000 ? 500 : remaining > 1000 ? 320 : 180);
      }
    }
    if (remaining <= 0) {
      this.timesUp();
      return;
    }
    requestAnimationFrame(this.tick);
  }

  timesUp() {
    this.phase = 'timesUp';
    this.setState('timesUp');
    this.hud.setTime(0, false);
    this.player.setActive(false);
    this.computer.stop();
    audio.stopMusic();
    audio.horn();
    this.fx.showHead();
    this.fx.measure();
    this.later(C.TIMES_UP_MS, () => this.finish());
  }

  finish() {
    const p = this.ps.count;
    const c = this.cs.count;
    if (p === c) {
      this.phase = 'tie';
      this.fx.showTie(true);
      audio.tie();
      this.later(C.TIE_MESSAGE_MS, () => {
        this.fx.showTie(false);
        this.start();
      });
      return;
    }
    this.phase = 'results';
    this.onResult({ player: p, computer: c, win: p > c });
  }
}
