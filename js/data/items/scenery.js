// 세계수 풍경 아이템. 그림은 art/ 폴더의 같은 이름 파일에 같은 id로 있다.
//   world → art/worlds.js     sky → art/sky.js        ornament → art/ornaments.js
//   land  → art/land.js       companion → art/companions.js     fx → art/effects.js
// cost: c(햇살, 이슬, 별빛)
import { c } from './cost.js';

export const SCENERY = [
  /* ---------- 배경 (world) — 장착하지 않으면 시간대에 따라 바뀐다 ---------- */
  { id: 'world-day', slot: 'world', name: '맑은 낮', cost: c(20) },
  { id: 'world-dawn', slot: 'world', name: '새벽빛', cost: c(30) },
  { id: 'world-dusk', slot: 'world', name: '노을', cost: c(40) },
  { id: 'world-night', slot: 'world', name: '별밤', cost: c(50, 10) },
  { id: 'world-mist', slot: 'world', name: '안개 숲', cost: c(70, 20) },
  { id: 'world-sakura', slot: 'world', name: '벚꽃 들판', cost: c(90, 30) },
  { id: 'world-snow', slot: 'world', name: '설원', cost: c(90, 30) },
  { id: 'world-golden', slot: 'world', name: '황금 들판', cost: c(110, 30) },
  { id: 'world-cosmos', slot: 'world', name: '우주', cost: c(150, 50) },
  { id: 'world-library', slot: 'world', name: '지혜의 도서관', cost: c(0, 0, 100) },
  // 움직이는 배경
  { id: 'world-clouds', slot: 'world', name: '흐르는 구름', cost: c(40, 10) },
  { id: 'world-rain', slot: 'world', name: '비 오는 숲', cost: c(0, 60) },
  { id: 'world-shooting', slot: 'world', name: '별똥별 밤', cost: c(80, 30) },
  { id: 'world-sea', slot: 'world', name: '바닷가', cost: c(100, 30) },

  /* ---------- 하늘 (sky) ---------- */
  { id: 'sky-moon', slot: 'sky', name: '초승달', cost: c(25) },
  { id: 'sky-clouds', slot: 'sky', name: '황금 구름', cost: c(30, 10) },
  { id: 'sky-birds', slot: 'sky', name: '새 떼', cost: c(30) },
  { id: 'sky-stars', slot: 'sky', name: '별자리', cost: c(0, 40) },
  { id: 'sky-comet', slot: 'sky', name: '유성', cost: c(60, 20) },
  { id: 'sky-planet', slot: 'sky', name: '고리 행성', cost: c(80, 20) },
  { id: 'sky-islands', slot: 'sky', name: '떠 있는 섬', cost: c(100, 30) },
  { id: 'sky-lanterns', slot: 'sky', name: '풍등', cost: c(90, 40) },
  { id: 'sky-aurora', slot: 'sky', name: '오로라', cost: c(140, 50) },
  { id: 'sky-kites', slot: 'sky', name: '연날리기', cost: c(45, 15) },
  { id: 'sky-fireworks', slot: 'sky', name: '불꽃놀이', cost: c(120, 40) },

  /* ---------- 잎 색 (leaf) — 세계수 잎의 색을 바꾼다. 색은 art/leaves.js ---------- */
  { id: 'leaf-spring', slot: 'leaf', name: '연둣빛 새잎', cost: c(40, 20) },
  { id: 'leaf-sakura', slot: 'leaf', name: '벚꽃잎', cost: c(0, 60) },
  { id: 'leaf-maple', slot: 'leaf', name: '붉은 단풍', cost: c(70, 20) },
  { id: 'leaf-ginkgo', slot: 'leaf', name: '노란 은행잎', cost: c(70, 20) },
  { id: 'leaf-frost', slot: 'leaf', name: '서리잎', cost: c(80, 30) },
  { id: 'leaf-violet', slot: 'leaf', name: '보랏빛 잎', cost: c(0, 0, 60) },
  { id: 'leaf-night', slot: 'leaf', name: '밤하늘 잎', cost: c(120, 40) },

  /* ---------- 꽃·열매 (bloom) — 잎 사이에 촘촘히 핀다. 그림은 art/blooms.js. 묘목부터 보인다 ---------- */
  { id: 'bloom-white', slot: 'bloom', name: '하얀 꽃', cost: c(0, 30) },
  { id: 'bloom-pink', slot: 'bloom', name: '분홍 꽃', cost: c(0, 40) },
  { id: 'bloom-cherry', slot: 'bloom', name: '빨간 버찌', cost: c(40, 15) },
  { id: 'bloom-orange', slot: 'bloom', name: '작은 귤', cost: c(60, 20) },
  { id: 'bloom-star', slot: 'bloom', name: '별 열매', cost: c(0, 0, 50) },
  { id: 'bloom-dew', slot: 'bloom', name: '이슬방울', cost: c(0, 50) },
  { id: 'bloom-bird', slot: 'bloom', name: '쉬어 가는 새', cost: c(80, 30) },

  /* ---------- 가지 장식 (ornament) — 묘목부터 보인다 ---------- */
  { id: 'orn-blossom', slot: 'ornament', name: '하얀 꽃송이', cost: c(0, 30) },
  { id: 'orn-ribbons', slot: 'ornament', name: '소원 리본', cost: c(30, 10) },
  { id: 'orn-fairy', slot: 'ornament', name: '요정 전구', cost: c(50, 20) },
  { id: 'orn-bells', slot: 'ornament', name: '바람 종', cost: c(50, 10) },
  { id: 'orn-lanterns', slot: 'ornament', name: '별빛 등불', cost: c(70, 20) },
  { id: 'orn-moons', slot: 'ornament', name: '달 모빌', cost: c(70, 30) },
  { id: 'orn-crystals', slot: 'ornament', name: '수정 장식', cost: c(90, 30) },
  { id: 'orn-apples', slot: 'ornament', name: '황금 사과', cost: c(120, 40) },
  { id: 'orn-runes', slot: 'ornament', name: '룬 문양', cost: c(100, 40) },
  { id: 'orn-pages', slot: 'ornament', name: '지혜의 책장', cost: c(0, 0, 60) },

  /* ---------- 대지 (land) ---------- */
  { id: 'land-flowers', slot: 'land', name: '꽃밭', cost: c(0, 30) },
  { id: 'land-ferns', slot: 'land', name: '고사리 덤불', cost: c(25) },
  { id: 'land-mushrooms', slot: 'land', name: '버섯 고리', cost: c(30, 10) },
  { id: 'land-stones', slot: 'land', name: '선돌', cost: c(50, 10) },
  { id: 'land-spring', slot: 'land', name: '샘물', cost: c(60, 30) },
  { id: 'land-lanterns', slot: 'land', name: '돌 등롱', cost: c(70, 20) },
  { id: 'land-ruins', slot: 'land', name: '고대 유적', cost: c(90, 30) },
  { id: 'land-crystals', slot: 'land', name: '수정 군락', cost: c(110, 40) },
  { id: 'land-books', slot: 'land', name: '책 더미', cost: c(0, 0, 30) },
  { id: 'land-bamboo', slot: 'land', name: '대나무 숲', cost: c(0, 0, 45) },
  { id: 'land-pond', slot: 'land', name: '잉어 연못', cost: c(80, 30) },

  /* ---------- 친구 (companion) ---------- */
  { id: 'comp-wisp-gold', slot: 'companion', name: '금빛 정령불', cost: c(30, 10) },
  { id: 'comp-wisp-blue', slot: 'companion', name: '푸른 정령불', cost: c(30, 10) },
  { id: 'comp-wisp-pink', slot: 'companion', name: '분홍 정령불', cost: c(0, 40) },
  { id: 'comp-butterflies', slot: 'companion', name: '나비 무리', cost: c(0, 40) },
  { id: 'comp-bird', slot: 'companion', name: '작은 새', cost: c(50, 20) },
  { id: 'comp-moth', slot: 'companion', name: '빛나방', cost: c(60, 20) },
  { id: 'comp-bunny', slot: 'companion', name: '달토끼', cost: c(80, 30) },
  { id: 'comp-owl', slot: 'companion', name: '공부 부엉이', cost: c(0, 0, 60) },
  { id: 'comp-panda', slot: 'companion', name: '아기 판다', cost: c(0, 0, 70) },
  { id: 'comp-fox', slot: 'companion', name: '꼬마 여우', cost: c(70, 30) },

  /* ---------- 빛 효과 (fx) ---------- */
  { id: 'fx-motes', slot: 'fx', name: '빛 알갱이', cost: c(40, 20) },
  { id: 'fx-fireflies', slot: 'fx', name: '반딧불이', cost: c(50, 20) },
  { id: 'fx-petals', slot: 'fx', name: '꽃잎 바람', cost: c(50, 30) },
  { id: 'fx-leaves', slot: 'fx', name: '금빛 낙엽', cost: c(50, 30) },
  { id: 'fx-snow', slot: 'fx', name: '눈송이', cost: c(60, 30) },
  { id: 'fx-rays', slot: 'fx', name: '빛줄기', cost: c(90, 30) },
  { id: 'fx-runes', slot: 'fx', name: '룬 고리', cost: c(120, 40) },
  { id: 'fx-numbers', slot: 'fx', name: '떠오르는 숫자', cost: c(0, 0, 70) },
];
