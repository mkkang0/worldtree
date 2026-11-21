// 나의 섬: 세계수가 서 있는 떠 있는 섬에 건물을 지어 마을로 키운다.
// 1단계 - 빈 자리를 눌러 건물을 고르면 포인트를 내고 짓기 시작 (한 번에 하나)
//        - 다 지을 때까지 필요한 성장 점수는 운동·공부·식단 기록으로 차오른다 (app/wallet.js gain)
//        - 자리는 세계수가 자랄수록 열리고, 세계수를 하나 완성하면 모두 열린다
// 2단계 - 건물 레벨 Lv.1~3 (집은 레벨마다 주민 2명, 찻집·도서관·등대는 Lv.2부터 1명씩)
//        - 정령 친구(주민)가 조건을 채우면 빈 집으로 이사 와서 섬을 거닌다 (core/island.js RESIDENTS)
//        - 주민들이 하루 한 번 선물을 준다
// 아래 탭이 없는 전체 화면 (정원과 같다).
import { ctx, rerender, commit } from '../app/context.js';
import { go } from '../app/render.js';
import { canAfford, pay, gain, settle } from '../app/wallet.js';
import { builtCount, buildingNow, shownLevel, RESIDENTS, residentCount, bedCount, waitingCount, giftOf } from '../core/island.js';
import { todayKey } from '../core/dates.js';
import { STAGES, stageOf, plantXp } from '../core/scoring.js';
import { moodOf } from '../core/records.js';
import { BUILDINGS, buildingById, LOT_COUNT, lotsOpen, islandLevel, costOf, workOf, bedsOf, MAX_LEVEL } from '../data/buildings.js';
import { treeById } from '../data/trees.js';
import { islandMap, LOTS, MAP } from '../art/island.js';
import { buildingArt, constructionArt } from '../art/buildings.js';
import { spiritArt } from '../art/spirit.js';
import { nextUid } from '../art/svg.js';
import { esc, bar, costHtml, rewardHtml, amountText, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime, confetti } from '../ui/effects.js';

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
    if (!l) return { state: open.has(i) ? 'empty' : 'locked' };
    const ratio = Math.min(1, l.progress / workOf(buildingById(l.b), l.lv));
    if (l.done) return { state: 'built', id: l.b, lv: l.lv };
    if (l.lv > 1) return { state: 'upgrading', id: l.b, lv: l.lv - 1, ratio };
    return { state: 'building', id: l.b, lv: 1, ratio };
  });
}

const residentsHere = (state) => RESIDENTS.filter((r) => state.island.residents[r.id]);

const smallArt = (id, building, lv = 1) =>
  `<svg viewBox="-40 -104 80 110" aria-hidden="true">${building ? constructionArt(0.4, nextUid()) : buildingArt(id, nextUid(), lv)}</svg>`;

const residentFace = (r, tree) =>
  `<svg viewBox="-34 -50 68 86" aria-hidden="true">${spiritArt({ x: 0, y: 0, scale: 1, mood: 'happy', wardrobe: {}, tree, uid: nextUid(), body: r.color })}</svg>`;

/* ---------- 화면 ---------- */

