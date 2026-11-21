// 정령의 옷. 그림은 art/wardrobe.js (같은 id의 case).
// cost: c(햇살, 이슬, 별빛)
import { c } from './cost.js';

export const WARDROBE = [
  /* ---------- 정령 모자 (hat) ---------- */
  { id: 'hat-flower', slot: 'hat', name: '꽃 화관', cost: c(0, 35) },
  { id: 'hat-ribbon', slot: 'hat', name: '리본', cost: c(20, 10) },
  { id: 'hat-straw', slot: 'hat', name: '밀짚모자', cost: c(30) },
  { id: 'hat-beanie', slot: 'hat', name: '비니', cost: c(40) },
  { id: 'hat-mushroom', slot: 'hat', name: '버섯 모자', cost: c(0, 45) },
  { id: 'hat-bear', slot: 'hat', name: '곰 귀', cost: c(50, 20) },
  { id: 'hat-cat', slot: 'hat', name: '고양이 귀', cost: c(60, 20) },
  { id: 'hat-bunny', slot: 'hat', name: '토끼 귀', cost: c(60, 20) },
  { id: 'hat-headphones', slot: 'hat', name: '헤드폰', cost: c(60, 10) },
  { id: 'hat-santa', slot: 'hat', name: '산타 모자', cost: c(70, 30) },
  { id: 'hat-witch', slot: 'hat', name: '마법사 모자', cost: c(90, 30) },
  { id: 'hat-halo', slot: 'hat', name: '천사 링', cost: c(90, 30) },
  { id: 'hat-crown', slot: 'hat', name: '왕관', cost: c(120, 40) },
  { id: 'hat-party', slot: 'hat', name: '파티 고깔', cost: c(35, 10) },
  { id: 'hat-chef', slot: 'hat', name: '요리사 모자', cost: c(0, 50) },
  { id: 'hat-antenna', slot: 'hat', name: '더듬이', cost: c(45, 15) },
  { id: 'hat-beret', slot: 'hat', name: '베레모', cost: c(55, 20) },
  { id: 'hat-sakura-pin', slot: 'hat', name: '벚꽃 머리핀', cost: c(0, 0, 40) },
  { id: 'hat-pencil', slot: 'hat', name: '귀에 꽂은 연필', cost: c(0, 0, 30) },
  { id: 'hat-grad', slot: 'hat', name: '학사모', cost: c(0, 0, 90) },

  /* ---------- 정령 얼굴 (face) ---------- */
  { id: 'face-freckle', slot: 'face', name: '주근깨', cost: c(15) },
  { id: 'face-glasses', slot: 'face', name: '동그란 안경', cost: c(25) },
  { id: 'face-whiskers', slot: 'face', name: '고양이 수염', cost: c(30, 10) },
  { id: 'face-shades', slot: 'face', name: '선글라스', cost: c(50) },
  { id: 'face-star', slot: 'face', name: '반짝 볼터치', cost: c(0, 30) },
  { id: 'face-heart', slot: 'face', name: '하트 볼터치', cost: c(0, 30) },
  { id: 'face-reading', slot: 'face', name: '반달 독서안경', cost: c(0, 0, 25) },
  { id: 'face-bandaid', slot: 'face', name: '반창고', cost: c(20) },
  { id: 'face-goggles', slot: 'face', name: '수영 고글', cost: c(45, 10) },
  { id: 'face-mustache', slot: 'face', name: '콧수염', cost: c(35) },

  /* ---------- 정령 목걸이 (neck) ---------- */
  { id: 'neck-bow', slot: 'neck', name: '나비넥타이', cost: c(30) },
  { id: 'neck-scarf', slot: 'neck', name: '빨간 목도리', cost: c(35, 10) },
  { id: 'neck-bell', slot: 'neck', name: '방울 목걸이', cost: c(0, 30) },
  { id: 'neck-lei', slot: 'neck', name: '꽃 목걸이', cost: c(0, 40) },
  { id: 'neck-beads', slot: 'neck', name: '구슬 목걸이', cost: c(0, 40) },
  { id: 'neck-medal', slot: 'neck', name: '금메달', cost: c(110, 30) },
  { id: 'neck-id', slot: 'neck', name: '사원증', cost: c(0, 0, 50) },
  { id: 'neck-bandana', slot: 'neck', name: '반다나', cost: c(30, 10) },
  { id: 'neck-wordcard', slot: 'neck', name: '단어 카드', cost: c(0, 0, 35) },

  /* ---------- 정령 손 (hand) — 오른손에 든다 ---------- */
  { id: 'hand-book', slot: 'hand', name: '작은 책', cost: c(0, 0, 25) },
  { id: 'hand-pencil', slot: 'hand', name: '큰 연필', cost: c(0, 0, 20) },
  { id: 'hand-tea', slot: 'hand', name: '따뜻한 차', cost: c(0, 35) },
  { id: 'hand-bouquet', slot: 'hand', name: '꽃다발', cost: c(30, 15) },
  { id: 'hand-balloon', slot: 'hand', name: '풍선', cost: c(40, 10) },
  { id: 'hand-lantern', slot: 'hand', name: '초롱', cost: c(60, 20) },
  { id: 'hand-wand', slot: 'hand', name: '별 요술봉', cost: c(90, 30) },
  { id: 'hand-dumbbell', slot: 'hand', name: '아령', cost: c(50) },
];
