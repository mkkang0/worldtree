// 나의 섬 지도: 가로로 넓은 떠 있는 섬. 가운데 세계수, 양옆에 건물 자리 8곳.
// 크기 900 x 390. 섬 윗면 높이는 islandTop(x). 건물 자리 위치는 LOTS (features/island.js가 눌림 버튼을 같은 자리에 둔다).
import { nextUid, rng, n, linear, glow, times, hueDefs, tint, withPaint, PAINT } from './svg.js';
import { treeArt } from './tree.js';
import { leafTree } from './leaves.js';
import { bloomArt } from './blooms.js';
import { ornamentArt } from './ornaments.js';
import { spiritArt } from './spirit.js';
import { buildingArt, constructionArt, levelBadge, upgradeRing } from './buildings.js';
import { HUES, placed } from '../data/items/index.js';

export const MAP = { w: 900, h: 390 };
const MID = 450;

// 섬 윗면 높이: 가운데가 조금 높고 양끝으로 내려간다
export const islandTop = (x) => n(300 + 20 * ((x - MID) / 440) ** 2);

// 건물 자리 (세계수 뿌리를 피해 양옆에 넷씩)
export const LOTS = [60, 134, 208, 282, 618, 692, 766, 840].map((x) => ({ x, y: islandTop(x) }));

// paint: 움직이지 않는 구름만 붓 질감 (움직이는 구름은 매 프레임 다시 계산되지 않게 빼 둔다)
const puff = (x, y, s, o = 0.95, paint = true) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"${paint ? ` filter="${PAINT}"` : ''}><ellipse rx="34" ry="13" fill="#fff"/><ellipse cx="-16" cy="-8" rx="16" ry="12" fill="#fff"/><ellipse cx="6" cy="-14" rx="20" ry="16" fill="#fff"/><ellipse cx="22" cy="-5" rx="14" ry="10" fill="#f3f8ff"/><ellipse cx="2" cy="4" rx="30" ry="6" fill="#dce9f5" opacity=".7"/></g>`;

const islet = (x, y, w) =>
  `<g filter="${PAINT}"><ellipse cx="${x}" cy="${y + 1.5}" rx="${n(w * 1.15)}" ry="${n(w * 0.28)}" fill="#e9ddb0" opacity=".9"/><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${n(w * 0.32)}" fill="#4f9a5a"/><ellipse cx="${n(x - w * 0.25)}" cy="${n(y - w * 0.16)}" rx="${n(w * 0.5)}" ry="${n(w * 0.26)}" fill="#6fb86a"/></g>`;

// theme: data/isles.js ISLE_THEMES (섬마다 하늘·바다·풀밭 색). 없는 값은 본섬 기본색
const DEFAULT_THEME = { sky: ['#3f8fd6', '#8cc6ef', '#cfe8f7', '#e9f5fb'], sea: ['#7cc4e8', '#2f7fb8'], grass: ['#8ccc72', '#4f8a48'], rim: '#c4e6a8' };

function backdrop(uid, th) {
  const r = rng('island-map');
  return (
    `<defs>${linear(`isk-${uid}`, [[0, th.sky[0]], [0.5, th.sky[1]], [0.66, th.sky[2]], [1, th.sky[3]]])}${linear(`isea-${uid}`, [[0, th.sea[0]], [1, th.sea[1]]])}</defs>` +
    `<rect width="${MAP.w}" height="${MAP.h}" fill="url(#isk-${uid})"/>` +
    glow(`isun-${uid}`, 140, 46, 80, '#fffbe6', 0.9) +
    `<g class="cloud-pass" style="animation-duration:120s">${puff(80, 70, 1.4, 0.95, false)}${puff(560, 50, 1.6, 0.95, false)}</g>` +
    puff(300, 92, 1.1, 0.9) + puff(800, 84, 1.3, 0.9) +
    `<rect y="200" width="${MAP.w}" height="${MAP.h - 200}" fill="url(#isea-${uid})"/><rect y="200" width="${MAP.w}" height="3" fill="#fff" opacity=".5"/>` +
    islet(70, 220, 26) + islet(250, 210, 12) + islet(640, 214, 18) + islet(860, 224, 28) + islet(470, 206, 9) +
    times(20, () => `<ellipse class="shimmer" cx="${n(r() * MAP.w)}" cy="${n(208 + r() * 80)}" rx="${n(3 + r() * 7)}" ry=".7" fill="#fff" opacity=".6" style="animation-delay:-${n(r() * 2.6)}s"/>`) +
    puff(150, 250, 1, 0.85) + puff(760, 246, 1.1, 0.85)
  );
}

