// 상점: 미리보기 무대, 구매, 장착(여러 개 놓기), 위치·색 바꾸기, 코디 저장, 교환소
import { ctx, rerender, commit } from '../app/context.js';
import { canAfford, pay, settle, exchange } from '../app/wallet.js';
import { EXCHANGE_RATE, EXCHANGE_BUNDLES } from '../core/config.js';
import { todayKey } from '../core/dates.js';
import { ITEMS, SLOTS, HUES, itemById, slotById, placed, withPreview } from '../data/items/index.js';
import { cleanEquipped, cleanCustom } from '../data/store.js';
import { treeById } from '../data/trees.js';
import { costHtml, money, title, CURRENCIES } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { sceneSvg } from '../ui/components.js';
import { spiritPortrait } from '../art/scene.js';
import { itemThumb } from '../art/thumbs.js';
import { toast, chime } from '../ui/effects.js';

const FILTERS = [['all', '전체'], ['owned', '가진 것'], ['afford', '살 수 있는 것']];
const WEAR = ['hat', 'face', 'neck', 'hand'];
const isOn = (state, item) => placed(state.equipped, item.slot).includes(item.id);
const posName = (slot, pos) => (slot.positions.find(([p]) => p === pos) || slot.positions[0])[1];
const posShort = (slot, pos) => posName(slot, pos).replace('쪽', '').replace('나무 ', '');

