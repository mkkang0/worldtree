// 더보기 > 미니게임: 가나(히라가나·가타카나) 퀴즈
// - 글자를 보고 읽기 고르기 / 읽기를 보고 글자 고르기 (4지선다)
// - 자주 틀린 글자가 더 자주 나온다 (state.kana.stats[글자] = [맞힘, 틀림])
// - 맞힌 만큼 별빛 (하루 상한 KANA_DAILY_STARS)
// 진행 중인 판은 저장하지 않고 ctx.ui.quiz에 둔다.
import { ctx, rerender, commit } from '../app/context.js';
import { gain, settle } from '../app/wallet.js';
import { todayKey } from '../core/dates.js';
import { KANA_GROUPS, SCRIPTS, kanaPool, toKatakana } from '../data/kana.js';
import { esc, bar, money, backButton, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime, confetti } from '../ui/effects.js';

export const KANA_DAILY_STARS = 30; // 하루에 퀴즈로 받을 수 있는 별빛
const PERFECT_BONUS = 5;
const DIRS = [['read', '글자 → 읽기'], ['write', '읽기 → 글자'], ['both', '섞어서']];
const CHART = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもや_ゆ_よらりるれろわ___をん';
const COUNTS = [10, 20];

// 익힘 정도: 3번 이상 풀고 80% 이상 맞히면 '익힘'
export function masteryOf(stat) {
  const [ok = 0, ng = 0] = stat || [];
  const n = ok + ng;
  if (!n) return 'new';
  if (n >= 3 && ok / n >= 0.8) return 'done';
  return ok / n >= 0.5 ? 'learning' : 'weak';
}

const prefsOf = (state) => state.kana.prefs;
const todayStars = (state) => (state.kana.day?.date === todayKey() ? state.kana.day.stars : 0);

/* ---------- 문제 만들기 ---------- */

const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

// 자주 틀린 글자일수록 무게가 크다
function weightOf(state, key) {
  const [ok = 0, ng = 0] = state.kana.stats[key] || [];
  if (!ok && !ng) return 1.4;
  return Math.min(5, Math.max(0.3, 1 + ng * 1.5 - ok * 0.4));
}

function pickWeighted(state, pool, count) {
  const left = [...pool];
  const out = [];
  while (out.length < count) {
    if (!left.length) left.push(...pool); // 글자가 문제 수보다 적으면 다시 섞어 쓴다
    const ws = left.map((k) => weightOf(state, k.key));
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    let i = 0;
    while ((r -= ws[i]) > 0 && i < ws.length - 1) i++;
    out.push(left.splice(i, 1)[0]);
  }
  return out;
}

// 보기 4개: 정답 + 읽기가 다른 글자 3개 (같은 묶음·같은 글자 종류를 먼저)
function choicesFor(q, pool) {
  const others = shuffle(pool.filter((k) => k.romaji !== q.romaji));
  const near = others.filter((k) => k.group === q.group && k.script === q.script);
  const picked = [];
  for (const k of [...near, ...others]) {
    if (picked.length === 3) break;
    if (!picked.some((p) => p.romaji === k.romaji)) picked.push(k);
  }
  return shuffle([q, ...picked]);
}

function newRound(state, onlyKeys = null) {
  const p = prefsOf(state);
  const pool = kanaPool(p.script, p.groups);
  const base = onlyKeys ? pool.filter((k) => onlyKeys.includes(k.key)) : pool;
  const qs = pickWeighted(state, base, onlyKeys ? Math.min(base.length, 10) || 1 : p.count).map((q) => ({
    ...q,
    dir: p.dir === 'both' ? (Math.random() < 0.5 ? 'read' : 'write') : p.dir,
    choices: choicesFor(q, pool),
  }));
  return { qs, i: 0, score: 0, combo: 0, best: 0, answer: null, wrong: [], done: false, stars: 0 };
}

/* ---------- 화면 ---------- */

export function view(state, ui) {
  const quiz = ui.quiz;
  if (quiz && quiz.done) return `${backButton}${resultView(state, quiz)}`;
  if (quiz) return `${backButton}${playView(quiz)}`;
  return `${backButton}
    <header class="page-head"><h1>미니게임</h1><span class="tiny">놀면서 외워요</span></header>
    ${setupView(state)}
    ${masteryView(state)}`;
}

