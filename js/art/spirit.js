// 세계수를 돌보는 작은 정령. 표정은 mood, 옷은 art/wardrobe.js.
// 크기 28을 기준으로 그린 뒤 장면에서 줄여서 놓는다 (옷 그림이 이 크기에 맞춰져 있음).
import { n, radial, glow, tint } from './svg.js';
import { hatArt, faceArt, neckArt, handArt } from './wardrobe.js';

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

// x, y = 장면 안의 위치, scale = 크기, hues = 옷마다 색 바꾸기 번호 { hat: 2, … } (필터는 장면의 hueDefs)
// motion = 정령 동작 아이템 id (css/motion.css의 .motion-…). 산책은 그림자까지 함께 움직인다.
// light = 장면의 빛 { color, halo } (art/worlds.js lightOf). 없으면(상점 썸네일 등) 원래 색 그대로
// body = 몸 색 (섬 주민은 각자 색, 없으면 세계수 정령의 크림색)
export function spiritArt({ x, y, scale, mood, wardrobe = {}, hues = {}, tree, uid, motion = '', light = null, body: bodyColor = '' }) {
  const pal = tree.palette;
  const bodyPath = `M0 ${-R} C${R * 0.62} ${-R} ${R} ${-R * 0.45} ${R} ${R * 0.12} C${R} ${R * 0.72} ${R * 0.55} ${R} 0 ${R} C${-R * 0.55} ${R} ${-R} ${R * 0.72} ${-R} ${R * 0.12} C${-R} ${-R * 0.45} ${-R * 0.62} ${-R} 0 ${-R}Z`;
  // 장면 빛에 물들기: 몸과 팔 위에 빛 색을 곱하기로 얹고, 아래쪽은 살짝 그늘
  const tintLayer = light
    ? `<g style="mix-blend-mode:multiply" opacity="${Math.min(0.5, light.wash * 0.9 + 0.04).toFixed(2)}" fill="${light.color}"><path d="${bodyPath}"/>` +
      `<ellipse cx="${-R * 0.98}" cy="${R * 0.38}" rx="5" ry="7" transform="rotate(25 ${-R * 0.98} ${R * 0.38})"/><ellipse cx="${R * 0.98}" cy="${R * 0.38}" rx="5" ry="7" transform="rotate(-25 ${R * 0.98} ${R * 0.38})"/></g>` +
      `<defs>${radial(`sd-${uid}`, [[0.55, '#000', 0], [1, '#000', 0.22]], { cx: 0.42, cy: 0.3, r: 0.75 })}</defs><path d="${bodyPath}" fill="url(#sd-${uid})"/>`
    : '';
  const body =
    `<defs>${radial(`sp-${uid}`, [[0, '#ffffff'], [0.6, bodyColor || '#fbf7ea'], [1, bodyColor || pal.glow]], { cx: 0.4, cy: 0.32, r: 0.7 })}</defs>` +
    glow(`sh-${uid}`, 0, 0, R * 1.9, pal.glow, light ? light.halo : 0.5) +
    // 머리 위 새싹
    `<path d="M0 ${-R + 2} q-1 -7 1 -10" fill="none" stroke="${pal.canopy[1]}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<path d="M1 ${-R - 7} q-11 -8 -15 1 q8 4 15 -1Z" fill="${pal.canopy[2]}"/>` +
    `<path d="M1 ${-R - 7} q10 -9 15 0 q-8 5 -15 0Z" fill="${pal.canopy[1]}"/>` +
    // 몸
    `<path d="${bodyPath}" fill="url(#sp-${uid})"/>` +
    // 작은 팔
    `<ellipse cx="${-R * 0.98}" cy="${R * 0.38}" rx="5" ry="7" fill="#fbf7ea" transform="rotate(25 ${-R * 0.98} ${R * 0.38})"/>` +
    `<ellipse cx="${R * 0.98}" cy="${R * 0.38}" rx="5" ry="7" fill="#fbf7ea" transform="rotate(-25 ${R * 0.98} ${R * 0.38})"/>` +
    tintLayer +
    // 얼굴
    `<ellipse cx="${-R * 0.6}" cy="${R * 0.3}" rx="5.5" ry="3.5" fill="#ff9fb4" opacity=".65"/>` +
    `<ellipse cx="${R * 0.6}" cy="${R * 0.3}" rx="5.5" ry="3.5" fill="#ff9fb4" opacity=".65"/>` +
    eyes(mood) +
    mouth(mood) +
    tint(faceArt(wardrobe.face, 0, 0, R), uid, hues.face) +
    tint(neckArt(wardrobe.neck, 0, 0, R), uid, hues.neck) +
    tint(hatArt(wardrobe.hat, 0, -R, R), uid, hues.hat) +
    tint(handArt(wardrobe.hand, R * 0.98, R * 0.38), uid, hues.hand);

  const feet = `transform-origin:${x}px ${y + R * scale}px`;
  const cls = motion ? `motion-${motion.replace('move-', '')}` : '';
  const zzz =
    motion === 'move-sleep'
      ? [0, 1, 2].map((i) => `<text class="zzz" x="${x + R * scale * 0.9}" y="${y - R * scale}" font-size="${n(9 * scale + 3)}" fill="#ffffff" style="animation-delay:-${i}s">z</text>`).join('')
      : '';
  const fy = y + R * scale + 3;
  const shadow =
    `<ellipse cx="${n(x + R * scale * 0.5)}" cy="${n(fy + 1)}" rx="${n(R * scale * 1.1)}" ry="2.6" fill="#000" opacity=".12"/>` +
    `<ellipse cx="${x}" cy="${n(fy)}" rx="${n(R * scale * 0.6)}" ry="2" fill="#000" opacity=".28"/>`;
  const figure = `<g transform="translate(${x} ${y}) scale(${scale})"><g class="spirit-bob">${body}</g></g>`;
  if (motion === 'move-walk') return `<g class="${cls}">${shadow}${figure}</g>`;
  return shadow + (cls ? `<g class="${cls}" style="${feet}">${figure}</g>` : figure) + zzz;
}
