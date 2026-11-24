// The player's tray, drag-and-drop and keyboard fallback.
import * as C from './config.js';
import { FOOD_TYPES, foodSVG } from './art.js';

export class Player {
  constructor({ trayEl, dragLayer, snapHint, toStage, onPlace, onMiss }) {
    this.trayEl = trayEl;
    this.dragLayer = dragLayer;
    this.snapHint = snapHint;
    this.toStage = toStage;
    this.onPlace = onPlace; // (type) => boolean (true if it landed)
    this.onMiss = onMiss;
    this.active = false;
    this.drags = new Map(); // pointerId -> { el, type, x, y }
    this.slots = [];

    for (let i = 0; i < C.TRAY_SIZE; i++) {
      const el = document.createElement('div');
      el.className = 'slot';
      el.dataset.i = String(i);
      el.style.left = `${10 + i * 250}px`;
      trayEl.append(el);
      this.slots.push({ el, type: null });
    }

    trayEl.addEventListener('pointerdown', (e) => this.down(e));
    window.addEventListener('pointermove', (e) => this.move(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.up(e));
    window.addEventListener('pointercancel', (e) => this.up(e, true));
  }

  randomType(avoid) {
    let t;
    do t = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
    while (t === avoid && FOOD_TYPES.length > 1);
    return t;
  }

  fillTray() {
    this.slots.forEach((s, i) => this.refill(i, false));
  }

  refill(i, animate = true) {
    const slot = this.slots[i];
    slot.type = this.randomType(slot.type);
    slot.el.innerHTML = `<div class="tray-piece${animate ? ' slide-in' : ''}">${foodSVG(slot.type)}</div>`;
  }

  setActive(on) {
    this.active = on;
    this.trayEl.classList.toggle('active', on);
    if (!on) {
      // Input locks: anything still in a finger falls and doesn't count.
      for (const d of this.drags.values()) this.fall(d, false);
      this.drags.clear();
    }
    this.updateHint();
  }

  down(e) {
    const slotEl = e.target.closest('.slot');
    if (!slotEl || !this.active) return;
    e.preventDefault();
    const i = Number(slotEl.dataset.i);
    const type = this.slots[i].type;
    if (!type) return;
    try { slotEl.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    this.refill(i);

    const el = document.createElement('div');
    el.className = 'drag-piece';
    el.innerHTML = foodSVG(type);
    this.dragLayer.append(el);
    const p = this.toStage(e.clientX, e.clientY);
    const d = { el, type, x: p.x, y: p.y };
    this.drags.set(e.pointerId, d);
    this.position(d);
    this.updateHint();
  }

  move(e) {
    const d = this.drags.get(e.pointerId);
    if (!d) return;
    e.preventDefault();
    const p = this.toStage(e.clientX, e.clientY);
    d.x = p.x;
    d.y = p.y;
    this.position(d);
  }

  up(e, cancelled = false) {
    const d = this.drags.get(e.pointerId);
    if (!d) return;
    this.drags.delete(e.pointerId);
    const landed = !cancelled && this.active && this.inSnapZone(d.x, d.y) && this.onPlace(d.type);
    if (landed) d.el.remove();
    else this.fall(d, this.active);
    this.updateHint();
  }

  /** Space / Enter: place the first tray piece straight onto the stack. */
  placeFromKeyboard() {
    if (!this.active) return;
    const type = this.slots[0].type;
    this.refill(0);
    this.onPlace(type);
  }

  inSnapZone(x, y) {
    if (x < 0 || x >= C.STAGE_W / 2 || y >= C.TRAY_TOP - 4) return false;
    if (y < C.SNAP_ZONE_FRACTION * C.STAGE_H) return true;
    return Math.abs(x - C.PLAYER_X) < C.SNAP_COLUMN_HALF;
  }

  dragTransform(d, dy = 0, rot = 0, scale = 1.1) {
    const x = d.x - C.FOOD_PIECE_W / 2;
    const y = d.y - C.BLOCK / 2 - 14 + dy;
    return `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
  }

  position(d) {
    d.el.style.transform = this.dragTransform(d);
  }

  fall(d, withSound) {
    if (withSound) this.onMiss();
    const spin = (Math.random() < 0.5 ? -1 : 1) * (160 + Math.random() * 120);
    const anim = d.el.animate(
      [{ transform: this.dragTransform(d) }, { transform: this.dragTransform(d, 1000, spin, 1) }],
      { duration: 750, easing: 'cubic-bezier(.45,0,1,1)', fill: 'forwards' },
    );
    anim.onfinish = () => d.el.remove();
  }

  updateHint() {
    this.snapHint.classList.toggle('on', this.active && this.drags.size > 0);
  }
}
