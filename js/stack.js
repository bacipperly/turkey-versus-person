// Shared stack logic: fake physics on purpose. Pieces snap, squash and
// wobble but never topple.
import * as C from './config.js';

export class Stack {
  constructor({ worldEl, piecesEl, scoreEl, pieceWidth }) {
    this.worldEl = worldEl;
    this.piecesEl = piecesEl;
    this.scoreEl = scoreEl;
    this.pieceWidth = pieceWidth;
    this.count = 0;
    this.lastOffset = 0;
    this.z = 1;
  }

  reset() {
    this.piecesEl.innerHTML = '';
    this.count = 0;
    this.lastOffset = 0;
    this.updateScore(false);
  }

  add(svgMarkup) {
    const jitter = Math.round((Math.random() * 2 - 1) * C.STACK_JITTER_PX);
    const el = document.createElement('div');
    el.className = 'piece';
    el.style.left = `${-this.pieceWidth / 2 + jitter}px`;
    el.style.top = `${-(this.count + 1) * C.BLOCK}px`;
    el.style.width = `${this.pieceWidth}px`;
    el.style.height = `${C.BLOCK}px`;
    el.innerHTML = `<div class="piece-inner land">${svgMarkup}</div>`;
    this.piecesEl.append(el);
    this.count++;
    this.lastOffset = jitter;
    restartClass(this.piecesEl, 'wobble');
    this.updateScore(true);
    return el;
  }

  heightPx() {
    return this.count * C.BLOCK;
  }

  /** Screen (stage) y of the top of the stack at the current zoom. */
  topY() {
    return C.GROUND_Y - this.heightPx() * this.z;
  }

  updateScore(bump) {
    this.scoreEl.textContent = String(this.count);
    this.scoreEl.style.top = `${Math.max(100, this.topY() - 96)}px`;
    if (bump) restartClass(this.scoreEl, 'bump');
  }
}

/** Zoom both sides out together so the taller stack's top stays visible. */
export function applyZoom(stacks, extraPx = 0) {
  const limit = C.ZOOM_START_FRACTION * C.STAGE_H;
  const tallest = Math.max(...stacks.map((s) => s.heightPx())) + extraPx;
  const z = Math.min(1, limit / Math.max(1, tallest));
  for (const s of stacks) {
    s.z = z;
    s.worldEl.style.transform = `scale(${z})`;
    s.updateScore(false);
  }
  return z;
}

export function restartClass(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // force reflow so the animation replays
  el.classList.add(cls);
}