function setupView(state) {
  const p = prefsOf(state);
  const chip = (act, arg, on, label) => `<button class="chip-btn ${on ? 'on' : ''}" data-act="${act}" data-arg="${arg}" aria-pressed="${on}">${label}</button>`;
  const total = kanaPool(p.script, p.groups).length;
  return `<section class="card kana-setup">
    ${title('가나 퀴즈', { iconName: 'sparkle', aside: `오늘 별빛 ${todayStars(state)} / ${KANA_DAILY_STARS}` })}
    <div class="script-pick">${SCRIPTS.map(
      (s) => `<button class="${s.id === p.script ? 'on' : ''}" data-act="kana.script" data-arg="${s.id}" aria-pressed="${s.id === p.script}"><em>${s.sample}</em><span>${s.label}</span></button>`
    ).join('')}</div>
    <div class="label-like">범위</div>
    <div class="chips">${KANA_GROUPS.map((g) => chip('kana.group', g.id, p.groups.includes(g.id), g.label)).join('')}</div>
    <div class="label-like">문제 방식</div>
    <div class="chips">${DIRS.map(([id, label]) => chip('kana.dir', id, p.dir === id, label)).join('')}</div>
    <div class="label-like">문제 수</div>
    <div class="chips">${COUNTS.map((n) => chip('kana.count', n, p.count === n, `${n}문제`)).join('')}</div>
    <button class="btn gold" data-act="kana.start">${icon('play')} 시작하기 <span class="tiny-on">· 글자 ${total}개</span></button>
    <p class="tiny">맞힌 문제마다 ${money('star', 1, true)}, 만점이면 ${money('star', PERFECT_BONUS, true)} 더. 자주 틀린 글자가 더 자주 나와요.</p>
  </section>`;
}

// 익힌 글자 표 (기본 46자, 고른 글자 종류 기준)
function masteryView(state) {
  const p = prefsOf(state);
  const sc = p.script === 'kata' ? 'kata' : 'hira';
  const rows = KANA_GROUPS[0].rows;
  const romajiOf = Object.fromEntries(rows.map(([h, r]) => [h, r]));
  // 오십음도 모양 그대로 (や·わ 줄의 빈칸은 _)
  const cells = [...CHART].map((h) => {
    if (h === '_') return '<span class="kcell gap" aria-hidden="true"></span>';
    const kana = sc === 'kata' ? toKatakana(h) : h;
    const m = masteryOf(state.kana.stats[`${sc === 'kata' ? 'k' : 'h'}:${kana}`]);
    return `<span class="kcell ${m}" title="${romajiOf[h]}"><b>${kana}</b><small>${romajiOf[h]}</small></span>`;
  });
  const done = cells.filter((c) => c.includes('kcell done')).length;
  return `<section class="card">
    ${title(`익힌 ${sc === 'kata' ? '가타카나' : '히라가나'}`, { iconName: 'trophy', aside: `${done} / ${rows.length}` })}
    ${bar(done / rows.length, 'star')}
    <div class="kgrid">${cells.join('')}</div>
    <p class="tiny"><i class="dot k-done"></i> 익힘 · <i class="dot k-learning"></i> 익히는 중 · <i class="dot k-weak"></i> 자주 틀림 · <i class="dot k-new"></i> 아직 안 나옴</p>
    <p class="tiny">지금까지 ${state.kana.plays}판 · 최고 연속 ${state.kana.best}개 정답</p>
  </section>`;
}

function playView(quiz) {
  const q = quiz.qs[quiz.i];
  const a = quiz.answer;
  const prompt =
    q.dir === 'read'
      ? `<div class="kana-big ${q.kana.length > 1 ? 'two' : ''}">${q.kana}</div><p class="tiny">이 글자는 어떻게 읽을까요?</p>`
      : `<div class="kana-read"><b>${q.romaji}</b><span>${esc(q.ko)}</span></div><p class="tiny">${q.script === 'kata' ? '가타카나' : '히라가나'}로 고르세요</p>`;
  const label = (c) => (q.dir === 'read' ? `<b>${c.romaji}</b><small>${esc(c.ko)}</small>` : `<b class="k">${c.kana}</b>`);
  const state = (c) => (!a ? '' : c.key === q.key ? 'right' : c.key === a ? 'wrong' : 'dim');
  return `<section class="card quiz">
    <div class="quiz-top"><span class="tiny">${quiz.i + 1} / ${quiz.qs.length}</span>${quiz.combo >= 2 ? `<span class="combo">🔥 ${quiz.combo}연속</span>` : ''}<span class="tiny">점수 ${quiz.score}</span></div>
    ${bar(quiz.i / quiz.qs.length, 'star')}
    <div class="quiz-prompt">${prompt}</div>
    <div class="quiz-choices">${q.choices
      .map((c) => `<button class="choice ${state(c)}" data-act="kana.answer" data-arg="${esc(c.key)}" ${a ? 'disabled' : ''}>${label(c)}</button>`)
      .join('')}</div>
    ${
      a
        ? `<div class="quiz-feedback ${a === q.key ? 'ok' : 'ng'}">${a === q.key ? '정답이에요!' : `아쉬워요. 정답은 <b>${q.kana}</b> (${q.romaji} · ${esc(q.ko)})`}</div>
           <button class="btn" data-act="kana.next">${quiz.i + 1 < quiz.qs.length ? '다음 문제' : '결과 보기'} ${icon('right')}</button>`
        : '<button class="btn small ghost" data-act="kana.quit">그만하기</button>'
    }
  </section>`;
}

