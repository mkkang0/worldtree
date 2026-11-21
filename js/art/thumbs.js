// 상점 아이템 미리보기 그림. 슬롯마다 보여줄 부분만 잘라서 그린다. hue = 색 바꾸기 번호(0은 원래 색)
import { nextUid, linear, hueDefs, tint } from './svg.js';
import { worldArt } from './worlds.js';
import { skyArt } from './sky.js';
import { ornamentArt } from './ornaments.js';
import { landArt } from './land.js';
import { companionArt, WIDE_COMPANIONS } from './companions.js';
import { effectArt } from './effects.js';
import { spiritArt } from './spirit.js';
import { treeArt } from './tree.js';
import { leafTree } from './leaves.js';
import { bloomArt } from './blooms.js';
import { TREES } from '../data/trees.js';
import { HUES } from '../data/items/index.js';

const svg = (viewBox, body) => `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>`;
const nightSky = (uid) => `<defs>${linear(`tn-${uid}`, [[0, '#1b2440'], [1, '#3b4a6b']])}</defs><rect width="300" height="360" fill="url(#tn-${uid})"/>`;
// 작은 잎 덩어리 (가지 장식 · 꽃·열매 미리보기용)
const leafBlob = `<ellipse cx="150" cy="160" rx="70" ry="24" fill="#3f7d55"/><ellipse cx="130" cy="152" rx="30" ry="14" fill="#5f9a6a"/><ellipse cx="174" cy="154" rx="26" ry="12" fill="#5f9a6a"/>`;
const blobClusters = [{ x: 118, y: 158, r: 20 }, { x: 150, y: 160, r: 24 }, { x: 182, y: 158, r: 20 }, { x: 132, y: 150, r: 14 }, { x: 172, y: 152, r: 14 }];

const THUMBS = {
  world: (id, uid) => svg('0 60 300 260', worldArt(id, uid, 12)),
  sky: (id, uid) => svg('0 0 300 220', nightSky(uid) + skyArt(id, uid)),
  leaf: (id, uid) => svg('40 110 220 165', worldArt('world-day', uid, 12) + treeArt({ growth: 0.62, stage: 4, tree: leafTree(TREES[0], id), uid }).svg),
  bloom: (id, uid, h) => svg('108 132 84 63', nightSky(uid) + leafBlob + tint(bloomArt(id, blobClusters, uid), uid, h)),
  // 가지 장식은 작은 잎 덩어리에 매단 모습
  ornament: (id, uid, h) => {
    const anchors = [{ x: 118, y: 176 }, { x: 150, y: 182 }, { x: 182, y: 176 }];
    return svg('80 120 140 110', nightSky(uid) + leafBlob + tint(ornamentArt(id, anchors, uid), uid, h));
  },
  land: (id, uid, h) => svg('10 240 280 110', worldArt('world-day', uid, 12) + tint(landArt(id, uid), uid, h)),
  // 친구는 가까이. 떠다니는 친구는 위쪽, 흩어지는 친구는 넓게
  companion: (id, uid, h) => svg(companionCrop(id), worldArt('world-day', uid, 12) + tint(companionArt(id, uid), uid, h)),
  fx: (id, uid, h) => svg('0 40 300 280', nightSky(uid) + tint(effectArt(id, uid, null), uid, h)),
  hat: (id, uid, h) => spiritThumb({ hat: id }, { hat: h }, uid),
  face: (id, uid, h) => spiritThumb({ face: id }, { face: h }, uid, '-40 -24 80 60'),
  neck: (id, uid, h) => spiritThumb({ neck: id }, { neck: h }, uid, '-44 -2 88 66'),
  hand: (id, uid, h) => spiritThumb({ hand: id }, { hand: h }, uid, '4 -22 64 48'),
  theme: () => '',
};

function companionCrop(id) {
  if (WIDE_COMPANIONS.includes(id)) return '20 160 280 200';
  if (id.startsWith('comp-wisp')) return '40 200 76 57';
  if (id === 'comp-moth') return '44 184 76 57';
  return '34 262 84 63';
}

// 키 큰 모자(토끼 귀·마법사 모자)도 잘리지 않게 위쪽을 넉넉히
function spiritThumb(wardrobe, hues, uid, viewBox = '-50 -70 100 75') {
  return svg(viewBox, spiritArt({ x: 0, y: 0, scale: 1, mood: 'happy', wardrobe, hues, tree: TREES[0], uid }));
}

export function itemThumb(item, hue = 0) {
  const f = THUMBS[item.slot];
  if (!f) return '';
  const uid = nextUid();
  return f(item.id, uid, hue).replace('aria-hidden="true">', `aria-hidden="true">${hueDefs(uid, HUES)}`);
}
