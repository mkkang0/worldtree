// 섬 건물 그림. 밑면 가운데가 (0, 0)이고 위로 그린다 (폭 약 60, 높이 40~95).
// 새 건물: data/buildings.js에 추가하고 같은 id로 BUILDING_ART에 함수를 넣는다.
import { n, linear, radial, glow, times } from './svg.js';

const shadow = (w) => `<ellipse cx="2" cy="1" rx="${w}" ry="3.5" fill="#000" opacity=".18"/>`;
const smoke = (x, y) =>
  times(3, (i) => `<circle class="rise" cx="${x + i * 1.5}" cy="${y}" r="${2.4 + i * 0.6}" fill="#ffffff" opacity=".7" style="animation-duration:5s;animation-delay:-${i * 1.6}s"/>`);

export const BUILDING_ART = {
  house: (uid, lv = 1) =>
    shadow(26) +
    (lv >= 2
      ? `<g transform="translate(0 -22)"><rect x="-19" y="-24" width="38" height="24" rx="2" fill="#f6e6c6" stroke="#d9c49a"/>` +
        `<rect x="-13" y="-19" width="9" height="8" rx="1.5" fill="#ffe8a0" stroke="#a8553f"/><rect x="4" y="-19" width="9" height="8" rx="1.5" fill="#ffe8a0" stroke="#a8553f"/>` +
        `<rect x="-15" y="-10" width="13" height="2.4" fill="#a8553f"/><circle cx="-12" cy="-11" r="1.4" fill="#ff8fb1"/><circle cx="-7" cy="-11" r="1.4" fill="#ffe066"/></g>`
      : '') +
    `<g transform="translate(0 ${lv >= 2 ? -22 : 0})"><path d="M-27 -26 L0 -48 L27 -26Z" fill="#d9584a"/><path d="M-27 -26 L0 -48 L0 -44 L-23 -26Z" fill="#e8705f"/>` +
    `<rect x="9" y="-48" width="6" height="12" fill="#a8553f"/>${smoke(12, -52)}</g>` +
    `<rect x="-22" y="-28" width="44" height="28" rx="2" fill="#fbf1dc" stroke="#d9c49a"/>` +
    `<rect x="-22" y="-6" width="44" height="6" fill="#e9dcc0"/>` +
    `<rect x="-5" y="-17" width="10" height="17" rx="5" fill="#8a5a3a"/><circle cx="3" cy="-8" r=".9" fill="#ffd34d"/>` +
    `<rect x="-17" y="-22" width="9" height="8" rx="1.5" fill="#ffe8a0" stroke="#a8553f"/><rect x="8" y="-22" width="9" height="8" rx="1.5" fill="#ffe8a0" stroke="#a8553f"/>` +
    `<path d="M-12.5 -22 v8 M12.5 -22 v8" stroke="#a8553f" stroke-width=".8"/>` +
    `<ellipse cx="-24" cy="-1" rx="5" ry="3.5" fill="#6fae5c"/><circle cx="-25" cy="-3" r="1.2" fill="#ff8fb1"/>`,

  well: () =>
    shadow(18) +
    `<path d="M-14 -16 L-14 -40 M14 -16 L14 -40" stroke="#8a5a3a" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M-19 -38 L0 -50 L19 -38Z" fill="#a8553f"/><path d="M-19 -38 L0 -50 L0 -46 L-15 -38Z" fill="#c26a50"/>` +
    `<line x1="-14" y1="-34" x2="14" y2="-34" stroke="#6b4a2f" stroke-width="1.6"/><line x1="2" y1="-34" x2="2" y2="-24" stroke="#555" stroke-width=".8"/>` +
    `<rect x="-2" y="-25" width="8" height="6" rx="1" fill="#8a7a5a"/>` +
    `<ellipse cx="0" cy="-14" rx="17" ry="5" fill="#9aa3a8"/><rect x="-17" y="-14" width="34" height="14" fill="#a9b1b5"/>` +
    `<ellipse cx="0" cy="0" rx="17" ry="4" fill="#8f979b"/><ellipse cx="0" cy="-14" rx="13" ry="3.4" fill="#5fa8d6"/>` +
    `<path d="M-17 -9 h34 M-17 -4 h34" stroke="#8f979b" stroke-width=".8"/><path d="M-9 -14 v14 M5 -14 v14" stroke="#8f979b" stroke-width=".6"/>`,

  field: () =>
    shadow(28) +
    `<ellipse cx="0" cy="-5" rx="28" ry="8" fill="#8a6440"/>` +
    times(3, (i) => `<path d="M-22 ${-9 + i * 4} q22 -3 44 0" stroke="#6b4a2f" stroke-width="1.6" fill="none"/>`) +
    times(9, (i) => {
      const x = -19 + (i % 5) * 9 + (i > 4 ? 4 : 0);
      const y = i > 4 ? -3 : -9;
      return `<g transform="translate(${x} ${y})"><path d="M0 0 q-3 -5 -5 -4 q2 3 5 4Z M0 0 q3 -6 6 -4 q-3 3 -6 4Z" fill="#6fb85a"/>${i % 3 === 0 ? '<path d="M0 0 l-1.5 4 l3 0Z" fill="#f59a2e"/>' : ''}</g>`;
    }) +
    `<path d="M-30 -2 v-9 M-24 -1 v-9 M24 -1 v-9 M30 -2 v-9 M-30 -8 h6 M24 -8 h6" stroke="#c9a26a" stroke-width="1.4" stroke-linecap="round"/>`,

  teahouse: () =>
    shadow(26) +
    `<rect x="-20" y="-26" width="40" height="26" fill="#f6e3c0" stroke="#c9a26a"/>` +
    `<path d="M-26 -26 Q0 -44 26 -26Z" fill="#4f8a6a"/><path d="M-26 -26 Q0 -32 26 -26" fill="none" stroke="#3d6e54" stroke-width="1.2"/>` +
    times(6, (i) => `<path d="M${-24 + i * 8} -26 h8 l-1 6 h-6Z" fill="${i % 2 ? '#fff' : '#e5605b'}"/>`) +
    `<rect x="-14" y="-15" width="12" height="9" rx="1" fill="#ffe8a0" stroke="#a8553f"/><rect x="4" y="-17" width="9" height="17" rx="1" fill="#8a5a3a"/>` +
    `<path d="M-8 -30 q-2 -4 0 -7 M-4 -30 q2 -4 0 -7" stroke="#ffffff" stroke-width="1.2" fill="none" opacity=".7" class="twinkle"/>` +
    `<rect x="-28" y="-8" width="8" height="8" rx="1" fill="#c9a26a"/><circle cx="-24" cy="-10" r="2.4" fill="#fff" stroke="#c9a26a" stroke-width=".6"/>`,

  fountain: (uid) =>
    shadow(26) +
    `<ellipse cx="0" cy="-4" rx="26" ry="7" fill="#b9c3c8"/><ellipse cx="0" cy="-6" rx="23" ry="5.5" fill="#6fb6e0"/>` +
    `<rect x="-3" y="-24" width="6" height="18" fill="#c9d1d5"/><ellipse cx="0" cy="-24" rx="10" ry="3" fill="#b9c3c8"/><ellipse cx="0" cy="-25" rx="8" ry="2" fill="#8fd0f0"/>` +
    `<g class="shimmer"><path d="M0 -26 q-6 -12 -12 -2 M0 -26 q6 -12 12 -2 M0 -26 v-10" stroke="#dff3ff" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>` +
    times(5, (i) => `<circle class="twinkle" cx="${-14 + i * 7}" cy="${-8 + (i % 2) * 2}" r="1" fill="#fff" style="animation-delay:-${i * 0.5}s"/>`) +
    glow(`fn-${uid}`, 0, -20, 18, '#bfe7ff', 0.4),

  windmill: (uid) =>
    shadow(22) +
    `<path d="M-14 0 L-9 -52 L9 -52 L14 0Z" fill="#f3e6cc" stroke="#c9a26a"/>` +
    `<path d="M-11 -52 L0 -64 L11 -52Z" fill="#a8553f"/>` +
    `<rect x="-4" y="-14" width="8" height="14" rx="4" fill="#8a5a3a"/><rect x="-3" y="-38" width="6" height="7" rx="1" fill="#ffe8a0" stroke="#a8553f" stroke-width=".8"/>` +
    `<g transform="translate(0 -52)"><g class="spin-slow" style="animation-duration:9s">` +
    times(4, (i) => `<g transform="rotate(${i * 90})"><rect x="-2" y="-36" width="4" height="34" fill="#8a6a4a"/><rect x="2" y="-34" width="8" height="26" fill="#fffaf0" stroke="#c9a26a" stroke-width=".6"/></g>`) +
    `</g><circle r="3.4" fill="#6b4a2f"/></g>`,

  library: (uid) =>
    shadow(30) +
    `<rect x="-28" y="-6" width="56" height="6" fill="#d9d2c0"/>` +
    `<rect x="-24" y="-36" width="48" height="30" fill="#f4efe2"/>` +
    times(4, (i) => `<rect x="${-21 + i * 13}" y="-34" width="5" height="28" fill="#e3dccb"/>`) +
    `<path d="M-30 -36 L0 -54 L30 -36Z" fill="#3f5f8a"/><path d="M-30 -36 h60" stroke="#2f4a6e" stroke-width="2"/>` +
    `<circle cx="0" cy="-43" r="4" fill="#ffd34d"/><path d="M0 -46 l.9 2 l2.1 .3 l-1.5 1.5 l.4 2 l-1.9 -1 l-1.9 1 l.4 -2 l-1.5 -1.5 l2.1 -.3Z" fill="#fff" opacity=".9"/>` +
    `<rect x="-5" y="-20" width="10" height="14" rx="5" fill="#6b4a2f"/>` +
    `<g transform="translate(-30 -2)"><rect x="0" y="-6" width="10" height="3" fill="#a8553f"/><rect x="1" y="-9" width="9" height="3" fill="#3f5f8a"/><rect x="0" y="-12" width="8" height="3" fill="#c9a24a"/></g>`,

  lighthouse: (uid) =>
    shadow(18) +
    `<defs>${linear(`lh-${uid}`, [[0, '#fff'], [1, '#e8e2d6']], [0, 0, 1, 0])}</defs>` +
    `<path d="M-13 0 L-8 -66 L8 -66 L13 0Z" fill="url(#lh-${uid})" stroke="#c9c2b4"/>` +
    times(3, (i) => `<path d="M${n(-12.2 + i * 1.6)} ${-12 - i * 20} L${n(12.2 - i * 1.6)} ${-12 - i * 20} L${n(11.6 - i * 1.6)} ${-20 - i * 20} L${n(-11.6 + i * 1.6)} ${-20 - i * 20}Z" fill="#e5484d"/>`) +
    `<rect x="-10" y="-72" width="20" height="6" fill="#3d4652"/>` +
    `<rect x="-7" y="-84" width="14" height="12" fill="#fff3b0" stroke="#3d4652" stroke-width="1.4"/>` +
    `<path d="M-9 -84 L0 -94 L9 -84Z" fill="#e5484d"/>` +
    glow(`lg-${uid}`, 0, -78, 22, '#fff3a0', 0.8) +
    `<path class="shimmer" d="M7 -79 L60 -96 L60 -62Z" fill="#fff6c8" opacity=".35"/>` +
    `<rect x="-3" y="-10" width="6" height="10" rx="3" fill="#6b4a2f"/>`,
};

