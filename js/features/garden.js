// 나의 정원: 세계수를 화면 가득 보면서 창고(가진 아이템)에서 바로 꾸미는 곳. 홈의 장면을 누르면 열린다.
// 아래 탭이 사라지는 전체 화면이다 (app/render.js가 body에 immersive를 붙인다).
import { ctx, rerender, commit } from '../app/context.js';
import { go } from '../app/render.js';
import { isOn, toggle, cycleHue, cyclePos, posShort, saveOutfit, wearOutfit, takeOffAll } from '../app/decor.js';
import { ITEMS, SLOTS, itemById, slotById } from '../data/items/index.js';
import { esc, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { sceneSvg } from '../ui/components.js';
import { itemThumb } from '../art/thumbs.js';
import { toast, chime } from '../ui/effects.js';

const ownedIn = (state, slotId) => ITEMS.filter((i) => i.slot === slotId && state.owned.includes(i.id));

export function view(state, ui) {
  const tab = ui.gardenTab || 'items';
  const firstOwned = SLOTS.find((s) => ownedIn(state, s.id).length);
  const slot = slotById(ui.gardenSlot) || firstOwned || SLOTS[0];
  return `<div class="garden">
    <header class="garden-top">
      <button class="x" data-act="garden.close" aria-label="정원 닫기">${icon('left')}</button>
      <div class="grow"><b>나의 정원</b><span class="tiny">모은 아이템 ${state.owned.length} / ${ITEMS.length}</span></div>
      <button class="x island-go" data-act="island.open" aria-label="나의 섬으로">🏝️</button>
      <button class="x" data-act="photo.make" aria-label="사진으로 저장">${icon('camera')}</button>
    </header>
    <div class="garden-stage">
      <div class="bubble">${esc(ui.bubble || `정령 ${state.settings.name}를 눌러 보세요`)}</div>
      <div class="scene" id="scene" role="button" tabindex="0" data-act="home.pet" aria-label="정령 ${esc(state.settings.name)} 쓰다듬기">${sceneSvg(state)}</div>
    </div>
    <section class="card garden-drawer">
      <div class="seg" role="tablist">
        <button class="${tab === 'items' ? 'on' : ''}" data-act="garden.tab" data-arg="items" role="tab" aria-selected="${tab === 'items'}">${icon('gem')} 창고</button>
        <button class="${tab === 'outfits' ? 'on' : ''}" data-act="garden.tab" data-arg="outfits" role="tab" aria-selected="${tab === 'outfits'}">${icon('sparkle')} 코디</button>
      </div>
      ${tab === 'items' ? storage(state, slot) : outfits(state)}
    </section>
  </div>`;
}

// 창고: 종류를 고르고, 가진 아이템을 눌러 놓거나 뺀다
function storage(state, slot) {
  const chips = SLOTS.map((s) => {
    const n = ownedIn(state, s.id).length;
    return `<button class="chip-btn ${s.id === slot.id ? 'on' : ''} ${n ? '' : 'empty'}" data-act="garden.slot" data-arg="${s.id}" role="tab" aria-selected="${s.id === slot.id}">${s.emoji} ${s.label}${n ? ` <small>${n}</small>` : ''}</button>`;
  }).join('');
  const items = ownedIn(state, slot.id);
  const hint = [slot.multi ? `${slot.multi}개까지 함께 놓을 수 있어요` : '', slot.tint ? '🎨 색' : '', slot.positions ? '📍 자리' : ''].filter(Boolean).join(' · ');
  return `<div class="chips scroll" role="tablist" aria-label="아이템 종류">${chips}</div>
    ${
      items.length
        ? `<p class="tiny">누르면 놓고, 다시 누르면 빼요${hint ? ` · ${hint}` : ''}</p>
           <div class="grid storage">${items.map((i) => storageTile(state, i, slot)).join('')}</div>`
        : `<div class="empty-box"><span class="em">${slot.emoji}</span><p>아직 ${slot.label} 아이템이 없어요.<br>공부하고 운동해서 모은 포인트로 상점에서 데려와요.</p>
           <button class="btn small" data-act="garden.toShop" data-arg="${slot.id}">${icon('gem')} 상점에서 찾기</button></div>`
    }
    <div class="row two garden-foot">
      <button class="btn small ghost" data-act="garden.toShop" data-arg="${slot.id}">${icon('gem')} 상점</button>
      <button class="btn small ghost" data-act="garden.takeOff">모두 벗기기</button>
    </div>`;
}

function storageTile(state, item, slot) {
  const on = isOn(state, item);
  const hue = state.custom[item.id]?.hue || 0;
  const tools = [
    slot.tint ? `<button class="tool" data-act="garden.hue" data-arg="${item.id}" aria-label="${item.name} 색 바꾸기 (지금 ${hue + 1}번)">🎨<small>${hue + 1}</small></button>` : '',
    slot.positions && on ? `<button class="tool" data-act="garden.pos" data-arg="${item.id}" aria-label="${item.name} 자리 옮기기">📍<small>${posShort(slot, state.custom[item.id]?.pos)}</small></button>` : '',
  ].join('');
  const art = item.swatch ? `<span class="swatch" style="background:linear-gradient(135deg,${item.swatch[0]} 50%,${item.swatch[1]} 50%)"></span>` : itemThumb(item, hue);
  return `<div class="stile ${on ? 'on' : ''} ${item.rare ? 'rare' : ''}">
    <button class="stile-body" data-act="garden.toggle" data-arg="${item.id}" aria-pressed="${on}" aria-label="${item.name} ${on ? '빼기' : '놓기'}">
      <span class="thumb">${art}${on ? `<i class="check">${icon('check')}</i>` : ''}</span><span class="stile-name">${item.name}</span>
    </button>${tools ? `<div class="item-tools">${tools}</div>` : ''}
  </div>`;
}

// 코디: 지금 모습을 3칸에 저장했다가 한 번에 입는다
function outfits(state) {
  const cards = state.outfits
    .map((o, i) =>
      o
        ? `<div class="outfit"><span class="outfit-art">${sceneSvg(state, { base: o.equipped, custom: o.custom, label: `코디 ${i + 1}` })}</span>
          <span class="tiny">코디 ${i + 1}</span>
          <div class="outfit-btns"><button class="btn small" data-act="garden.outfitWear" data-arg="${i}">입기</button>
          <button class="x" data-act="garden.outfitSave" data-arg="${i}" aria-label="코디 ${i + 1}에 지금 모습 덮어쓰기">${icon('edit')}</button></div></div>`
        : `<button class="outfit empty" data-act="garden.outfitSave" data-arg="${i}">${icon('plus')}<span>지금 모습<br>저장</span></button>`
    )
    .join('');
  return `${title('코디 저장', { aside: '3칸' })}
    <p class="tiny">지금 꾸민 모습(배경·소품·옷·색·자리)을 저장해 두고, 언제든 한 번에 바꿔요.</p>
    <div class="grid three outfits">${cards}</div>`;
}

const done = () => {
  commit();
  rerender();
};

export const actions = {
  'garden.open': () => go('garden'),
  'garden.close': () => go('home'),

  'garden.tab': (el) => {
    ctx.ui.gardenTab = el.dataset.arg;
    rerender();
  },

  'garden.slot': (el) => {
    ctx.ui.gardenSlot = el.dataset.arg;
    rerender();
  },

  'garden.toggle': (el) => {
    const item = itemById(el.dataset.arg);
    if (item && toggle(item)) {
      chime('soft');
      done();
    }
  },

  'garden.hue': (el) => {
    const item = itemById(el.dataset.arg);
    if (!item) return;
    cycleHue(item);
    done();
  },

  'garden.pos': (el) => {
    const item = itemById(el.dataset.arg);
    if (!item) return;
    cyclePos(item);
    done();
  },

  'garden.toShop': (el) => {
    go('shop');
    ctx.ui.shopSlot = el.dataset.arg;
    ctx.ui.shopQuery = '';
    rerender();
  },

  'garden.takeOff': () => {
    if (!confirm('놓은 아이템을 모두 뺄까요? (앱 테마는 그대로)')) return;
    takeOffAll();
    done();
  },

  'garden.outfitSave': (el) => {
    const i = Number(el.dataset.arg);
    if (ctx.state.outfits[i] && !confirm(`코디 ${i + 1}을(를) 지금 모습으로 바꿀까요?`)) return;
    saveOutfit(i);
    chime('ok');
    done();
    toast(`코디 ${i + 1}에 저장했어요`);
  },

  'garden.outfitWear': (el) => {
    const i = Number(el.dataset.arg);
    if (!wearOutfit(i)) return;
    chime('ok');
    done();
    toast(`코디 ${i + 1}로 바꿨어요`);
  },
};
