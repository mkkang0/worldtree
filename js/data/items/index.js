// 아이템 전체 목록과 슬롯(종류).
// 아이템 추가는 이 폴더의 wardrobe.js / scenery.js / themes.js 중 맞는 파일에 한다.
import { WARDROBE } from './wardrobe.js';
import { SCENERY } from './scenery.js';
import { THEMES } from './themes.js';

// 상점 탭 순서. group은 상점에서 묶어 보여주는 제목.
//   multi    : 한 번에 놓을 수 있는 개수 (없으면 1개)
//   positions: 고를 수 있는 위치 (첫 번째가 기본). 그리는 방법은 art/scene.js
//   tint     : 색 바꾸기를 할 수 있는 슬롯
export const SLOTS = [
  { id: 'world', label: '배경', group: '세계수의 풍경' },
  { id: 'sky', label: '하늘', group: '세계수의 풍경' },
  { id: 'leaf', label: '잎 색', group: '세계수의 풍경' },
  { id: 'bloom', label: '꽃·열매', group: '세계수의 풍경', tint: true },
  { id: 'ornament', label: '가지 장식', group: '세계수의 풍경', tint: true },
  { id: 'land', label: '대지', group: '세계수의 풍경', tint: true, multi: 3, positions: [['left', '왼쪽'], ['right', '오른쪽']] },
  { id: 'fx', label: '빛 효과', group: '세계수의 풍경', tint: true },
  { id: 'companion', label: '친구', group: '세계수의 풍경', tint: true, multi: 3, positions: [['left', '왼쪽'], ['tree', '나무 앞'], ['right', '오른쪽']] },
  { id: 'hat', label: '정령 모자', group: '정령 옷장', tint: true },
  { id: 'face', label: '정령 얼굴', group: '정령 옷장', tint: true },
  { id: 'neck', label: '정령 목걸이', group: '정령 옷장', tint: true },
  { id: 'hand', label: '정령 손', group: '정령 옷장', tint: true },
  { id: 'motion', label: '정령 동작', group: '정령 옷장' },
  { id: 'theme', label: '앱 테마', group: '앱' },
];

// 색 바꾸기: 아이템 그림의 색상을 돌려서 만든다 (0은 원래 색). 그리는 곳은 art/svg.js hueDefs.
export const HUES = [0, 55, 140, 230];

export const ITEMS = [...SCENERY, ...WARDROBE, ...THEMES];

export function itemById(id) {
  return ITEMS.find((i) => i.id === id);
}

export const slotById = (id) => SLOTS.find((s) => s.id === id);

// 슬롯에 지금 놓인 아이템 id 목록 (한 개 슬롯도 배열로)
export function placed(equipped, slot) {
  const v = equipped[slot];
  return Array.isArray(v) ? v : v ? [v] : [];
}

// 장착 상태에 미리보기를 겹친다. 여러 개 놓는 슬롯은 미리보기 아이템을 하나 더 얹고, 자리가 차면 가장 먼저 놓은 것을 뺀다.
export function withPreview(equipped, preview = {}) {
  const out = { ...equipped };
  for (const [slot, id] of Object.entries(preview)) {
    const s = slotById(slot);
    if (s?.multi) {
      const list = placed(equipped, slot).filter((x) => x !== id);
      out[slot] = [...list, id].slice(-s.multi);
    } else out[slot] = id;
  }
  return out;
}
