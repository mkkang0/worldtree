// 단어 퀴즈 규칙 (화면 없이 계산만). 간격 반복: 맞히면 다음 복습을 점점 멀리, 틀리면 오늘 다시.
// state.vocab.cards[단어] = [칸 0~5, 다음 복습일, 맞힘, 틀림]
//   칸 0: 오늘 다시 · 1: 1일 뒤 · 2: 3일 · 3: 7일 · 4: 14일 · 5: 30일 뒤
//   칸 3 이상이면 '익힘'
import { todayKey, addDays } from './dates.js';
import { VOCAB } from '../data/vocab-n3.js';

export const VOCAB_DAILY_STARS = 30; // 하루에 단어 퀴즈로 받을 수 있는 별빛 (가나 퀴즈와 따로)
export const STEPS = [0, 1, 3, 7, 14, 30];
export const KNOWN_BOX = 3;

// 'new' 아직 안 봄 · 'weak' 자주 틀림 · 'learning' 외우는 중 · 'done' 익힘
export function statusOf(card) {
  if (!card) return 'new';
  const [box, , ok, ng] = card;
  if (box >= KNOWN_BOX) return 'done';
  return ng > ok ? 'weak' : 'learning';
}

// 한 문제를 풀고 나서
export function review(state, word, ok, day = todayKey()) {
  const c = state.vocab.cards[word] || [0, day, 0, 0];
  const box = ok ? Math.min(STEPS.length - 1, c[0] + 1) : 0;
  state.vocab.cards[word] = [box, addDays(day, ok ? STEPS[box] : 0), c[2] + (ok ? 1 : 0), c[3] + (ok ? 0 : 1)];
}

// 범위 (품사 · 읽기 문제는 한자가 있는 단어만)
export const poolOf = (tag = 'all', dir = 'mix') => VOCAB.filter((v) => (tag === 'all' || v.tag === tag) && (dir !== 'read' || v.kanji));

const dueOf = (state, v) => state.vocab.cards[v.word]?.[1];

// 새 단어는 품사를 번갈아 (명사 → 동사 → 형용사 → 부사 → 명사 …) 한 판에 골고루 나오게
function interleave(list) {
  const groups = Object.values(list.reduce((g, v) => ((g[v.tag] = g[v.tag] || []).push(v), g), {}));
  const out = [];
  for (let i = 0; out.length < list.length; i++) groups.forEach((g) => g[i] && out.push(g[i]));
  return out;
}

// 이번 판의 단어: 복습할 단어 먼저(새 단어가 남아 있으면 7할까지), 그다음 새 단어(단어장 순서), 남으면 곧 복습할 단어
export function pickWords(state, { tag, dir, count }, day = todayKey()) {
  const pool = poolOf(tag, dir);
  const cards = state.vocab.cards;
  const byDue = (a, b) => cards[a.word][0] - cards[b.word][0] || (dueOf(state, a) < dueOf(state, b) ? -1 : 1);
  const due = pool.filter((v) => cards[v.word] && dueOf(state, v) <= day).sort(byDue);
  const fresh = interleave(pool.filter((v) => !cards[v.word]));
  const later = pool.filter((v) => cards[v.word] && dueOf(state, v) > day).sort((a, b) => (dueOf(state, a) < dueOf(state, b) ? -1 : 1));
  const firstDue = Math.min(due.length, fresh.length ? Math.ceil(count * 0.7) : count);
  const out = [...due.slice(0, firstDue)];
  for (const list of [fresh, due.slice(firstDue), later]) for (const v of list) if (out.length < count) out.push(v);
  return out;
}

// 단어장 한눈에: 전체 · 익힘 · 외우는 중 · 자주 틀림 · 새 단어 · 오늘 복습할 단어
export function vocabSummary(state, day = todayKey()) {
  const out = { total: VOCAB.length, done: 0, learning: 0, weak: 0, new: 0, due: 0 };
  for (const v of VOCAB) {
    const c = state.vocab.cards[v.word];
    out[statusOf(c)] += 1;
    if (c && c[1] <= day) out.due += 1;
  }
  return out;
}

export const knownCount = (state) => Object.values(state.vocab.cards).filter((c) => c[0] >= KNOWN_BOX).length;
export const todayVocabStars = (state, day = todayKey()) => (state.vocab.day?.date === day ? state.vocab.day.stars : 0);
export const todayVocabPlays = (state, day = todayKey()) => (state.vocab.day?.date === day ? state.vocab.day.plays : 0);
