// 더보기 > 기록 · 달력 (주간 리포트, 누적 통계, 심박 구간, 달력과 날짜별 기록)
import { ctx, rerender } from '../app/context.js';
import { go } from '../app/render.js';
import { CUP_GOAL, BACKDATE_DAYS } from '../core/config.js';
import { todayKey, addDays, weekStart, weekdayLabel, hoursMinutes, keyToDate } from '../core/dates.js';
import { ZONES } from '../core/scoring.js';
import { minutesOn, missionsDone, studyMinOn, streakOf, bestStreak, weekSummary, lastDays, zoneMinutes, totalStudyMin, weekReport, allMissions } from '../core/records.js';
import { esc, stat, backButton, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { barChart } from '../ui/components.js';
import { workoutRow, byDateDesc } from './workout.js';
import { sessionRow, subjectTotals } from './study.js';

const ZONE_COLORS = ['#cfd3c6', '#b7d6a8', '#7fb98a', '#e5c36a', '#e0915a', '#c95a52'];
// 달력 점 색: 운동 · 공부 · 식단
const MARK = { workout: 'var(--sun)', study: 'var(--star)', meal: 'var(--dew)' };

const md = (key) => {
  const d = keyToDate(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

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
    ${reportCard(state, ui)}
    <section class="card">${title('달력', { iconName: 'calendar', aside: '날짜를 누르면 그날 기록' })}${calendar(state, ui)}</section>
    <section class="row two">${stat(logs.length, '총 운동 횟수', 'heart')}${stat(hoursMinutes(totalMin), '누적 운동', 'timer')}</section>
    <section class="row two">${stat(avgHr || '-', '평균 심박 (bpm)', 'heart')}${stat(`${logs.reduce((a, e) => Math.max(a, e.min), 0)}분`, '최장 운동', 'trophy')}</section>
    ${study ? `<section class="row two">${stat(state.study.sessions.length, '총 공부 횟수', 'book')}${stat(hoursMinutes(totalStudyMin(state)), '누적 공부', 'timer')}</section>` : ''}
    <section class="row two">${stat(streakOf(state), '현재 연속 (일)', 'flame')}${stat(bestStreak(state), '최고 연속 (일)', 'trophy')}</section>
    <section class="card">
      ${title('최근 7일 햇살', { iconName: 'sun' })}
      ${barChart(lastDays(state, 7).map((d) => ({ label: weekdayLabel(d.date), value: d.sun, highlight: d.date === day })), '최근 7일 햇살 그래프')}
      <p class="tiny">이번 주 운동 ${w.min}분 · ${w.days}일 활동${study ? ` · 공부 ${hoursMinutes(w.studyMin)}` : ''}</p>
    </section>
    <section class="card">${title('심박 구간', { iconName: 'heart', aside: '최근 30일' })}${zoneBar(state)}</section>`;
}

/* ---------- 주간 리포트 ---------- */

// 지난주와 비교한 화살표 (차이가 없으면 빈 글자)
function delta(now, before, unit = '') {
  const d = Math.round(now - before);
  if (!d) return '';
  return `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'}${Math.abs(d)}${unit}</span>`;
}

// 리포트 아래 한 줄 평 (가장 크게 늘어난 것을 칭찬한다)
function reportNote(r, prev, study) {
  if (!r.activeDays) return '기록이 없는 주예요. 작은 것 하나부터 시작해 봐요.';
  const gains = [
    [r.workoutMin - prev.workoutMin, `지난주보다 운동이 ${r.workoutMin - prev.workoutMin}분 늘었어요!`],
    [study ? (r.studyMin - prev.studyMin) / 2 : 0, `지난주보다 공부가 ${hoursMinutes(r.studyMin - prev.studyMin)} 늘었어요!`],
    [(r.missions - prev.missions) * 5, `식단 미션을 지난주보다 ${r.missions - prev.missions}개 더 했어요!`],
    [(r.activeDays - prev.activeDays) * 15, `지난주보다 ${r.activeDays - prev.activeDays}일 더 기록했어요!`],
  ].sort((a, b) => b[0] - a[0]);
  if (gains[0][0] > 0) return gains[0][1];
  if (r.activeDays === r.days) return '하루도 빠짐없이 기록했어요. 정말 꾸준해요!';
  return '이번 주도 함께해서 좋았어요. 다음 주도 천천히 가요.';
}

function reportCard(state, ui) {
  const offset = Math.min(0, ui.reportWeek || 0);
  const start = addDays(weekStart(todayKey()), offset * 7);
  const r = weekReport(state, start);
  const prev = weekReport(state, addDays(start, -7));
  const study = state.settings.studyEnabled;
  const name = offset === 0 ? '이번 주' : offset === -1 ? '지난주' : `${md(start)} 주`;
  const cell = (label, value, d = '') => `<div class="report-cell"><span class="tiny">${label}</span><b>${value}</b>${d}</div>`;
  const subjects = subjectTotals(state, Object.entries(r.bySubject));
  return `<section class="card">
    ${title('주간 리포트', { iconName: 'chart' })}
    <div class="report-head">
      <button class="x" data-act="stats.week" data-arg="-1" aria-label="이전 주">${icon('left')}</button>
      <span><b>${name}</b> <span class="tiny">${md(start)} ~ ${md(addDays(start, 6))}</span></span>
      <button class="x" data-act="stats.week" data-arg="1" aria-label="다음 주" ${offset === 0 ? 'disabled' : ''}>${icon('right')}</button>
    </div>
    <div class="report-grid">
      ${cell('기록한 날', `${r.activeDays} / ${r.days}일`, delta(r.activeDays, prev.activeDays, '일'))}
      ${cell('운동', `${r.workoutMin}분`, delta(r.workoutMin, prev.workoutMin, '분'))}
      ${study ? cell('공부', hoursMinutes(r.studyMin), delta(r.studyMin, prev.studyMin, '분')) : ''}
      ${cell('식단 미션', `${r.missions}개`, delta(r.missions, prev.missions, '개'))}
      ${cell('하루 평균 물', `${r.days ? (r.cups / r.days).toFixed(1) : 0}잔`)}
      ${cell('받은 햇살', `${r.sun}`, delta(r.sun, prev.sun))}
    </div>
    ${study && subjects.length ? `<ul class="report-subjects">${subjects.map(({ s, min }) => `<li><span>${esc(s.emoji)} ${esc(s.label)}</span><b>${hoursMinutes(min)}</b></li>`).join('')}</ul>` : ''}
    <p class="report-note">${reportNote(r, prev, study)}</p>
  </section>`;
}

/* ---------- 심박 구간 ---------- */

function zoneBar(state) {
  const m = zoneMinutes(state, 30);
  if (!m.some(Boolean)) return '<p class="muted">아직 기록이 없어요.</p>';
  return `<div class="stack">${m.map((v, i) => (v ? `<i style="flex:${v};background:${ZONE_COLORS[i]}" title="${ZONES[i].label} ${v}분"></i>` : '')).join('')}</div>
    <ul class="legend">${m.map((v, i) => `<li><i style="background:${ZONE_COLORS[i]}"></i>${ZONES[i].label.replace(' · ', ' ')} <b>${v}분</b></li>`).join('')}</ul>`;
}

/* ---------- 달력 ---------- */

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
    const cls = `day ${key === today ? 'today' : ''} ${marks.length ? 'has' : ''} ${key === ui.calDay ? 'sel' : ''}`;
    cells.push(
      key > today
        ? `<span class="${cls}"><small>${d}</small><span class="marks"></span></span>`
        : `<button class="${cls}" data-act="stats.day" data-arg="${key}" aria-label="${m}월 ${d}일 기록 보기" aria-pressed="${key === ui.calDay}"><small>${d}</small><span class="marks">${marks.map((c) => `<i style="background:${c}"></i>`).join('')}</span></button>`
    );
  }
  return `<div class="cal-head"><button class="x" data-act="stats.month" data-arg="-1" aria-label="이전 달">${icon('left')}</button><b>${y}년 ${m}월</b><button class="x" data-act="stats.month" data-arg="1" aria-label="다음 달">${icon('right')}</button></div>
    <div class="cal">${'일월화수목금토'.split('').map((w) => `<em>${w}</em>`).join('')}${cells.join('')}</div>
    <p class="tiny"><i class="dot" style="background:${MARK.workout}"></i> 운동 · <i class="dot" style="background:${MARK.study}"></i> 공부 · <i class="dot" style="background:${MARK.meal}"></i> 식단·물</p>
    ${ui.calDay ? dayDetail(state, ui.calDay) : ''}`;
}

