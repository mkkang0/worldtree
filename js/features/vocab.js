// 더보기 > 단어 퀴즈: JLPT N3 단어 (data/vocab-n3.js)
// - 뜻 고르기 / 읽기 고르기 / 단어 고르기 (4지선다), 섞어서도
// - 간격 반복: 오늘 복습할 단어가 먼저 나오고, 맞히면 다음 복습이 점점 멀어진다 (core/vocab.js)
// - 맞힌 만큼 별빛 (하루 상한 VOCAB_DAILY_STARS, 가나 퀴즈와 따로)
// 진행 중인 판은 저장하지 않고 ctx.ui.vquiz에 둔다. 단어마다 기록은 풀 때마다 저장한다.
import { ctx, rerender, commit } from '../app/context.js';
import { gain, settle } from '../app/wallet.js';
import { todayKey, daysBetween } from '../core/dates.js';
import { VOCAB_DAILY_STARS, review, pickWords, poolOf, vocabSummary, statusOf, todayVocabStars } from '../core/vocab.js';
import { VOCAB, VOCAB_TAGS, vocabByWord } from '../data/vocab-n3.js';
import { upcomingExams } from '../ui/components.js';
import { esc, bar, money, backButton, title, fold } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime, confetti } from '../ui/effects.js';

const PERFECT_BONUS = 5;
const DIRS = [['mean', '뜻 고르기'], ['read', '읽기 고르기'], ['word', '단어 고르기'], ['mix', '섞어서']];
const COUNTS = [10, 20];
const LIST_FILTERS = [['due', '오늘 복습'], ['weak', '자주 틀림'], ['learning', '외우는 중'], ['done', '익힘'], ['new', '새 단어']];
const LIST_MAX = 80;
const STATUS_LABEL = { new: '새 단어', weak: '자주 틀림', learning: '외우는 중', done: '익힘' };

const prefsOf = (state) => state.vocab.prefs;

const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/* ---------- 문제 만들기 ---------- */

// 보기 글자: 뜻 고르기는 뜻, 읽기 고르기는 읽기, 단어 고르기는 단어
const shown = (v, dir) => (dir === 'mean' ? v.meaning : dir === 'read' ? v.reading : v.word);

// 보기 4개: 정답 + 같은 품사의 다른 단어 3개 (보이는 글자가 겹치지 않게)
function choicesFor(q, dir) {
  const base = poolOf('all', dir).filter((v) => v.word !== q.word);
  const same = shuffle(base.filter((v) => v.tag === q.tag));
  const rest = shuffle(base.filter((v) => v.tag !== q.tag));
  const seen = new Set([shown(q, dir)]);
  const out = [];
  for (const v of [...same, ...rest]) {
    if (out.length === 3) break;
    if (seen.has(shown(v, dir))) continue;
    seen.add(shown(v, dir));
    out.push(v);
  }
  return shuffle([q, ...out]);
}

function newRound(state, onlyWords = null) {
  const p = prefsOf(state);
  const words = onlyWords ? onlyWords.map((w) => vocabByWord[w]).filter(Boolean) : pickWords(state, p);
  const qs = shuffle(words).map((v) => {
    let dir = p.dir === 'mix' ? ['mean', 'read', 'word'][Math.floor(Math.random() * 3)] : p.dir;
    if (dir === 'read' && !v.kanji) dir = 'mean'; // 가나만 쓰는 단어는 읽기 문제가 없다
    return { ...v, dir, isNew: !state.vocab.cards[v.word], choices: choicesFor(v, dir) };
  });
  return { qs, i: 0, score: 0, combo: 0, best: 0, answer: null, wrong: [], done: false, stars: 0 };
}

/* ---------- 화면 ---------- */

export function view(state, ui) {
  const quiz = ui.vquiz;
  if (quiz && quiz.done) return `${backButton}${resultView(state, quiz)}`;
  if (quiz) return `${backButton}${playView(quiz)}`;
  return `${backButton}
    <header class="page-head"><h1>단어 퀴즈</h1><span class="tiny">JLPT N3 · ${VOCAB.length}단어</span></header>
    ${setupView(state)}
    ${bookView(state, ui)}`;
}

