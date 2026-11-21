// 여러 화면에서 같이 쓰는 큰 조각 (장면 그림, 지갑, 퀘스트 카드, 세계수 선택, 그래프).
import { renderScene } from '../art/scene.js';
import { withPreview } from '../data/items/index.js';
import { TREES, treeById } from '../data/trees.js';
import { stageOf, plantXp, progress, STAGES, LAST_STAGE } from '../core/scoring.js';
import { moodOf } from '../core/records.js';
import { todayKey, daysBetween } from '../core/dates.js';
import { questsFor, weekGoal } from '../core/quests.js';
import { festivalState, STAMP_GOAL } from '../core/festivals.js';
import { itemById } from '../data/items/index.js';
import { WEEK_REWARD, JOURNEY_DAYS } from '../core/config.js';
import { esc, bar, rewardHtml, money, CURRENCIES, title } from './dom.js';
import { icon } from './icons.js';

const nowHour = () => new Date().getHours();

// 지금 키우는 세계수 장면. equipped에 미리보기 아이템 { slot: id }를 넘기면 겹쳐 그린다.
// base·custom을 넘기면 저장한 코디처럼 다른 꾸미기로 그린다.
// 계절 축제 카드 (홈 · 섬): 도장 7칸, 남은 날, 선물 받기, 한정 아이템 보러 가기
export function festivalCard(state) {
  const fs = festivalState(state);
  if (!fs) return '';
  const { f, stamps, claimed, ready, left } = fs;
  const prize = itemById(f.prize);
  const cells = Array.from({ length: STAMP_GOAL }, (_, i) => `<i class="${i < stamps ? 'on' : ''}">${i < stamps ? f.emoji : i + 1}</i>`).join('');
  return `<section class="card fest-card fest-${f.id}">
    <div class="fest-head"><span class="em">${f.emoji}</span><span class="grow"><b>${f.name}</b><span class="tiny">${f.line} · ${left}일 남음</span></span><span class="tiny">${Math.min(stamps, STAMP_GOAL)} / ${STAMP_GOAL}</span></div>
    <div class="stamps" role="img" aria-label="축제 도장 ${Math.min(stamps, STAMP_GOAL)} / ${STAMP_GOAL}">${cells}</div>
    <p class="tiny">${claimed ? `선물 '${prize.name}'을(를) 받았어요. 축제를 마음껏 즐겨요!` : `축제 동안 기록한 날마다 도장 하나 · ${STAMP_GOAL}개 모으면 '${prize.name}' 선물`}</p>
    <div class="fest-btns">${ready ? '<button class="btn small gold" data-act="festival.claim">🎁 선물 받기</button>' : ''}<button class="btn small soft" data-act="festival.shop">🎉 축제 한정 아이템</button></div>
  </section>`;
}

export function sceneSvg(state, { equipped = {}, base = state.equipped, custom = state.custom, ...rest } = {}) {
  const xp = plantXp(state);
  return renderScene({
    growth: Math.min(1, xp / STAGES[LAST_STAGE].at),
    stage: stageOf(xp),
    tree: treeById(state.plant.species),
    equipped: withPreview(base, equipped),
    custom,
    mood: moodOf(state),
    hour: nowHour(),
    label: `${treeById(state.plant.species).label}과 정령 ${state.settings.name}`,
    ...rest,
  });
}

// 세계수 여정 정보: n일째, 단계, 진행도
export function journey(state) {
  const p = progress(plantXp(state));
  return {
    ...p,
    day: daysBetween(state.plant.startDate, todayKey()) + 1,
    total: JOURNEY_DAYS,
    stageName: STAGES[p.stage].name,
    tree: treeById(state.plant.species),
  };
}

// 다가오는 시험 목록 (가까운 순). 설정의 공통 시험일 + 공부 탭의 과목별 시험일. 지난 시험은 뺀다.
export function upcomingExams(state) {
  const today = todayKey();
  const list = [];
  if (state.settings.examDate) list.push({ name: '시험', date: state.settings.examDate });
  if (state.settings.studyEnabled) {
    state.study.subjects.forEach((s) => {
      if (!s.hidden && s.examDate) list.push({ name: s.examName || `${s.label} 시험`, date: s.examDate, subject: s.id });
    });
  }
  return list
    .map((e) => ({ ...e, left: daysBetween(today, e.date) }))
    .filter((e) => e.left >= 0)
    .sort((a, b) => a.left - b.left)
    .map((e) => {
      const [, m, d] = e.date.split('-').map(Number);
      return { ...e, label: e.left === 0 ? 'D-DAY' : `D-${e.left}`, dateText: `${m}월 ${d}일` };
    });
}

// 가장 가까운 시험 하나 (없으면 null)
export const examDday = (state) => upcomingExams(state)[0] || null;

