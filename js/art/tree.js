// 세계수 그림. growth(0~1)에 따라 매일 조금씩 커지고, stage에 따라 뿌리·꽃·열매·빛이 더해진다.
// 색은 data/trees.js의 palette, 가지 장식은 art/ornaments.js가 anchors 위치에 그린다.
import { rng, n, linear, radial, glow, clamp01, lerp } from './svg.js';

export const BASE = { x: 150, y: 292 }; // 나무가 땅에 닿는 점

// 단계별 등장 기준 (core/config.js STAGE_NAMES 순서: 씨앗 0, 새싹 1, 묘목 2, 어린 나무 3, 큰 나무 4, 신목 5, 세계수 6)
const ROOTS_FROM = 3;
const BLOSSOM_FROM = 4;
const FRUIT_FROM = 5;
const CROWN_AT = 6;

/* ---------- 씨앗 · 새싹 ---------- */

function seed(pal, uid) {
  const { x, y } = BASE;
  return (
    glow(`sg-${uid}`, x, y - 8, 34, pal.glow, 0.55) +
    `<ellipse cx="${x}" cy="${y + 2}" rx="26" ry="7" fill="${pal.trunk[0]}" opacity=".55"/>` +
    `<defs>${radial(`sd-${uid}`, [[0, '#fffbe8'], [0.55, pal.seed], [1, pal.trunk[2]]], { cx: 0.4, cy: 0.35 })}</defs>` +
    `<ellipse cx="${x}" cy="${y - 6}" rx="8" ry="10" fill="url(#sd-${uid})"/>` +
    `<path d="M${x} ${y - 16} q2 -6 6 -7" fill="none" stroke="${pal.canopy[1]}" stroke-width="1.6" stroke-linecap="round"/>`
  );
}

function sprout(pal, uid, t) {
  const { x, y } = BASE;
  const h = lerp(16, 34, t);
  const leaf = (dir) => `<path d="M${x} ${n(y - h)} q${dir * 6} -12 ${dir * 18} -9 q${-dir * 6} 10 ${-dir * 18} 9Z" fill="url(#lf-${uid})"/>`;
  return (
    `<defs>${linear(`lf-${uid}`, [[0, pal.canopy[2]], [1, pal.canopy[1]]], [0, 0, 1, 1])}</defs>` +
    glow(`sg-${uid}`, x, y - h, 40, pal.glow, 0.45) +
    `<ellipse cx="${x}" cy="${y + 2}" rx="22" ry="6" fill="${pal.trunk[0]}" opacity=".5"/>` +
    `<path d="M${x} ${y} C${x - 2} ${n(y - h * 0.4)} ${x + 2} ${n(y - h * 0.7)} ${x} ${n(y - h)}" fill="none" stroke="${pal.trunk[2]}" stroke-width="2.4" stroke-linecap="round"/>` +
    leaf(-1) +
    leaf(1)
  );
}

/* ---------- 나무 ---------- */

// 수관(잎 덩어리) 배치 틀. 넓게 퍼진 우산 모양. 가운데 가까운 것부터 먼저 나타난다.
function clusterTemplate(seedId) {
  const r = rng('crown-' + seedId);
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const u = r() * 2 - 1;
    const edge = Math.sqrt(1 - u * u);
    pts.push({ u: u * 0.95, v: -edge * (0.1 + 0.9 * r()) + 0.32 * (r() - 0.25), s: 0.75 + r() * 0.5, k: r() });
  }
  return pts.sort((a, b) => a.u * a.u + a.v * a.v * 1.6 - (b.u * b.u + b.v * b.v * 1.6));
}

function trunkPath(x, y, h, wb, wt, bend) {
  const top = y - h;
  const flare = wb * 0.55; // 밑동이 넓게 퍼짐
  return (
    `M${n(x - wb / 2 - flare)} ${y}` +
    ` C${n(x - wb / 2)} ${n(y - 6)} ${n(x - wb * 0.32)} ${n(y - h * 0.35)} ${n(x - wt / 2 + bend)} ${n(top)}` +
    ` L${n(x + wt / 2 + bend)} ${n(top)}` +
    ` C${n(x + wb * 0.32)} ${n(y - h * 0.35)} ${n(x + wb / 2)} ${n(y - 6)} ${n(x + wb / 2 + flare)} ${y} Z`
  );
}

