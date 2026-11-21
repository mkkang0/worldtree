// 백업 파일: 데이터를 JSON 파일로 저장(아이폰은 공유 → '파일에 저장')하고, 마지막 백업 날짜를 기억해 홈에서 알려준다.
import { ctx, commit } from './context.js';
import { exportJson } from '../data/store.js';
import { todayKey, daysBetween } from '../core/dates.js';
import { toast } from '../ui/effects.js';

export const BACKUP_EVERY_DAYS = 7; // 이만큼 지나면 홈에서 백업을 권한다

const fileName = () => `세계수-백업-${todayKey()}.json`;

export function markBackup() {
  ctx.state.settings.lastBackup = todayKey();
  commit();
}

// 마지막 백업 뒤로 며칠 지났는지 (한 번도 안 했으면 null)
export const daysSinceBackup = (state) => (state.settings.lastBackup ? daysBetween(state.settings.lastBackup, todayKey()) : null);

// 홈에서 백업을 권할 때: 백업한 지 7일이 지났거나, 백업 없이 3일 넘게 썼을 때
export function backupDue(state) {
  const d = daysSinceBackup(state);
  if (d !== null) return d >= BACKUP_EVERY_DAYS;
  const used = daysBetween(state.plant.startDate, todayKey()) + state.dex.length * 21;
  return used >= 3 && state.log.length + state.study.sessions.length + Object.keys(state.meals).length > 0;
}

function download(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  markBackup();
  toast('백업 파일을 내려받았어요');
}

// 버튼을 누른 그 순간에 바로 공유 창을 연다 (아이폰은 사용자가 누른 직후에만 공유를 허락한다)
export function saveBackupFile(onDone = () => {}) {
  const file = new File([exportJson(ctx.state)], fileName(), { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    navigator
      .share({ files: [file], title: '세계수 백업' })
      .then(() => {
        markBackup();
        toast('백업했어요. 파일 앱에 저장해 두면 안전해요');
        onDone();
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') {
          download(file);
          onDone();
        }
      });
  } else {
    download(file);
    onDone();
  }
}
