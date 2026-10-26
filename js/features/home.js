// 홈: 세계수 장면, 여정 정보, 돌보기, 오늘 요약, 세계수 완성
import { ctx, rerender } from '../app/context.js';
import { gain, settle } from '../app/wallet.js';
import { CARE_REWARD, DAILY_SUN_CAP, DAILY_STAR_CAP } from '../core/config.js';
import { todayKey } from '../core/dates.js';
import { LAST_STAGE, plantXp, stageOf } from '../core/scoring.js';
import { earnedOn, minutesOn, missionsDone, allMissions, needsRest, studyMinOn, starsOn, streakOf } from '../core/records.js';
import { TREES, treeById } from '../data/trees.js';
import { esc, bar, money, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { sceneSvg, journey, greeting, wallet, questsCard, weekCard, treePicker } from '../ui/components.js';
import { toast, chime, confetti } from '../ui/effects.js';

export function view(state, ui) {
  const j = journey(state);
  const care = state.care[todayKey()] || {};
  return `
    <section class="hero">
      <div class="bubble">${esc(ui.bubble || greeting(state))}</div>
      <div class="scene" id="scene" role="button" tabindex="0" data-act="home.pet" aria-label="정령 ${esc(state.settings.name)} 쓰다듬기">${sceneSvg(state)}</div>
      <div class="card hero-info">
        <div class="hero-top">
          <div><span class="eyebrow">${j.tree.label} · ${j.day}일째</span><h1>${j.stageName}</h1></div>
          <span class="spirit-tag">정령 <b>${esc(state.settings.name)}</b></span>
        </div>
        ${bar(j.ratio)}
        <p class="tiny">${j.nextName ? `다음 '${j.nextName}'까지 ${j.remain}점 · ${j.total}일의 여정` : '세계수가 완성됐어요. 숲에 심고 새로운 세계수를 키워요'}</p>
        <div class="row two">
          <button class="btn small soft" data-act="home.care" data-arg="water" ${care.water ? 'disabled' : ''}>${icon('drop')} 이슬 주기 ${care.water ? icon('check') : `+${CARE_REWARD}`}</button>
          <button class="btn small soft" data-act="home.care" data-arg="sun" ${care.sun ? 'disabled' : ''}>${icon('sun')} 햇살 쬐기 ${care.sun ? icon('check') : `+${CARE_REWARD}`}</button>
        </div>
        ${j.stage === LAST_STAGE ? `<button class="btn gold" data-act="home.completeOpen">${icon('forest')} 숲에 심고 새 세계수 키우기</button>` : ''}
      </div>
    </section>
    ${wallet(state)}
    ${needsRest(state) ? '<section class="card note">3일 연속 하루 상한까지 달렸어요. 오늘은 스트레칭이나 푹 쉬는 것도 세계수에게 좋아요.</section>' : ''}
    ${todayCard(state)}
    ${questsCard(state, todayKey())}
    ${weekCard(state, todayKey())}`;
}

function todayCard(state) {
  const day = todayKey();
  const study = state.settings.studyEnabled;
  const earned = earnedOn(state, day);
  const row = (ic, label, value, ratio, act, cls = '') =>
    `<li><div class="head">${icon(ic)}<span>${label}</span><span>${value}</span></div>${ratio === null ? '' : bar(ratio, cls)}${act}</li>`;
  return `<section class="card">
    ${title('오늘', { iconName: 'sun', aside: `연속 ${streakOf(state)}일` })}
    <ul class="today">
      ${row('heart', `운동 ${minutesOn(state, day)}분`, `${money('sun', earned)} / ${DAILY_SUN_CAP}`, earned / DAILY_SUN_CAP, '')}
      ${study ? row('book', `공부 ${studyMinOn(state, day)}분`, `${money('star', starsOn(state, day))} / ${DAILY_STAR_CAP}`, starsOn(state, day) / DAILY_STAR_CAP, '', 'star') : ''}
      ${row('leaf', `식단 미션 ${missionsDone(state, day)} / ${allMissions(state).length}`, `물 ${state.cups[day] || 0}잔`, null, '')}
    </ul>
    <div class="row ${study ? 'three' : 'two'}">
      <button class="btn small" data-act="nav.tab" data-arg="workout">운동 기록</button>
      ${study ? '<button class="btn small" data-act="nav.tab" data-arg="study">공부 시작</button>' : ''}
      <button class="btn small soft" data-act="nav.tab" data-arg="meal">식단 체크</button>
    </div>
  </section>`;
}

// 세계수를 완성했을 때: 숲에 심고 다음 세계수 고르기
export function completeModal(state) {
  const planted = state.dex.map((d) => d.species).concat(state.plant.species);
  const left = TREES.filter((t) => !planted.includes(t.id));
  const pick = (left[0] || TREES[0]).id;
  return `<form class="sheet" data-form="home.complete">
    <div class="intro"><span class="eyebrow">THE WORLD TREE</span>
    <h1>${treeById(state.plant.species).label}가 완성됐어요</h1>
    <p class="muted">숲에 심으면 언제든 다시 볼 수 있어요. 다음에 키울 세계수를 골라 주세요. 포인트와 아이템은 그대로예요.</p></div>
    ${treePicker('tree', pick, left.length ? planted : [])}
    <div class="row two">
      <button class="btn ghost" type="button" data-act="modal.close">나중에</button>
      <button class="btn gold" type="submit">숲에 심기</button>
    </div>
  </form>`;
}

const LINES = ['히히, 간지러워요!', '오늘도 같이 있어서 좋아요', '이슬 한 모금 어때요?', '조금만 움직여 볼까요?', '세계수가 조금 자랐어요', '바람이 기분 좋아요', '공부도 운동도 같이 해요!'];

export const actions = {
  // 장면을 누르면 정령이 반응한다. 전체를 다시 그리지 않는다.
  'home.pet': (el) => {
    el.classList.remove('bounce');
    void el.offsetWidth;
    el.classList.add('bounce');
    ctx.ui.bubble = LINES[Math.floor(Math.random() * LINES.length)];
    const bubble = el.parentElement.querySelector('.bubble');
    if (bubble) bubble.textContent = ctx.ui.bubble;
    chime('soft');
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = '💛';
    el.appendChild(h);
    setTimeout(() => h.remove(), 1200);
  },

  'home.care': (el) => {
    const kind = el.dataset.arg;
    const day = todayKey();
    const care = (ctx.state.care[day] = ctx.state.care[day] || {});
    if (care[kind]) return;
    care[kind] = true;
    gain({ [kind]: CARE_REWARD });
    settle();
    chime('ok');
    ctx.ui.bubble = kind === 'water' ? '촉촉한 이슬이 반짝여요' : '따스한 햇살에 잎이 반짝여요';
    rerender();
  },

  'home.completeOpen': () => {
    ctx.ui.modal = 'complete';
    rerender();
  },

  'home.complete': (form) => {
    const s = ctx.state;
    if (stageOf(plantXp(s)) < LAST_STAGE) return;
    s.dex.push({ species: s.plant.species, name: s.settings.name, date: todayKey() });
    const next = form.tree.value;
    s.plant = { species: TREES.some((t) => t.id === next) ? next : TREES[0].id, startXp: s.xp, startDate: todayKey() };
    ctx.ui.modal = '';
    settle();
    rerender();
    confetti(['✦', '🌿', '✨', '💛']);
    chime('level');
    toast('세계수를 숲에 심었어요. 새로운 30일을 시작해요');
  },
};
