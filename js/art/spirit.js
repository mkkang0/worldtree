// 세계수를 돌보는 작은 정령. 표정은 mood, 옷은 art/wardrobe.js.
// 크기 28을 기준으로 그린 뒤 장면에서 줄여서 놓는다 (옷 그림이 이 크기에 맞춰져 있음).
import { radial, glow } from './svg.js';
import { hatArt, faceArt, neckArt } from './wardrobe.js';

const R = 28;

function eyes(mood) {
  const ex = R * 0.36;
  if (mood === 'joy') {
    return [-ex, ex]
      .map((dx) => `<path d="M${dx - 5} 3 Q${dx} -5 ${dx + 5} 3" fill="none" stroke="#3b2f2f" stroke-width="2.6" stroke-linecap="round"/>`)
      .join('');
  }
  return `<g class="blink">${[-ex, ex]
    .map((dx) => `<ellipse cx="${dx}" cy="2" rx="3.4" ry="4.3" fill="#3b2f2f"/><circle cx="${dx + 1.2}" cy="0" r="1.3" fill="#fff"/>`)
    .join('')}</g>`;
}

function mouth(mood) {
  const y = R * 0.36;
  if (mood === 'joy') return `<path d="M-6 ${y - 2} Q0 ${y + 10} 6 ${y - 2} Z" fill="#c4575f"/>`;
  if (mood === 'happy') return `<path d="M-5 ${y} Q0 ${y + 6} 5 ${y}" fill="none" stroke="#3b2f2f" stroke-width="2.3" stroke-linecap="round"/>`;
  return `<path d="M-3.5 ${y + 1} Q0 ${y + 3.5} 3.5 ${y + 1}" fill="none" stroke="#3b2f2f" stroke-width="2.1" stroke-linecap="round"/>`;
}

// x, y = 장면 안의 위치, scale = 크기
export function spiritArt({ x, y, scale, mood, wardrobe = {}, tree, uid }) {
  const pal = tree.palette;
  const body =
    `<defs>${radial(`sp-${uid}`, [[0, '#ffffff'], [0.6, '#fbf7ea'], [1, pal.glow]], { cx: 0.4, cy: 0.32, r: 0.7 })}</defs>` +
    glow(`sh-${uid}`, 0, 0, R * 1.9, pal.glow, 0.5) +
    // 머리 위 새싹
    `<path d="M0 ${-R + 2} q-1 -7 1 -10" fill="none" stroke="${pal.canopy[1]}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<path d="M1 ${-R - 7} q-11 -8 -15 1 q8 4 15 -1Z" fill="${pal.canopy[2]}"/>` +
    `<path d="M1 ${-R - 7} q10 -9 15 0 q-8 5 -15 0Z" fill="${pal.canopy[1]}"/>` +
    // 몸
    `<path d="M0 ${-R} C${R * 0.62} ${-R} ${R} ${-R * 0.45} ${R} ${R * 0.12} C${R} ${R * 0.72} ${R * 0.55} ${R} 0 ${R} C${-R * 0.55} ${R} ${-R} ${R * 0.72} ${-R} ${R * 0.12} C${-R} ${-R * 0.45} ${-R * 0.62} ${-R} 0 ${-R}Z" fill="url(#sp-${uid})"/>` +
    // 작은 팔
    `<ellipse cx="${-R * 0.98}" cy="${R * 0.38}" rx="5" ry="7" fill="#fbf7ea" transform="rotate(25 ${-R * 0.98} ${R * 0.38})"/>` +
    `<ellipse cx="${R * 0.98}" cy="${R * 0.38}" rx="5" ry="7" fill="#fbf7ea" transform="rotate(-25 ${R * 0.98} ${R * 0.38})"/>` +
    // 얼굴
    `<ellipse cx="${-R * 0.6}" cy="${R * 0.3}" rx="5.5" ry="3.5" fill="#ff9fb4" opacity=".65"/>` +
    `<ellipse cx="${R * 0.6}" cy="${R * 0.3}" rx="5.5" ry="3.5" fill="#ff9fb4" opacity=".65"/>` +
    eyes(mood) +
    mouth(mood) +
    faceArt(wardrobe.face, 0, 0, R) +
    neckArt(wardrobe.neck, 0, 0, R) +
    hatArt(wardrobe.hat, 0, -R, R);

  return (
    `<ellipse cx="${x}" cy="${y + R * scale + 4}" rx="${R * scale * 0.75}" ry="3" fill="#000" opacity=".18"/>` +
    `<g transform="translate(${x} ${y}) scale(${scale})"><g class="spirit-bob">${body}</g></g>`
  );
}
