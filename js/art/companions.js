// 정령 친구. 나무 왼쪽(정령 반대편)에 둔다.
// 새 친구: data/items/scenery.js의 companion 아이템과 같은 id로 COMPANIONS에 함수를 추가한다.
import { radial, glow, times, delay } from './svg.js';

const face = (dx = 0, dy = 0, s = 1) =>
  `<g transform="translate(${dx} ${dy}) scale(${s})"><circle cx="-2.4" cy="0" r="1" fill="#3b2f2f"/><circle cx="2.4" cy="0" r="1" fill="#3b2f2f"/><path d="M-1 2 q1 1 2 0" stroke="#3b2f2f" stroke-width=".7" fill="none"/></g>`;

// 둥실 떠 있는 불꽃 모양 정령불
const wisp = (color, light) => (uid) =>
  `<g transform="translate(78 236)"><g class="float">` +
  glow(`wp-${uid}`, 0, 0, 22, color, 0.6) +
  `<defs>${radial(`wb-${uid}`, [[0, '#fff'], [0.5, light], [1, color]], { cx: 0.45, cy: 0.55 })}</defs>` +
  `<path d="M0 -14 Q3 -6 8 -2 Q11 6 0 9 Q-11 6 -8 -2 Q-3 -6 0 -14Z" fill="url(#wb-${uid})"/>` +
  face(0, 1) +
  `</g></g>`;

export const COMPANIONS = {
  'comp-wisp-blue': wisp('#7fb8ff', '#d6ecff'),
  'comp-wisp-gold': wisp('#f2b84a', '#fff0c2'),
  'comp-wisp-pink': wisp('#ff8fb8', '#ffe0ec'),

  'comp-moth': (uid) =>
    `<g transform="translate(82 214)"><g class="float">` +
    glow(`mt-${uid}`, 0, 0, 20, '#e6f7c8', 0.5) +
    `<ellipse cx="-6" cy="-2" rx="7" ry="5" fill="#f4f0d8" transform="rotate(-25 -6 -2)" class="wing-l"/>` +
    `<ellipse cx="6" cy="-2" rx="7" ry="5" fill="#f4f0d8" transform="rotate(25 6 -2)" class="wing-r"/>` +
    `<ellipse cx="-4" cy="4" rx="4" ry="3" fill="#e6dfc0"/><ellipse cx="4" cy="4" rx="4" ry="3" fill="#e6dfc0"/>` +
    `<ellipse cx="0" cy="1" rx="1.8" ry="5" fill="#8a7a5a"/></g></g>`,

  'comp-bird': () =>
    `<g transform="translate(76 300)">` +
    `<ellipse cx="0" cy="0" rx="9" ry="8" fill="#f2c48a"/><ellipse cx="0" cy="3" rx="6" ry="4.5" fill="#fff4e0"/>` +
    `<path d="M-4 -1 q-6 2 -8 8 q6 -1 9 -4Z" fill="#d99a5a"/><path d="M8 -2 l4 1 l-4 1.5Z" fill="#e8a23a"/>` +
    `<circle cx="4" cy="-3" r="1.1" fill="#3b2f2f"/><path d="M-1 8 v3 M2 8 v3" stroke="#a87a4a" stroke-width=".9"/></g>`,

  'comp-bunny': () =>
    `<g transform="translate(74 304)">` +
    `<ellipse cx="-3" cy="-16" rx="2.6" ry="8" fill="#fff" transform="rotate(-10 -3 -16)"/><ellipse cx="3" cy="-16" rx="2.6" ry="8" fill="#fff" transform="rotate(10 3 -16)"/>` +
    `<ellipse cx="-3" cy="-16" rx="1.2" ry="5.5" fill="#ffd0dc" transform="rotate(-10 -3 -16)"/><ellipse cx="3" cy="-16" rx="1.2" ry="5.5" fill="#ffd0dc" transform="rotate(10 3 -16)"/>` +
    `<ellipse cx="0" cy="0" rx="10" ry="8.5" fill="#fff"/><circle cx="0" cy="-6" r="6.5" fill="#fff"/>` +
    face(0, -6, 0.8) +
    `<circle cx="9" cy="3" r="2.6" fill="#fff"/></g>`,

  'comp-owl': () =>
    `<g transform="translate(76 298)">` +
    `<ellipse cx="0" cy="0" rx="10" ry="12" fill="#8a6a4a"/><ellipse cx="0" cy="3" rx="6.5" ry="8" fill="#e8d6b8"/>` +
    `<path d="M-9 -9 l3 -5 l3 4Z M9 -9 l-3 -5 l-3 4Z" fill="#8a6a4a"/>` +
    `<circle cx="-4" cy="-4" r="4" fill="#fff"/><circle cx="4" cy="-4" r="4" fill="#fff"/>` +
    `<circle cx="-4" cy="-4" r="2" fill="#3b2f2f"/><circle cx="4" cy="-4" r="2" fill="#3b2f2f"/>` +
    `<path d="M-1.5 -1 l1.5 2.5 l1.5 -2.5Z" fill="#e8a23a"/>` +
    // 공부 부엉이의 작은 안경테
    `<circle cx="-4" cy="-4" r="4.6" fill="none" stroke="#c9a24a" stroke-width=".8"/><circle cx="4" cy="-4" r="4.6" fill="none" stroke="#c9a24a" stroke-width=".8"/></g>`,

  'comp-butterflies': () =>
    times(3, (i) => {
      const x = [64, 96, 250][i];
      const y = [220, 250, 190][i];
      const c = ['#ffb3c8', '#bfe3ff', '#ffe28a'][i];
      return `<g transform="translate(${x} ${y})"><g class="float" ${delay(i, 3, 3)}><ellipse cx="-3.5" cy="0" rx="4" ry="3" fill="${c}" class="wing-l"/><ellipse cx="3.5" cy="0" rx="4" ry="3" fill="${c}" class="wing-r"/><ellipse cx="0" cy="0" rx=".9" ry="3" fill="#5a4a3a"/></g></g>`;
    }),
};

export function companionArt(id, uid) {
  return COMPANIONS[id] ? COMPANIONS[id](uid) : '';
}
