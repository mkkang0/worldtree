// 업적 목록. 새 업적은 ACHIEVEMENTS에 한 줄 추가하면 된다.
import { WEEK_GOAL_MIN, CUP_GOAL } from './config.js';
import { streakOf, totalStudyMin } from './records.js';
import { DEFAULT_MISSIONS } from '../data/lists.js';
import { TREES } from '../data/trees.js';

const totalMin = (s) => s.log.reduce((a, e) => a + e.min, 0);
const maxZone = (s) => s.log.reduce((a, e) => Math.max(a, e.zone), 0);
const kinds = (s) => new Set(s.dex.map((d) => d.species)).size;

export const ACHIEVEMENTS = [
  // 운동
  { id: 'first', emoji: '☀️', name: '첫 햇살', desc: '운동을 처음 기록했어요', check: (s) => s.log.length >= 1 },
  { id: 'w10', emoji: '🔟', name: '열 번째 운동', desc: '운동 10번 기록', check: (s) => s.log.length >= 10 },
  { id: 'w50', emoji: '🏅', name: '뿌리 내린 습관', desc: '운동 50번 기록', check: (s) => s.log.length >= 50 },
  { id: 'min1000', emoji: '⏱️', name: '천 분의 땀방울', desc: '누적 운동 1,000분', check: (s) => totalMin(s) >= 1000 },
  { id: 'zone4', emoji: '🔥', name: '심장이 두근', desc: 'Zone 4 달성', check: (s) => maxZone(s) >= 4 },
  { id: 'zone5', emoji: '⚡', name: '한계 돌파', desc: 'Zone 5 달성', check: (s) => maxZone(s) >= 5 },
  // 공부
  { id: 'study1', emoji: '📖', name: '첫 공부', desc: '공부를 처음 기록했어요', check: (s) => s.study.sessions.length >= 1 },
  { id: 'study10h', emoji: '📚', name: '열 시간의 공부', desc: '누적 공부 10시간', check: (s) => totalStudyMin(s) >= 600 },
  { id: 'study50h', emoji: '🎓', name: '합격을 향해', desc: '누적 공부 50시간', check: (s) => totalStudyMin(s) >= 3000 },
  { id: 'focus5', emoji: '🧠', name: '완전 몰입', desc: '집중도 5로 60분 이상', check: (s) => s.study.sessions.some((x) => x.focus === 5 && x.min >= 60) },
  // 습관
  { id: 'streak7', emoji: '📅', name: '일주일 연속', desc: '7일 연속 활동', check: (s) => streakOf(s) >= 7 },
  { id: 'streak14', emoji: '🗓️', name: '보름 연속', desc: '14일 연속 활동', check: (s) => streakOf(s) >= 14 },
  {
    id: 'perfect',
    emoji: '🥗',
    name: '식단 완벽한 날',
    desc: '하루 기본 식단 미션 5개 모두 완료',
    check: (s) => Object.values(s.meals).some((m) => DEFAULT_MISSIONS.every((x) => m[x.id])),
  },
  { id: 'cups', emoji: '💧', name: '물 부자', desc: `하루 물 ${CUP_GOAL}잔 마시기`, check: (s) => Object.values(s.cups).some((n) => n >= CUP_GOAL) },
  { id: 'week', emoji: '🎯', name: '주간 목표 달성', desc: `한 주 ${WEEK_GOAL_MIN}분 달성`, check: (s) => s.weekClaims.length >= 1 },
  { id: 'week4', emoji: '🏆', name: '한 달의 꾸준함', desc: '주간 목표 4번 달성', check: (s) => s.weekClaims.length >= 4 },
  { id: 'quest', emoji: '📜', name: '퀘스트 달성', desc: '일일 퀘스트 보상 받기', check: (s) => Object.values(s.quests).some((q) => q.claimed?.length) },
  // 수집
  { id: 'grad', emoji: '🎓', name: '첫 번째 세계수', desc: '세계수를 완성해 숲에 심기', check: (s) => s.dex.length >= 1 },
  { id: 'dex4', emoji: '📖', name: '작은 숲', desc: '세계수 4종류 완성', check: (s) => kinds(s) >= 4 },
  { id: 'dexall', emoji: '📚', name: '세계수의 숲', desc: '모든 세계수 완성', check: (s) => kinds(s) >= TREES.length },
  { id: 'items10', emoji: '🛍️', name: '첫 장식', desc: '아이템 10개 보유', check: (s) => s.owned.length >= 10 },
  { id: 'items30', emoji: '👗', name: '풍경 수집가', desc: '아이템 30개 보유', check: (s) => s.owned.length >= 30 },
  { id: 'friend', emoji: '🤝', name: '함께라서 좋아', desc: '친구 코드 등록', check: (s) => s.friends.length >= 1 },
];

// 새로 달성한 업적을 기록하고 목록을 돌려준다.
export function checkAchievements(state, day) {
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (!state.achievements[a.id] && a.check(state)) {
      state.achievements[a.id] = day;
      fresh.push(a);
    }
  }
  return fresh;
}
