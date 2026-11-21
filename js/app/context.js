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
    shopSlot: '', // 상점에서 보고 있는 종류 (''이면 처음 화면)
    shopQuery: '', // 상점 찾기 글자
    gardenTab: 'items', // 정원: items(창고) | outfits(코디)
    gardenSlot: '', // 정원 창고에서 보고 있는 종류
    quiz: null, // 진행 중인 가나 퀴즈 (features/games.js)
    preview: {}, // 상점 미리보기 { slot: itemId }
    calMonth: '', // 통계 달력 'YYYY-MM'
    bubble: '', // 홈 말풍선
    giftCode: '',
    mealDay: '', // 식단 화면에서 기록하는 날짜 (비어 있으면 오늘)
    calDay: '', // 달력에서 누른 날짜
    reportWeek: 0, // 주간 리포트: 0 = 이번 주, -1 = 지난주 …
    celebrate: null, // 세계수가 자란 단계 (축하 창을 띄우기 전까지)
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
