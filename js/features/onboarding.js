// 처음 실행할 때 뜨는 시작 화면: 세계수 씨앗과 정령 이름 고르기
import { ctx, rerender, commit } from '../app/context.js';
import { TREES } from '../data/trees.js';
import { DEFAULT_SPIRIT_NAME } from '../data/store.js';
import { todayKey } from '../core/dates.js';
import { JOURNEY_DAYS } from '../core/config.js';
import { treePicker } from '../ui/components.js';
import { toast, chime } from '../ui/effects.js';

export function modal() {
  return `<form class="sheet" data-form="onboarding.start" autocomplete="off">
    <div class="intro">
      <span class="eyebrow">WORLD TREE · ${JOURNEY_DAYS} DAYS</span>
      <h1>세계수 ${JOURNEY_DAYS}일</h1>
      <p class="muted">운동하고, 잘 먹고, 공부할수록 세계수가 자라요. ${JOURNEY_DAYS}일 동안 함께 키울 씨앗을 골라 주세요.</p>
    </div>
    ${treePicker('tree', TREES[0].id)}
    <label>세계수를 돌볼 정령의 이름 (10자까지)<input name="name" maxlength="10" placeholder="예: ${DEFAULT_SPIRIT_NAME}" required></label>
    <label>나이 (운동 강도 계산용)<input name="age" type="number" inputmode="numeric" min="10" max="90" value="30" required></label>
    <label class="check"><input type="checkbox" name="studyEnabled"> 공부 기록도 할래요 (회계 공부 등 · 나중에 설정에서 바꿀 수 있어요)</label>
    <button class="btn gold" type="submit">씨앗 심기</button>
  </form>`;
}

export const actions = {
  'onboarding.start': (form) => {
    const s = ctx.state;
    const id = form.tree.value;
    s.plant = { species: TREES.some((t) => t.id === id) ? id : TREES[0].id, startXp: s.xp, startDate: todayKey() };
    s.settings.name = form.name.value.trim().slice(0, 10) || DEFAULT_SPIRIT_NAME;
    s.settings.age = Math.min(90, Math.max(10, Math.round(Number(form.age.value)) || 30));
    s.settings.studyEnabled = form.studyEnabled.checked;
    s.onboarded = true;
    ctx.ui.modal = '';
    commit();
    rerender();
    toast(`정령 ${s.settings.name}와(과) 함께 씨앗을 심었어요`);
    chime('level');
  },
};
