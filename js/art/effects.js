// 빛 효과. 장면 맨 위에 겹쳐 그린다. tree = art/tree.js의 결과(수관 위치 등).
// 새 효과: data/items/scenery.js의 fx 아이템과 같은 id로 EFFECTS에 함수를 추가하고, 움직임은 css/motion.css에.
import { rng, n, linear, glow, times, delay } from './svg.js';
import { BASE } from './tree.js';

export const EFFECTS = {
  'fx-fireflies': (uid) => {
    const r = rng('fireflies');
    return times(12, (i) => {
      const x = n(20 + r() * 260);
      const y = n(120 + r() * 200);
      return `<g class="twinkle" ${delay(i, 12, 3)}>${glow(`ff-${uid}-${i}`, x, y, 8, '#fff59a', 0.6)}<circle cx="${x}" cy="${y}" r="1.4" fill="#fffbd0"/></g>`;
    });
  },

  'fx-motes': () => {
    const r = rng('motes');
    return times(14, (i) => `<circle class="rise" cx="${n(30 + r() * 240)}" cy="${n(300 + r() * 40)}" r="${n(1 + r() * 1.4)}" fill="#fff7d6" opacity=".9" ${delay(i, 14, 9)}/>`);
  },

  'fx-leaves': () => {
    const r = rng('leaves');
    return times(10, (i) => `<ellipse class="fall" cx="${n(20 + r() * 260)}" cy="-8" rx="4" ry="2.2" fill="${['#e8b84a', '#d98a3a', '#f2d27a'][i % 3]}" ${delay(i, 10, 8)}/>`);
  },

  'fx-petals': () => {
    const r = rng('petals');
    return times(12, (i) => `<ellipse class="fall" cx="${n(20 + r() * 260)}" cy="-8" rx="3" ry="2" fill="${i % 2 ? '#ffd1dc' : '#ffffff'}" ${delay(i, 12, 8)}/>`);
  },

  'fx-snow': () => {
    const r = rng('snow');
    return times(18, (i) => `<circle class="fall" cx="${n(10 + r() * 280)}" cy="-6" r="${n(1.2 + r() * 1.4)}" fill="#fff" opacity=".9" ${delay(i, 18, 9)}/>`);
  },

  // 하늘에서 비스듬히 내려오는 빛줄기
  'fx-rays': (uid) =>
    `<defs>${linear(`ry-${uid}`, [[0, '#fff6d8', 0.55], [1, '#fff6d8', 0]])}</defs>` +
    times(4, (i) => `<path class="ray" d="M${40 + i * 34} -10 L${70 + i * 34} -10 L${150 + i * 44} 330 L${110 + i * 44} 330Z" fill="url(#ry-${uid})" ${delay(i, 4, 6)}/>`),

  // 나무 밑동을 도는 룬 고리
  'fx-runes': () => {
    const glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾ'.split('');
    const ring = `<ellipse cx="${BASE.x}" cy="${BASE.y + 4}" rx="74" ry="14" fill="none" stroke="#bff7e2" stroke-width=".8" opacity=".55" class="rune-glow"/>`;
    return (
      ring +
      glyphs
        .map((g, i) => {
          const a = (i / glyphs.length) * Math.PI * 2;
          return `<text x="${n(BASE.x + Math.cos(a) * 74)}" y="${n(BASE.y + 7 + Math.sin(a) * 14)}" font-size="8" text-anchor="middle" fill="#d6fff0" class="rune-glow" ${delay(i, glyphs.length, 3)}>${g}</text>`;
        })
        .join('')
    );
  },

  // 공부(별빛) 효과: 떠오르는 숫자와 기호
  'fx-numbers': () => {
    const marks = ['₩', '∑', '%', '=', '+', '₩', '∑'];
    return marks.map((m, i) => `<text class="rise" x="${30 + ((i * 53) % 240)}" y="320" font-size="${11 + (i % 3) * 3}" text-anchor="middle" fill="${i % 2 ? '#8fe0b8' : '#bcd4ff'}" font-weight="700" ${delay(i, marks.length, 8)}>${m}</text>`).join('');
  },
};

export function effectArt(id, uid, tree) {
  return EFFECTS[id] ? EFFECTS[id](uid, tree) : '';
}
