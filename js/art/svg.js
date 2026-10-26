// SVG를 만들 때 쓰는 작은 도구 모음 (그라디언트, 난수, 숫자 반올림).

let counter = 0;
// 한 화면에 그림이 여러 개 있어도 그라디언트 id가 겹치지 않게 한다.
export const nextUid = () => `s${++counter}`;

// 같은 씨앗 문자열이면 항상 같은 순서의 난수 (나무 모양이 매번 바뀌지 않도록)
export function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (t) => Math.max(0, Math.min(1, t));
export const n = (v) => Math.round(v * 10) / 10;

// stops: [[위치 0~1, 색, 불투명도(선택)], ...]
const stopTags = (stops) =>
  stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');

export function linear(id, stops, [x1, y1, x2, y2] = [0, 0, 0, 1]) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopTags(stops)}</linearGradient>`;
}

export function radial(id, stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = {}) {
  const focus = fx !== undefined ? ` fx="${fx}" fy="${fy}"` : '';
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${focus}>${stopTags(stops)}</radialGradient>`;
}

// 부드럽게 빛나는 원 (glow)
export function glow(id, x, y, r, color, opacity = 0.6) {
  return `<defs>${radial(id, [[0, color, opacity], [0.45, color, opacity * 0.35], [1, color, 0]])}</defs><circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="url(#${id})"/>`;
}

// 0~count-1 반복해서 문자열을 잇는다
export const times = (count, f) => Array.from({ length: count }, (_, i) => f(i)).join('');

// 애니메이션 지연을 고르게 나눠 같은 순간에 움직이지 않게 한다
export const delay = (i, count, seconds) => `style="animation-delay:-${((i / count) * seconds).toFixed(2)}s"`;
