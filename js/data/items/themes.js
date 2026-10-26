// 앱 테마. 색은 css/tokens.css의 html[data-theme="이름"] (아이템 id에서 'theme-'를 뺀 이름).
// swatch: 상점에 보이는 색 견본 [주 색, 바탕색]
import { c } from './cost.js';

export const THEMES = [
  { id: 'theme-dawn', slot: 'theme', name: '새벽빛', cost: c(30, 10), swatch: ['#b9786a', '#fbf1ea'] },
  { id: 'theme-sakura', slot: 'theme', name: '벚꽃', cost: c(40, 20), swatch: ['#c0607f', '#fcf0f3'] },
  { id: 'theme-frost', slot: 'theme', name: '서리', cost: c(40, 20), swatch: ['#4f7d96', '#eef4f7'] },
  { id: 'theme-jade', slot: 'theme', name: '비취', cost: c(50, 20), swatch: ['#2f8a76', '#eef6f2'] },
  { id: 'theme-starlight', slot: 'theme', name: '별빛 밤', cost: c(70, 30), swatch: ['#c9a96a', '#141a33'] },
  { id: 'theme-ledger', slot: 'theme', name: '회계 장부', cost: c(0, 0, 50), swatch: ['#2f4a7a', '#fbf6e6'] },
];
