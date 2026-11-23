// 섬 소품 (자유 배치 꾸미기). 소품 가게에서 하나씩 사서 섬 풀밭 어디에나 놓는다.
// 그림은 art/props.js (같은 id), 놓은 자리는 state.island.decor (core 없이 features/island.js에서 다룬다)
//   react: 꾸미기 모드가 아닐 때 눌렀을 때의 반응
//     bounce 통통 · shake 흔들흔들(잎) · toggle 켜고 끄기 · letter 편지 · sign 표지판 · splash 물 튀김 · sparks 불똥 · flutter 나비
import { c } from './items/cost.js';

export const PROPS = [
  { id: 'path-stone', name: '돌길', emoji: '🪨', cost: c(8), react: 'bounce' },
  { id: 'fence', name: '나무 울타리', emoji: '🪵', cost: c(12), react: 'bounce' },
  { id: 'flowerbed', name: '꽃밭', emoji: '🌷', cost: c(0, 15), react: 'flutter' },
  { id: 'pot', name: '꽃 화분', emoji: '🪴', cost: c(0, 12), react: 'shake' },
  { id: 'bush', name: '둥근 덤불', emoji: '🌳', cost: c(10, 5), react: 'shake' },
  { id: 'sapling', name: '사과나무', emoji: '🍎', cost: c(25, 15), react: 'shake' },
  { id: 'rock', name: '이끼 바위', emoji: '🪨', cost: c(10), react: 'bounce' },
  { id: 'bench', name: '벤치', emoji: '🪑', cost: c(30, 10), react: 'bounce', desc: '주민이 와서 앉아요' },
  { id: 'lamp', name: '가로등', emoji: '🏮', cost: c(35, 10), react: 'toggle', desc: '눌러서 켜고 꺼요 · 밤에는 저절로 켜져요' },
  { id: 'mailbox', name: '우체통', emoji: '📮', cost: c(25, 10), react: 'letter', desc: '누르면 주민의 편지가 와요' },
  { id: 'sign', name: '이정표', emoji: '🪧', cost: c(15), react: 'sign' },
  { id: 'campfire', name: '모닥불', emoji: '🔥', cost: c(30, 0, 5), react: 'sparks' },
  { id: 'pond', name: '작은 연못', emoji: '💧', cost: c(20, 25), react: 'splash' },
  { id: 'scarecrow', name: '허수아비', emoji: '🌾', cost: c(25, 5), react: 'shake' },
  { id: 'flagpole', name: '나라 깃발', emoji: '🚩', cost: c(30, 10), react: 'shake', desc: '나라 문장이 그려져요' },
  { id: 'balloon', name: '풍선', emoji: '🎈', cost: c(10, 10), react: 'bounce' },
];
export const propById = (id) => PROPS.find((p) => p.id === id);

export const PROP_SIZES = [0.8, 1, 1.25]; // 작게 · 보통 · 크게
export const MAX_PROPS = 40; // 섬 하나에 놓을 수 있는 소품 수
