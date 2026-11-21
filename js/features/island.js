// 나의 섬: 세계수가 서 있는 떠 있는 섬에 건물을 지어 마을로, 섬을 늘려 군도와 나라로 키운다.
// 1단계 - 빈 자리를 눌러 건물을 고르면 포인트를 내고 짓기 시작 (모든 섬을 통틀어 한 번에 하나)
//        - 다 지을 때까지 필요한 성장 점수는 운동·공부·식단 기록으로 차오른다 (app/wallet.js gain)
//        - 본섬 자리는 세계수가 자랄수록 열리고, 세계수를 하나 완성하면 모두 열린다
// 2단계 - 건물 레벨 Lv.1~3, 정령 친구(주민)가 빈 집으로 이사 와서 거닌다, 하루 한 번 선물
// 3단계 - 세계수를 완성할 때마다 그 세계수가 선 새 섬이 생긴다 (features/home.js home.complete)
//        - 위쪽 군도 지도에서 섬을 골라 오가고, 섬마다 건물 8곳을 따로 짓는다 (건물 종류는 섬마다 하나씩)
//        - 섬 수에 따라 작은 군도 → 군도 → 작은 나라 → 섬나라
// 아래 탭이 없는 전체 화면 (정원과 같다).
import { ctx, rerender, commit } from '../app/context.js';
import { go } from '../app/render.js';
import { canAfford, pay, gain, settle } from '../app/wallet.js';
import { builtCount, buildingNow, shownLevel, lotsOf, isleCount, RESIDENTS, residentCount, residentsOn, bedCount, waitingCount, giftOf } from '../core/island.js';
import { requestsFor, claimRequest, heartsOf, bestFriendCount, HEART_MAX, CROWN_AT, REQUEST_REWARD } from '../core/island.js';
import { festivalOn } from '../core/festivals.js';
import { festivalCard } from '../ui/components.js';
import { todayKey } from '../core/dates.js';
import { STAGES, stageOf, plantXp } from '../core/scoring.js';
import { moodOf } from '../core/records.js';
import { BUILDINGS, buildingById, LOT_COUNT, lotsOpen, islandLevel, costOf, workOf, bedsOf, MAX_LEVEL } from '../data/buildings.js';
import { themeOf, nationName, ISLE_EMOJI, EMBLEMS } from '../data/isles.js';
import { treeById } from '../data/trees.js';
import { islandMap, archipelagoArt, LOTS, MAP, STRIP } from '../art/island.js';
import { buildingArt, constructionArt } from '../art/buildings.js';
import { spiritArt } from '../art/spirit.js';
import { nextUid } from '../art/svg.js';
import { esc, bar, costHtml, rewardHtml, amountText, title, fold } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime, confetti } from '../ui/effects.js';

// 본섬 자리가 열리는 순서: 세계수에 가까운 곳부터
const OPEN_ORDER = [3, 4, 2, 5, 1, 6, 0, 7];
const MAX_ISLES = 9; // 본섬 + 세계수 8종

// 지금 보고 있는 섬 번호 (0 = 본섬)
const isleNow = (state) => Math.min(ctx.ui.isle || 0, isleCount(state) - 1);

function openSet(state, k) {
  if (k > 0) return new Set(OPEN_ORDER); // 새 섬은 처음부터 모두 열려 있다
  const n = lotsOpen(stageOf(plantXp(state)), state.dex.length);
  return new Set(OPEN_ORDER.slice(0, n));
}

// 잠긴 자리가 열리는 단계 이름
function unlockStageName(i) {
  const k = OPEN_ORDER.indexOf(i); // 열린 자리 수 = 2 + 단계 → k번째 자리는 단계 k-1에서 열린다
  return STAGES[Math.max(0, k - 1)]?.name || '세계수';
}

function lotStates(state, k) {
  const open = openSet(state, k);
  return lotsOf(state, k).map((l, i) => {
    if (!l) return { state: open.has(i) ? 'empty' : 'locked' };
    const ratio = Math.min(1, l.progress / workOf(buildingById(l.b), l.lv));
    if (l.done) return { state: 'built', id: l.b, lv: l.lv };
    if (l.lv > 1) return { state: 'upgrading', id: l.b, lv: l.lv - 1, ratio };
    return { state: 'building', id: l.b, lv: 1, ratio };
  });
}

