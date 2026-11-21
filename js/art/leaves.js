// 잎 색 아이템 (leaf 슬롯). 세계수 palette의 일부를 바꿔 끼운다.
//   canopy: 잎 [어두운, 중간, 밝은]   blossom: 꽃   glow: 후광
// 새 잎 색: data/items/scenery.js에 leaf 아이템을 추가하고 같은 id로 여기에 색을 적는다.
export const LEAVES = {
  'leaf-spring': { canopy: ['#4f8a3a', '#8cc84f', '#e2f7a8'] },
  'leaf-sakura': { canopy: ['#c0607f', '#eea3bb', '#fff0f5'], blossom: '#ffffff' },
  'leaf-maple': { canopy: ['#8a2318', '#d4543a', '#ffb27a'], blossom: '#ffe2b8' },
  'leaf-ginkgo': { canopy: ['#a87a10', '#e8c03a', '#fff1a0'], blossom: '#fff8dc' },
  'leaf-frost': { canopy: ['#6f93a8', '#b8d8e8', '#f6fcff'], blossom: '#ffffff', glow: '#e4f6ff' },
  'leaf-violet': { canopy: ['#4f3a8a', '#8f72d0', '#e6dcff'], glow: '#efe8ff' },
  'leaf-night': { canopy: ['#16224d', '#2f4a9a', '#9fb8ff'], blossom: '#fffbe0', glow: '#c9d8ff' },
};

// 잎 색을 입힌 세계수 (잎 색이 없으면 그대로)
export function leafTree(tree, id) {
  const l = LEAVES[id];
  return l ? { ...tree, palette: { ...tree.palette, ...l } } : tree;
}
