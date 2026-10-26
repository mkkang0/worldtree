// 기록 집계(하루·주간·연속 일수 등). 상태를 읽기만 한다.
import { DAILY_SUN_CAP, CUP_GOAL } from './config.js';
import { todayKey, addDays, weekStart } from './dates.js';
import { DEFAULT_MISSIONS } from '../data/lists.js';

const sum = (list, f) => list.reduce((a, x) => a + f(x), 0);

/* ---------- 운동 ---------- */

export const logsOn = (state, day) => state.log.filter((e) => e.date === day);
export const earnedOn = (state, day) => sum(logsOn(state, day), (e) => e.earned);
export const minutesOn = (state, day) => sum(logsOn(state, day), (e) => e.min);

export function zoneMinutes(state, days = 30, end = todayKey()) {
  const from = addDays(end, -(days - 1));
  const out = [0, 0, 0, 0, 0, 0];
  state.log.forEach((e) => {
    if (e.date >= from && e.date <= end) out[e.zone] += e.min;
  });
  return out;
}

// 3일 연속 하루 상한에 닿았으면 휴식을 권한다.
export function needsRest(state, today = todayKey()) {
  return [0, 1, 2].every((i) => earnedOn(state, addDays(today, -i)) >= DAILY_SUN_CAP);
}

/* ---------- 공부 ---------- */

export const sessionsOn = (state, day) => state.study.sessions.filter((s) => s.date === day);
export const studyMinOn = (state, day) => sum(sessionsOn(state, day), (s) => s.min);
export const starsOn = (state, day) => sum(sessionsOn(state, day), (s) => s.stars);
export const totalStudyMin = (state) => sum(state.study.sessions, (s) => s.min);

export function studyBySubject(state, days = 30, end = todayKey()) {
  const from = addDays(end, -(days - 1));
  const out = {};
  state.study.sessions.forEach((s) => {
    if (s.date >= from && s.date <= end) out[s.subject] = (out[s.subject] || 0) + s.min;
  });
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

/* ---------- 식단 ---------- */

export const missionsDone = (state, day) => Object.keys(state.meals[day] || {}).length;
export const allMissions = (state) => [...DEFAULT_MISSIONS, ...state.customMissions];

/* ---------- 연속 · 주간 ---------- */

export function activeDaySet(state) {
  const s = new Set();
  state.log.forEach((e) => s.add(e.date));
  state.study.sessions.forEach((e) => s.add(e.date));
  Object.entries(state.meals).forEach(([d, v]) => Object.keys(v).length && s.add(d));
  Object.entries(state.cups).forEach(([d, n]) => n >= CUP_GOAL / 2 && s.add(d));
  return s;
}

// 하루 쉬는 날은 연속 기록을 끊지 않는다.
export function streakOf(state, today = todayKey()) {
  const days = activeDaySet(state);
  let d = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  let gap = 0;
  for (let i = 0; i < 400; i++) {
    if (days.has(d)) {
      count++;
      gap = 0;
    } else if (++gap > 1) break;
    d = addDays(d, -1);
  }
  return count;
}

export function bestStreak(state) {
  let best = 0;
  let cur = 0;
  let prev = null;
  for (const d of [...activeDaySet(state)].sort()) {
    cur = prev && addDays(prev, 1) === d ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

export function weekSummary(state, day = todayKey()) {
  const start = weekStart(day);
  const out = { start, min: 0, sun: 0, days: 0, studyMin: 0, stars: 0 };
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    const m = minutesOn(state, d);
    out.min += m;
    out.sun += earnedOn(state, d);
    out.days += m > 0 ? 1 : 0;
    out.studyMin += studyMinOn(state, d);
    out.stars += starsOn(state, d);
  }
  return out;
}

export function lastDays(state, n, end = todayKey()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(end, -i);
    out.push({ date: d, min: minutesOn(state, d), sun: earnedOn(state, d), studyMin: studyMinOn(state, d) });
  }
  return out;
}

/* ---------- 캐릭터 기분 ---------- */

export function moodOf(state, day = todayKey()) {
  const earned = earnedOn(state, day);
  if (earned >= 60 || starsOn(state, day) >= 60) return 'joy';
  if (earned > 0 || studyMinOn(state, day) > 0 || missionsDone(state, day) >= 3) return 'happy';
  return 'calm';
}
