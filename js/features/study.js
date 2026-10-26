// 공부 타이머 (별빛)
// 타이머는 시작 시각만 저장하므로 앱을 닫았다 열어도 시간이 이어진다.
import { ctx, rerender, commit } from '../app/context.js';
import { gain, lose, settle } from '../app/wallet.js';
import { DAILY_STAR_CAP, STUDY_MIN_RANGE, BACKDATE_DAYS, FOCUS_WEIGHTS } from '../core/config.js';
import { todayKey, addDays, dateLabel, weekdayLabel, clock, hoursMinutes } from '../core/dates.js';
import { studyStars, capEarn } from '../core/scoring.js';
import { starsOn, studyMinOn, studyBySubject, weekSummary, lastDays } from '../core/records.js';
import { SUBJECTS, FOCUS_LEVELS, byId } from '../data/lists.js';
import { newId } from '../data/store.js';
import { esc, bar, radioChips, stat, money, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { barChart } from '../ui/components.js';
import { toast, chime, confetti } from '../ui/effects.js';

const [MIN_MIN, MAX_MIN] = STUDY_MIN_RANGE;

export const elapsedMs = (state) => (state.study.timer ? Date.now() - state.study.timer.start : 0);

// 1초마다 main.js가 부른다. 화면 전체를 다시 그리지 않고 시계 글자만 바꾼다.
export function tickTimers() {
  const text = clock(elapsedMs(ctx.state));
  document.querySelectorAll('[data-timer]').forEach((el) => (el.textContent = text));
}

export function addSession({ date, min, focus, subject, note = '' }) {
  const stars = capEarn(studyStars(min, focus), starsOn(ctx.state, date), DAILY_STAR_CAP);
  ctx.state.study.sessions.unshift({ id: newId(), date, subject, min, focus, stars, note: note.slice(0, 80) });
  ctx.state.study.sessions = ctx.state.study.sessions.slice(0, 500);
  gain({ star: stars });
  settle();
  return { stars, full: studyStars(min, focus) };
}

const lastSubject = (state) => state.study.sessions[0]?.subject || SUBJECTS[0].id;
const subjectChips = (checked) => radioChips('subject', SUBJECTS.map((s) => ({ value: s.id, label: `${s.emoji} ${s.label}` })), checked);
const focusChips = (checked) => radioChips('focus', FOCUS_LEVELS.map((f) => ({ value: f.value, label: `${f.emoji} ${f.value}` })), checked);

/* ---------- 화면 ---------- */

export function view(state) {
  const day = todayKey();
  const timer = state.study.timer;
  const week = weekSummary(state);
  const started = timer && new Date(timer.start).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
  return `
    <header class="page-head"><h1>공부</h1><span class="tiny">집중한 만큼 별빛이 내려요</span></header>
    <section class="card timer">
      <span class="eyebrow">STUDY TIMER</span>
      <div class="timer-ring ${timer ? 'running' : ''}">
        <svg viewBox="0 0 210 210" aria-hidden="true"><circle class="track" cx="105" cy="105" r="98"/><circle class="glow" cx="105" cy="105" r="98"/></svg>
        <div><div class="timer-face ${timer ? 'running' : ''}" data-timer>${clock(elapsedMs(state))}</div>
        <div class="timer-sub">${timer ? `${started} 시작` : '준비됐어요'}</div></div>
      </div>
      <p class="tiny">${timer ? '끝내면 집중도를 골라 별빛을 받아요' : '앱을 닫아도 시간은 계속 흘러가요'}</p>
      ${
        timer
          ? `<div class="row two"><button class="btn ghost" data-act="study.discard">${icon('close')} 취소</button><button class="btn" data-act="study.stop">${icon('stop')} 끝내기</button></div>`
          : `<button class="btn gold" data-act="study.start">${icon('play')} 공부 시작</button>`
      }
    </section>
    <section class="row three">
      ${stat(hoursMinutes(studyMinOn(state, day)), '오늘 공부', 'timer')}
      ${stat(money('star', starsOn(state, day)), `오늘 별빛 / ${DAILY_STAR_CAP}`, 'sparkle')}
      ${stat(hoursMinutes(week.studyMin), '이번 주', 'chart')}
    </section>
    <section class="card">
      ${title('최근 7일 (분)', { iconName: 'chart' })}
      ${barChart(lastDays(state, 7).map((d) => ({ label: weekdayLabel(d.date), value: d.studyMin, highlight: d.date === day })), '최근 7일 공부 시간', 60)}
    </section>
    <section class="card">
      ${title('과목별', { iconName: 'book', aside: '최근 30일' })}
      ${subjectList(state)}
    </section>
    <section class="card">
      ${title('직접 기록하기', { iconName: 'scroll', aside: '타이머를 깜빡했을 때' })}
      <form data-form="study.manual" data-input="study.preview" autocomplete="off">
        <label>날짜<input name="date" type="date" value="${day}" min="${addDays(day, -BACKDATE_DAYS)}" max="${day}" required></label>
        <label>공부 시간 (분)<input name="min" type="number" inputmode="numeric" min="${MIN_MIN}" max="${MAX_MIN}" required placeholder="예: 50"></label>
        <div class="label-like">과목</div>
        ${subjectChips(lastSubject(state))}
        <div class="label-like">집중도</div>
        ${focusChips(3)}
        <label>메모 (선택)<input name="note" maxlength="80" placeholder="예: 리스회계 기출 20문제"></label>
        <p class="tiny" data-preview>집중도와 시간에 따라 별빛을 받아요</p>
        <button class="btn" type="submit">${icon('sparkle')} 기록하고 별빛 받기</button>
      </form>
    </section>
    <section class="card">
      ${title('최근 기록', { iconName: 'scroll' })}
      ${recentList(state)}
    </section>
    <section class="card">
      ${title('집중도 기준', { iconName: 'sparkle' })}
      <ul class="zones">${FOCUS_LEVELS.map((f) => `<li><span>${f.emoji} ${f.value} · ${f.label}</span><b>분당 ${money('star', FOCUS_WEIGHTS[f.value])}</b></li>`).join('')}</ul>
      <p class="tiny">하루 별빛은 최대 ${DAILY_STAR_CAP}까지예요. 솔직하게 고를수록 기록이 도움이 돼요.</p>
    </section>`;
}

function subjectList(state) {
  const rows = studyBySubject(state, 30);
  if (!rows.length) return '<p class="muted">아직 기록이 없어요.</p>';
  const max = rows[0][1];
  return `<ul class="subjects">${rows
    .map(([id, min]) => {
      const s = byId(SUBJECTS, id);
      return `<li><span>${s.emoji} ${s.label}</span><b>${hoursMinutes(min)}</b>${bar(min / max, 'star')}</li>`;
    })
    .join('')}</ul>`;
}

function recentList(state) {
  const recent = state.study.sessions.slice(0, 14);
  if (!recent.length) return '<p class="muted">아직 기록이 없어요.</p>';
  return `<ul class="log">${recent
    .map((x) => {
      const s = byId(SUBJECTS, x.subject);
      const f = FOCUS_LEVELS.find((l) => l.value === x.focus);
      return `<li>
        <div><b>${dateLabel(x.date)}</b> · ${s.emoji} ${s.label} · ${x.min}분 ${f ? f.emoji : ''}
        <div class="tiny">집중도 ${x.focus}${x.note ? ` · ${esc(x.note)}` : ''}</div></div>
        <div class="right"><b>${money('star', x.stars, true)}</b>
        <button class="x" data-act="study.delete" data-arg="${esc(x.id)}" aria-label="기록 삭제">${icon('close')}</button></div>
      </li>`;
    })
    .join('')}</ul>`;
}

// 타이머를 끝낼 때 뜨는 창
export function finishModal(state, ui) {
  const { min, capped } = ui.modalData || { min: 1, capped: false };
  return `<form class="sheet" data-form="study.finish" data-input="study.preview" autocomplete="off">
    <div class="intro"><span class="eyebrow">WELL DONE</span><h1>수고했어요</h1></div>
    <label>공부 시간 (분)<input name="min" type="number" inputmode="numeric" min="${MIN_MIN}" max="${MAX_MIN}" value="${min}" required></label>
    ${capped ? `<p class="tiny">타이머가 ${MAX_MIN / 60}시간을 넘었어요. 실제 공부한 시간으로 고쳐 주세요.</p>` : ''}
    <div class="label-like">집중도는 어땠어요?</div>
    ${focusChips(3)}
    <ul class="focus-help">${FOCUS_LEVELS.map((f) => `<li>${f.emoji} ${f.value} · ${f.label}</li>`).join('')}</ul>
    <div class="label-like">과목</div>
    ${subjectChips(lastSubject(state))}
    <label>메모 (선택)<input name="note" maxlength="80" placeholder="예: 원가회계 2단원 정리"></label>
    <p class="tiny" data-preview></p>
    <div class="row two">
      <button class="btn ghost" type="button" data-act="modal.close">계속 공부하기</button>
      <button class="btn gold" type="submit">별빛 받기</button>
    </div>
  </form>`;
}

/* ---------- 동작 ---------- */

function readForm(form) {
  return {
    min: Math.round(Number(form.min.value)),
    focus: Number(form.focus.value) || 3,
    subject: form.subject.value || 'etc',
    note: form.note.value.trim(),
    date: form.date?.value || todayKey(),
  };
}

function save(form) {
  const v = readForm(form);
  if (!(v.min >= MIN_MIN && v.min <= MAX_MIN)) {
    toast(`공부 시간은 ${MIN_MIN}~${MAX_MIN}분으로 적어 주세요`);
    return null;
  }
  if (v.date > todayKey() || v.date < addDays(todayKey(), -BACKDATE_DAYS)) {
    toast(`날짜는 최근 ${BACKDATE_DAYS}일 안에서 골라 주세요`);
    return null;
  }
  const r = addSession(v);
  chime('ok');
  toast(r.stars < r.full ? `별빛 +${r.stars} · 오늘 상한에 닿았어요. 푹 쉬어요` : `별빛 +${r.stars}을 받았어요`);
  if (v.focus === 5 && v.min >= 60) confetti(['✦', '✨', '📖']);
  return r;
}

export const actions = {
  'study.start': () => {
    if (ctx.state.study.timer) return;
    ctx.state.study.timer = { start: Date.now() };
    commit();
    chime('ok');
    rerender();
  },

  'study.stop': () => {
    const raw = Math.round(elapsedMs(ctx.state) / 60000);
    if (raw < MIN_MIN && !confirm('아직 1분이 안 됐어요. 그래도 끝낼까요?')) return;
    ctx.ui.modal = 'study-finish';
    ctx.ui.modalData = { min: Math.min(MAX_MIN, Math.max(MIN_MIN, raw)), capped: raw > MAX_MIN };
    rerender();
    actions['study.preview'](document.querySelector('[data-form="study.finish"]'));
  },

  'study.finish': (form) => {
    if (!save(form)) return;
    ctx.state.study.timer = null;
    ctx.ui.modal = '';
    commit();
    rerender();
  },

  'study.discard': () => {
    if (!confirm('타이머를 멈추고 이번 공부는 기록하지 않을까요?')) return;
    ctx.state.study.timer = null;
    commit();
    rerender();
  },

  'study.manual': (form) => {
    if (save(form)) rerender();
  },

  'study.preview': (form) => {
    if (!form) return;
    const v = readForm(form);
    const out = form.querySelector('[data-preview]');
    if (!v.min) return;
    const full = studyStars(v.min, v.focus);
    const left = capEarn(full, starsOn(ctx.state, v.date), DAILY_STAR_CAP);
    out.textContent = `예상 별빛 +${left}${left < full ? ' (하루 상한 적용)' : ''}`;
  },

  'study.delete': (el) => {
    const s = ctx.state.study.sessions.find((x) => x.id === el.dataset.arg);
    if (!s || !confirm('이 공부 기록을 지울까요? 받은 별빛도 함께 줄어들어요.')) return;
    ctx.state.study.sessions = ctx.state.study.sessions.filter((x) => x.id !== s.id);
    lose({ star: s.stars });
    settle();
    rerender();
  },
};