// 다가오는 JLPT 시험 (공부 탭 과목의 시험 이름에 JLPT나 N1~N5가 있으면)
function examPlan(state, sum) {
  const exam = upcomingExams(state).find((e) => /JLPT|N[1-5]/i.test(e.name));
  if (!exam) return '';
  const days = Math.max(1, daysBetween(todayKey(), exam.date));
  const pace = Math.ceil(sum.new / days);
  return `<p class="vocab-plan">🎯 ${esc(exam.name)}까지 <b>D-${days}</b>${sum.new ? ` · 하루 새 단어 <b>${pace}개</b>씩이면 시험 전에 모두 봐요` : ' · 단어장을 모두 봤어요! 복습만 하면 돼요'}</p>`;
}

function setupView(state) {
  const p = prefsOf(state);
  const sum = vocabSummary(state);
  const chip = (act, arg, on, label) => `<button class="chip-btn ${on ? 'on' : ''}" data-act="${act}" data-arg="${arg}" aria-pressed="${on}">${label}</button>`;
  const inRange = poolOf(p.tag, p.dir).length;
  return `<section class="card kana-setup">
    ${title('N3 단어 퀴즈', { iconName: 'book', aside: `오늘 별빛 ${todayVocabStars(state)} / ${VOCAB_DAILY_STARS}` })}
    <div class="vocab-sum">
      <span><b>${sum.due}</b><small>오늘 복습</small></span>
      <span><b>${sum.new}</b><small>새 단어</small></span>
      <span><b>${sum.done}</b><small>익힘</small></span>
    </div>
    ${examPlan(state, sum)}
    <div class="label-like">문제 방식</div>
    <div class="chips">${DIRS.map(([id, label]) => chip('vocab.dir', id, p.dir === id, label)).join('')}</div>
    <div class="label-like">범위</div>
    <div class="chips">${[['all', '전체'], ...VOCAB_TAGS.map((t) => [t.id, t.label])].map(([id, label]) => chip('vocab.tag', id, p.tag === id, label)).join('')}</div>
    <div class="label-like">문제 수</div>
    <div class="chips">${COUNTS.map((n) => chip('vocab.count', n, p.count === n, `${n}문제`)).join('')}</div>
    <button class="btn gold" data-act="vocab.start">${icon('play')} 시작하기 <span class="tiny-on">· 단어 ${inRange}개 중에서</span></button>
    <p class="tiny">오늘 복습할 단어가 먼저 나오고, 남은 자리는 새 단어로 채워요. 맞히면 1일 → 3일 → 7일 → 14일 → 30일 뒤에 다시 나오고, 틀리면 오늘 다시 나와요. 맞힌 문제마다 ${money('star', 1, true)}, 만점이면 ${money('star', PERFECT_BONUS, true)} 더.</p>
  </section>`;
}

// 단어장: 익힌 정도 + 상태별 목록 (접어 두기)
function bookView(state, ui) {
  const sum = vocabSummary(state);
  const f = ui.vocabList || 'due';
  const today = todayKey();
  const list = VOCAB.filter((v) => {
    const c = state.vocab.cards[v.word];
    return f === 'due' ? c && c[1] <= today : statusOf(c) === f;
  });
  const rows = list
    .slice(0, LIST_MAX)
    .map((v) => {
      const c = state.vocab.cards[v.word];
      const st = statusOf(c);
      return `<li class="vrow ${st}"><span class="vw"><b>${esc(v.word)}</b>${v.kanji ? `<small>${esc(v.reading)}</small>` : ''}</span><span class="vm">${esc(v.meaning)}</span><i class="dot k-${st}" title="${STATUS_LABEL[st]}"></i></li>`;
    })
    .join('');
  const body = `<div class="chips tight scroll">${LIST_FILTERS.map(([id, label]) => `<button class="chip-btn ${id === f ? 'on' : ''}" data-act="vocab.list" data-arg="${id}" aria-pressed="${id === f}">${label} ${id === 'due' ? sum.due : sum[id]}</button>`).join('')}</div>
    ${rows ? `<ul class="vlist">${rows}</ul>${list.length > LIST_MAX ? `<p class="tiny center">처음 ${LIST_MAX}개만 보여요 (모두 ${list.length}개)</p>` : ''}` : '<p class="muted">여기에 해당하는 단어가 없어요.</p>'}`;
  return `<section class="card">
    ${title('나의 단어장', { iconName: 'trophy', aside: `익힘 ${sum.done} / ${sum.total}` })}
    ${bar(sum.done / sum.total, 'star')}
    <p class="tiny"><i class="dot k-done"></i> 익힘 ${sum.done} · <i class="dot k-learning"></i> 외우는 중 ${sum.learning} · <i class="dot k-weak"></i> 자주 틀림 ${sum.weak} · <i class="dot k-new"></i> 새 단어 ${sum.new}</p>
    ${fold('단어 목록 보기', body, { open: !!ui.vocabListOpen, cls: 'vocab-fold' })}
    <p class="tiny">지금까지 ${state.vocab.plays}판 · 최고 연속 ${state.vocab.best}개 정답</p>
  </section>`;
}

