// 날짜는 모두 'YYYY-MM-DD' 문자열(기기 시간대 기준)로 다룬다.

export function todayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = keyToDate(key);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

// 월요일 시작 주
export function weekStart(key) {
  const d = keyToDate(key);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return todayKey(d);
}

// from부터 to까지 며칠 (같은 날이면 0)
export function daysBetween(from, to) {
  return Math.round((keyToDate(to) - keyToDate(from)) / 86400000);
}

export function weekdayLabel(key) {
  return '일월화수목금토'[keyToDate(key).getDay()];
}

export function dateLabel(key) {
  const today = todayKey();
  if (key === today) return '오늘';
  if (key === addDays(today, -1)) return '어제';
  return key.slice(5).replace('-', '/');
}

// 밀리초 → '01:02:03'
export function clock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function hoursMinutes(min) {
  const h = Math.floor(min / 60);
  return h ? `${h}시간 ${min % 60}분` : `${min}분`;
}
