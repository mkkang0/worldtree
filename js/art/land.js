// 대지 소품. 나무 밑동 주변 땅 위(y 280~350)에 그린다. 정령은 오른쪽(x≈226)에 서 있다.
// 새 소품: data/items/scenery.js의 land 아이템과 같은 id로 LAND에 함수를 추가한다.
import { rng, n, linear, radial, glow, times } from './svg.js';

function flower(x, y, color, s = 1) {
  const petals = [0, 72, 144, 216, 288].map((d) => `<ellipse cx="0" cy="-2.6" rx="1.8" ry="2.6" fill="${color}" transform="rotate(${d})"/>`).join('');
  return `<path d="M${x} ${y + 8 * s} q-1 -5 0 -${8 * s}" stroke="#5f8a52" stroke-width="1" fill="none"/><g transform="translate(${x} ${y}) scale(${s})">${petals}<circle r="1.3" fill="#ffe28a"/></g>`;
}

function mushroom(x, y, s, cap) {
  return (
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<path d="M-2.5 0 q-0.5 -6 0.5 -8 h4 q1 2 0.5 8Z" fill="#f6efe0"/>` +
    `<path d="M-8 -7 Q0 -17 8 -7 Q0 -5 -8 -7Z" fill="${cap}"/>` +
    `<circle cx="-3" cy="-10" r="1.3" fill="#fff"/><circle cx="2.5" cy="-11" r="1" fill="#fff"/></g>`
  );
}

export const LAND = {
  'land-flowers': () => {
    const r = rng('flowers');
    const colors = ['#fff', '#ffd6e4', '#ffe9a8', '#d9c8ff'];
    return times(18, (i) => {
      const left = i % 2 === 0;
      const x = n(left ? 30 + r() * 80 : 190 + r() * 90);
      const y = n(306 + r() * 34);
      return flower(x, y, colors[i % 4], n(0.8 + r() * 0.5));
    });
  },

  'land-mushrooms': () =>
    [[70, 312, 1.1, '#d9584a'], [86, 318, 0.8, '#e8a25a'], [104, 316, 0.9, '#d9584a'], [186, 318, 0.7, '#e8a25a'], [58, 322, 0.7, '#c9473a']]
      .map(([x, y, s, c]) => mushroom(x, y, s, c))
      .join(''),

  'land-stones': (uid) =>
    `<defs>${linear(`st-${uid}`, [[0, '#a7a99c'], [1, '#6f7468']])}</defs>` +
    [[40, 300, 9, 26], [74, 296, 7, 20], [262, 302, 8, 24]]
      .map(([x, y, w, h]) => `<path d="M${x - w} ${y} q-1 -${h} ${w} -${h + 3} q${w + 1} 3 ${w} ${h + 3}Z" fill="url(#st-${uid})"/><path d="M${x - 2} ${y - h + 4} v8" stroke="#bff7e2" stroke-width="1" opacity=".7"/>`)
      .join(''),

  'land-spring': (uid) =>
    `<defs>${radial(`sp-${uid}`, [[0, '#d8f3ff'], [0.6, '#8cc8e8'], [1, '#4f8fb0']], { cx: 0.45, cy: 0.4 })}</defs>` +
    `<ellipse cx="88" cy="324" rx="46" ry="11" fill="#5d7d55" opacity=".6"/>` +
    `<ellipse cx="88" cy="322" rx="42" ry="9" fill="url(#sp-${uid})"/>` +
    `<ellipse cx="78" cy="320" rx="14" ry="2" fill="#fff" opacity=".6" class="shimmer"/>`,

  'land-crystals': (uid) => {
    const crystal = (x, y, h, rot) =>
      `<path d="M${x} ${y} l-5 -${h * 0.3} l5 -${h} l5 ${h * 0.7}Z" fill="url(#cy-${uid})" stroke="#fff" stroke-width=".5" transform="rotate(${rot} ${x} ${y})"/>`;
    return (
      `<defs>${linear(`cy-${uid}`, [[0, '#f4eaff'], [0.5, '#b49cff'], [1, '#6f5ad1']], [0, 0, 1, 1])}</defs>` +
      glow(`cyg-${uid}`, 70, 306, 36, '#c9b8ff', 0.5) +
      crystal(66, 312, 26, -12) + crystal(76, 314, 18, 14) + crystal(56, 316, 14, -26) + crystal(258, 312, 16, 10)
    );
  },

  'land-lanterns': (uid) => {
    const lantern = (x, y) =>
      `<g transform="translate(${x} ${y})">${glow(`ll-${uid}-${x}`, 0, -20, 22, '#ffcf7a', 0.55)}` +
      `<rect x="-3" y="-10" width="6" height="10" fill="#8f8a7c"/><rect x="-7" y="-14" width="14" height="4" fill="#9a9586"/>` +
      `<rect x="-5" y="-25" width="10" height="11" fill="#fff0c2" stroke="#8f8a7c" stroke-width="1.5"/>` +
      `<path d="M-9 -25 L0 -32 L9 -25Z" fill="#7d786b"/></g>`;
    return lantern(46, 318) + lantern(262, 322);
  },

  'land-ferns': () => {
    const fern = (x, y, s, flip) => {
      let leaves = '';
      for (let i = 0; i < 6; i++) leaves += `<ellipse cx="${n(2 + i * 3.4)}" cy="${n(-i * 3.6 - 2)}" rx="3.2" ry="1.3" fill="#5f9a5c" transform="rotate(-35 ${n(2 + i * 3.4)} ${n(-i * 3.6 - 2)})"/>`;
      return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M0 0 Q8 -12 20 -24" stroke="#4f7d4a" stroke-width="1.2" fill="none"/>${leaves}</g>`;
    };
    return fern(36, 318, 1.2, false) + fern(60, 322, 0.9, true) + fern(272, 322, 1.1, true) + fern(110, 328, 0.8, false);
  },

  'land-ruins': (uid) =>
    `<defs>${linear(`ru-${uid}`, [[0, '#c9c1ad'], [1, '#8d8673']])}</defs>` +
    `<path d="M22 304 v-46 h8 v46Z M22 258 q16 -20 32 0 h-8 q-8 -10 -16 0Z M46 258 h8 v40 h-8Z" fill="url(#ru-${uid})" opacity=".9"/>` +
    `<path d="M24 280 q5 -6 2 -14" stroke="#7fa86e" stroke-width="1.6" fill="none"/>` +
    `<rect x="252" y="296" width="16" height="9" rx="2" fill="url(#ru-${uid})"/>`,

  // 공부(별빛) 소품
  'land-books': () =>
    `<g transform="translate(62 322)">` +
    `<rect x="-16" y="-6" width="32" height="7" rx="1.5" fill="#3f5f8a"/>` +
    `<rect x="-14" y="-13" width="28" height="7" rx="1.5" fill="#a8553f"/>` +
    `<rect x="-12" y="-20" width="25" height="7" rx="1.5" fill="#c9a24a"/>` +
    `<path d="M-10 -20 v-6 l6 3 6 -3 v6" fill="#fffaf0" stroke="#d9c79a" stroke-width=".6"/></g>`,
};

export function landArt(id, uid) {
  return LAND[id] ? LAND[id](uid) : '';
}