export function view(state, ui) {
  const lots = lotStates(state);
  const built = builtCount(state);
  const lvl = islandLevel(built);
  const now = buildingNow(state);
  const open = openSet(state).size;
  const tree = treeById(state.plant.species);
  const buttons = LOTS.map(({ x, y }, i) => {
    const l = lots[i];
    const name = l.id && buildingById(l.id).name;
    const label = { built: `${name} 보기`, upgrading: `${name} 레벨 올리는 중`, building: `${name} 짓는 중`, empty: '빈 자리에 건물 짓기', locked: '잠긴 자리' }[l.state];
    return `<button class="lot-btn ${l.state}" style="left:${((x / MAP.w) * 100).toFixed(2)}%;top:${((y / MAP.h) * 100).toFixed(2)}%" data-act="island.lot" data-arg="${i}" aria-label="${label}"></button>`;
  }).join('');
  return `<div class="island">
    <header class="garden-top">
      <button class="x" data-act="island.close" aria-label="섬 닫기">${icon('left')}</button>
      <div class="grow"><b>나의 섬</b><span class="tiny">${lvl.name} · 건물 ${built} / ${LOT_COUNT} · 주민 ${residentCount(state)}명</span></div>
      <button class="x" data-act="garden.open" aria-label="정원에서 꾸미기">${icon('tree')}</button>
    </header>
    <div class="island-map" id="island-map">
      <div class="map-inner">${islandMap({
        growth: Math.min(1, plantXp(state) / STAGES[STAGES.length - 1].at),
        stage: stageOf(plantXp(state)),
        tree,
        equipped: state.equipped,
        custom: state.custom,
        mood: moodOf(state),
        lots,
        residents: residentsHere(state),
      })}${buttons}</div>
    </div>
    <p class="tiny center map-hint">← 옆으로 밀어서 섬 전체를 봐요 · 건물을 누르면 레벨을 올려요 →</p>
    ${giftCard(state)}
    ${nowCard(state, now)}
    ${residentsCard(state, tree)}
    <section class="card">
      ${title(`섬 단계 · ${lvl.name}`, { iconName: 'forest', aside: `열린 자리 ${open} / ${LOT_COUNT}` })}
      ${lvl.next ? `${bar((built - lvl.at) / (lvl.next.at - lvl.at))}<p class="tiny">건물 ${lvl.next.at - built}개를 더 지으면 '${lvl.next.name}'</p>` : '<p class="tiny">모든 자리를 채웠어요. 건물 레벨을 올려 마을을 키워요!</p>'}
      <p class="tiny">${open < LOT_COUNT ? '세계수가 자랄수록 자리가 하나씩 열려요. 세계수를 완성하면 모든 자리가 열려요.' : '모든 자리가 열렸어요.'}</p>
    </section>
    <section class="card">
      ${title('건물 도감', { iconName: 'scroll', aside: `${built} / ${BUILDINGS.length}` })}
      <div class="grid four bdex">${BUILDINGS.map((b) => {
        const l = state.island.lots.find((x) => x && x.b === b.id && (x.done || x.lv > 1));
        return `<div class="bcell ${l ? 'on' : ''}"><span class="bart">${smallArt(b.id, false, l ? shownLevel(l) : 1)}</span><b>${l ? `${b.name}${shownLevel(l) > 1 ? ` Lv.${shownLevel(l)}` : ''}` : '???'}</b></div>`;
      }).join('')}</div>
    </section>
  </div>`;
}

// 주민들의 하루 선물
function giftCard(state) {
  const n = residentCount(state);
  if (!n) return '';
  const got = state.island.giftDay === todayKey();
  return `<section class="card gift-card">
    <span class="em">🎁</span><span class="grow"><b>주민들의 선물</b><span class="tiny">${got ? '오늘 선물을 받았어요. 내일 또 와요!' : `주민 ${n}명이 선물을 준비했어요`}</span></span>
    <button class="btn small ${got ? 'soft' : 'gold'} fit" data-act="island.gift" ${got ? 'disabled' : ''}>${got ? '받음' : rewardHtml(giftOf(n))}</button>
  </section>`;
}

function nowCard(state, now) {
  if (now < 0) {
    return `<section class="card note">${icon('sparkle')} 빈 자리(＋)를 눌러 짓거나, 지은 건물을 눌러 레벨을 올려요. 기록이 쌓이면 완성돼요.</section>`;
  }
  const l = state.island.lots[now];
  const b = buildingById(l.b);
  const need = workOf(b, l.lv);
  return `<section class="card build-now">
    ${title(`${b.emoji} ${b.name}${l.lv > 1 ? ` Lv.${l.lv}로 올리는 중` : ' 짓는 중'}`, { iconName: 'cog', aside: `${Math.floor((l.progress / need) * 100)}%` })}
    ${bar(l.progress / need)}
    <p class="tiny">성장 점수 ${Math.floor(l.progress)} / ${need} · 운동·공부·식단 기록으로 차올라요</p>
  </section>`;
}

