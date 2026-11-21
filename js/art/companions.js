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

  'comp-panda': () =>
    `<g transform="translate(76 302)">` +
    `<ellipse cx="0" cy="3" rx="11" ry="9" fill="#fff"/>` +
    `<ellipse cx="-7" cy="10" rx="4" ry="3.3" fill="#2b2b2b"/><ellipse cx="7" cy="10" rx="4" ry="3.3" fill="#2b2b2b"/>` +
    `<ellipse cx="-10" cy="2" rx="3" ry="5" fill="#2b2b2b" transform="rotate(20 -10 2)"/>` +
    `<circle cx="-6" cy="-14" r="3.2" fill="#2b2b2b"/><circle cx="6" cy="-14" r="3.2" fill="#2b2b2b"/>` +
    `<circle cx="0" cy="-8" r="8" fill="#fff"/>` +
    `<ellipse cx="-3.2" cy="-8.5" rx="2.2" ry="2.9" fill="#2b2b2b" transform="rotate(20 -3.2 -8.5)"/><ellipse cx="3.2" cy="-8.5" rx="2.2" ry="2.9" fill="#2b2b2b" transform="rotate(-20 3.2 -8.5)"/>` +
    `<circle cx="-3" cy="-9" r=".8" fill="#fff"/><circle cx="3.4" cy="-9" r=".8" fill="#fff"/>` +
    `<ellipse cx="0" cy="-4.6" rx="1.3" ry=".9" fill="#2b2b2b"/>` +
    // 대나무 잎을 쥐고 있다
    `<path d="M9 1 l6 -13" stroke="#6aa84f" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="15" cy="-13" rx="4.5" ry="1.6" fill="#7fc36a" transform="rotate(-55 15 -13)"/>` +
    `<ellipse cx="10" cy="2" rx="3" ry="4.5" fill="#2b2b2b" transform="rotate(-25 10 2)"/></g>`,

  'comp-fox': () =>
    `<g transform="translate(74 304)">` +
    `<path d="M7 7 q15 -1 13 -15 q-6 6 -13 7Z" fill="#e8893a"/><path d="M20 -8 q0 3 -4 4 q2 -2 1 -5Z" fill="#fff4e6"/>` +
    `<ellipse cx="0" cy="3" rx="9" ry="8.5" fill="#e8893a"/><ellipse cx="0" cy="6" rx="5" ry="5.5" fill="#fff4e6"/>` +
    `<path d="M-8 -11 l1 -10 l6 6Z M8 -11 l-1 -10 l-6 6Z" fill="#e8893a"/><path d="M-6.5 -13 l.6 -5 l3 3Z M6.5 -13 l-.6 -5 l-3 3Z" fill="#5a3a2a"/>` +
    `<path d="M-9.5 -9 Q0 -21 9.5 -9 Q4 0 0 0 Q-4 0 -9.5 -9Z" fill="#e8893a"/>` +
    `<path d="M-6.5 -6.5 Q0 -2.5 6.5 -6.5 Q3 0 0 0 Q-3 0 -6.5 -6.5Z" fill="#fff4e6"/>` +
    face(0, -9.5, 0.8) +
    `<ellipse cx="0" cy="-1.6" rx="1.2" ry=".9" fill="#3b2f2f"/></g>`,

  // ✨ 전설: 날개를 파닥이며 떠 있는 아기 용 (가끔 작은 불꽃)
  'comp-dragon': (uid) =>
    `<g transform="translate(78 246)"><g class="float">` +
    glow(`dg-${uid}`, 0, 0, 24, '#9ff0c8', 0.35) +
    `<path d="M8 6 q14 4 12 -8 q-2 6 -8 4" fill="#4fbf8f"/>` +
    `<ellipse cx="-11" cy="-4" rx="10" ry="6" fill="#7fe0b8" transform="rotate(-30 -11 -4)" class="wing-l"/>` +
    `<ellipse cx="11" cy="-4" rx="10" ry="6" fill="#7fe0b8" transform="rotate(30 11 -4)" class="wing-r"/>` +
    `<ellipse cx="0" cy="4" rx="9" ry="10" fill="#5fcf9f"/><ellipse cx="0" cy="7" rx="5.5" ry="6.5" fill="#fff1c8"/>` +
    `<circle cx="0" cy="-9" r="8" fill="#5fcf9f"/>` +
    `<path d="M-5 -15 l-2 -6 l4 4Z M5 -15 l2 -6 l-4 4Z" fill="#ffe08a"/>` +
    face(0, -9, 0.9) +
    `<circle cx="-4.5" cy="-6" r="1.4" fill="#ff9fb4" opacity=".7"/><circle cx="4.5" cy="-6" r="1.4" fill="#ff9fb4" opacity=".7"/>` +
    `<g class="twinkle" style="animation-duration:2.2s"><path d="M8 -8 q6 -2 8 2 q-4 -1 -5 3 q-1 -3 -3 -5Z" fill="#ffb35a"/><circle cx="14" cy="-7" r="1.2" fill="#ffe08a"/></g>` +
    `</g></g>`,

  // ✨ 전설: 빛나는 꼬리 깃털의 불사조
  'comp-phoenix': (uid) =>
    `<defs>${radial(`ph-${uid}`, [[0, '#fff3c4'], [0.5, '#ffb347'], [1, '#e8452e']], { cx: 0.4, cy: 0.35 })}</defs>` +
    `<g transform="translate(80 236)"><g class="float">` +
    glow(`pg-${uid}`, 0, 0, 30, '#ffb347', 0.5) +
    `<path class="swing" style="transform-origin:0 6px" d="M-2 6 q-10 18 -4 34 M0 6 q0 20 8 32 M2 6 q10 14 16 24" stroke="#ffcf5a" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/>` +
    `<circle cx="-6" cy="40" r="2.2" fill="#ff7a45"/><circle cx="8" cy="38" r="2.2" fill="#ffcf5a"/><circle cx="18" cy="30" r="2" fill="#ff7a45"/>` +
    `<path d="M-2 0 Q-22 -16 -26 -2 Q-16 -4 -4 6Z" fill="#ff8a3d" class="wing-l"/>` +
    `<path d="M2 0 Q22 -16 26 -2 Q16 -4 4 6Z" fill="#ff8a3d" class="wing-r"/>` +
    `<ellipse cx="0" cy="2" rx="7" ry="9" fill="url(#ph-${uid})"/>` +
    `<circle cx="0" cy="-8" r="5.5" fill="url(#ph-${uid})"/>` +
    `<path d="M-1 -13 q-3 -6 0 -9 q1 4 3 1 q0 5 -3 8Z" fill="#ffcf5a"/>` +
    `<circle cx="2" cy="-9" r="1" fill="#3b2f2f"/><path d="M5 -8 l3 1 l-3 1Z" fill="#e8a23a"/>` +
    `</g></g>`,

  'comp-butterflies': () =>
    times(3, (i) => {
      const x = [64, 96, 250][i];
      const y = [220, 250, 190][i];
      const c = ['#ffb3c8', '#bfe3ff', '#ffe28a'][i];
      return `<g transform="translate(${x} ${y})"><g class="float" ${delay(i, 3, 3)}><ellipse cx="-3.5" cy="0" rx="4" ry="3" fill="${c}" class="wing-l"/><ellipse cx="3.5" cy="0" rx="4" ry="3" fill="${c}" class="wing-r"/><ellipse cx="0" cy="0" rx=".9" ry="3" fill="#5a4a3a"/></g></g>`;
    }),
};

// 장면 전체에 흩어지는 친구 (위치 고르기 없음)
export const WIDE_COMPANIONS = ['comp-butterflies'];

export function companionArt(id, uid) {
  return COMPANIONS[id] ? COMPANIONS[id](uid) : '';
}
