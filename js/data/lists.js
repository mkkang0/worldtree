// 화면에 나오는 선택지 목록. 항목을 추가·수정하면 바로 반영된다.

export const ACTIVITIES = [
  { id: 'walk', emoji: '🚶', label: '걷기' },
  { id: 'run', emoji: '🏃', label: '러닝' },
  { id: 'bike', emoji: '🚴', label: '자전거' },
  { id: 'strength', emoji: '🏋️', label: '근력' },
  { id: 'yoga', emoji: '🧘', label: '요가·스트레칭' },
  { id: 'swim', emoji: '🏊', label: '수영' },
  { id: 'dance', emoji: '💃', label: '댄스' },
  { id: 'etc', emoji: '✨', label: '기타' },
];

export const MOODS = [
  { id: 'great', emoji: '😆', label: '최고' },
  { id: 'good', emoji: '🙂', label: '좋음' },
  { id: 'tired', emoji: '😮‍💨', label: '지침' },
  { id: 'sore', emoji: '🥵', label: '힘듦' },
];

// 심박을 모를 때 체감 강도 → Zone
export const INTENSITIES = [
  { value: 1, zone: 1, label: '1 · 아주 가벼움' },
  { value: 2, zone: 2, label: '2 · 편하게 대화 가능' },
  { value: 3, zone: 3, label: '3 · 숨이 약간 참' },
  { value: 4, zone: 4, label: '4 · 힘듦' },
  { value: 5, zone: 5, label: '5 · 최대한 힘듦' },
];

export const DEFAULT_MISSIONS = [
  { id: 'water', emoji: '🥤', label: '물 2L 마시기' },
  { id: 'nosnack', emoji: '🙅', label: '하루 동안 간식 안 먹기' },
  { id: 'dinner', emoji: '🥗', label: '건강한 저녁 먹기' },
  { id: 'stretch', emoji: '🧘', label: '스트레칭 10분' },
  { id: 'sleep', emoji: '🌙', label: '7시간 이상 자기' },
];

// 공부 과목 기본값. 실제 과목 목록은 저장 데이터(state.study.subjects)에 있고, 공부 탭에서 추가·수정·삭제한다.
// goal: 하루 목표(분, 0이면 없음) / examName·examDate: 과목별 시험 (D-day)
export const DEFAULT_SUBJECTS = [
  { id: 'japanese', emoji: '🇯🇵', label: '일본어', goal: 0, examName: '', examDate: '' },
  { id: 'chinese', emoji: '🇨🇳', label: '중국어', goal: 0, examName: '', examDate: '' },
];

// 과목을 고를 때 쓰는 이모지 보기
export const SUBJECT_EMOJIS = ['🇯🇵', '🇨🇳', '🇺🇸', '🇬🇧', '🇪🇸', '🇫🇷', '🇩🇪', '🇰🇷', '📘', '📗', '📕', '📙', '🧮', '💻', '🎹', '✏️'];

// 지운 과목이나 예전 과목으로 남은 기록을 보여줄 때
const PAST_SUBJECT = { emoji: '📦', label: '지난 과목' };

// 기록에 적힌 과목 id → 과목 정보 (숨긴 과목도 이름은 그대로 보여준다)
export function subjectOf(subjects, id) {
  return subjects.find((s) => s.id === id) || { id, ...PAST_SUBJECT };
}

// 공부 탭에서 고를 수 있는 과목 (지운 과목 제외)
export const activeSubjects = (state) => state.study.subjects.filter((s) => !s.hidden);

export const FOCUS_LEVELS = [
  { value: 1, emoji: '😵', label: '딴짓이 많았어요' },
  { value: 2, emoji: '😶', label: '자주 끊겼어요' },
  { value: 3, emoji: '🙂', label: '보통이에요' },
  { value: 4, emoji: '😤', label: '집중 잘 됐어요' },
  { value: 5, emoji: '🔥', label: '완전 몰입했어요' },
];

export const byId = (list, id) => list.find((x) => x.id === id) || list[list.length - 1];