function playView(quiz) {
  const q = quiz.qs[quiz.i];
  const a = quiz.answer;
  const big = (t) => `<div class="vocab-big ${t.length > 4 ? 'long' : ''}">${esc(t)}</div>`;
  const prompt =
    q.dir === 'word'
      ? `<div class="vocab-mean">${esc(q.meaning)}</div><p class="tiny">이 뜻의 단어를 고르세요</p>`
      : `${big(q.word)}<p class="tiny">${q.dir === 'read' ? '어떻게 읽을까요?' : '무슨 뜻일까요?'}</p>`;
  const state = (c) => (!a ? '' : c.word === q.word ? 'right' : c.word === a ? 'wrong' : 'dim');
  const label = (c) => `<b class="${q.dir === 'mean' ? 'vc-mean' : 'k'}">${esc(shown(c, q.dir))}</b>`;
  const card = `<div class="vocab-card"><b>${esc(q.word)}</b>${q.kanji ? `<span>${esc(q.reading)}</span>` : ''}<em>${esc(q.meaning)}</em></div>`;
  return `<section class="card quiz">
    <div class="quiz-top"><span class="tiny">${quiz.i + 1} / ${quiz.qs.length}${q.isNew ? ' · <b class="new-tag">새 단어</b>' : ''}</span>${quiz.combo >= 2 ? `<span class="combo">🔥 ${quiz.combo}연속</span>` : ''}<span class="tiny">점수 ${quiz.score}</span></div>
    ${bar(quiz.i / quiz.qs.length, 'star')}
    <div class="quiz-prompt">${prompt}</div>
    <div class="quiz-choices vocab-choices">${q.choices
      .map((c) => `<button class="choice ${state(c)}" data-act="vocab.answer" data-arg="${esc(c.word)}" ${a ? 'disabled' : ''}>${label(c)}</button>`)
      .join('')}</div>
    ${
      a
        ? `<div class="quiz-feedback ${a === q.word ? 'ok' : 'ng'}">${a === q.word ? '정답이에요!' : '아쉬워요. 오늘 다시 나와요'}</div>${card}
           <button class="btn" data-act="vocab.next">${quiz.i + 1 < quiz.qs.length ? '다음 문제' : '결과 보기'} ${icon('right')}</button>`
        : '<button class="btn small ghost" data-act="vocab.quit">그만하기</button>'
    }
  </section>`;
}

function resultView(state, quiz) {
  const n = quiz.qs.length;
  const perfect = quiz.score === n && n >= 10;
  const wrong = [...new Map(quiz.wrong.map((w) => [w.word, w])).values()];
  const fresh = quiz.qs.filter((q) => q.isNew).length;
  return `<section class="card quiz-result">
    <div class="intro"><span class="eyebrow">RESULT</span><h1>${quiz.score} / ${n}</h1>
    <p class="muted">${perfect ? '만점이에요! 대단해요 💮' : quiz.score >= n * 0.8 ? '아주 잘했어요!' : quiz.score >= n * 0.5 ? '좋아요, 조금만 더!' : '틀린 단어는 오늘 다시 나와요. 한 번 더 해 봐요'}</p></div>
    <p class="center">${quiz.stars ? `별빛 ${money('star', quiz.stars, true)}을 받았어요` : todayVocabStars(state) >= VOCAB_DAILY_STARS ? '오늘 받을 수 있는 별빛을 다 받았어요' : ''}${fresh ? ` · 새 단어 ${fresh}개` : ''} · 최고 ${quiz.best}연속</p>
    ${
      wrong.length
        ? `<div class="label-like">틀린 단어</div><ul class="vlist">${wrong
            .map((w) => `<li class="vrow weak"><span class="vw"><b>${esc(w.word)}</b>${w.kanji ? `<small>${esc(w.reading)}</small>` : ''}</span><span class="vm">${esc(w.meaning)}</span></li>`)
            .join('')}</ul>`
        : ''
    }
    <div class="row two">
      ${wrong.length ? '<button class="btn soft" data-act="vocab.retryWrong">틀린 것만 다시</button>' : '<button class="btn soft" data-act="vocab.quit">끝내기</button>'}
      <button class="btn gold" data-act="vocab.start">한 판 더</button>
    </div>
    ${wrong.length ? '<button class="btn small ghost" data-act="vocab.quit">끝내기</button>' : ''}
  </section>`;
}

