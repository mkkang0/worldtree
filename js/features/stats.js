// 더보기 > 기록 · 달력
import { ctx, rerender } from '../app/context.js';
import { CUP_GOAL } from '../core/config.js';
import { todayKey, weekdayLabel, hoursMinutes } from '../core/dates.js';
import { ZONES } from '../core/scoring.js';
import { minutesOn, missionsDone, studyMinOn, streakOf, bestStreak, weekSummary, lastDays, zoneMinutes, totalStudyMin } from '../core/records.js';
import { stat, backButton, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { barChart } from '../ui/components.js';

const ZONE_COLORS = ['#cfd3c6', '#b7d6a8', '#7fb98a', '#e5c36a', '#e0915a', '#c95a52'];
// 달력 점 색: 운동 · 공부 · 식단
const MARK = { workout: 'var(--sun)', study: 'var(--star)', meal: 'var(--dew)' };

export function view(state, ui) {
  const logs = state.log;
  const totalMin = logs.reduce((a, e) => a + e.min, 0);
  const withHr = logs.filter((e) => e.hr);
  const avgHr = withHr.length ? Math.round(withHr.reduce((a, e) => a + e.hr, 0) / withHr.length) : 0;
  const w = weekSummary(state);
  const day = todayKey();
  const study = state.settings.studyEnabled;
  return `${backButton}
    <header class="page-head"><h1>기록 · 달력</h1></header>
    <section class="row two">${stat(logs.length, '총 운동 횟수', 'heart')}${stat(hoursMinutes(totalMin), '누적 운동', 'timer')}</section>
    <section class="row two">${stat(avgHr || '-', '평균 심박 (bpm)', 'heart')}${stat(`${logs.reduce((a, e) => Math.max(a, e.min), 0)}분`, '최장 운동', 'trophy')}</section>
    ${study ? `<section class="row two">${stat(state.study.sessions.length, '총 공부 횟수', 'book')}${stat(hoursMinutes(totalStudyMin(state)), '누적 공부', 'timer')}</section>` : ''}
    <section class="row two">${stat(streakOf(state), '현재 연속 (일)', 'flame')}${stat(bestStreak(state), '최고 연속 (일)', 'trophy')}</section>
    <section class="card">
      ${title('최근 7일 햇살', { iconName: 'sun' })}
      ${barChart(lastDays(state, 7).map((d) => ({ label: weekdayLabel(d.date), value: d.sun, highlight: d.date === day })), '최근 7일 햇살 그래프')}
      <p class="tiny">이번 주 운동 ${w.min}분 · ${w.days}일 활동${study ? ` · 공부 ${hoursMinutes(w.studyMin)}` : ''}</p>
    </section>
    <section class="card">${title('심박 구간', { iconName: 'heart', aside: '최근 30일' })}${zoneBar(state)}</section>
    <section class="card">${title('달력', { iconName: 'scroll' })}${calendar(state, ui)}</section>`;
}

function zoneBar(state) {
  const m = zoneMinutes(state, 30);
  if (!m.some(Boolean)) return '<p class="muted">아직 기록이 없어요.</p>';
  return `<div class="stack">${m.map((v, i) => (v ? `<i style="flex:${v};background:${ZONE_COLORS[i]}" title="${ZONES[i].label} ${v}분"></i>` : '')).join('')}</div>
    <ul class="legend">${m.map((v, i) => `<li><i style="background:${ZONE_COLORS[i]}"></i>${ZONES[i].label.replace(' · ', ' ')} <b>${v}분</b></li>`).join('')}</ul>`;
}

function calendar(state, ui) {
  const month = ui.calMonth || todayKey().slice(0, 7);
  const [y, m] = month.split('-').map(Number);
  const cells = [];
  for (let i = 0; i < new Date(y, m - 1, 1).getDay(); i++) cells.push('<span></span>');
  const today = todayKey();
  for (let d = 1; d <= new Date(y, m, 0).getDate(); d++) {
    const key = `${month}-${String(d).padStart(2, '0')}`;
    const marks = [
      minutesOn(state, key) ? MARK.workout : '',
      studyMinOn(state, key) ? MARK.study : '',
      missionsDone(state, key) > 0 || (state.cups[key] || 0) >= CUP_GOAL / 2 ? MARK.meal : '',
    ].filter(Boolean);
    cells.push(`<span class="day ${key === today ? 'today' : ''} ${marks.length ? 'has' : ''}"><small>${d}</small><span class="marks">${marks.map((c) => `<i style="background:${c}"></i>`).join('')}</span></span>`);
  }
  return `<div class="cal-head"><button class="x" data-act="stats.month" data-arg="-1" aria-label="이전 달">${icon('left')}</button><b>${y}년 ${m}월</b><button class="x" data-act="stats.month" data-arg="1" aria-label="다음 달">${icon('right')}</button></div>
    <div class="cal">${'일월화수목금토'.split('').map((w) => `<em>${w}</em>`).join('')}${cells.join('')}</div>
    <p class="tiny"><i class="dot" style="background:${MARK.workout}"></i> 운동 · <i class="dot" style="background:${MARK.study}"></i> 공부 · <i class="dot" style="background:${MARK.meal}"></i> 식단·물</p>`;
}

export const actions = {
  'stats.month': (el) => {
    const [y, m] = (ctx.ui.calMonth || todayKey().slice(0, 7)).split('-').map(Number);
    const n = new Date(y, m - 1 + Number(el.dataset.arg), 1);
    ctx.ui.calMonth = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
    rerender();
  },
};
