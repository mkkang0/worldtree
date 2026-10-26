// 일일 퀘스트와 주간 목표. 보상 지급은 app/wallet.js가 한다.
import { WEEK_GOAL_MIN, WEEK_REWARD } from './config.js';
import { logsOn, minutesOn, missionsDone, sessionsOn, studyMinOn, weekSummary } from './records.js';

const minWhere = (list, f) => list.filter(f).reduce((a, e) => a + e.min, 0);

// study: true 인 퀘스트는 공부 기능을 켠 사람에게만 나온다.
const POOL = [
  { id: 'move20', emoji: '🚶', label: '오늘 20분 움직이기', goal: 20, reward: { sun: 10 }, cur: (s, d) => minutesOn(s, d) },
  { id: 'move40', emoji: '🏃', label: '오늘 40분 움직이기', goal: 40, reward: { sun: 18 }, cur: (s, d) => minutesOn(s, d) },
  { id: 'zone3', emoji: '💓', label: 'Zone 3 이상으로 10분', goal: 10, reward: { sun: 15 }, cur: (s, d) => minWhere(logsOn(s, d), (e) => e.zone >= 3) },
  { id: 'types2', emoji: '🎯', label: '운동 2종류 해보기', goal: 2, reward: { sun: 12 }, cur: (s, d) => new Set(logsOn(s, d).map((e) => e.type)).size },
  { id: 'stretch', emoji: '🧘', label: '요가·스트레칭 10분', goal: 10, reward: { sun: 8 }, cur: (s, d) => minWhere(logsOn(s, d), (e) => e.type === 'yoga') },
  { id: 'meals3', emoji: '🥗', label: '식단 미션 3개 하기', goal: 3, reward: { water: 10 }, cur: (s, d) => missionsDone(s, d) },
  { id: 'cups6', emoji: '🥤', label: '물 6잔 마시기', goal: 6, reward: { water: 8 }, cur: (s, d) => s.cups[d] || 0 },
  { id: 'care', emoji: '💚', label: '세계수 돌보기 (이슬 + 햇살)', goal: 2, reward: { sun: 4, water: 4 }, cur: (s, d) => Object.values(s.care[d] || {}).filter(Boolean).length },
  { id: 'study30', emoji: '📚', label: '공부 30분 하기', goal: 30, reward: { star: 10 }, study: true, cur: (s, d) => studyMinOn(s, d) },
  { id: 'focus4', emoji: '🧠', label: '집중도 4 이상으로 25분', goal: 25, reward: { star: 12 }, study: true, cur: (s, d) => minWhere(sessionsOn(s, d), (e) => e.focus >= 4) },
  { id: 'study2', emoji: '✍️', label: '공부 2번 나눠서 하기', goal: 2, reward: { star: 8 }, study: true, cur: (s, d) => sessionsOn(s, d).length },
];

function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// 날짜마다 같은 3개가 나온다.
export function questsFor(state, day) {
  const rand = seeded('quest-' + day);
  const pool = POOL.filter((q) => !q.study || state.settings.studyEnabled);
  const picks = [];
  while (picks.length < 3) picks.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  const claimed = state.quests[day]?.claimed || [];
  return picks.map((q) => {
    const cur = Math.min(q.goal, q.cur(state, day));
    return { ...q, cur, done: cur >= q.goal, claimed: claimed.includes(q.id) };
  });
}

export function claimQuest(state, day, id) {
  const q = questsFor(state, day).find((x) => x.id === id);
  if (!q || !q.done || q.claimed) return null;
  const entry = (state.quests[day] = state.quests[day] || { claimed: [] });
  entry.claimed.push(id);
  return q.reward;
}

export function weekGoal(state, day) {
  const w = weekSummary(state, day);
  return { ...w, goal: WEEK_GOAL_MIN, done: w.min >= WEEK_GOAL_MIN, claimed: state.weekClaims.includes(w.start) };
}

export function claimWeek(state, day) {
  const g = weekGoal(state, day);
  if (!g.done || g.claimed) return null;
  state.weekClaims.push(g.start);
  return WEEK_REWARD;
}
