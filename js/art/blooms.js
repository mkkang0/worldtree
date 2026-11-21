// 꽃·열매 (bloom 슬롯). 세계수 잎 덩어리(clusters) 사이사이에 촘촘히 그린다.
// clusters: art/tree.js가 돌려주는 잎 덩어리 [{ x, y, r }]
// 새 꽃·열매: data/items/scenery.js의 bloom 아이템과 같은 id로 BLOOMS에 '한 개 그리기' 함수를 추가한다.
import { rng, n, glow } from './svg.js';

const flower = (petal, center) => (x, y, s) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288]
    .map((d) => `<ellipse cx="0" cy="-2.3" rx="1.6" ry="2.3" fill="${petal}" transform="rotate(${d})"/>`)
    .join('')}<circle r="1.1" fill="${center}"/></g>`;

// 한 개를 그리는 함수: (x, y, 크기, 순번, uid)
export const BLOOMS = {
  'bloom-white': flower('#ffffff', '#ffd34d'),
  'bloom-pink': flower('#ffb3cb', '#fff0a8'),
  'bloom-cherry': (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -6 q-1 3 -3 6 M0 -6 q2 3 3 6" stroke="#5f8a52" stroke-width=".7" fill="none"/>` +
    `<circle cx="-3" cy="1" r="2.2" fill="#d9363e"/><circle cx="3" cy="1.4" r="2.2" fill="#c42c34"/><circle cx="-3.7" cy=".3" r=".6" fill="#fff" opacity=".7"/></g>`,
  'bloom-orange': (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><circle r="2.8" fill="#f59a2e"/><circle cx="-.9" cy="-.9" r=".8" fill="#ffd08a"/><ellipse cx="1.6" cy="-3" rx="1.8" ry=".9" fill="#4f8a3a" transform="rotate(-30 1.6 -3)"/></g>`,
  'bloom-star': (x, y, s, i, uid) =>
    `<g class="twinkle" style="animation-delay:-${(i % 7) * 0.4}s">${i % 3 ? '' : glow(`bs-${uid}-${i}`, x, y, 7 * s, '#fff59a', 0.5)}` +
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -3.2 L.9 -.9 L3.2 0 L.9 .9 L0 3.2 L-.9 .9 L-3.2 0 L-.9 -.9Z" fill="#fff3a0"/></g>`,
  'bloom-dew': (x, y, s, i) =>
    `<g transform="translate(${x} ${y}) scale(${s})" class="${i % 2 ? 'shimmer' : ''}"><path d="M0 -3 q2.4 2.6 2.4 4.2 a2.4 2.4 0 0 1 -4.8 0 q0 -1.6 2.4 -4.2Z" fill="#bfe7ff" opacity=".9"/><circle cx="-.7" cy=".6" r=".6" fill="#fff"/></g>`,
  // 쉬어 가는 새: 잎 위쪽에 몇 마리만 앉는다 (아래 bloomArt에서 개수를 줄인다)
  'bloom-bird': (x, y, s, i) => {
    const c = ['#7fb8ff', '#ffb36b', '#f2c48a'][i % 3];
    const f = i % 2 ? -1 : 1;
    return `<g transform="translate(${x} ${y - 4}) scale(${f * s * 1.3} ${s * 1.3})"><ellipse cx="0" cy="0" rx="3.6" ry="2.8" fill="${c}"/><circle cx="2.4" cy="-1.8" r="1.9" fill="${c}"/><circle cx="3" cy="-2.1" r=".45" fill="#3b2f2f"/><path d="M4.2 -1.8 l1.4 .4 l-1.4 .5Z" fill="#e8a23a"/><path d="M-3.4 -.4 l-2.4 -1 l.6 1.8Z" fill="${c}"/></g>`;
  },
};

// 몇 개를 그릴지: 잎 덩어리 수에 맞춰 늘어난다 (새는 적게)
export function bloomArt(id, clusters = [], uid) {
  const draw = BLOOMS[id];
  if (!draw || !clusters.length) return '';
  const r = rng('bloom-' + id);
  if (id === 'bloom-bird') {
    // 위쪽 잎 덩어리 몇 곳에 앉는다
    const tops = [...clusters].sort((a, b) => a.y - b.y).slice(0, Math.min(4, Math.ceil(clusters.length / 10)));
    return tops.map((c, i) => draw(n(c.x + (r() - 0.5) * c.r), n(c.y - c.r * 0.7), 1, i, uid)).join('');
  }
  const count = Math.min(46, Math.round(clusters.length * 1.1) + 4);
  let out = '';
  for (let i = 0; i < count; i++) {
    const c = clusters[(i * 7) % clusters.length];
    const a = r() * Math.PI * 2;
    const d = r() * c.r * 0.85;
    out += draw(n(c.x + Math.cos(a) * d), n(c.y + Math.sin(a) * d * 0.8), n(0.85 + r() * 0.45), i, uid);
  }
  return out;
}
