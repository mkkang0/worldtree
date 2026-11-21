// 배경(세계). 하늘 · 먼 풍경 · 땅까지 그린다. 장면 크기 300 x 360, 땅 높이 약 292.
// 새 배경: data/items/scenery.js의 world 아이템과 같은 id로 WORLDS에 함수 하나를 추가한다.
import { rng, n, linear, radial, glow, times } from './svg.js';

const W = 300;
const H = 360;

/* ---------- 공통 조각 ---------- */

function sky(uid, stops) {
  return `<defs>${linear(`sky-${uid}`, stops)}</defs><rect width="${W}" height="${H}" fill="url(#sky-${uid})"/>`;
}

// 먼 산 실루엣
function ridge(seed, baseY, amp, color, opacity) {
  const r = rng(seed);
  let d = `M0 ${H} L0 ${baseY}`;
  let prev = baseY - amp * r() * 0.5;
  d += ` L0 ${n(prev)}`;
  for (let x = 0; x < W; x += 75) {
    const next = baseY - amp * (0.2 + r() * 0.8);
    d += ` C${x + 25} ${n(prev - amp * 0.5)} ${x + 50} ${n(next - amp * 0.3)} ${x + 75} ${n(next)}`;
    prev = next;
  }
  return `<path d="${d} L${W} ${H}Z" fill="${color}" opacity="${opacity}"/>`;
}

function ground(uid, top, bottom, rim) {
  return (
    `<defs>${linear(`gd-${uid}`, [[0, top], [1, bottom]])}</defs>` +
    `<path d="M0 304 Q75 284 150 288 T300 300 V${H} H0Z" fill="url(#gd-${uid})"/>` +
    `<path d="M0 304 Q75 284 150 288 T300 300" fill="none" stroke="${rim}" stroke-width="1.2" opacity=".6"/>`
  );
}

function stars(seed, count, maxY, color = '#fff') {
  const r = rng(seed);
  return times(count, (i) => {
    const big = i % 7 === 0;
    return `<circle cx="${n(r() * W)}" cy="${n(r() * maxY)}" r="${big ? 1.4 : n(0.5 + r() * 0.6)}" fill="${color}" opacity="${n(0.4 + r() * 0.6)}" ${big ? 'class="twinkle"' : ''}/>`;
  });
}

function mist(uid, y, color, opacity) {
  return `<defs>${linear(`ms-${uid}-${y}`, [[0, color, 0], [0.5, color, opacity], [1, color, 0]])}</defs><rect y="${y - 26}" width="${W}" height="52" fill="url(#ms-${uid}-${y})"/>`;
}

// 하늘을 천천히 가로지르는 구름 (css .cloud-pass). delay는 초.
// 움직임을 끈 기기에서도 하늘에 고르게 보이도록 구름마다 쉬는 자리(x)를 둔다.
function cloud(y, s, color, opacity, delay, dur = 46) {
  const x = 40 + ((delay * 53) % 220);
  return (
    `<g class="cloud-pass" style="animation-duration:${dur * 1.6}s;animation-delay:-${delay * 1.6}s"><g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">` +
    `<ellipse cx="0" cy="0" rx="30" ry="9" fill="${color}"/><ellipse cx="-10" cy="-6" rx="14" ry="10" fill="${color}"/><ellipse cx="9" cy="-8" rx="16" ry="12" fill="${color}"/></g></g>`
  );
}

// 가끔 떨어지는 별똥별 (css .shoot)
function shootingStar(uid, x, y, delay, dur = 7) {
  return (
    `<defs>${linear(`st-${uid}-${x}`, [[0, '#ffffff', 0], [1, '#ffffff', 0.95]], [0, 0, 1, 0])}</defs>` +
    `<g class="shoot" style="animation-delay:${delay}s;animation-duration:${dur}s"><g transform="translate(${x} ${y}) rotate(25)">` +
    `<rect x="-46" y="-.8" width="46" height="1.6" rx=".8" fill="url(#st-${uid}-${x})"/><circle r="1.8" fill="#fff"/></g></g>`
  );
}

/* ---------- 시간대 (기본 배경) ---------- */

const dawn = (uid) =>
  sky(uid, [[0, '#f6d7d0'], [0.55, '#fbe9d2'], [1, '#f3efdc']]) +
  glow(`sun-${uid}`, 230, 210, 90, '#ffd9a0', 0.7) +
  cloud(70, 0.9, '#fff3ea', 0.75, 10) +
  ridge('dawn-a', 250, 40, '#c7b3bd', 0.5) +
  ridge('dawn-b', 272, 26, '#a9b8a1', 0.6) +
  mist(uid, 270, '#fff4e6', 0.6) +
  ground(uid, '#8fae7f', '#5d7d55', '#c9dcb2');

const day = (uid) =>
  sky(uid, [[0, '#cfe5f2'], [0.6, '#eef4ea'], [1, '#f1f3e2']]) +
  glow(`sun-${uid}`, 70, 70, 70, '#fff6d8', 0.8) +
  cloud(56, 1, '#ffffff', 0.85, 6) +
  cloud(104, 0.7, '#ffffff', 0.7, 28, 60) +
  ridge('day-a', 248, 44, '#a9c6c9', 0.55) +
  ridge('day-b', 270, 28, '#94b48c', 0.65) +
  ground(uid, '#86b072', '#56804c', '#c4e0a8');

