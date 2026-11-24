// Every picture in the game, as inline SVG strings drawn in code.
// To swap in hand-drawn art later, return `<img src="./art/pie.png">` etc.

const INK = '#4a2c14';
const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const S2 = `stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
const SKIN = '#f1c27d';

const svg = (viewBox, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${extra}>${body}</svg>`;

// --- Turkey Team food pieces (160 x 56) ----------------------------------

export const FOOD_TYPES = ['pie', 'corn', 'roll', 'potatoes', 'cranberry', 'drumstick'];

function cornKernels() {
  let s = '';
  for (let y = 16; y <= 40; y += 8) {
    const shift = (y / 8) % 2 ? 5 : 0;
    for (let x = 40; x <= 152; x += 10) {
      const cx = x + shift;
      if (((cx - 94) / 58) ** 2 + ((y - 28) / 17) ** 2 < 0.82) {
        s += `<circle cx="${cx}" cy="${y}" r="3.6" fill="#ffe680"/>`;
      }
    }
  }
  return s;
}

const FOOD = {
  pie: `
    <path d="M8 46 L150 12 L154 48 Z" fill="#f08a24" ${S}/>
    <path d="M8 46 L154 48 L152 54 L10 52 Z" fill="#d9a066" ${S}/>
    <path d="M148 12 Q160 30 152 50" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M148 12 Q160 30 152 50" fill="none" stroke="#e1ac72" stroke-width="8" stroke-linecap="round"/>
    <g ${S}><circle cx="98" cy="22" r="8" fill="#fff8e7"/><circle cx="112" cy="20" r="9" fill="#fff8e7"/><circle cx="106" cy="11" r="7" fill="#fff8e7"/></g>
    <circle cx="98" cy="22" r="6.5" fill="#fff8e7"/><circle cx="112" cy="20" r="7.5" fill="#fff8e7"/><circle cx="106" cy="11" r="5.5" fill="#fff8e7"/>`,
  corn: `
    <ellipse cx="94" cy="28" rx="62" ry="21" fill="#f7c934" ${S}/>
    ${cornKernels()}
    <path d="M52 8 Q16 10 4 30 Q22 30 38 27 Q18 40 12 52 Q36 50 56 42 Q44 28 52 8 Z" fill="#6fa83a" ${S}/>
    <path d="M44 14 Q30 24 26 34" fill="none" stroke="#4f8226" stroke-width="3" stroke-linecap="round"/>`,
  roll: `
    <path d="M14 50 Q12 8 80 7 Q148 8 146 50 Z" fill="#e0a548" ${S}/>
    <ellipse cx="60" cy="21" rx="24" ry="6" fill="#f5c97a"/>
    <g fill="none" stroke="#b87a2c" stroke-width="4" stroke-linecap="round">
      <path d="M56 16 Q62 28 54 42"/><path d="M80 13 Q86 30 80 46"/><path d="M104 16 Q98 28 106 42"/>
    </g>`,
  potatoes: `
    <ellipse cx="80" cy="49" rx="72" ry="6" fill="#cfe3ef" ${S}/>
    <path d="M22 47 Q14 32 32 27 Q34 13 54 15 Q64 4 82 10 Q100 3 110 16 Q130 13 129 30 Q144 34 138 47 Z" fill="#fffdf5" ${S}/>
    <path d="M54 32 Q66 26 78 32 M92 26 Q104 22 114 30" fill="none" stroke="#e7dcc4" stroke-width="3" stroke-linecap="round"/>
    <rect x="70" y="6" width="24" height="15" rx="3" fill="#ffe066" ${S} transform="rotate(-8 82 13)"/>`,
  cranberry: `
    <rect x="12" y="7" width="136" height="43" rx="14" fill="#b3123a" ${S}/>
    <g stroke="#850a29" stroke-width="3" stroke-linecap="round"><path d="M42 10 V47"/><path d="M68 10 V47"/><path d="M94 10 V47"/><path d="M120 10 V47"/></g>
    <rect x="22" y="13" width="104" height="6" rx="3" fill="#e0506e" opacity=".75"/>`,
  drumstick: `
    <circle cx="142" cy="21" r="8.5" fill="#fff6e0" ${S}/>
    <circle cx="142" cy="35" r="8.5" fill="#fff6e0" ${S}/>
    <rect x="104" y="22" width="40" height="12" rx="5" fill="#fff6e0" ${S}/>
    <circle cx="142" cy="21" r="7" fill="#fff6e0"/><circle cx="142" cy="35" r="7" fill="#fff6e0"/>
    <path d="M10 29 Q8 6 52 7 Q92 9 114 22 L114 34 Q92 48 52 50 Q8 52 10 29 Z" fill="#a0572a" ${S}/>
    <ellipse cx="46" cy="19" rx="24" ry="5" fill="#c47a45"/>`,
};

