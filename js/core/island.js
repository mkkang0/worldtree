// 나의 섬 규칙 (화면 없이 계산만).
// 본섬: state.island.lots[i] = null | { b: 건물 id, lv: 1~3, done: 다 지었는지, progress, date }
//   - 새로 짓는 중: lv 1, done false / 레벨 올리는 중: lv = 올릴 레벨, done false
// 새 섬(3단계): state.island.isles = [{ species, name, date, lots }] — 세계수를 완성할 때마다 하나씩 생긴다.
//   섬 번호 k: 0 = 본섬, 1부터 = isles[k-1]
// 짓기는 모든 섬을 통틀어 한 번에 하나. 주민의 집 칸도 모든 섬을 합쳐 센다.
// state.island.residents = { 주민 id: 이사 온 날 }, state.island.giftDay = 선물 받은 날
import { buildingById, workOf, bedsOf } from '../data/buildings.js';
import { todayKey } from './dates.js';
import { streakOf, totalStudyMin } from './records.js';

export const isleCount = (state) => 1 + state.island.isles.length;
export const lotsOf = (state, k = 0) => (k ? state.island.isles[k - 1]?.lots || [] : state.island.lots);

// 모든 섬의 모든 자리 [{ k, i, l }]
const everyLot = (state) => [state.island.lots, ...state.island.isles.map((x) => x.lots)].flatMap((lots, k) => lots.map((l, i) => ({ k, i, l })));
const standing = (l) => l && (l.done || l.lv > 1); // 레벨 올리는 중인 건물도 이미 서 있다

// 서 있는 건물 수 (k를 주면 그 섬만)
export const builtCount = (state, k = null) => everyLot(state).filter((x) => (k === null || x.k === k) && standing(x.l)).length;

// 지금 짓는(또는 레벨 올리는) 건물 { k, i, l } — 없으면 null
export function buildingNow(state) {
  const x = everyLot(state).find((x) => x.l && !x.l.done);
  return x || null;
}

// 지금 보이는 레벨 (올리는 중이면 아직 이전 레벨)
export const shownLevel = (l) => (l.done ? l.lv : l.lv - 1);

// 가장 높은 레벨 건물이 있는지 (업적)
export const hasLevel = (state, lv) => everyLot(state).some((x) => x.l && x.l.done && x.l.lv >= lv);

// 성장 점수를 받을 때(app/wallet.js gain) 짓는 중인 건물에 더한다. 완성하면 { b, lv, k }를 돌려준다.
export function addWork(state, xp) {
  const now = buildingNow(state);
  if (!now || !(xp > 0)) return null;
  const l = now.l;
  const b = buildingById(l.b);
  const need = workOf(b, l.lv);
  l.progress = Math.min(need, l.progress + xp);
  if (l.progress < need) return null;
  l.done = true;
  l.date = todayKey();
  return { b, lv: l.lv, k: now.k };
}

/* ---------- 주민 (섬 키우기 2단계) ---------- */

// 정령 친구들. when을 채우고 빈 집 칸이 있으면 이사 온다 (app/wallet.js settle에서 확인).
export const RESIDENTS = [
  { id: 'momo', name: '모모', color: '#ffc2d4', line: '꽃밭 사이를 걷는 게 제일 좋아!', hint: '첫 건물을 완성하면', when: (s) => builtCount(s) >= 1 },
  { id: 'toto', name: '토토', color: '#a8d8ff', line: '오늘도 같이 힘내자!', hint: '3일 연속으로 기록하면', when: (s) => streakOf(s) >= 3 },
  { id: 'kuku', name: '쿠쿠', color: '#bdf0c6', line: '달리기 시합 할래?', hint: '운동을 10번 기록하면', when: (s) => s.log.length >= 10 },
  { id: 'bibi', name: '비비', color: '#ffe59a', line: '책 냄새가 너무 좋아', hint: '공부를 모두 10시간 하면', when: (s) => totalStudyMin(s) >= 600 },
  { id: 'nana', name: '나나', color: '#cdeeff', line: '물 한 잔 마셨어?', hint: '물 8잔을 3일 채우면', when: (s) => Object.values(s.cups).filter((n) => n >= 8).length >= 3 },
  { id: 'ruru', name: '루루', color: '#dccbff', line: 'あいうえお~ 같이 외워요', hint: '가나 퀴즈를 3판 하면', when: (s) => s.kana.plays >= 3 },
  { id: 'popo', name: '포포', color: '#ffd5a8', line: '마을이 점점 커지네!', hint: '건물을 4개 지으면', when: (s) => builtCount(s) >= 4 },
  { id: 'jiji', name: '지지', color: '#f4f1ff', line: '일주일 내내 와 줘서 고마워', hint: '7일 연속으로 기록하면', when: (s) => streakOf(s) >= 7 },
];
export const residentById = (id) => RESIDENTS.find((r) => r.id === id);

const bedsAt = (lots) => lots.reduce((a, l) => a + (l ? bedsOf(l.b, shownLevel(l)) : 0), 0);
// 집 칸 (모든 섬을 합친 주민 수 한도)
export const bedCount = (state) => everyLot(state).reduce((a, x) => a + (x.l ? bedsOf(x.l.b, shownLevel(x.l)) : 0), 0);
export const residentCount = (state) => Object.keys(state.island.residents).length;

// 주민이 어느 섬에 사는지: 이사 온 차례대로 본섬 집부터 채워 나간다. 그 섬에 사는 주민 목록
export function residentsOn(state, k) {
  const here = RESIDENTS.filter((r) => state.island.residents[r.id]).sort((a, b) => (state.island.residents[a.id] < state.island.residents[b.id] ? -1 : 1));
  let start = 0;
  for (let j = 0; j < k; j++) start += bedsAt(lotsOf(state, j));
  const end = k === isleCount(state) - 1 ? here.length : start + bedsAt(lotsOf(state, k));
  return here.slice(start, Math.max(start, end));
}

// 조건을 채운 주민을 빈 집 칸만큼 이사시키고, 새로 온 주민 목록을 돌려준다.
export function moveIn(state, day = todayKey()) {
  const fresh = [];
  for (const r of RESIDENTS) {
    if (state.island.residents[r.id]) continue;
    if (residentCount(state) >= bedCount(state)) break;
    if (r.when(state)) {
      state.island.residents[r.id] = day;
      fresh.push(r);
    }
  }
  return fresh;
}

// 이사 조건은 채웠는데 집이 모자라서 기다리는 주민 수
export const waitingCount = (state) => RESIDENTS.filter((r) => !state.island.residents[r.id] && r.when(state)).length;

// 주민들의 하루 선물 (주민 수만큼)
export const giftOf = (n) => ({ sun: n * 2, water: n * 2, star: n });
