// 앱 전체가 함께 쓰는 상태.
// ctx.state = 저장되는 데이터, ctx.ui = 저장하지 않는 화면 상태(현재 탭 등)
import { load, save } from '../data/store.js';
import { toast } from '../ui/effects.js';

export const ctx = {
  state: load(),
  ui: {
    tab: 'home', // 아래 탭
    sub: '', // 더보기 안의 화면
    modal: '', // 열린 모달 이름
    modalData: null,
    shopSlot: 'hat',
    preview: {}, // 상점 미리보기 { slot: itemId }
    calMonth: '', // 통계 달력 'YYYY-MM'
    bubble: '', // 홈 말풍선
    giftCode: '',
  },
};

let renderer = () => {};
export const setRenderer = (fn) => (renderer = fn);
export const rerender = () => renderer();

export function commit() {
  if (!save(ctx.state)) toast('저장 공간이 부족하거나 막혀 있어요. 백업을 꼭 해두세요.');
}

export function replaceState(next) {
  ctx.state = next;
  commit();
}