// 레벨 꾸밈: Lv.2 깃발과 꽃밭, Lv.3 금빛 전구줄과 반짝임 (모든 건물 공통)
export function adornArt(lv, uid) {
  let s = '';
  if (lv >= 2) {
    s +=
      `<path d="M30 0 V-44" stroke="#8a6a4a" stroke-width="1.6"/><path class="swing" style="transform-origin:30px -44px" d="M30 -44 l14 4 l-14 5Z" fill="#e5605b"/>` +
      `<ellipse cx="-30" cy="-1" rx="8" ry="3.5" fill="#6fae5c"/>` +
      times(4, (i) => `<circle cx="${-35 + i * 3.4}" cy="${-3 - (i % 2)}" r="1.4" fill="${['#ff8fb1', '#ffe066', '#fff', '#c3a6ff'][i]}"/>`);
  }
  if (lv >= 3) {
    s +=
      `<path d="M-30 -30 Q0 -20 30 -30" fill="none" stroke="#6b4a2f" stroke-width=".6"/>` +
      times(7, (i) => {
        const t = i / 6;
        const x = -30 + t * 60;
        const y = -30 + Math.sin(t * Math.PI) * 9;
        return `<circle class="twinkle" cx="${n(x)}" cy="${n(y)}" r="1.6" fill="${['#ffe066', '#ff8fb1', '#9fd4ff'][i % 3]}" style="animation-delay:-${(i * 0.4).toFixed(1)}s"/>`;
      }) +
      glow(`ad-${uid}`, 0, -24, 40, '#fff3b0', 0.35) +
      `<path class="twinkle" d="M-24 -52 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 l3 -1.2Z" fill="#fff"/>`;
  }
  return s;
}

