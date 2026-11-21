// 홈: 세계수 장면, 여정 정보, 돌보기, 오늘 요약, 세계수 완성
import { ctx, rerender } from '../app/context.js';
import { gain, settle } from '../app/wallet.js';
import { CARE_REWARD, DAILY_SUN_CAP, DAILY_STAR_CAP, JOURNEY_DAYS } from '../core/config.js';
import { todayKey } from '../core/dates.js';
import { LAST_STAGE, STAGES, plantXp, stageOf } from '../core/scoring.js';
import { earnedOn, minutesOn, missionsDone, allMissions, needsRest, studyMinOn, starsOn, streakOf, studyMinBySubjectOn, recentXpPerDay } from '../core/records.js';
import { LINES, STAGE_LINES, fill } from '../data/lines.js';
import { activeSubjects } from '../data/lists.js';
import { buildingById, islandLevel, workOf } from '../data/buildings.js';
import { builtCount, buildingNow, residentCount } from '../core/island.js';
import { TREES, treeById } from '../data/trees.js';
import { esc, bar, money, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { sceneSvg, journey, greeting, wallet, questsCard, weekCard, treePicker, ddayBadge, examDday } from '../ui/components.js';
import { toast, chime, confetti } from '../ui/effects.js';

export function view(state, ui) {
  const j = journey(state);
  const care = state.care[todayKey()] || {};
  return `
    <section class="hero">
      <div class="bubble">${esc(ui.bubble || greeting(state))}</div>
      <div class="scene" id="scene" role="button" tabindex="0" data-act="garden.open" aria-label="나의 정원 열기 (세계수를 크게 보며 꾸미기)">${sceneSvg(state)}<span class="scene-hint">${icon('sparkle')} 눌러서 꾸미기</span></div>
      <button class="photo-btn" data-act="photo.make" aria-label="세계수 사진으로 저장">${icon('camera')}</button>
      <div class="card hero-info">
        <div class="hero-top">
          <div><span class="eyebrow">${j.tree.label} · ${j.day}일째</span><h1>${j.stageName}</h1></div>
          <div class="hero-side">${ddayBadge(state)}<span class="spirit-tag">정령 <b>${esc(state.settings.name)}</b></span></div>
        </div>
        ${stageTrack(j)}
        <p class="tiny">${j.nextName ? `${STAGES.length}단계 중 ${j.stage + 1}단계 · 다음 '${j.nextName}'까지 ${j.remain}점` : '세계수가 완성됐어요. 숲에 심고 새로운 세계수를 키워요'}</p>
        <div class="row two">
          <button class="btn small soft" data-act="home.care" data-arg="water" ${care.water ? 'disabled' : ''}>${icon('drop')} 이슬 주기 ${care.water ? icon('check') : `+${CARE_REWARD}`}</button>
          <button class="btn small soft" data-act="home.care" data-arg="sun" ${care.sun ? 'disabled' : ''}>${icon('sun')} 햇살 쬐기 ${care.sun ? icon('check') : `+${CARE_REWARD}`}</button>
        </div>
        ${j.stage === LAST_STAGE ? `<button class="btn gold" data-act="home.completeOpen">${icon('forest')} 숲에 심고 새 세계수 키우기</button>` : ''}
      </div>
    </section>
    ${wallet(state)}
    ${islandLink(state)}
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
      ${study ? row('book', `공부 ${studyMinOn(state, day)}분`, `${money('star', starsOn(state, day))} / ${DAILY_STAR_CAP}`, starsOn(state, day) / DAILY_STAR_CAP, subjectGoals(state, day), 'star') : ''}
      ${row('leaf', `식단 미션 ${missionsDone(state, day)} / ${allMissions(state).length}`, `물 ${state.cups[day] || 0}잔`, null, '')}
    </ul>
    <div class="row ${study ? 'three' : 'two'}">
      <button class="btn small" data-act="nav.tab" data-arg="workout">운동 기록</button>
      ${study ? '<button class="btn small" data-act="nav.tab" data-arg="study">공부 시작</button>' : ''}
      <button class="btn small soft" data-act="nav.tab" data-arg="meal">식단 체크</button>
    </div>
  </section>`;
}

// 성장 단계 길: 씨앗부터 세계수까지 7칸에 지금 위치를 표시한다. 누르면 성장 지도가 열린다.
function stageTrack(j) {
  const last = STAGES.length - 1;
  const p = Math.min(1, (j.stage + (j.nextName ? j.ratio : 0)) / last);
  return `<button class="stage-track" data-act="home.stages" aria-label="성장 단계 보기: ${STAGES.length}단계 중 ${j.stage + 1}단계 ${j.stageName}">
    <span class="track-line"><i style="width:${(p * 100).toFixed(1)}%"></i></span>
    <ol>${STAGES.map((s, i) => `<li class="${i < j.stage ? 'done' : i === j.stage ? 'now' : ''}"><i>${i === j.stage ? STAGE_ICONS[i] : ''}</i><span>${s.name}</span></li>`).join('')}</ol>
  </button>`;
}

const STAGE_ICONS = ['🌰', '🌱', '🌿', '🌳', '🌲', '✨', '🌟'];
// 단계마다 세계수에 생기는 것 (art/tree.js · art/scene.js 기준)
const STAGE_UNLOCKS = [
  '여정이 시작돼요',
  '첫 잎이 나요',
  '줄기가 단단해져요 · 가지 장식, 꽃·열매 아이템이 보여요',
  '뿌리가 땅 위로 드러나요',
  '잎 사이에 꽃이 피어요',
  '빛나는 열매가 열려요',
  '머리 위에 빛 고리가 떠요 · 숲에 심을 수 있어요',
];

// 성장 지도: 단계별 필요한 점수, 지금 위치, 최근 속도로 본 남은 날
export function stagesModal(state) {
  const j = journey(state);
  const xp = Math.floor(plantXp(state));
  const pace = recentXpPerDay(state);
  const toEnd = Math.max(0, STAGES[STAGES.length - 1].at - xp);
  const days = pace > 0.5 ? Math.ceil(toEnd / pace) : null;
  return `<div class="sheet" role="dialog" aria-labelledby="stages-title">
    <div class="intro"><span class="eyebrow">GROWTH MAP</span><h1 id="stages-title">성장 지도</h1>
    <p class="muted">${esc(j.tree.label)} · ${j.day}일째 · 지금 ${xp}점</p></div>
    <ol class="stage-map">${STAGES.map((s, i) => {
      const cls = i < j.stage ? 'done' : i === j.stage ? 'now' : '';
      const need = i > j.stage ? `<b>${Math.ceil(s.at - xp)}점 남음</b>` : i === j.stage ? '<b>지금 여기</b>' : icon('check');
      return `<li class="${cls}"><span class="em">${STAGE_ICONS[i]}</span><span class="grow"><b>${s.name}</b> <span class="tiny">${s.at}점</span><span class="tiny unlock">${STAGE_UNLOCKS[i]}</span></span><span class="need">${need}</span></li>`;
    }).join('')}</ol>
    <p class="report-note">${
      toEnd === 0
        ? '세계수가 완성됐어요! 숲에 심고 새로운 세계수를 키워요.'
        : days
          ? `최근 7일 하루 평균 약 ${Math.round(pace)}점을 모았어요. 이대로면 세계수까지 약 ${days}일 남았어요.`
          : '최근 7일 기록이 적어서 남은 날을 계산할 수 없어요. 오늘 하나만 기록해 봐요!'
    }</p>
    <button class="btn" data-act="modal.close">닫기</button>
  </div>`;
}

// 홈의 '나의 섬' 바로 가기: 섬 단계와 짓는 중인 건물
function islandLink(state) {
  const built = builtCount(state);
  const now = buildingNow(state);
  const l = now >= 0 && state.island.lots[now];
  const b = l && buildingById(l.b);
  const need = b && workOf(b, l.lv);
  const gift = residentCount(state) && state.island.giftDay !== todayKey() ? ' · 🎁 선물이 있어요' : '';
  const sub = b
    ? `${b.emoji} ${b.name}${l.lv > 1 ? ` Lv.${l.lv}로 올리는 중` : ' 짓는 중'} · ${Math.floor((l.progress / need) * 100)}%${gift}`
    : `${islandLevel(built).name} · 건물 ${built} / 8 · 주민 ${residentCount(state)}명${gift}`;
  return `<button class="card garden-link" data-act="island.open"><span class="em">🏝️</span><span class="grow"><b>나의 섬</b><span class="tiny">${sub}</span>${b ? bar(l.progress / need) : ''}</span>${icon('right')}</button>`;
}

// 하루 목표를 정한 과목들 (예: 🇯🇵 30/60분 · 🇨🇳 60/60분 ✓)
function subjectGoals(state, day) {
  const by = studyMinBySubjectOn(state, day);
  const list = activeSubjects(state).filter((s) => s.goal > 0);
  if (!list.length) return '';
  return `<div class="goal-chips">${list
    .map((s) => {
      const min = by[s.id] || 0;
      return `<span class="goal-chip ${min >= s.goal ? 'done' : ''}">${esc(s.emoji)} ${min}/${s.goal}분${min >= s.goal ? ' ✓' : ''}</span>`;
    })
    .join('')}</div>`;
}

// 세계수가 한 단계 자랐을 때 뜨는 축하 창
export function stageUpModal(state, ui) {
  const stage = ui.modalData?.stage ?? stageOf(plantXp(state));
  const done = stage >= LAST_STAGE;
  return `<div class="sheet celebrate" role="dialog" aria-labelledby="stageup-title">
    <div class="intro"><span class="eyebrow">GROWING UP</span>
    <h1 id="stageup-title">'${STAGES[stage].name}'(으)로 자랐어요</h1>
    <p class="muted">${STAGE_LINES[stage] || ''}</p></div>
    <div class="celebrate-art">${sceneSvg(state, { mood: 'joy' })}</div>
    <p class="tiny center">정령 ${esc(state.settings.name)}: “${done ? '함께해 줘서 고마워요!' : '다음 단계도 같이 가요!'}”</p>
    ${done
      ? `<div class="row two"><button class="btn ghost" data-act="modal.close">나중에</button><button class="btn gold" data-act="home.completeOpen">${icon('forest')} 숲에 심기</button></div>`
      : `<button class="btn gold" data-act="modal.close">좋아요</button>`}
  </div>`;
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

// 정령이 할 말: 지금 시간, 오늘 한 일, 연속 기록, 시험을 보고 어울리는 묶음을 모은 뒤 하나를 고른다.
// 같은 말이 연달아 나오지 않게 바로 전 대사는 뺀다.
let lastLine = '';
export function spiritLine(state) {
  const day = todayKey();
  const h = new Date().getHours();
  const pools = [LINES.any];
  pools.push(h < 5 || h >= 22 ? LINES.night : h < 11 ? LINES.morning : h >= 17 ? LINES.evening : []);
  const moved = minutesOn(state, day) > 0;
  const studied = studyMinOn(state, day) > 0;
  if (moved) pools.push(LINES.workout);
  if (studied) pools.push(LINES.study);
  if (missionsDone(state, day) >= 2) pools.push(LINES.meal);
  if (!moved && !studied && !missionsDone(state, day)) pools.push(LINES.idle);
  const streak = streakOf(state);
  if (streak >= 3) pools.push(LINES.streak.map((t) => fill(t, { n: streak })));
  const exam = examDday(state);
  if (exam && exam.left > 1 && exam.left <= 30) pools.push(LINES.exam.map((t) => fill(t, { n: exam.left })));
  const all = pools.flat().map((t) => fill(t, { name: state.settings.name })).filter((t) => t !== lastLine);
  lastLine = all[Math.floor(Math.random() * all.length)] || '';
  return lastLine;
}

export const actions = {
  // 장면을 누르면 정령이 반응한다. 전체를 다시 그리지 않는다.
  'home.pet': (el) => {
    el.classList.remove('bounce');
    void el.offsetWidth;
    el.classList.add('bounce');
    ctx.ui.bubble = spiritLine(ctx.state);
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

  'home.stages': () => {
    ctx.ui.modal = 'stages';
    ctx.ui.modalData = null;
    rerender();
  },

  'home.completeOpen': () => {
    ctx.ui.modal = 'complete';
    ctx.ui.modalData = null;
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
    toast(`세계수를 숲에 심었어요. 새로운 ${JOURNEY_DAYS}일을 시작해요`);
  },
};
