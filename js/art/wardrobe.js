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
    default:
      return '';
  }
}
