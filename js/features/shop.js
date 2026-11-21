// 상점: 미리보기 무대 + 찾기 + 오늘의 추천(하루 한 개 특가) + 종류별 목록 + 교환소
// 처음 화면은 '종류 고르기'이고, 종류를 누르면 그 종류의 아이템만 보여준다 (ctx.ui.shopSlot, ''이면 처음 화면).
// 가진 아이템 꾸미기·코디는 '나의 정원'(features/garden.js)에서 한다.
import { ctx, rerender, commit } from '../app/context.js';
import { canAfford, pay, settle, exchange } from '../app/wallet.js';
import { isOn, put, toggle, cycleHue, cyclePos, posName, posShort } from '../app/decor.js';
import { EXCHANGE_RATE, EXCHANGE_BUNDLES } from '../core/config.js';
import { todayKey } from '../core/dates.js';
import { festivalOn, nextFestival, festivalById, canBuyFestItem, STAMP_GOAL } from '../core/festivals.js';
import { ITEMS, SLOTS, itemById, slotById, placed, withPreview } from '../data/items/index.js';
import { treeById } from '../data/trees.js';
import { esc, costHtml, money, title, CURRENCIES } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { sceneSvg } from '../ui/components.js';
import { spiritPortrait } from '../art/scene.js';
import { rng } from '../art/svg.js';
import { itemThumb } from '../art/thumbs.js';
import { toast, chime } from '../ui/effects.js';

const FILTERS = [['all', '전체'], ['afford', '살 수 있는 것'], ['owned', '가진 것'], ['rare', '✨ 전설']];
const SORTS = [['base', '기본'], ['cheap', '싼 순']];
const WEAR = ['hat', 'face', 'neck', 'hand'];
const DEAL_OFF = 0.3; // 오늘의 특가 할인율

/* ---------- 오늘의 추천 · 특가 ---------- */

// 날짜마다 같은 4개 (가진 것도 포함해서 골라 하루 동안 바뀌지 않게). 첫 번째가 30% 특가.
export function dailyPicks(day = todayKey()) {
  const r = rng('shop-' + day);
  const pool = ITEMS.filter((i) => i.slot !== 'theme' && !i.fest); // 축제 아이템은 추천에 넣지 않는다
  const out = [];
  while (out.length < 4) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0].id);
  return out;
}

// 실제 값 (특가면 30% 할인, 1 이상)
export function priceOf(item, day = todayKey()) {
  if (dailyPicks(day)[0] !== item.id) return item.cost;
  const off = (v) => (v ? Math.max(1, Math.round(v * (1 - DEAL_OFF))) : 0);
  return { sun: off(item.cost.sun), water: off(item.cost.water), star: off(item.cost.star) };
}
const isDeal = (item) => dailyPicks()[0] === item.id;

/* ---------- 화면 ---------- */

export function view(state, ui) {
  return `
    <header class="page-head"><h1>상점</h1><span class="tiny">모은 아이템 ${state.owned.length} / ${ITEMS.length}</span></header>
    ${stage(state, ui)}
    <div class="shop-search">${icon('sparkle')}<input type="search" data-input="shop.search" value="${esc(ui.shopQuery || '')}" placeholder="이름으로 찾기 (예: 고양이, 벚꽃)" aria-label="아이템 이름으로 찾기" enterkeyhint="search"></div>
    <div id="shop-body">${body(state, ui)}</div>`;
}

function body(state, ui) {
  const q = (ui.shopQuery || '').trim();
  if (q) return searchResults(state, ui, q);
  const slot = slotById(ui.shopSlot);
  return slot ? slotList(state, ui, slot) : home(state, ui);
}

// 처음 화면: 오늘의 추천 + 종류 + 정원 안내 + 교환소
function home(state, ui) {
  const picks = dailyPicks().map(itemById);
  return `
    <section class="card">
      ${title('오늘의 추천', { iconName: 'gift', aside: '매일 바뀌어요' })}
      <div class="grid items picks">${picks.map((i) => itemCard(state, ui, i, { showSlot: true })).join('')}</div>
    </section>
    ${festivalShop(state, ui)}
    <section class="card legend-card">
      ${title('✨ 전설 아이템', { aside: `${ITEMS.filter((i) => i.rare && state.owned.includes(i.id)).length} / ${ITEMS.filter((i) => i.rare).length}` })}
      <p class="tiny">빛나고 움직이는 특별한 꾸미기예요. 포인트를 모아 하나씩 데려와요.</p>
      <div class="grid three items">${ITEMS.filter((i) => i.rare).map((i) => itemCard(state, ui, i, { showSlot: true })).join('')}</div>
    </section>
    <section class="card">
      ${title('종류', { iconName: 'gem' })}
      ${['세계수의 풍경', '정령 옷장', '앱']
        .map(
          (g) => `<div class="cat-group"><span class="slot-group">${g}</span><div class="cats">${SLOTS.filter((s) => s.group === g)
            .map((s) => {
              const all = ITEMS.filter((i) => i.slot === s.id);
              const own = all.filter((i) => state.owned.includes(i.id)).length;
              return `<button class="cat" data-act="shop.slot" data-arg="${s.id}"><em>${s.emoji}</em><b>${s.label}</b><small>${own} / ${all.length}</small></button>`;
            })
            .join('')}</div></div>`
        )
        .join('')}
    </section>
    <button class="card garden-link" data-act="garden.open">${icon('tree')}<span class="grow"><b>나의 정원</b><span class="tiny">가진 아이템으로 꾸미고 코디를 저장해요</span></span>${icon('right')}</button>
    ${exchangeCard(state)}`;
}

