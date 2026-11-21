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

  'land-bamboo': () => {
    const stalk = (x, h, lean) => {
      let nodes = '';
      for (let y = 18; y < h; y += 18) nodes += `<rect x="-3.2" y="${-y}" width="6.4" height="1.6" rx=".8" fill="#5e8f4a"/>`;
      const leaf = (dy, side) => `<ellipse cx="${side * 9}" cy="${-h + dy}" rx="9" ry="2.2" fill="#7fbf6a" transform="rotate(${side * -28} ${side * 2} ${-h + dy})"/>`;
      return `<g transform="translate(${x} 336) rotate(${lean})"><rect x="-2.6" y="${-h}" width="5.2" height="${h}" rx="2.6" fill="#8cc07a"/>${nodes}${leaf(6, 1)}${leaf(16, -1)}${leaf(30, 1)}</g>`;
    };
    return stalk(16, 150, -3) + stalk(34, 110, 2) + stalk(54, 70, -1) + stalk(286, 130, 3) + stalk(270, 86, -2);
  },

  'land-pond': (uid) => {
    const koi = (x, y, color, flip) =>
      `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><g class="drift"><path d="M0 0 q7 -4.5 13 0 q-6 4.5 -13 0Z" fill="${color}"/><path d="M0 0 l-4 -3 v6Z" fill="${color}"/><circle cx="9.5" cy="-.6" r=".7" fill="#3b2f2f"/></g></g>`;
    return (
      `<defs>${radial(`pd-${uid}`, [[0, '#cfeef7'], [0.6, '#79b9d4'], [1, '#3f7f9c']], { cx: 0.45, cy: 0.4 })}</defs>` +
      `<ellipse cx="86" cy="326" rx="52" ry="12.5" fill="#5d7d55" opacity=".6"/>` +
      `<ellipse cx="86" cy="324" rx="48" ry="10.5" fill="url(#pd-${uid})"/>` +
      koi(62, 324, '#ff8a3d', false) +
      koi(110, 326, '#fff4e6', true) +
      `<ellipse cx="96" cy="320" rx="7" ry="2.4" fill="#6fae5c"/><circle cx="98" cy="319.4" r="1.8" fill="#ffc6d9"/>` +
      `<ellipse cx="70" cy="321" rx="12" ry="1.6" fill="#fff" opacity=".5" class="shimmer"/>`
    );
  },

  // 🎉 봄꽃 축제: 체크무늬 돗자리, 도시락 바구니, 흩날린 꽃잎
  'land-picnic': (uid) => {
    const r = rng('picnic');
    let checks = '';
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 3; j++)
        if ((i + j) % 2 === 0) checks += `<path d="M${n(40 + i * 15 + j * 6)} ${n(342 - j * 6)} l15 0 l6 -6 l-15 0Z" fill="#ff9fbf" opacity=".85"/>`;
    return (
      `<defs>${linear(`pk-${uid}`, [[0, '#d9a066'], [1, '#a86f3a']])}</defs>` +
      `<ellipse cx="94" cy="336" rx="64" ry="9" fill="#3f6a3a" opacity=".22"/>` +
      `<path d="M40 342 l90 0 l18 -18 l-90 0Z" fill="#fff6fa"/>` + checks +
      `<path d="M40 342 l90 0 l18 -18 l-90 0Z" fill="none" stroke="#e98aa9" stroke-width="1"/>` +
      // 도시락 바구니
      `<path d="M92 330 h26 l-3 -12 h-20Z" fill="url(#pk-${uid})"/><path d="M95 318 q10 -12 20 0" fill="none" stroke="#a86f3a" stroke-width="2"/>` +
      `<path d="M94 324 h22 M93.5 327 h23" stroke="#8a5a2a" stroke-width=".7" opacity=".6"/>` +
      `<circle cx="101" cy="317" r="3.2" fill="#e5605b"/><circle cx="108" cy="316" r="3" fill="#ffd36b"/>` +
      // 찻잔 두 개
      `<path d="M62 334 h8 l-1 5 h-6Z" fill="#fff"/><path d="M76 331 h8 l-1 5 h-6Z" fill="#fff"/><ellipse cx="66" cy="334" rx="4" ry="1" fill="#c98a5a"/><ellipse cx="80" cy="331" rx="4" ry="1" fill="#c98a5a"/>` +
      times(14, () => {
        const x = n(24 + r() * 130);
        const y = n(300 + r() * 46);
        return `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.3" fill="#ffc6d9" transform="rotate(${n(r() * 180)} ${x} ${y})" opacity=".9"/>`;
      })
    );
  },

  // 🎉 여름 바다 축제: 모래밭, 모래성, 줄무늬 파라솔, 조개
  'land-beach': (uid) =>
    `<defs>${radial(`sd-${uid}`, [[0, '#fff2c8'], [1, '#e8c98a']], { cx: 0.5, cy: 0.4 })}</defs>` +
    `<ellipse cx="88" cy="334" rx="66" ry="13" fill="url(#sd-${uid})"/>` +
    // 파라솔
    `<line x1="58" y1="336" x2="66" y2="284" stroke="#8a6a4a" stroke-width="2"/>` +
    `<path d="M34 292 Q66 262 100 282 Q90 286 84 290 Q76 284 66 286 Q56 284 48 290 Q42 288 34 292Z" fill="#ff8a6b"/>` +
    `<path d="M48 290 Q56 270 66 268 Q62 278 66 286 Q56 284 48 290Z M84 290 Q80 274 66 268 Q76 272 84 290Z" fill="#fffdf6"/>` +
    // 모래성
    `<path d="M96 336 v-14 h4 v-4 h4 v4 h6 v-4 h4 v4 h4 v14Z" fill="#e8c98a" stroke="#c9a463" stroke-width=".8"/>` +
    `<path d="M104 322 v-10 h3 v-3 h3 v3 h3 v10Z" fill="#f0d59c" stroke="#c9a463" stroke-width=".8"/>` +
    `<line x1="108.5" y1="309" x2="108.5" y2="300" stroke="#8a6a4a" stroke-width=".8"/><path d="M108.5 300 l7 2.5 l-7 2.5Z" fill="#4fb3e8"/>` +
    `<path d="M104 336 v-5 a3 3 0 0 1 6 0 v5Z" fill="#c9a463"/>` +
    // 조개 · 불가사리
    `<path d="M132 340 l-5 -6 q5 -5 10 0Z" fill="#ffc6d9"/><path d="M132 340 l-2.5 -6 M132 340 l0 -7 M132 340 l2.5 -6" stroke="#e98aa9" stroke-width=".6"/>` +
    `<path d="M40 340 l2 -4 l2 4 l4 1 l-3 2.5 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -2.5Z" fill="#ff9f5a"/>`,

  // 🎉 겨울 눈꽃 축제: 눈 쌓인 땅과 목도리 두른 눈사람
  'land-snowman': (uid) =>
    `<defs>${radial(`sn-${uid}`, [[0, '#ffffff'], [1, '#dbe8f3']], { cx: 0.4, cy: 0.35 })}</defs>` +
    `<ellipse cx="86" cy="338" rx="62" ry="10" fill="#f4f9fc"/><ellipse cx="60" cy="336" rx="22" ry="5" fill="#fff"/>` +
    `<circle cx="86" cy="320" r="17" fill="url(#sn-${uid})"/>` +
    `<circle cx="86" cy="292" r="12" fill="url(#sn-${uid})"/>` +
    `<path d="M73 300 q13 7 26 0 l0 4 q-13 7 -26 0Z" fill="#e5605b"/><path d="M93 303 l4 12 l-5 1 l-3 -12Z" fill="#e5605b"/>` +
    `<circle cx="82" cy="289" r="1.5" fill="#2b2b33"/><circle cx="90" cy="289" r="1.5" fill="#2b2b33"/>` +
    `<path d="M86 293 l9 2 l-9 1.5Z" fill="#ff8a3d"/>` +
    `<circle cx="86" cy="314" r="1.4" fill="#2b2b33"/><circle cx="86" cy="321" r="1.4" fill="#2b2b33"/>` +
    `<path d="M70 314 l-14 -10 M60 307 l-4 -5 M101 314 l14 -10 M111 307 l4 -5" stroke="#7a5a3a" stroke-width="1.6" stroke-linecap="round"/>` +
    `<path d="M77 282 h18 l-2 -10 h-14Z" fill="#3b4a6b"/><rect x="75" y="281" width="22" height="3" rx="1.5" fill="#2b3550"/>` +
    `<circle cx="128" cy="336" r="5" fill="#fff"/><circle cx="136" cy="338" r="3.5" fill="#f4f9fc"/>`,

  // 🎉 가을 수확 축제 선물: 열매가 넘치는 바구니와 호박, 밀단
  'land-harvest': (uid) =>
    `<defs>${linear(`hv-${uid}`, [[0, '#d9a066'], [1, '#8a5a2a']])}${radial(`pm-${uid}`, [[0, '#ffc06a'], [1, '#d9702a']], { cx: 0.4, cy: 0.35 })}</defs>` +
    `<ellipse cx="88" cy="340" rx="58" ry="7" fill="#3f6a3a" opacity=".25"/>` +
    // 밀단
    `<g stroke="#d9b45a" stroke-width="1.4" stroke-linecap="round">${times(7, (i) => `<path d="M${46 + i * 2} 340 q${(i - 3) * 1.5} -20 ${(i - 3) * 4} -36"/>`)}</g>` +
    times(7, (i) => `<ellipse cx="${n(46 + i * 2 + (i - 3) * 4)}" cy="304" rx="2.4" ry="6" fill="#f0cf6a" transform="rotate(${(i - 3) * 8} ${n(46 + i * 2 + (i - 3) * 4)} 304)"/>`) +
    `<path d="M42 326 h16" stroke="#b5562e" stroke-width="2.4"/>` +
    // 바구니 + 열매
    `<circle cx="80" cy="318" r="6" fill="#e5605b"/><circle cx="92" cy="315" r="6.5" fill="#ffb347"/><circle cx="103" cy="319" r="5.5" fill="#c0392b"/>` +
    `<g fill="#8e5bb5">${times(6, (i) => `<circle cx="${n(86 + (i % 3) * 4)}" cy="${n(320 + Math.floor(i / 3) * 4)}" r="2.4"/>`)}</g>` +
    `<path d="M70 322 h42 l-5 18 h-32Z" fill="url(#hv-${uid})"/>` +
    `<path d="M71 327 h40 M72.5 332 h37 M74 337 h34" stroke="#6b4a2f" stroke-width=".7" opacity=".6"/>` +
    // 호박
    `<ellipse cx="128" cy="334" rx="12" ry="9" fill="url(#pm-${uid})"/><path d="M122 327 q-2 7 0 15 M128 325 v18 M134 327 q2 7 0 15" stroke="#b5562e" stroke-width=".8" fill="none" opacity=".7"/>` +
    `<path d="M128 325 q1 -5 4 -6" stroke="#5f7a3a" stroke-width="2" fill="none" stroke-linecap="round"/>`,

  // ✨ 전설: 세계수 밑동에서 천천히 도는 빛의 마법진
  'land-magic': (uid) => {
    const runes = times(12, (i) => {
      const a = (i * 30 * Math.PI) / 180;
      return `<text x="${n(Math.cos(a) * 58)}" y="${n(Math.sin(a) * 58 + 3)}" font-size="9" text-anchor="middle" fill="#cfe8ff">${'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ'[i]}</text>`;
    });
    return (
      glow(`mg-${uid}`, 150, 304, 80, '#8fd0ff', 0.4) +
      `<g transform="translate(150 304) scale(1 .3)"><g class="spin-slow">` +
      `<circle r="70" fill="none" stroke="#bfe3ff" stroke-width="2.4" opacity=".85"/><circle r="48" fill="none" stroke="#bfe3ff" stroke-width="1.6" stroke-dasharray="6 5" opacity=".8"/>` +
      `<path d="M0 -46 L40 23 L-40 23Z M0 46 L-40 -23 L40 -23Z" fill="none" stroke="#e3f3ff" stroke-width="1.4" opacity=".75"/>` +
      runes +
      `</g></g>` +
      times(8, (i) => `<circle class="rise" cx="${n(100 + i * 14)}" cy="${n(300 + (i % 3) * 3)}" r="1.3" fill="#cfe8ff" style="animation-delay:-${(i * 1.1).toFixed(1)}s"/>`)
    );
  },

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