function island(uid, th) {
  const r = rng('island-ground');
  let topEdge = '';
  let cliffEdge = '';
  for (let x = -10; x <= MAP.w + 10; x += 30) {
    topEdge += ` L${x} ${islandTop(x)}`;
    cliffEdge += ` L${x} ${n(islandTop(x) + 12)}`;
  }
  const fall = (x, w) => {
    const y0 = islandTop(x) + 14;
    return `<path d="M${x} ${y0} q-2 ${n((MAP.h - y0) / 2)} ${-3 - w} ${MAP.h - y0 + 10} h${w * 2 + 3} q0 ${n(-(MAP.h - y0) / 2)} ${-w} ${n(-(MAP.h - y0) - 10)}Z" fill="#eef8ff" opacity=".85" class="shimmer"/>`;
  };
  return (
    `<defs>${linear(`irk-${uid}`, [[0, '#8a6e52'], [0.5, '#6b5440'], [1, '#4a3a2c']])}${linear(`ig-${uid}`, [[0, th.grass[0]], [1, th.grass[1]]])}</defs>` +
    // 아래 바위 절벽 (가운데가 깊게)
    `<g filter="${PAINT}"><path d="M-10 ${n(islandTop(-10) + 12)}${cliffEdge} L${MAP.w + 10} ${n(islandTop(MAP.w + 10) + 30)} Q760 360 600 376 L300 376 Q140 360 -10 ${n(islandTop(-10) + 30)}Z" fill="url(#irk-${uid})"/>` +
    `<path d="M40 338 Q200 350 330 354 M520 352 Q700 348 860 336 M200 366 Q450 378 700 366" fill="none" stroke="#3d2f24" stroke-width="1.2" opacity=".4"/></g>` +
    fall(26, 5) + fall(874, 6) + fall(330, 3) + fall(570, 4) +
    puff(60, 382, 1.4) + puff(240, 392, 1.6) + puff(450, 396, 1.8) + puff(660, 392, 1.6) + puff(850, 384, 1.4) +
    // 윗면 풀밭
    `<path d="M-10 ${islandTop(-10)}${topEdge} L${MAP.w + 10} ${islandTop(MAP.w + 10) + 16} L-10 ${islandTop(-10) + 16}Z" fill="url(#ig-${uid})" filter="${PAINT}"/>` +
    `<path d="M-10 ${islandTop(-10)}${topEdge}" fill="none" stroke="${th.rim}" stroke-width="1.6" opacity=".75"/>` +
    times(60, (i) => {
      const x = n(4 + i * 15 + r() * 6);
      const y = n(islandTop(x) + 1 + r() * 3);
      return `<path d="M${x} ${y} q-1.5 -4 -3.5 -6 M${x} ${y} q0 -5 .8 -8 M${x} ${y} q1.4 -3.5 3.2 -5.5" stroke="${th.rim}" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".7"/>`;
    }) +
    times(22, (i) => `<circle cx="${n(r() * MAP.w)}" cy="${n(304 + r() * 10)}" r="1.4" fill="${['#fff', '#ffe08a', '#ffc6d9'][i % 3]}"/>`)
  );
}

// 빈 자리 · 잠긴 자리 표시
const emptyLot = (x, y) =>
  `<ellipse cx="${x}" cy="${y + 2}" rx="24" ry="6" fill="#ffffff" opacity=".35" stroke="#ffffff" stroke-width="1.4" stroke-dasharray="4 3"/>` +
  `<g class="float" style="animation-duration:2.6s"><circle cx="${x}" cy="${y - 18}" r="12" fill="#fffaf0" opacity=".92"/><path d="M${x - 6} ${y - 18} h12 M${x} ${y - 24} v12" stroke="#b48c43" stroke-width="2.4" stroke-linecap="round"/></g>`;
