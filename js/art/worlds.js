// 배경(세계). 하늘 · 먼 풍경 · 땅까지 그린다. 장면 크기 300 x 360, 땅 높이 약 292.
// 새 배경: data/items/scenery.js의 world 아이템과 같은 id로 WORLDS에 함수 하나를 추가한다.
import { rng, n, linear, radial, glow, times, PAINT, withPaint } from './svg.js';

const W = 300;
const H = 360;

/* ---------- 공통 조각 ---------- */

function sky(uid, stops) {
  return `<defs>${linear(`sky-${uid}`, stops)}</defs><rect width="${W}" height="${H}" fill="url(#sky-${uid})"/>`;
}

// 먼 산 실루엣
function ridge(seed, baseY, amp, color, opacity) {
  const r = rng(seed);
  let d = `M-8 ${H} L-8 ${baseY}`;
  let prev = baseY - amp * r() * 0.5;
  d += ` L0 ${n(prev)}`;
  for (let x = 0; x < W; x += 75) {
    const next = baseY - amp * (0.2 + r() * 0.8);
    d += ` C${x + 25} ${n(prev - amp * 0.5)} ${x + 50} ${n(next - amp * 0.3)} ${x + 75} ${n(next)}`;
    prev = next;
  }
  return `<path d="${d} L${W + 8} ${n(prev)} L${W + 8} ${H}Z" fill="${color}" opacity="${opacity}" filter="${PAINT}"/>`;
}

// 땅 윗선 (0 304 → 150 288 → 300 300 곡선)의 높이
function rimY(x) {
  if (x < 150) {
    const t = x / 150;
    return (1 - t) * (1 - t) * 304 + 2 * (1 - t) * t * 284 + t * t * 288;
  }
  const t = (x - 150) / 150;
  return (1 - t) * (1 - t) * 288 + 2 * (1 - t) * t * 292 + t * t * 300;
}

function ground(uid, top, bottom, rim) {
  const r = rng('ground-' + top);
  // 가장자리를 따라 난 풀 (땅 색에 맞춘 rim 색)
  const tufts = times(30, (i) => {
    const x = n(4 + i * 10 + r() * 6);
    const y = n(rimY(x) + 1 + r() * 3);
    const s = n(0.7 + r() * 0.6);
    return `<path d="M${x} ${y} q-1.5 -4 -3.5 -${n(6 * s)} M${x} ${y} q0 -5 .8 -${n(8 * s)} M${x} ${y} q1.4 -3.5 3.2 -${n(5.5 * s)}" stroke="${rim}" stroke-width=".9" stroke-linecap="round" fill="none" opacity=".65"/>`;
  });
  // 앞쪽 땅에 흩어진 작은 돌·풀 그림자
  const bits = times(9, () => {
    const x = n(r() * W);
    const y = n(318 + r() * 36);
    return `<ellipse cx="${x}" cy="${y}" rx="${n(2 + r() * 3)}" ry="${n(1 + r() * 1.2)}" fill="${bottom}" opacity=".55"/>`;
  });
  return (
    `<defs>${linear(`gd-${uid}`, [[0, top], [1, bottom]])}${linear(`gf-${uid}`, [[0, '#000', 0], [1, '#000', 0.22]])}` +
    `<clipPath id="gc-${uid}"><path d="M0 304 Q75 284 150 288 T300 300 V${H} H0Z"/></clipPath>` +
    `<filter id="gn-${uid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.09 0.3" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 -0.6"/></filter></defs>` +
    `<path d="M-8 305 Q75 284 150 288 T308 300 V${H + 8} H-8Z" fill="url(#gd-${uid})" filter="${PAINT}"/>` +
    `<rect y="282" width="${W}" height="${H - 282}" filter="url(#gn-${uid})" clip-path="url(#gc-${uid})" opacity=".22"/>` +
    bits +
    `<rect y="318" width="${W}" height="${H - 318}" fill="url(#gf-${uid})"/>` +
    `<path d="M0 304 Q75 284 150 288 T300 300" fill="none" stroke="${rim}" stroke-width="1.2" opacity=".6"/>` +
    tufts
  );
}