// 레벨 표시 작은 배지
export const levelBadge = (lv) =>
  lv > 1 ? `<g transform="translate(22 -4)"><circle r="7" fill="${lv >= 3 ? '#ffd34d' : '#fffaf0'}" stroke="#b48c43" stroke-width="1.2"/><text y="3" font-size="8" font-weight="700" text-anchor="middle" fill="#6b4a2f">${lv}</text></g>` : '';

// 레벨 올리는 중: 건물 위에 진행 고리
export function upgradeRing(ratio) {
  const R = 11;
  const C = 2 * Math.PI * R;
  return (
    `<g transform="translate(0 -70)"><circle r="${R}" fill="#fffaf0" stroke="#e8dcc0" stroke-width="3"/>` +
    `<circle r="${R}" fill="none" stroke="#e0a800" stroke-width="3" stroke-linecap="round" stroke-dasharray="${n(C)}" stroke-dashoffset="${n(C * (1 - ratio))}" transform="rotate(-90)"/>` +
    `<text y="4" font-size="10" text-anchor="middle">⬆</text></g>`
  );
}

// 짓는 중: 나무 비계 + 망치 + 진행 고리
export function constructionArt(ratio, uid) {
  const R = 13;
  const C = 2 * Math.PI * R;
  return (
    shadow(22) +
    `<rect x="-20" y="-8" width="40" height="8" fill="#c9a26a" opacity=".6"/>` +
    `<path d="M-18 0 V-38 M18 0 V-38 M-18 -12 H18 M-18 -26 H18 M-18 -38 H18 M-18 0 L18 -26 M18 0 L-18 -26" stroke="#a87a4a" stroke-width="2" stroke-linecap="round" fill="none"/>` +
    `<g transform="translate(0 -56)"><circle r="${R}" fill="#fffaf0" stroke="#e8dcc0" stroke-width="3"/>` +
    `<circle r="${R}" fill="none" stroke="#e0a800" stroke-width="3" stroke-linecap="round" stroke-dasharray="${n(C)}" stroke-dashoffset="${n(C * (1 - ratio))}" transform="rotate(-90)"/>` +
    `<text y="4" font-size="11" text-anchor="middle">🔨</text></g>`
  );
}

// 건물 + 레벨 꾸밈
export const buildingArt = (id, uid, lv = 1) => (BUILDING_ART[id] ? adornArt(lv, uid) + BUILDING_ART[id](uid, lv) : '');