export function view(state, ui) {
  const slot = slotById(ui.shopSlot) || SLOTS[0];
  const all = ITEMS.filter((i) => i.slot === slot.id);
  const filter = ui.shopFilter || 'all';
  const items = all.filter((i) => filter === 'all' || (filter === 'owned' ? state.owned.includes(i.id) : !state.owned.includes(i.id) && canAfford(i.cost)));
  const hints = [
    slot.id === 'ornament' || slot.id === 'bloom' ? `${slot.label}은 세계수가 묘목 이상일 때 보여요.` : '',
    slot.multi ? `${slot.multi}개까지 함께 놓을 수 있어요. 놓은 뒤 📍로 자리를 옮겨요.` : '',
    slot.tint ? '가진 아이템은 🎨로 색을 바꿀 수 있어요.' : '',
  ].filter(Boolean);
  return `
    <header class="page-head"><h1>상점</h1><span class="tiny">세계수와 정령을 꾸며요</span></header>
    ${stage(state, ui)}
    ${slotTabs(slot.id)}
    <div class="chips filter-chips" role="tablist" aria-label="보기">${FILTERS.map(
      ([id, label]) => `<button class="chip-btn ${id === filter ? 'on' : ''}" data-act="shop.filter" data-arg="${id}" role="tab" aria-selected="${id === filter}">${label}</button>`
    ).join('')}</div>
    <section class="card">
      ${title(slot.label, { aside: `${all.filter((i) => state.owned.includes(i.id)).length} / ${all.length} 보유` })}
      ${hints.map((h) => `<p class="tiny">${h}</p>`).join('')}
      ${items.length ? `<div class="grid three items">${items.map((i) => itemCard(state, ui, i, slot)).join('')}</div>` : '<p class="muted">여기에 맞는 아이템이 없어요.</p>'}
    </section>
    ${outfitCard(state)}
    ${exchangeCard(state)}`;
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

// 슬롯 탭: 같은 묶음(group)끼리 이어서 보여준다
function slotTabs(current) {
  let lastGroup = '';
  const chips = SLOTS.map((s) => {
    const head = s.group !== lastGroup ? `<span class="slot-group">${s.group}</span>` : '';
    lastGroup = s.group;
    return `${head}<button class="chip-btn ${s.id === current ? 'on' : ''}" data-act="shop.slot" data-arg="${s.id}" role="tab" aria-selected="${s.id === current}">${s.label}</button>`;
  });
  return `<div class="chips scroll" role="tablist">${chips.join('')}</div>`;
}

function itemCard(state, ui, item, slot) {
  const owned = state.owned.includes(item.id);
  const on = isOn(state, item);
  const seen = ui.preview[item.slot] === item.id;
  const hue = state.custom[item.id]?.hue || 0;
  const main = owned
    ? `<button class="btn small ${on ? 'soft' : ''}" data-act="shop.equip" data-arg="${item.id}">${on ? (slot.multi ? '빼기' : '해제') : slot.multi ? '놓기' : '장착'}</button>`
    : `<button class="btn small ${canAfford(item.cost) ? '' : 'soft'}" data-act="shop.buy" data-arg="${item.id}" ${canAfford(item.cost) ? '' : 'disabled'}>${costHtml(item.cost)}</button>`;
  const tools = owned
    ? [
        slot.tint ? `<button class="tool" data-act="shop.hue" data-arg="${item.id}" aria-label="${item.name} 색 바꾸기 (지금 ${hue + 1}번)">🎨<small>${hue + 1}</small></button>` : '',
        slot.positions && on ? `<button class="tool" data-act="shop.pos" data-arg="${item.id}" aria-label="${item.name} 자리 옮기기 (지금 ${posName(slot, state.custom[item.id]?.pos)})">📍<small>${posShort(slot, state.custom[item.id]?.pos)}</small></button>` : '',
      ].join('')
    : '';
  const art = item.swatch ? `<span class="swatch" style="background:linear-gradient(135deg,${item.swatch[0]} 50%,${item.swatch[1]} 50%)"></span>` : itemThumb(item, hue);
  return `<div class="item ${on ? 'on' : ''} ${seen ? 'seen' : ''} ${item.cost.star ? 'study-item' : ''}">
    <button class="item-body" data-act="shop.preview" data-arg="${item.id}" aria-label="${item.name} 미리보기"><span class="thumb">${art}</span><span class="item-name">${item.name}</span></button>
    ${tools ? `<div class="item-tools">${tools}</div>` : ''}${main}
  </div>`;
}

// 코디 저장: 지금 꾸민 모습을 3칸에 저장했다가 한 번에 바꿔 입는다
function outfitCard(state) {
  const slots = state.outfits
    .map((o, i) =>
      o
        ? `<div class="outfit"><span class="outfit-art">${sceneSvg(state, { base: o.equipped, custom: o.custom, label: `코디 ${i + 1}` })}</span>
          <span class="tiny">코디 ${i + 1}</span>
          <div class="outfit-btns"><button class="btn small" data-act="shop.outfitWear" data-arg="${i}">입기</button>
          <button class="x" data-act="shop.outfitSave" data-arg="${i}" aria-label="코디 ${i + 1}에 지금 모습 덮어쓰기">${icon('edit')}</button></div></div>`
        : `<button class="outfit empty" data-act="shop.outfitSave" data-arg="${i}">${icon('plus')}<span>지금 모습<br>저장</span></button>`
    )
    .join('');
  return `<section class="card">
    ${title('코디 저장', { iconName: 'sparkle', aside: '3칸' })}
    <p class="tiny">지금 꾸민 모습(배경·소품·옷·색·자리)을 저장해 두고, 언제든 한 번에 바꿔요.</p>
    <div class="grid three outfits">${slots}</div>
  </section>`;
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

// 슬롯에 놓기. 여러 개 놓는 슬롯이 꽉 차면 가장 먼저 놓은 것을 뺀다.
function put(item) {
  const s = ctx.state;
  const slot = slotById(item.slot);
  if (!slot.multi) {
    s.equipped[item.slot] = item.id;
    return;
  }
  const list = placed(s.equipped, item.slot).filter((x) => x !== item.id);
  if (list.length >= slot.multi) {
    const out = itemById(list.shift());
    toast(`${slot.label}은 ${slot.multi}개까지예요. ${out.name}을(를) 뺐어요`);
  }
  s.equipped[item.slot] = [...list, item.id];
}

export const actions = {
  'shop.slot': (el) => {
    ctx.ui.shopSlot = el.dataset.arg;
    rerender();
  },

  'shop.filter': (el) => {
    ctx.ui.shopFilter = el.dataset.arg;
    rerender();
  },

  // 여러 슬롯을 함께 입혀볼 수 있다. 같은 아이템을 다시 누르면 그 슬롯의 미리보기만 끈다.
  // 무대가 화면 위에 붙어 있어서, 목록 위치는 그대로 둔다.
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
    if (!item || s.owned.includes(item.id)) return;
    if (!canAfford(item.cost)) return toast('포인트가 조금 부족해요');
    pay(item.cost);
    s.owned.push(item.id);
    put(item);
    delete ctx.ui.preview[item.slot];
    settle();
    chime('ok');
    rerender();
    toast(`${item.name}을(를) ${slotById(item.slot).multi ? '놓았어요' : '장착했어요'}`);
  },

  'shop.equip': (el) => {
    const item = itemById(el.dataset.arg);
    const s = ctx.state;
    if (!item || !s.owned.includes(item.id)) return;
    if (isOn(s, item)) {
      const slot = slotById(item.slot);
      s.equipped[item.slot] = slot.multi ? placed(s.equipped, item.slot).filter((x) => x !== item.id) : null;
    } else put(item);
    delete ctx.ui.preview[item.slot];
    commit();
    rerender();
  },

  // 색 바꾸기: 누를 때마다 다음 색 (원래 색 → 1 → 2 → 3 → 원래 색). 놓지 않은 아이템은 무대에 잠깐 입혀 보여준다.
  'shop.hue': (el) => {
    const item = itemById(el.dataset.arg);
    const s = ctx.state;
    if (!item || !s.owned.includes(item.id)) return;
    const c = { ...(s.custom[item.id] || {}) };
    c.hue = ((c.hue || 0) + 1) % HUES.length;
    if (!c.hue) delete c.hue;
    if (Object.keys(c).length) s.custom[item.id] = c;
    else delete s.custom[item.id];
    if (!isOn(s, item)) ctx.ui.preview = { ...ctx.ui.preview, [item.slot]: item.id };
    commit();
    rerender();
  },

  // 자리 옮기기: 슬롯의 위치 목록을 차례로 돈다
  'shop.pos': (el) => {
    const item = itemById(el.dataset.arg);
    const s = ctx.state;
    const slot = item && slotById(item.slot);
    if (!slot?.positions || !s.owned.includes(item.id)) return;
    const list = slot.positions.map(([p]) => p);
    const next = list[(list.indexOf(s.custom[item.id]?.pos || list[0]) + 1) % list.length];
    const c = { ...(s.custom[item.id] || {}) };
    if (next === list[0]) delete c.pos;
    else c.pos = next;
    if (Object.keys(c).length) s.custom[item.id] = c;
    else delete s.custom[item.id];
    commit();
    rerender();
  },

  'shop.outfitSave': (el) => {
    const i = Number(el.dataset.arg);
    const s = ctx.state;
    if (s.outfits[i] && !confirm(`코디 ${i + 1}을(를) 지금 모습으로 바꿀까요?`)) return;
    s.outfits[i] = { equipped: cleanEquipped(s.equipped, s.owned), custom: cleanCustom(s.custom, s.owned), date: todayKey() };
    commit();
    chime('ok');
    rerender();
    toast(`코디 ${i + 1}에 저장했어요`);
  },

  // 코디 입기: 지금 가진 아이템만 입고, 그 아이템들의 색·자리도 저장한 대로 돌린다
  'shop.outfitWear': (el) => {
    const i = Number(el.dataset.arg);
    const s = ctx.state;
    const o = s.outfits[i];
    if (!o) return;
    s.equipped = cleanEquipped(o.equipped, s.owned);
    const ids = SLOTS.flatMap((slot) => placed(s.equipped, slot.id));
    ids.forEach((id) => {
      if (o.custom[id]) s.custom[id] = { ...o.custom[id] };
      else delete s.custom[id];
    });
    ctx.ui.preview = {};
    commit();
    chime('ok');
    rerender();
    toast(`코디 ${i + 1}로 바꿨어요`);
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
