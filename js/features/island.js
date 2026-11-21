// 나의 섬: 세계수가 서 있는 떠 있는 섬에 건물을 지어 마을로 키운다 (섬 키우기 1단계).
// - 빈 자리를 눌러 건물을 고르면 포인트를 내고 짓기 시작한다 (한 번에 하나)
// - 다 지을 때까지 필요한 성장 점수(work)는 운동·공부·식단 기록으로 차오른다 (app/wallet.js gain)
// - 자리는 세계수가 자랄수록 열리고, 세계수를 하나 완성하면 모두 열린다
// 아래 탭이 없는 전체 화면 (정원과 같다).
import { ctx, rerender, commit } from '../app/context.js';
import { go } from '../app/render.js';
import { canAfford, pay, settle } from '../app/wallet.js';
import { builtCount, buildingNow } from '../core/island.js';
import { STAGES, stageOf, plantXp } from '../core/scoring.js';
import { BUILDINGS, buildingById, LOT_COUNT, lotsOpen, islandLevel } from '../data/buildings.js';
import { treeById } from '../data/trees.js';
import { islandMap, LOTS, MAP } from '../art/island.js';
import { buildingArt, constructionArt } from '../art/buildings.js';
import { nextUid } from '../art/svg.js';
import { moodOf } from '../core/records.js';
import { esc, bar, costHtml, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime } from '../ui/effects.js';

// 자리가 열리는 순서: 세계수에 가까운 곳부터
const OPEN_ORDER = [3, 4, 2, 5, 1, 6, 0, 7];


function openSet(state) {
  const n = lotsOpen(stageOf(plantXp(state)), state.dex.length);
  return new Set(OPEN_ORDER.slice(0, n));
}

// 잠긴 자리가 열리는 단계 이름
function unlockStageName(i) {
  const k = OPEN_ORDER.indexOf(i); // 열린 자리 수 = 2 + 단계 → k번째 자리는 단계 k-1에서 열린다
  return STAGES[Math.max(0, k - 1)]?.name || '세계수';
}

function lotStates(state) {
  const open = openSet(state);
  return state.island.lots.map((l, i) => {
    if (l && l.done) return { state: 'built', id: l.b };
    if (l) return { state: 'building', id: l.b, ratio: Math.min(1, l.progress / buildingById(l.b).work) };
    return { state: open.has(i) ? 'empty' : 'locked' };
  });
}

const smallArt = (id, building) =>
  `<svg viewBox="-36 -100 72 106" aria-hidden="true">${building ? constructionArt(0.4, nextUid()) : buildingArt(id, nextUid())}</svg>`;

/* ---------- 화면 ---------- */

