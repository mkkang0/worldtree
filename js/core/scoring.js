// 점수와 성장 계산. DOM을 쓰지 않는 순수 함수만 둔다.
import {
  ZONE_WEIGHTS,
  ZONE_LABELS,
  STAGE_XP,
  STAGE_NAMES,
  XP_WEIGHT,
  CUP_GOAL,
  CUP_BONUS,
  FOCUS_WEIGHTS,
} from './config.js';

export const ZONES = ZONE_WEIGHTS.map((w, z) => ({ z, w, label: ZONE_LABELS[z] }));
export const STAGES = STAGE_XP.map((at, i) => ({ at, name: STAGE_NAMES[i] }));
export const LAST_STAGE = STAGES.length - 1;

/* ---------- 운동 ---------- */

export function maxHr(age) {
  return 220 - age;
}

// rest > 0 이면 카르보넨(심박 예비량) 방식, 아니면 최대심박 % 방식
export function zoneFromHr(hr, age, rest = 0) {
  const max = maxHr(age);
  const p = rest > 0 && rest < max ? (hr - rest) / (max - rest) : hr / max;
  if (p >= 0.9) return 5;
  if (p >= 0.8) return 4;
  if (p >= 0.7) return 3;
  if (p >= 0.6) return 2;
  if (p >= 0.5) return 1;
  return 0;
}

export function workoutPoints(minutes, zone) {
  return Math.round(minutes * ZONES[zone].w);
}

/* ---------- 공부 ---------- */

export function studyStars(minutes, focus) {
  return Math.round(minutes * (FOCUS_WEIGHTS[focus] || 0));
}

/* ---------- 식단 ---------- */

export function cupsWater(n) {
  return n + (n >= CUP_GOAL ? CUP_BONUS : 0);
}

/* ---------- 공통 ---------- */

// 하루 상한을 넘는 만큼은 잘라낸다.
export function capEarn(points, alreadyToday, cap) {
  return Math.max(0, Math.min(points, cap - alreadyToday));
}

export function xpOf({ sun = 0, water = 0, star = 0 }) {
  return sun * XP_WEIGHT.sun + water * XP_WEIGHT.water + star * XP_WEIGHT.star;
}

/* ---------- 성장 ---------- */

export function plantXp(state) {
  return Math.max(0, state.xp - state.plant.startXp);
}

export function stageOf(xp) {
  let idx = 0;
  STAGES.forEach((s, i) => {
    if (xp >= s.at) idx = i;
  });
  return idx;
}

export function progress(xp) {
  const stage = stageOf(xp);
  const next = STAGES[stage + 1];
  if (!next) return { stage, ratio: 1, remain: 0, nextName: null };
  const base = STAGES[stage].at;
  return {
    stage,
    ratio: (xp - base) / (next.at - base),
    remain: Math.ceil(next.at - xp),
    nextName: next.name,
  };
}