// 섬 정보: 이름, 세계수 종류, 그림 테마
function isleInfo(state, k) {
  if (!k) return { name: '본섬', species: state.plant.species, theme: {}, emoji: '🏡' };
  const x = state.island.isles[k - 1];
  return { name: x.name, species: x.species, theme: themeOf(x.species), emoji: ISLE_EMOJI[x.species] || '🏝️', date: x.date };
}

const smallArt = (id, building, lv = 1) =>
  `<svg viewBox="-40 -104 80 110" aria-hidden="true">${building ? constructionArt(0.4, nextUid()) : buildingArt(id, nextUid(), lv)}</svg>`;

// 주민 얼굴 (하트가 쌓이면 화관 · 나비넥타이)
const residentFace = (r, tree, hearts = 0) => {
  const wardrobe = hearts >= CROWN_AT ? { hat: 'hat-flower', ...(hearts >= HEART_MAX ? { neck: 'neck-bow' } : {}) } : {};
  return `<svg viewBox="-34 -50 68 86" aria-hidden="true">${spiritArt({ x: 0, y: 0, scale: 1, mood: 'happy', wardrobe, tree, uid: nextUid(), body: r.color })}</svg>`;
};
const heartRow = (n) => `<span class="hearts" aria-label="우정 하트 ${n} / ${HEART_MAX}">${'♥'.repeat(n)}<i>${'♡'.repeat(HEART_MAX - n)}</i></span>`;

// 나라 이름 · 문장 (정하지 않았으면 나라 단계 이름)
export function nationLabel(state) {
  const { name, emblem } = state.island.nation;
  const level = nationName(isleCount(state));
  if (!level) return '';
  return name ? `${emblem || '🗺️'} ${esc(name)}` : level;
}

/* ---------- 화면 ---------- */

export function view(state, ui) {
  const k = isleNow(state);
  const info = isleInfo(state, k);
  const lots = lotStates(state, k);
  const built = builtCount(state, k);
  const lvl = islandLevel(built);
  const isles = isleCount(state);
  const nation = nationName(isles);
  const tree = treeById(info.species);
  const buttons = LOTS.map(({ x, y }, i) => {
    const l = lots[i];
    const name = l.id && buildingById(l.id).name;
    const label = { built: `${name} 보기`, upgrading: `${name} 레벨 올리는 중`, building: `${name} 짓는 중`, empty: '빈 자리에 건물 짓기', locked: '잠긴 자리' }[l.state];
    return `<button class="lot-btn ${l.state}" style="left:${((x / MAP.w) * 100).toFixed(2)}%;top:${((y / MAP.h) * 100).toFixed(2)}%" data-act="island.lot" data-arg="${i}" aria-label="${label}"></button>`;
  }).join('');
  return `<div class="island">
    <header class="garden-top">
      <button class="x" data-act="island.close" aria-label="섬 닫기">${icon('left')}</button>
      <div class="grow"><b>${info.emoji} ${esc(info.name)}</b><span class="tiny">${nation ? `${nationLabel(state)} · ` : ''}건물 ${built}/${LOT_COUNT} · 주민 ${residentCount(state)}명 · ${lvl.name}</span></div>
      <button class="x" data-act="garden.open" aria-label="정원에서 꾸미기">${icon('tree')}</button>
    </header>
    ${stripView(state, k)}
    <div class="island-map" id="island-map">
      <div class="map-inner">${islandMap({
        growth: k ? 1 : Math.min(1, plantXp(state) / STAGES[STAGES.length - 1].at),
        stage: k ? STAGES.length - 1 : stageOf(plantXp(state)),
        tree,
        equipped: k ? {} : state.equipped,
        custom: k ? {} : state.custom,
        mood: moodOf(state),
        lots,
        residents: residentsOn(state, k).map((r) => ({ ...r, hearts: heartsOf(state, r.id) })),
        theme: info.theme,
        spirit: !k,
        festival: festivalOn(),
        hour: new Date().getHours(),
      })}${buttons}</div>
    </div>
    <p class="tiny center map-hint">← 밀어서 섬 둘러보기 · 건물을 눌러 레벨 업 →</p>
    ${giftCard(state)}
    ${requestsCard(state, treeById(state.plant.species))}
    ${festivalCard(state, { compact: !!state.festivals[festivalOn()?.key] })}
    ${nowCard(state)}
    ${nationCard(state, k, lvl, built)}
    ${residentsCard(state, treeById(state.plant.species))}
    <section class="card">
      ${title(`${esc(info.name)} 건물 도감`, { iconName: 'scroll', aside: `${built} / ${BUILDINGS.length}` })}
      <div class="grid four bdex">${BUILDINGS.map((b) => {
        const l = lotsOf(state, k).find((x) => x && x.b === b.id && (x.done || x.lv > 1));
        return `<div class="bcell ${l ? 'on' : ''}"><span class="bart">${smallArt(b.id, false, l ? shownLevel(l) : 1)}</span><b>${l ? `${b.name}${shownLevel(l) > 1 ? ` Lv.${shownLevel(l)}` : ''}` : '???'}</b></div>`;
      }).join('')}</div>
    </section>
  </div>`;
}

