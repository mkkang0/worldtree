// 섬 소품 그림. 밑동 가운데가 (0, 0)이고 위로(음수 y) 그린다. 크기는 섬 지도 단위 (건물 높이 약 60).
// opts: { uid, on: 켜짐(가로등), lit: 저녁·밤, emblem: 나라 문장 }
import { glow, radial, n } from './svg.js';

const shadow = (w) => `<ellipse cx="0" cy="1" rx="${w}" ry="${n(w * 0.22)}" fill="#1d2a18" opacity=".18"/>`;

const flower = (x, y, color, s = 1) =>
  `<path d="M${x} ${y + 6 * s} q-.6 -3 0 -${6 * s}" stroke="#5f8a52" stroke-width=".9" fill="none"/>` +
  `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map((d) => `<ellipse cx="0" cy="-2.2" rx="1.6" ry="2.2" fill="${color}" transform="rotate(${d})"/>`).join('')}<circle r="1.1" fill="#ffd34d"/></g>`;

export const PROP_ART = {
  'path-stone': () =>
    [[-15, 0, 7], [0, -1.5, 8.5], [15, 0, 7]]
      .map(([x, y, w]) => `<ellipse cx="${x}" cy="${y + 1}" rx="${w}" ry="${n(w * 0.38)}" fill="#8f8574"/><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${n(w * 0.36)}" fill="#d8cfbd"/><ellipse cx="${x - 2}" cy="${y - 0.6}" rx="${n(w * 0.45)}" ry="${n(w * 0.14)}" fill="#efe8da"/>`)
      .join(''),

  fence: () =>
    shadow(22) +
    `<rect x="-21" y="-12.5" width="42" height="2.8" rx="1" fill="#a87a4a"/><rect x="-21" y="-6.5" width="42" height="2.8" rx="1" fill="#a87a4a"/>` +
    [-18, -6, 6, 18].map((x) => `<path d="M${x - 1.8} 0 v-15 l1.8 -2.6 l1.8 2.6 v15Z" fill="#c69a63" stroke="#8a6238" stroke-width=".6"/>`).join(''),

  flowerbed: () =>
    `<ellipse cx="0" cy="0" rx="22" ry="5" fill="#7a5a3a"/><ellipse cx="0" cy="-.8" rx="20" ry="3.8" fill="#8f6a44"/>` +
    [[-15, -5, '#ff8fb1'], [-8, -7, '#ffe066'], [-1, -5, '#fff'], [6, -7, '#c3a6ff'], [13, -5, '#ff8fb1'], [-4, -9, '#ffb36b'], [10, -10, '#fff']]
      .map(([x, y, col]) => flower(x, y, col, 1.1))
      .join(''),

  pot: () =>
    shadow(8) +
    `<path d="M-7 -11 h14 l-2.2 11 h-9.6Z" fill="#d9784a"/><rect x="-8" y="-13" width="16" height="3.4" rx="1.2" fill="#e8956a"/>` +
    `<path d="M-5 -6 h10" stroke="#b5562e" stroke-width=".8" opacity=".6"/>` +
    flower(-4, -20, '#ff8fb1', 1.3) + flower(1, -23, '#ffe066', 1.3) + flower(5, -19, '#fff', 1.2) +
    `<ellipse cx="-6" cy="-14" rx="3" ry="1.6" fill="#6fae5c" transform="rotate(-30 -6 -14)"/><ellipse cx="6" cy="-14" rx="3" ry="1.6" fill="#6fae5c" transform="rotate(30 6 -14)"/>`,

  bush: () =>
    shadow(16) +
    `<ellipse cx="-7" cy="-8" rx="9" ry="8" fill="#4f8a48"/><ellipse cx="7" cy="-8" rx="9" ry="8" fill="#4f8a48"/><ellipse cx="0" cy="-13" rx="10" ry="9" fill="#5f9e55"/>` +
    `<ellipse cx="-3" cy="-17" rx="5" ry="3.4" fill="#7fbf6a" opacity=".8"/>` +
    `<circle cx="-6" cy="-6" r="1.4" fill="#e5605b"/><circle cx="5" cy="-10" r="1.4" fill="#e5605b"/><circle cx="9" cy="-5" r="1.2" fill="#e5605b"/>`,

  sapling: () =>
    shadow(14) +
    `<path d="M-2 0 q-1 -12 0 -22 h4 q1 10 0 22Z" fill="#8a6238"/>` +
    `<circle cx="-8" cy="-26" r="9" fill="#4f8a48"/><circle cx="8" cy="-26" r="9" fill="#4f8a48"/><circle cx="0" cy="-33" r="11" fill="#5f9e55"/>` +
    `<ellipse cx="-3" cy="-38" rx="5" ry="3.4" fill="#7fbf6a" opacity=".8"/>` +
    [[-7, -24], [6, -30], [2, -22], [-2, -34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#e5483f"/><circle cx="${x - 0.7}" cy="${y - 0.7}" r=".6" fill="#fff" opacity=".7"/>`).join(''),

  rock: () =>
    shadow(13) +
    `<path d="M-13 0 q-2 -8 4 -12 q6 -6 13 -2 q8 2 9 10 q0 4 -2 4Z" fill="#9aa09a"/>` +
    `<path d="M-9 -10 q6 -5 13 -2 q5 2 6 5 q-8 -3 -19 -3Z" fill="#7fae64"/>` +
    `<path d="M-6 -4 q4 -2 8 0" stroke="#7a807a" stroke-width=".8" fill="none"/>`,

  bench: () =>
    shadow(18) +
    `<rect x="-15" y="-9" width="2.4" height="9" fill="#6b4a2f"/><rect x="12.6" y="-9" width="2.4" height="9" fill="#6b4a2f"/>` +
    `<rect x="-18" y="-11" width="36" height="3.2" rx="1" fill="#c69a63"/>` +
    `<rect x="-17" y="-20" width="34" height="2.6" rx="1" fill="#b98a55"/><rect x="-17" y="-16" width="34" height="2.6" rx="1" fill="#b98a55"/>` +
    `<rect x="-15" y="-21" width="2" height="12" fill="#6b4a2f"/><rect x="13" y="-21" width="2" height="12" fill="#6b4a2f"/>`,

  lamp: ({ uid, on, lit }) => {
    const bright = on || lit;
    return (
      shadow(7) +
      (bright ? glow(`lp-${uid}`, 0, -42, 30, '#ffd27a', 0.7) : '') +
      `<rect x="-4" y="-3" width="8" height="3" rx="1" fill="#3d4650"/><rect x="-1.3" y="-38" width="2.6" height="36" fill="#4a5560"/>` +
      `<path d="M-6 -38 h12 l-2 -9 h-8Z" fill="${bright ? '#ffe9a8' : '#cfd8dc'}" stroke="#3d4650" stroke-width="1.2"/>` +
      `<path d="M-7.5 -47 h15 l-7.5 -5Z" fill="#3d4650"/><circle cx="0" cy="-53" r="1.4" fill="#3d4650"/>`
    );
  },

  mailbox: () =>
    shadow(8) +
    `<rect x="-1.5" y="-14" width="3" height="14" fill="#6b4a2f"/>` +
    `<path d="M-8 -14 v-8 a8 6 0 0 1 16 0 v8Z" fill="#e5605b"/><rect x="-8" y="-15" width="16" height="2" fill="#c0443f"/>` +
    `<rect x="-4" y="-22" width="8" height="1.6" rx=".8" fill="#7a2a26"/>` +
    `<rect x="8" y="-26" width="1.4" height="9" fill="#555"/><rect x="9.4" y="-26" width="5" height="3.4" fill="#ffd34d"/>`,

  sign: () =>
    shadow(8) +
    `<rect x="-1.5" y="-26" width="3" height="26" fill="#8a6238"/>` +
    `<path d="M-12 -25 h20 l5 4 l-5 4 h-20Z" fill="#c69a63" stroke="#8a6238" stroke-width=".8"/>` +
    `<path d="M-14 -15 h18 v7 h-18 l-5 -3.5Z" fill="#b98a55" stroke="#8a6238" stroke-width=".8"/>` +
    `<path d="M-8 -21 h12 M-10 -11.5 h11" stroke="#7a5432" stroke-width="1" opacity=".55"/>`,

  campfire: ({ uid }) =>
    glow(`cf-${uid}`, 0, -6, 26, '#ffb14a', 0.55) +
    [-11, -6, 0, 6, 11].map((x, i) => `<ellipse cx="${x}" cy="${i % 2 ? -0.5 : 0.5}" rx="3.2" ry="2.4" fill="#9aa09a"/>`).join('') +
    `<rect x="-10" y="-4" width="20" height="3" rx="1.5" fill="#7a5432" transform="rotate(16)"/><rect x="-10" y="-4" width="20" height="3" rx="1.5" fill="#8a6238" transform="rotate(-16)"/>` +
    `<g class="flicker"><path d="M0 -3 q-8 -6 -3 -14 q1 5 4 6 q-1 -8 5 -12 q-1 7 3 11 q3 5 -2 9Z" fill="#ff8a3d"/><path d="M0 -3 q-4 -4 -1 -9 q1 3 3 4 q0 -4 3 -6 q0 5 1 7 q0 3 -6 4Z" fill="#ffd34d"/></g>`,

  pond: ({ uid }) =>
    `<defs>${radial(`pn-${uid}`, [[0, '#cfeef7'], [0.6, '#79b9d4'], [1, '#3f7f9c']], { cx: 0.45, cy: 0.4 })}</defs>` +
    `<ellipse cx="0" cy="0" rx="22" ry="6.5" fill="#6b7a5a"/><ellipse cx="0" cy="-.6" rx="20" ry="5.4" fill="url(#pn-${uid})"/>` +
    `<ellipse cx="7" cy="-1.2" rx="4" ry="1.5" fill="#6fae5c"/><circle cx="8" cy="-1.8" r="1.1" fill="#ffc6d9"/>` +
    `<ellipse class="shimmer" cx="-6" cy="-2" rx="6" ry=".9" fill="#fff" opacity=".6"/>` +
    [-19, -10, 12, 20].map((x, i) => `<ellipse cx="${x}" cy="${i % 2 ? 4 : 2}" rx="2.6" ry="1.6" fill="#a8a296"/>`).join(''),

  scarecrow: () =>
    shadow(10) +
    `<rect x="-1.2" y="-34" width="2.4" height="34" fill="#8a6238"/><rect x="-14" y="-24" width="28" height="2.4" fill="#8a6238"/>` +
    `<path d="M-8 -24 h16 l-2 12 h-12Z" fill="#5f8acb"/><path d="M-3 -24 v12 M3 -24 v12" stroke="#4a6fa8" stroke-width=".8"/>` +
    `<path d="M-14 -24 l-3 3 M-14 -22 l-3 -1 M14 -24 l3 3 M14 -22 l3 -1" stroke="#e8c868" stroke-width="1.2"/>` +
    `<circle cx="0" cy="-31" r="5.5" fill="#e8d4a8"/><circle cx="-2" cy="-31.5" r=".8" fill="#4a3a2c"/><circle cx="2" cy="-31.5" r=".8" fill="#4a3a2c"/><path d="M-1.6 -29 q1.6 1.2 3.2 0" stroke="#4a3a2c" stroke-width=".7" fill="none"/>` +
    `<ellipse cx="0" cy="-35.5" rx="10" ry="2.2" fill="#e8c868"/><path d="M-5 -35.5 q5 -8 10 0Z" fill="#e8c868"/><rect x="-5" y="-37" width="10" height="1.4" fill="#e5605b"/>`,

  flagpole: ({ emblem }) =>
    shadow(7) +
    `<rect x="-3" y="-3" width="6" height="3" rx="1" fill="#8a8f96"/><rect x="-1" y="-52" width="2" height="50" fill="#b8bcc2"/><circle cx="0" cy="-53" r="2" fill="#ffd34d"/>` +
    `<g class="swing" style="transform-origin:1px -50px"><path d="M1 -50 h20 q-3 6 0 13 h-20Z" fill="#fffaf0" stroke="#d9b45a" stroke-width=".8"/>` +
    `<text x="10.5" y="-40" font-size="9" text-anchor="middle">${emblem || '🌳'}</text></g>`,

  balloon: () =>
    `<rect x="-2.5" y="-3" width="5" height="3" rx="1" fill="#8a8f96"/>` +
    `<g class="float"><path d="M0 -3 q-3 -12 -5 -24 M0 -3 q2 -14 5 -28 M0 -3 q0 -10 0 -20" stroke="#ddd" stroke-width=".6" fill="none"/>` +
    `<ellipse cx="-5" cy="-31" rx="5.5" ry="6.8" fill="#ff8fb1"/><ellipse cx="5" cy="-35" rx="5.5" ry="6.8" fill="#8fd0ff"/><ellipse cx="0" cy="-26" rx="5.5" ry="6.8" fill="#ffe066"/>` +
    `<ellipse cx="-6.5" cy="-33" rx="1.4" ry="2.2" fill="#fff" opacity=".6"/><ellipse cx="3.5" cy="-37" rx="1.4" ry="2.2" fill="#fff" opacity=".6"/><ellipse cx="-1.5" cy="-28" rx="1.4" ry="2.2" fill="#fff" opacity=".6"/></g>`,
};

export const propArt = (id, opts = {}) => (PROP_ART[id] ? PROP_ART[id](opts) : '');

// 소품 가게 · 보관함의 작은 그림
export function propThumb(id, uid, opts = {}) {
  const tall = ['lamp', 'flagpole', 'balloon', 'sapling', 'scarecrow'].includes(id);
  const vb = tall ? '-30 -58 60 62' : '-26 -30 52 36';
  return `<svg viewBox="${vb}" aria-hidden="true">${propArt(id, { uid, ...opts })}</svg>`;
}

