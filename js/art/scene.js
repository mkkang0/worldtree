// 장면 조립: 배경 → 하늘 소품 → 세계수(잎 색 · 꽃·열매 · 가지 장식) → 대지 소품 → 정령 친구 → 정령 → 빛 효과.
// 각 층은 art/ 안의 같은 이름 파일이 그린다. 층 순서를 바꾸려면 이 파일만 고치면 된다.
// 대지·친구는 여러 개를 놓을 수 있고, 아이템마다 위치(custom[id].pos)와 색(custom[id].hue)을 고를 수 있다.
import { nextUid, radial, hueDefs, tint } from './svg.js';
import { treeArt } from './tree.js';
import { spiritArt } from './spirit.js';
import { worldArt } from './worlds.js';
import { skyArt } from './sky.js';
import { ornamentArt } from './ornaments.js';
import { landArt } from './land.js';
import { companionArt, WIDE_COMPANIONS } from './companions.js';
import { effectArt } from './effects.js';
import { leafTree } from './leaves.js';
import { bloomArt } from './blooms.js';
import { HUES, placed } from '../data/items/index.js';

export const VIEW = { w: 300, h: 360 };

// 위치 옮기기. 대지 소품은 왼쪽에 그려져 있어서 '오른쪽'은 좌우를 뒤집는다.
// 친구는 왼쪽(x≈76)에 있어서 오른쪽으로 밀어 옮긴다 (뒤집으면 정령과 겹친다).
const PLACE = {
  land: { right: 'matrix(-1 0 0 1 300 0)' },
  companion: { tree: 'translate(48 2)', right: 'translate(196 0)' },
};
const move = (slot, id, pos, body) => {
  const tf = PLACE[slot]?.[pos];
  if (!tf || !body || (slot === 'companion' && WIDE_COMPANIONS.includes(id))) return body;
  return `<g transform="${tf}">${body}</g>`;
};

// opts: { growth 0~1, stage, tree(data/trees.js 항목), equipped, custom, mood, hour, spirit(정령 표시 여부) }
export function renderScene({ growth = 0, stage = 0, tree, equipped = {}, custom = {}, mood = 'calm', hour = 12, spirit = true, label = '세계수' }) {
  const uid = nextUid();
  const hue = (id) => custom[id]?.hue || 0;
  const one = (slot) => placed(equipped, slot)[0];
  const t = treeArt({ growth, stage, tree: leafTree(tree, one('leaf')), uid });
  const many = (slot, art) => placed(equipped, slot).map((id) => tint(move(slot, id, custom[id]?.pos, art(id)), uid, hue(id))).join('');
  const wear = Object.fromEntries(['hat', 'face', 'neck', 'hand'].map((s) => [s, one(s)]));
  const layers = [
    hueDefs(uid, HUES),
    worldArt(one('world'), uid, hour),
    skyArt(one('sky'), uid),
    t.svg,
    stage >= 2 ? tint(bloomArt(one('bloom'), t.clusters, uid), uid, hue(one('bloom'))) : '',
    stage >= 2 ? tint(ornamentArt(one('ornament'), t.anchors, uid), uid, hue(one('ornament'))) : '',
    many('land', (id) => landArt(id, uid)),
    many('companion', (id) => companionArt(id, uid)),
    spirit
      ? spiritArt({ x: 226, y: 300, scale: 0.55, mood, wardrobe: wear, hues: Object.fromEntries(Object.entries(wear).map(([s, id]) => [s, hue(id)])), tree, uid })
      : '',
    tint(effectArt(one('fx'), uid, t), uid, hue(one('fx'))),
    // 가장자리를 살짝 어둡게 해 깊이감을 준다
    `<defs>${radial(`vg-${uid}`, [[0.55, '#000', 0], [1, '#000', 0.22]], { r: 0.75 })}</defs><rect width="${VIEW.w}" height="${VIEW.h}" fill="url(#vg-${uid})" pointer-events="none"/>`,
  ];
  return (
    `<svg viewBox="0 0 ${VIEW.w} ${VIEW.h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs><clipPath id="clip-${uid}"><rect width="${VIEW.w}" height="${VIEW.h}" rx="26"/></clipPath></defs>` +
    `<g clip-path="url(#clip-${uid})">${layers.join('')}</g></svg>`
  );
}

// 정령만 크게 (상점 옷장 미리보기, 코디 카드). wear = { hat, face, neck, hand }, hues 같은 모양
export function spiritPortrait({ wear = {}, custom = {}, tree, mood = 'happy', viewBox = '-52 -96 104 140' }) {
  const uid = nextUid();
  const hues = Object.fromEntries(Object.entries(wear).map(([s, id]) => [s, custom[id]?.hue || 0]));
  return (
    `<svg viewBox="${viewBox}" role="img" aria-label="정령" xmlns="http://www.w3.org/2000/svg">` +
    hueDefs(uid, HUES) +
    spiritArt({ x: 0, y: 0, scale: 1, mood, wardrobe: wear, hues, tree, uid }) +
    `</svg>`
  );
}