// 먼 숲: 산 아래에 늘어선 작은 나무 실루엣
function treeline(seed, baseY, color, opacity) {
  const r = rng('trees-' + seed);
  let s = '';
  for (let x = -6; x < W + 6; x += 7 + r() * 9) {
    const h = 7 + r() * 12;
    s +=
      r() > 0.45
        ? `<path d="M${n(x)} ${baseY} l${n(h * 0.32)} -${n(h)} l${n(h * 0.32)} ${n(h)}Z"/>`
        : `<ellipse cx="${n(x + h * 0.3)}" cy="${n(baseY - h * 0.45)}" rx="${n(h * 0.38)}" ry="${n(h * 0.55)}"/>`;
  }
  return `<g fill="${color}" opacity="${opacity}" filter="${PAINT}">${s}<rect x="-8" y="${baseY - 1}" width="${W + 16}" height="${H - baseY}"/></g>`;
}

// 해에서 퍼지는 빛줄기 (css .ray로 천천히 밝아졌다 어두워진다)
function sunRays(uid, x, y, color, opacity = 0.16) {
  const rays = times(8, (i) => {
    const a = -150 + i * 17;
    return `<path d="M${x} ${y} L${n(x + Math.cos((a * Math.PI) / 180) * 420)} ${n(y + Math.sin(((a + 3) * Math.PI) / 180) * 420)} L${n(x + Math.cos(((a + 5) * Math.PI) / 180) * 420)} ${n(y + Math.sin(((a + 8) * Math.PI) / 180) * 420)}Z"/>`;
  });
  return `<defs>${radial(`sr-${uid}`, [[0, color, opacity], [1, color, 0]], { cx: x / W, cy: y / H, r: 1 })}</defs><g class="ray" fill="url(#sr-${uid})">${rays}</g>`;
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
    `<ellipse cx="2" cy="3" rx="30" ry="7" fill="#000" opacity=".06"/>` +
    `<ellipse cx="0" cy="0" rx="30" ry="9" fill="${color}"/><ellipse cx="-10" cy="-6" rx="14" ry="10" fill="${color}"/><ellipse cx="9" cy="-8" rx="16" ry="12" fill="${color}"/><ellipse cx="22" cy="-2" rx="9" ry="7" fill="${color}"/>` +
    `<ellipse cx="4" cy="4" rx="26" ry="4" fill="#9fb4c8" opacity=".25"/><ellipse cx="4" cy="-14" rx="9" ry="4" fill="#ffffff" opacity=".7"/><ellipse cx="-12" cy="-11" rx="6" ry="3" fill="#ffffff" opacity=".6"/></g></g>`
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
  sunRays(uid, 230, 210, '#ffe2b8', 0.2) +
  cloud(70, 0.9, '#fff3ea', 0.75, 10) +
  ridge('dawn-a', 250, 40, '#c7b3bd', 0.5) +
  ridge('dawn-b', 272, 26, '#a9b8a1', 0.6) +
  treeline('dawn', 282, '#8ea489', 0.55) +
  mist(uid, 270, '#fff4e6', 0.6) +
  ground(uid, '#8fae7f', '#5d7d55', '#c9dcb2');

const day = (uid) =>
  sky(uid, [[0, '#cfe5f2'], [0.6, '#eef4ea'], [1, '#f1f3e2']]) +
  glow(`sun-${uid}`, 70, 70, 70, '#fff6d8', 0.8) +
  sunRays(uid, 70, 70, '#fff6d8', 0.22) +
  cloud(56, 1, '#ffffff', 0.85, 6) +
  cloud(104, 0.7, '#ffffff', 0.7, 28, 60) +
  ridge('day-a', 248, 44, '#a9c6c9', 0.55) +
  ridge('day-b', 270, 28, '#94b48c', 0.65) +
  treeline('day', 282, '#6f9a6a', 0.6) +
  ground(uid, '#86b072', '#56804c', '#c4e0a8');

const dusk = (uid) =>
  sky(uid, [[0, '#4a4a7a'], [0.45, '#c9817a'], [0.8, '#f2c38e'], [1, '#f6dcae']]) +
  glow(`sun-${uid}`, 90, 240, 80, '#ffcf8a', 0.85) +
  cloud(80, 0.9, '#f3b8a0', 0.6, 14, 54) +
  ridge('dusk-a', 252, 40, '#6b5470', 0.55) +
  ridge('dusk-b', 274, 26, '#5a5262', 0.7) +
  treeline('dusk', 284, '#3f3a48', 0.75) +
  ground(uid, '#6a6a4f', '#3f4434', '#c99f7a');

const night = (uid) =>
  sky(uid, [[0, '#0d1430'], [0.6, '#1d2c4f'], [1, '#2b3d55']]) +
  stars('night', 70, 230) +
  shootingStar(uid, 70, 40, 3, 11) +
  glow(`moon-${uid}`, 232, 64, 40, '#e8ecff', 0.55) +
  `<circle cx="232" cy="64" r="11" fill="#f4f1e2"/><circle cx="229" cy="62" r="1.8" fill="#dcd6c0"/><circle cx="231" cy="69" r="1.2" fill="#dcd6c0"/><circle cx="237" cy="60" r="10" fill="#1a2747"/>` +
  ridge('night-a', 252, 40, '#1b2a3f', 0.8) +
  ridge('night-b', 274, 26, '#16233a', 0.9) +
  treeline('night', 284, '#0f1a2c', 0.9) +
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
    sunRays(uid, 240, 60, '#fff6d8', 0.18) +
    ridge('clouds-a', 252, 40, '#a3c3cc', 0.55) +
    ridge('clouds-b', 272, 26, '#8fb487', 0.65) +
    treeline('clouds', 282, '#6f9a6a', 0.6) +
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
      treeline('rain', 282, '#4f6a54', 0.75) +
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

  // ✨ 전설: 하늘섬 — 세계수가 구름 위에 떠 있는 섬에 서 있다. 아래로는 바다와 작은 섬들
  'world-skyisland': (uid) => {
    const r = rng('skyisland');
    // 멀리 바다 위의 작은 섬
    const islet = (x, y, w) =>
      `<g filter="${PAINT}"><ellipse cx="${x}" cy="${y + 1.5}" rx="${n(w * 1.15)}" ry="${n(w * 0.28)}" fill="#e9ddb0" opacity=".9"/>` +
      `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${n(w * 0.32)}" fill="#4f9a5a"/>` +
      `<ellipse cx="${n(x - w * 0.25)}" cy="${n(y - w * 0.16)}" rx="${n(w * 0.5)}" ry="${n(w * 0.26)}" fill="#6fb86a"/></g>`;
    // 구름 덩어리 (크고 몽글몽글)
    const puff = (x, y, s, o = 0.95) =>
      `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}" filter="${PAINT}"><ellipse cx="0" cy="0" rx="34" ry="13" fill="#ffffff"/><ellipse cx="-16" cy="-8" rx="16" ry="12" fill="#ffffff"/><ellipse cx="6" cy="-14" rx="20" ry="16" fill="#ffffff"/><ellipse cx="22" cy="-5" rx="14" ry="10" fill="#f3f8ff"/><ellipse cx="2" cy="4" rx="30" ry="6" fill="#dce9f5" opacity=".7"/></g>`;
    // 섬 아래로 떨어지는 폭포
    const fall = (x, y0, w) =>
      `<path d="M${x} ${y0} q-2 ${n((H - y0) / 2)} ${n(-3 - w)} ${H - y0 + 10} h${n(w * 2 + 3)} q0 ${n(-(H - y0) / 2)} ${-w} ${n(-(H - y0) - 10)}Z" fill="#eef8ff" opacity=".85" class="shimmer"/>` +
      `<ellipse cx="${x}" cy="${n(y0 + 1)}" rx="${n(w + 2)}" ry="2" fill="#ffffff"/>`;
    return (
      sky(uid, [[0, '#3f8fd6'], [0.45, '#8cc6ef'], [0.62, '#cfe8f7'], [1, '#e9f5fb']]) +
      glow(`isun-${uid}`, 62, 40, 70, '#fffbe6', 0.9) +
      sunRays(uid, 62, 40, '#ffffff', 0.18) +
      puff(30, 70, 1.3) + puff(262, 52, 1.5) + puff(190, 112, 0.8, 0.85) +
      // 아래 멀리 보이는 바다
      `<defs>${linear(`sea-${uid}`, [[0, '#7cc4e8'], [1, '#2f7fb8']])}</defs>` +
      `<rect y="196" width="${W}" height="${H - 196}" fill="url(#sea-${uid})"/>` +
      `<rect y="196" width="${W}" height="3" fill="#ffffff" opacity=".5"/>` +
      islet(42, 214, 22) + islet(120, 206, 10) + islet(248, 220, 26) + islet(196, 208, 8) +
      puff(70, 236, 0.9, 0.9) + puff(240, 246, 1, 0.9) +
      times(14, () => `<ellipse class="shimmer" cx="${n(r() * W)}" cy="${n(204 + r() * 70)}" rx="${n(3 + r() * 6)}" ry=".7" fill="#ffffff" opacity=".6" style="animation-delay:-${n(r() * 2.6)}s"/>`) +
      // 떠 있는 섬: 아래 바위 절벽 → 폭포 → 윗면 풀밭
      `<defs>${linear(`rk-${uid}`, [[0, '#8a6e52'], [0.5, '#6b5440'], [1, '#4a3a2c']])}${linear(`ig-${uid}`, [[0, '#86c070'], [1, '#4f8a48']])}</defs>` +
      `<g filter="${PAINT}"><path d="M-12 312 Q60 318 150 320 T312 312 L300 330 Q250 352 214 360 L86 360 Q42 348 2 330Z" fill="url(#rk-${uid})"/>` +
      `<path d="M10 322 Q70 330 130 332 M40 336 Q100 344 160 342 M180 334 Q230 330 290 322" fill="none" stroke="#3d2f24" stroke-width="1" opacity=".45"/></g>` +
      fall(18, 318, 5) + fall(286, 316, 6) + fall(118, 330, 3) +
      puff(30, 352, 1.1, 0.95) + puff(278, 350, 1.2, 0.95) + puff(150, 362, 1.4, 0.9) +
      `<path d="M-12 300 Q75 282 150 288 T312 298 L312 314 Q150 326 -12 314Z" fill="url(#ig-${uid})" filter="${PAINT}"/>` +
      `<path d="M-12 300 Q75 282 150 288 T312 298" fill="none" stroke="#c4e6a8" stroke-width="1.4" opacity=".7"/>` +
      times(26, (i) => {
        const x = n(2 + i * 11.5 + r() * 5);
        const y = n(rimY(Math.min(299, x)) - 1 + r() * 4);
        return `<path d="M${x} ${y} q-1.5 -4 -3.5 -6 M${x} ${y} q0 -5 .8 -8 M${x} ${y} q1.4 -3.5 3.2 -5.5" stroke="#cfeaa8" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".7"/>`;
      }) +
      times(8, (i) => `<circle cx="${n(20 + r() * 260)}" cy="${n(300 + r() * 10)}" r="1.4" fill="${['#fff', '#ffe08a', '#ffc6d9'][i % 3]}"/>`)
    );
  },

  // ✨ 전설 배경
  'world-celestial': (uid) => {
    const r = rng('celestial');
    const island = (x, y, s) =>
      `<g transform="translate(${x} ${y}) scale(${s})"><g class="float-slow">` +
      `<path d="M-26 0 Q0 -7 26 0 Q14 18 0 28 Q-14 18 -26 0Z" fill="#b48c63"/><path d="M-26 0 Q0 -9 26 0 Q0 5 -26 0Z" fill="#f6e3a6"/>` +
      `<path d="M10 4 q2 16 0 34" stroke="#fff7e0" stroke-width="1.6" opacity=".8" class="shimmer"/>` +
      `<circle cx="-8" cy="-5" r="4" fill="#ffd6e4"/><circle cx="0" cy="-7" r="5" fill="#fff0c2"/></g></g>`;
    return (
      sky(uid, [[0, '#f7c6a8'], [0.35, '#fbe3c0'], [0.7, '#fff6e2'], [1, '#fff9ee']]) +
      sunRays(uid, 150, 40, '#fff1c4', 0.3) +
      glow(`cel-${uid}`, 150, 40, 120, '#fff4cc', 0.9) +
      island(60, 96, 0.9) +
      island(246, 128, 0.7) +
      cloud(160, 1.3, '#ffffff', 0.9, 4, 70) +
      cloud(200, 1.1, '#ffe8d6', 0.85, 30, 80) +
      // 구름 바다
      times(9, (i) => `<ellipse cx="${n(i * 38 - 6)}" cy="${n(268 + (i % 2) * 6)}" rx="34" ry="16" fill="#ffffff" opacity=".92"/>`) +
      times(9, (i) => `<ellipse cx="${n(i * 38 + 12)}" cy="${n(262 + (i % 3) * 4)}" rx="22" ry="10" fill="#fff6e6"/>`) +
      times(22, (i) => `<circle class="twinkle" cx="${n(r() * W)}" cy="${n(r() * 240)}" r="${n(0.8 + r() * 1.4)}" fill="#fffbe0" style="animation-delay:-${n(r() * 3)}s"/>`) +
      ground(uid, '#f3d98f', '#c9a24a', '#fff3c4')
    );
  },

  'world-galaxy': (uid) => {
    const r = rng('galaxy');
    // 비스듬히 지나가는 은하수 띠
    const band = times(160, () => {
      const t = r();
      const x = t * 340 - 20;
      const y = 40 + t * 170 + (r() - 0.5) * (30 + r() * 30);
      return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.3 + r() * 0.8)}" fill="#fff" opacity="${n(0.3 + r() * 0.7)}"/>`;
    });
    return (
      sky(uid, [[0, '#05041a'], [0.55, '#140d3a'], [1, '#22184a']]) +
      `<defs>${radial(`mw-${uid}`, [[0, '#d9c8ff', 0.55], [0.4, '#8a6fe0', 0.3], [1, '#2a1f6a', 0]])}${radial(`nb-${uid}`, [[0, '#ff8fc8', 0.4], [1, '#ff8fc8', 0]])}</defs>` +
      `<ellipse cx="150" cy="125" rx="210" ry="38" fill="url(#mw-${uid})" transform="rotate(27 150 125)"/>` +
      `<ellipse cx="90" cy="80" rx="60" ry="26" fill="url(#nb-${uid})" transform="rotate(20 90 80)" class="shimmer"/>` +
      band +
      stars('galaxy', 50, 260) +
      times(8, (i) => `<g class="twinkle" style="animation-delay:-${n(i * 0.4)}s">${glow(`gs-${uid}-${i}`, n(r() * W), n(r() * 230), 6, '#cfe0ff', 0.8)}</g>`) +
      shootingStar(uid, 60, 30, 1, 6) +
      shootingStar(uid, 190, 70, 3.5, 8) +
      ridge('gal-a', 262, 34, '#120c2e', 0.95) +
      treeline('galaxy', 284, '#0b0820', 0.95) +
      ground(uid, '#1c163c', '#0d0a1e', '#7d6bd9')
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
    sunRays(uid, 150, 230, '#fff4cc', 0.22) +
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

// 배경마다 빛: color = 장면 전체에 얹는 빛 색, wash = 그 세기, halo = 정령의 은은한 빛 세기
// (밤처럼 어두운 곳에서는 정령이 작은 등불처럼 빛나고, 낮에는 빛을 줄여 배경에 녹아든다)
const LIGHT = {
  dawn: { color: '#ffcdb8', wash: 0.16, halo: 0.25 },
  day: { color: '#fff1d6', wash: 0.06, halo: 0.12 },
  dusk: { color: '#f0a070', wash: 0.24, halo: 0.3 },
  night: { color: '#6f82c4', wash: 0.36, halo: 0.55 },
  'world-mist': { color: '#dfe6e1', wash: 0.12, halo: 0.18 },
  'world-sakura': { color: '#ffcadb', wash: 0.12, halo: 0.18 },
  'world-snow': { color: '#d9e6f7', wash: 0.12, halo: 0.2 },
  'world-golden': { color: '#ffd486', wash: 0.2, halo: 0.25 },
  'world-cosmos': { color: '#9d86e0', wash: 0.32, halo: 0.55 },
  'world-library': { color: '#ffc982', wash: 0.24, halo: 0.35 },
  'world-clouds': { color: '#fff1d6', wash: 0.06, halo: 0.12 },
  'world-rain': { color: '#a3b3b8', wash: 0.22, halo: 0.25 },
  'world-shooting': { color: '#6f82c4', wash: 0.36, halo: 0.55 },
  'world-sea': { color: '#fff0cc', wash: 0.08, halo: 0.12 },
  'world-celestial': { color: '#ffdcb8', wash: 0.12, halo: 0.3 },
  'world-galaxy': { color: '#8f80e0', wash: 0.36, halo: 0.6 },
  'world-skyisland': { color: '#e8f4ff', wash: 0.06, halo: 0.12 },
};
const TIME_LIGHT = (hour) => (hour >= 5 && hour < 10 ? LIGHT.dawn : hour >= 10 && hour < 17 ? LIGHT.day : hour >= 17 && hour < 20 ? LIGHT.dusk : LIGHT.night);
export const lightOf = (id, hour) => LIGHT[id] || (WORLDS[id] ? LIGHT.day : TIME_LIGHT(hour));

export function worldArt(id, uid, hour) {
  return withPaint((WORLDS[id] || timeOfDay(hour))(uid), `w${uid}`, { scale: 4, freq: 0.06, seed: 9 });
}
