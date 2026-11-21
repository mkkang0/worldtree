// 포인트를 주고받는 곳. 포인트·성장 점수는 반드시 이 함수들로만 바꾼다.
import { ctx, commit } from './context.js';
import { xpOf, stageOf, plantXp } from '../core/scoring.js';
import { checkAchievements } from '../core/achievements.js';
import { ACHIEVEMENT_REWARD, EXCHANGE_RATE } from '../core/config.js';
import { todayKey } from '../core/dates.js';
import { toast, chime, confetti } from '../ui/effects.js';
import { addWork } from '../core/island.js';

const KEYS = ['sun', 'water', 'star'];

// 포인트 획득: 지갑과 성장 점수가 함께 오른다.
export function gain(r = {}) {
  const s = ctx.state;
  const before = stageOf(plantXp(s));
  KEYS.forEach((k) => (s[k] += r[k] || 0));
  s.xp += xpOf(r);
  const after = stageOf(plantXp(s));
  // 나의 섬: 받은 성장 점수만큼 짓는 중인 건물이 올라간다
  const built = addWork(s, xpOf(r));
  if (built) {
    setTimeout(() => {
      toast(`🏝️ ${built.name} 완성! 섬에 가서 보세요`);
      chime('level');
      confetti([built.emoji, '✨', '🌿']);
    }, 700);
  }
  // 자랐으면 화면이 다시 그려질 때 축하 창을 띄운다 (app/render.js showCelebration)
  if (after > before) ctx.ui.celebrate = Math.max(ctx.ui.celebrate ?? -1, after);
}

// 기록 삭제·체크 해제로 받은 포인트를 되돌린다.
export function lose(r = {}) {
  const s = ctx.state;
  KEYS.forEach((k) => (s[k] = Math.max(0, s[k] - (r[k] || 0))));
  s.xp = Math.max(s.plant.startXp, s.xp - xpOf(r));
}

// 구매: 지갑만 줄고 성장 점수는 그대로.
export const canAfford = (cost) => KEYS.every((k) => ctx.state[k] >= (cost[k] || 0));
export function pay(cost) {
  KEYS.forEach((k) => (ctx.state[k] -= cost[k] || 0));
}

// 교환소: 물방울·별을 햇빛으로 바꾼다. 성장 점수는 그대로. 성공하면 true.
export function exchange(from, sunAmount) {
  const cost = sunAmount * (EXCHANGE_RATE[from] || Infinity);
  if (!(ctx.state[from] >= cost)) return false;
  ctx.state[from] -= cost;
  ctx.state.sun += sunAmount;
  return true;
}

// 업적을 확인해 보상을 주고 저장한다. 상태를 바꾼 뒤에는 commit 대신 이걸 부른다.
export function settle() {
  for (let i = 0; i < 3; i++) {
    const fresh = checkAchievements(ctx.state, todayKey());
    if (!fresh.length) break;
    fresh.forEach((a) => {
      gain(ACHIEVEMENT_REWARD);
      setTimeout(() => {
        toast(`업적 달성 · ${a.name}`);
        chime('level');
      }, 900);
    });
  }
  commit();
}
