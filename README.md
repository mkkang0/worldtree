# 세계수 21일

운동하고, 잘 먹고, 공부할수록 세계수가 자라는 웹앱(PWA)입니다. 약 21일이면 세계수가 완성되고, 완성한 세계수는 '숲'에 심은 뒤 다른 세계수를 키웁니다. 나무를 돌보는 작은 정령이 함께합니다.

빌드 도구 없이 HTML/JS/CSS만으로 동작하고, 데이터는 폰 안(localStorage)에만 저장됩니다.

## 로컬에서 실행

```bash
python -m http.server 5173 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:5173/` 를 엽니다. 서비스 워커(오프라인 동작)는 `localhost` 또는 https에서만 작동합니다.

## 아이폰에 설치 (무료)

1. 이 폴더의 내용을 GitHub 저장소(Public) 루트에 올리고 Settings > Pages에서 배포합니다.
2. 아이폰 사파리로 배포 주소를 엽니다.
3. 공유 버튼 > "홈 화면에 추가".
4. 한 번 열어 두면 이후 오프라인에서도 실행됩니다.

**다시 배포할 때:** `sw.js`의 `CACHE` 이름(`worldtree-v2`)을 올려야 폰에 반영됩니다. 새 파일을 만들었다면 `sw.js`의 `FILES` 목록에도 추가합니다.

## 기능

- **세계수**: 8종(이그드라실, 벚꽃, 별빛, 황금, 서리, 달빛, 단풍, 비취). 씨앗 → 새싹 → 묘목 → 어린 나무 → 큰 나무 → 신목 → 세계수, 7단계. 단계 사이에도 매일 조금씩 커집니다.
- **정령**: 세계수를 돌보는 캐릭터. 표정이 하루 활동에 따라 바뀌고, 누르면 반응합니다.
- **포인트**: 햇살(운동) · 이슬(식단) · 별빛(공부)
- **운동**: 종류, 날짜, 시간, 평균 심박, 기분, 메모
- **공부 타이머**: 시작/끝내기, 집중도 1~5, 과목, 직접 기록, 과목별·7일 통계 (설정에서 켜고 끔)
- **시험 D-day**: 시험일을 넣으면 홈과 공부 화면에 '시험까지 D-n'이 보입니다. 비워두면 숨겨집니다.
- **식단**: 미션(직접 추가 가능, 보상은 하루 5개까지), 물 8잔
- **상점 89개**: 배경, 하늘, 가지 장식, 대지, 빛 효과, 친구, 정령 모자·얼굴·목걸이, 앱 테마. 그림 미리보기와 입혀보기, 교환소
- **기타**: 일일 퀘스트, 주간 목표, 업적, 기록·달력, 세계수의 숲, 함께하기(코드), 백업

## 코드 구조

```
index.html          화면 틀
sw.js               오프라인 캐시 (파일 목록 + 버전)
css/
  tokens.css        ★ 색·글꼴·그림자 변수, 낮/밤 기본 색, 상점 테마
  base.css          글꼴, 화면 틀, 아래 탭, 토스트, 모달
  components.css    카드, 제목, 버튼, 입력칸, 칩, 진행 막대, 목록, 포인트 표시, 그래프
  features.css      화면별 스타일 (홈, 퀘스트, 공부, 식단, 상점, 기록, 숲…)
  motion.css        모든 애니메이션 (그림의 class 이름과 짝)
js/
  main.js           시작점
  core/             게임 규칙 (화면을 쓰지 않는 순수 계산)
    config.js       ★ 밸런스 숫자 (성장 단계, 상한, 가중치, 보상, 교환 비율)
    dates.js        날짜·시간
    scoring.js      심박 구간, 점수, 성장 단계 계산
    records.js      하루·주간 집계, 연속 일수, 정령 기분
    quests.js       일일 퀘스트, 주간 목표
    achievements.js 업적
    share.js        친구·선물 코드
  data/             목록 데이터와 저장
    trees.js        ★ 세계수 종류와 색
    lists.js        운동 종류, 기분, 식단 미션, 공부 과목, 집중도
    items/          ★ 아이템 목록과 가격
      index.js        상점 탭(슬롯) 순서
      scenery.js      배경 · 하늘 · 가지 장식 · 대지 · 친구 · 빛 효과
      wardrobe.js     정령 모자 · 얼굴 · 목걸이
      themes.js       앱 테마
    store.js        저장·불러오기, 예전 데이터 변환
  art/              그림 (SVG). 아이템 슬롯마다 파일 하나
    scene.js        ★ 장면 조립 (층 순서)
    tree.js         세계수
    spirit.js       정령
    worlds.js       배경 (world)
    sky.js          하늘 (sky)
    ornaments.js    가지 장식 (ornament)
    land.js         대지 (land)
    companions.js   친구 (companion)
    effects.js      빛 효과 (fx)
    wardrobe.js     정령 옷 (hat, face, neck)
    thumbs.js       상점 미리보기 그림
    svg.js          그라디언트·난수 등 도구
  ui/               여러 화면이 같이 쓰는 조각
    icons.js        선 아이콘
    dom.js          HTML 도우미, 포인트 표시
    components.js   장면, 지갑, 퀘스트 카드, 세계수 고르기, 그래프
    effects.js      토스트, 효과음, 축하 연출
  app/              앱 뼈대
    context.js      상태(ctx.state 저장 / ctx.ui 화면)
    wallet.js       포인트 획득·차감·구매·교환, 업적 확인
    render.js       탭·화면·모달 목록과 그리기
    events.js       클릭·제출·입력을 동작 함수로 연결
  features/         화면 하나당 파일 하나 (view = 화면, actions = 동작)
    home  workout  study  meal  shop  more
    forest  goals  stats  friends  settings  onboarding
```

