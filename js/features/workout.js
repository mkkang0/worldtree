// 운동 기록 (햇빛 ☀️)
import { ctx, rerender } from '../app/context.js';
import { gain, lose, settle } from '../app/wallet.js';
import { DAILY_SUN_CAP, WORKOUT_MIN_RANGE, HR_RANGE, BACKDATE_DAYS } from '../core/config.js';
import { todayKey, addDays, dateLabel } from '../core/dates.js';
import { ZONES, maxHr, zoneFromHr, workoutPoints, capEarn } from '../core/scoring.js';
import { earnedOn } from '../core/records.js';
import { ACTIVITIES, MOODS, INTENSITIES, byId } from '../data/lists.js';
import { newId } from '../data/store.js';
import { esc, radioChips, money, title, fold, moreList } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime } from '../ui/effects.js';

const inRange = (v, [lo, hi]) => v >= lo && v <= hi;

function zoneOf(hr, intensity) {
  const { age, restHr } = ctx.state.settings;
  return hr ? zoneFromHr(hr, age, restHr) : INTENSITIES.find((i) => i.value === intensity)?.zone ?? 2;
}

// 기록에는 체감 강도 대신 Zone이 남아 있어서, 다시 채울 때는 Zone에 맞는 강도를 고른다
const intensityOfZone = (zone) => (INTENSITIES.find((i) => i.zone === zone) || INTENSITIES[1]).value;

export function addWorkout({ type, date, min, hr, intensity, mood = '', note = '' }) {
  const zone = zoneOf(hr, intensity);
  const points = workoutPoints(min, zone);
  const earned = capEarn(points, earnedOn(ctx.state, date), DAILY_SUN_CAP);
  ctx.state.log.unshift({ id: newId(), date, type, min, hr: hr || null, zone, points, earned, mood, note: note.slice(0, 80) });
  ctx.state.log = ctx.state.log.slice(0, 300);
  gain({ sun: earned });
  settle();
  return { zone, points, earned };
}

/* ---------- 단축어 연동: 'min=30&hr=135&type=run' 형태의 문장 ---------- */

// 문장 어디에 있든 min=… 부터 읽는다. 값이 이상하면 null.
export function parseLogText(text) {
  const s = String(text);
  const i = s.indexOf('min=');
  if (i < 0) return null;
  const q = new URLSearchParams(s.slice(i).split('#')[0]);
  const min = Math.round(Number(q.get('min')));
  const hr = Math.round(Number(q.get('hr'))) || 0;
  if (!inRange(min, WORKOUT_MIN_RANGE) || (hr && !inRange(hr, HR_RANGE))) return null;
  const type = ACTIVITIES.some((a) => a.id === q.get('type')) ? q.get('type') : 'etc';
  return { min, hr, type };
}

// 사파리에서 주소 뒤에 #log?min=… 를 붙여 열었을 때만 쓴다.
// (아이폰은 홈 화면 앱과 사파리의 저장 공간이 따로라서 설치한 앱에는 반영되지 않는다)
export function importFromHash() {
  if (!location.hash.startsWith('#log?')) return;
  const log = parseLogText(location.hash);
  history.replaceState(null, '', location.pathname + location.search);
  if (!log) return toast('가져온 운동 정보가 올바르지 않아요');
  if (confirm(`운동 ${log.min}분${log.hr ? `, 평균 ${log.hr}bpm` : ''}을 기록할까요?`)) {
    const r = addWorkout({ ...log, date: todayKey(), intensity: 2, note: '단축어로 가져옴' });
    ctx.ui.tab = 'workout';
    rerender();
    toast(`햇살 +${r.earned}`);
  }
}

/* ---------- 화면 ---------- */

