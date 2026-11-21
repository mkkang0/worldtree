// 사진으로 저장: 지금 세계수 장면을 그림 카드(PNG)로 만들어 공유하거나 사진에 저장한다.
// 장면 SVG를 이미지로 읽어 캔버스에 그리고, 아래에 단계 · 세계수 이름 · 날짜를 적는다.
// 움직이는 그림(구름·정령 동작 등)은 멈춘 모습으로 찍힌다.
import { ctx, rerender } from '../app/context.js';
import { todayKey } from '../core/dates.js';
import { STAGES } from '../core/scoring.js';
import { sceneSvg, journey } from '../ui/components.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { toast, chime } from '../ui/effects.js';

const W = 1080; // 카드 너비 (px)
const PAD = 48;
const SCENE_W = W - PAD * 2;
const SCENE_H = Math.round((SCENE_W * 360) / 300); // 장면 비율 300 x 360
const CAPTION = 250;
const H = PAD + SCENE_H + CAPTION;

const SERIF = '"AppleMyungjo", "Nanum Myeongjo", "Noto Serif KR", "Batang", serif';
const SANS = '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';

// 지금 앱 색(테마·밝기)을 그대로 쓴다
const cssVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

async function sceneImage(state) {
  const svg = sceneSvg(state).replace('<svg ', `<svg width="${SCENE_W}" height="${SCENE_H}" `);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();
  return img;
}

// 그림 카드 만들기 → { blob, url }
export async function makeCard(state) {
  const j = journey(state);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  const bg = cssVar('--surface-solid', '#fffcf4');
  const ink = cssVar('--ink', '#1f2d26');
  const muted = cssVar('--muted', '#6f7568');
  const accent = cssVar('--accent', '#b48c43');
  const line = cssVar('--line', 'rgba(130,104,52,.18)');

  // 바탕
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // 장면 (모서리 둥글게)
  const img = await sceneImage(state);
  g.save();
  roundRect(g, PAD, PAD, SCENE_W, SCENE_H, 40);
  g.clip();
  g.drawImage(img, PAD, PAD, SCENE_W, SCENE_H);
  g.restore();

  // 글: 단계 이름, 세계수 · 며칠째 · 정령
  const top = PAD + SCENE_H;
  g.textBaseline = 'alphabetic';
  g.fillStyle = accent;
  g.font = `600 30px ${SANS}`;
  g.fillText(`${j.tree.label} · ${j.day}일째`, PAD + 8, top + 64);
  g.fillStyle = ink;
  g.font = `700 68px ${SERIF}`;
  g.fillText(j.stageName, PAD + 6, top + 140);
  g.fillStyle = muted;
  g.font = `400 30px ${SANS}`;
  g.fillText(`정령 ${state.settings.name} · ${STAGES.length}단계 중 ${j.stage + 1}단계`, PAD + 8, top + 192);

  // 오른쪽: 7단계 점 + 날짜 + 이름
  const dotsRight = W - PAD - 8;
  const gap = 34;
  const dy = top + 112;
  const x0 = dotsRight - gap * (STAGES.length - 1);
  g.strokeStyle = line;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(x0, dy);
  g.lineTo(dotsRight, dy);
  g.stroke();
  STAGES.forEach((_, i) => {
    g.beginPath();
    g.arc(x0 + i * gap, dy, i === j.stage ? 12 : 7, 0, Math.PI * 2);
    g.fillStyle = i <= j.stage ? accent : bg;
    g.fill();
    g.strokeStyle = i <= j.stage ? accent : line;
    g.lineWidth = 3;
    g.stroke();
  });
  g.textAlign = 'right';
  g.fillStyle = muted;
  g.font = `400 26px ${SANS}`;
  g.fillText(todayKey().replaceAll('-', '. '), dotsRight, top + 64);
  g.fillStyle = accent;
  g.font = `700 30px ${SERIF}`;
  g.fillText('세계수', dotsRight, top + 192);
  g.textAlign = 'left';

  const blob = await new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('toBlob'))), 'image/png'));
  return { blob, url: URL.createObjectURL(blob) };
}

const fileName = () => `세계수-${todayKey()}.png`;

/* ---------- 창 ---------- */

export function photoModal(state, ui) {
  const d = ui.modalData || {};
  const canShare = !!(d.blob && navigator.canShare?.({ files: [new File([d.blob], fileName(), { type: 'image/png' })] }));
  return `<div class="sheet photo-sheet" role="dialog" aria-labelledby="photo-title">
    <div class="intro"><span class="eyebrow">PHOTO</span><h1 id="photo-title">세계수 사진</h1></div>
    ${d.url ? `<img class="photo-preview" src="${d.url}" alt="${esc(journey(state).tree.label)} 사진 카드">` : '<p class="muted center">사진을 만드는 중이에요…</p>'}
    <p class="tiny center">${canShare ? '공유 버튼에서 "이미지 저장"을 고르면 사진 앱에 들어가요.' : '사진을 길게 누르면 사진 앱에 저장할 수 있어요.'}</p>
    <div class="row two">
      <button class="btn ghost" data-act="photo.close">닫기</button>
      ${
        canShare
          ? `<button class="btn gold" data-act="photo.share">${icon('gift')} 공유 · 저장</button>`
          : d.url
            ? `<a class="btn gold" href="${d.url}" download="${fileName()}">이미지 내려받기</a>`
            : ''
      }
    </div>
  </div>`;
}

/* ---------- 동작 ---------- */

const release = () => {
  const url = ctx.ui.modalData?.url;
  if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const actions = {
  // 카메라 버튼: 먼저 창을 열고, 그림이 다 되면 미리보기를 채운다
  'photo.make': async () => {
    ctx.ui.modal = 'photo';
    ctx.ui.modalData = {};
    rerender();
    try {
      const { blob, url } = await makeCard(ctx.state);
      if (ctx.ui.modal !== 'photo') return URL.revokeObjectURL(url);
      ctx.ui.modalData = { blob, url };
      chime('soft');
      rerender();
    } catch {
      ctx.ui.modal = '';
      rerender();
      toast('사진을 만들지 못했어요. 다시 해 주세요');
    }
  },

  // 공유 시트 (아이폰: 이미지 저장 · 메시지 · 카카오톡 등). 버튼을 누른 그 순간에 바로 부른다.
  'photo.share': async () => {
    const blob = ctx.ui.modalData?.blob;
    if (!blob) return;
    try {
      await navigator.share({ files: [new File([blob], fileName(), { type: 'image/png' })], title: '나의 세계수' });
    } catch (e) {
      if (e?.name !== 'AbortError') toast('공유가 막혀 있어요. 사진을 길게 눌러 저장해 주세요');
    }
  },

  'photo.close': () => {
    release();
    ctx.ui.modal = '';
    ctx.ui.modalData = null;
    rerender();
  },
};