### 동작이 연결되는 방식

HTML에 이름표를 달면 `features/*.js`의 `actions`에서 같은 이름의 함수가 실행됩니다.

```html
<button data-act="study.start">시작</button>              <!-- 클릭 -->
<button data-act="shop.buy" data-arg="sky-moon">구매</button> <!-- data-arg로 값 전달 -->
<form data-form="study.manual">…</form>                    <!-- 제출 -->
<input data-input="workout.paste">                          <!-- 입력할 때마다 -->
```

동작 함수는 `ctx.state`를 바꾸고, 포인트는 `gain` / `lose` / `pay`로 처리한 뒤, `settle()`(업적 확인 + 저장) 또는 `commit()`(저장만)을 부르고 `rerender()`로 다시 그립니다.

### 무엇을 바꾸려면 어디를

| 바꾸고 싶은 것 | 파일 |
|---|---|
| 성장 속도, 하루 상한, 점수 가중치, 보상, 교환 비율 | `js/core/config.js` |
| 세계수 종류 추가·색 | `js/data/trees.js` 한 줄 |
| 세계수 모양 (크기, 뿌리, 꽃, 열매) | `js/art/tree.js` |
| 정령 생김새·표정 | `js/art/spirit.js` |
| 풍경 아이템 추가 | `js/data/items/scenery.js`에 한 줄 + `js/art/(슬롯 파일).js`에 같은 id로 그림 함수 |
| 정령 옷 추가 | `js/data/items/wardrobe.js` + `js/art/wardrobe.js` |
| 앱 테마 추가 | `js/data/items/themes.js` + `css/tokens.css` |
| 장면 층 순서 (무엇이 앞에 오는지) | `js/art/scene.js` |
| 앱 색·글꼴 | `css/tokens.css` |
| 움직임 속도 | `css/motion.css` |
| 특정 화면의 내용·문구 | `js/features/(화면).js` |
| 포인트 이름 (햇살·이슬·별빛) | `js/ui/dom.js`의 `CURRENCIES` |
| 운동 종류, 식단 미션, 공부 과목 | `js/data/lists.js` |
| 퀘스트 / 업적 | `js/core/quests.js` / `js/core/achievements.js` |
| 새 화면 | `js/features/`에 파일 → `js/app/render.js`의 `TABS` 또는 `SUB_PAGES`에 등록 → `sw.js` `FILES`에 추가 |
| 저장 데이터에 새 항목 | `js/data/store.js`의 `defaultState`와 `sanitize` 둘 다 |

## 점수 규칙 (기본값, `js/core/config.js`)

- 운동: 최대심박(220 - 나이) 대비 구간별 1분당 햇살 0.3 / 0.5 / 1 / 1.5 / 2 / 2.5. 하루 상한 120.
- 공부: 집중도 1~5별 1분당 별빛 0.2 / 0.4 / 0.6 / 0.8 / 1. 하루 상한 150.
- 식단: 미션 1개당 이슬 6, 하루 5개까지. 물 한 잔당 1(8잔 보너스 +4).
- 성장 점수 = 햇살 × 1 + 이슬 × 0.25 + 별빛 × 0.5. 시험 준비 기간이라 공부도 크게 반영합니다. 상점에서 써도 줄지 않습니다.
- 성장 단계: 씨앗 0 · 새싹 30 · 묘목 100 · 어린 나무 240 · 큰 나무 480 · 신목 840 · 세계수 1400. 매일 공부 3시간 + 식단이면 약 17일, 운동 주 4회면 약 24일.
- 교환소: 이슬 3 또는 별빛 3 → 햇살 1 (한 방향, 성장 점수는 늘지 않음).

## 단축어로 심박 자동 입력

아이폰 단축어가 건강 앱의 심박을 읽어 `min=30&hr=135&type=run` 같은 문장을 복사하면, 운동 화면의 "단축어 값 붙여넣기" 칸에 붙여넣어 폼을 채웁니다. 단계는 앱의 설정 화면에 있습니다. 아이폰은 홈 화면 앱과 사파리의 저장 공간이 따로라서, 단축어가 주소를 직접 여는 방식은 쓰지 않습니다.

## 함께하기 코드의 한계

서버 없이 주고받는 코드라 누구나 만들 수 있습니다. 선물은 한 번에 최대 30, 같은 코드는 한 번만 받을 수 있지만 위조를 막지는 못합니다. 서로 믿는 사이에서 쓰는 용도입니다.

## 백업

설정 화면의 "백업 만들기"로 JSON을 복사해 두면 폰을 바꿀 때 "붙여넣은 내용으로 복원"으로 옮길 수 있습니다.