export function view(state, ui) {
  const { age, restHr } = state.settings;
  const day = todayKey();
  return `
    <header class="page-head"><h1>운동</h1><span class="tiny">운동하면 햇살이 모여요</span></header>
    <section class="card">
      ${title('운동 기록', { iconName: 'heart' })}
      <form data-form="workout.save" data-input="workout.preview" autocomplete="off">
        ${state.log.length ? `<button type="button" class="btn small soft repeat" data-act="workout.repeat">${icon('swap')} 지난번처럼 채우기</button>` : ''}
        ${workoutFields({ date: day, type: 'walk', intensity: 2, mood: 'good' })}
        <p class="tiny" data-preview>최대심박 ${maxHr(age)} bpm 기준${restHr ? ` · 안정시 ${restHr}bpm 반영(카르보넨)` : ''} · 나이는 설정에서 바꿔요</p>
        <button class="btn" type="submit">${icon('sun')} 기록하고 햇살 받기</button>
      </form>
      ${fold(
        '단축어 값 붙여넣기',
        `<input data-input="workout.paste" placeholder="min=30&hr=135&type=run" autocomplete="off" autocapitalize="off" aria-label="단축어 값">
        <p class="tiny">아이폰 단축어가 복사한 심박 값을 붙여넣으면 위 칸이 채워져요. 만드는 방법은 설정에 있어요.</p>`
      )}
    </section>
    <section class="card">
      ${title('최근 기록', { iconName: 'scroll', aside: '눌러서 고치기' })}
      ${moreList(byDateDesc(state.log).map(workoutRow), 'workout', ui.more?.workout)}
    </section>
    <section class="card">
      ${fold(
        `${icon('sun')} 심박 구간별 햇살`,
        `<ul class="zones">${ZONES.map((z) => `<li><span>${z.label}</span><b>분당 ${money('sun', z.w)}</b></li>`).join('')}</ul>
        <p class="tiny">하루 햇살은 최대 ${DAILY_SUN_CAP}까지예요. 무리하지 말고, 쉬는 날은 식단으로 이슬을 모아요.</p>`,
        { cls: 'plain' }
      )}
    </section>`;
}

// 운동 기록 입력칸 (새 기록 · 기록 고치기에서 같이 쓴다)
function workoutFields(v, { minDate } = {}) {
  const day = todayKey();
  const lo = minDate && minDate < addDays(day, -BACKDATE_DAYS) ? minDate : addDays(day, -BACKDATE_DAYS);
  return `
    ${radioChips('type', ACTIVITIES.map((a) => ({ value: a.id, label: `${a.emoji} ${a.label}` })), v.type)}
    <div class="row two fields">
      <label>날짜<input name="date" type="date" value="${v.date}" min="${lo}" max="${day}" required></label>
      <label>시간 (분)<input name="min" type="number" inputmode="numeric" min="${WORKOUT_MIN_RANGE[0]}" max="${WORKOUT_MIN_RANGE[1]}" required placeholder="예: 30" value="${v.min || ''}"></label>
    </div>
    <div class="row two fields">
      <label>평균 심박 (bpm)<input name="hr" type="number" inputmode="numeric" min="${HR_RANGE[0]}" max="${HR_RANGE[1]}" placeholder="모르면 비움" value="${v.hr || ''}"></label>
      <label>체감 강도<select name="intensity">${INTENSITIES.map((i) => `<option value="${i.value}" ${i.value === v.intensity ? 'selected' : ''}>${i.label}</option>`).join('')}</select></label>
    </div>
    <p class="tiny hint">심박을 모르면 체감 강도로 계산해요.</p>
    ${fold(
      `기분 · 메모 <span class="tiny">(선택)</span>`,
      `${radioChips('mood', MOODS.map((m) => ({ value: m.id, label: `${m.emoji} ${m.label}` })), v.mood)}
      <label>한 줄 메모<input name="note" maxlength="80" placeholder="예: 한강에서 노을 보며 걸었어요" value="${esc(v.note || '')}"></label>`,
      { open: !!v.note }
    )}`;
}