/* ---------- 동작 ---------- */

// 판을 끝내고 별빛을 준다 (하루 상한)
function finish(quiz) {
  const s = ctx.state;
  const n = quiz.qs.length;
  const perfect = quiz.score === n && n >= 10;
  const want = quiz.score + (perfect ? PERFECT_BONUS : 0);
  const had = todayVocabStars(s);
  const give = Math.max(0, Math.min(want, VOCAB_DAILY_STARS - had));
  const playsToday = s.vocab.day?.date === todayKey() ? s.vocab.day.plays || 0 : 0;
  s.vocab.day = { date: todayKey(), stars: had + give, plays: playsToday + 1 };
  s.vocab.plays += 1;
  s.vocab.best = Math.max(s.vocab.best, quiz.best);
  if (perfect) s.vocab.perfect += 1;
  if (give) gain({ star: give });
  quiz.stars = give;
  quiz.done = true;
  settle();
  if (perfect) confetti(['💮', '✨', '語', '📖']);
  chime('level');
}

const setPref = (patch) => {
  Object.assign(ctx.state.vocab.prefs, patch);
  commit();
  rerender();
};

const startRound = (words = null) => {
  const quiz = newRound(ctx.state, words);
  if (!quiz.qs.length) return toast('이 범위에는 문제로 낼 단어가 없어요');
  ctx.ui.vquiz = quiz;
  rerender();
  window.scrollTo(0, 0);
};

export const actions = {
  'vocab.dir': (el) => setPref({ dir: el.dataset.arg }),
  'vocab.tag': (el) => setPref({ tag: el.dataset.arg }),
  'vocab.count': (el) => setPref({ count: Number(el.dataset.arg) }),

  // 단어 목록 고르기 (목록은 펼친 채로)
  'vocab.list': (el) => {
    ctx.ui.vocabList = el.dataset.arg;
    ctx.ui.vocabListOpen = true;
    rerender();
  },

  'vocab.start': () => startRound(),
  'vocab.retryWrong': () => startRound([...new Set(ctx.ui.vquiz.wrong.map((w) => w.word))]),

  'vocab.answer': (el) => {
    const quiz = ctx.ui.vquiz;
    if (!quiz || quiz.answer) return;
    const q = quiz.qs[quiz.i];
    const ok = el.dataset.arg === q.word;
    quiz.answer = el.dataset.arg;
    review(ctx.state, q.word, ok);
    if (ok) {
      quiz.score += 1;
      quiz.combo += 1;
      quiz.best = Math.max(quiz.best, quiz.combo);
      chime(quiz.combo >= 5 ? 'level' : 'ok');
    } else {
      quiz.combo = 0;
      quiz.wrong.push(q);
      chime('soft');
      navigator.vibrate?.(60);
    }
    commit();
    rerender();
    // 맞히면 읽기·뜻을 잠깐 보여주고 다음 문제로
    if (ok) {
      const at = quiz.i;
      setTimeout(() => {
        if (ctx.ui.vquiz === quiz && quiz.i === at && quiz.answer) actions['vocab.next']();
      }, 1100);
    }
  },

  'vocab.next': () => {
    const quiz = ctx.ui.vquiz;
    if (!quiz) return;
    if (quiz.i + 1 >= quiz.qs.length) finish(quiz);
    else {
      quiz.i += 1;
      quiz.answer = null;
    }
    rerender();
  },

  'vocab.quit': () => {
    ctx.ui.vquiz = null;
    rerender();
  },
};
