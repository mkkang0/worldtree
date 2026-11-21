// 저장·불러오기. 저장 형식을 바꾸면 defaultState와 sanitize를 함께 고친다.
// sanitize는 예전 버전 데이터나 손상된 백업도 안전한 값으로 바꿔준다.
import { SLOTS, HUES, itemById } from './items/index.js';
import { TREES } from './trees.js';
import { DEFAULT_SUBJECTS } from './lists.js';
import { buildingById } from './buildings.js';
import { isleName, EMBLEMS } from './isles.js';
import { vocabByWord } from './vocab-n3.js';
import { todayKey } from '../core/dates.js';

const KEY = 'sprout-diary-v1'; // 이름이 바뀌어도 예전 데이터를 이어 쓰기 위해 그대로 둔다

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const SLOT_IDS = SLOTS.map((s) => s.id);
export const emptyEquipped = () => Object.fromEntries(SLOTS.map((s) => [s.id, s.multi ? [] : null]));

// 장착 상태를 정리한다: 가진 아이템만, 슬롯에 맞는 아이템만, 여러 개 놓는 슬롯은 배열로 (예전 데이터는 문자열 하나)
export function cleanEquipped(raw, owned) {
  const out = emptyEquipped();
  for (const slot of SLOTS) {
    const v = raw?.[slot.id];
    const ids = (Array.isArray(v) ? v : [v]).filter((id) => typeof id === 'string' && owned.includes(id) && itemById(id)?.slot === slot.id);
    out[slot.id] = slot.multi ? [...new Set(ids)].slice(0, slot.multi) : ids[0] || null;
  }
  return out;
}

// 아이템별 꾸미기(위치 · 색)를 정리한다
export function cleanCustom(raw, owned) {
  const out = {};
  for (const [id, v] of Object.entries(raw && typeof raw === 'object' ? raw : {})) {
    const item = itemById(id);
    if (!item || !owned.includes(id) || !v || typeof v !== 'object') continue;
    const slot = SLOTS.find((s) => s.id === item.slot);
    const c = {};
    if (slot.positions?.some(([p]) => p === v.pos)) c.pos = v.pos;
    if (slot.tint && Number.isInteger(v.hue) && v.hue > 0 && v.hue < HUES.length) c.hue = v.hue;
    if (Object.keys(c).length) out[id] = c;
  }
  return out;
}
export const DEFAULT_SPIRIT_NAME = '루미';
const isTree = (id) => TREES.some((t) => t.id === id);

