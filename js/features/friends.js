// 더보기 > 함께하기: 서버 없이 코드를 주고받는다.
import { ctx, rerender, commit } from '../app/context.js';
import { gain, settle } from '../app/wallet.js';
import { WEEK_GOAL_MIN, GIFT_MAX, MAX_FRIENDS } from '../core/config.js';
import { hoursMinutes } from '../core/dates.js';
import { STAGES, LAST_STAGE } from '../core/scoring.js';
import { weekSummary } from '../core/records.js';
import { makeFriendCode, makeGiftCode, parseCode } from '../core/share.js';
import { treeById } from '../data/trees.js';
import { renderScene } from '../art/scene.js';
import { esc, bar, backButton, title } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime, confetti, copyText } from '../ui/effects.js';

export function view(state, ui) {
  const members = 1 + state.friends.length;
  const teamMin = weekSummary(state).min + state.friends.reduce((a, f) => a + f.weekMin, 0);
  const goal = WEEK_GOAL_MIN * members;
  return `${backButton}
    <header class="page-head"><h1>함께하기</h1><span class="tiny">서버 없이 코드로 주고받아요</span></header>
    ${state.friends.length ? `<section class="card">${title('함께 목표', { iconName: 'users', aside: `${members}명` })}<p class="lead">이번 주 운동 <b>${teamMin}</b> / ${goal}분</p>${bar(teamMin / goal)}</section>` : ''}
    <section class="card">
      ${title('내 코드 보내기', { iconName: 'forest' })}
      <p class="tiny">코드를 복사해 메신저로 보내면 친구 앱에 내 세계수가 나타나요. 주 1~2번 새 코드를 보내 주세요.</p>
      <label>친구에게 보여줄 응원 한마디 (30자)
        <input data-input="friends.cheer" maxlength="30" value="${esc(state.settings.cheer)}" placeholder="예: 오늘도 같이 화이팅!">
      </label>
      <div class="row two">
        <button class="btn" data-act="friends.copyMine">내 코드 복사</button>
        ${navigator.share ? '<button class="btn soft" data-act="friends.shareMine">공유하기</button>' : ''}
      </div>
    </section>
    <section class="card">
      ${title('코드 붙여넣기', { iconName: 'scroll' })}
      <p class="tiny">친구 코드나 선물 코드를 붙여넣으면 자동으로 알아봐요.</p>
      <textarea id="code-input" rows="3" placeholder="SPR1.… 로 시작하는 코드" spellcheck="false"></textarea>
      <button class="btn" data-act="friends.apply">등록 / 선물 받기</button>
    </section>
    <section class="card">
      ${title('친구의 세계수', { iconName: 'users' })}
      ${state.friends.length ? state.friends.map(friendRow).join('') : '<p class="muted">아직 등록한 친구가 없어요.</p>'}
    </section>
    <section class="card">
      ${title('선물 보내기', { iconName: 'gift' })}
      <p class="tiny">내 포인트를 덜어 코드로 보내요. 코드는 한 번만 쓸 수 있고, 최대 ${GIFT_MAX}씩이에요.</p>
      <div class="row two">
        <label>햇살<input id="gift-sun" type="number" inputmode="numeric" min="0" max="${GIFT_MAX}" value="0"></label>
        <label>이슬<input id="gift-water" type="number" inputmode="numeric" min="0" max="${GIFT_MAX}" value="0"></label>
      </div>
      <button class="btn" data-act="friends.makeGift">${icon('gift')} 선물 코드 만들기</button>
      ${ui.giftCode ? `<textarea rows="3" readonly>${esc(ui.giftCode)}</textarea><button class="btn small soft" data-act="friends.copyGift">선물 코드 복사</button>` : ''}
    </section>`;
}

