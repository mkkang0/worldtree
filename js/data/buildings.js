// 나의 섬 건물 목록. 그림은 art/buildings.js (같은 id).
//   cost: 짓기 시작할 때 내는 포인트 c(햇살, 이슬, 별빛)
//   work: 다 지을 때까지 모아야 하는 성장 점수 (운동·공부·식단 기록으로 차오른다)
// 새 건물: 아래에 한 줄 + art/buildings.js에 같은 id의 그림 함수.
import { c } from './items/cost.js';

export const BUILDINGS = [
  { id: 'house', emoji: '🏠', name: '작은 집', desc: '정령들이 쉬어 가는 아늑한 집', cost: c(60, 30), work: 40 },
  { id: 'well', emoji: '🪣', name: '우물', desc: '맑은 물이 솟는 돌 우물', cost: c(30, 50), work: 30 },
  { id: 'field', emoji: '🥕', name: '텃밭', desc: '채소가 쑥쑥 자라는 작은 밭', cost: c(20, 60), work: 30 },
  { id: 'teahouse', emoji: '🍵', name: '찻집', desc: '김이 모락모락 나는 쉼터', cost: c(80, 60), work: 60 },
  { id: 'fountain', emoji: '⛲', name: '분수', desc: '물방울이 반짝이는 광장 분수', cost: c(60, 90, 20), work: 70 },
  { id: 'windmill', emoji: '🌬️', name: '풍차', desc: '바람을 받아 천천히 도는 풍차', cost: c(140, 40), work: 90 },
  { id: 'library', emoji: '📚', name: '도서관', desc: '공부한 만큼 책이 쌓이는 곳', cost: c(40, 20, 140), work: 100 },
  { id: 'lighthouse', emoji: '🗼', name: '등대', desc: '밤하늘에 길을 비추는 등대', cost: c(160, 60, 60), work: 140 },
];

export const buildingById = (id) => BUILDINGS.find((b) => b.id === id);

/* ---------- 건물 레벨 (섬 키우기 2단계) ---------- */

export const MAX_LEVEL = 3;
const COST_X = [1, 1.6, 2.6]; // 레벨마다 짓는 값
const WORK_X = [1, 1.5, 2.2]; // 레벨마다 필요한 성장 점수

// lv 레벨로 짓거나 올릴 때 내는 포인트
export function costOf(b, lv = 1) {
  const x = COST_X[lv - 1] || 1;
  const r = (v) => (v ? Math.round((v * x) / 5) * 5 : 0);
  return { sun: r(b.cost.sun), water: r(b.cost.water), star: r(b.cost.star) };
}
export const workOf = (b, lv = 1) => Math.round(b.work * (WORK_X[lv - 1] || 1));

// 주민이 살 수 있는 자리: 집은 레벨마다 2명, 찻집·도서관·등대는 Lv.2부터 레벨마다 1명
export function bedsOf(id, lv) {
  if (id === 'house') return lv * 2;
  if (['teahouse', 'library', 'lighthouse'].includes(id)) return lv - 1;
  return 0;
}

// 섬 자리 수 (섬 그림의 빈터). 세계수가 자랄수록 열리고, 세계수를 하나 완성하면 모두 열린다.
export const LOT_COUNT = 8;
export const lotsOpen = (stage, completed) => (completed > 0 ? LOT_COUNT : Math.min(LOT_COUNT, 2 + stage));

// 섬 단계 (다 지은 건물 수 기준)
export const ISLAND_LEVELS = [
  { at: 0, name: '빈 섬' },
  { at: 1, name: '작은 섬마을' },
  { at: 3, name: '섬마을' },
  { at: 5, name: '큰 섬마을' },
  { at: 7, name: '섬나라의 시작' },
];
export function islandLevel(built) {
  let i = 0;
  ISLAND_LEVELS.forEach((l, k) => built >= l.at && (i = k));
  return { index: i, ...ISLAND_LEVELS[i], next: ISLAND_LEVELS[i + 1] || null };
}