// 달력에서 누른 날의 기록. 운동·공부는 눌러서 고칠 수 있고, 최근 날짜는 식단도 채울 수 있다.
function dayDetail(state, key) {
  const d = keyToDate(key);
  const workouts = byDateDesc(state.log.filter((e) => e.date === key));
  const sessions = state.study.sessions.filter((s) => s.date === key);
  const meals = Object.keys(state.meals[key] || {});
  const names = Object.fromEntries(allMissions(state).map((x) => [x.id, `${x.emoji} ${x.label}`]));
  const cups = state.cups[key] || 0;
  const canFill = key >= addDays(todayKey(), -BACKDATE_DAYS);
  const empty = !workouts.length && !sessions.length && !meals.length && !cups;
  return `<div class="day-detail">
    <h3>${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdayLabel(key)})</h3>
    ${empty ? '<p class="muted">이날은 기록이 없어요.</p>' : ''}
    ${workouts.length ? `<div class="sub">운동</div><ul class="log">${workouts.map(workoutRow).join('')}</ul>` : ''}
    ${sessions.length ? `<div class="sub">공부</div><ul class="log">${sessions.map((x) => sessionRow(state, x)).join('')}</ul>` : ''}
    ${meals.length || cups ? `<div class="sub">식단 · 물</div><p class="tiny">${meals.map((id) => esc(names[id] || '지난 미션')).join(' · ') || '미션 없음'} · 물 ${cups}잔</p>` : ''}
    ${canFill ? `<button class="btn small soft" data-act="stats.fillMeal" data-arg="${key}">${icon('leaf')} 이날 식단·물 채우기</button>` : ''}
  </div>`;
}

export const actions = {
  'stats.month': (el) => {
    const [y, m] = (ctx.ui.calMonth || todayKey().slice(0, 7)).split('-').map(Number);
    const n = new Date(y, m - 1 + Number(el.dataset.arg), 1);
    ctx.ui.calMonth = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
    ctx.ui.calDay = '';
    rerender();
  },

  'stats.week': (el) => {
    ctx.ui.reportWeek = Math.min(0, (ctx.ui.reportWeek || 0) + Number(el.dataset.arg));
    rerender();
  },

  // 같은 날을 다시 누르면 닫는다
  'stats.day': (el) => {
    ctx.ui.calDay = ctx.ui.calDay === el.dataset.arg ? '' : el.dataset.arg;
    rerender();
  },

  'stats.fillMeal': (el) => {
    const day = el.dataset.arg;
    go('meal');
    ctx.ui.mealDay = day;
    rerender();
  },
};