function friendRow(f) {
  const tree = treeById(f.species);
  const art = renderScene({ growth: Math.min(1, f.stage / LAST_STAGE), stage: f.stage, tree, spirit: false, hour: 12, label: tree.label });
  return `<div class="friend">
    <div class="art">${art}</div>
    <div class="grow"><b class="serif">${esc(f.name)}</b> <span class="tiny">${tree.label} · ${STAGES[f.stage].name}</span>
      <div class="tiny">이번 주 운동 ${f.weekMin}분${f.studyMin ? ` · 공부 ${hoursMinutes(f.studyMin)}` : ''} · 연속 ${f.streak}일 · ${esc(f.updated)} 기준</div>
      ${f.cheer ? `<div class="cheer">${esc(f.cheer)}</div>` : ''}</div>
    <button class="x" data-act="friends.delete" data-arg="${esc(f.id)}" aria-label="친구 삭제">${icon('close')}</button>
  </div>`;
}

function readGift() {
  const read = (id) => Math.min(GIFT_MAX, Math.max(0, Math.round(Number(document.getElementById(id)?.value)) || 0));
  return { sun: read('gift-sun'), water: read('gift-water') };
}

function addFriend(f) {
  const s = ctx.state;
  if (f.id === s.me) return toast('내 코드예요! 친구 코드를 붙여넣어 주세요.');
  const i = s.friends.findIndex((x) => x.id === f.id);
  if (i < 0 && s.friends.length >= MAX_FRIENDS) return toast(`친구는 ${MAX_FRIENDS}명까지 등록할 수 있어요`);
  if (i >= 0) s.friends[i] = f;
  else s.friends.push(f);
  settle();
  rerender();
  toast(`${f.name} 친구 정보를 ${i >= 0 ? '업데이트' : '등록'}했어요 🤝`);
}

function receiveGift(g) {
  const s = ctx.state;
  if (g.from === s.me || s.sentGifts.includes(g.gid)) return toast('내가 만든 선물은 받을 수 없어요');
  if (s.redeemed.includes(g.gid)) return toast('이미 받은 선물이에요');
  if (!g.sun && !g.water) return toast('빈 선물이에요');
  s.redeemed.push(g.gid);
  gain({ sun: g.sun, water: g.water });
  settle();
  confetti(['✦', '💛', '✨']);
  chime('level');
  rerender();
  toast(`${g.name}님의 선물! 햇살 +${g.sun} · 이슬 +${g.water}`);
}

export const actions = {
  'friends.cheer': (input) => {
    ctx.state.settings.cheer = input.value.slice(0, 30);
    commit();
  },
  'friends.copyMine': () => copyText(makeFriendCode(ctx.state), '내 코드를 복사했어요. 메신저에 붙여넣어 보내세요'),
  'friends.shareMine': () => navigator.share({ title: '새싹 일기', text: makeFriendCode(ctx.state) }).catch(() => {}),

  'friends.apply': () => {
    const parsed = parseCode(document.getElementById('code-input')?.value || '');
    if (!parsed) return toast('코드를 읽을 수 없어요. 처음부터 끝까지 복사했는지 확인해 주세요.');
    if (parsed.kind === 'friend') addFriend(parsed.friend);
    else receiveGift(parsed.gift);
  },

  'friends.makeGift': () => {
    const s = ctx.state;
    const gift = readGift();
    if (!gift.sun && !gift.water) return toast('보낼 포인트를 입력해 주세요');
    if (gift.sun > s.sun || gift.water > s.water) return toast('가진 포인트보다 많아요');
    const { gid, code } = makeGiftCode(s, gift);
    s.sun -= gift.sun;
    s.water -= gift.water;
    s.sentGifts.push(gid);
    ctx.ui.giftCode = code;
    commit();
    rerender();
    toast('선물 코드를 만들었어요. 복사해서 보내 주세요 🎁');
  },
  'friends.copyGift': () => copyText(ctx.ui.giftCode, '선물 코드를 복사했어요'),

  'friends.delete': (el) => {
    if (!confirm('이 친구를 목록에서 지울까요?')) return;
    ctx.state.friends = ctx.state.friends.filter((f) => f.id !== el.dataset.arg);
    commit();
    rerender();
  },
};
