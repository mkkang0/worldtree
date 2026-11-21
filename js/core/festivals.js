// 계절 축제 (섬 키우기 4단계). 해마다 같은 때에 열린다.
//   - 축제 기간에 기록한 날마다 도장 하나 (운동·공부·식단·물 중 하나라도 하면 그날은 기록한 날)
//   - 도장 7개를 모으면 한정 선물(prize)을 받는다: state.festivals = { 'autumn-2026': 받은 날 }
//   - 축제 동안에만 상점에서 파는 한정 아이템(shop)이 있다 (data/items의 fest 표시)
//   - 섬 지도에는 축제 깃발과 계절 꽃잎·낙엽·눈이 날린다 (art/island.js)
import { todayKey, daysBetween } from './dates.js';
import { activeDaySet } from './records.js';

export const STAMP_GOAL = 7;

// from · to: 'MM-DD'. 겨울 축제는 해를 넘긴다.
export const FESTIVALS = [
  { id: 'spring', name: '봄꽃 축제', emoji: '🌸', from: '03-20', to: '04-30', shop: 'land-picnic', prize: 'hat-sakura-crown', line: '벚꽃잎이 날리는 섬에서 소풍해요', flags: ['#ff9fbf', '#fff6fa', '#ffd6e4', '#9fd88a'], particle: 'petal' },
  { id: 'summer', name: '여름 바다 축제', emoji: '🏖️', from: '07-10', to: '08-31', shop: 'land-beach', prize: 'neck-shell', line: '파도 소리 들으며 모래성을 쌓아요', flags: ['#4fb3e8', '#fffdf6', '#ffd36b', '#ff8a6b'], particle: 'bubble' },
  { id: 'autumn', name: '가을 수확 축제', emoji: '🍁', from: '10-15', to: '11-30', shop: 'orn-persimmon', prize: 'land-harvest', line: '잘 익은 열매를 거두는 풍성한 계절', flags: ['#e0784a', '#ffd36b', '#b5562e', '#f6e2b0'], particle: 'leaf' },
  { id: 'winter', name: '겨울 눈꽃 축제', emoji: '⛄', from: '12-01', to: '01-15', shop: 'land-snowman', prize: 'hat-earmuff', line: '눈 내리는 섬에서 따뜻하게 보내요', flags: ['#e5605b', '#fffdf6', '#5fa06a', '#ffd36b'], particle: 'snow' },
];
export const festivalById = (id) => FESTIVALS.find((f) => f.id === id);

// 그 해에 열리는 축제 기간 { start, end } (겨울은 다음 해 1월까지)
function span(f, year) {
  const wraps = f.from > f.to;
  return { start: `${year}-${f.from}`, end: `${wraps ? year + 1 : year}-${f.to}` };
}

// 그날 열린 축제 { ...축제, key, start, end } — 없으면 null
export function festivalOn(day = todayKey()) {
  const y = Number(day.slice(0, 4));
  for (const f of FESTIVALS) {
    for (const year of [y - 1, y]) {
      const { start, end } = span(f, year);
      if (day >= start && day <= end) return { ...f, key: `${f.id}-${year}`, start, end };
    }
  }
  return null;
}

// 다음에 열릴 축제 { ...축제, start, inDays }
export function nextFestival(day = todayKey()) {
  const y = Number(day.slice(0, 4));
  const list = FESTIVALS.flatMap((f) => [y, y + 1].map((year) => ({ ...f, ...span(f, year) }))).filter((f) => f.start > day);
  list.sort((a, b) => (a.start < b.start ? -1 : 1));
  const f = list[0];
  return { ...f, inDays: daysBetween(day, f.start) };
}

// 축제 기간에 기록한 날 수 (도장)
export function stampsOf(state, f) {
  let n = 0;
  for (const d of activeDaySet(state)) if (d >= f.start && d <= f.end) n++;
  return n;
}

// 남은 날 (오늘 포함)
export const daysLeft = (f, day = todayKey()) => daysBetween(day, f.end) + 1;

// 한정 아이템을 지금 살 수 있는지 (선물 아이템은 살 수 없다)
export function canBuyFestItem(item, day = todayKey()) {
  if (!item.fest) return true;
  if (item.prize) return false;
  return festivalOn(day)?.id === item.fest;
}

// 선물을 받을 수 있는지 / 받았는지
export function festivalState(state, day = todayKey()) {
  const f = festivalOn(day);
  if (!f) return null;
  const stamps = stampsOf(state, f);
  const claimed = !!state.festivals[f.key];
  return { f, stamps, claimed, ready: stamps >= STAMP_GOAL && !claimed, left: daysLeft(f, day) };
}
