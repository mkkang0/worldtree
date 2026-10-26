// 장면 조립: 배경 → 하늘 소품 → 세계수(+가지 장식) → 대지 소품 → 정령 친구 → 정령 → 빛 효과.
// 각 층은 art/ 안의 같은 이름 파일이 그린다. 층 순서를 바꾸려면 이 파일만 고치면 된다.
import { nextUid, radial } from './svg.js';
import { treeArt } from './tree.js';
import { spiritArt } from './spirit.js';
import { worldArt } from './worlds.js';
import { skyArt } from './sky.js';
import { ornamentArt } from './ornaments.js';
import { landArt } from './land.js';
import { companionArt } from './companions.js';
import { effectArt } from './effects.js';

export const VIEW = { w: 300, h: 360 };

// opts: { growth 0~1, stage, tree(data/trees.js 항목), equipped, mood, hour, spirit(정령 표시 여부) }
export function renderScene({ growth = 0, stage = 0, tree, equipped = {}, mood = 'calm', hour = 12, spirit = true, label = '세계수' }) {
  const uid = nextUid();
  const t = treeArt({ growth, stage, tree, uid });
  const layers = [
    worldArt(equipped.world, uid, hour),
    skyArt(equipped.sky, uid),
    t.svg,
    stage >= 2 ? ornamentArt(equipped.ornament, t.anchors, uid) : '',
    landArt(equipped.land, uid),
    companionArt(equipped.companion, uid),
    spirit ? spiritArt({ x: 226, y: 300, scale: 0.55, mood, wardrobe: equipped, tree, uid }) : '',
    effectArt(equipped.fx, uid, t),
    // 가장자리를 살짝 어둡게 해 깊이감을 준다
    `<defs>${radial(`vg-${uid}`, [[0.55, '#000', 0], [1, '#000', 0.22]], { r: 0.75 })}</defs><rect width="${VIEW.w}" height="${VIEW.h}" fill="url(#vg-${uid})" pointer-events="none"/>`,
  ];
  return (
    `<svg viewBox="0 0 ${VIEW.w} ${VIEW.h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs><clipPath id="clip-${uid}"><rect width="${VIEW.w}" height="${VIEW.h}" rx="26"/></clipPath></defs>` +
    `<g clip-path="url(#clip-${uid})">${layers.join('')}</g></svg>`
  );
}