const dusk = (uid) =>
  sky(uid, [[0, '#4a4a7a'], [0.45, '#c9817a'], [0.8, '#f2c38e'], [1, '#f6dcae']]) +
  glow(`sun-${uid}`, 90, 240, 80, '#ffcf8a', 0.85) +
  cloud(80, 0.9, '#f3b8a0', 0.6, 14, 54) +
  ridge('dusk-a', 252, 40, '#6b5470', 0.55) +
  ridge('dusk-b', 274, 26, '#5a5262', 0.7) +
  ground(uid, '#6a6a4f', '#3f4434', '#c99f7a');

const night = (uid) =>
  sky(uid, [[0, '#0d1430'], [0.6, '#1d2c4f'], [1, '#2b3d55']]) +
  stars('night', 70, 230) +
  shootingStar(uid, 70, 40, 3, 11) +
  glow(`moon-${uid}`, 232, 64, 40, '#e8ecff', 0.55) +
  `<circle cx="232" cy="64" r="11" fill="#f4f1e2"/><circle cx="237" cy="60" r="10" fill="#1a2747"/>` +
  ridge('night-a', 252, 40, '#1b2a3f', 0.8) +
  ridge('night-b', 274, 26, '#16233a', 0.9) +
  ground(uid, '#24402f', '#132219', '#4f7a5a');

export function timeOfDay(hour) {
  if (hour >= 5 && hour < 10) return dawn;
  if (hour >= 10 && hour < 17) return day;
  if (hour >= 17 && hour < 20) return dusk;
  return night;
}

/* ---------- 상점 배경 ---------- */