// 🎉 축제 한정: 축제 동안 파는 아이템 + 도장 선물 (축제가 아니면 다음 축제 안내)
function festivalShop(state, ui) {
  const f = festivalOn();
  if (!f) {
    const nx = nextFestival();
    return `<section class="card note fest-note" id="fest-shop">${nx.emoji} 다음 축제는 <b>${nx.name}</b> · ${nx.inDays}일 뒤에 열려요. 축제 동안만 파는 한정 아이템이 있어요.</section>`;
  }
  const items = ITEMS.filter((i) => i.fest === f.id);
  return `<section class="card fest-shop fest-${f.id}" id="fest-shop">
    ${title(`🎉 ${f.name} 한정`, { aside: '기간 한정' })}
    <p class="tiny">축제 동안만 살 수 있어요. 선물 아이템은 축제 도장 ${STAMP_GOAL}개를 모으면 받아요.</p>
    <div class="grid three items">${items.map((i) => itemCard(state, ui, i, { showSlot: true })).join('')}</div>
  </section>`;
}

// 한 종류만 보기
function slotList(state, ui, slot) {
  const filter = ui.shopFilter || 'all';
  const sort = ui.shopSort || 'base';
  const all = ITEMS.filter((i) => i.slot === slot.id);
  const pass = { all: () => true, owned: (i) => state.owned.includes(i.id), rare: (i) => i.rare, afford: (i) => !state.owned.includes(i.id) && canAfford(priceOf(i)) };
  let items = all.filter(pass[filter] || pass.all);
  if (sort === 'cheap') items = [...items].sort((a, b) => total(priceOf(a)) - total(priceOf(b)));
  const hints = [
    slot.id === 'ornament' || slot.id === 'bloom' ? `${slot.label}은 세계수가 묘목 이상일 때 보여요.` : '',
    slot.multi ? `${slot.multi}개까지 함께 놓을 수 있어요.` : '',
  ].filter(Boolean);
  return `<section class="card">
    <div class="slot-head">
      <button class="back" data-act="shop.slot" data-arg="">${icon('left')}종류</button>
      <b>${slot.emoji} ${slot.label}</b><span class="tiny">${all.filter((i) => state.owned.includes(i.id)).length} / ${all.length}</span>
    </div>
    <div class="chips tight scroll">${FILTERS.map(([id, label]) => `<button class="chip-btn ${id === filter ? 'on' : ''}" data-act="shop.filter" data-arg="${id}" aria-pressed="${id === filter}">${label}</button>`).join('')}
      <span class="chip-sep"></span>${SORTS.map(([id, label]) => `<button class="chip-btn ${id === sort ? 'on' : ''}" data-act="shop.sort" data-arg="${id}" aria-pressed="${id === sort}">${label}</button>`).join('')}</div>
    ${hints.map((h) => `<p class="tiny">${h}</p>`).join('')}
    ${items.length ? `<div class="grid three items">${items.map((i) => itemCard(state, ui, i)).join('')}</div>` : '<p class="muted">여기에 맞는 아이템이 없어요.</p>'}
    <div class="slot-nav">${slotNeighbors(slot)}</div>
  </section>`;
}

// 이전 · 다음 종류로 바로 가기
function slotNeighbors(slot) {
  const i = SLOTS.indexOf(slot);
  const prev = SLOTS[i - 1];
  const next = SLOTS[i + 1];
  return `${prev ? `<button class="btn small ghost" data-act="shop.slot" data-arg="${prev.id}">${icon('left')} ${prev.emoji} ${prev.label}</button>` : '<span></span>'}
    ${next ? `<button class="btn small ghost" data-act="shop.slot" data-arg="${next.id}">${next.emoji} ${next.label} ${icon('right')}</button>` : '<span></span>'}`;
}

