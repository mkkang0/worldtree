// 꾸미기 규칙: 놓기·빼기, 색 바꾸기, 자리 옮기기, 코디 저장·입기. 상점과 정원(features/garden.js)이 같이 쓴다.
// 상태만 바꾸고, 저장(commit)과 다시 그리기는 부르는 쪽에서 한다.
import { ctx } from './context.js';
import { SLOTS, HUES, itemById, slotById, placed } from '../data/items/index.js';
import { cleanEquipped, cleanCustom } from '../data/store.js';
import { todayKey } from '../core/dates.js';
import { toast } from '../ui/effects.js';

export const isOn = (state, item) => placed(state.equipped, item.slot).includes(item.id);

// 슬롯에 놓기. 여러 개 놓는 슬롯이 꽉 차면 가장 먼저 놓은 것을 뺀다.
export function put(item) {
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

// 놓기 ↔ 빼기
export function toggle(item) {
  const s = ctx.state;
  if (!s.owned.includes(item.id)) return false;
  if (isOn(s, item)) {
    const slot = slotById(item.slot);
    s.equipped[item.slot] = slot.multi ? placed(s.equipped, item.slot).filter((x) => x !== item.id) : null;
  } else put(item);
  return true;
}

function setCustom(id, patch) {
  const s = ctx.state;
  const c = { ...(s.custom[id] || {}), ...patch };
  Object.keys(c).forEach((k) => c[k] === undefined && delete c[k]);
  if (Object.keys(c).length) s.custom[id] = c;
  else delete s.custom[id];
}

// 색 바꾸기: 원래 색 → 1 → 2 → 3 → 원래 색
export function cycleHue(item) {
  if (!ctx.state.owned.includes(item.id)) return;
  const next = ((ctx.state.custom[item.id]?.hue || 0) + 1) % HUES.length;
  setCustom(item.id, { hue: next || undefined });
}

// 자리 옮기기: 슬롯의 위치 목록을 차례로 돈다 (첫 번째가 기본)
export function cyclePos(item) {
  const slot = slotById(item.slot);
  if (!slot.positions || !ctx.state.owned.includes(item.id)) return;
  const list = slot.positions.map(([p]) => p);
  const next = list[(list.indexOf(ctx.state.custom[item.id]?.pos || list[0]) + 1) % list.length];
  setCustom(item.id, { pos: next === list[0] ? undefined : next });
}

export const posName = (slot, pos) => (slot.positions.find(([p]) => p === pos) || slot.positions[0])[1];
export const posShort = (slot, pos) => posName(slot, pos).replace('쪽', '').replace('나무 ', '');

export function saveOutfit(i) {
  const s = ctx.state;
  s.outfits[i] = { equipped: cleanEquipped(s.equipped, s.owned), custom: cleanCustom(s.custom, s.owned), date: todayKey() };
}

// 코디 입기: 지금 가진 아이템만 입고, 그 아이템들의 색·자리도 저장한 대로 돌린다
export function wearOutfit(i) {
  const s = ctx.state;
  const o = s.outfits[i];
  if (!o) return false;
  s.equipped = cleanEquipped(o.equipped, s.owned);
  SLOTS.flatMap((slot) => placed(s.equipped, slot.id)).forEach((id) => {
    if (o.custom[id]) s.custom[id] = { ...o.custom[id] };
    else delete s.custom[id];
  });
  return true;
}

// 모두 벗기 (앱 테마는 그대로)
export function takeOffAll() {
  const s = ctx.state;
  const theme = s.equipped.theme;
  s.equipped = cleanEquipped({ theme }, s.owned);
}