// 운동 기록 한 줄. 누르면 고치기 창이 열린다. (기록·달력 화면도 같이 쓴다)
export function workoutRow(e) {
  const mood = MOODS.find((m) => m.id === e.mood);
  const act = byId(ACTIVITIES, e.type);
  return `<li>
    <button class="log-body" data-act="workout.edit" data-arg="${esc(e.id)}" aria-label="운동 기록 고치기">
      <span><b>${dateLabel(e.date)}</b> · ${act.emoji} ${act.label} ${e.min}분${e.hr ? ` · ${e.hr}bpm` : ''} ${mood ? mood.emoji : ''}</span>
      <span class="tiny">${ZONES[e.zone].label}${e.note ? ` · ${esc(e.note)}` : ''}</span>
    </button>
    <div class="right"><b>${money('sun', e.earned, true)}</b>
    <button class="x" data-act="workout.delete" data-arg="${esc(e.id)}" aria-label="기록 삭제">${icon('close')}</button></div>
  </li>`;
}

// 날짜가 최근인 순서로 (같은 날은 나중에 넣은 것이 위)
export const byDateDesc = (list) =>
  list
    .map((x, i) => [x, i])
    .sort((a, b) => (a[0].date === b[0].date ? a[1] - b[1] : a[0].date < b[0].date ? 1 : -1))
    .map((p) => p[0]);

// 운동 기록 고치기 창
export function editModal(state, ui) {
  const e = state.log.find((x) => x.id === ui.modalData?.id);
  if (!e) return '';
  return `<form class="sheet" data-form="workout.update" data-input="workout.preview" autocomplete="off">
    <div class="intro"><span class="eyebrow">EDIT</span><h1>운동 기록 고치기</h1>
    <p class="muted">고치면 받은 햇살도 다시 계산해요.</p></div>
    ${workoutFields({ ...e, intensity: intensityOfZone(e.zone) }, { minDate: e.date })}
    <p class="tiny" data-preview></p>
    <div class="row two">
      <button class="btn ghost" type="button" data-act="modal.close">닫기</button>
      <button class="btn" type="submit">${icon('check')} 저장</button>
    </div>
    <button class="btn small danger-text" type="button" data-act="workout.delete" data-arg="${esc(e.id)}">이 기록 지우기</button>
  </form>`;
}

/* ---------- 동작 ---------- */

function readForm(form) {
  return {
    type: form.type.value || 'etc',
    date: form.date.value || todayKey(),
    min: Math.round(Number(form.min.value)),
    hr: form.hr.value ? Math.round(Number(form.hr.value)) : 0,
    intensity: Number(form.intensity.value),
    mood: form.mood.value,
    note: form.note.value.trim(),
  };
}

// 입력값 확인. 고칠 때는 원래 날짜가 오래됐어도 그대로 둘 수 있다.
function checkInput(v, keepDate = '') {
  if (!inRange(v.min, WORKOUT_MIN_RANGE)) return toast('운동 시간을 확인해 주세요'), false;
  if (v.hr && !inRange(v.hr, HR_RANGE)) return toast('심박수를 확인해 주세요'), false;
  if (v.date > todayKey() || (v.date < addDays(todayKey(), -BACKDATE_DAYS) && v.date !== keepDate)) {
    return toast(`날짜는 최근 ${BACKDATE_DAYS}일 안에서 골라 주세요`), false;
  }
  return true;
}

const closeModal = () => {
  ctx.ui.modal = '';
  ctx.ui.modalData = null;
};

