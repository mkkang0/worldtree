// 토스트 알림, 효과음, 축하 연출. 다른 모듈에 의존하지 않는다.

const toastEl = () => document.getElementById('toast');
let toastTimer;

export function toast(msg) {
  const el = toastEl();
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// 효과음 켜짐 여부는 main.js에서 설정값을 연결한다.
let soundOn = () => true;
export function useSound(fn) {
  soundOn = fn;
}

let audio;
const NOTES = { level: [523, 659, 784, 1047], ok: [660, 880], soft: [440] };

export function chime(kind = 'ok') {
  if (!soundOn()) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    (NOTES[kind] || NOTES.ok).forEach((f, i) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      const t = audio.currentTime + i * 0.09;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g).connect(audio.destination);
      o.start(t);
      o.stop(t + 0.32);
    });
  } catch {
    /* 소리를 못 내도 앱은 계속 동작한다 */
  }
}

export function confetti(chars = ['✦', '🌿', '✨', '💛']) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = chars[i % chars.length];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDelay = Math.random() * 0.6 + 's';
    s.style.fontSize = 16 + Math.random() * 14 + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3200);
  }
}

export async function copyText(text, okMsg = '복사했어요') {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg);
  } catch {
    toast('복사가 막혀 있어요. 직접 선택해서 복사해 주세요.');
  }
}