// 위쪽 군도 지도: 섬들을 다리로 잇고, 다음 섬 자리(?)는 세계수를 완성하면 생긴다
function stripView(state, k) {
  const list = Array.from({ length: isleCount(state) }, (_, j) => {
    const info = isleInfo(state, j);
    const t = treeById(info.species);
    return { palette: t.palette, grass: { ...{ grass: ['#8ccc72'] }, ...themeOf(info.species) }.grass[0], built: builtCount(state, j), name: info.name, emoji: info.emoji };
  });
  const next = isleCount(state) < MAX_ISLES;
  if (next) list.push({ locked: true });
  const pct = Math.floor(Math.min(1, plantXp(state) / STAGES[STAGES.length - 1].at) * 100);
  const buttons = list
    .map((t, j) =>
      t.locked
        ? `<button class="isle-btn locked" style="left:${j * STRIP.step}px" data-act="island.next" aria-label="다음 섬: 세계수를 완성하면 생겨요 (지금 ${pct}%)"><small>다음 섬 ${pct}%</small></button>`
        : `<button class="isle-btn ${j === k ? 'on' : ''}" style="left:${j * STRIP.step}px" data-act="island.go" data-arg="${j}" aria-pressed="${j === k}"><small>${t.emoji} ${esc(t.name)}</small></button>`
    )
    .join('');
  return `<div class="isle-strip" role="tablist" aria-label="군도 지도"><div class="strip-inner" style="width:${list.length * STRIP.step}px">${archipelagoArt(list, k, state.island.nation.name ? state.island.nation.emblem : '')}${buttons}</div></div>`;
}

// 주민들의 하루 선물
function giftCard(state) {
  const n = residentCount(state);
  if (!n) return '';
  const got = state.island.giftDay === todayKey();
  const best = bestFriendCount(state);
  if (got) return '<p class="tiny center gift-done">🎁 오늘 주민 선물을 받았어요 · 내일 또 와요!</p>';
  return `<section class="card gift-card">
    <span class="em">🎁</span><span class="grow"><b>주민들의 선물</b><span class="tiny">${got ? '오늘 선물을 받았어요. 내일 또 와요!' : `주민 ${n}명이 선물을 준비했어요${best ? ` · 단짝 ${best}명이 한 몫 더` : ''}`}</span></span>
    <button class="btn small ${got ? 'soft' : 'gold'} fit" data-act="island.gift" ${got ? 'disabled' : ''}>${got ? '받음' : rewardHtml(giftOf(n, best))}</button>
  </section>`;
}

