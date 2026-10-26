// 아이템 전체 목록과 슬롯(종류).
// 아이템 추가는 이 폴더의 wardrobe.js / scenery.js / themes.js 중 맞는 파일에 한다.
import { WARDROBE } from './wardrobe.js';
import { SCENERY } from './scenery.js';
import { THEMES } from './themes.js';

// 상점 탭 순서. group은 상점에서 묶어 보여주는 제목.
export const SLOTS = [
  { id: 'world', label: '배경', group: '세계수의 풍경' },
  { id: 'sky', label: '하늘', group: '세계수의 풍경' },
  { id: 'ornament', label: '가지 장식', group: '세계수의 풍경' },
  { id: 'land', label: '대지', group: '세계수의 풍경' },
  { id: 'fx', label: '빛 효과', group: '세계수의 풍경' },
  { id: 'companion', label: '친구', group: '세계수의 풍경' },
  { id: 'hat', label: '정령 모자', group: '정령 옷장' },
  { id: 'face', label: '정령 얼굴', group: '정령 옷장' },
  { id: 'neck', label: '정령 목걸이', group: '정령 옷장' },
  { id: 'theme', label: '앱 테마', group: '앱' },
];

export const ITEMS = [...SCENERY, ...WARDROBE, ...THEMES];

export function itemById(id) {
  return ITEMS.find((i) => i.id === id);
}
