// 운동 기록 (햇빛 ☀️)
import { ctx, rerender } from '../app/context.js';
import { gain, lose, settle } from '../app/wallet.js';
import { DAILY_SUN_CAP, WORKOUT_MIN_RANGE, HR_RANGE, BACKDATE_DAYS } from '../core/config.js';
import { todayKey, addDays, dateLabel } from '../core/dates.js';
import { ZONES, maxHr, zoneFromHr, workoutPoints, capEarn } from '../core/scoring.js';
import { earnedOn } from '../core/records.js';
import { ACTIVITIES, MOODS, INTENSITIES, byId } from '../data/lists.js';
import { newId } from '../data/store.js';
import { esc, radioChips, money, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime } from '../ui/effects.js';

const inRange = (v, [lo, hi]) => v >= lo && v <= hi;

function zoneOf(hr, intensity) {
  const { age, restHr } = ctx.state.settings;
  return hr ? zoneFromHr(hr, age, restHr) : INTENSITIES.find((i) => i.value === intensity)?.zone ?? 2;
}

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

export function view(state) {
  const { age, restHr } = state.settings;
  const day = todayKey();
  return `
    <header class="page-head"><h1>운동</h1><span class="tiny">운동하면 햇살이 모여요</span></header>
    <section class="card">
      ${title('운동 기록', { iconName: 'heart' })}
      <label>단축어 값 붙여넣기 (선택)
        <input data-input="workout.paste" placeholder="min=30&hr=135&type=run" autocomplete="off" autocapitalize="off">
      </label>
      <form data-form="workout.save" data-input="workout.preview" autocomplete="off">
        ${radioChips('type', ACTIVITIES.map((a) => ({ value: a.id, label: `${a.emoji} ${a.label}` })), 'walk')}
        <label>날짜
          <input name="date" type="date" value="${day}" min="${addDays(day, -BACKDATE_DAYS)}" max="${day}" required>
        </label>
        <label>운동 시간 (분)
          <input name="min" type="number" inputmode="numeric" min="${WORKOUT_MIN_RANGE[0]}" max="${WORKOUT_MIN_RANGE[1]}" required placeholder="예: 30">
        </label>
        <label>평균 심박수 (bpm, 워치에서 확인)
          <input name="hr" type="number" inputmode="numeric" min="${HR_RANGE[0]}" max="${HR_RANGE[1]}" placeholder="모르면 비워두세요">
        </label>
        <label>심박수를 모를 때 체감 강도
          <select name="intensity">${INTENSITIES.map((i) => `<option value="${i.value}" ${i.value === 2 ? 'selected' : ''}>${i.label}</option>`).join('')}</select>
        </label>
        <div class="label-like">오늘 기분</div>
        ${radioChips('mood', MOODS.map((m) => ({ value: m.id, label: `${m.emoji} ${m.label}` })), 'good')}
        <label>한 줄 메모 (선택)
          <input name="note" maxlength="80" placeholder="예: 한강에서 노을 보며 걸었어요">
        </label>
        <p class="tiny" data-preview>최대심박 ${maxHr(age)} bpm 기준${restHr ? ` · 안정시 ${restHr}bpm 반영(카르보넨)` : ''} · 나이는 설정에서 바꿔요</p>
        <button class="btn" type="submit">${icon('sun')} 기록하고 햇살 받기</button>
      </form>
    </section>
    <section class="card">
      ${title('심박 구간별 햇살', { iconName: 'sun' })}
      <ul class="zones">${ZONES.map((z) => `<li><span>${z.label}</span><b>분당 ${money('sun', z.w)}</b></li>`).join('')}</ul>
      <p class="tiny">하루 햇살은 최대 ${DAILY_SUN_CAP}까지예요. 무리하지 말고, 쉬는 날은 식단으로 이슬을 모아요.</p>
    </section>
    <section class="card">
      ${title('최근 기록', { iconName: 'scroll' })}
      ${recentList(state)}
    </section>`;
}

function recentList(state) {
  const recent = state.log.slice(0, 14);
  if (!recent.length) return '<p class="muted">아직 기록이 없어요.</p>';
  return `<ul class="log">${recent
    .map((e) => {
      const mood = MOODS.find((m) => m.id === e.mood);
      return `<li>
        <div><b>${dateLabel(e.date)}</b> · ${byId(ACTIVITIES, e.type).emoji} ${e.min}분${e.hr ? ` · ${e.hr}bpm` : ''} ${mood ? mood.emoji : ''}
        <div class="tiny">${ZONES[e.zone].label}${e.note ? ` · ${esc(e.note)}` : ''}</div></div>
        <div class="right"><b>${money('sun', e.earned, true)}</b>
        <button class="x" data-act="workout.delete" data-arg="${esc(e.id)}" aria-label="기록 삭제">${icon('close')}</button></div>
      </li>`;
    })
    .join('')}</ul>`;
}

/* ---------- 동작 ---------- */

export const actions = {
  'workout.preview': (form) => {
    const min = Number(form.min.value);
    if (!min) return;
    const zone = zoneOf(Number(form.hr.value), Number(form.intensity.value));
    const pts = workoutPoints(min, zone);
    const left = capEarn(pts, earnedOn(ctx.state, form.date.value || todayKey()), DAILY_SUN_CAP);
    form.querySelector('[data-preview]').textContent = `${ZONES[zone].label} · 예상 햇살 +${left}${left < pts ? ' (하루 상한 적용)' : ''}`;
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

  'workout.save': (form) => {
    const min = Math.round(Number(form.min.value));
    const hr = form.hr.value ? Math.round(Number(form.hr.value)) : 0;
    const date = form.date.value || todayKey();
    if (!inRange(min, WORKOUT_MIN_RANGE)) return toast('운동 시간을 확인해 주세요');
    if (hr && !inRange(hr, HR_RANGE)) return toast('심박수를 확인해 주세요');
    if (date > todayKey() || date < addDays(todayKey(), -BACKDATE_DAYS)) return toast(`날짜는 최근 ${BACKDATE_DAYS}일 안에서 골라 주세요`);
    const r = addWorkout({
      type: form.type.value,
      date,
      min,
      hr,
      intensity: Number(form.intensity.value),
      mood: form.mood.value,
      note: form.note.value.trim(),
    });
    chime('ok');
    toast(r.earned < r.points ? `햇살 +${r.earned} · 오늘 상한에 닿았어요. 쉬는 것도 운동이에요` : `햇살 +${r.earned}을 받았어요`);
    rerender();
  },

  'workout.delete': (el) => {
    const entry = ctx.state.log.find((x) => x.id === el.dataset.arg);
    if (!entry || !confirm('이 기록을 지울까요? 받은 햇살도 함께 줄어들어요.')) return;
    ctx.state.log = ctx.state.log.filter((x) => x.id !== entry.id);
    lose({ sun: entry.earned });
    settle();
    rerender();
  },
};
