// 업적 목록. 새 업적은 ACHIEVEMENTS에 한 줄 추가하면 된다.
import { WEEK_GOAL_MIN, CUP_GOAL } from './config.js';
import { streakOf, totalStudyMin, studyBySubject } from './records.js';
import { DEFAULT_MISSIONS } from '../data/lists.js';
import { TREES } from '../data/trees.js';
import { KANA_GROUPS, toKatakana } from '../data/kana.js';
import { builtCount, hasLevel } from './island.js';

const totalMin = (s) => s.log.reduce((a, e) => a + e.min, 0);
const maxZone = (s) => s.log.reduce((a, e) => Math.max(a, e.zone), 0);
const kinds = (s) => new Set(s.dex.map((d) => d.species)).size;
// 기본 46자를 모두 익혔는지 (3번 이상 · 80% 이상 정답)
const kanaDone = (s, p) =>
  KANA_GROUPS[0].rows.every(([h]) => {
    const [ok = 0, ng = 0] = s.kana.stats[`${p}:${p === 'k' ? toKatakana(h) : h}`] || [];
    return ok + ng >= 3 && ok / (ok + ng) >= 0.8;
  });
// 10시간 이상 공부한 과목 수 (전체 기간)
const deepSubjects = (s) => studyBySubject(s, 100000).filter(([, min]) => min >= 600).length;
// 과목 하루 목표를 채운 날 수 (날짜 × 과목)
function goalDays(s) {
  const goals = Object.fromEntries(s.study.subjects.filter((x) => x.goal > 0).map((x) => [x.id, x.goal]));
  const sums = {};
  s.study.sessions.forEach((x) => {
    if (goals[x.subject]) sums[x.date + x.subject] = (sums[x.date + x.subject] || 0) + x.min;
  });
  return Object.entries(sums).filter(([k, min]) => min >= goals[k.slice(10)]).length;
}

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
  { id: 'study100h', emoji: '🏛️', name: '백 시간의 탑', desc: '누적 공부 100시간', check: (s) => totalStudyMin(s) >= 6000 },
  { id: 'subjects2', emoji: '🌏', name: '두 과목 탐험가', desc: '두 과목을 각각 10시간 이상', check: (s) => deepSubjects(s) >= 2 },
  { id: 'goal7', emoji: '🎯', name: '목표 지킴이', desc: '과목 하루 목표를 7번 채우기', check: (s) => goalDays(s) >= 7 },
  // 나의 섬
  { id: 'island1', emoji: '🏠', name: '첫 건물', desc: '섬에 건물 하나 완성', check: (s) => builtCount(s) >= 1 },
  { id: 'island4', emoji: '🏘️', name: '섬마을', desc: '섬에 건물 4개 완성', check: (s) => builtCount(s) >= 4 },
  { id: 'resident1', emoji: '🧚', name: '첫 이웃', desc: '섬에 주민이 이사 오기', check: (s) => Object.keys(s.island.residents).length >= 1 },
  { id: 'resident8', emoji: '🎎', name: '북적이는 섬', desc: '주민 8명 모두 이사 오기', check: (s) => Object.keys(s.island.residents).length >= 8 },
  { id: 'level3', emoji: '🌟', name: '최고의 건물', desc: '건물 하나를 Lv.3으로', check: (s) => hasLevel(s, 3) },
  { id: 'isle2', emoji: '🌉', name: '두 번째 섬', desc: '세계수를 완성해 새 섬 만들기', check: (s) => s.island.isles.length >= 1 },
  { id: 'isle4', emoji: '🗺️', name: '군도', desc: '섬 4개 잇기', check: (s) => s.island.isles.length >= 3 },
  { id: 'nation', emoji: '👑', name: '섬나라', desc: '섬 8개와 건물 40개', check: (s) => s.island.isles.length >= 7 && builtCount(s) >= 40 },
  { id: 'island8', emoji: '🏝️', name: '꽉 찬 섬', desc: '본섬의 자리 8곳을 모두 채우기', check: (s) => s.island.lots.filter((l) => l && l.done).length >= 8 },
  // 미니게임
  { id: 'kana1', emoji: '🎌', name: '가나 첫걸음', desc: '가나 퀴즈 한 판', check: (s) => s.kana.plays >= 1 },
  { id: 'kana-perfect', emoji: '💮', name: '꽃동그라미', desc: '가나 퀴즈 만점', check: (s) => s.kana.perfect >= 1 },
  { id: 'hira-master', emoji: '🌸', name: '히라가나 익힘', desc: '히라가나 46자 모두 익힘', check: (s) => kanaDone(s, 'h') },
  { id: 'kata-master', emoji: '🗻', name: '가타카나 익힘', desc: '가타카나 46자 모두 익힘', check: (s) => kanaDone(s, 'k') },
  // 습관
  { id: 'streak7', emoji: '📅', name: '일주일 연속', desc: '7일 연속 활동', check: (s) => streakOf(s) >= 7 },
  { id: 'streak14', emoji: '🗓️', name: '보름 연속', desc: '14일 연속 활동', check: (s) => streakOf(s) >= 14 },
  { id: 'streak21', emoji: '🌳', name: '21일의 여정', desc: '21일 연속 활동', check: (s) => streakOf(s) >= 21 },
  {
    id: 'perfect',
    emoji: '🥗',
    name: '식단 완벽한 날',
    desc: '하루 기본 식단 미션 5개 모두 완료',
    check: (s) => Object.values(s.meals).some((m) => DEFAULT_MISSIONS.every((x) => m[x.id])),
  },
  { id: 'cups', emoji: '💧', name: '물 부자', desc: `하루 물 ${CUP_GOAL}잔 마시기`, check: (s) => Object.values(s.cups).some((n) => n >= CUP_GOAL) },
  { id: 'cups7', emoji: '🌊', name: '맑은 샘', desc: `물 ${CUP_GOAL}잔을 7일 채우기`, check: (s) => Object.values(s.cups).filter((n) => n >= CUP_GOAL).length >= 7 },
  { id: 'week', emoji: '🎯', name: '주간 목표 달성', desc: `한 주 ${WEEK_GOAL_MIN}분 달성`, check: (s) => s.weekClaims.length >= 1 },
  { id: 'week4', emoji: '🏆', name: '한 달의 꾸준함', desc: '주간 목표 4번 달성', check: (s) => s.weekClaims.length >= 4 },
  { id: 'quest', emoji: '📜', name: '퀘스트 달성', desc: '일일 퀘스트 보상 받기', check: (s) => Object.values(s.quests).some((q) => q.claimed?.length) },
  // 수집
  { id: 'grad', emoji: '🎓', name: '첫 번째 세계수', desc: '세계수를 완성해 숲에 심기', check: (s) => s.dex.length >= 1 },
  { id: 'dex4', emoji: '📖', name: '작은 숲', desc: '세계수 4종류 완성', check: (s) => kinds(s) >= 4 },
  { id: 'dexall', emoji: '📚', name: '세계수의 숲', desc: '모든 세계수 완성', check: (s) => kinds(s) >= TREES.length },
  { id: 'items10', emoji: '🛍️', name: '첫 장식', desc: '아이템 10개 보유', check: (s) => s.owned.length >= 10 },
  { id: 'items30', emoji: '👗', name: '풍경 수집가', desc: '아이템 30개 보유', check: (s) => s.owned.length >= 30 },
  { id: 'items50', emoji: '🏰', name: '세계수 박물관', desc: '아이템 50개 보유', check: (s) => s.owned.length >= 50 },
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