// 주민: 사는 친구들과 아직 오지 않은 친구들(어떻게 하면 오는지)
function residentsCard(state, tree) {
  const beds = bedCount(state);
  const n = residentCount(state);
  const waiting = waitingCount(state);
  return `<section class="card">
    ${title('섬 주민', { iconName: 'users', aside: `${n}명 · 집 ${beds}칸` })}
    ${waiting && n >= beds ? `<p class="tiny warn">이사 오고 싶은 친구가 ${waiting}명 기다려요! 집을 짓거나 레벨을 올려 집 칸을 늘려 주세요.</p>` : ''}
    <ul class="residents">${RESIDENTS.map((r) => {
      const day = state.island.residents[r.id];
      return day
        ? `<li class="on"><span class="rface">${residentFace(r, tree)}</span><span class="grow"><b>${r.name}</b><span class="tiny">“${esc(r.line)}”</span></span><span class="tiny">${day.slice(5).replace('-', '/')} 이사</span></li>`
        : `<li><span class="rface off">${residentFace(r, tree)}</span><span class="grow"><b>???</b><span class="tiny">${r.hint} · 빈 집이 있으면 이사 와요</span></span>${r.when(state) ? '<span class="tiny ready">집이 필요해요</span>' : ''}</li>`;
    }).join('')}</ul>
    <p class="tiny">집은 레벨마다 주민 2명, 찻집·도서관·등대는 Lv.2부터 한 명씩 더 살 수 있어요.</p>
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
      const cost = costOf(b, 1);
      const ok = !busy && !has && canAfford(cost);
      const beds = bedsOf(b.id, 1);
      return `<li class="${has ? 'has' : ''}"><span class="bart">${smallArt(b.id)}</span>
        <span class="grow"><b>${b.emoji} ${b.name}</b><span class="tiny">${b.desc}</span><span class="tiny">완성까지 성장 점수 ${workOf(b, 1)}${beds ? ` · 주민 ${beds}명` : ''}</span></span>
        <button class="btn small ${ok ? '' : 'soft'}" data-act="island.build" data-arg="${i}:${b.id}" ${ok ? '' : 'disabled'}>${has ? '있어요' : costHtml(cost)}</button></li>`;
    }).join('')}</ul>
    <button class="btn ghost" data-act="modal.close">닫기</button>
  </div>`;
}

