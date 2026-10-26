// 가지 장식. art/tree.js가 알려주는 anchors(수관 아래 가장자리 점들)에 매단다.
// 새 장식: data/items/scenery.js의 ornament 아이템과 같은 id로 ORNAMENTS에 함수를 추가한다.
import { n, linear, radial, glow, delay } from './svg.js';
import { BASE } from './tree.js';

const S = 1.5; // 장식 크기 (화면에서 잘 보이도록 키움)

// 줄에 매달린 물건 하나: 줄 + 물건
const hang = (a, len, body, i, count) =>
  `<g class="swing" style="transform-origin:${a.x}px ${a.y}px;animation-delay:-${((i / count) * 4).toFixed(2)}s">` +
  `<line x1="${a.x}" y1="${a.y}" x2="${a.x}" y2="${n(a.y + len * S)}" stroke="#d9c79a" stroke-width=".8" opacity=".85"/>` +
  `<g transform="translate(${a.x} ${n(a.y + len * S)}) scale(${S})">${body}</g></g>`;

const every = (anchors, f) => anchors.map((a, i) => f(a, i, anchors.length)).join('');

export const ORNAMENTS = {
  'orn-lanterns': (anchors, uid) =>
    `<defs>${linear(`ln-${uid}`, [[0, '#fff1c4'], [1, '#f0a24c']])}</defs>` +
    every(anchors, (a, i, c) =>
      hang(a, 8 + (i % 3) * 3, glow(`lng-${uid}-${i}`, 0, 4, 11, '#ffcf7a', 0.55) + `<rect x="-3.2" y="0" width="6.4" height="8" rx="2.5" fill="url(#ln-${uid})"/><rect x="-2" y="-1" width="4" height="1.6" fill="#6b4a2f"/>`, i, c)
    ),

  // 수관 아래를 따라 이어지는 꼬마 전구
  'orn-fairy': (anchors) => {
    if (anchors.length < 2) return '';
    const pts = [...anchors].sort((a, b) => a.x - b.x);
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` Q${n((pts[i - 1].x + pts[i].x) / 2)} ${n(Math.max(pts[i - 1].y, pts[i].y) + 10)} ${pts[i].x} ${pts[i].y}`;
    const bulbs = pts.flatMap((p, i) => (i ? [{ x: (pts[i - 1].x + p.x) / 2, y: Math.max(pts[i - 1].y, p.y) + 5 }, p] : [p]));
    const colors = ['#ffe28a', '#ffb3c8', '#bfe3ff', '#c8f2c0'];
    return (
      `<path d="${d}" fill="none" stroke="#e9d9a8" stroke-width=".6" opacity=".7"/>` +
      bulbs.map((b, i) => `<circle cx="${n(b.x)}" cy="${n(b.y)}" r="2.6" fill="${colors[i % 4]}" class="twinkle" ${delay(i, bulbs.length, 2.4)}/>`).join('')
    );
  },

  'orn-ribbons': (anchors) => {
    const colors = ['#e86f7f', '#f2c14e', '#7fb8e8', '#9ad08a', '#c79ae8'];
    return every(anchors, (a, i, c) =>
      hang(a, 2, `<path d="M0 0 q-3 8 1 16 q3 6 -1 12" fill="none" stroke="${colors[i % 5]}" stroke-width="2.4" stroke-linecap="round"/>`, i, c)
    );
  },

  'orn-crystals': (anchors, uid) =>
    `<defs>${linear(`cr-${uid}`, [[0, '#ffffff'], [0.5, '#bfe6ff'], [1, '#b49cff']], [0, 0, 1, 1])}</defs>` +
    every(anchors, (a, i, c) =>
      hang(a, 7 + (i % 2) * 4, glow(`crg-${uid}-${i}`, 0, 5, 10, '#d6ecff', 0.5) + `<path d="M0 0 L4 5 L0 13 L-4 5Z" fill="url(#cr-${uid})" stroke="#fff" stroke-width=".4"/>`, i, c)
    ),

  'orn-apples': (anchors, uid) =>
    `<defs>${radial(`ap-${uid}`, [[0, '#fffbe0'], [0.5, '#f2c14e'], [1, '#b8860b']], { cx: 0.35, cy: 0.3 })}</defs>` +
    every(anchors, (a, i) => `${glow(`apg-${uid}-${i}`, a.x, a.y + 5, 12, '#ffd76a', 0.5)}<circle cx="${a.x}" cy="${n(a.y + 5)}" r="5.2" fill="url(#ap-${uid})"/><path d="M${a.x} ${n(a.y)} q1 -3 4 -3" stroke="#6b4a2f" stroke-width="1" fill="none"/>`),

  'orn-bells': (anchors, uid) =>
    `<defs>${linear(`bl-${uid}`, [[0, '#fff3c4'], [1, '#c9a24a']])}</defs>` +
    every(anchors, (a, i, c) => hang(a, 10, `<path d="M-3.5 7 Q-3.5 0 0 0 Q3.5 0 3.5 7Z" fill="url(#bl-${uid})"/><circle cx="0" cy="8" r="1.1" fill="#8a6a2a"/>`, i, c)),

  'orn-blossom': (anchors) =>
    every(anchors, (a) => {
      const petals = [0, 72, 144, 216, 288].map((d) => `<ellipse cx="0" cy="-3.2" rx="2.2" ry="3.2" fill="#fff" transform="rotate(${d})"/>`).join('');
      return `<g transform="translate(${a.x} ${a.y}) scale(${S})">${petals}<circle r="1.6" fill="#ffd36b"/></g>`;
    }),

  'orn-moons': (anchors, uid) =>
    every(anchors, (a, i, c) =>
      hang(a, 9 + (i % 3) * 3, `${glow(`mn-${uid}-${i}`, 0, 4, 9, '#fff6d8', 0.45)}<path d="M2 0 A5 5 0 1 0 2 9 A4 4 0 1 1 2 0Z" fill="#fff3c4"/>`, i, c)
    ),

  // 줄기에 새겨진 빛나는 룬
  'orn-runes': () => {
    const glyphs = ['ᚠ', 'ᚱ', 'ᛉ', 'ᛟ'];
    return glyphs.map((g, i) => `<text x="${BASE.x + (i % 2 ? 3 : -3)}" y="${BASE.y - 14 - i * 16}" font-size="10" text-anchor="middle" fill="#bff7e2" class="rune-glow" ${delay(i, 4, 3)}>${g}</text>`).join('');
  },

  // 공부(별빛) 장식: 펄럭이는 책장
  'orn-pages': (anchors, uid) =>
    every(anchors, (a, i, c) =>
      hang(a, 6, `<rect x="-4" y="0" width="8" height="10" rx="1" fill="#fffaf0" stroke="#d9c79a" stroke-width=".5"/><line x1="-2.5" y1="3" x2="2.5" y2="3" stroke="#b9a77a" stroke-width=".6"/><line x1="-2.5" y1="5.5" x2="2" y2="5.5" stroke="#b9a77a" stroke-width=".6"/>`, i, c)
    ),
};

export function ornamentArt(id, anchors, uid) {
  return ORNAMENTS[id] ? ORNAMENTS[id](anchors, uid) : '';
}
