// 더보기 메뉴
import { ACHIEVEMENTS } from '../core/achievements.js';
import { TREES } from '../data/trees.js';
import { icon } from '../ui/icons.js';

export function view(state) {
  const entries = [
    ['forest', 'forest', '세계수의 숲', `${new Set(state.dex.map((d) => d.species)).size} / ${TREES.length} 완성`],
    ['goals', 'trophy', '퀘스트 · 업적', `업적 ${Object.keys(state.achievements).length} / ${ACHIEVEMENTS.length}`],
    ['stats', 'chart', '기록 · 달력', `운동 ${state.log.length}번${state.settings.studyEnabled ? ` · 공부 ${state.study.sessions.length}번` : ''}`],
    ['friends', 'users', '함께하기', `친구 ${state.friends.length}명`],
    ['settings', 'cog', '설정 · 백업', ''],
  ];
  return `<header class="page-head"><h1>더보기</h1></header>
    <section class="card"><ul class="menu">${entries
      .map(
        ([id, ic, label, sub]) =>
          `<li><button class="menu-item" data-act="nav.sub" data-arg="${id}">${icon(ic)}<span class="grow"><b>${label}</b><span class="tiny">${sub}</span></span>${icon('right')}</button></li>`
      )
      .join('')}</ul></section>`;
}

export const actions = {};
