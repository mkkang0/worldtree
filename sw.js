// 오프라인용 캐시. 파일을 고쳐서 다시 배포할 때는 CACHE 숫자를 올린다.
// 새 파일을 만들면 FILES에도 추가한다.
const CACHE = 'worldtree-v2';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',

  'css/base.css',
  'css/components.css',
  'css/features.css',
  'css/motion.css',
  'css/tokens.css',
  'js/app/context.js',
  'js/app/events.js',
  'js/app/render.js',
  'js/app/wallet.js',
  'js/art/companions.js',
  'js/art/effects.js',
  'js/art/land.js',
  'js/art/ornaments.js',
  'js/art/scene.js',
  'js/art/sky.js',
  'js/art/spirit.js',
  'js/art/svg.js',
  'js/art/thumbs.js',
  'js/art/tree.js',
  'js/art/wardrobe.js',
  'js/art/worlds.js',
  'js/core/achievements.js',
  'js/core/config.js',
  'js/core/dates.js',
  'js/core/quests.js',
  'js/core/records.js',
  'js/core/scoring.js',
  'js/core/share.js',
  'js/data/items/cost.js',
  'js/data/items/index.js',
  'js/data/items/scenery.js',
  'js/data/items/themes.js',
  'js/data/items/wardrobe.js',
  'js/data/lists.js',
  'js/data/store.js',
  'js/data/trees.js',
  'js/features/forest.js',
  'js/features/friends.js',
  'js/features/goals.js',
  'js/features/home.js',
  'js/features/meal.js',
  'js/features/more.js',
  'js/features/onboarding.js',
  'js/features/settings.js',
  'js/features/shop.js',
  'js/features/stats.js',
  'js/features/study.js',
  'js/features/workout.js',
  'js/main.js',
  'js/ui/components.js',
  'js/ui/dom.js',
  'js/ui/effects.js',
  'js/ui/icons.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 캐시 우선, 없으면 네트워크.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});
