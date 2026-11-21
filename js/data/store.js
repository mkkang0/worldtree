// 저장·불러오기. 저장 형식을 바꾸면 defaultState와 sanitize를 함께 고친다.
// sanitize는 예전 버전 데이터나 손상된 백업도 안전한 값으로 바꿔준다.
import { SLOTS, itemById } from './items/index.js';
import { TREES } from './trees.js';
import { DEFAULT_SUBJECTS } from './lists.js';
import { todayKey } from '../core/dates.js';

const KEY = 'sprout-diary-v1'; // 이름이 바뀌어도 예전 데이터를 이어 쓰기 위해 그대로 둔다

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const SLOT_IDS = SLOTS.map((s) => s.id);
export const DEFAULT_SPIRIT_NAME = '루미';
const isTree = (id) => TREES.some((t) => t.id === id);

export function defaultState() {
  return {
    version: 5,
    me: newId(),
    onboarded: false,
    settings: { age: 30, name: DEFAULT_SPIRIT_NAME, restHr: 0, sound: true, bigText: false, cheer: '', studyEnabled: false, examDate: '', appearance: 'auto' }, // examDate: 'YYYY-MM-DD' 또는 '' / appearance: auto·light·dark
    // 지갑과 성장
    xp: 0,
    sun: 0, // 햇살 (운동)
    water: 0, // 이슬 (식단)
    star: 0, // 별빛 (공부)
    plant: { species: TREES[0].id, startXp: 0, startDate: todayKey() }, // 지금 키우는 세계수
    dex: [], // 숲에 심은(완성한) 세계수 { species, name, date }
    // 꾸미기
    owned: [],
    equipped: Object.fromEntries(SLOT_IDS.map((s) => [s, null])),
    // 기록
    log: [], // 운동 { id, date, type, min, hr, zone, points, earned, mood, note }
    study: { timer: null, sessions: [], subjects: DEFAULT_SUBJECTS.map((x) => ({ ...x })) },
    // timer: { start: 시작 시각(ms), subject } / sessions: { id, date, subject, min, focus, stars, note }
    // subjects: { id, emoji, label, goal, examName, examDate, hidden } — hidden은 지운 과목 (지난 기록의 이름을 남기려고 둔다)
    meals: {}, // { 'YYYY-MM-DD': { missionId: true } }
    cups: {}, // { 'YYYY-MM-DD': 물 잔 수 }
    care: {}, // { 'YYYY-MM-DD': { water, sun } }
    customMissions: [], // { id, emoji, label }
    // 목표·업적
    quests: {}, // { 'YYYY-MM-DD': { claimed: [questId] } }
    weekClaims: [], // 보상 받은 주 시작일
    achievements: {}, // { id: 'YYYY-MM-DD' }
    // 함께하기
    friends: [], // { id, name, species, stage, weekMin, weekSun, studyMin, streak, cheer, updated }
    redeemed: [], // 받은 선물 코드 id
    sentGifts: [], // 내가 만든 선물 코드 id
  };
}

const str = (v, d, max = 40) => (typeof v === 'string' ? v.slice(0, max) : d);
const num = (v, d) => (Number.isFinite(v) ? v : d);
const clampNum = (v, d, lo, hi) => Math.min(hi, Math.max(lo, num(v, d)));
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const arr = (v) => (Array.isArray(v) ? v : []);
const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const strs = (v, max = 200) => arr(v).filter((x) => typeof x === 'string').slice(-max);

