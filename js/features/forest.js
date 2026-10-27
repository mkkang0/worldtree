// 더보기 > 세계수의 숲 (완성한 세계수 모음)
import { STAGES, LAST_STAGE } from '../core/scoring.js';
import { TREES, treeById } from '../data/trees.js';
import { renderScene } from '../art/scene.js';
import { JOURNEY_DAYS } from '../core/config.js';
import { esc, backButton, title } from '../ui/dom.js';
import { journey } from '../ui/components.js';

export function view(state) {
  const done = new Set(state.dex.map((d) => d.species));
  const j = journey(state);
  return `${backButton}
    <header class="page-head"><h1>세계수의 숲</h1><span class="tiny">${done.size} / ${TREES.length} 완성</span></header>
    <section class="card">
      ${title('세계수 도감', { iconName: 'forest' })}
      <p class="tiny">${JOURNEY_DAYS}일의 여정을 마친 세계수는 이곳에 심어져요. 포인트와 아이템은 그대로 이어져요.</p>
      <div class="grid">${TREES.map((t) => {
        const have = done.has(t.id);
        const growing = state.plant.species === t.id;
        const art = renderScene({ growth: have ? 1 : 0.62, stage: have ? LAST_STAGE : 4, tree: t, spirit: false, hour: 12, label: t.label });
        return `<div class="forest-card ${have || growing ? '' : 'locked'}">
          <div class="art">${art}</div>
          <b>${have || growing ? t.label : '???'}</b>
          <span class="tiny">${have ? t.tagline : growing ? `키우는 중 · ${j.stageName}` : '아직 만나지 못했어요'}</span>
        </div>`;
      }).join('')}</div>
    </section>
    <section class="card">${title('심은 기록', { iconName: 'scroll' })}${
      state.dex.length
        ? `<ul class="log">${state.dex.map((d) => `<li><span>${treeById(d.species).label} · 정령 ${esc(d.name)}</span><span class="tiny">${esc(d.date)}</span></li>`).join('')}</ul>`
        : `<p class="muted">아직 완성한 세계수가 없어요. 지금 ${STAGES[j.stage].name} 단계, ${j.day}일째예요.</p>`
    }</section>`;
}

export const actions = {};