export function defaultState() {
  return {
    version: 6,
    me: newId(),
    onboarded: false,
    settings: { age: 30, name: DEFAULT_SPIRIT_NAME, restHr: 0, sound: true, bigText: false, cheer: '', studyEnabled: false, examDate: '', appearance: 'auto', lastBackup: '' }, // examDate: 'YYYY-MM-DD' 또는 '' / appearance: auto·light·dark
    // 지갑과 성장
    xp: 0,
    sun: 0, // 햇살 (운동)
    water: 0, // 이슬 (식단)
    star: 0, // 별빛 (공부)
    plant: { species: TREES[0].id, startXp: 0, startDate: todayKey() }, // 지금 키우는 세계수
    dex: [], // 숲에 심은(완성한) 세계수 { species, name, date }
    // 꾸미기
    owned: [],
    equipped: emptyEquipped(), // 슬롯마다 아이템 id (여러 개 놓는 슬롯은 id 배열)
    custom: {}, // 아이템마다 꾸미기 { itemId: { pos: 'left'|'tree'|'right', hue: 0~3 } }
    outfits: [null, null, null], // 저장한 코디 { equipped, custom, date }
    // 기록
    log: [], // 운동 { id, date, type, min, hr, zone, points, earned, mood, note }
    study: { timer: null, sessions: [], subjects: DEFAULT_SUBJECTS.map((x) => ({ ...x })), mode: 'free' }, // mode: 타이머 종류 (core/pomodoro.js)
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
    // 나의 섬: 건물 자리 8곳 (features/island.js, core/island.js)
    island: { lots: Array(8).fill(null), residents: {}, giftDay: '', isles: [], req: { date: '', done: [] }, hearts: {}, nation: { name: '', emblem: '' } },
    // isles: 완성한 세계수마다 생기는 새 섬 { species, name, date, lots }
    // req: 오늘 들어준 주민 부탁, hearts: 주민마다 우정 하트 0~5, nation: 섬이 2개부터 정하는 나라 이름 · 문장
    festivals: {}, // 계절 축제 선물 받은 기록 { 'autumn-2026': 'YYYY-MM-DD' } (core/festivals.js)
    // 미니게임: 가나 퀴즈 (features/games.js)
    kana: { stats: {}, plays: 0, best: 0, perfect: 0, day: null, prefs: { script: 'hira', groups: ['basic'], dir: 'both', count: 10 } },
    // 단어 퀴즈 (features/vocab.js): cards[단어] = [칸 0~5, 다음 복습일, 맞힘, 틀림] (core/vocab.js)
    vocab: { cards: {}, plays: 0, best: 0, perfect: 0, day: null, prefs: { dir: 'mix', tag: 'all', count: 10 } },
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
    lastBackup: isDate(st.lastBackup) ? st.lastBackup : '',
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
  s.equipped = cleanEquipped(raw.equipped, s.owned);
  s.custom = cleanCustom(raw.custom, s.owned);
  s.outfits = [0, 1, 2].map((i) => {
    const o = arr(raw.outfits)[i];
    return o && typeof o === 'object' ? { equipped: cleanEquipped(o.equipped, s.owned), custom: cleanCustom(o.custom, s.owned), date: str(o.date, '', 10) } : null;
  });

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
    timer: Number.isFinite(study.timer?.start)
      ? {
          start: study.timer.start,
          subject: str(study.timer.subject, '', 30),
          ...(study.timer.focus > 0 ? { focus: clampNum(study.timer.focus, 25, 5, 120), brk: clampNum(study.timer.brk, 5, 1, 60) } : {}),
        }
      : null,
    mode: ['free', '25-5', '50-10'].includes(study.mode) ? study.mode : 'free',
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
      isles: clampNum(f.isles, 0, 0, 9), // 예전 코드에는 섬 정보가 없다 (0이면 보여주지 않는다)
      buildings: clampNum(f.buildings, 0, 0, 72),
      residents: clampNum(f.residents, 0, 0, 8),
      nation: str(f.nation, '', 12),
      emblem: str(f.emblem, '', 4),
    }));
  const cleanLots = (lots) =>
    Array.from({ length: 8 }, (_, i) => {
      const l = arr(lots)[i];
      if (!l || typeof l !== 'object' || !buildingById(l.b)) return null;
      return { b: l.b, lv: clampNum(l.lv, 1, 1, 3), done: l.done === true, progress: Math.max(0, num(l.progress, 0)), ...(isDate(l.date) ? { date: l.date } : {}) };
    });
  const isles = arr(obj(raw.island).isles)
    .filter((x) => x && isTree(x.species))
    .slice(0, s.dex.length)
    .map((x) => ({ species: x.species, name: str(x.name, '', 16) || isleName(x.species), date: isDate(x.date) ? x.date : todayKey(), lots: cleanLots(x.lots) }));
  // 숲에 심은 세계수인데 섬이 없으면 만들어 준다 (3단계 이전 데이터)
  while (isles.length < s.dex.length) {
    const d = s.dex[isles.length];
    isles.push({ species: d.species, name: isleName(d.species, isles), date: isDate(d.date) ? d.date : todayKey(), lots: cleanLots([]) });
  }
  s.island = {
    lots: cleanLots(obj(raw.island).lots),
    isles,
    residents: Object.fromEntries(Object.entries(obj(obj(raw.island).residents)).filter(([k, v]) => /^[a-z]{2,10}$/.test(k) && isDate(v))),
    giftDay: isDate(obj(raw.island).giftDay) ? raw.island.giftDay : '',
    req: (() => {
      const r = obj(obj(raw.island).req);
      return isDate(r.date) ? { date: r.date, done: strs(r.done, 8) } : { date: '', done: [] };
    })(),
    hearts: Object.fromEntries(Object.entries(obj(obj(raw.island).hearts)).filter(([k, v]) => /^[a-z]{2,10}$/.test(k) && Number.isFinite(v)).map(([k, v]) => [k, clampNum(v, 0, 0, 5)])),
    nation: (() => {
      const x = obj(obj(raw.island).nation);
      return { name: str(x.name, '', 12).trim(), emblem: EMBLEMS.includes(x.emblem) ? x.emblem : '' };
    })(),
  };
  // 짓는 중인 건물은 모든 섬을 통틀어 하나만
  let busy = false;
  [s.island.lots, ...s.island.isles.map((x) => x.lots)].forEach((lots) =>
    lots.forEach((l, i) => {
      if (l && !l.done) {
        if (busy) lots[i] = l.lv > 1 ? { ...l, lv: l.lv - 1, done: true } : null;
        busy = true;
      }
    })
  );
  const kana = obj(raw.kana);
  const prefs = obj(kana.prefs);
  const groups = strs(prefs.groups, 5).filter((g) => ['basic', 'voiced', 'combo'].includes(g));
  s.kana = {
    stats: Object.fromEntries(
      Object.entries(obj(kana.stats))
        .filter(([k, v]) => /^[hk]:/.test(k) && Array.isArray(v))
        .map(([k, v]) => [k.slice(0, 6), [Math.max(0, num(v[0], 0)), Math.max(0, num(v[1], 0))]])
    ),
    plays: Math.max(0, num(kana.plays, 0)),
    best: Math.max(0, num(kana.best, 0)),
    perfect: Math.max(0, num(kana.perfect, 0)),
    day: kana.day && isDate(kana.day.date) ? { date: kana.day.date, stars: Math.max(0, num(kana.day.stars, 0)), plays: Math.max(0, num(kana.day.plays, 0)) } : null,
    prefs: {
      script: ['hira', 'kata', 'mix'].includes(prefs.script) ? prefs.script : 'hira',
      groups: groups.length ? groups : ['basic'],
      dir: ['read', 'write', 'both'].includes(prefs.dir) ? prefs.dir : 'both',
      count: prefs.count === 20 ? 20 : 10,
    },
  };
  const vocab = obj(raw.vocab);
  const vp = obj(vocab.prefs);
  s.vocab = {
    cards: Object.fromEntries(
      Object.entries(obj(vocab.cards))
        .filter(([k, v]) => vocabByWord[k] && Array.isArray(v) && isDate(v[1]))
        .map(([k, v]) => [k, [clampNum(v[0], 0, 0, 5), v[1], Math.max(0, num(v[2], 0)), Math.max(0, num(v[3], 0))]])
    ),
    plays: Math.max(0, num(vocab.plays, 0)),
    best: Math.max(0, num(vocab.best, 0)),
    perfect: Math.max(0, num(vocab.perfect, 0)),
    day: vocab.day && isDate(vocab.day.date) ? { date: vocab.day.date, stars: Math.max(0, num(vocab.day.stars, 0)), plays: Math.max(0, num(vocab.day.plays, 0)) } : null,
    prefs: {
      dir: ['mean', 'read', 'word', 'mix'].includes(vp.dir) ? vp.dir : 'mix',
      tag: ['all', 'n', 'v', 'a', 'adv'].includes(vp.tag) ? vp.tag : 'all',
      count: vp.count === 20 ? 20 : 10,
    },
  };
  s.festivals = Object.fromEntries(Object.entries(obj(raw.festivals)).filter(([k, v]) => /^[a-z]+-\d{4}$/.test(k) && isDate(v)));
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