const total = (c) => (c.sun || 0) + (c.water || 0) + (c.star || 0);

function searchResults(state, ui, q) {
  const found = ITEMS.filter((i) => i.name.includes(q) || slotById(i.slot).label.includes(q));
  return `<section class="card">
    ${title(`'${esc(q)}' 찾기`, { aside: `${found.length}개` })}
    ${found.length ? `<div class="grid three items">${found.map((i) => itemCard(state, ui, i, { showSlot: true })).join('')}</div>` : '<p class="muted">찾는 아이템이 없어요. 다른 이름으로 찾아보세요.</p>'}
  </section>`;
}

// 위에 붙어 있는 미리보기 무대: 왼쪽 장면, 오른쪽 정령 확대 + 포인트
function stage(state, ui) {
  const previewing = Object.keys(ui.preview).length > 0;
  const eq = withPreview(state.equipped, ui.preview);
  const wear = Object.fromEntries(WEAR.map((s) => [s, placed(eq, s)[0]]));
  return `<section class="stage" aria-label="미리보기">
    <div class="stage-scene">${sceneSvg(state, { equipped: ui.preview })}
      ${previewing ? `<button class="stage-reset" data-act="shop.previewReset" aria-label="미리보기 끄기">${icon('close')} 미리보기</button>` : ''}</div>
    <div class="stage-side">
      <div class="stage-portrait">${spiritPortrait({ wear, custom: state.custom, tree: treeById(state.plant.species), motion: placed(eq, 'motion')[0] })}</div>
      <div class="stage-wallet">${CURRENCIES.filter((c) => c.id !== 'star' || state.settings.studyEnabled || state.star > 0)
        .map((c) => `<span>${money(c.id, state[c.id])}</span>`)
        .join('')}</div>
    </div>
  </section>`;
}

function itemCard(state, ui, item, { showSlot = false } = {}) {
  const slot = slotById(item.slot);
  const owned = state.owned.includes(item.id);
  const on = isOn(state, item);
  const seen = ui.preview[item.slot] === item.id;
  const hue = state.custom[item.id]?.hue || 0;
  const price = priceOf(item);
  const deal = isDeal(item) && !owned;
  const fest = item.fest && festivalById(item.fest);
  const locked = !owned && !canBuyFestItem(item);
  const main = owned
    ? `<button class="btn small ${on ? 'soft' : ''}" data-act="shop.equip" data-arg="${item.id}">${on ? (slot.multi ? '빼기' : '해제') : slot.multi ? '놓기' : '장착'}</button>`
    : locked
      ? `<button class="btn small soft" disabled>${item.prize ? '🎁 도장 선물' : `${fest.emoji} 축제 때`}</button>`
      : `<button class="btn small ${canAfford(price) ? '' : 'soft'}" data-act="shop.buy" data-arg="${item.id}" ${canAfford(price) ? '' : 'disabled'}>${costHtml(price)}</button>`;
  const tools = owned
    ? [
        slot.tint ? `<button class="tool" data-act="shop.hue" data-arg="${item.id}" aria-label="${item.name} 색 바꾸기 (지금 ${hue + 1}번)">🎨<small>${hue + 1}</small></button>` : '',
        slot.positions && on ? `<button class="tool" data-act="shop.pos" data-arg="${item.id}" aria-label="${item.name} 자리 옮기기 (지금 ${posName(slot, state.custom[item.id]?.pos)})">📍<small>${posShort(slot, state.custom[item.id]?.pos)}</small></button>` : '',
      ].join('')
    : '';
  const art = item.swatch ? `<span class="swatch" style="background:linear-gradient(135deg,${item.swatch[0]} 50%,${item.swatch[1]} 50%)"></span>` : itemThumb(item, hue);
  return `<div class="item ${on ? 'on' : ''} ${seen ? 'seen' : ''} ${item.cost.star ? 'study-item' : ''} ${item.rare ? 'rare' : ''}">
    <button class="item-body" data-act="shop.preview" data-arg="${item.id}" aria-label="${item.name} 미리보기">
      <span class="thumb">${art}${deal ? '<i class="deal">-30%</i>' : item.rare ? '<i class="legend">✨ 전설</i>' : fest ? `<i class="legend fest">${fest.emoji} 한정</i>` : ''}${owned ? '<i class="owned">보유</i>' : ''}</span>
      <span class="item-name">${item.name}</span>${showSlot ? `<span class="item-slot">${slot.emoji} ${slot.label}</span>` : ''}
    </button>
    ${tools ? `<div class="item-tools">${tools}</div>` : ''}${main}
  </div>`;
}