export function foodSVG(type) {
  return svg('0 0 160 56', FOOD[type] || FOOD.pie, 'overflow="visible"');
}

// --- Person Team house pieces (200 x 56) ----------------------------------

export const HOUSE_ORDER = ['foundation', 'wall', 'windowWall', 'doorWall', 'roof', 'chimney'];

function stones() {
  let s = '';
  for (const [y, off] of [[8, 0], [30, 22]]) {
    for (let x = 10 - off; x < 192; x += 44) {
      const x0 = Math.max(9, x);
      const x1 = Math.min(191, x + 40);
      if (x1 - x0 > 8) s += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="18" rx="4" fill="#b9b4ac"/>`;
    }
  }
  return s;
}

const siding = `
  <rect x="12" y="2" width="176" height="53" fill="#f3d9a4" ${S}/>
  <g stroke="#d4b47a" stroke-width="3"><path d="M14 15 H186"/><path d="M14 28 H186"/><path d="M14 41 H186"/></g>`;

const windowAt = (x) => `
  <rect x="${x}" y="10" width="38" height="36" rx="3" fill="#8fd3ff" ${S}/>
  <path d="M${x + 19} 10 V46 M${x} 28 H${x + 38}" stroke="${INK}" stroke-width="3"/>
  <path d="M${x + 5} 15 L${x + 13} 15" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;

const HOUSE = {
  foundation: `<rect x="4" y="4" width="192" height="50" rx="5" fill="#8f8a83" ${S}/>${stones()}`,
  wall: siding,
  windowWall: siding + windowAt(36) + windowAt(126),
  doorWall: siding + windowAt(30) + `
    <rect x="112" y="8" width="40" height="47" rx="4" fill="#8b4a22" ${S}/>
    <rect x="119" y="14" width="26" height="14" rx="2" fill="#a05a2c"/>
    <circle cx="144" cy="36" r="3.5" fill="#f2b632" ${S2}/>`,
  roof: `
    <polygon points="2,54 32,4 168,4 198,54" fill="#b5462e" ${S}/>
    <path d="M22 20 H178 M12 37 H188" stroke="#8f3220" stroke-width="3"/>`,
  chimney: `
    <circle cx="96" cy="16" r="8" fill="#ececec"/><circle cx="80" cy="9" r="6" fill="#f4f4f4"/>
    <rect x="16" y="38" width="168" height="17" rx="5" fill="#8f3220" ${S}/>
    <rect x="124" y="6" width="34" height="34" fill="#c0503a" ${S}/>
    <path d="M124 17 H158 M124 28 H158 M141 6 V17 M132 17 V28 M150 17 V28 M141 28 V40" stroke="#8f3220" stroke-width="2"/>
    <rect x="119" y="2" width="44" height="8" rx="2" fill="#8f3220" ${S}/>`,
};

export function houseSVG(type) {
  return svg('0 0 200 56', HOUSE[type] || HOUSE.wall, 'overflow="visible"');
}

export function houseIconSVG() {
  return svg('0 0 60 60', `
    <rect x="11" y="28" width="38" height="28" fill="#f3d9a4" ${S}/>
    <polygon points="4,31 30,7 56,31" fill="#b5462e" ${S}/>
    <rect x="25" y="38" width="11" height="18" fill="#8b4a22" ${S2}/>
    <rect x="39" y="35" width="7" height="7" fill="#8fd3ff" ${S2}/>`);
}

// --- Characters ------------------------------------------------------------

const FEATHER_COLORS = ['#c0392b', '#e67e22', '#f1c40f', '#d35400', '#f1c40f', '#e67e22', '#c0392b'];

/** Cartoon turkey, 140 x 150. `.wing` / `.wing2` can be animated. */
export function turkeySVG() {
  const tail = FEATHER_COLORS.map((c, i) =>
    `<ellipse cx="70" cy="44" rx="15" ry="42" fill="${c}" ${S} transform="rotate(${-72 + i * 24} 70 94)"/>`).join('');
  return svg('0 0 140 150', `
    ${tail}
    <path d="M60 130 V144 M80 130 V144" stroke="#f5a623" stroke-width="5" stroke-linecap="round"/>
    <path d="M52 147 L60 143 L68 147 M72 147 L80 143 L88 147" stroke="#f5a623" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="70" cy="98" rx="38" ry="36" fill="#8b5a2b" ${S}/>
    <ellipse cx="70" cy="106" rx="22" ry="22" fill="#a86d36"/>
    <g class="wing"><path d="M40 90 Q24 108 44 124 Q60 116 56 94 Z" fill="#6e4220" ${S}/></g>
    <g class="wing2"><path d="M100 90 Q116 108 96 124 Q80 116 84 94 Z" fill="#6e4220" ${S}/></g>
    <ellipse cx="70" cy="56" rx="17" ry="20" fill="#9c6633" ${S}/>
    <circle cx="63" cy="51" r="6.5" fill="#fff" ${S2}/><circle cx="77" cy="51" r="6.5" fill="#fff" ${S2}/>
    <circle cx="64" cy="52" r="3.2" fill="#1c1c1c"/><circle cx="76" cy="52" r="3.2" fill="#1c1c1c"/>
    <path d="M65 60 L70 68 L75 60 Z" fill="#f5a623" ${S2}/>
    <path d="M70 64 Q62 74 67 81 Q75 78 72 65 Z" fill="#d62b3a" ${S2}/>`, 'overflow="visible"');
}

/** Cartoon builder, 140 x 170. `.arm` swings the hammer, `.sweat` shows on pauses. */
export function builderSVG() {
  const limb = (d) =>
    `<path d="${d}" stroke="${INK}" stroke-width="19" stroke-linecap="round" fill="none"/>` +
    `<path d="${d}" stroke="#d9534f" stroke-width="13" stroke-linecap="round" fill="none"/>`;
  return svg('0 0 140 170', `
    <rect x="52" y="120" width="16" height="36" rx="5" fill="#2e4f8a" ${S}/>
    <rect x="72" y="120" width="16" height="36" rx="5" fill="#2e4f8a" ${S}/>
    <rect x="44" y="152" width="26" height="13" rx="6" fill="#6b4226" ${S}/>
    <rect x="70" y="152" width="26" height="13" rx="6" fill="#6b4226" ${S}/>
    ${limb('M46 84 L32 108')}
    <circle cx="31" cy="111" r="7" fill="${SKIN}" ${S}/>
    <rect x="40" y="70" width="60" height="42" rx="16" fill="#d9534f" ${S}/>
    <path d="M48 86 H92 V126 Q92 132 86 132 H54 Q48 132 48 126 Z" fill="#2e6fb5" ${S}/>
    <path d="M52 86 L48 72 M88 86 L92 72" stroke="#2e6fb5" stroke-width="5" stroke-linecap="round"/>
    <rect x="60" y="96" width="20" height="14" rx="3" fill="#3f82cc" ${S2}/>
    <circle cx="70" cy="48" r="22" fill="${SKIN}" ${S}/>
    <circle cx="57" cy="54" r="4" fill="#f29c8b" opacity=".7"/><circle cx="83" cy="54" r="4" fill="#f29c8b" opacity=".7"/>
    <circle cx="63" cy="47" r="3" fill="${INK}"/><circle cx="77" cy="47" r="3" fill="${INK}"/>
    <path d="M62 56 Q70 63 78 56" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M47 41 Q47 19 70 19 Q93 19 93 41 Z" fill="#f7c22b" ${S}/>
    <rect x="41" y="37" width="58" height="8" rx="4" fill="#f7c22b" ${S}/>
    <path d="M70 20 V36" stroke="#e0a800" stroke-width="4"/>
    <path class="sweat" d="M100 28 Q95 37 100 41 Q105 37 100 28 Z" fill="#5bc0ff" ${S2}/>
    <g class="arm">
      ${limb('M94 82 L118 68')}
      <g transform="rotate(-20 120 66)">
        <rect x="117" y="38" width="7" height="36" rx="3" fill="#8b5a2b" ${S2}/>
        <rect x="105" y="30" width="31" height="13" rx="3" fill="#8a8f99" ${S}/>
      </g>
      <circle cx="120" cy="67" r="7" fill="${SKIN}" ${S}/>
    </g>`, 'overflow="visible"');
}

/** Tail-feather fan that sits behind the food stack, 400 x 210 (pivot at bottom center). */
export function feathersSVG() {
  const colors = ['#c0392b', '#e67e22', '#f1c40f', '#d35400', '#c0392b', '#d35400', '#f1c40f', '#e67e22', '#c0392b'];
  const outer = colors.map((c, i) =>
    `<ellipse cx="200" cy="100" rx="32" ry="104" fill="${c}" ${S} transform="rotate(${-80 + i * 20} 200 208)"/>`).join('');
  const inner = colors.map((c, i) =>
    `<ellipse cx="200" cy="140" rx="16" ry="62" fill="#f7d774" opacity=".55" transform="rotate(${-80 + i * 20} 200 208)"/>`).join('');
  return svg('0 0 400 210', outer + inner, 'overflow="visible" preserveAspectRatio="none"');
}

/** Turkey head with googly eyes that pops onto the top of the food stack, 90 x 100. */
export function foodHeadSVG() {
  return svg('0 0 90 100', `
    <path d="M33 100 L33 70 Q33 58 45 58 Q57 58 57 70 L57 100 Z" fill="#9c6633" ${S}/>
    <ellipse cx="45" cy="40" rx="31" ry="32" fill="#9c6633" ${S}/>
    <circle cx="31" cy="33" r="13" fill="#fff" ${S}/><circle cx="59" cy="33" r="13" fill="#fff" ${S}/>
    <circle class="pupil" cx="35" cy="38" r="6" fill="#1c1c1c"/><circle class="pupil" cx="56" cy="28" r="6" fill="#1c1c1c"/>
    <path d="M37 48 L45 62 L53 48 Z" fill="#f5a623" ${S}/>
    <path d="M46 60 Q36 75 42 86 Q53 82 50 62 Z" fill="#d62b3a" ${S}/>`, 'overflow="visible"');
}

/** The Building Trophy, 200 x 260. */
export function trophySVG() {
  const gold = '#f4c430';
  const mini = ['#d9a400', '#f7d774', '#e8b800', '#f7d774', '#d9a400'].map((c, i) =>
    `<ellipse cx="100" cy="22" rx="8" ry="20" fill="${c}" ${S2} transform="rotate(${-60 + i * 30} 100 46)"/>`).join('');
  return svg('0 0 200 260', `
    ${mini}
    <circle cx="100" cy="46" r="14" fill="#e8b800" ${S2}/>
    <circle cx="100" cy="28" r="8" fill="#f2c94c" ${S2}/>
    <path d="M97 30 L100 35 L103 30 Z" fill="#f5a623"/>
    <path d="M44 76 Q12 80 22 110 Q30 128 52 124" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M44 76 Q12 80 22 110 Q30 128 52 124" fill="none" stroke="${gold}" stroke-width="10" stroke-linecap="round"/>
    <path d="M156 76 Q188 80 178 110 Q170 128 148 124" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M156 76 Q188 80 178 110 Q170 128 148 124" fill="none" stroke="${gold}" stroke-width="10" stroke-linecap="round"/>
    <path d="M40 60 L160 60 Q160 148 100 160 Q40 148 40 60 Z" fill="${gold}" ${S}/>
    <ellipse cx="100" cy="60" rx="60" ry="8" fill="#ffe27a" ${S}/>
    <path d="M58 76 Q60 120 84 142" fill="none" stroke="#fff6c8" stroke-width="7" stroke-linecap="round" opacity=".8"/>
    <rect x="88" y="158" width="24" height="26" fill="#e8b800" ${S}/>
    <path d="M66 198 L76 182 H124 L134 198 Z" fill="${gold}" ${S}/>
    <rect x="28" y="198" width="144" height="56" rx="8" fill="#8b5a2b" ${S}/>
    <rect x="40" y="206" width="120" height="40" rx="5" fill="#a86d36"/>
    <text x="100" y="224" text-anchor="middle" font-size="17" font-weight="700" fill="#fff4dc" font-family="Fredoka, sans-serif">BUILDING</text>
    <text x="100" y="242" text-anchor="middle" font-size="17" font-weight="700" fill="#fff4dc" font-family="Fredoka, sans-serif">TROPHY</text>`, 'overflow="visible"');
}

// --- Scenery ---------------------------------------------------------------

function tree(x, y, s, c1, c2) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-8" y="-10" width="16" height="60" fill="#6b4226" ${S}/>
    <circle cx="-22" cy="-24" r="30" fill="${c1}" ${S}/><circle cx="22" cy="-26" r="30" fill="${c2}" ${S}/>
    <circle cx="0" cy="-52" r="34" fill="${c1}" ${S}/></g>`;
}

function pumpkin(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 -30 Q4 -42 12 -44" stroke="#4f8226" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="-14" cy="0" rx="20" ry="26" fill="#e9791d" ${S}/>
    <ellipse cx="14" cy="0" rx="20" ry="26" fill="#e9791d" ${S}/>
    <ellipse cx="0" cy="0" rx="18" ry="28" fill="#f28c28" ${S}/></g>`;
}

function cloud(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".85">
    <circle cx="0" cy="0" r="30"/><circle cx="34" cy="-12" r="38"/><circle cx="72" cy="2" r="28"/><rect x="0" y="0" width="72" height="28"/></g>`;
}

export function backgroundSVG() {
  return svg('0 0 1600 900', `
    <circle cx="1030" cy="150" r="90" fill="#fff3c4" opacity=".55"/>
    <circle cx="1030" cy="150" r="58" fill="#ffd86b"/>
    ${cloud(180, 190, 1)}${cloud(1300, 230, 0.8)}${cloud(620, 300, 0.6)}
    <path d="M0 560 Q200 470 420 540 Q640 610 860 520 Q1080 440 1300 530 Q1460 590 1600 520 L1600 900 L0 900 Z" fill="#e0ad4f"/>
    ${tree(90, 520, 1, '#e67e22', '#c0392b')}${tree(1530, 500, 0.9, '#f1c40f', '#e67e22')}${tree(930, 470, 0.6, '#c0392b', '#e67e22')}
    <path d="M0 650 Q260 590 520 650 Q800 710 1080 640 Q1340 580 1600 650 L1600 900 L0 900 Z" fill="#a9b45a"/>
    <path d="M800 120 V748" stroke="#fff" stroke-width="6" stroke-dasharray="18 16" stroke-linecap="round" opacity=".6"/>
    <g>
      <rect x="640" y="690" width="124" height="66" rx="16" fill="#e8c25a" ${S}/>
      <path d="M660 700 V748 M690 696 V752 M720 696 V752 M748 700 V748" stroke="#c99a2e" stroke-width="4" stroke-linecap="round"/>
    </g>
    <rect x="0" y="748" width="1600" height="152" fill="#8a5a32"/>
    <rect x="0" y="744" width="1600" height="20" rx="8" fill="#7b9a3a"/>
    <path d="M820 830 Q960 800 1100 836 Q1260 870 1420 824 Q1500 808 1590 830" stroke="#4f8226" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${pumpkin(880, 820, 0.9)}${pumpkin(1010, 852, 1.1)}${pumpkin(1150, 828, 0.8)}${pumpkin(1300, 858, 1)}${pumpkin(1450, 826, 0.85)}${pumpkin(1560, 858, 0.7)}`);
}

export function leafSVG(color) {
  return svg('0 0 40 40', `
    <path d="M20 2 Q35 10 35 22 Q35 34 20 38 Q5 34 5 22 Q5 10 20 2 Z" fill="${color}" ${S2}/>
    <path d="M20 7 V38" stroke="${INK}" stroke-width="2"/>`);
}

export function muteIconSVG(muted) {
  const waves = muted
    ? `<path d="M38 22 L52 36 M52 22 L38 36" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    : `<path d="M38 20 Q46 29 38 38 M43 14 Q56 29 43 44" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  return svg('0 0 58 58', `<path d="M8 22 H18 L30 11 V47 L18 36 H8 Z" fill="${INK}" ${S}/>${waves}`);
}