// 주민의 부탁: 날마다 2~3명이 하나씩 부탁한다. 들어주면 보상과 우정 하트
function requestsCard(state, tree) {
  const list = requestsFor(state);
  if (!list.length) return '';
  const left = list.filter((q) => !q.claimed).length;
  return `<section class="card req-card">
    ${title('주민의 부탁', { iconName: 'heart', aside: left ? `${left}개 남음` : '오늘 다 했어요 ✓' })}
    <ul class="reqs">${list
      .map(
        (q) => `<li class="${q.claimed ? 'done' : q.ready ? 'ready' : ''}">
        <span class="rface">${residentFace(q.r, tree, q.hearts)}</span>
        <span class="grow"><b>${q.r.name} ${heartRow(q.hearts)}</b><span class="tiny">${q.emoji} ${q.label} · <span class="nw">${q.cur}/${q.goal}</span></span>${q.claimed ? '' : bar(q.cur / q.goal)}</span>
        ${q.claimed ? '<span class="tiny thanks">고마워!</span>' : `<button class="btn small ${q.ready ? 'gold' : 'soft'} fit" data-act="island.request" data-arg="${q.r.id}" ${q.ready ? '' : 'disabled'}>${q.ready ? '🎁 받기' : '하는 중'}</button>`}
      </li>`
      )
      .join('')}</ul>
    <p class="tiny">부탁 하나마다 ${rewardHtml(REQUEST_REWARD)} · 들어주면 우정 하트가 하나씩 쌓여요. 하트 ${CROWN_AT}개면 꽃 화관을 쓰고, ${HEART_MAX}개면 단짝이 되어 하루 선물이 늘어나요.</p>
  </section>`;
}

function nowCard(state) {
  const now = buildingNow(state);
  if (!now) {
    return `<section class="card note">${icon('sparkle')} 빈 자리(＋)를 눌러 짓거나, 지은 건물을 눌러 레벨을 올려요. 기록이 쌓이면 완성돼요.</section>`;
  }
  const l = now.l;
  const b = buildingById(l.b);
  const need = workOf(b, l.lv);
  const where = isleCount(state) > 1 ? `${isleInfo(state, now.k).name}의 ` : '';
  return `<section class="card build-now">
    ${title(`${b.emoji} ${where}${b.name}${l.lv > 1 ? ` Lv.${l.lv}로 올리는 중` : ' 짓는 중'}`, { iconName: 'cog', aside: `${Math.floor((l.progress / need) * 100)}%` })}
    ${bar(l.progress / need)}
    <p class="tiny">성장 점수 ${Math.floor(l.progress)} / ${need} · 운동·공부·식단 기록으로 차올라요</p>
    ${now.k !== isleNow(state) ? `<button class="btn small soft" data-act="island.go" data-arg="${now.k}">그 섬으로 가기</button>` : ''}
  </section>`;
}

// 섬 단계 · 나라 단계
function nationCard(state, k, lvl, built) {
  const isles = isleCount(state);
  const open = openSet(state, k).size;
  const nation = nationName(isles);
  const nextNation = [2, 4, 6, 8].find((n) => n > isles);
  return `<section class="card">
    ${title(`섬 단계 · ${lvl.name}`, { iconName: 'forest', aside: `열린 자리 ${open} / ${LOT_COUNT}` })}
    ${lvl.next ? `${bar((built - lvl.at) / (lvl.next.at - lvl.at))}<p class="tiny">이 섬에 건물 ${lvl.next.at - built}개를 더 지으면 '${lvl.next.name}'</p>` : '<p class="tiny">이 섬의 모든 자리를 채웠어요. 레벨을 올려 마을을 키워요!</p>'}
    ${!k && open < LOT_COUNT ? '<p class="tiny">세계수가 자랄수록 본섬 자리가 하나씩 열려요. 세계수를 완성하면 모든 자리가 열려요.</p>' : ''}
    <div class="nation-row"><span class="em">${(nation && state.island.nation.emblem) || '🗺️'}</span><span class="grow"><b>${nation ? (state.island.nation.name ? `${esc(state.island.nation.name)} <small>${nation}</small>` : nation) : '아직 섬 하나'}</b><span class="tiny">섬 ${isles}개 · 모든 섬의 건물 ${builtCount(state)}개${nextNation ? ` · 섬 ${nextNation}개가 되면 '${nationName(nextNation)}'` : ''}</span></span>
      ${nation ? `<button class="btn small ${state.island.nation.name ? 'ghost' : 'gold'} fit" data-act="island.nationOpen">${state.island.nation.name ? '바꾸기' : '이름 짓기'}</button>` : ''}</div>
    <p class="tiny">세계수를 하나 완성해 숲에 심을 때마다 그 세계수가 선 새 섬이 생기고, 다리로 이어져요.</p>
  </section>`;
}