const lockedLot = (x, y) =>
  `<ellipse cx="${x}" cy="${y + 2}" rx="20" ry="5" fill="#000" opacity=".1"/>` +
  `<path d="M${x - 14} ${y + 1} q4 -9 9 -3 q4 -8 10 -1 q5 -6 9 4Z" fill="#7a8a6a" opacity=".7"/>` +
  `<g opacity=".75"><rect x="${x - 5}" y="${y - 16}" width="10" height="8" rx="1.5" fill="#fffaf0"/><path d="M${x - 3} ${y - 16} v-2.5 a3 3 0 0 1 6 0 v2.5" fill="none" stroke="#fffaf0" stroke-width="1.6"/></g>`;

// 주민이 거니는 자리 (건물과 세계수 사이)
const STROLL = [98, 172, 246, 352, 548, 656, 730, 804];

// 우정 하트 3개부터 꽃 화관, 5개(단짝)면 나비넥타이도 (core/island.js CROWN_AT, HEART_MAX)
function residentsArt(residents, tree, uid) {
  return residents
    .map((r, i) => {
      const x = STROLL[i % STROLL.length];
      const y = islandTop(x) + 4;
      const dur = (7 + (i % 3) * 2.5).toFixed(1);
      const wardrobe = (r.hearts || 0) >= 3 ? { hat: 'hat-flower', ...((r.hearts || 0) >= 5 ? { neck: 'neck-bow' } : {}) } : {};
      return `<g class="stroll" style="animation-duration:${dur}s;animation-delay:-${(i * 1.7).toFixed(1)}s">` +
        spiritArt({ x, y, scale: 0.34, mood: 'happy', wardrobe, hues: {}, tree, uid: `${uid}-r${i}`, body: r.color, light: { color: '#fff1d6', wash: 0.04, halo: 0.08 } }) +
        `</g>`;
    })
    .join('');
}

// 축제 깃발: 하늘을 가로지르는 두 줄 (세계수 뒤)
function bunting(colors) {
  const line = (x1, x2) => {
    const sag = 46;
    const y = 150;
    let s = `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}" fill="none" stroke="#fff" stroke-width="1.4" opacity=".85"/>`;
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const x = n((1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2);
      const yy = n((1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag * 2) + t * t * y);
      s += `<path class="swing" style="transform-origin:${x}px ${yy}px;animation-delay:-${(i * 0.37).toFixed(2)}s" d="M${x - 7} ${yy} h14 l-7 14Z" fill="${colors[i % colors.length]}" stroke="#00000014"/>`;
    }
    return s;
  };
  return `<g>${line(14, 420)}${line(480, 886)}</g>`;
}

// 축제마다 날리는 것: 꽃잎 · 물방울 · 낙엽 · 눈
function festivalParticles(kind) {
  const r = rng('fest-' + kind);
  return times(22, () => {
    const x = n(r() * MAP.w);
    const y = n(-30 + r() * 220);
    const d = n(r() * 8);
    const rot = n(r() * 180);
    if (kind === 'bubble') return `<circle class="rise" style="animation-delay:-${d}s" cx="${x}" cy="${n(300 + r() * 80)}" r="${n(2 + r() * 3)}" fill="#ffffff55" stroke="#fff" stroke-width=".8"/>`;
    const shape =
      kind === 'leaf'
        ? `<path d="M0 -5 Q4 -1 0 5 Q-4 -1 0 -5Z" fill="${['#e0784a', '#f0a050', '#c0502a', '#ffc65a'][Math.floor(r() * 4)]}" transform="rotate(${rot})"/>`
        : kind === 'snow'
          ? `<circle r="${n(1.6 + r() * 2)}" fill="#fff" opacity=".95"/>`
          : `<ellipse rx="3" ry="1.8" fill="#ffc6d9" transform="rotate(${rot})"/>`;
    return `<g class="fall" style="animation-delay:-${d}s;animation-duration:${n(7 + r() * 5)}s"><g transform="translate(${x} ${y})">${shape}</g></g>`;
  });
}