export function view(state, ui) {
  const lots = lotStates(state);
  const built = builtCount(state);
  const lvl = islandLevel(built);
  const now = buildingNow(state);
  const open = openSet(state).size;
  const buttons = LOTS.map(({ x, y }, i) => {
    const l = lots[i];
    const label = l.state === 'built' ? `${buildingById(l.id).name} 보기` : l.state === 'building' ? `${buildingById(l.id).name} 짓는 중` : l.state === 'empty' ? '빈 자리에 건물 짓기' : '잠긴 자리';
    return `<button class="lot-btn ${l.state}" style="left:${((x / MAP.w) * 100).toFixed(2)}%;top:${((y / MAP.h) * 100).toFixed(2)}%" data-act="island.lot" data-arg="${i}" aria-label="${label}"></button>`;
  }).join('');
  return `<div class="island">
    <header class="garden-top">
      <button class="x" data-act="island.close" aria-label="섬 닫기">${icon('left')}</button>
      <div class="grow"><b>나의 섬</b><span class="tiny">${lvl.name} · 건물 ${built} / ${LOT_COUNT}</span></div>
      <button class="x" data-act="garden.open" aria-label="정원에서 꾸미기">${icon('tree')}</button>
    </header>
    <div class="island-map" id="island-map">
      <div class="map-inner">${islandMap({
        growth: Math.min(1, plantXp(state) / STAGES[STAGES.length - 1].at),
        stage: stageOf(plantXp(state)),
        tree: treeById(state.plant.species),
        equipped: state.equipped,
        custom: state.custom,
        mood: moodOf(state),
        lots,
      })}${buttons}</div>
    </div>
    <p class="tiny center map-hint">← 옆으로 밀어서 섬 전체를 봐요 →</p>
    ${nowCard(state, now)}
    <section class="card">
      ${title(`섬 단계 · ${lvl.name}`, { iconName: 'forest', aside: `열린 자리 ${open} / ${LOT_COUNT}` })}
      ${lvl.next ? `${bar((built - lvl.at) / (lvl.next.at - lvl.at))}<p class="tiny">건물 ${lvl.next.at - built}개를 더 지으면 '${lvl.next.name}'</p>` : '<p class="tiny">모든 자리를 채웠어요. 다음 섬을 기다려 주세요!</p>'}
      <p class="tiny">${open < LOT_COUNT ? `세계수가 자랄수록 자리가 하나씩 열려요. 세계수를 완성하면 모든 자리가 열려요.` : '모든 자리가 열렸어요.'}</p>
    </section>
    <section class="card">
      ${title('건물 도감', { iconName: 'scroll', aside: `${built} / ${BUILDINGS.length}` })}
      <div class="grid four bdex">${BUILDINGS.map((b) => {
        const has = state.island.lots.some((l) => l && l.done && l.b === b.id);
        return `<div class="bcell ${has ? 'on' : ''}"><span class="bart">${smallArt(b.id)}</span><b>${has ? b.name : '???'}</b></div>`;
      }).join('')}</div>
    </section>
  </div>`;
}

function nowCard(state, now) {
  if (now < 0) {
    return `<section class="card note">${icon('sparkle')} 빈 자리(＋)를 눌러 건물을 지어요. 짓는 동안 운동·공부·식단 기록이 쌓이면 완성돼요.</section>`;
  }
  const l = state.island.lots[now];
  const b = buildingById(l.b);
  return `<section class="card build-now">
    ${title(`${b.emoji} ${b.name} 짓는 중`, { iconName: 'cog', aside: `${Math.floor((l.progress / b.work) * 100)}%` })}
    ${bar(l.progress / b.work)}
    <p class="tiny">성장 점수 ${Math.floor(l.progress)} / ${b.work} · 운동·공부·식단 기록으로 차올라요</p>
  </section>`;
}

// 지도를 그린 뒤: 처음 열면 세계수가 가운데 오게, 다시 그릴 때는 보던 자리 그대로
export function mounted(ui) {
  const el = document.getElementById('island-map');
  if (!el) return;
  el.scrollLeft = ui.islandScroll ?? (el.scrollWidth - el.clientWidth) / 2;
  el.onscroll = () => (ui.islandScroll = el.scrollLeft);
}

/* ---------- 창 ---------- */

// 빈 자리: 건물 고르기
export function buildModal(state, ui) {
  const i = ui.modalData?.lot;
  const busy = buildingNow(state) >= 0;
  return `<div class="sheet" role="dialog" aria-labelledby="build-title">
    <div class="intro"><span class="eyebrow">BUILD</span><h1 id="build-title">무엇을 지을까요?</h1>
    <p class="muted">${busy ? '지금 짓는 건물이 있어요. 다 지으면 다음 건물을 지을 수 있어요.' : '포인트를 내면 짓기 시작해요. 기록이 쌓이면 완성돼요.'}</p></div>
    <ul class="build-list">${BUILDINGS.map((b) => {
      const has = state.island.lots.some((l) => l && l.b === b.id);
      const ok = !busy && !has && canAfford(b.cost);
      return `<li class="${has ? 'has' : ''}"><span class="bart">${smallArt(b.id)}</span>
        <span class="grow"><b>${b.emoji} ${b.name}</b><span class="tiny">${b.desc}</span><span class="tiny">완성까지 성장 점수 ${b.work}</span></span>
        <button class="btn small ${ok ? '' : 'soft'}" data-act="island.build" data-arg="${i}:${b.id}" ${ok ? '' : 'disabled'}>${has ? '있어요' : costHtml(b.cost)}</button></li>`;
    }).join('')}</ul>
    <button class="btn ghost" data-act="modal.close">닫기</button>
  </div>`;
}

