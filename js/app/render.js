// 화면 목록과 그리기. 새 화면을 만들면 TABS 또는 SUB_PAGES에 등록한다.
import { ctx, rerender } from './context.js';
import { clock } from '../core/dates.js';
import { icon } from '../ui/icons.js';
import * as home from '../features/home.js';
import * as workout from '../features/workout.js';
import * as study from '../features/study.js';
import * as meal from '../features/meal.js';
import * as shop from '../features/shop.js';
import * as more from '../features/more.js';
import * as goals from '../features/goals.js';
import * as stats from '../features/stats.js';
import * as forest from '../features/forest.js';
import * as friends from '../features/friends.js';
import * as settings from '../features/settings.js';
import * as onboarding from '../features/onboarding.js';

// 아래 탭. icon은 ui/icons.js의 이름. show가 있으면 조건이 맞을 때만 보인다.
const TABS = [
  { id: 'home', icon: 'tree', label: '세계수', page: home },
  { id: 'workout', icon: 'heart', label: '운동', page: workout },
  { id: 'study', icon: 'book', label: '공부', page: study, show: (s) => s.settings.studyEnabled },
  { id: 'meal', icon: 'leaf', label: '식단', page: meal },
  { id: 'shop', icon: 'gem', label: '상점', page: shop },
  { id: 'more', icon: 'more', label: '더보기', page: more },
];

// 더보기 안의 화면
const SUB_PAGES = { forest, goals, stats, friends, settings };

// 모달(아래에서 올라오는 창)
const MODALS = {
  onboarding: onboarding.modal,
  complete: home.completeModal,
  'study-finish': study.finishModal,
};

const visibleTabs = (state) => TABS.filter((t) => !t.show || t.show(state));

function currentPage() {
  const { state, ui } = ctx;
  if (ui.tab === 'more' && SUB_PAGES[ui.sub]) return SUB_PAGES[ui.sub];
  const tab = visibleTabs(state).find((t) => t.id === ui.tab);
  if (!tab) ui.tab = 'home';
  return (tab || TABS[0]).page;
}

function applyPrefs(state) {
  const theme = state.equipped.theme;
  document.documentElement.dataset.theme = theme ? theme.replace('theme-', '') : '';
  document.documentElement.classList.toggle('big', state.settings.bigText);
}

// 공부 중일 때 다른 탭 위에 떠 있는 띠
function timerBar(state, ui) {
  if (!state.study.timer || ui.tab === 'study') return '';
  return `<button class="timerbar" data-act="nav.tab" data-arg="study">${icon('timer')} 공부 중 <b data-timer>${clock(Date.now() - state.study.timer.start)}</b>${icon('right')}</button>`;
}

let lastRoute = '';

export function render() {
  const { state, ui } = ctx;
  applyPrefs(state);
  const page = currentPage();
  const main = document.getElementById('view');

  // 화면을 옮길 때만 등장 애니메이션 (css/motion.css main.entering)
  const route = `${ui.tab}/${ui.sub}`;
  if (route !== lastRoute) {
    main.classList.add('entering');
    setTimeout(() => main.classList.remove('entering'), 600);
    lastRoute = route;
  }

  document.getElementById('tabs').innerHTML = visibleTabs(state)
    .map((t) => `<button data-act="nav.tab" data-arg="${t.id}" class="${t.id === ui.tab ? 'on' : ''}" aria-current="${t.id === ui.tab}">${icon(t.icon)}<small>${t.label}</small></button>`)
    .join('');
  main.innerHTML = page.view(state, ui);
  document.getElementById('timer-slot').innerHTML = timerBar(state, ui);
  const modalEl = document.getElementById('modal');
  modalEl.innerHTML = MODALS[ui.modal] ? MODALS[ui.modal](state, ui) : '';
  modalEl.hidden = !MODALS[ui.modal];
}

export function go(tab, sub = '') {
  Object.assign(ctx.ui, { tab, sub, bubble: '' });
  if (tab !== 'shop') ctx.ui.preview = {};
  rerender();
  window.scrollTo(0, 0);
}

export const actions = {
  'nav.tab': (el) => go(el.dataset.arg),
  'nav.sub': (el) => go('more', el.dataset.arg || ''),
  'modal.close': () => {
    ctx.ui.modal = '';
    rerender();
  },
};

// 모든 기능의 동작을 한 표로 모은다. 이름은 '기능.동작' 형식.
export const ALL_ACTIONS = Object.assign(
  {},
  actions,
  ...[home, workout, study, meal, shop, more, goals, stats, forest, friends, settings, onboarding].map((m) => m.actions)
);