// 시간에 따라: 해 질 녘(17~19시)은 노을빛, 밤(19~5시)은 어둡게 덮고 별 · 달 · 불 켜진 창
export const timeOfDay = (hour) => (hour >= 19 || hour < 5 ? 'night' : hour >= 17 ? 'dusk' : 'day');
function nightCover(phase, uid, lots) {
  if (phase === 'day') return '';
  const lit = LOTS.map(({ x, y }, i) => {
    const l = lots[i];
    if (!l || (l.state !== 'built' && l.state !== 'upgrading')) return '';
    return glow(`win-${uid}-${i}`, x, y - 26, 34, '#ffd27a', phase === 'night' ? 0.75 : 0.4) + `<rect x="${x - 4}" y="${y - 30}" width="8" height="7" rx="1.5" fill="#ffe9a8" opacity="${phase === 'night' ? 0.95 : 0.6}"/>`;
  }).join('');
  if (phase === 'dusk')
    return (
      `<defs>${linear(`dusk-${uid}`, [[0, '#6a3f8a'], [0.45, '#e0705a'], [0.6, '#ffb070'], [1, '#ff9a5a']])}</defs>` +
      `<rect width="${MAP.w}" height="${MAP.h}" fill="url(#dusk-${uid})" opacity=".34"/>` +
      glow(`dsun-${uid}`, 140, 196, 120, '#ffcf7a', 0.5) +
      lit
    );
  const r = rng('island-night');
  return (
    `<rect width="${MAP.w}" height="${MAP.h}" fill="#141c44" opacity=".52"/>` +
    times(40, () => `<circle class="twinkle" style="animation-delay:-${n(r() * 3)}s" cx="${n(r() * MAP.w)}" cy="${n(r() * 150)}" r="${n(0.6 + r() * 1.3)}" fill="#fff"/>`) +
    glow(`moon-${uid}`, 770, 58, 46, '#fff6d8', 0.5) +
    `<circle cx="770" cy="58" r="15" fill="#fff6d8"/><circle cx="777" cy="53" r="13" fill="#e9e4f7" opacity=".35"/>` +
    lit
  );
}

// lots: [{ state: 'built' | 'upgrading' | 'building' | 'empty' | 'locked', id, lv, ratio }], residents: [{ id, color }]
// festival: core/festivals.js festivalOn() (없으면 null), hour: 지금 시각 (저녁 · 밤 그림)
export function islandMap({ growth, stage, tree, equipped = {}, custom = {}, mood = 'calm', lots = [], residents = [], theme = {}, spirit = true, festival = null, hour = 12 }) {
  const phase = timeOfDay(hour);
  const th = { ...DEFAULT_THEME, ...theme };
  const uid = nextUid();
  const one = (slot) => placed(equipped, slot)[0];
  const t = treeArt({ growth, stage, tree: leafTree(tree, one('leaf')), uid });
  const ty = islandTop(MID) - 292;
  const hue = (id) => custom[id]?.hue || 0;
  const lotArt = LOTS.map(({ x, y }, i) => {
    const l = lots[i] || { state: 'locked' };
    const sc = n(1.25 * (1 + ((l.lv || 1) - 1) * 0.08)); // 레벨이 오를수록 조금씩 크게
    if (l.state === 'built') return `<g transform="translate(${x} ${y}) scale(${sc})">${buildingArt(l.id, `${uid}-${i}`, l.lv)}${levelBadge(l.lv)}</g>`;
    if (l.state === 'upgrading') return `<g transform="translate(${x} ${y}) scale(${sc})">${buildingArt(l.id, `${uid}-${i}`, l.lv)}${levelBadge(l.lv)}${upgradeRing(l.ratio)}</g>`;
    if (l.state === 'building') return `<g transform="translate(${x} ${y}) scale(1.25)">${constructionArt(l.ratio, `${uid}-${i}`)}</g>`;
    if (l.state === 'empty') return emptyLot(x, y);
    return lockedLot(x, y);
  }).join('');
  return (
    `<svg viewBox="0 0 ${MAP.w} ${MAP.h}" role="img" aria-label="나의 섬" xmlns="http://www.w3.org/2000/svg">` +
    hueDefs(uid, HUES) +
    withPaint(backdrop(uid, th) + island(uid, th), `m${uid}`, { scale: 5, freq: 0.05, seed: 9 }) +
    (festival ? bunting(festival.flags) : '') +
    `<g transform="translate(${MID - 150} ${ty})">` +
    t.svg +
    (stage >= 2 ? tint(bloomArt(one('bloom'), t.clusters, uid), uid, hue(one('bloom'))) + tint(ornamentArt(one('ornament'), t.anchors, uid), uid, hue(one('ornament'))) : '') +
    `</g>` +
    lotArt +
    nightCover(phase, uid, lots) +
    residentsArt(residents, tree, uid) +
    (spirit ? spiritArt({ x: MID + 74, y: islandTop(MID + 74) + 2, scale: 0.5, mood, wardrobe: Object.fromEntries(['hat', 'face', 'neck', 'hand'].map((s) => [s, one(s)])), hues: {}, tree, uid, motion: one('motion'), light: { color: '#fff1d6', wash: 0.06, halo: 0.12 } }) : '') +
    (festival ? festivalParticles(festival.particle) : '') +
    `</svg>`
  );
}

