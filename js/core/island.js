// 나의 섬 규칙 (화면 없이 계산만). state.island.lots[i] = null | { b: 건물 id, done, progress, date }
import { buildingById } from '../data/buildings.js';
import { todayKey } from './dates.js';

export const builtCount = (state) => state.island.lots.filter((l) => l && l.done).length;
export const buildingNow = (state) => state.island.lots.findIndex((l) => l && !l.done);

// 성장 점수를 받을 때(app/wallet.js gain) 짓는 중인 건물에 더한다. 완성하면 그 건물 정보를 돌려준다.
export function addWork(state, xp) {
  const i = buildingNow(state);
  if (i < 0 || !(xp > 0)) return null;
  const l = state.island.lots[i];
  const b = buildingById(l.b);
  l.progress = Math.min(b.work, l.progress + xp);
  if (l.progress < b.work) return null;
  l.done = true;
  l.date = todayKey();
  return b;
}
