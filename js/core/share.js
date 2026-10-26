// 서버 없이 친구와 주고받는 코드. 메신저로 복사해서 붙여넣는다.
// 누구나 만들 수 있는 코드라 위조를 막지 못한다. 서로 믿는 사이에서 쓰는 용도.
import { GIFT_MAX } from './config.js';
import { todayKey } from './dates.js';
import { stageOf, plantXp } from './scoring.js';
import { weekSummary, streakOf } from './records.js';

const PREFIX = 'SPR1.';

function encode(obj) {
  return PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function decode(text) {
  const t = String(text).trim();
  if (!t.startsWith(PREFIX)) return null;
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(t.slice(PREFIX.length)))));
    return obj && typeof obj === 'object' ? obj : null;
  } catch {
    return null;
  }
}

export function makeFriendCode(state) {
  const w = weekSummary(state);
  return encode({
    k: 'f',
    id: state.me,
    n: state.settings.name,
    sp: state.plant.species,
    st: stageOf(plantXp(state)),
    wm: w.min,
    ws: w.sun,
    sm: w.studyMin,
    sk: streakOf(state),
    c: state.settings.cheer,
    t: todayKey(),
  });
}

export function makeGiftCode(state, gift) {
  const gid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return { gid, code: encode({ k: 'g', gid, from: state.me, n: state.settings.name, s: gift.sun, w: gift.water }) };
}

const clamp = (v, max) => Math.min(max, Math.max(0, Math.round(Number(v)) || 0));
const text = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

// 코드를 읽어 안전한 값만 돌려준다. 읽을 수 없으면 null.
export function parseCode(raw) {
  const o = decode(raw);
  if (!o) return null;
  if (o.k === 'f' && typeof o.id === 'string') {
    return {
      kind: 'friend',
      friend: {
        id: text(o.id, 40),
        name: text(o.n, 10) || '친구',
        species: text(o.sp, 20) || 'yggdrasil',
        stage: clamp(o.st, 6),
        weekMin: clamp(o.wm, 5000),
        weekSun: clamp(o.ws, 2000),
        studyMin: clamp(o.sm, 10000),
        streak: clamp(o.sk, 1000),
        cheer: text(o.c, 30),
        updated: text(o.t, 10),
      },
    };
  }
  if (o.k === 'g' && typeof o.gid === 'string') {
    return {
      kind: 'gift',
      gift: { gid: text(o.gid, 30), from: text(o.from, 40), name: text(o.n, 10) || '친구', sun: clamp(o.s, GIFT_MAX), water: clamp(o.w, GIFT_MAX) },
    };
  }
  return null;
}