// 지은 건물 · 짓는 중인 건물 보기 (레벨 올리기)
export function lotModal(state, ui) {
  const i = ui.modalData?.lot;
  const l = state.island.lots[i];
  if (!l) return '';
  const b = buildingById(l.b);
  const lvNow = shownLevel(l);
  const busy = buildingNow(state) >= 0;
  const head = `<div class="intro"><span class="eyebrow">${l.done ? `Lv.${l.lv}` : l.lv > 1 ? `Lv.${l.lv}로 올리는 중` : '짓는 중'}</span><h1 id="lot-title">${b.emoji} ${b.name}</h1><p class="muted">${b.desc}</p></div>
    <div class="lot-art">${smallArt(b.id, !l.done && l.lv === 1, Math.max(1, lvNow))}</div>`;
  if (!l.done) {
    const need = workOf(b, l.lv);
    return `<div class="sheet" role="dialog" aria-labelledby="lot-title">${head}
      ${bar(l.progress / need)}<p class="tiny center">성장 점수 ${Math.floor(l.progress)} / ${need}</p>
      <div class="row two"><button class="btn ghost" data-act="modal.close">닫기</button><button class="btn small danger-text" data-act="island.cancel" data-arg="${i}">${l.lv > 1 ? '레벨 올리기 취소' : '짓기 취소'}</button></div>
    </div>`;
  }
  const next = l.lv + 1;
  const canUp = l.lv < MAX_LEVEL;
  const cost = canUp && costOf(b, next);
  const ok = canUp && !busy && canAfford(cost);
  const bedsUp = canUp ? bedsOf(b.id, next) - bedsOf(b.id, l.lv) : 0;
  return `<div class="sheet" role="dialog" aria-labelledby="lot-title">${head}
    <p class="tiny center">${l.date ? `${l.date.replaceAll('-', '. ')}에 Lv.${l.lv} 완성` : ''}${bedsOf(b.id, l.lv) ? ` · 주민 ${bedsOf(b.id, l.lv)}명이 살 수 있어요` : ''}</p>
    ${
      canUp
        ? `<div class="upgrade-box"><b>Lv.${next}로 올리기</b>
           <span class="tiny">${next === 2 ? '깃발과 꽃밭이 생기고 조금 커져요' : '금빛 전구가 반짝이고 더 커져요'}${b.id === 'house' && next === 2 ? ' · 2층이 올라가요' : ''}${bedsUp ? ` · 주민 +${bedsUp}명` : ''}</span>
           <span class="tiny">완성까지 성장 점수 ${workOf(b, next)}${busy ? ' · 지금 짓는 건물이 끝나면 할 수 있어요' : ''}</span>
           <button class="btn ${ok ? 'gold' : 'soft'}" data-act="island.upgrade" data-arg="${i}" ${ok ? '' : 'disabled'}>⬆ ${costHtml(cost)}</button></div>`
        : '<p class="tiny center">가장 높은 레벨이에요 ✨</p>'
    }
    <div class="row two"><button class="btn ghost" data-act="modal.close">닫기</button><button class="btn small danger-text" data-act="island.remove" data-arg="${i}">허물기</button></div>
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
    const cost = costOf(b, 1);
    if (!canAfford(cost)) return toast('포인트가 조금 부족해요');
    pay(cost);
    s.island.lots[lot] = { b: id, lv: 1, done: false, progress: 0 };
    closeModal();
    settle();
    chime('ok');
    rerender();
    toast(`${b.name}을(를) 짓기 시작했어요. 오늘 기록으로 완성해요!`);
  },

  // 레벨 올리기: 지금 짓는 건물이 없을 때만. 올리는 동안에도 건물은 그대로 서 있다.
  'island.upgrade': (el) => {
    const i = Number(el.dataset.arg);
    const s = ctx.state;
    const l = s.island.lots[i];
    if (!l || !l.done || l.lv >= MAX_LEVEL || buildingNow(s) >= 0) return;
    const b = buildingById(l.b);
    const cost = costOf(b, l.lv + 1);
    if (!canAfford(cost)) return toast('포인트가 조금 부족해요');
    pay(cost);
    Object.assign(l, { lv: l.lv + 1, done: false, progress: 0 });
    closeModal();
    settle();
    chime('ok');
    rerender();
    toast(`${b.name} Lv.${l.lv}로 올리기 시작했어요`);
  },

  // 취소: 낸 포인트는 돌려준다 (레벨 올리기 취소는 이전 레벨로)
  'island.cancel': (el) => {
    const i = Number(el.dataset.arg);
    const s = ctx.state;
    const l = s.island.lots[i];
    if (!l || l.done || !confirm('그만둘까요? 낸 포인트는 돌려받아요.')) return;
    const b = buildingById(l.b);
    const cost = costOf(b, l.lv);
    ['sun', 'water', 'star'].forEach((k) => (s[k] += cost[k] || 0));
    if (l.lv > 1) Object.assign(l, { lv: l.lv - 1, done: true, progress: workOf(b, l.lv - 1) });
    else s.island.lots[i] = null;
    closeModal();
    commit();
    rerender();
  },

  'island.remove': (el) => {
    const i = Number(el.dataset.arg);
    const s = ctx.state;
    const l = s.island.lots[i];
    if (!l || !confirm(`${buildingById(l.b).name}을(를) 허물까요? 포인트는 돌아오지 않아요.${bedsOf(l.b, shownLevel(l)) ? ' 집 칸이 줄어도 사는 주민은 그대로예요.' : ''}`)) return;
    s.island.lots[i] = null;
    closeModal();
    commit();
    rerender();
  },

  // 주민들의 선물 (하루 한 번)
  'island.gift': () => {
    const s = ctx.state;
    const n = residentCount(s);
    if (!n || s.island.giftDay === todayKey()) return;
    const g = giftOf(n);
    s.island.giftDay = todayKey();
    gain(g);
    settle();
    chime('level');
    confetti(['🎁', '✨', '🌿']);
    rerender();
    toast(`주민들의 선물 · ${amountText(g)}`);
  },
};