export const actions = {
  'workout.preview': (form) => {
    const min = Number(form.min.value);
    const out = form.querySelector('[data-preview]');
    if (!min || !out) return;
    const zone = zoneOf(Number(form.hr.value), Number(form.intensity.value));
    const pts = workoutPoints(min, zone);
    const date = form.date.value || todayKey();
    // 고치는 중이면 원래 기록의 햇살은 빼고 계산한다
    const old = form.dataset.form === 'workout.update' ? ctx.state.log.find((x) => x.id === ctx.ui.modalData?.id) : null;
    const left = capEarn(pts, earnedOn(ctx.state, date) - (old && old.date === date ? old.earned : 0), DAILY_SUN_CAP);
    out.textContent = `${ZONES[zone].label} · 예상 햇살 +${left}${left < pts ? ' (하루 상한 적용)' : ''}`;
  },

  'workout.paste': (input) => {
    const log = parseLogText(input.value);
    const form = document.querySelector('[data-form="workout.save"]');
    if (!log || !form) return;
    form.min.value = log.min;
    form.hr.value = log.hr || '';
    const radio = form.querySelector(`input[name="type"][value="${log.type}"]`);
    if (radio) radio.checked = true;
    actions['workout.preview'](form);
    toast('값을 불러왔어요. 확인하고 기록 버튼을 눌러 주세요');
  },

  // 가장 최근 기록의 종류·시간·심박을 그대로 채운다 (날짜는 오늘)
  'workout.repeat': (el) => {
    const last = byDateDesc(ctx.state.log)[0];
    const form = el.closest('form');
    if (!last || !form) return;
    const radio = form.querySelector(`input[name="type"][value="${last.type}"]`);
    if (radio) radio.checked = true;
    form.min.value = last.min;
    form.hr.value = last.hr || '';
    form.intensity.value = intensityOfZone(last.zone);
    actions['workout.preview'](form);
    toast('지난 기록으로 채웠어요. 확인하고 기록 버튼을 눌러 주세요');
  },

  'workout.save': (form) => {
    const v = readForm(form);
    if (!checkInput(v)) return;
    const r = addWorkout(v);
    chime('ok');
    toast(r.earned < r.points ? `햇살 +${r.earned} · 오늘 상한에 닿았어요. 쉬는 것도 운동이에요` : `햇살 +${r.earned}을 받았어요`);
    rerender();
  },

  'workout.edit': (el) => {
    ctx.ui.modal = 'workout-edit';
    ctx.ui.modalData = { id: el.dataset.arg };
    rerender();
    const form = document.querySelector('[data-form="workout.update"]');
    if (form) actions['workout.preview'](form);
  },

  // 기록 고치기: 햇살은 다시 계산해서 차이만큼 주고받는다
  'workout.update': (form) => {
    const e = ctx.state.log.find((x) => x.id === ctx.ui.modalData?.id);
    if (!e) {
      closeModal();
      return rerender();
    }
    const v = readForm(form);
    if (!checkInput(v, e.date)) return;
    const zone = zoneOf(v.hr, v.intensity);
    const points = workoutPoints(v.min, zone);
    const earned = capEarn(points, earnedOn(ctx.state, v.date) - (e.date === v.date ? e.earned : 0), DAILY_SUN_CAP);
    const diff = earned - e.earned;
    Object.assign(e, { date: v.date, type: v.type, min: v.min, hr: v.hr || null, zone, points, earned, mood: v.mood, note: v.note.slice(0, 80) });
    if (diff > 0) gain({ sun: diff });
    else if (diff < 0) lose({ sun: -diff });
    settle();
    closeModal();
    rerender();
    toast(diff ? `고쳤어요 · 햇살 ${diff > 0 ? '+' : ''}${diff}` : '고쳤어요');
  },

  'workout.delete': (el) => {
    const entry = ctx.state.log.find((x) => x.id === el.dataset.arg);
    if (!entry || !confirm('이 기록을 지울까요? 받은 햇살도 함께 줄어들어요.')) return;
    ctx.state.log = ctx.state.log.filter((x) => x.id !== entry.id);
    lose({ sun: entry.earned });
    settle();
    if (ctx.ui.modal === 'workout-edit') closeModal();
    rerender();
  },
};
