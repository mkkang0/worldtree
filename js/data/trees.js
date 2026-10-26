// 세계수 종류. 완성하면 '숲'(도감)에 심고 다음 종류를 키운다.
// 새 종류: 아래에 한 줄 추가하면 선택 화면·숲·그림에 모두 반영된다.
// palette
//   trunk  : 줄기 [어두운, 중간, 밝은]
//   canopy : 잎 [어두운, 중간, 밝은]
//   glow   : 후광·정령 빛     blossom : 꽃     fruit : 빛나는 열매     seed : 씨앗
export const TREES = [
  {
    id: 'yggdrasil', label: '이그드라실', tagline: '모든 세계를 잇는 첫 번째 나무',
    palette: { trunk: ['#3b2a20', '#6b4a33', '#9a7350'], canopy: ['#24543f', '#3f7d55', '#9fd08a'], glow: '#f3e3a0', blossom: '#fff3c4', fruit: '#e8b84a', seed: '#f6e7a8' },
  },
  {
    id: 'sakura', label: '벚꽃 세계수', tagline: '봄바람을 닮은 분홍빛 나무',
    palette: { trunk: ['#3d2a2c', '#6e4a4c', '#9b7172'], canopy: ['#c0607f', '#e89ab3', '#fde3ec'], glow: '#ffd6e4', blossom: '#ffffff', fruit: '#ff8fb1', seed: '#ffd6e4' },
  },
  {
    id: 'starlight', label: '별빛 세계수', tagline: '밤하늘의 별을 잎으로 단 나무',
    palette: { trunk: ['#1f2440', '#3a4170', '#6470a8'], canopy: ['#24356f', '#4a67bd', '#b3c8ff'], glow: '#c9d8ff', blossom: '#fffbe0', fruit: '#ffe98a', seed: '#d6e0ff' },
  },
  {
    id: 'golden', label: '황금 세계수', tagline: '햇살을 모아 빛나는 나무',
    palette: { trunk: ['#3a2a16', '#6b4f2a', '#a07c45'], canopy: ['#8f6210', '#d4a12e', '#ffe59a'], glow: '#ffe7a3', blossom: '#fff6d6', fruit: '#fff1b0', seed: '#ffe7a3' },
  },
  {
    id: 'frost', label: '서리 세계수', tagline: '겨울 숨결이 머무는 나무',
    palette: { trunk: ['#3c4a55', '#6d7f8c', '#a8b8c4'], canopy: ['#5f8fa8', '#a3cde0', '#f0faff'], glow: '#e4f6ff', blossom: '#ffffff', fruit: '#bfe7ff', seed: '#e4f6ff' },
  },
  {
    id: 'moonlight', label: '달빛 세계수', tagline: '달의 노래를 듣는 은빛 나무',
    palette: { trunk: ['#2e2a3d', '#56506e', '#8a83a8'], canopy: ['#54478a', '#8f80c9', '#e2d9ff'], glow: '#efe8ff', blossom: '#fffaf0', fruit: '#e8dcff', seed: '#efe8ff' },
  },
  {
    id: 'maple', label: '단풍 세계수', tagline: '가을의 온기를 품은 나무',
    palette: { trunk: ['#3a2418', '#6b3f28', '#9a6342'], canopy: ['#902a1f', '#d4543a', '#ffbe7a'], glow: '#ffd2a3', blossom: '#ffe2b8', fruit: '#ffcc66', seed: '#ffd2a3' },
  },
  {
    id: 'jade', label: '비취 세계수', tagline: '맑은 샘물을 머금은 나무',
    palette: { trunk: ['#20352f', '#3d6155', '#6f9a8a'], canopy: ['#1c6e60', '#3fae94', '#b4f2df'], glow: '#c8fff0', blossom: '#f0fff9', fruit: '#e8ffb0', seed: '#c8fff0' },
  },
];

export function treeById(id) {
  return TREES.find((t) => t.id === id) || TREES[0];
}