// 교환소: 이슬·별빛 → 햇살. 별빛은 공부 기능을 켰거나 가진 별빛이 있을 때만 보인다.
function exchangeCard(state) {
  const sources = CURRENCIES.filter((c) => EXCHANGE_RATE[c.id] && (c.id !== 'star' || state.settings.studyEnabled || state.star > 0));
  const buttons = sources.flatMap((c) =>
    EXCHANGE_BUNDLES.map((n) => {
      const cost = n * EXCHANGE_RATE[c.id];
      return `<button class="btn small soft" data-act="shop.exchange" data-arg="${c.id}:${n}" ${state[c.id] >= cost ? '' : 'disabled'}>${money(c.id, cost)} ${icon('right')} ${money('sun', n)}</button>`;
    })
  );
  return `<section class="card">
    ${title('교환소', { iconName: 'swap' })}
    <p class="tiny">햇살이 모자랄 때 ${sources.map((c) => `${c.label} ${EXCHANGE_RATE[c.id]}`).join(', ')}을 햇살 1로 바꿀 수 있어요. 세계수 성장에는 더해지지 않아요.</p>
    <div class="grid">${buttons.join('')}</div>
  </section>`;
}

/* ---------- 동작 ---------- */

const done = () => {
  commit();
  rerender();
};

export const actions = {
  'shop.slot': (el) => {
    ctx.ui.shopSlot = el.dataset.arg;
    ctx.ui.shopQuery = '';
    ctx.ui.shopFilter = 'all';
    rerender();
    // 종류를 바꾸면 목록 처음(무대 바로 아래)으로
    const top = document.getElementById('shop-body');
    if (top) window.scrollTo({ top: Math.max(0, top.offsetTop - 260), behavior: 'smooth' });
  },

  'shop.filter': (el) => {
    ctx.ui.shopFilter = el.dataset.arg;
    rerender();
  },

  'shop.sort': (el) => {
    ctx.ui.shopSort = el.dataset.arg;
    rerender();
  },

  // 글자를 칠 때마다 결과만 다시 그린다 (입력칸을 다시 그리면 키보드가 내려가서)
  'shop.search': (el) => {
    ctx.ui.shopQuery = el.value;
    const box = document.getElementById('shop-body');
    if (box) box.innerHTML = body(ctx.state, ctx.ui);
  },

  // 여러 슬롯을 함께 입혀볼 수 있다. 같은 아이템을 다시 누르면 그 슬롯의 미리보기만 끈다.
  'shop.preview': (el) => {
    const item = itemById(el.dataset.arg);
    if (!item || item.slot === 'theme') return;
    const next = { ...ctx.ui.preview };
    if (next[item.slot] === item.id) delete next[item.slot];
    else next[item.slot] = item.id;
    ctx.ui.preview = next;
    rerender();
  },

  'shop.previewReset': () => {
    ctx.ui.preview = {};
    rerender();
  },

  'shop.buy': (el) => {
    const item = itemById(el.dataset.arg);
    const s = ctx.state;
    if (!item || s.owned.includes(item.id) || !canBuyFestItem(item)) return;
    const price = priceOf(item);
    if (!canAfford(price)) return toast('포인트가 조금 부족해요');
    pay(price);
    s.owned.push(item.id);
    put(item);
    delete ctx.ui.preview[item.slot];
    settle();
    chime('ok');
    rerender();
    toast(`${item.name}을(를) ${slotById(item.slot).multi ? '놓았어요' : '장착했어요'}${isDeal(item) ? ' · 특가!' : ''}`);
  },

  'shop.equip': (el) => {
    const item = itemById(el.dataset.arg);
    if (!item || !toggle(item)) return;
    delete ctx.ui.preview[item.slot];
    done();
  },

  // 색 바꾸기. 놓지 않은 아이템은 무대에 잠깐 입혀 보여준다.
  'shop.hue': (el) => {
    const item = itemById(el.dataset.arg);
    if (!item) return;
    cycleHue(item);
    if (!isOn(ctx.state, item)) ctx.ui.preview = { ...ctx.ui.preview, [item.slot]: item.id };
    done();
  },

  'shop.pos': (el) => {
    const item = itemById(el.dataset.arg);
    if (!item) return;
    cyclePos(item);
    done();
  },

  'shop.exchange': (el) => {
    const [from, n] = el.dataset.arg.split(':');
    const amount = Number(n);
    if (!exchange(from, amount)) return toast('바꿀 포인트가 부족해요');
    commit();
    chime('ok');
    rerender();
    toast(`햇살 +${amount}으로 바꿨어요`);
  },
};