// 주민: 사는 친구들과 아직 오지 않은 친구들(어떻게 하면 오는지)
function residentsCard(state, tree) {
  const beds = bedCount(state);
  const n = residentCount(state);
  const waiting = waitingCount(state);
  return `<section class="card">
    ${title('섬 주민', { iconName: 'users', aside: `${n}명 · 집 ${beds}칸` })}
    ${waiting && n >= beds ? `<p class="tiny warn">이사 오고 싶은 친구가 ${waiting}명 기다려요! 집을 짓거나 레벨을 올려 집 칸을 늘려 주세요.</p>` : ''}
    <ul class="residents">${RESIDENTS.filter((r) => state.island.residents[r.id] || r.when(state)).map((r) => {
      const day = state.island.residents[r.id];
      return day
        ? `<li class="on"><span class="rface">${residentFace(r, tree, heartsOf(state, r.id))}</span><span class="grow"><b>${r.name} ${heartRow(heartsOf(state, r.id))}</b><span class="tiny">“${esc(r.line)}”</span></span><span class="tiny">${heartsOf(state, r.id) >= HEART_MAX ? '단짝 💛' : `${day.slice(5).replace('-', '/')} 이사`}</span></li>`
        : `<li><span class="rface off">${residentFace(r, tree)}</span><span class="grow"><b>???</b><span class="tiny">${r.hint} · 빈 집이 있으면 이사 와요</span></span>${r.when(state) ? '<span class="tiny ready">집이 필요해요</span>' : ''}</li>`;
    }).join('')}</ul>
    ${(() => {
      const later = RESIDENTS.filter((r) => !state.island.residents[r.id] && !r.when(state));
      return later.length
        ? fold(`아직 오지 않은 친구 ${later.length}명 · 오는 방법`, `<ul class="residents">${later.map((r) => `<li><span class="rface off">${residentFace(r, tree)}</span><span class="grow"><b>???</b><span class="tiny">${r.hint} · 빈 집이 있으면 이사 와요</span></span></li>`).join('')}</ul>`)
        : '';
    })()}
    <p class="tiny">집은 레벨마다 주민 2명, 찻집·도서관·등대는 Lv.2부터 한 명씩 더 살 수 있어요. 모든 섬의 집을 함께 써요.</p>
  </section>`;
}

// 지도를 그린 뒤: 처음 열면 세계수가 가운데 오게, 다시 그릴 때는 보던 자리 그대로
export function mounted(ui) {
  const el = document.getElementById('island-map');
  if (el) {
    el.scrollLeft = ui.islandScroll ?? (el.scrollWidth - el.clientWidth) / 2;
    el.onscroll = () => (ui.islandScroll = el.scrollLeft);
  }
  // 군도 지도는 고른 섬이 보이게
  const strip = document.querySelector('.isle-strip');
  const on = strip?.querySelector('.isle-btn.on');
  if (strip && on) strip.scrollLeft = Math.max(0, on.offsetLeft - strip.clientWidth / 2 + STRIP.step / 2);
}

/* ---------- 창 ---------- */

