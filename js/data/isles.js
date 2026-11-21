// 섬 키우기 3단계: 세계수를 하나 완성할 때마다 생기는 새 섬. 섬마다 그 세계수 종류의 색과 분위기를 띤다.
// theme: 섬 지도 색 (없는 값은 본섬 기본색)
//   sky: 하늘 [위, 가운데, 아래쪽, 맨 아래]   grass: 풀밭 [위, 아래]   rim: 풀밭 가장자리   sea: 바다 [위, 아래]
import { treeById } from './trees.js';

export const ISLE_THEMES = {
  yggdrasil: { grass: ['#8ccc72', '#4f8a48'], rim: '#c4e6a8' },
  sakura: { grass: ['#f2c6d6', '#c98aa2'], rim: '#ffe3ec', sky: ['#e89ab8', '#f6c8d8', '#fbe3ec', '#fff3f7'] },
  starlight: { grass: ['#7f9ad8', '#3f5590'], rim: '#c9d8ff', sky: ['#141d44', '#3a4a8a', '#8f9fd8', '#c9d2ef'], sea: ['#3a4a8a', '#1a2450'] },
  golden: { grass: ['#e8c860', '#b08a2a'], rim: '#fff0b0', sky: ['#e8a84a', '#f6d48a', '#fbe8c0', '#fff6e2'] },
  frost: { grass: ['#f2f8fc', '#b9d0e0'], rim: '#ffffff', sky: ['#7fa8c8', '#bcd6e8', '#e4f0f8', '#f4f9fc'], sea: ['#9fc8e0', '#4f86a8'] },
  moonlight: { grass: ['#a99ad8', '#5f5590'], rim: '#e2d9ff', sky: ['#241e4a', '#54488a', '#a99cd0', '#d8d0ef'], sea: ['#54488a', '#241e4a'] },
  maple: { grass: ['#e0965a', '#9a4a2a'], rim: '#ffd2a3', sky: ['#d9784a', '#f0b07a', '#f8d8b4', '#fdf0e0'] },
  jade: { grass: ['#7fd8b8', '#2f8a74'], rim: '#c8fff0', sea: ['#6fd8d0', '#1f8a8a'] },
};
export const themeOf = (species) => ISLE_THEMES[species] || ISLE_THEMES.yggdrasil;

// 섬 이름: '벚꽃 세계수' → '벚꽃섬', '이그드라실' → '이그드라실섬'. 같은 종류가 또 있으면 '벚꽃섬 2'
export function isleName(species, existing = []) {
  const base = `${treeById(species).label.replace(/\s*세계수$/, '')}섬`;
  const same = existing.filter((x) => x.species === species).length;
  return same ? `${base} ${same + 1}` : base;
}

// 섬마다 대표 그림
export const ISLE_EMOJI = { yggdrasil: '🌳', sakura: '🌸', starlight: '✨', golden: '🌟', frost: '❄️', moonlight: '🌙', maple: '🍁', jade: '💠' };

// 나라 단계: 섬 수로 정한다 (섬이 하나일 때는 섬 단계 이름을 쓴다)
export function nationName(isles) {
  if (isles >= 8) return '섬나라';
  if (isles >= 6) return '작은 나라';
  if (isles >= 4) return '군도';
  if (isles >= 2) return '작은 군도';
  return '';
}
