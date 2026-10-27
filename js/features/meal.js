// 식단 미션 · 물 마시기 (이슬)
import { ctx, rerender, commit } from '../app/context.js';
import { gain, lose, settle } from '../app/wallet.js';
import { MISSION_WATER, MISSION_REWARD_LIMIT, MAX_CUSTOM_MISSIONS, CUP_GOAL, CUP_BONUS } from '../core/config.js';
import { todayKey } from '../core/dates.js';
import { cupsWater } from '../core/scoring.js';
import { allMissions } from '../core/records.js';
import { newId } from '../data/store.js';
import { esc, money, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime } from '../ui/effects.js';

// 미션 보상은 하루 MISSION_REWARD_LIMIT개까지만 준다.
const missionWater = (count) => Math.min(count, MISSION_REWARD_LIMIT) * MISSION_WATER;

// 미션은 눌러서 고른 뒤 '저장'을 눌러야 반영된다.
// 고르는 중인 상태는 ctx.ui.mealDraft = { day, done: { missionId: true } } 에 두고, 저장 전에는 기록에 남기지 않는다.
const saved = (state, day) => state.meals[day] || {};
function draftOf(state, day) {
  const d = ctx.ui.mealDraft;
  return d && d.day === day ? d.done : null;
}
const sameSet = (a, b) => Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((k) => b[k]);

export function view(state) {
  const day = todayKey();
  const draft = draftOf(state, day);
  const done = draft || saved(state, day);
  const doneCount = Object.keys(done).length;
  const dirty = draft && !sameSet(draft, saved(state, day));
  const diff = missionWater(doneCount) - missionWater(Object.keys(saved(state, day)).length);
  const cups = state.cups[day] || 0;
  const custom = new Set(state.customMissions.map((m) => m.id));
  return `
    <header class="page-head"><h1>식단</h1><span class="tiny">잘 먹을수록 이슬이 맺혀요</span></header>
    <section class="card">
      ${title('물 마시기', { iconName: 'drop', aside: `오늘 ${cups} / ${CUP_GOAL}잔` })}
      <div class="cups">${Array.from({ length: CUP_GOAL }, (_, i) => `<button class="cup ${i < cups ? 'on' : ''}" data-act="meal.cup" data-arg="${i + 1}" aria-label="${i + 1}잔" aria-pressed="${i < cups}">${icon('drop')}</button>`).join('')}</div>
      <p class="tiny">한 잔(약 250ml)마다 ${money('water', 1, true)}, ${CUP_GOAL}잔을 채우면 보너스 ${money('water', CUP_BONUS, true)}</p>
    </section>
    <section class="card">
      ${title('오늘의 식단 미션', { iconName: 'leaf', aside: `보상 ${Math.min(doneCount, MISSION_REWARD_LIMIT)} / ${MISSION_REWARD_LIMIT}` })}
      <ul class="missions">
        ${allMissions(state)
          .map(
            (m) => `<li><button class="mission ${done[m.id] ? 'on' : ''}" data-act="meal.pick" data-arg="${esc(m.id)}" aria-pressed="${!!done[m.id]}">
              <span class="em">${esc(m.emoji)}</span><span>${esc(m.label)}</span><span class="chk">${done[m.id] ? icon('check') : ''}</span>
            </button>${custom.has(m.id) ? `<button class="x" data-act="meal.deleteMission" data-arg="${esc(m.id)}" aria-label="미션 삭제">${icon('close')}</button>` : ''}</li>`
          )
          .join('')}
      </ul>
      <p class="tiny">미션마다 ${money('water', MISSION_WATER, true)}, 하루 ${MISSION_REWARD_LIMIT}개까지 받아요${doneCount > MISSION_REWARD_LIMIT ? ' · 나머지는 기록만 돼요' : ''}. 칼로리나 체중은 기록하지 않아요.</p>
      ${dirty ? '<p class="tiny save-note">아직 저장하지 않았어요</p>' : ''}
      <div class="row two">
        <button class="btn soft" data-act="meal.reset" ${dirty ? '' : 'disabled'}>되돌리기</button>
        <button class="btn" data-act="meal.save" ${dirty ? '' : 'disabled'}>${icon('check')} 저장${diff > 0 ? ` ${money('water', diff, true)}` : ''}</button>
      </div>
    </section>
    <section class="card">
      ${title('나만의 미션', { iconName: 'sparkle', aside: `최대 ${MAX_CUSTOM_MISSIONS}개` })}
      <form data-form="meal.addMission" class="row" autocomplete="off">
        <input name="emoji" maxlength="2" value="🍎" class="emoji-input" aria-label="이모지">
        <input name="label" maxlength="20" placeholder="예: 과일 먹기" required aria-label="미션 이름">
        <button class="btn small fit" type="submit">추가</button>
      </form>
    </section>`;
}

export const actions = {
  // 같은 잔을 다시 누르면 한 잔 줄어든다. 보상은 잔 수로 다시 계산해 차이만 반영한다.
  'meal.cup': (el) => {
    const day = todayKey();
    const n = Number(el.dataset.arg);
    const old = ctx.state.cups[day] || 0;
    const next = old === n ? n - 1 : n;
    const diff = cupsWater(next) - cupsWater(old);
    ctx.state.cups[day] = next;
    if (diff > 0) gain({ water: diff });
    else if (diff < 0) lose({ water: -diff });
    if (next >= CUP_GOAL && old < CUP_GOAL) {
      toast(`물 ${CUP_GOAL}잔 완료! 보너스 이슬까지 받았어요`);
      chime('level');
    }
    settle();
    rerender();
  },

  // 미션 고르기: 화면에만 표시하고 아직 저장하지 않는다
  'meal.pick': (el) => {
    const day = todayKey();
    const id = el.dataset.arg;
    const draft = draftOf(ctx.state, day) || { ...saved(ctx.state, day) };
    if (draft[id]) delete draft[id];
    else draft[id] = true;
    ctx.ui.mealDraft = { day, done: draft };
    rerender();
  },

  'meal.reset': () => {
    ctx.ui.mealDraft = null;
    rerender();
  },

  // 저장: 고른 결과를 기록하고, 보상은 저장 전후 개수 차이만큼 주고받는다
  'meal.save': () => {
    const day = todayKey();
    const draft = draftOf(ctx.state, day);
    if (!draft) return;
    const before = missionWater(Object.keys(saved(ctx.state, day)).length);
    ctx.state.meals[day] = { ...draft };
    ctx.ui.mealDraft = null;
    const diff = missionWater(Object.keys(draft).length) - before;
    if (diff > 0) {
      gain({ water: diff });
      chime('ok');
      toast(`식단을 저장했어요 · 이슬 +${diff}`);
    } else {
      if (diff < 0) lose({ water: -diff });
      toast('식단을 저장했어요');
    }
    settle();
    rerender();
  },

  'meal.addMission': (form) => {
    if (ctx.state.customMissions.length >= MAX_CUSTOM_MISSIONS) return toast(`나만의 미션은 ${MAX_CUSTOM_MISSIONS}개까지예요`);
    ctx.state.customMissions.push({ id: 'c-' + newId(), emoji: form.emoji.value.trim() || '✅', label: form.label.value.trim().slice(0, 20) });
    commit();
    rerender();
  },

  'meal.deleteMission': (el) => {
    ctx.state.customMissions = ctx.state.customMissions.filter((m) => m.id !== el.dataset.arg);
    if (ctx.ui.mealDraft) delete ctx.ui.mealDraft.done[el.dataset.arg];
    commit();
    rerender();
  },
};
