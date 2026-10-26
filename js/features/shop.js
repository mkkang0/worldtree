// 상점: 미리보기, 구매, 장착, 교환소
import { ctx, rerender, commit } from '../app/context.js';
import { canAfford, pay, settle, exchange } from '../app/wallet.js';
import { EXCHANGE_RATE, EXCHANGE_BUNDLES } from '../core/config.js';
import { ITEMS, SLOTS, itemById } from '../data/items/index.js';
import { costHtml, money, title, CURRENCIES } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { sceneSvg, wallet } from '../ui/components.js';
import { itemThumb } from '../art/thumbs.js';
import { toast, chime } from '../ui/effects.js';

export function view(state, ui) {
  const slot = SLOTS.find((s) => s.id === ui.shopSlot) || SLOTS[0];
  const items = ITEMS.filter((i) => i.slot === slot.id);
  const previewing = Object.keys(ui.preview).length > 0;
  return `
    <header class="page-head"><h1>상점</h1><span class="tiny">세계수와 정령을 꾸며요</span></header>
    <div class="preview-scene">${sceneSvg(state, { equipped: ui.preview })}</div>
    <div class="preview-note">${previewing ? '<button class="btn small soft fit" data-act="shop.previewReset">미리보기 끄기</button>' : '<span class="tiny">아이템을 누르면 미리 볼 수 있어요</span>'}</div>
    ${wallet(state)}
    ${slotTabs(slot.id)}
    <section class="card">
      ${title(slot.label, { aside: `${items.filter((i) => state.owned.includes(i.id)).length} / ${items.length} 보유` })}
      ${slot.id === 'ornament' ? '<p class="tiny">가지 장식은 세계수가 묘목 이상일 때 보여요.</p>' : ''}
      <div class="grid">${items.map((i) => itemCard(state, ui, i)).join('')}</div>
    </section>
    ${exchangeCard(state)}`;
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

function itemCard(state, ui, item) {
  const owned = state.owned.includes(item.id);
  const on = state.equipped[item.slot] === item.id;
  const seen = ui.preview[item.slot] === item.id;
  const btn = owned
    ? `<button class="btn small ${on ? 'soft' : ''}" data-act="shop.equip" data-arg="${item.id}">${on ? '해제' : '장착'}</button>`
    : `<button class="btn small ${canAfford(item.cost) ? '' : 'soft'}" data-act="shop.buy" data-arg="${item.id}" ${canAfford(item.cost) ? '' : 'disabled'}>${costHtml(item.cost)}</button>`;
  const art = item.swatch
    ? `<span class="swatch" style="background:linear-gradient(135deg,${item.swatch[0]} 50%,${item.swatch[1]} 50%)"></span>`
    : itemThumb(item);
  return `<div class="item ${on ? 'on' : ''} ${seen ? 'seen' : ''} ${item.cost.star ? 'study-item' : ''}">
    <button class="item-body" data-act="shop.preview" data-arg="${item.id}" aria-label="${item.name} 미리보기"><span class="thumb">${art}</span><span class="item-name">${item.name}</span></button>${btn}
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

export const actions = {
  'shop.slot': (el) => {
    ctx.ui.shopSlot = el.dataset.arg;
    rerender();
  },

  // 같은 아이템을 다시 누르면 미리보기를 끈다.
  'shop.preview': (el) => {
    const item = itemById(el.dataset.arg);
    if (!item || item.slot === 'theme') return;
    ctx.ui.preview = ctx.ui.preview[item.slot] === item.id ? {} : { [item.slot]: item.id };
    rerender();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    s.equipped[item.slot] = item.id;
    ctx.ui.preview = {};
    settle();
    chime('ok');
    rerender();
    toast(`${item.name}을(를) 장착했어요`);
  },

  'shop.equip': (el) => {
    const item = itemById(el.dataset.arg);
    const s = ctx.state;
    if (!item || !s.owned.includes(item.id)) return;
    s.equipped[item.slot] = s.equipped[item.slot] === item.id ? null : item.id;
    ctx.ui.preview = {};
    commit();
    rerender();
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