// D-day 작은 배지 (시험일이 없으면 빈 문자열)
export function ddayBadge(state) {
  const dd = examDday(state);
  if (!dd) return '';
  return `<span class="dday ${dd.left === 0 ? 'today' : ''}">${dd.left === 0 ? `${esc(dd.name)} 당일 · 화이팅!` : `${esc(dd.name)}까지 <b>${dd.label}</b>`}</span>`;
}

export function greeting(state) {
  const dd = examDday(state);
  if (dd?.left === 0) return `오늘은 ${dd.name} 날이에요. 그동안 정말 잘했어요!`;
  if (dd?.left === 1) return `내일은 ${dd.name} 날이에요. 오늘은 푹 자요`;
  const h = nowHour();
  const hello =
    h < 5 ? '별이 깊은 밤이에요. 푹 쉬어요' : h < 11 ? '좋은 아침이에요. 세계수가 기지개를 켜요' : h < 17 ? '오늘도 와 줘서 고마워요' : h < 21 ? '수고했어요. 노을이 예뻐요' : '오늘 하루도 고생 많았어요';
  return { calm: hello, happy: '세계수가 기뻐하고 있어요', joy: '와아, 오늘 정말 빛나요!' }[moodOf(state)];
}

// 보유 포인트. 별빛은 공부 기능을 켰거나 가진 별빛이 있을 때만 보인다.
export function wallet(state) {
  const list = CURRENCIES.filter((c) => c.id !== 'star' || state.settings.studyEnabled || state.star > 0);
  return `<section class="wallet">${list
    .map((c) => `<div class="wallet-item"><span class="tiny">${c.label}</span><b>${money(c.id, state[c.id])}</b></div>`)
    .join('')}</section>`;
}

export function questsCard(state, day) {
  return `<section class="card">
    ${title('오늘의 퀘스트', { iconName: 'scroll' })}
    <ul class="quests">${questsFor(state, day)
      .map(
        (q) => `<li class="${q.claimed ? 'claimed' : ''}">
        <div class="grow"><b>${q.label}</b>${bar(q.cur / q.goal)}<span class="tiny">${q.cur} / ${q.goal} · ${rewardHtml(q.reward)}</span></div>
        <button class="btn small ${q.done && !q.claimed ? '' : 'soft'}" data-act="goals.claim" data-arg="${q.id}" ${q.done && !q.claimed ? '' : 'disabled'}>${q.claimed ? icon('check') : q.done ? '받기' : '진행 중'}</button>
      </li>`
      )
      .join('')}</ul></section>`;
}

export function weekCard(state, day) {
  const g = weekGoal(state, day);
  const label = g.claimed ? '이번 주 보상을 받았어요' : g.done ? `보상 받기 ${rewardHtml(WEEK_REWARD)}` : `${g.goal - g.min}분 남았어요`;
  return `<section class="card">
    ${title('이번 주 운동', { iconName: 'heart', aside: `${g.days}일 활동` })}
    <p class="lead"><b>${g.min}</b> / ${g.goal}분</p>
    ${bar(g.min / g.goal)}
    <button class="btn small ${g.done && !g.claimed ? '' : 'soft'}" data-act="goals.claimWeek" ${g.done && !g.claimed ? '' : 'disabled'}>${label}</button>
  </section>`;
}

// 세계수 고르기 (시작 화면, 완성 후 다음 세계수)
export function treePicker(name, selected, exclude = []) {
  return `<div class="grid picker">${TREES.filter((t) => !exclude.includes(t.id))
    .map(
      (t) => `<label class="pick"><input type="radio" name="${name}" value="${t.id}" ${t.id === selected ? 'checked' : ''}>
      <span class="pick-art">${renderScene({ growth: 0.62, stage: 4, tree: t, spirit: false, hour: 12, label: t.label })}</span>
      <b>${t.label}</b><span class="tiny">${t.tagline}</span></label>`
    )
    .join('')}</div>`;
}

// 세로 막대그래프. items: [{ label, value, highlight }]
export function barChart(items, ariaLabel, minMax = 30) {
  const W = 320;
  const bw = 22;
  const gap = (W - bw * items.length) / (items.length + 1);
  const max = Math.max(minMax, ...items.map((d) => d.value));
  const bars = items
    .map((d, i) => {
      const x = gap + i * (bw + gap);
      const h = Math.round((d.value / max) * 92);
      return `<rect x="${x}" y="${116 - h}" width="${bw}" height="${Math.max(h, 2)}" rx="11" class="${d.value ? 'bar-on' : 'bar-off'}"/>
        <text x="${x + bw / 2}" y="${108 - h}" text-anchor="middle" class="chart-num">${d.value || ''}</text>
        <text x="${x + bw / 2}" y="138" text-anchor="middle" class="chart-lab ${d.highlight ? 'today' : ''}">${d.label}</text>`;
    })
    .join('');
  return `<svg class="chart" viewBox="0 0 ${W} 150" role="img" aria-label="${ariaLabel}">${bars}</svg>`;
}
