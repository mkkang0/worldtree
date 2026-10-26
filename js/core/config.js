// 밸런스 숫자 모음. 점수·가격 외의 게임 규칙 숫자는 모두 여기서 바꾼다.
// (아이템 가격은 data/items.js, 퀘스트 보상은 core/quests.js)

/* ---------- 성장 ---------- */

// 성장 점수(XP) = 받은 포인트 × 가중치. 운동이 성장의 중심이 되도록 식단·공부는 0.25.
// (운동 없이 공부를 매일 최대로 해도 꾸준히 운동하는 사람보다 빠르지 않은 값)
export const XP_WEIGHT = { sun: 1, water: 0.25, star: 0.25 };
// 꾸준히 운동하면 약 30일에 세계수 완성. 초반은 빠르게, 후반은 천천히.
export const STAGE_XP = [0, 40, 150, 350, 700, 1200, 2000];
export const STAGE_NAMES = ['씨앗', '새싹', '묘목', '어린 나무', '큰 나무', '신목', '세계수'];
export const JOURNEY_DAYS = 30; // 화면에 보여주는 여정 길이 (안내용)

/* ---------- 운동 (햇빛 ☀️) ---------- */

export const DAILY_SUN_CAP = 120;
// Zone 0~5의 운동 1분당 햇빛
export const ZONE_WEIGHTS = [0.3, 0.5, 1, 1.5, 2, 2.5];
export const ZONE_LABELS = ['가벼운 움직임', 'Zone 1 · 워밍업', 'Zone 2 · 지방 연소', 'Zone 3 · 유산소', 'Zone 4 · 고강도', 'Zone 5 · 최대'];
export const WORKOUT_MIN_RANGE = [1, 600];
export const HR_RANGE = [40, 230];
export const BACKDATE_DAYS = 7; // 며칠 전 기록까지 입력 허용

/* ---------- 식단 (물방울 💧) ---------- */

export const MISSION_WATER = 6;
export const MISSION_REWARD_LIMIT = 5; // 하루에 보상을 주는 미션 수 (커스텀 미션을 늘려도 이 이상은 안 받음)
export const MAX_CUSTOM_MISSIONS = 8;
export const CUP_GOAL = 8;
export const CUP_BONUS = 4;

/* ---------- 공부 (별 ⭐) ---------- */

// 집중도 1~5의 공부 1분당 별 (index 0은 쓰지 않음)
export const FOCUS_WEIGHTS = [0, 0.2, 0.4, 0.6, 0.8, 1];
export const DAILY_STAR_CAP = 150;
export const STUDY_MIN_RANGE = [1, 360];

/* ---------- 돌보기 · 목표 · 업적 ---------- */

export const CARE_REWARD = 2;
export const WEEK_GOAL_MIN = 150;
export const WEEK_REWARD = { sun: 50, water: 20 };
export const ACHIEVEMENT_REWARD = { sun: 5, water: 5 };

/* ---------- 교환소 (상점) ---------- */

// 햇빛 1을 받는 데 드는 양. 한 방향(→ 햇빛)만 가능하고 성장 점수는 늘지 않는다.
export const EXCHANGE_RATE = { water: 3, star: 3 };
export const EXCHANGE_BUNDLES = [5, 20]; // 한 번에 받을 햇빛 묶음

/* ---------- 함께하기 ---------- */

export const GIFT_MAX = 30;
export const MAX_FRIENDS = 5;