export const WORLDS = {
  'world-dawn': dawn,
  'world-day': day,
  'world-dusk': dusk,
  'world-night': night,

  'world-mist': (uid) =>
    sky(uid, [[0, '#dfe6e1'], [1, '#eef0e6']]) +
    ridge('mist-a', 220, 50, '#b6c4bb', 0.6) +
    mist(uid, 226, '#ffffff', 0.8) +
    ridge('mist-b', 252, 40, '#96ab9b', 0.65) +
    mist(uid, 258, '#ffffff', 0.75) +
    ridge('mist-c', 276, 24, '#7f9a84', 0.7) +
    ground(uid, '#7d9d74', '#4f6e4b', '#c7d8bd'),

  // 움직이는 배경
  'world-clouds': (uid) =>
    sky(uid, [[0, '#a9d3ef'], [0.6, '#dcecf3'], [1, '#eef4ea']]) +
    glow(`sun-${uid}`, 240, 60, 60, '#fff6d8', 0.8) +
    cloud(40, 1.2, '#ffffff', 0.95, 0, 38) +
    cloud(84, 0.8, '#ffffff', 0.85, 14, 30) +
    cloud(128, 1, '#ffffff', 0.8, 26, 44) +
    cloud(170, 0.6, '#ffffff', 0.7, 8, 26) +
    ridge('clouds-a', 252, 40, '#a3c3cc', 0.55) +
    ridge('clouds-b', 272, 26, '#8fb487', 0.65) +
    ground(uid, '#8ab873', '#56804c', '#c4e0a8'),

  'world-shooting': (uid) =>
    sky(uid, [[0, '#070b22'], [0.6, '#16234a'], [1, '#243a5c']]) +
    stars('shooting', 90, 240) +
    shootingStar(uid, 40, 30, 0, 5) +
    shootingStar(uid, 150, 20, 2.2, 6) +
    shootingStar(uid, 90, 90, 4, 7) +
    shootingStar(uid, 200, 60, 5.5, 8) +
    ridge('shoot-a', 254, 38, '#1b2a3f', 0.85) +
    ridge('shoot-b', 276, 24, '#14203a', 0.9) +
    ground(uid, '#22392d', '#111d17', '#4f7a5a'),

  'world-rain': (uid) => {
    const r = rng('rain');
    return (
      sky(uid, [[0, '#7f8f96'], [0.6, '#a9b5b2'], [1, '#c3ccc4']]) +
      ridge('rain-a', 246, 46, '#7d9284', 0.6) +
      mist(uid, 256, '#e6ece8', 0.55) +
      ridge('rain-b', 272, 28, '#647c6a', 0.7) +
      ground(uid, '#5f7d58', '#3d5539', '#9fbf94') +
      times(46, () => {
        const x = n(r() * W);
        const y = n(r() * 320);
        return `<line class="rain" x1="${x}" y1="${y}" x2="${n(x - 4)}" y2="${n(y + 14)}" stroke="#e8f2f8" stroke-width=".8" opacity=".55" style="animation-delay:-${n(r() * 1.2)}s;animation-duration:${n(0.8 + r() * 0.5)}s"/>`;
      }) +
      times(7, (i) => `<ellipse class="ripple" cx="${n(20 + r() * 260)}" cy="${n(310 + r() * 40)}" rx="7" ry="2" fill="none" stroke="#e8f2f8" stroke-width=".7" style="animation-delay:-${n(r() * 1.8)}s"/>`)
    );
  },

  'world-sea': (uid) => {
    const wave = (y, color, op, delay) =>
      `<path class="wave" style="animation-delay:-${delay}s" d="M-20 ${y} q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V${y + 40} H-20Z" fill="${color}" opacity="${op}"/>`;
    return (
      sky(uid, [[0, '#8fcbe8'], [0.55, '#d4ecf2'], [1, '#f4f0dc']]) +
      glow(`sun-${uid}`, 210, 110, 70, '#fff3c8', 0.85) +
      cloud(60, 0.9, '#ffffff', 0.85, 10, 50) +
      `<rect y="218" width="${W}" height="80" fill="#4f9cc4"/>` +
      `<ellipse cx="210" cy="232" rx="40" ry="3" fill="#fff6d0" opacity=".7" class="shimmer"/>` +
      wave(228, '#6fb6d8', 0.8, 0) +
      wave(244, '#5aa6cc', 0.85, 1.5) +
      wave(260, '#8fd0e8', 0.6, 3) +
      `<path d="M0 290 Q75 272 150 280 T300 286 V${H} H0Z" fill="#ecd9a8"/><path d="M0 290 Q75 272 150 280 T300 286" fill="none" stroke="#fff" stroke-width="2" opacity=".7" class="shimmer"/>`
    );
  },

  'world-sakura': (uid) => {
    const r = rng('sakura-petals');
    return (
      sky(uid, [[0, '#f7d6e2'], [0.6, '#fbe9ee'], [1, '#fdf3ef']]) +
      ridge('sak-a', 250, 38, '#e8b6c8', 0.6) +
      ridge('sak-b', 272, 24, '#d79ab2', 0.6) +
      times(26, () => `<ellipse cx="${n(r() * W)}" cy="${n(r() * 280)}" rx="2.6" ry="1.6" fill="#ffffff" opacity="${n(0.5 + r() * 0.5)}" transform="rotate(${n(r() * 180)} ${n(r() * W)} ${n(r() * 280)})"/>`) +
      ground(uid, '#c9a2b0', '#9a7385', '#f4d7e1')
    );
  },

  'world-snow': (uid) =>
    sky(uid, [[0, '#c7d6e8'], [0.7, '#e8eef5'], [1, '#f4f7fa']]) +
    stars('snow', 30, 260, '#ffffff') +
    ridge('snow-a', 248, 46, '#dbe4ee', 0.9) +
    ridge('snow-b', 272, 28, '#c4d2e0', 0.9) +
    ground(uid, '#f4f7fb', '#cfdbe7', '#ffffff'),

  'world-golden': (uid) =>
    sky(uid, [[0, '#f0c987'], [0.6, '#f8e2b4'], [1, '#fbf0d6']]) +
    glow(`sun-${uid}`, 150, 230, 110, '#fff0c0', 0.9) +
    ridge('gold-a', 256, 30, '#d9a85e', 0.55) +
    ground(uid, '#d8b25a', '#a77c2c', '#fbe3a2') +
    times(18, (i) => `<path d="M${10 + i * 16} 330 q2 -14 0 -22" stroke="#f6d27a" stroke-width="1.2" fill="none" opacity=".7"/>`),

  'world-cosmos': (uid) =>
    sky(uid, [[0, '#0b0820'], [0.5, '#1d1440'], [1, '#2b1f4f']]) +
    `<defs>${radial(`neb-${uid}`, [[0, '#b06ad9', 0.5], [0.5, '#5b4bd1', 0.25], [1, '#000', 0]])}</defs>` +
    `<ellipse cx="110" cy="120" rx="160" ry="70" fill="url(#neb-${uid})" transform="rotate(-20 110 120)"/>` +
    stars('cosmos', 110, 280) +
    ridge('cos-a', 270, 22, '#1a1430', 0.9) +
    ground(uid, '#2c2550', '#16122c', '#8a7ad9'),

  'world-library': (uid) => {
    const books = ['#a8553f', '#3f5f8a', '#c9a24a', '#4f7d5b', '#7d5aa0', '#c27a4a'];
    let shelves = '';
    [40, 112, 184].forEach((y, row) => {
      shelves += `<rect x="0" y="${y + 52}" width="${W}" height="7" fill="#6b4a2f"/>`;
      for (let i = 0; i < 22; i++) {
        const h = 36 + ((i * 7 + row * 5) % 14);
        shelves += `<rect x="${4 + i * 13.5}" y="${y + 52 - h}" width="11" height="${h}" rx="1.5" fill="${books[(i + row) % books.length]}" opacity=".6"/>`;
      }
    });
    return (
      sky(uid, [[0, '#3a2a1e'], [1, '#5c4330']]) +
      shelves +
      glow(`lamp-${uid}`, 150, 120, 160, '#ffd99a', 0.45) +
      ground(uid, '#6b4f36', '#3e2c1d', '#c9a26a')
    );
  },
};

export function worldArt(id, uid, hour) {
  return (WORLDS[id] || timeOfDay(hour))(uid);
}