// 나라 이름 · 문장 정하기 (섬이 2개부터)
export function nationModal(state) {
  const { name, emblem } = state.island.nation;
  const pick = emblem || EMBLEMS[0];
  return `<form class="sheet" data-form="island.nation" autocomplete="off" role="dialog" aria-labelledby="nation-title">
    <div class="intro"><span class="eyebrow">MY NATION · ${nationName(isleCount(state))}</span><h1 id="nation-title">나라 이름 짓기</h1>
    <p class="muted">섬들이 다리로 이어져 나라가 되었어요. 이름과 깃발에 그릴 문장을 정해 주세요.</p></div>
    <label>나라 이름 (12자)<input name="nation" maxlength="12" value="${esc(name)}" placeholder="예: 새싹 군도" required></label>
    <span class="tiny">문장</span>
    <div class="emblems" role="radiogroup" aria-label="나라 문장">${EMBLEMS.map((e) => `<label class="emblem"><input type="radio" name="emblem" value="${e}" ${e === pick ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>
    <div class="row two"><button class="btn ghost" type="button" data-act="modal.close">닫기</button><button class="btn gold" type="submit">정하기</button></div>
  </form>`;
}

// 빈 자리: 건물 고르기 (건물 종류는 섬마다 하나씩)
export function buildModal(state, ui) {
  const { k = 0, lot: i } = ui.modalData || {};
  const busy = !!buildingNow(state);
  const lots = lotsOf(state, k);
  return `<div class="sheet" role="dialog" aria-labelledby="build-title">
    <div class="intro"><span class="eyebrow">BUILD · ${esc(isleInfo(state, k).name)}</span><h1 id="build-title">무엇을 지을까요?</h1>
    <p class="muted">${busy ? '지금 짓는 건물이 있어요. 다 지으면 다음 건물을 지을 수 있어요.' : '포인트를 내면 짓기 시작해요. 기록이 쌓이면 완성돼요.'}</p></div>
    <ul class="build-list">${BUILDINGS.map((b) => {
      const has = lots.some((l) => l && l.b === b.id);
      const cost = costOf(b, 1);
      const ok = !busy && !has && canAfford(cost);
      const beds = bedsOf(b.id, 1);
      return `<li class="${has ? 'has' : ''}"><span class="bart">${smallArt(b.id)}</span>
        <span class="grow"><b>${b.emoji} ${b.name}</b><span class="tiny">${b.desc}</span><span class="tiny">완성까지 성장 점수 ${workOf(b, 1)}${beds ? ` · 주민 ${beds}명` : ''}</span></span>
        <button class="btn small ${ok ? '' : 'soft'}" data-act="island.build" data-arg="${k}:${i}:${b.id}" ${ok ? '' : 'disabled'}>${has ? '있어요' : costHtml(cost)}</button></li>`;
    }).join('')}</ul>
    <div class="sheet-foot"><button class="btn ghost" data-act="modal.close">닫기</button></div>
  </div>`;
}

// 지은 건물 · 짓는 중인 건물 보기 (레벨 올리기)
export function lotModal(state, ui) {
  const { k = 0, lot: i } = ui.modalData || {};
  const l = lotsOf(state, k)[i];
  if (!l) return '';
  const b = buildingById(l.b);
  const lvNow = shownLevel(l);
  const busy = !!buildingNow(state);
  const ref = `${k}:${i}`;
  const head = `<div class="intro"><span class="eyebrow">${l.done ? `Lv.${l.lv}` : l.lv > 1 ? `Lv.${l.lv}로 올리는 중` : '짓는 중'}</span><h1 id="lot-title">${b.emoji} ${b.name}</h1><p class="muted">${b.desc}</p></div>
    <div class="lot-art">${smallArt(b.id, !l.done && l.lv === 1, Math.max(1, lvNow))}</div>`;
  if (!l.done) {
    const need = workOf(b, l.lv);
    return `<div class="sheet" role="dialog" aria-labelledby="lot-title">${head}
      ${bar(l.progress / need)}<p class="tiny center">성장 점수 ${Math.floor(l.progress)} / ${need}</p>
      <div class="row two"><button class="btn ghost" data-act="modal.close">닫기</button><button class="btn small danger-text" data-act="island.cancel" data-arg="${ref}">${l.lv > 1 ? '레벨 올리기 취소' : '짓기 취소'}</button></div>
    </div>`;
  }
  const next = l.lv + 1;
  const canUp = l.lv < MAX_LEVEL;
  const cost = canUp && costOf(b, next);
  const ok = canUp && !busy && canAfford(cost);
  const bedsUp = canUp ? bedsOf(b.id, next) - bedsOf(b.id, l.lv) : 0;
  return `<div class="sheet" role="dialog" aria-labelledby="lot-title">${head}
    <p class="tiny center">${l.date ? `${l.date.replaceAll('-', '. ')}에 Lv.${l.lv} 완성` : ''}${bedsOf(b.id, l.lv) ? ` · 주민 ${bedsOf(b.id, l.lv)}명이 살 수 있어요` : ''}</p>
    ${
      canUp
        ? `<div class="upgrade-box"><b>Lv.${next}로 올리기</b>
           <span class="tiny">${next === 2 ? '깃발과 꽃밭이 생기고 조금 커져요' : '금빛 전구가 반짝이고 더 커져요'}${b.id === 'house' && next === 2 ? ' · 2층이 올라가요' : ''}${bedsUp ? ` · 주민 +${bedsUp}명` : ''}</span>
           <span class="tiny">완성까지 성장 점수 ${workOf(b, next)}${busy ? ' · 지금 짓는 건물이 끝나면 할 수 있어요' : ''}</span>
           <button class="btn ${ok ? 'gold' : 'soft'}" data-act="island.upgrade" data-arg="${ref}" ${ok ? '' : 'disabled'}>⬆ ${costHtml(cost)}</button></div>`
        : '<p class="tiny center">가장 높은 레벨이에요 ✨</p>'
    }
    <div class="row two"><button class="btn ghost" data-act="modal.close">닫기</button><button class="btn small danger-text" data-act="island.remove" data-arg="${ref}">허물기</button></div>
  </div>`;
}

/* ---------- 동작 ---------- */

const closeModal = () => {
  ctx.ui.modal = '';
  ctx.ui.modalData = null;
};
const refOf = (el) => el.dataset.arg.split(':').map(Number); // 'k:i' → [k, i]

export const actions = {
  'island.open': () => go('island'),
  'island.close': () => go('home'),

  // 군도 지도에서 다른 섬으로
  'island.go': (el) => {
    ctx.ui.isle = Number(el.dataset.arg) || 0;
    ctx.ui.islandScroll = null;
    rerender();
  },

  'island.next': () => {
    const pct = Math.floor(Math.min(1, plantXp(ctx.state) / STAGES[STAGES.length - 1].at) * 100);
    toast(`지금 키우는 세계수를 완성해 숲에 심으면 새 섬이 생겨요 (${pct}%)`);
  },

  'island.lot': (el) => {
    const s = ctx.state;
    const k = isleNow(s);
    const i = Number(el.dataset.arg);
    const l = lotsOf(s, k)[i];
    if (l) {
      ctx.ui.modal = 'lot';
      ctx.ui.modalData = { k, lot: i };
    } else if (openSet(s, k).has(i)) {
      ctx.ui.modal = 'build';
      ctx.ui.modalData = { k, lot: i };
    } else return toast(`이 자리는 세계수가 '${unlockStageName(i)}' 단계가 되면 열려요`);
    rerender();
  },

  'island.build': (el) => {
    const [k, i, id] = el.dataset.arg.split(':');
    const s = ctx.state;
    const b = buildingById(id);
    const lots = lotsOf(s, Number(k));
    const lot = Number(i);
    if (!b || lots[lot] || buildingNow(s) || lots.some((l) => l && l.b === id)) return;
    const cost = costOf(b, 1);
    if (!canAfford(cost)) return toast('포인트가 조금 부족해요');
    pay(cost);
    lots[lot] = { b: id, lv: 1, done: false, progress: 0 };
    closeModal();
    settle();
    chime('ok');
    rerender();
    toast(`${b.name}을(를) 짓기 시작했어요. 오늘 기록으로 완성해요!`);
  },

  // 레벨 올리기: 지금 짓는 건물이 없을 때만. 올리는 동안에도 건물은 그대로 서 있다.
  'island.upgrade': (el) => {
    const [k, i] = refOf(el);
    const s = ctx.state;
    const l = lotsOf(s, k)[i];
    if (!l || !l.done || l.lv >= MAX_LEVEL || buildingNow(s)) return;
    const b = buildingById(l.b);
    const cost = costOf(b, l.lv + 1);
    if (!canAfford(cost)) return toast('포인트가 조금 부족해요');
    pay(cost);
    Object.assign(l, { lv: l.lv + 1, done: false, progress: 0 });
    closeModal();
    settle();
    chime('ok');
    rerender();
    toast(`${b.name} Lv.${l.lv}로 올리기 시작했어요`);
  },

  // 취소: 낸 포인트는 돌려준다 (레벨 올리기 취소는 이전 레벨로)
  'island.cancel': (el) => {
    const [k, i] = refOf(el);
    const s = ctx.state;
    const lots = lotsOf(s, k);
    const l = lots[i];
    if (!l || l.done || !confirm('그만둘까요? 낸 포인트는 돌려받아요.')) return;
    const b = buildingById(l.b);
    const cost = costOf(b, l.lv);
    ['sun', 'water', 'star'].forEach((c) => (s[c] += cost[c] || 0));
    if (l.lv > 1) Object.assign(l, { lv: l.lv - 1, done: true, progress: workOf(b, l.lv - 1) });
    else lots[i] = null;
    closeModal();
    commit();
    rerender();
  },

  'island.remove': (el) => {
    const [k, i] = refOf(el);
    const s = ctx.state;
    const lots = lotsOf(s, k);
    const l = lots[i];
    if (!l || !confirm(`${buildingById(l.b).name}을(를) 허물까요? 포인트는 돌아오지 않아요.${bedsOf(l.b, shownLevel(l)) ? ' 집 칸이 줄어도 사는 주민은 그대로예요.' : ''}`)) return;
    lots[i] = null;
    closeModal();
    commit();
    rerender();
  },

  // 주민의 부탁 들어주기 → 보상 + 우정 하트
  'island.request': (el) => {
    const s = ctx.state;
    const r = RESIDENTS.find((x) => x.id === el.dataset.arg);
    const got = r && claimRequest(s, r.id);
    if (!got) return;
    gain(got.reward);
    settle();
    chime('level');
    confetti(['💛', '♥', '✨']);
    rerender();
    toast(got.hearts >= HEART_MAX ? `💛 ${r.name}와 단짝이 됐어요! 하루 선물이 늘어나요` : got.hearts === CROWN_AT ? `🌼 ${r.name}가 꽃 화관을 썼어요! (하트 ${got.hearts})` : `${r.name}: 고마워! · 우정 하트 ${got.hearts} / ${HEART_MAX}`);
  },

  'island.nationOpen': () => {
    if (isleCount(ctx.state) < 2) return;
    ctx.ui.modal = 'nation';
    ctx.ui.modalData = null;
    rerender();
  },

  'island.nation': (form) => {
    const name = form.elements.nation.value.trim().slice(0, 12);
    const emblem = form.elements.emblem.value;
    if (!name) return toast('나라 이름을 적어 주세요');
    const first = !ctx.state.island.nation.name;
    ctx.state.island.nation = { name, emblem: EMBLEMS.includes(emblem) ? emblem : EMBLEMS[0] };
    closeModal();
    commit();
    rerender();
    if (first) {
      confetti([ctx.state.island.nation.emblem, '🎉', '✨']);
      chime('level');
    }
    toast(`${ctx.state.island.nation.emblem} ${name}, 멋진 이름이에요!`);
  },

  // 주민들의 선물 (하루 한 번)
  'island.gift': () => {
    const s = ctx.state;
    const n = residentCount(s);
    if (!n || s.island.giftDay === todayKey()) return;
    const g = giftOf(n, bestFriendCount(s));
    s.island.giftDay = todayKey();
    gain(g);
    settle();
    chime('level');
    confetti(['🎁', '✨', '🌿']);
    rerender();
    toast(`주민들의 선물 · ${amountText(g)}`);
  },
};