// 군도 지도: 섬들을 다리로 이은 작은 그림 (섬 화면 위쪽 띠). isles = [{ species, palette, grass, locked }]
export const STRIP = { step: 92, h: 92 };
export function archipelagoArt(isles, selected, emblem = '') {
  const W = isles.length * STRIP.step;
  const pos = (i) => ({ x: STRIP.step / 2 + i * STRIP.step, y: i % 2 ? 54 : 44 });
  let s = `<svg viewBox="0 0 ${W} ${STRIP.h}" width="${W}" height="${STRIP.h}" aria-hidden="true">`;
  s += `<rect width="${W}" height="${STRIP.h}" fill="#7cc4e8"/>`;
  for (let i = 0; i < 60; i++) s += `<ellipse cx="${n((i * 37) % W)}" cy="${n(10 + ((i * 23) % 76))}" rx="${3 + (i % 4)}" ry=".6" fill="#fff" opacity=".45"/>`;
  // 다리
  for (let i = 1; i < isles.length; i++) {
    const a = pos(i - 1);
    const b = pos(i);
    s += `<path d="M${a.x + 22} ${a.y + 6} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 10} ${b.x - 22} ${b.y + 6}" fill="none" stroke="${isles[i].locked ? '#ffffff' : '#a87a4a'}" stroke-width="${isles[i].locked ? 1.5 : 3}" stroke-dasharray="${isles[i].locked ? '3 4' : '2 2'}" opacity="${isles[i].locked ? 0.7 : 1}"/>`;
  }
  isles.forEach((t, i) => {
    const { x, y } = pos(i);
    if (t.locked) {
      s += `<ellipse cx="${x}" cy="${y + 10}" rx="26" ry="9" fill="#ffffff" opacity=".25" stroke="#fff" stroke-dasharray="4 3"/><text x="${x}" y="${y + 6}" font-size="16" text-anchor="middle" fill="#fff" opacity=".9">?</text>`;
      return;
    }
    s +=
      (i === selected ? `<ellipse cx="${x}" cy="${y + 12}" rx="36" ry="14" fill="#fff8d6" opacity=".55"/>` : '') +
      `<path d="M${x - 26} ${y + 10} Q${x} ${y + 30} ${x + 26} ${y + 10}Z" fill="#7a5f45"/>` +
      `<ellipse cx="${x}" cy="${y + 10}" rx="27" ry="8" fill="${t.grass}"/>` +
      `<rect x="${x - 1.6}" y="${y - 6}" width="3.2" height="16" fill="${t.palette.trunk[1]}"/>` +
      `<ellipse cx="${x}" cy="${y - 10}" rx="13" ry="10" fill="${t.palette.canopy[1]}"/><ellipse cx="${x - 4}" cy="${y - 13}" rx="6" ry="4.5" fill="${t.palette.canopy[2]}" opacity=".8"/>` +
      (t.built ? times(Math.min(4, t.built), (j) => `<rect x="${x - 22 + j * 6 + (j > 1 ? 22 : 0)}" y="${y + 3}" width="5" height="5" fill="#fbf1dc" stroke="#d9584a" stroke-width=".8"/>`) : '') +
      (i === 0 && emblem ? `<line x1="${x + 18}" y1="${y + 8}" x2="${x + 18}" y2="${y - 22}" stroke="#6b4a2f" stroke-width="1.4"/><path d="M${x + 18} ${y - 22} h20 v13 h-20Z" fill="#fffaf0" stroke="#d9b45a" stroke-width=".8"/><text x="${x + 28}" y="${y - 12}" font-size="10" text-anchor="middle">${emblem}</text>` : '');
  });
  return s + '</svg>';
}