function sanitize(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const s = { ...base };

  s.me = str(raw.me, base.me) || base.me;
  s.onboarded = raw.onboarded === true || (raw.onboarded === undefined && arr(raw.log).length > 0);
  const st = obj(raw.settings);
  s.settings = {
    age: clampNum(st.age, 30, 10, 90),
    name: str(st.name, DEFAULT_SPIRIT_NAME, 10).trim() || DEFAULT_SPIRIT_NAME,
    restHr: clampNum(st.restHr, 0, 0, 120),
    sound: st.sound !== false,
    bigText: st.bigText === true,
    cheer: str(st.cheer, '', 30),
    studyEnabled: st.studyEnabled === true,
    examDate: isDate(st.examDate) ? st.examDate : '',
    appearance: ['light', 'dark'].includes(st.appearance) ? st.appearance : 'auto',
  };

  s.xp = Math.max(0, num(raw.xp, 0));
  s.sun = Math.max(0, num(raw.sun, 0));
  s.water = Math.max(0, num(raw.water, 0));
  s.star = Math.max(0, num(raw.star, 0));
  // 예전 새싹 종류(sprout 등)는 첫 세계수로 바꾼다
  const plantId = str(raw.plant?.species, '', 20);
  s.plant = {
    species: isTree(plantId) ? plantId : TREES[0].id,
    startXp: clampNum(raw.plant?.startXp, 0, 0, s.xp),
    startDate: isDate(raw.plant?.startDate) ? raw.plant.startDate : todayKey(),
  };
  s.dex = arr(raw.dex)
    .filter((d) => d && isTree(d.species))
    .map((d) => ({ species: d.species, name: str(d.name, DEFAULT_SPIRIT_NAME, 10), date: str(d.date, '', 10) }));

  // 지금 목록에 없는 아이템(예전 화분·모자 등)은 정리한다
  s.owned = strs(raw.owned, 500).filter((id) => itemById(id));
  s.equipped = { ...base.equipped };
  for (const slot of SLOT_IDS) {
    const id = raw.equipped?.[slot];
    if (typeof id === 'string' && s.owned.includes(id)) s.equipped[slot] = id;
  }

  s.log = arr(raw.log)
    .filter((e) => e && typeof e.date === 'string')
    .map((e) => ({
      id: str(e.id, newId(), 30),
      date: e.date,
      type: str(e.type, 'etc', 12),
      min: num(e.min, 0),
      hr: e.hr == null ? null : num(e.hr, null),
      zone: clampNum(e.zone, 0, 0, 5),
      points: num(e.points, 0),
      earned: num(e.earned, 0),
      mood: str(e.mood, '', 8),
      note: str(e.note, '', 80),
    }));

  const study = obj(raw.study);
  // 과목 목록이 없던 예전 데이터(회계 과목 고정)는 기본 과목으로 시작한다. 예전 기록은 '지난 과목'으로 남는다.
  const subjects = arr(study.subjects)
    .filter((x) => x && typeof x.id === 'string' && typeof x.label === 'string' && x.label.trim())
    .slice(0, 40)
    .map((x) => ({
      id: str(x.id, newId(), 30),
      emoji: str(x.emoji, '📘', 8) || '📘',
      label: str(x.label, '', 12).trim(),
      goal: clampNum(x.goal, 0, 0, 600),
      examName: str(x.examName, '', 12),
      examDate: isDate(x.examDate) ? x.examDate : '',
      hidden: x.hidden === true,
    }));
  s.study = {
    subjects: subjects.some((x) => !x.hidden) ? subjects : [...subjects, ...base.study.subjects.filter((d) => !subjects.some((x) => x.id === d.id))],
    timer: Number.isFinite(study.timer?.start) ? { start: study.timer.start, subject: str(study.timer.subject, '', 30) } : null,
    sessions: arr(study.sessions)
      .filter((x) => x && typeof x.date === 'string')
      .map((x) => ({
        id: str(x.id, newId(), 30),
        date: x.date,
        subject: str(x.subject, 'etc', 30),
        min: num(x.min, 0),
        focus: clampNum(x.focus, 3, 1, 5),
        stars: num(x.stars, 0),
        note: str(x.note, '', 80),
      })),
  };

  s.meals = obj(raw.meals);
  s.cups = obj(raw.cups);
  s.care = obj(raw.care);
  s.customMissions = arr(raw.customMissions)
    .filter((m) => m && typeof m.id === 'string' && typeof m.label === 'string' && m.label.trim()) // 이름이 빈 미션(예전 버그)은 정리한다
    .slice(0, 8)
    .map((m) => ({ id: str(m.id, newId(), 30), emoji: str(m.emoji, '✅', 4), label: str(m.label, '', 20) }));

  s.quests = obj(raw.quests);
  s.weekClaims = strs(raw.weekClaims, 1000);
  s.achievements = obj(raw.achievements);

  s.friends = arr(raw.friends)
    .filter((f) => f && typeof f.id === 'string')
    .slice(0, 5)
    .map((f) => ({
      id: str(f.id, '', 40),
      name: str(f.name, '친구', 10),
      species: str(f.species, 'sprout', 20),
      stage: clampNum(f.stage, 0, 0, 6),
      weekMin: Math.max(0, num(f.weekMin, 0)),
      weekSun: Math.max(0, num(f.weekSun, 0)),
      studyMin: Math.max(0, num(f.studyMin, 0)),
      streak: Math.max(0, num(f.streak, 0)),
      cheer: str(f.cheer, '', 30),
      updated: str(f.updated, '', 10),
    }));
  s.redeemed = strs(raw.redeemed);
  s.sentGifts = strs(raw.sentGifts);
  return s;
}

export function load() {
  try {
    const text = localStorage.getItem(KEY);
    return sanitize(text ? JSON.parse(text) : null);
  } catch {
    return defaultState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export const exportJson = (state) => JSON.stringify(state, null, 2);
export const importJson = (text) => sanitize(JSON.parse(text));
