// 상점 아이템 미리보기 그림. 슬롯마다 보여줄 부분만 잘라서 그린다.
import { nextUid, linear } from './svg.js';
import { worldArt } from './worlds.js';
import { skyArt } from './sky.js';
import { ornamentArt } from './ornaments.js';
import { landArt } from './land.js';
import { companionArt } from './companions.js';
import { effectArt } from './effects.js';
import { spiritArt } from './spirit.js';
import { TREES } from '../data/trees.js';

const svg = (viewBox, body) => `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>`;
const nightSky = (uid) => `<defs>${linear(`tn-${uid}`, [[0, '#1b2440'], [1, '#3b4a6b']])}</defs><rect width="300" height="360" fill="url(#tn-${uid})"/>`;

const THUMBS = {
  world: (id, uid) => svg('0 60 300 260', worldArt(id, uid, 12)),
  sky: (id, uid) => svg('0 0 300 220', nightSky(uid) + skyArt(id, uid)),
  // 가지 장식은 작은 잎 덩어리에 매단 모습
  ornament: (id, uid) => {
    const anchors = [{ x: 118, y: 176 }, { x: 150, y: 182 }, { x: 182, y: 176 }];
    const leaves = `<ellipse cx="150" cy="160" rx="70" ry="24" fill="#3f7d55"/><ellipse cx="130" cy="152" rx="30" ry="14" fill="#5f9a6a"/><ellipse cx="174" cy="154" rx="26" ry="12" fill="#5f9a6a"/>`;
    return svg('80 120 140 110', nightSky(uid) + leaves + ornamentArt(id, anchors, uid));
  },
  land: (id, uid) => svg('10 240 280 110', worldArt('world-day', uid, 12) + landArt(id, uid)),
  companion: (id, uid) => svg('20 180 120 140', worldArt('world-day', uid, 12) + companionArt(id, uid)),
  fx: (id, uid) => svg('0 40 300 280', nightSky(uid) + effectArt(id, uid, null)),
  hat: (id, uid) => spiritThumb({ hat: id }, uid),
  face: (id, uid) => spiritThumb({ face: id }, uid),
  neck: (id, uid) => spiritThumb({ neck: id }, uid),
  theme: () => '',
};

function spiritThumb(wardrobe, uid) {
  return svg('-48 -82 96 124', spiritArt({ x: 0, y: 0, scale: 1, mood: 'happy', wardrobe, tree: TREES[0], uid }));
}

export function itemThumb(item) {
  const f = THUMBS[item.slot];
  return f ? f(item.id, nextUid()) : '';
}
