// Boot, art setup, screen state machine and the glue between modules.
// States: title → howToPlay (first visit) → countdown → playing → timesUp →
//         results → countdown (play again / tie) | title
import * as C from './config.js';
import { load, save } from './storage.js';
import * as audio from './audio.js';
import * as art from './art.js';
import { Stack, applyZoom, restartClass } from './stack.js';
import { Player } from './player.js';
import { Computer } from './computer.js';
import { Round } from './round.js';

const $ = (sel) => document.querySelector(sel);
const stage = $('#stage');

// --- Fit the 16:9 stage to the window --------------------------------------
let view = { scale: 1, x: 0, y: 0 };
function fit() {
  const s = Math.min(innerWidth / C.STAGE_W, innerHeight / C.STAGE_H);
  view = { scale: s, x: (innerWidth - C.STAGE_W * s) / 2, y: (innerHeight - C.STAGE_H * s) / 2 };
  stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${s})`;
}
addEventListener('resize', fit);
addEventListener('orientationchange', fit);
fit();
const toStage = (cx, cy) => ({ x: (cx - view.x) / view.scale, y: (cy - view.y) / view.scale });

// --- Draw the art ----------------------------------------------------------
$('#bg').innerHTML = art.backgroundSVG();
$('#buddy1').innerHTML = art.turkeySVG();
$('#buddy2').innerHTML = art.turkeySVG();
$('#builder').innerHTML = art.builderSVG();
$('#feathers').innerHTML = art.feathersSVG();
$('#food-head').innerHTML = art.foodHeadSVG();
$('#label-turkey').innerHTML = art.turkeySVG();
$('#label-house').innerHTML = art.houseIconSVG();
$('#title-turkey').innerHTML = art.turkeySVG();
$('#title-builder').innerHTML = art.builderSVG();
$('#title-trophy-icon').innerHTML = art.trophySVG();
$('#rs-turkey').innerHTML = art.turkeySVG();
$('#rs-house').innerHTML = art.houseIconSVG();
$('#result-trophy').innerHTML = art.trophySVG();
$('#demo-stack').innerHTML = art.foodSVG('roll') + art.foodSVG('corn');
$('#demo-piece').innerHTML = art.foodSVG('pie');

(function makeLeaves() {
  const colors = ['#e67e22', '#c0392b', '#f1c40f', '#d35400'];
  const layer = $('#leaves');
  for (let i = 0; i < 12; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    const dur = 9 + Math.random() * 8;
    leaf.style.cssText = `left:${Math.random() * 1600}px; --s:${24 + Math.random() * 22}px; --d:${dur}s; --delay:${-Math.random() * dur}s`;
    leaf.innerHTML = art.leafSVG(colors[i % colors.length]);
    layer.append(leaf);
  }
})();

// Snap-zone highlight, sized from config.
(function sizeSnapHint() {
  const top = C.SNAP_ZONE_FRACTION * C.STAGE_H;
  Object.assign($('.snap-top').style, { width: `${C.STAGE_W / 2}px`, height: `${top}px` });
  Object.assign($('.snap-col').style, {
    left: `${C.PLAYER_X - C.SNAP_COLUMN_HALF}px`,
    top: `${top}px`,
    width: `${C.SNAP_COLUMN_HALF * 2}px`,
    height: `${Math.max(0, C.TRAY_TOP - 4 - top)}px`,
  });
})();

// --- Game objects ----------------------------------------------------------
const ps = new Stack({ worldEl: $('#world-player'), piecesEl: $('#pieces-player'), scoreEl: $('#score-player'), pieceWidth: C.FOOD_PIECE_W });
const cs = new Stack({ worldEl: $('#world-computer'), piecesEl: $('#pieces-computer'), scoreEl: $('#score-computer'), pieceWidth: C.HOUSE_PIECE_W });
const stacks = [ps, cs];
const buddies = [$('#buddy1'), $('#buddy2')];
const builder = $('#builder');
const rezoom = (extra = 0) => applyZoom(stacks, extra);

function updateFeathers() {
  const h = ps.heightPx();
  const r = Math.max(150, h * 0.4 + 110);
  const bottom = -h * 0.42;
  Object.assign($('#feathers').style, {
    width: `${r * 2}px`,
    height: `${r * 1.05}px`,
    left: `${-r}px`,
    top: `${bottom - r * 1.05}px`,
  });
}

let round; // assigned below; closures read it at call time

const player = new Player({
  trayEl: $('#tray'),
  dragLayer: $('#drag-layer'),
  snapHint: $('#snap-hint'),
  toStage,
  onPlace(type) {
    if (!round.isLive()) return false;
    ps.add(art.foodSVG(type));
    audio.plop(ps.count);
    updateFeathers();
    rezoom();
    restartClass(buddies[ps.count % 2], 'flap');
    return true;
  },
  onMiss: () => audio.bonk(),
});

const computer = new Computer({
  builderEl: builder,
  onPlace(type) {
    cs.add(art.houseSVG(type));
    audio.hammer();
    rezoom();
  },
});

// --- HUD -------------------------------------------------------------------
const timerEl = $('#timer');
const timerNum = $('#timer-num');
const timerFill = $('#timer-fill');
const cdEl = $('#countdown');
const hud = {
  setTime(ms, hurry) {
    const n = String(Math.ceil(ms / 1000));
    if (timerNum.textContent !== n) timerNum.textContent = n;
    timerFill.style.transform = `scaleX(${ms / (C.ROUND_SECONDS * 1000)})`;
    timerEl.classList.toggle('hurry', hurry);
  },
  showCountdown(text, isGo = false) {
    cdEl.innerHTML = `<span class="num${isGo ? ' go' : ''}">${text}</span>`;
  },
  clearCountdown() {
    cdEl.innerHTML = '';
  },
};

// --- Effects ---------------------------------------------------------------
const tapes = [
  { stack: ps, el: $('#tape-player'), x: () => C.PLAYER_X + (C.FOOD_PIECE_W / 2 + C.STACK_JITTER_PX + 14) * ps.z },
  { stack: cs, el: $('#tape-computer'), x: () => C.COMPUTER_X - (C.HOUSE_PIECE_W / 2 + C.STACK_JITTER_PX + 14) * cs.z - 36 },
];

const fx = {
  reset() {
    ps.reset();
    cs.reset();
    rezoom();
    updateFeathers();
    $('#food-head').classList.remove('show');
    for (const t of tapes) {
      t.el.classList.remove('show');
      t.el.style.transition = 'none';
      t.el.style.height = '0px';
      void t.el.offsetWidth;
      t.el.style.transition = '';
    }
    buddies.forEach((b) => b.classList.remove('cheer', 'flap'));
    builder.classList.remove('cheer', 'wiping', 'hammer');
    $('#confetti').innerHTML = '';
    $('#tie-msg').hidden = true;
    player.fillTray();
    hud.setTime(C.ROUND_SECONDS * 1000, false);
  },
  showHead() {
    const head = $('#food-head');
    head.style.left = `${-45 + ps.lastOffset}px`;
    head.style.top = `${-ps.heightPx() - 96}px`;
    restartClass(head, 'show');
    rezoom(100);
  },
  measure() {
    for (const t of tapes) {
      const n = t.stack.count;
      const z = t.stack.z;
      t.el.style.left = `${t.x()}px`;
      t.el.style.backgroundSize = `14px ${C.BLOCK * z}px`;
      t.el.classList.add('show');
      const label = t.el.querySelector('.tape-label');
      label.textContent = '0';
      requestAnimationFrame(() => { t.el.style.height = `${n * C.BLOCK * z}px`; });
      const start = performance.now();
      const count = (now) => {
        const k = Math.min(1, (now - start) / 1100);
        label.textContent = String(Math.round(n * (1 - (1 - k) ** 3)));
        if (k < 1) requestAnimationFrame(count);
      };
      requestAnimationFrame(count);
    }
  },
  showTie(on) {
    $('#tie-msg').hidden = !on;
  },
};

function confetti() {
  const layer = $('#confetti');
  const colors = ['#ef8a24', '#b3123a', '#f2b632', '#6fb53a', '#2e6fb5', '#fff4dc'];
  for (let i = 0; i < 90; i++) {
    const d = document.createElement('div');
    d.className = 'confetto';
    d.style.background = colors[i % colors.length];
    d.style.left = `${Math.random() * C.STAGE_W}px`;
    layer.append(d);
    const dx = (Math.random() - 0.5) * 300;
    const anim = d.animate(
      [{ transform: 'translate(0, -40px) rotate(0deg)' }, { transform: `translate(${dx}px, 960px) rotate(${Math.random() * 720}deg)` }],
      { duration: 1800 + Math.random() * 1400, delay: Math.random() * 500, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'backwards' },
    );
    anim.onfinish = () => d.remove();
  }
}

// --- Screens ---------------------------------------------------------------
const screens = { title: $('#screen-title'), howToPlay: $('#screen-howto'), results: $('#screen-results') };
function setState(s) {
  document.body.dataset.state = s;
  for (const [name, el] of Object.entries(screens)) el.hidden = name !== s;
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
}

let difficulty = load('difficulty', C.DEFAULT_DIFFICULTY);
if (!C.DIFFICULTIES[difficulty]) difficulty = C.DEFAULT_DIFFICULTY;
let trophies = Number(load('trophies', 0)) || 0;
let best = Number(load('best', 0)) || 0;
let seenHowTo = !!load('seenHowTo', false);
let howToReturn = 'play';

function renderTitle() {
  document.querySelectorAll('.diff-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.diff === difficulty)));
  $('#trophy-count').textContent = String(trophies);
  $('#best-score').textContent = String(best);
}

function showResults({ player: p, computer: c, win }) {
  setState('results');
  $('#rs-player').textContent = String(p);
  $('#rs-computer').textContent = String(c);
  $('#rs-col-player').classList.toggle('winner', win);
  $('#rs-col-computer').classList.toggle('winner', !win);
  $('#result-title').textContent = win ? 'You win!' : 'The house wins!';
  const again = $('#btn-again');
  again.textContent = win ? 'Play again' : 'Try again!';
  again.classList.toggle('pulse', !win);
  const trophy = $('#result-trophy');
  trophy.hidden = !win;
  if (p > best) { best = p; save('best', best); }
  if (win) {
    trophies++;
    save('trophies', trophies);
    restartClass(trophy, 'drop');
    buddies.forEach((b) => b.classList.add('cheer'));
    audio.fanfare();
    setTimeout(() => audio.gobble(), 650);
    confetti();
  } else {
    builder.classList.add('cheer');
    audio.wahwah();
  }
  renderTitle();
  again.focus({ preventScroll: true });
}

round = new Round({
  ps, cs, player, computer, hud, fx, setState,
  getDifficulty: () => difficulty,
  onResult: showResults,
});

// --- Buttons and input -----------------------------------------------------
document.querySelectorAll('.diff-btn').forEach((b) => b.addEventListener('click', () => {
  difficulty = b.dataset.diff;
  save('difficulty', difficulty);
  renderTitle();
  audio.plop(3 + C.DIFFICULTIES[difficulty].stars * 3);
}));

$('#btn-play').addEventListener('click', () => {
  if (!seenHowTo) { howToReturn = 'play'; setState('howToPlay'); $('#btn-gotit').focus({ preventScroll: true }); }
  else round.start();
});
$('#btn-howto').addEventListener('click', () => { howToReturn = 'title'; setState('howToPlay'); });
$('#btn-gotit').addEventListener('click', () => {
  seenHowTo = true;
  save('seenHowTo', true);
  if (howToReturn === 'play') round.start();
  else setState('title');
});
$('#btn-again').addEventListener('click', () => round.start());
$('#btn-menu').addEventListener('click', () => { round.abort(); fx.reset(); setState('title'); });

const muteBtn = $('#btn-mute');
function renderMute() {
  muteBtn.innerHTML = art.muteIconSVG(audio.isMuted());
  muteBtn.setAttribute('aria-label', audio.isMuted() ? 'Turn sound on' : 'Mute sound');
  muteBtn.setAttribute('aria-pressed', String(audio.isMuted()));
}
muteBtn.addEventListener('click', () => { audio.setMuted(!audio.isMuted()); renderMute(); });

// Audio can only start inside a user gesture (iOS).
addEventListener('pointerdown', () => audio.unlock(), { capture: true });
addEventListener('keydown', (e) => {
  audio.unlock();
  if (round.phase === 'playing' && (e.code === 'Space' || e.key === 'Enter')) {
    e.preventDefault();
    if (!e.repeat) player.placeFromKeyboard();
  }
});

// No scrolling, pinch zoom, long-press menus or text selection, ever.
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// --- Go --------------------------------------------------------------------
renderMute();
renderTitle();
fx.reset();
setState('title');
