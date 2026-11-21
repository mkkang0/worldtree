// 정령의 옷 (머리·얼굴·목). 아이템 id마다 case 하나. 크기 r=28 기준으로 그린다.
// 새 옷: data/items/wardrobe.js에 아이템을 추가하고 여기에 같은 id의 case를 추가한다.

export function hatArt(id, cx, top, r) {
  switch (id) {
    case 'hat-straw':
      return (
        `<path d="M${cx - r * 0.75} ${top + 6} Q${cx} ${top - 26} ${cx + r * 0.75} ${top + 6} Z" fill="#f2d27a"/>` +
        `<rect x="${cx - r * 0.75}" y="${top - 2}" width="${r * 1.5}" height="6" fill="#e5605b"/>` +
        `<ellipse cx="${cx}" cy="${top + 6}" rx="${r * 1.35}" ry="6" fill="#f6dd92" stroke="#e0bd5c" stroke-width="1.5"/>`
      );
    case 'hat-ribbon': {
      const x = cx + r * 0.62;
      const y = top + 8;
      return (
        `<path d="M${x} ${y} L${x - 16} ${y - 9} L${x - 16} ${y + 9} Z" fill="#ff7aa8"/>` +
        `<path d="M${x} ${y} L${x + 16} ${y - 9} L${x + 16} ${y + 9} Z" fill="#ff7aa8"/>` +
        `<circle cx="${x}" cy="${y}" r="5" fill="#ff4f8b"/>`
      );
    }
    case 'hat-beanie':
      return (
        `<path d="M${cx - r * 0.95} ${top + 12} Q${cx} ${top - 30} ${cx + r * 0.95} ${top + 12} Z" fill="#6aa6ff"/>` +
        `<rect x="${cx - r}" y="${top + 8}" width="${r * 2}" height="9" rx="4" fill="#4f8df0"/>` +
        `<circle cx="${cx}" cy="${top - 18}" r="6" fill="#fff"/>`
      );
    case 'hat-party':
      return (
        `<path d="M${cx - 15} ${top + 8} L${cx + 15} ${top + 8} L${cx + 4} ${top - 34} Z" fill="#ff8fb1"/>` +
        `<path d="M${cx - 9} ${top - 6} L${cx + 11} ${top - 6}" stroke="#fff" stroke-width="3" opacity=".8"/>` +
        `<path d="M${cx - 12} ${top + 3} L${cx + 13} ${top + 3}" stroke="#ffe066" stroke-width="3"/>` +
        `<circle cx="${cx + 4}" cy="${top - 36}" r="5" fill="#ffe066"/>`
      );
    case 'hat-chef':
      return (
        `<circle cx="${cx - 13}" cy="${top - 4}" r="11" fill="#fff" stroke="#e3e3e3"/>` +
        `<circle cx="${cx + 13}" cy="${top - 4}" r="11" fill="#fff" stroke="#e3e3e3"/>` +
        `<circle cx="${cx}" cy="${top - 13}" r="13" fill="#fff" stroke="#e3e3e3"/>` +
        `<rect x="${cx - 19}" y="${top}" width="38" height="12" rx="4" fill="#fff" stroke="#e3e3e3"/>`
      );
    case 'hat-sakura-crown': {
      // 🎉 봄꽃 축제 선물: 머리를 두른 벚꽃과 연두 잎
      const sakura = (x, y, s) =>
        `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288]
          .map((d) => `<path d="M0 0 C-3 -3 -3.4 -7 -1 -8 L0 -6.6 L1 -8 C3.4 -7 3 -3 0 0Z" fill="#ffd0e0" stroke="#ff9fbf" stroke-width=".5" transform="rotate(${d})"/>`)
          .join('')}<circle r="1.8" fill="#ffd34d"/></g>`;
      let s = '';
      [-2, -1, 0, 1, 2].forEach((i) => {
        const x = cx + i * r * 0.4;
        const y = top + 4 + i * i * 1.7;
        s += `<ellipse cx="${x + 5}" cy="${y + 2}" rx="4.5" ry="2" fill="#9fd88a" transform="rotate(${20 + i * 10} ${x + 5} ${y + 2})"/>`;
      });
      [-2, -1, 0, 1, 2].forEach((i) => (s += sakura(cx + i * r * 0.4, top + 3 + i * i * 1.7, i === 0 ? 1.15 : 0.95)));
      return s;
    }
    case 'hat-earmuff': {
      // 🎉 겨울 눈꽃 축제 선물: 머리띠와 복슬복슬 귀마개
      const muff = (x) =>
        `<circle cx="${x}" cy="${top + r * 0.78}" r="${r * 0.36}" fill="#f6f2ec"/>` +
        `<circle cx="${x}" cy="${top + r * 0.78}" r="${r * 0.36}" fill="none" stroke="#e8e0d4" stroke-width="2" stroke-dasharray="2 2.5"/>` +
        `<circle cx="${x}" cy="${top + r * 0.78}" r="${r * 0.2}" fill="#e5605b"/>`;
      return `<path d="M${cx - r * 0.94} ${top + r * 0.7} Q${cx} ${top - r * 0.62} ${cx + r * 0.94} ${top + r * 0.7}" fill="none" stroke="#e5605b" stroke-width="4" stroke-linecap="round"/>` + muff(cx - r * 0.96) + muff(cx + r * 0.96);
    }
    case 'hat-flower': {
      let s = '';
      [-2, -1, 0, 1, 2].forEach((i) => {
        const x = cx + i * r * 0.42;
        const y = top + 3 + Math.abs(i) * Math.abs(i) * 1.6;
        s += `<ellipse cx="${x + r * 0.2}" cy="${y + 1}" rx="6" ry="3" fill="#7fcf8a" transform="rotate(${i * 12} ${x} ${y})"/>`;
        s += `<circle cx="${x}" cy="${y}" r="6" fill="${['#ff8fb1', '#ffe066', '#fff', '#ffb36b', '#c3a6ff'][i + 2]}"/><circle cx="${x}" cy="${y}" r="2" fill="#ffb300"/>`;
      });
      return s;
    }
    case 'hat-cat':
      return (
        `<path d="M${cx - r * 0.85} ${top + 12} L${cx - r * 0.7} ${top - 16} L${cx - r * 0.15} ${top + 2} Z" fill="#ffcf99"/>` +
        `<path d="M${cx + r * 0.85} ${top + 12} L${cx + r * 0.7} ${top - 16} L${cx + r * 0.15} ${top + 2} Z" fill="#ffcf99"/>` +
        `<path d="M${cx - r * 0.7} ${top + 4} L${cx - r * 0.64} ${top - 8} L${cx - r * 0.3} ${top + 1} Z" fill="#ffa3a3"/>` +
        `<path d="M${cx + r * 0.7} ${top + 4} L${cx + r * 0.64} ${top - 8} L${cx + r * 0.3} ${top + 1} Z" fill="#ffa3a3"/>`
      );
    case 'hat-bunny':
      return (
        `<ellipse cx="${cx - 11}" cy="${top - 14}" rx="7" ry="22" fill="#fff" stroke="#ececec" transform="rotate(-12 ${cx - 11} ${top - 14})"/>` +
        `<ellipse cx="${cx + 11}" cy="${top - 14}" rx="7" ry="22" fill="#fff" stroke="#ececec" transform="rotate(12 ${cx + 11} ${top - 14})"/>` +
        `<ellipse cx="${cx - 11}" cy="${top - 12}" rx="3.5" ry="15" fill="#ffc2d4" transform="rotate(-12 ${cx - 11} ${top - 12})"/>` +
        `<ellipse cx="${cx + 11}" cy="${top - 12}" rx="3.5" ry="15" fill="#ffc2d4" transform="rotate(12 ${cx + 11} ${top - 12})"/>`
      );
    case 'hat-halo':
      return `<ellipse cx="${cx}" cy="${top - 10}" rx="19" ry="5.5" fill="none" stroke="#ffe27a" stroke-width="4.5"/><ellipse cx="${cx}" cy="${top - 10}" rx="19" ry="5.5" fill="none" stroke="#fff6c2" stroke-width="1.5"/>`;
    case 'hat-santa':
      return (
        `<path d="M${cx - r * 0.8} ${top + 10} L${cx + 12} ${top - 30} L${cx + r * 0.8} ${top + 10} Z" fill="#e5484d"/>` +
        `<rect x="${cx - r * 0.88}" y="${top + 4}" width="${r * 1.76}" height="9" rx="4.5" fill="#fff"/>` +
        `<circle cx="${cx + 12}" cy="${top - 31}" r="5.5" fill="#fff"/>`
      );
    case 'hat-witch':
      return (
        `<path d="M${cx - 15} ${top + 8} L${cx + 5} ${top - 36} L${cx + 15} ${top + 8} Z" fill="#3a2d4f"/>` +
        `<rect x="${cx - 15}" y="${top - 2}" width="30" height="6" fill="#9b6adf"/>` +
        `<ellipse cx="${cx}" cy="${top + 8}" rx="${r * 1.3}" ry="6" fill="#3a2d4f"/>`
      );
    case 'hat-mushroom':
      return (
        `<path d="M${cx - r * 0.98} ${top + 14} Q${cx} ${top - 28} ${cx + r * 0.98} ${top + 14} Z" fill="#e5484d"/>` +
        `<circle cx="${cx - 12}" cy="${top - 2}" r="4" fill="#fff"/><circle cx="${cx + 8}" cy="${top - 8}" r="5" fill="#fff"/><circle cx="${cx + 16}" cy="${top + 4}" r="3" fill="#fff"/>`
      );
    case 'hat-headphones':
      return (
        `<path d="M${cx - r - 1} ${top + r} A${r + 3} ${r + 3} 0 0 1 ${cx + r + 1} ${top + r}" fill="none" stroke="#4a5568" stroke-width="4.5" stroke-linecap="round"/>` +
        `<rect x="${cx - r - 7}" y="${top + r - 10}" width="11" height="20" rx="5" fill="#ff7aa8"/>` +
        `<rect x="${cx + r - 4}" y="${top + r - 10}" width="11" height="20" rx="5" fill="#ff7aa8"/>`
      );
    case 'hat-antenna':
      return (
        `<path d="M${cx - 8} ${top + 4} Q${cx - 16} ${top - 10} ${cx - 14} ${top - 20}" fill="none" stroke="#6b7a70" stroke-width="2.4" stroke-linecap="round"/>` +
        `<path d="M${cx + 8} ${top + 4} Q${cx + 16} ${top - 10} ${cx + 14} ${top - 20}" fill="none" stroke="#6b7a70" stroke-width="2.4" stroke-linecap="round"/>` +
        `<circle cx="${cx - 14}" cy="${top - 22}" r="5" fill="#ffe066"/><circle cx="${cx + 14}" cy="${top - 22}" r="5" fill="#ff8fb1"/>`
      );
    case 'hat-bear':
      return (
        `<circle cx="${cx - r * 0.7}" cy="${top + 5}" r="11" fill="#c8925f"/><circle cx="${cx - r * 0.7}" cy="${top + 6}" r="5.5" fill="#f0c9a0"/>` +
        `<circle cx="${cx + r * 0.7}" cy="${top + 5}" r="11" fill="#c8925f"/><circle cx="${cx + r * 0.7}" cy="${top + 6}" r="5.5" fill="#f0c9a0"/>`
      );
    case 'hat-pencil': {
      const x = cx + r * 0.72;
      const y = top + r * 0.35;
      return (
        `<g transform="rotate(-35 ${x} ${y})">` +
        `<rect x="${x - 22}" y="${y - 3.5}" width="34" height="7" rx="1.5" fill="#ffd34d"/>` +
        `<rect x="${x - 27}" y="${y - 3.5}" width="6" height="7" rx="1.5" fill="#ff9fb4"/>` +
        `<path d="M${x + 12} ${y - 3.5} L${x + 20} ${y} L${x + 12} ${y + 3.5} Z" fill="#f4d3a8"/>` +
        `<path d="M${x + 17.5} ${y - 1.2} L${x + 20} ${y} L${x + 17.5} ${y + 1.2} Z" fill="#3b2f2f"/></g>`
      );
    }
    case 'hat-grad':
      return (
        `<path d="M${cx - r * 0.7} ${top + 10} Q${cx} ${top - 6} ${cx + r * 0.7} ${top + 10} L${cx + r * 0.7} ${top + 2} Q${cx} ${top - 12} ${cx - r * 0.7} ${top + 2} Z" fill="#2d2d3a"/>` +
        `<path d="M${cx - 30} ${top - 6} L${cx} ${top - 17} L${cx + 30} ${top - 6} L${cx} ${top + 4} Z" fill="#3a3a4d"/>` +
        `<path d="M${cx} ${top - 6} L${cx + 22} ${top - 2} L${cx + 22} ${top + 14}" fill="none" stroke="#ffd34d" stroke-width="2"/>` +
        `<circle cx="${cx + 22}" cy="${top + 16}" r="3" fill="#ffd34d"/><circle cx="${cx}" cy="${top - 6}" r="2.5" fill="#ffd34d"/>`
      );
    case 'hat-crown':
      return (
        `<path d="M${cx - 20} ${top + 4} L${cx - 22} ${top - 20} L${cx - 10} ${top - 8} L${cx} ${top - 24} L${cx + 10} ${top - 8} L${cx + 22} ${top - 20} L${cx + 20} ${top + 4} Z" fill="#ffd34d" stroke="#e0a800" stroke-width="1.5" stroke-linejoin="round"/>` +
        `<circle cx="${cx}" cy="${top - 4}" r="3.5" fill="#ff5d73"/>`
      );
    case 'hat-beret':
      return (
        `<ellipse cx="${cx - 3}" cy="${top + 3}" rx="${r * 0.98}" ry="10" fill="#b5493e" transform="rotate(-8 ${cx} ${top})"/>` +
        `<ellipse cx="${cx - 3}" cy="${top + 8}" rx="${r * 0.82}" ry="3.5" fill="#8f342b" transform="rotate(-8 ${cx} ${top})"/>` +
        `<path d="M${cx - 2} ${top - 6} q1 -5 4 -6" stroke="#8f342b" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
      );
    case 'hat-sakura-pin': {
      const flower = (x, y, s) =>
        `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288]
          .map((d) => `<ellipse cx="0" cy="-4.4" rx="3.3" ry="4.6" fill="#ffc6d9" stroke="#ff9fbf" stroke-width=".6" transform="rotate(${d})"/>`)
          .join('')}<circle r="2" fill="#ffd34d"/></g>`;
      return flower(cx + r * 0.58, top + 10, 1) + flower(cx + r * 0.2, top + 4, 0.65);
    }
    case 'hat-tiara':
      return (
        `<path d="M${cx - r * 0.72} ${top + 8} L${cx - r * 0.5} ${top - 6} L${cx - r * 0.25} ${top + 2} L${cx} ${top - 14} L${cx + r * 0.25} ${top + 2} L${cx + r * 0.5} ${top - 6} L${cx + r * 0.72} ${top + 8} Z" fill="#ffd34d" stroke="#e0a800" stroke-width="1.2" stroke-linejoin="round"/>` +
        `<circle cx="${cx}" cy="${top - 3}" r="3.6" fill="#ff6fa8" stroke="#fff" stroke-width=".8"/>` +
        `<circle cx="${cx - r * 0.5}" cy="${top + 1}" r="2.4" fill="#6fc3ff" stroke="#fff" stroke-width=".6"/><circle cx="${cx + r * 0.5}" cy="${top + 1}" r="2.4" fill="#6fc3ff" stroke="#fff" stroke-width=".6"/>` +
        `<path class="twinkle" d="M${cx + 9} ${top - 18} l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 l3 -1.2Z" fill="#fff"/>` +
        `<path class="twinkle" style="animation-delay:-1.5s" d="M${cx - 13} ${top - 10} l.9 2.2 l2.2 .9 l-2.2 .9 l-.9 2.2 l-.9 -2.2 l-2.2 -.9 l2.2 -.9Z" fill="#fff"/>`
      );
    default:
      return '';
  }
}

export function faceArt(id, cx, cy, r) {
  const ex = r * 0.38;
  switch (id) {
    case 'face-glasses':
      return (
        `<circle cx="${cx - ex}" cy="${cy + 2}" r="8.5" fill="#ffffff22" stroke="#4a4a4a" stroke-width="2"/>` +
        `<circle cx="${cx + ex}" cy="${cy + 2}" r="8.5" fill="#ffffff22" stroke="#4a4a4a" stroke-width="2"/>` +
        `<line x1="${cx - ex + 8.5}" y1="${cy + 2}" x2="${cx + ex - 8.5}" y2="${cy + 2}" stroke="#4a4a4a" stroke-width="2"/>`
      );
    case 'face-shades':
      return (
        `<rect x="${cx - ex - 10}" y="${cy - 5}" width="20" height="14" rx="6" fill="#2b2b2b"/>` +
        `<rect x="${cx + ex - 10}" y="${cy - 5}" width="20" height="14" rx="6" fill="#2b2b2b"/>` +
        `<line x1="${cx - ex + 10}" y1="${cy}" x2="${cx + ex - 10}" y2="${cy}" stroke="#2b2b2b" stroke-width="2.5"/>`
      );
    case 'face-star':
    case 'face-heart': {
      const ch = id === 'face-star' ? '✦' : '♥';
      const x = r * 0.66;
      const y = cy + r * 0.3 + 4;
      return (
        `<text x="${cx - x}" y="${y}" font-size="11" text-anchor="middle" fill="#ff5f8f">${ch}</text>` +
        `<text x="${cx + x}" y="${y}" font-size="11" text-anchor="middle" fill="#ff5f8f">${ch}</text>`
      );
    }
    case 'face-whiskers': {
      let s = '';
      [-3.5, 0, 3.5].forEach((dy) => {
        s += `<line x1="${cx - r * 0.55}" y1="${cy + r * 0.3 + dy * 0.5}" x2="${cx - r * 1.02}" y2="${cy + r * 0.3 + dy * 2}" stroke="#3b2f2f" stroke-width="1.3" stroke-linecap="round"/>`;
        s += `<line x1="${cx + r * 0.55}" y1="${cy + r * 0.3 + dy * 0.5}" x2="${cx + r * 1.02}" y2="${cy + r * 0.3 + dy * 2}" stroke="#3b2f2f" stroke-width="1.3" stroke-linecap="round"/>`;
      });
      return s + `<path d="M${cx - 3} ${cy + r * 0.2} L${cx + 3} ${cy + r * 0.2} L${cx} ${cy + r * 0.27} Z" fill="#ff8fa3"/>`;
    }
    case 'face-bandaid':
      return (
        `<rect x="${cx + r * 0.38}" y="${cy + r * 0.2}" width="16" height="7" rx="3.5" fill="#f4c9a0" stroke="#d9a878" transform="rotate(-25 ${cx + r * 0.38 + 8} ${cy + r * 0.2 + 3.5})"/>` +
        `<circle cx="${cx + r * 0.38 + 6}" cy="${cy + r * 0.2 + 4}" r=".9" fill="#c98f5f"/><circle cx="${cx + r * 0.38 + 10}" cy="${cy + r * 0.2 + 2}" r=".9" fill="#c98f5f"/>`
      );
    case 'face-goggles':
      return (
        `<line x1="${cx - r}" y1="${cy + 2}" x2="${cx - ex - 9}" y2="${cy + 2}" stroke="#2b7fff" stroke-width="3"/>` +
        `<line x1="${cx + r}" y1="${cy + 2}" x2="${cx + ex + 9}" y2="${cy + 2}" stroke="#2b7fff" stroke-width="3"/>` +
        `<circle cx="${cx - ex}" cy="${cy + 2}" r="9.5" fill="#9fd4ff66" stroke="#2b7fff" stroke-width="3"/>` +
        `<circle cx="${cx + ex}" cy="${cy + 2}" r="9.5" fill="#9fd4ff66" stroke="#2b7fff" stroke-width="3"/>` +
        `<line x1="${cx - ex + 9}" y1="${cy + 2}" x2="${cx + ex - 9}" y2="${cy + 2}" stroke="#2b7fff" stroke-width="3"/>`
      );
    case 'face-reading':
      return (
        `<path d="M${cx - ex - 9} ${cy + 3} A9 8 0 0 0 ${cx - ex + 9} ${cy + 3} Z" fill="#ffffff33" stroke="#8a5a2b" stroke-width="2"/>` +
        `<path d="M${cx + ex - 9} ${cy + 3} A9 8 0 0 0 ${cx + ex + 9} ${cy + 3} Z" fill="#ffffff33" stroke="#8a5a2b" stroke-width="2"/>` +
        `<line x1="${cx - ex + 9}" y1="${cy + 3}" x2="${cx + ex - 9}" y2="${cy + 3}" stroke="#8a5a2b" stroke-width="2"/>`
      );
    case 'face-mustache':
      return `<path d="M${cx - 12} ${cy + r * 0.3} Q${cx - 6} ${cy + r * 0.18} ${cx} ${cy + r * 0.3} Q${cx + 6} ${cy + r * 0.18} ${cx + 12} ${cy + r * 0.3} Q${cx + 6} ${cy + r * 0.44} ${cx} ${cy + r * 0.32} Q${cx - 6} ${cy + r * 0.44} ${cx - 12} ${cy + r * 0.3}Z" fill="#6b4a32"/>`;
    case 'face-freckle': {
      const pts = [[-0.74, 0.18], [-0.6, 0.3], [-0.5, 0.16], [0.5, 0.16], [0.6, 0.3], [0.74, 0.18]];
      return pts.map(([a, b]) => `<circle cx="${cx + a * r}" cy="${cy + b * r}" r="1.3" fill="#a5714b"/>`).join('');
    }
    default:
      return '';
  }
}

export function neckArt(id, cx, cy, r) {
  const y = cy + r * 1.02;
  switch (id) {
    case 'neck-scarf':
      return (
        `<rect x="${cx + r * 0.22}" y="${y}" width="10" height="16" rx="4" fill="#cf4a46" transform="rotate(-8 ${cx + r * 0.3} ${y})"/>` +
        `<ellipse cx="${cx}" cy="${y}" rx="${r * 0.7}" ry="6" fill="#e5605b"/>` +
        `<path d="M${cx - r * 0.45} ${y - 1} L${cx + r * 0.45} ${y - 1}" stroke="#fff" stroke-width="1.6" opacity=".5" stroke-dasharray="4 4"/>`
      );
    case 'neck-bow':
      return (
        `<path d="M${cx} ${y + 2} L${cx - 15} ${y - 7} L${cx - 15} ${y + 11} Z" fill="#7aa7ff"/>` +
        `<path d="M${cx} ${y + 2} L${cx + 15} ${y - 7} L${cx + 15} ${y + 11} Z" fill="#7aa7ff"/>` +
        `<circle cx="${cx}" cy="${y + 2}" r="4.5" fill="#4f7de0"/>`
      );
    case 'neck-shell': {
      // 🎉 여름 바다 축제 선물: 진주 줄에 꿴 조개
      const pearls = [-1, -0.6, -0.3, 0.3, 0.6, 1]
        .map((t) => `<circle cx="${cx + t * r * 0.72}" cy="${y - 3 + (1 - t * t) * 9}" r="2.2" fill="#fffaf0" stroke="#e8dcc4" stroke-width=".5"/>`)
        .join('');
      const sx = cx;
      const sy = y + 7;
      return (
        `<path d="M${cx - r * 0.72} ${y - 3} Q${cx} ${y + 15} ${cx + r * 0.72} ${y - 3}" fill="none" stroke="#c9b48a" stroke-width="1"/>` +
        pearls +
        `<path d="M${sx} ${sy + 8} L${sx - 8} ${sy - 1} Q${sx} ${sy - 9} ${sx + 8} ${sy - 1}Z" fill="#ffc6d9" stroke="#e98aa9" stroke-width=".8"/>` +
        `<path d="M${sx} ${sy + 8} L${sx - 4.5} ${sy - 4} M${sx} ${sy + 8} L${sx} ${sy - 5.5} M${sx} ${sy + 8} L${sx + 4.5} ${sy - 4}" stroke="#e98aa9" stroke-width=".7"/>` +
        `<rect x="${sx - 2.5}" y="${sy + 7}" width="5" height="2.4" rx="1" fill="#e98aa9"/>`
      );
    }
    case 'neck-bell':
      return (
        `<path d="M${cx - r * 0.7} ${y - 2} Q${cx} ${y + 9} ${cx + r * 0.7} ${y - 2}" fill="none" stroke="#e5605b" stroke-width="4" stroke-linecap="round"/>` +
        `<circle cx="${cx}" cy="${y + 8}" r="5.5" fill="#ffd34d" stroke="#e0a800"/><line x1="${cx - 3}" y1="${y + 9}" x2="${cx + 3}" y2="${y + 9}" stroke="#e0a800"/>`
      );
    case 'neck-medal':
      return (
        `<path d="M${cx - 9} ${y - 6} L${cx} ${y + 8} L${cx + 9} ${y - 6}" fill="none" stroke="#4f7de0" stroke-width="4" stroke-linejoin="round"/>` +
        `<circle cx="${cx}" cy="${y + 12}" r="8" fill="#ffd34d" stroke="#e0a800" stroke-width="1.5"/>` +
        `<text x="${cx}" y="${y + 16}" font-size="11" text-anchor="middle" fill="#e0a800">★</text>`
      );
    case 'neck-lei': {
      const cols = ['#ff8fb1', '#ffe066', '#fff', '#ffb36b', '#ff8fb1', '#ffe066', '#fff'];
      return cols
        .map((col, i) => {
          const t = (i / (cols.length - 1)) * 2 - 1;
          return `<circle cx="${cx + t * r * 0.72}" cy="${y - 3 + (1 - t * t) * 9}" r="5" fill="${col}" stroke="#ffffff88"/><circle cx="${cx + t * r * 0.72}" cy="${y - 3 + (1 - t * t) * 9}" r="1.6" fill="#ffb300"/>`;
        })
        .join('');
    }
    case 'neck-bandana':
      return (
        `<path d="M${cx - r * 0.78} ${y - 5} L${cx + r * 0.78} ${y - 5} L${cx} ${y + 17} Z" fill="#ff6b6b"/>` +
        `<circle cx="${cx - 9}" cy="${y}" r="1.8" fill="#fff"/><circle cx="${cx + 9}" cy="${y}" r="1.8" fill="#fff"/><circle cx="${cx}" cy="${y + 8}" r="1.8" fill="#fff"/>`
      );
    case 'neck-id':
      return (
        `<path d="M${cx - r * 0.6} ${y - 4} L${cx - 5} ${y + 10} M${cx + r * 0.6} ${y - 4} L${cx + 5} ${y + 10}" stroke="#4f7de0" stroke-width="3" stroke-linecap="round"/>` +
        `<rect x="${cx - 9}" y="${y + 8}" width="18" height="22" rx="3" fill="#fff" stroke="#c9d6ea"/>` +
        `<circle cx="${cx}" cy="${y + 16}" r="3.5" fill="#b7e6a0"/><rect x="${cx - 6}" y="${y + 22}" width="12" height="2" fill="#9bb0cf"/><rect x="${cx - 6}" y="${y + 26}" width="8" height="2" fill="#9bb0cf"/>`
      );
    case 'neck-beads': {
      const cols = ['#ff8fb1', '#ffe066', '#8ee0c0', '#8ecae6', '#c3a6ff', '#ff8fb1', '#ffe066'];
      return cols
        .map((col, i) => {
          const t = (i / (cols.length - 1)) * 2 - 1;
          return `<circle cx="${cx + t * r * 0.7}" cy="${y - 2 + (1 - t * t) * 8}" r="3.6" fill="${col}"/>`;
        })
        .join('');
    }
    case 'neck-wordcard':
      return (
        `<path d="M${cx - r * 0.6} ${y - 4} L${cx - 4} ${y + 9} M${cx + r * 0.6} ${y - 4} L${cx + 4} ${y + 9}" stroke="#c9a24a" stroke-width="2.2" stroke-linecap="round"/>` +
        `<circle cx="${cx}" cy="${y + 10}" r="3" fill="none" stroke="#c9a24a" stroke-width="1.6"/>` +
        `<rect x="${cx - 11}" y="${y + 12}" width="18" height="13" rx="2" fill="#fffaf0" stroke="#d9c79a" transform="rotate(-10 ${cx} ${y + 12})"/>` +
        `<rect x="${cx - 7}" y="${y + 12}" width="18" height="13" rx="2" fill="#fff" stroke="#d9c79a" transform="rotate(8 ${cx} ${y + 12})"/>` +
        `<text x="${cx + 2}" y="${y + 23}" font-size="9" text-anchor="middle" fill="#3f5f8a" transform="rotate(8 ${cx} ${y + 12})">あ</text>`
      );
    case 'neck-jewel':
      return (
        `<path d="M${cx - r * 0.66} ${y - 3} Q${cx} ${y + 10} ${cx + r * 0.66} ${y - 3}" fill="none" stroke="#ffd34d" stroke-width="1.8" stroke-dasharray="2 1.5"/>` +
        `<circle cx="${cx}" cy="${y + 12}" r="9" fill="#ff6fa8" opacity=".25" class="shimmer"/>` +
        `<path d="M${cx} ${y + 5} L${cx + 5} ${y + 11} L${cx} ${y + 20} L${cx - 5} ${y + 11} Z" fill="#ff4f8b" stroke="#ffd34d" stroke-width="1.2"/>` +
        `<path d="M${cx - 1.5} ${y + 9} l1.5 -2 l1.5 2Z" fill="#fff" opacity=".8"/>` +
        `<path class="twinkle" d="M${cx + 7} ${y + 4} l.9 2.2 l2.2 .9 l-2.2 .9 l-.9 2.2 l-.9 -2.2 l-2.2 -.9 l2.2 -.9Z" fill="#fff"/>`
      );
    default:
      return '';
  }
}

// 오른손에 드는 것. (ax, ay) = 오른팔 위치. 마지막에 손을 다시 그려 쥐고 있는 것처럼 보이게 한다.
export function handArt(id, ax, ay) {
  const paw = `<ellipse cx="${ax}" cy="${ay}" rx="5" ry="5.6" fill="#fbf7ea"/>`;
  const at = (body) => `<g transform="translate(${ax} ${ay})">${body}</g>` + paw;
  switch (id) {
    case 'hand-book':
      return at(
        `<g transform="translate(7 -6) rotate(-12)"><rect x="-8" y="-10" width="16" height="20" rx="2" fill="#3f5f8a"/><rect x="-5.5" y="-8" width="12" height="16" rx="1" fill="#fffaf0"/><rect x="-8" y="-10" width="3" height="20" rx="1" fill="#2f4a6e"/>` +
          `<path d="M-2.5 -4 h7 M-2.5 0 h7 M-2.5 4 h5" stroke="#9bb0cf" stroke-width="1"/></g>`
      );
    case 'hand-pencil':
      return at(
        `<g transform="translate(5 -8) rotate(28)"><rect x="-2.6" y="-16" width="5.2" height="28" fill="#ffd34d"/><rect x="-2.6" y="10" width="5.2" height="4" rx="1" fill="#ff9fb4"/><rect x="-2.6" y="8" width="5.2" height="2" fill="#c9c9c9"/>` +
          `<path d="M-2.6 -16 L0 -23 L2.6 -16Z" fill="#f2d2a0"/><path d="M-.9 -20.5 L0 -23 L.9 -20.5Z" fill="#3b2f2f"/></g>`
      );
    case 'hand-tea':
      return at(
        `<path d="M-1 -6 h14 v6 a7 7 0 0 1 -14 0Z" fill="#fff" stroke="#d9c79a"/><path d="M13 -4 a3 3 0 0 1 0 6" fill="none" stroke="#d9c79a" stroke-width="1.6"/>` +
          `<ellipse cx="6" cy="-6" rx="7" ry="1.8" fill="#b8783a"/><path d="M4 -10 q-2 -4 0 -7 M8 -10 q2 -4 0 -7" stroke="#fff" stroke-width="1.2" fill="none" opacity=".75" class="twinkle"/>`
      );
    case 'hand-bouquet':
      return at(
        `<path d="M2 -10 l-2 -6 M6 -10 l3 -7 M4 -10 v-9" stroke="#5f8a52" stroke-width="1"/>` +
          `<circle cx="0" cy="-17" r="3.6" fill="#ff8fb1"/><circle cx="9" cy="-18" r="3.6" fill="#ffe066"/><circle cx="4" cy="-21" r="3.6" fill="#c3a6ff"/><circle cx="4" cy="-21" r="1.2" fill="#fff"/>` +
          `<path d="M-4 -10 L12 -10 L5 4Z" fill="#fff0c2" stroke="#e8d29a" stroke-width=".8"/>`
      );
    case 'hand-balloon':
      return at(
        `<path d="M0 0 q6 -12 4 -26" stroke="#9a9a9a" stroke-width=".8" fill="none"/>` +
          `<g class="float"><ellipse cx="5" cy="-36" rx="9" ry="11" fill="#ff6b7a"/><ellipse cx="2" cy="-40" rx="2.4" ry="3.6" fill="#fff" opacity=".5"/><path d="M3.5 -25 l1.5 2 l1.5 -2Z" fill="#e5505f"/></g>`
      );
    case 'hand-lantern':
      return at(
        `<path d="M0 0 L12 -18" stroke="#7a5a3a" stroke-width="1.6" stroke-linecap="round"/><line x1="12" y1="-18" x2="12" y2="-12" stroke="#7a5a3a" stroke-width=".8"/>` +
          glowDot(12, -4, 12, '#ffb35a') +
          `<rect x="6.5" y="-12" width="11" height="14" rx="5" fill="#e5484d"/><rect x="8" y="-13" width="8" height="2" fill="#c9a24a"/><rect x="8" y="1" width="8" height="2" fill="#c9a24a"/>` +
          `<path d="M9 -8 h6 M9 -4 h6" stroke="#ffcf7a" stroke-width=".7" opacity=".8"/>`
      );
    case 'hand-wand':
      return at(
        `<path d="M0 0 L10 -20" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` +
          glowDot(11, -23, 10, '#fff59a') +
          `<path class="twinkle" transform="translate(11 -23)" d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8Z" fill="#ffe066" stroke="#e0a800" stroke-width=".6"/>`
      );
    case 'hand-dumbbell':
      return at(
        `<rect x="-3" y="-1.5" width="18" height="3" rx="1.5" fill="#8a8f98"/>` +
          `<rect x="-6" y="-6" width="5" height="12" rx="1.5" fill="#4f5560"/><rect x="11" y="-6" width="5" height="12" rx="1.5" fill="#4f5560"/>`
      );
    default:
      return '';
  }
}

// 은은한 빛 (그라디언트 없이 반투명 원 세 겹)
const glowDot = (x, y, r, c) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".12"/><circle cx="${x}" cy="${y}" r="${r * 0.6}" fill="${c}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="${c}" opacity=".25"/>`;