// 지은 건물 · 짓는 중인 건물 보기
export function lotModal(state, ui) {
  const i = ui.modalData?.lot;
  const l = state.island.lots[i];
  if (!l) return '';
  const b = buildingById(l.b);
  return `<div class="sheet" role="dialog" aria-labelledby="lot-title">
    <div class="intro"><span class="eyebrow">${l.done ? 'BUILDING' : 'BUILDING…'}</span><h1 id="lot-title">${b.emoji} ${b.name}</h1><p class="muted">${b.desc}</p></div>
    <div class="lot-art">${smallArt(b.id, !l.done)}</div>
    ${
      l.done
        ? `<p class="tiny center">${l.date ? `${l.date.replaceAll('-', '. ')}에 완성했어요` : ''}</p>
           <div class="row two"><button class="btn ghost" data-act="modal.close">닫기</button><button class="btn small danger-text" data-act="island.remove" data-arg="${i}">허물기</button></div>`
        : `${bar(l.progress / b.work)}<p class="tiny center">성장 점수 ${Math.floor(l.progress)} / ${b.work}</p>
           <div class="row two"><button class="btn ghost" data-act="modal.close">닫기</button><button class="btn small danger-text" data-act="island.cancel" data-arg="${i}">짓기 취소</button></div>`
    }
  </div>`;
}

/* ---------- 동작 ---------- */

const closeModal = () => {
  ctx.ui.modal = '';
  ctx.ui.modalData = null;
};

export const actions = {
  'island.open': () => go('island'),
  'island.close': () => go('home'),

  'island.lot': (el) => {
    const i = Number(el.dataset.arg);
    const s = ctx.state;
    const l = s.island.lots[i];
    if (l) {
      ctx.ui.modal = 'lot';
      ctx.ui.modalData = { lot: i };
    } else if (openSet(s).has(i)) {
      ctx.ui.modal = 'build';
      ctx.ui.modalData = { lot: i };
    } else return toast(`이 자리는 세계수가 '${unlockStageName(i)}' 단계가 되면 열려요`);
    rerender();
  },

  'island.build': (el) => {
    const [i, id] = el.dataset.arg.split(':');
    const s = ctx.state;
    const b = buildingById(id);
    const lot = Number(i);
    if (!b || s.island.lots[lot] || buildingNow(s) >= 0) return;
    if (!canAfford(b.cost)) return toast('포인트가 조금 부족해요');
    pay(b.cost);
    s.island.lots[lot] = { b: id, done: false, progress: 0 };
    closeModal();
    settle();
    chime('ok');
    rerender();
    toast(`${b.name}을(를) 짓기 시작했어요. 오늘 기록으로 완성해요!`);
  },

  // 짓기 취소: 낸 포인트는 돌려준다
  'island.cancel': (el) => {
    const i = Number(el.dataset.arg);
    const s = ctx.state;
    const l = s.island.lots[i];
    if (!l || l.done || !confirm('짓기를 그만둘까요? 낸 포인트는 돌려받아요.')) return;
    const b = buildingById(l.b);
    ['sun', 'water', 'star'].forEach((k) => (s[k] += b.cost[k] || 0));
    s.island.lots[i] = null;
    closeModal();
    commit();
    rerender();
  },

  'island.remove': (el) => {
    const i = Number(el.dataset.arg);
    const s = ctx.state;
    const l = s.island.lots[i];
    if (!l || !confirm(`${buildingById(l.b).name}을(를) 허물까요? 포인트는 돌아오지 않아요.`)) return;
    s.island.lots[i] = null;
    closeModal();
    commit();
    rerender();
  },
};
