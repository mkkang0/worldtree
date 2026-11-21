// 공부 타이머 (별빛)
// 타이머는 시작 시각만 저장하므로 앱을 닫았다 열어도 시간이 이어진다.
// 과목은 저장 데이터(state.study.subjects)에 있어서 이 화면에서 추가·수정·삭제한다.
import { ctx, rerender, commit } from '../app/context.js';
import { gain, lose, settle } from '../app/wallet.js';
import { DAILY_STAR_CAP, STUDY_MIN_RANGE, BACKDATE_DAYS, FOCUS_WEIGHTS, MAX_SUBJECTS, SUBJECT_GOAL_MAX, STUDY_QUICK_MIN } from '../core/config.js';
import { todayKey, addDays, dateLabel, weekdayLabel, clock, hoursMinutes, daysBetween } from '../core/dates.js';
import { studyStars, capEarn } from '../core/scoring.js';
import { starsOn, studyMinOn, studyBySubject, studyMinBySubjectOn, weekSummary, lastDays } from '../core/records.js';
import { FOCUS_LEVELS, SUBJECT_EMOJIS, subjectOf, activeSubjects } from '../data/lists.js';
import { newId } from '../data/store.js';
import { esc, bar, radioChips, stat, money, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { barChart, ddayBadge } from '../ui/components.js';
import { toast, chime, confetti } from '../ui/effects.js';
import { byDateDesc } from './workout.js';

const [MIN_MIN, MAX_MIN] = STUDY_MIN_RANGE;

export const elapsedMs = (state) => (state.study.timer ? Date.now() - state.study.timer.start : 0);

// 1초마다 main.js가 부른다. 화면 전체를 다시 그리지 않고 시계 글자만 바꾼다.
export function tickTimers() {
  const text = clock(elapsedMs(ctx.state));
  document.querySelectorAll('[data-timer]').forEach((el) => (el.textContent = text));
}

// 하루 별빛 상한을 넘는 만큼은 잘라서 기록한다.
export function addSession({ date, min, focus, subject, note = '' }) {
  const stars = capEarn(studyStars(min, focus), starsOn(ctx.state, date), DAILY_STAR_CAP);
  ctx.state.study.sessions.unshift({ id: newId(), date, subject, min, focus, stars, note: note.slice(0, 80) });
  ctx.state.study.sessions = ctx.state.study.sessions.slice(0, 500);
  gain({ star: stars });
  settle();
  return { stars, full: studyStars(min, focus) };
}

// 마지막으로 공부한 과목 (지금 고를 수 있는 과목 중에서)
function lastSubject(state) {
  const list = activeSubjects(state);
  const recent = state.study.timer?.subject || state.study.sessions[0]?.subject;
  return (list.find((s) => s.id === recent) || list[0])?.id || '';
}

// 과목 칩. 수정 화면에서는 지운 과목으로 남은 기록도 고를 수 있게 그 과목을 함께 보여준다.
function subjectChips(state, checked, name = 'subject') {
  const list = activeSubjects(state);
  const extra = checked && !list.some((s) => s.id === checked) ? [subjectOf(state.study.subjects, checked)] : [];
  return radioChips(name, [...list, ...extra].map((s) => ({ value: s.id, label: `${esc(s.emoji)} ${esc(s.label)}` })), checked);
}
const focusChips = (checked) => radioChips('focus', FOCUS_LEVELS.map((f) => ({ value: f.value, label: `${f.emoji} ${f.value}` })), checked);
const quickMinutes = () =>
  `<div class="quick">${STUDY_QUICK_MIN.map((m) => `<button type="button" class="chip-btn" data-act="study.quick" data-arg="${m}">${m}분</button>`).join('')}</div>`;

// 시험까지 남은 날 (과목 목록에 보여줄 짧은 글)
function examText(s) {
  if (!s.examDate) return '';
  const left = daysBetween(todayKey(), s.examDate);
  if (left < 0) return '';
  return `${esc(s.examName || '시험')} ${left === 0 ? 'D-DAY' : `D-${left}`}`;
}

/* ---------- 화면 ---------- */

export function view(state) {
  const day = todayKey();
  const timer = state.study.timer;
  const week = weekSummary(state);
  const started = timer && new Date(timer.start).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
  const timerSubject = timer?.subject && subjectOf(state.study.subjects, timer.subject);
  return `
    <header class="page-head"><h1>공부</h1>${ddayBadge(state) || '<span class="tiny">집중한 만큼 별빛이 내려요</span>'}</header>
    <section class="card timer">
      <span class="eyebrow">STUDY TIMER</span>
      <div class="timer-ring ${timer ? 'running' : ''}">
        <svg viewBox="0 0 210 210" aria-hidden="true"><circle class="track" cx="105" cy="105" r="98"/><circle class="glow" cx="105" cy="105" r="98"/></svg>
        <div><div class="timer-face ${timer ? 'running' : ''}" data-timer>${clock(elapsedMs(state))}</div>
        <div class="timer-sub">${timer ? `${timerSubject ? `${esc(timerSubject.emoji)} ${esc(timerSubject.label)} · ` : ''}${started} 시작` : '준비됐어요'}</div></div>
      </div>
      ${timer ? '' : `<div class="label-like">지금 공부할 과목</div>${subjectChips(state, lastSubject(state), 'timerSubject')}`}
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
      ${title('내 과목', { iconName: 'book', aside: `${activeSubjects(state).length} / ${MAX_SUBJECTS}` })}
      ${subjectsToday(state, day)}
      <button class="btn small soft" data-act="study.subjectNew" ${activeSubjects(state).length >= MAX_SUBJECTS ? 'disabled' : ''}>${icon('plus')} 과목 추가</button>
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
        ${studyFields(state, { date: day, subject: lastSubject(state), focus: 3 })}
        <p class="tiny" data-preview>집중도와 시간에 따라 별빛을 받아요</p>
        <button class="btn" type="submit">${icon('sparkle')} 기록하고 별빛 받기</button>
      </form>
    </section>
    <section class="card">
      ${title('최근 기록', { iconName: 'scroll', aside: '눌러서 고치기' })}
      ${recentList(state)}
    </section>
    <section class="card">
      ${title('집중도 기준', { iconName: 'sparkle' })}
      <ul class="zones">${FOCUS_LEVELS.map((f) => `<li><span>${f.emoji} ${f.value} · ${f.label}</span><b>분당 ${money('star', FOCUS_WEIGHTS[f.value])}</b></li>`).join('')}</ul>
      <p class="tiny">하루 별빛은 최대 ${DAILY_STAR_CAP}까지예요. 솔직하게 고를수록 기록이 도움이 돼요.</p>
    </section>`;
}

// 공부 기록 입력칸 (직접 기록 · 기록 고치기에서 같이 쓴다)
function studyFields(state, v, { minDate } = {}) {
  const day = todayKey();
  const lo = minDate && minDate < addDays(day, -BACKDATE_DAYS) ? minDate : addDays(day, -BACKDATE_DAYS);
  return `
    <label>날짜<input name="date" type="date" value="${v.date}" min="${lo}" max="${day}" required></label>
    <label>공부 시간 (분)<input name="min" type="number" inputmode="numeric" min="${MIN_MIN}" max="${MAX_MIN}" required placeholder="예: 50" value="${v.min || ''}"></label>
    ${quickMinutes()}
    <div class="label-like">과목</div>
    ${subjectChips(state, v.subject)}
    <div class="label-like">집중도</div>
    ${focusChips(v.focus)}
    <label>메모 (선택)<input name="note" maxlength="80" placeholder="예: 단어 50개 외우기" value="${esc(v.note || '')}"></label>`;
}

// 과목마다 오늘 공부한 시간과 하루 목표
function subjectsToday(state, day) {
  const by = studyMinBySubjectOn(state, day);
  const list = activeSubjects(state);
  if (!list.length) return '<p class="muted">과목을 추가해 주세요.</p>';
  return `<ul class="subject-goals">${list
    .map((s) => {
      const min = by[s.id] || 0;
      const exam = examText(s);
      const goal = s.goal ? `${min} / ${s.goal}분${min >= s.goal ? ` ${icon('check')}` : ''}` : `${min}분`;
      return `<li>
        <button class="subject-row" data-act="study.subjectEdit" data-arg="${esc(s.id)}" aria-label="${esc(s.label)} 과목 고치기">
          <span class="em">${esc(s.emoji)}</span>
          <span class="grow"><b>${esc(s.label)}</b>${exam ? `<span class="tiny exam">${exam}</span>` : ''}</span>
          <span class="tiny">${goal}</span>${icon('edit', 'muted-ic')}
        </button>
        ${s.goal ? bar(min / s.goal, 'star') : ''}
      </li>`;
    })
    .join('')}</ul>
    <p class="tiny">과목을 누르면 이름, 하루 목표, 시험일을 바꿀 수 있어요.</p>`;
}

// 과목별 합계. 지운 과목·예전 과목은 '지난 과목' 한 줄로 모은다. ([[과목, 분], …] 많은 순)
export function subjectTotals(state, rows) {
  const out = new Map();
  rows.forEach(([id, min]) => {
    const s = subjectOf(state.study.subjects, id);
    const key = `${s.emoji} ${s.label}`;
    out.set(key, { s, min: (out.get(key)?.min || 0) + min });
  });
  return [...out.values()].sort((a, b) => b.min - a.min);
}

function subjectList(state) {
  const rows = subjectTotals(state, studyBySubject(state, 30));
  if (!rows.length) return '<p class="muted">아직 기록이 없어요.</p>';
  const max = rows[0].min;
  return `<ul class="subjects">${rows
    .map(({ s, min }) => `<li><span>${esc(s.emoji)} ${esc(s.label)}</span><b>${hoursMinutes(min)}</b>${bar(min / max, 'star')}</li>`)
    .join('')}</ul>`;
}

// 공부 기록 한 줄. 누르면 고치기 창이 열린다. (기록·달력 화면도 같이 쓴다)
export function sessionRow(state, x) {
  const s = subjectOf(state.study.subjects, x.subject);
  const f = FOCUS_LEVELS.find((l) => l.value === x.focus);
  return `<li>
    <button class="log-body" data-act="study.edit" data-arg="${esc(x.id)}" aria-label="공부 기록 고치기">
      <span><b>${dateLabel(x.date)}</b> · ${esc(s.emoji)} ${esc(s.label)} · ${x.min}분 ${f ? f.emoji : ''}</span>
      <span class="tiny">집중도 ${x.focus}${x.note ? ` · ${esc(x.note)}` : ''}</span>
    </button>
    <div class="right"><b>${money('star', x.stars, true)}</b>
    <button class="x" data-act="study.delete" data-arg="${esc(x.id)}" aria-label="기록 삭제">${icon('close')}</button></div>
  </li>`;
}

function recentList(state) {
  const recent = byDateDesc(state.study.sessions).slice(0, 14);
  if (!recent.length) return '<p class="muted">아직 기록이 없어요.</p>';
  return `<ul class="log">${recent.map((x) => sessionRow(state, x)).join('')}</ul>`;
}

/* ---------- 창 (모달) ---------- */

// 타이머를 끝낼 때 뜨는 창
export function finishModal(state, ui) {
  const { min, capped } = ui.modalData || { min: 1, capped: false };
  return `<form class="sheet" data-form="study.finish" data-input="study.preview" autocomplete="off">
    <div class="intro"><span class="eyebrow">WELL DONE</span><h1>수고했어요</h1></div>
    <label>공부 시간 (분)<input name="min" type="number" inputmode="numeric" min="${MIN_MIN}" max="${MAX_MIN}" value="${min}" required></label>
    ${capped ? `<p class="tiny">타이머가 ${MAX_MIN / 60}시간을 넘었어요. 실제 공부한 시간으로 고쳐 주세요.</p>` : ''}
    <div class="label-like">집중도는 어땠어요?</div>
    <ul class="focus-pick">${FOCUS_LEVELS.map(
      (f) => `<li><label class="chip wide"><input type="radio" name="focus" value="${f.value}" ${f.value === 3 ? 'checked' : ''}><span>${f.emoji} ${f.value} · ${f.label}</span></label></li>`
    ).join('')}</ul>
    <div class="label-like">과목</div>
    ${subjectChips(state, lastSubject(state))}
    <label>메모 (선택)<input name="note" maxlength="80" placeholder="예: 듣기 문제 1회 풀기"></label>
    <p class="tiny" data-preview></p>
    <div class="row two">
      <button class="btn ghost" type="button" data-act="modal.close">계속 공부하기</button>
      <button class="btn gold" type="submit">별빛 받기</button>
    </div>
  </form>`;
}

// 공부 기록 고치기
export function editModal(state, ui) {
  const x = state.study.sessions.find((s) => s.id === ui.modalData?.id);
  if (!x) return '';
  return `<form class="sheet" data-form="study.update" data-input="study.preview" autocomplete="off">
    <div class="intro"><span class="eyebrow">EDIT</span><h1>공부 기록 고치기</h1>
    <p class="muted">고치면 받은 별빛도 다시 계산해요.</p></div>
    ${studyFields(state, x, { minDate: x.date })}
    <p class="tiny" data-preview></p>
    <div class="row two">
      <button class="btn ghost" type="button" data-act="modal.close">닫기</button>
      <button class="btn" type="submit">${icon('check')} 저장</button>
    </div>
    <button class="btn small danger-text" type="button" data-act="study.delete" data-arg="${esc(x.id)}">이 기록 지우기</button>
  </form>`;
}

// 과목 추가 · 고치기
export function subjectModal(state, ui) {
  const id = ui.modalData?.id;
  const s = state.study.subjects.find((x) => x.id === id) || { emoji: SUBJECT_EMOJIS[0], label: '', goal: 0, examName: '', examDate: '' };
  const canDelete = id && activeSubjects(state).length > 1;
  return `<form class="sheet" data-form="study.subjectSave" autocomplete="off">
    <div class="intro"><span class="eyebrow">SUBJECT</span><h1>${id ? '과목 고치기' : '새 과목'}</h1></div>
    <div class="label-like">아이콘</div>
    <div class="chips emoji-chips">${SUBJECT_EMOJIS.map(
      (e) => `<label class="chip"><input type="radio" name="emoji" value="${e}" ${e === s.emoji ? 'checked' : ''}><span>${e}</span></label>`
    ).join('')}${SUBJECT_EMOJIS.includes(s.emoji) ? '' : `<label class="chip"><input type="radio" name="emoji" value="${esc(s.emoji)}" checked><span>${esc(s.emoji)}</span></label>`}</div>
    <label>과목 이름 (12자까지)<input name="label" maxlength="12" value="${esc(s.label)}" placeholder="예: 일본어" required></label>
    <label>하루 목표 (분, 0이면 없음)<input name="goal" type="number" inputmode="numeric" min="0" max="${SUBJECT_GOAL_MAX}" value="${s.goal || 0}"></label>
    <label>시험 이름 (선택)<input name="examName" maxlength="12" value="${esc(s.examName)}" placeholder="예: JLPT N3, HSK 4급"></label>
    <label>시험일 (선택 · 넣으면 D-day가 보여요)<input name="examDate" type="date" value="${s.examDate}"></label>
    <div class="row two">
      <button class="btn ghost" type="button" data-act="modal.close">닫기</button>
      <button class="btn" type="submit">${icon('check')} 저장</button>
    </div>
    ${canDelete ? `<button class="btn small danger-text" type="button" data-act="study.subjectDelete" data-arg="${esc(id)}">이 과목 지우기</button>` : ''}
  </form>`;
}

/* ---------- 동작 ---------- */

function readForm(form) {
  return {
    min: Math.round(Number(form.min.value)),
    focus: Number(form.focus.value) || 3,
    subject: form.subject.value || lastSubject(ctx.state),
    note: form.note.value.trim(),
    date: form.date?.value || todayKey(),
  };
}

// 입력값 확인. 고칠 때는 원래 날짜가 오래됐어도 그대로 둘 수 있다.
function checkInput(v, keepDate = '') {
  if (!(v.min >= MIN_MIN && v.min <= MAX_MIN)) return toast(`공부 시간은 ${MIN_MIN}~${MAX_MIN}분으로 적어 주세요`), false;
  if (v.date > todayKey() || (v.date < addDays(todayKey(), -BACKDATE_DAYS) && v.date !== keepDate)) return toast(`날짜는 최근 ${BACKDATE_DAYS}일 안에서 골라 주세요`), false;
  if (!v.subject) return toast('과목을 먼저 추가해 주세요'), false;
  return true;
}

function save(form) {
  const v = readForm(form);
  if (!checkInput(v)) return null;
  const r = addSession(v);
  chime('ok');
  toast(r.stars < r.full ? `별빛 +${r.stars} · 오늘 상한에 닿았어요. 푹 쉬어요` : `별빛 +${r.stars}을 받았어요`);
  if (v.focus === 5 && v.min >= 60) confetti(['✦', '✨', '📖']);
  return r;
}

const closeModal = () => {
  ctx.ui.modal = '';
  ctx.ui.modalData = null;
};

export const actions = {
  'study.start': (el) => {
    if (ctx.state.study.timer) return;
    const picked = el.closest('section')?.querySelector('input[name="timerSubject"]:checked');
    ctx.state.study.timer = { start: Date.now(), subject: picked?.value || lastSubject(ctx.state) };
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
    closeModal();
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

  // 25분·50분 같은 버튼: 시간 칸을 채운다
  'study.quick': (el) => {
    const form = el.closest('form');
    form.min.value = el.dataset.arg;
    actions['study.preview'](form);
  },

  'study.preview': (form) => {
    if (!form) return;
    const v = readForm(form);
    const out = form.querySelector('[data-preview]');
    if (!v.min || !out) return;
    const full = studyStars(v.min, v.focus);
    // 고치는 중이면 원래 기록의 별빛은 빼고 계산한다
    const old = form.dataset.form === 'study.update' ? ctx.state.study.sessions.find((s) => s.id === ctx.ui.modalData?.id) : null;
    const already = starsOn(ctx.state, v.date) - (old && old.date === v.date ? old.stars : 0);
    const left = capEarn(full, already, DAILY_STAR_CAP);
    out.textContent = `예상 별빛 +${left}${left < full ? ' (하루 상한 적용)' : ''}`;
  },

  'study.edit': (el) => {
    ctx.ui.modal = 'study-edit';
    ctx.ui.modalData = { id: el.dataset.arg };
    rerender();
    actions['study.preview'](document.querySelector('[data-form="study.update"]'));
  },

  // 기록 고치기: 별빛은 다시 계산해서 차이만큼 주고받는다
  'study.update': (form) => {
    const x = ctx.state.study.sessions.find((s) => s.id === ctx.ui.modalData?.id);
    if (!x) return closeModal(), rerender();
    const v = readForm(form);
    if (!checkInput(v, x.date)) return;
    const already = starsOn(ctx.state, v.date) - (x.date === v.date ? x.stars : 0);
    const stars = capEarn(studyStars(v.min, v.focus), already, DAILY_STAR_CAP);
    const diff = stars - x.stars;
    Object.assign(x, { date: v.date, subject: v.subject, min: v.min, focus: v.focus, note: v.note.slice(0, 80), stars });
    if (diff > 0) gain({ star: diff });
    else if (diff < 0) lose({ star: -diff });
    settle();
    closeModal();
    rerender();
    toast(diff ? `고쳤어요 · 별빛 ${diff > 0 ? '+' : ''}${diff}` : '고쳤어요');
  },

  'study.delete': (el) => {
    const s = ctx.state.study.sessions.find((x) => x.id === el.dataset.arg);
    if (!s || !confirm('이 공부 기록을 지울까요? 받은 별빛도 함께 줄어들어요.')) return;
    ctx.state.study.sessions = ctx.state.study.sessions.filter((x) => x.id !== s.id);
    lose({ star: s.stars });
    settle();
    if (ctx.ui.modal === 'study-edit') closeModal();
    rerender();
  },

  'study.subjectNew': () => {
    if (activeSubjects(ctx.state).length >= MAX_SUBJECTS) return toast(`과목은 ${MAX_SUBJECTS}개까지예요`);
    ctx.ui.modal = 'subject';
    ctx.ui.modalData = { id: '' };
    rerender();
  },

  'study.subjectEdit': (el) => {
    ctx.ui.modal = 'subject';
    ctx.ui.modalData = { id: el.dataset.arg };
    rerender();
  },

  'study.subjectSave': (form) => {
    const list = ctx.state.study.subjects;
    const label = form.label.value.trim().slice(0, 12);
    if (!label) return toast('과목 이름을 적어 주세요'), form.label.focus();
    const id = ctx.ui.modalData?.id;
    if (activeSubjects(ctx.state).some((s) => s.id !== id && s.label === label)) return toast('같은 이름의 과목이 있어요');
    const examDate = /^\d{4}-\d{2}-\d{2}$/.test(form.examDate.value) ? form.examDate.value : '';
    const values = {
      emoji: (form.emoji.value || '📘').slice(0, 8),
      label,
      goal: Math.min(SUBJECT_GOAL_MAX, Math.max(0, Math.round(Number(form.goal.value)) || 0)),
      examName: form.examName.value.trim().slice(0, 12),
      examDate,
    };
    const found = list.find((s) => s.id === id);
    if (found) Object.assign(found, values);
    else {
      if (activeSubjects(ctx.state).length >= MAX_SUBJECTS) return toast(`과목은 ${MAX_SUBJECTS}개까지예요`);
      list.push({ id: 'sub-' + newId(), ...values, hidden: false });
    }
    closeModal();
    commit();
    rerender();
    toast(found ? '과목을 고쳤어요' : `${label} 과목을 추가했어요`);
  },

  // 과목 지우기: 지난 기록의 이름이 남도록 목록에서 숨긴다
  'study.subjectDelete': (el) => {
    const s = ctx.state.study.subjects.find((x) => x.id === el.dataset.arg);
    if (!s || activeSubjects(ctx.state).length <= 1) return;
    if (!confirm(`${s.label} 과목을 지울까요? 지난 공부 기록과 별빛은 그대로 남아요.`)) return;
    s.hidden = true;
    if (ctx.state.study.timer?.subject === s.id) ctx.state.study.timer.subject = '';
    closeModal();
    commit();
    rerender();
    toast('과목을 지웠어요');
  },
};