// 끝이 가늘어지는 곡선(뿌리·가지)을 면으로 그린다
function taper(x0, y0, x1, y1, w, sag) {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + sag;
  return `M${n(x0 - w)} ${n(y0)} Q${n(mx - w * 0.3)} ${n(my - w * 0.3)} ${n(x1)} ${n(y1)} Q${n(mx + w * 0.3)} ${n(my + w * 0.5)} ${n(x0 + w)} ${n(y0)} Z`;
}

export function treeArt({ growth, stage, tree, uid }) {
  const pal = tree.palette;
  if (stage === 0) return { svg: seed(pal, uid), anchors: [], clusters: [], top: BASE.y - 30 };
  if (stage === 1) return { svg: sprout(pal, uid, clamp01(growth / 0.07)), anchors: [], clusters: [], top: BASE.y - 50 };

  const { x, y } = BASE;
  const t = clamp01((growth - 0.07) / 0.93); // 묘목~세계수 사이 진행도
  const e = Math.pow(t, 0.7);
  const r = rng('tree-' + tree.id);
  // 다 자라면 수관이 장면 폭을 거의 채우고, 줄기는 굵게 꼬인다
  const h = lerp(44, 128, e);
  const wb = lerp(6, 58, e);
  const wt = lerp(3, 24, e);
  const bend = lerp(0, 5, e) * (r() > 0.5 ? 1 : -1);
  const rx = lerp(24, 132, e);
  const ry = lerp(24, 78, e);
  const top = y - h;
  const cx = x + bend;
  const cy = top - ry * lerp(0.35, 0.45, e); // 크면 수관이 줄기 위로 떠서 큰 가지가 드러난다
  const leaf = lerp(14, 28, e);

  const clusters = clusterTemplate(tree.id)
    .slice(0, Math.round(lerp(6, 86, e)))
    .map((p) => ({ x: cx + p.u * rx, y: cy + p.v * ry, r: leaf * p.s, k: p.k }))
    .sort((a, b) => a.y - b.y); // 위쪽부터 그려 아래쪽 잎이 앞에 오게

  let defs =
    linear(`tk-${uid}`, [[0, pal.trunk[0]], [0.3, pal.trunk[1]], [0.55, pal.trunk[2]], [0.8, pal.trunk[1]], [1, pal.trunk[0]]], [0, 0, 1, 0]) +
    radial(`cp-${uid}`, [[0, pal.canopy[2]], [0.55, pal.canopy[1]], [1, pal.canopy[1]]], { cx: 0.36, cy: 0.28, r: 0.85 }) +
    radial(`ch-${uid}`, [[0, '#ffffff', 0.22], [1, '#ffffff', 0]]);
  let back = '';
  let front = '';

  // 신목·세계수: 뒤쪽으로 솟는 빛기둥
  if (stage >= CROWN_AT - 1) {
    defs += linear(`pl-${uid}`, [[0, pal.glow, 0], [0.55, pal.glow, stage >= CROWN_AT ? 0.32 : 0.18], [1, pal.glow, 0]], [0, 0, 1, 0]);
    back += `<rect class="ray" x="${n(cx - rx * 0.45)}" y="0" width="${n(rx * 0.9)}" height="${n(cy)}" fill="url(#pl-${uid})"/>`;
  }

  // 뒤쪽 후광
  if (t > 0.3) back += glow(`tg-${uid}`, cx, cy, rx * 1.35, pal.glow, lerp(0.12, 0.45, t));

  // 수관이 땅에 드리운 그림자
  back += `<ellipse cx="${n(cx)}" cy="${y + 4}" rx="${n(rx * 0.85)}" ry="${n(lerp(3, 9, e))}" fill="#000" opacity="${n(lerp(0.06, 0.16, e))}"/>`;

  // 뒤쪽 잎 덩어리: 어둡게 한 겹 더 깔아 수관이 둥글고 깊어 보이게
  back += clusters
    .filter((_, i) => i % 3 === 0)
    .map((c) => `<ellipse cx="${n(c.x - c.r * 0.15)}" cy="${n(c.y - c.r * 0.4)}" rx="${n(c.r * 1.15)}" ry="${n(c.r * 0.9)}" fill="${pal.canopy[0]}" opacity=".9"/>`)
    .join('');

  // 뿌리: 땅 위로 드러나 굽이친다
  if (stage >= ROOTS_FROM) {
    const count = Math.round(lerp(2, 12, t));
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      const reach = lerp(20, 140, e) * (0.45 + 0.55 * (((i * 37) % 10) / 10));
      const drop = 2 + ((i * 5) % 10);
      back += `<path d="${taper(x + side * wb * 0.3, y - 3, x + side * reach, y + drop, Math.max(1.5, wb * (i < 4 ? 0.24 : 0.15)), -6 - wb * 0.14)}" fill="url(#tk-${uid})"/>`;
      // 뿌리 위 밝은 결
      if (e > 0.4) back += `<path d="M${n(x + side * wb * 0.35)} ${y - 4} Q${n(x + side * reach * 0.5)} ${n(y - 8 - wb * 0.08)} ${n(x + side * reach * 0.92)} ${n(y + drop - 1)}" fill="none" stroke="${pal.trunk[2]}" stroke-width=".8" opacity=".4"/>`;
    }
  }

  // 큰 가지: 줄기 끝에서 수관 양쪽으로 뻗는다
  const limbs = e > 0.15 ? [[-0.6, 0.28], [0.58, 0.24], [-0.28, -0.1], [0.3, -0.05], [0, -0.4]] : [[0, -0.4]];
  limbs.forEach(([u, v], i) => {
    const w = Math.max(1.4, wt * (i < 2 ? 0.5 : 0.34));
    back += `<path d="${taper(cx + u * wt * 0.3, top + 8, cx + u * rx, cy + v * ry, w, -8 - e * 6)}" fill="url(#tk-${uid})"/>`;
  });

  // 줄기와 껍질 무늬
  back += `<path d="${trunkPath(x, y, h, wb, wt, bend)}" fill="url(#tk-${uid})"/>`;
  // 큰 나무는 줄기 위로 꼬여 올라가는 가닥 두 줄
  if (e > 0.3) {
    [-1, 1].forEach((side) => {
      const sx = x + side * wb * 0.42;
      back += `<path d="M${n(sx - side * wb * 0.12)} ${y - 2} C${n(sx + side * wb * 0.1)} ${n(y - h * 0.3)} ${n(x - side * wb * 0.3)} ${n(y - h * 0.62)} ${n(cx + side * wt * 0.35)} ${n(top + 6)} L${n(cx + side * wt * 0.12)} ${n(top + 8)} C${n(x - side * wb * 0.38)} ${n(y - h * 0.6)} ${n(sx - side * wb * 0.02)} ${n(y - h * 0.32)} ${n(sx - side * wb * 0.32)} ${y - 2}Z" fill="${side < 0 ? pal.trunk[2] : pal.trunk[0]}" opacity=".35"/>`;
    });
  }
  // 빛 받는 왼쪽 면
  back += `<path d="${trunkPath(x - wb * 0.18, y, h * 0.96, wb * 0.28, wt * 0.3, bend)}" fill="#fff" opacity=".08"/>`;
  // 옹이
  if (e > 0.35) {
    const kx = x + (r() - 0.5) * wb * 0.3;
    const ky = y - h * (0.35 + r() * 0.2);
    back += `<ellipse cx="${n(kx)}" cy="${n(ky)}" rx="${n(wt * 0.2)}" ry="${n(wt * 0.3)}" fill="${pal.trunk[0]}"/><ellipse cx="${n(kx)}" cy="${n(ky)}" rx="${n(wt * 0.3)}" ry="${n(wt * 0.42)}" fill="none" stroke="${pal.trunk[2]}" stroke-width=".8" opacity=".5"/>`;
  }
  // 밑동의 이끼
  if (stage >= ROOTS_FROM) {
    for (let i = 0; i < 5; i++) {
      const mx = x + (i - 2) * wb * 0.22;
      back += `<ellipse cx="${n(mx)}" cy="${n(y - 2 - (i % 2) * 3)}" rx="${n(wb * 0.12 + 1)}" ry="${n(2 + (i % 3))}" fill="${i % 2 ? pal.canopy[0] : pal.canopy[1]}" opacity=".75"/>`;
    }
  }
  const barks = Math.round(lerp(4, 8, e));
  for (let i = 0; i < barks; i++) {
    const ox = (i - (barks - 1) / 2) * wb * (0.64 / barks);
    back += `<path d="M${n(x + ox * 1.3)} ${y - 3} C${n(x + ox)} ${n(y - h * 0.4)} ${n(cx + ox * 0.5)} ${n(top + h * 0.3)} ${n(cx + ox * 0.35)} ${n(top + 4)}" fill="none" stroke="${i % 2 ? pal.trunk[0] : pal.trunk[2]}" stroke-width="${n(lerp(0.5, 1.6, e))}" opacity=".35"/>`;
  }

  // 수관: 잎 그림자 → 잎 → 빛 받는 면
  // 잎 덩어리는 살짝 납작한 타원이라 공처럼 보이지 않는다
  front += clusters
    .map(
      (c) =>
        `<ellipse cx="${n(c.x + c.r * 0.1)}" cy="${n(c.y + c.r * 0.22)}" rx="${n(c.r * 1.12)}" ry="${n(c.r * 0.86)}" fill="${pal.canopy[0]}"/>` +
        `<ellipse cx="${n(c.x)}" cy="${n(c.y)}" rx="${n(c.r * 1.06)}" ry="${n(c.r * 0.82)}" fill="url(#cp-${uid})"/>` +
        (c.k > 0.7 ? `<ellipse cx="${n(c.x - c.r * 0.3)}" cy="${n(c.y - c.r * 0.3)}" rx="${n(c.r * 0.5)}" ry="${n(c.r * 0.36)}" fill="url(#ch-${uid})"/>` : '')
    )
    .join('');

  // 색 섞기: 몇몇 잎 덩어리는 따뜻한 빛(열매 색), 몇몇은 연둣빛으로 (그림 같은 색 변화)
  clusters.forEach((c, i) => {
    if (i % 7 === 3) front += `<ellipse cx="${n(c.x + c.r * 0.15)}" cy="${n(c.y + c.r * 0.1)}" rx="${n(c.r * 0.8)}" ry="${n(c.r * 0.6)}" fill="${pal.fruit}" opacity=".28"/>`;
    else if (i % 5 === 1) front += `<ellipse cx="${n(c.x - c.r * 0.2)}" cy="${n(c.y - c.r * 0.15)}" rx="${n(c.r * 0.75)}" ry="${n(c.r * 0.55)}" fill="${pal.canopy[2]}" opacity=".22"/>`;
  });

  // 수관 전체 명암: 잎 덩어리 모양으로 잘라 위는 밝게, 아래는 어둡게
  if (e > 0.15) {
    const clip = clusters.map((c) => `<ellipse cx="${n(c.x)}" cy="${n(c.y)}" rx="${n(c.r * 1.12)}" ry="${n(c.r * 0.88)}"/>`).join('');
    defs +=
      `<clipPath id="cc-${uid}">${clip}</clipPath>` +
      linear(`cs-${uid}`, [[0, '#ffffff', 0.16], [0.45, '#ffffff', 0], [0.7, '#000', 0.12], [1, '#000', 0.4]]) +
      radial(`cl-${uid}`, [[0, '#fff6d8', 0.3], [1, '#fff6d8', 0]], { cx: 0.3, cy: 0.2, r: 0.6 });
    const bx = n(cx - rx - leaf * 1.3);
    const by = n(cy - ry - leaf * 1.3);
    const bw = n(rx * 2 + leaf * 2.6);
    const bh = n(ry * 1.6 + leaf * 2.6);
    front += `<g clip-path="url(#cc-${uid})"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#cs-${uid})"/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#cl-${uid})"/></g>`;
  }

  // 붓결: 잎 덩어리 위의 짧은 곡선 (손으로 그린 듯한 잎 질감)
  const strokes = Math.round(lerp(0, 3, e));
  clusters.forEach((c) => {
    for (let k = 0; k < strokes; k++) {
      const a = r() * Math.PI * 2;
      const d = c.r * r() * 0.7;
      const sx = c.x + Math.cos(a) * d;
      const sy = c.y + Math.sin(a) * d * 0.8;
      const L = c.r * (0.3 + r() * 0.25);
      front += `<path d="M${n(sx - L / 2)} ${n(sy)} q${n(L / 2)} ${n(-L * 0.45)} ${n(L)} 0" fill="none" stroke="${k % 2 ? pal.canopy[2] : pal.canopy[0]}" stroke-width="${n(0.7 + e * 0.6)}" stroke-linecap="round" opacity="${k % 2 ? 0.5 : 0.35}"/>`;
    }
  });

  // 잎 결: 빛 받는 왼쪽 위에 작은 잎 모양을 겹친다
  const perCluster = Math.round(lerp(1, 4, e));
  clusters.forEach((c) => {
    for (let k = 0; k < perCluster; k++) {
      const a = -Math.PI * (0.35 + r() * 0.55);
      const d = c.r * (0.25 + r() * 0.55);
      const s = c.r * (0.22 + r() * 0.12);
      const lx = c.x + Math.cos(a) * d * 1.05;
      const ly = c.y + Math.sin(a) * d * 0.8;
      front += `<path d="M0 ${n(-s)} Q${n(s * 0.55)} 0 0 ${n(s)} Q${n(-s * 0.55)} 0 0 ${n(-s)}Z" transform="translate(${n(lx)} ${n(ly)}) rotate(${Math.round(r() * 180 - 90)})" fill="${r() > 0.4 ? pal.canopy[2] : pal.canopy[1]}" opacity="${n(0.45 + r() * 0.35)}"/>`;
    }
    // 위쪽 가장자리에 얇은 빛
    if (c.k > 0.45) front += `<path d="M${n(c.x - c.r * 0.75)} ${n(c.y - c.r * 0.3)} Q${n(c.x - c.r * 0.1)} ${n(c.y - c.r * 1.02)} ${n(c.x + c.r * 0.55)} ${n(c.y - c.r * 0.55)}" fill="none" stroke="${pal.canopy[2]}" stroke-width="1.1" stroke-linecap="round" opacity=".45"/>`;
  });

  // 가장자리의 작은 잎들 (윤곽을 부드럽게)
  const fringe = Math.round(lerp(10, 70, e));
  for (let i = 0; i < fringe; i++) {
    const c = clusters[(i * 3) % clusters.length];
    const a = -Math.PI * (0.05 + r() * 0.9);
    const d = c.r * (0.85 + r() * 0.25);
    front += `<ellipse cx="${n(c.x + Math.cos(a) * d * 1.05)}" cy="${n(c.y + Math.sin(a) * d * 0.82)}" rx="${n(2 + r() * 2.4)}" ry="${n(1.6 + r() * 1.6)}" fill="${r() > 0.5 ? pal.canopy[1] : pal.canopy[2]}" opacity=".9"/>`;
  }

  // 잎 사이 반짝임
  const sparkle = Math.round(lerp(4, 26, t));
  for (let i = 0; i < sparkle; i++) {
    const c = clusters[(i * 5) % clusters.length];
    const a = r() * Math.PI * 2;
    const d = r() * c.r * 0.8;
    front += `<circle cx="${n(c.x + Math.cos(a) * d)}" cy="${n(c.y + Math.sin(a) * d)}" r="${n(0.7 + r() * 1)}" fill="${pal.canopy[2]}" opacity="${n(0.35 + r() * 0.5)}"/>`;
  }

  // 꽃
  if (stage >= BLOSSOM_FROM) {
    const count = Math.round(lerp(8, 34, t));
    for (let i = 0; i < count; i++) {
      const c = clusters[(i * 7) % clusters.length];
      const a = r() * Math.PI * 2;
      const d = r() * c.r * 0.8;
      const bx = n(c.x + Math.cos(a) * d);
      const by = n(c.y + Math.sin(a) * d);
      const s = n(1.4 + r() * 1.3);
      front += `<circle cx="${bx}" cy="${by}" r="${s}" fill="${pal.blossom}" opacity=".95"/><circle cx="${bx}" cy="${by}" r="${n(s * 0.4)}" fill="${pal.glow}"/>`;
    }
  }

  // 큰 나무부터: 수관 아래로 늘어진 덩굴
  if (stage >= BLOSSOM_FROM) {
    clusters
      .filter((c) => c.y > cy + ry * 0.05)
      .filter((_, i) => i % 3 === 0)
      .slice(0, 9)
      .forEach((c, i) => {
        const vx = c.x + (r() - 0.5) * c.r;
        const vy = c.y + c.r * 0.6;
        const L = 12 + r() * 22;
        front += `<g class="swing" style="transform-origin:${n(vx)}px ${n(vy)}px;animation-delay:-${(i * 0.6).toFixed(1)}s"><path d="M${n(vx)} ${n(vy)} q${n(2 + r() * 3)} ${n(L / 2)} 0 ${n(L)}" fill="none" stroke="${pal.canopy[0]}" stroke-width=".9"/>` +
          `<ellipse cx="${n(vx + 1)}" cy="${n(vy + L * 0.45)}" rx="1.8" ry="1" fill="${pal.canopy[1]}"/><ellipse cx="${n(vx - 0.5)}" cy="${n(vy + L)}" rx="2" ry="1.2" fill="${pal.canopy[2]}"/></g>`;
      });
  }

  // 아래쪽 가장자리 잎 덩어리 (장식·열매를 매다는 자리)
  const lower = clusters.filter((c) => c.y > cy).sort((a, b) => a.x - b.x);
  const step = Math.max(1, Math.floor(lower.length / 10));
  const hangs = lower.filter((_, i) => i % step === 0).slice(0, 10);

  // 빛나는 열매
  if (stage >= FRUIT_FROM) {
    defs += radial(`fr-${uid}`, [[0, '#fffbe6'], [0.55, pal.fruit], [1, pal.fruit]], { cx: 0.35, cy: 0.3 });
    hangs.slice(0, Math.round(lerp(3, 7, t))).forEach((c, i) => {
      const fx = c.x + (i % 2 ? 0.25 : -0.25) * c.r;
      const fy = c.y + c.r * 0.5;
      front += glow(`fg-${uid}-${i}`, fx, fy, 9, pal.fruit, 0.5) + `<circle cx="${n(fx)}" cy="${n(fy)}" r="3.4" fill="url(#fr-${uid})"/>`;
    });
  }

  // 신목부터: 수관 둘레에 반짝이는 빛 알갱이
  if (stage >= CROWN_AT - 1) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + r() * 0.4;
      const ox = cx + Math.cos(a) * rx * (1.02 + r() * 0.15);
      const oy = cy + Math.sin(a) * ry * (1.0 + r() * 0.2);
      front += `<g class="twinkle" style="animation-delay:-${(i * 0.37).toFixed(2)}s">${glow(`om-${uid}-${i}`, ox, oy, 6, pal.glow, 0.7)}<circle cx="${n(ox)}" cy="${n(oy)}" r="1.3" fill="#fff"/></g>`;
    }
  }

  // 세계수: 밑동을 두르는 빛의 고리
  if (stage >= CROWN_AT) {
    back += `<ellipse class="rune-glow" cx="${x}" cy="${y + 3}" rx="${n(wb * 1.9)}" ry="${n(wb * 0.32)}" fill="none" stroke="${pal.glow}" stroke-width="1.2" stroke-dasharray="3 4" opacity=".8"/>`;
  }

  // 세계수 완성: 수관 위에 떠 있는 빛 고리
  if (stage >= CROWN_AT) {
    front += `<ellipse cx="${n(cx)}" cy="${n(cy - ry - 8)}" rx="${n(rx * 0.32)}" ry="${n(ry * 0.08)}" fill="none" stroke="${pal.glow}" stroke-width="1.4" opacity=".8" class="crown"/>`;
  }

  const anchors = hangs.map((c) => ({ x: n(c.x), y: n(c.y + c.r * 0.75) }));
  // clusters: 꽃·열매(art/blooms.js)를 피울 자리
  return { svg: `<defs>${defs}</defs>${back}${front}`, anchors, top: cy - ry, canopy: { x: cx, y: cy, rx, ry }, clusters: clusters.map((c) => ({ x: n(c.x), y: n(c.y), r: n(c.r) })) };
}
