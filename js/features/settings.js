// 더보기 > 설정 · 백업
import { ctx, rerender, commit, replaceState } from '../app/context.js';
import { defaultState, exportJson, importJson } from '../data/store.js';
import { esc, backButton, title } from '../ui/dom.js';
import { DEFAULT_SPIRIT_NAME } from '../data/store.js';
import { toast, copyText } from '../ui/effects.js';

export function view(state) {
  const s = state.settings;
  return `${backButton}
    <header class="page-head"><h1>설정</h1></header>
    <section class="card">
      ${title('나와 정령', { iconName: 'cog' })}
      <form data-form="settings.save" autocomplete="off">
        <label>정령 이름 (10자까지)<input name="name" maxlength="10" value="${esc(s.name)}" required></label>
        <label>나이 (운동 강도 계산용)<input name="age" type="number" inputmode="numeric" min="10" max="90" value="${s.age}" required></label>
        <label>안정시 심박수 (선택, 0이면 사용 안 함)<input name="restHr" type="number" inputmode="numeric" min="0" max="120" value="${s.restHr}"></label>
        <p class="tiny">안정시 심박을 넣으면 심박 예비량(카르보넨) 방식으로 구간을 계산해서 더 개인에게 맞아요.</p>
        <label class="check"><input type="checkbox" name="studyEnabled" ${s.studyEnabled ? 'checked' : ''}> 공부 기록 기능 쓰기 (공부 탭 · 별빛)</label>
        <label class="check"><input type="checkbox" name="sound" ${s.sound ? 'checked' : ''}> 효과음 켜기</label>
        <label class="check"><input type="checkbox" name="bigText" ${s.bigText ? 'checked' : ''}> 글자 크게 보기</label>
        <button class="btn" type="submit">저장</button>
      </form>
    </section>
    <section class="card">
      ${title('심박 자동 입력 (단축어)', { iconName: 'heart' })}
      <p class="tiny">웹앱은 건강 앱을 직접 읽을 수 없어서, 아이폰 단축어가 대신 읽어서 복사해 줘요. 메뉴 이름은 iOS 버전에 따라 조금 다를 수 있어요.</p>
      <ol class="steps">
        <li>단축어 앱에서 새 단축어를 만들어요.</li>
        <li>"건강 샘플 찾기": 유형 <b>심박수</b>, 기간은 최근 1시간 정도로 정해요.</li>
        <li>"통계 계산": <b>평균</b>으로 바꿔요.</li>
        <li>"입력 요청": 숫자로 "운동 몇 분 했어요?"를 물어요.</li>
        <li>"클립보드에 복사": 아래 문장에서 【 】 자리를 단축어 변수로 바꿔 넣어요.</li>
        <li>운동 탭의 <b>단축어 값 붙여넣기</b> 칸에 붙여넣으면 폼이 채워져요.</li>
      </ol>
      <textarea rows="2" readonly id="shortcut-text">min=【운동 분】&hr=【평균 심박】&type=run</textarea>
      <p class="tiny">type은 walk, run, bike, strength, yoga, swim, dance, etc 중 하나예요. 아이폰은 홈 화면 앱과 사파리의 저장 공간이 따로라서, 단축어가 주소를 직접 여는 방식은 쓰지 않아요.</p>
      <button class="btn small soft" data-act="settings.copyShortcut">문장 복사</button>
    </section>
    <section class="card">
      ${title('백업', { iconName: 'scroll' })}
      <p class="tiny">데이터는 이 폰 안에만 있어요. 폰을 바꾸거나 앱을 지우기 전에 꼭 백업하세요.</p>
      <div class="row two">
        <button class="btn" data-act="settings.export">백업 만들기</button>
        <button class="btn soft" data-act="settings.importStart">백업 가져오기</button>
      </div>
      <textarea id="backup-text" rows="6" placeholder="여기에 백업 내용이 표시되거나, 붙여넣어서 가져올 수 있어요" spellcheck="false"></textarea>
      <div class="row two">
        <button class="btn small" data-act="settings.copyBackup">복사</button>
        <button class="btn small soft" data-act="settings.restore">붙여넣은 내용으로 복원</button>
      </div>
    </section>
    <section class="card">
      ${title('초기화', { iconName: 'close' })}
      <button class="btn danger" data-act="settings.reset">모든 데이터 지우기</button>
    </section>`;
}

const backupBox = () => document.getElementById('backup-text');
const clampInt = (v, d, lo, hi) => Math.min(hi, Math.max(lo, Math.round(Number(v)) || d));

export const actions = {
  'settings.save': (form) => {
    const s = ctx.state.settings;
    s.name = form.name.value.trim().slice(0, 10) || DEFAULT_SPIRIT_NAME;
    s.age = clampInt(form.age.value, 30, 10, 90);
    s.restHr = clampInt(form.restHr.value, 0, 0, 120);
    s.studyEnabled = form.studyEnabled.checked;
    s.sound = form.sound.checked;
    s.bigText = form.bigText.checked;
    commit();
    rerender();
    toast('저장했어요');
  },

  'settings.copyShortcut': () => copyText(document.getElementById('shortcut-text').value, '복사했어요. 【 】 자리는 단축어 변수로 바꿔 주세요'),

  'settings.export': () => {
    backupBox().value = exportJson(ctx.state);
    backupBox().select();
  },
  'settings.importStart': () => {
    backupBox().value = '';
    backupBox().focus();
  },
  'settings.copyBackup': () => {
    if (!backupBox().value) backupBox().value = exportJson(ctx.state);
    copyText(backupBox().value);
  },
  'settings.restore': () => {
    let next;
    try {
      next = importJson(backupBox().value);
    } catch {
      return toast('백업 내용을 읽을 수 없어요');
    }
    if (!confirm('현재 데이터가 백업 내용으로 바뀌어요. 진행할까요?')) return;
    replaceState(next);
    rerender();
    toast('복원했어요');
  },

  'settings.reset': () => {
    if (!confirm('정말 모든 데이터를 지울까요? 되돌릴 수 없어요.')) return;
    replaceState(defaultState());
    ctx.ui.modal = 'onboarding';
    ctx.ui.tab = 'home';
    ctx.ui.sub = '';
    rerender();
  },
};
