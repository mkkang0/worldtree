// 하늘 소품. 나무 뒤쪽 하늘에 그린다 (y 0~240 근처).
// 새 소품: data/items/scenery.js의 sky 아이템과 같은 id로 SKY에 함수를 추가한다.
import { rng, n, linear, radial, glow, times, delay } from './svg.js';

export const SKY = {
  'sky-moon': (uid) =>
    glow(`mg-${uid}`, 236, 58, 46, '#fff6d8', 0.6) +
    `<defs><mask id="mm-${uid}"><circle cx="236" cy="58" r="15" fill="#fff"/><circle cx="243" cy="52" r="13" fill="#000"/></mask></defs>` +
    `<circle cx="236" cy="58" r="15" fill="#fbf3d6" mask="url(#mm-${uid})"/>`,

  'sky-stars': (uid) => {
    // 작은 별자리 두 개
    const groups = [
      [[40, 50], [62, 40], [80, 54], [98, 44], [110, 64]],
      [[200, 30], [216, 48], [238, 42], [252, 62]],
    ];
    return groups
      .map(
        (pts) =>
          `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#fff6d8" stroke-width=".7" opacity=".55"/>` +
          pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 1.6 : 2.2}" fill="#fffbe8" class="twinkle" ${delay(i, pts.length, 3)}/>`).join('')
      )
      .join('');
  },

  'sky-aurora': (uid) =>
    `<defs>${linear(`au1-${uid}`, [[0, '#7cf0c4', 0], [0.5, '#7cf0c4', 0.55], [1, '#9b8cff', 0]], [0, 0, 1, 0])}${linear(`au2-${uid}`, [[0, '#9b8cff', 0], [0.5, '#b3a6ff', 0.45], [1, '#7cf0c4', 0]], [0, 0, 1, 0])}</defs>` +
    `<path class="aurora" d="M-10 70 Q60 20 150 60 T310 50 V100 Q220 130 150 100 T-10 120Z" fill="url(#au1-${uid})"/>` +
    `<path class="aurora slow" d="M-10 110 Q80 70 160 104 T310 90 V130 Q220 150 150 132 T-10 150Z" fill="url(#au2-${uid})"/>`,

  'sky-islands': (uid) => {
    const island = (x, y, s) =>
      `<g transform="translate(${x} ${y}) scale(${s})" class="float-slow">` +
      `<path d="M-30 0 Q0 -8 30 0 Q18 22 0 34 Q-18 22 -30 0Z" fill="#7a6650"/>` +
      `<path d="M-30 0 Q0 -10 30 0 Q0 6 -30 0Z" fill="#8fb87c"/>` +
      `<path d="M-8 -3 l4 -16 l4 16Z" fill="#4f7d5b"/><path d="M6 -2 l3 -11 l3 11Z" fill="#5f8f68"/>` +
      `<path d="M18 2 q2 20 0 40" stroke="#cfe9ff" stroke-width="1.4" fill="none" opacity=".7"/></g>`;
    return island(62, 92, 0.9) + island(238, 128, 0.6);
  },

  'sky-clouds': (uid) => {
    const cloud = (x, y, s) =>
      `<g transform="translate(${x} ${y}) scale(${s})" class="drift">` +
      `<ellipse cx="0" cy="0" rx="34" ry="11" fill="url(#cl-${uid})"/><ellipse cx="-12" cy="-7" rx="16" ry="11" fill="url(#cl-${uid})"/><ellipse cx="10" cy="-9" rx="18" ry="13" fill="url(#cl-${uid})"/></g>`;
    return `<defs>${linear(`cl-${uid}`, [[0, '#fff8e6'], [1, '#f3d9a4']])}</defs>` + cloud(70, 70, 1) + cloud(232, 112, 0.8) + cloud(170, 40, 0.55);
  },

  'sky-birds': () =>
    times(6, (i) => {
      const x = 52 + i * 18 + (i % 2) * 6;
      const y = 70 + Math.abs(i - 2.5) * 7;
      return `<path class="flap" d="M${x - 5} ${y} q5 -4 5 0 q0 -4 5 0" fill="none" stroke="#3f4a52" stroke-width="1.3" stroke-linecap="round" ${delay(i, 6, 1.2)}/>`;
    }),

  // ✨ 전설: 나무 뒤로 걸린 무지개
  'sky-rainbow': (uid) => {
    const colors = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#748ffc', '#b197fc'];
    const arcs = colors
      .map((c, i) => {
        const rr = 150 - i * 6;
        return `<path d="M${150 - rr} 300 A${rr} ${rr} 0 0 1 ${150 + rr} 300" fill="none" stroke="${c}" stroke-width="6.5" opacity=".42"/>`;
      })
      .join('');
    const sparks = times(10, (i) => {
      const a = Math.PI * (0.08 + i * 0.093);
      const x = 150 - Math.cos(a) * 132;
      const y = 300 - Math.sin(a) * 132;
      return `<g class="twinkle" ${delay(i, 10, 3)}>${glow(`rb-${uid}-${i}`, x, y, 6, '#ffffff', 0.9)}</g>`;
    });
    return `<g class="shimmer" style="animation-duration:6s">${arcs}</g>${sparks}`;
  },

  'sky-kites': () =>
    [[70, 84, '#e5605b', '#ffd34d'], [228, 58, '#4f93b8', '#ffffff']]
      .map(
        ([x, y, c1, c2], i) =>
          `<g transform="translate(${x} ${y})"><g class="float" ${delay(i, 2, 3.4)}>` +
          `<path d="M0 -12 L9 0 L0 14 L-9 0Z" fill="${c1}"/><path d="M0 -12 V14 M-9 0 H9" stroke="${c2}" stroke-width="1"/>` +
          `<path d="M0 14 q-4 8 2 14 q5 6 0 14" stroke="${c2}" stroke-width="1.2" fill="none"/>` +
          `<circle cx="-1" cy="22" r="1.5" fill="${c2}"/><circle cx="1" cy="34" r="1.5" fill="${c2}"/></g></g>`
      )
      .join(''),

  'sky-fireworks': () =>
    [[70, 70, '#ffd34d', 20], [222, 48, '#ff8fb8', 24], [168, 104, '#9fd4ff', 15]]
      .map(
        ([x, y, c, r], i) =>
          `<g transform="translate(${x} ${y})" class="twinkle" ${delay(i, 3, 3)}>` +
          times(12, (k) => {
            const a = (k * 30 * Math.PI) / 180;
            return `<line x1="${n(Math.cos(a) * r * 0.35)}" y1="${n(Math.sin(a) * r * 0.35)}" x2="${n(Math.cos(a) * r)}" y2="${n(Math.sin(a) * r)}" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`;
          }) +
          times(12, (k) => {
            const a = ((k * 30 + 15) * Math.PI) / 180;
            return `<circle cx="${n(Math.cos(a) * r * 1.12)}" cy="${n(Math.sin(a) * r * 1.12)}" r="1.1" fill="${c}"/>`;
          }) +
          `<circle r="2.2" fill="#fff"/></g>`
      )
      .join(''),

  'sky-planet': (uid) =>
    `<defs>${radial(`pl-${uid}`, [[0, '#ffe2f0'], [0.6, '#d69ad6'], [1, '#7c5aa8']], { cx: 0.35, cy: 0.3 })}</defs>` +
    glow(`pg-${uid}`, 232, 70, 44, '#e2b8ff', 0.4) +
    `<circle cx="232" cy="70" r="17" fill="url(#pl-${uid})"/>` +
    `<ellipse cx="232" cy="70" rx="30" ry="7" fill="none" stroke="#f3dcff" stroke-width="2" opacity=".8" transform="rotate(-18 232 70)"/>`,

  'sky-comet': (uid) =>
    `<defs>${linear(`cm-${uid}`, [[0, '#ffffff', 0], [1, '#fff4c8', 0.9]], [0, 0, 1, 0])}</defs>` +
    `<g class="comet"><path d="M60 40 L200 86 L198 92Z" fill="url(#cm-${uid})"/><circle cx="200" cy="89" r="3.2" fill="#fffbe8"/></g>`,

  'sky-lanterns': (uid) => {
    const r = rng('lanterns');
    return (
      `<defs>${linear(`lt-${uid}`, [[0, '#ffe6a6'], [1, '#f29a4a']])}</defs>` +
      times(7, (i) => {
        const x = n(30 + r() * 240);
        const y = n(40 + r() * 170);
        const s = n(0.6 + r() * 0.6);
        return `<g class="rise" ${delay(i, 7, 14)}><g transform="translate(${x} ${y}) scale(${s})">${glow(`lg-${uid}-${i}`, 0, 0, 16, '#ffc46b', 0.55)}<path d="M-5 -7 h10 l2 12 h-14Z" fill="url(#lt-${uid})"/></g></g>`;
      })
    );
  },
};

export function skyArt(id, uid) {
  return SKY[id] ? SKY[id](uid) : '';
}