function resultView(state, quiz) {
  const n = quiz.qs.length;
  const perfect = quiz.score === n && n >= 10;
  const wrongKeys = [...new Set(quiz.wrong.map((w) => w.key))];
  return `<section class="card quiz-result">
    <div class="intro"><span class="eyebrow">RESULT</span><h1>${quiz.score} / ${n}</h1>
    <p class="muted">${perfect ? '만점이에요! 대단해요 💮' : quiz.score >= n * 0.8 ? '아주 잘했어요!' : quiz.score >= n * 0.5 ? '좋아요, 조금만 더!' : '처음엔 다 그래요. 한 번 더 해 봐요'}</p></div>
    <p class="center">${quiz.stars ? `별빛 ${money('star', quiz.stars, true)}을 받았어요` : todayStars(state) >= KANA_DAILY_STARS ? '오늘 받을 수 있는 별빛을 다 받았어요' : ''} · 최고 ${quiz.best}연속</p>
    ${
      wrongKeys.length
        ? `<div class="label-like">틀린 글자</div><div class="wrong-list">${wrongKeys
            .map((k) => {
              const w = quiz.wrong.find((x) => x.key === k);
              return `<span class="kcell weak"><b>${w.kana}</b><small>${w.romaji} · ${esc(w.ko)}</small></span>`;
            })
            .join('')}</div>`
        : ''
    }
    <div class="row two">
      ${wrongKeys.length ? `<button class="btn soft" data-act="kana.retryWrong">틀린 것만 다시</button>` : `<button class="btn soft" data-act="kana.quit">끝내기</button>`}
      <button class="btn gold" data-act="kana.start">한 판 더</button>
    </div>
    ${wrongKeys.length ? '<button class="btn small ghost" data-act="kana.quit">끝내기</button>' : ''}
  </section>`;
}

/* ---------- 동작 ---------- */

// 판을 끝내고 별빛을 준다 (하루 상한)
function finish(quiz) {
  const s = ctx.state;
  const n = quiz.qs.length;
  const perfect = quiz.score === n && n >= 10;
  const want = quiz.score + (perfect ? PERFECT_BONUS : 0);
  const give = Math.max(0, Math.min(want, KANA_DAILY_STARS - todayStars(s)));
  const playsToday = s.kana.day?.date === todayKey() ? s.kana.day.plays || 0 : 0;
  s.kana.day = { date: todayKey(), stars: todayStars(s) + give, plays: playsToday + 1 };
  s.kana.plays += 1;
  s.kana.best = Math.max(s.kana.best, quiz.best);
  if (perfect) s.kana.perfect += 1;
  if (give) gain({ star: give });
  quiz.stars = give;
  quiz.done = true;
  settle();
  if (perfect) confetti(['💮', '✨', 'あ', 'ア']);
  chime('level');
}

const setPref = (patch) => {
  Object.assign(ctx.state.kana.prefs, patch);
  commit();
  rerender();
};

export const actions = {
  'kana.script': (el) => setPref({ script: el.dataset.arg }),
  'kana.dir': (el) => setPref({ dir: el.dataset.arg }),
  'kana.count': (el) => setPref({ count: Number(el.dataset.arg) }),

  // 범위는 여러 개 고를 수 있고, 하나는 꼭 남긴다
  'kana.group': (el) => {
    const g = el.dataset.arg;
    const list = prefsOf(ctx.state).groups;
    const next = list.includes(g) ? list.filter((x) => x !== g) : [...list, g];
    if (!next.length) return toast('범위를 하나 이상 골라 주세요');
    setPref({ groups: KANA_GROUPS.map((x) => x.id).filter((id) => next.includes(id)) });
  },

  'kana.start': () => {
    ctx.ui.quiz = newRound(ctx.state);
    rerender();
    window.scrollTo(0, 0);
  },

  'kana.retryWrong': () => {
    const keys = [...new Set(ctx.ui.quiz.wrong.map((w) => w.key))];
    ctx.ui.quiz = newRound(ctx.state, keys);
    rerender();
    window.scrollTo(0, 0);
  },

  'kana.answer': (el) => {
    const quiz = ctx.ui.quiz;
    if (!quiz || quiz.answer) return;
    const q = quiz.qs[quiz.i];
    const ok = el.dataset.arg === q.key;
    quiz.answer = el.dataset.arg;
    const stat = (ctx.state.kana.stats[q.key] = ctx.state.kana.stats[q.key] || [0, 0]);
    stat[ok ? 0 : 1] += 1;
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
    // 맞히면 잠깐 보여주고 다음 문제로
    if (ok) {
      const at = quiz.i;
      setTimeout(() => {
        if (ctx.ui.quiz === quiz && quiz.i === at && quiz.answer) actions['kana.next']();
      }, 650);
    }
  },

  'kana.next': () => {
    const quiz = ctx.ui.quiz;
    if (!quiz) return;
    if (quiz.i + 1 >= quiz.qs.length) finish(quiz);
    else {
      quiz.i += 1;
      quiz.answer = null;
    }
    rerender();
  },

  'kana.quit': () => {
    ctx.ui.quiz = null;
    rerender();
  },
};
