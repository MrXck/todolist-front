const CACHE_NAME = 'ROOT_TODO_CACHE'
const needCache = [
    '/todo/'
]

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching pre-defined resources');
            return cache.addAll(needCache);
        }).catch((error) => {
            console.error('[Service Worker] Failed to cache resources during install:', error);
        })
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    // 仅处理需要缓存的请求
    if (!needCache.includes(requestUrl.pathname)) return;

    // 处理 fetch 事件
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // 如果缓存存在，立即返回缓存内容
                console.log(`[Service Worker] Serving from cache: ${event.request.url}`);

                // 后台发起网络请求以更新缓存
                event.waitUntil(
                    fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            return caches.open(CACHE_NAME).then((cache) => {
                                // 缓存最新内容，下次使用
                                cache.put(event.request, networkResponse.clone());
                                console.log(`[Service Worker] Fetched and cached (background): ${event.request.url}`);
                            });
                        }
                    }).catch((error) => {
                        console.error(`[Service Worker] Background fetch failed for: ${event.request.url}`, error);
                    })
                );

                return cachedResponse; // 立即返回缓存内容
            }

            // 如果缓存不存在，从网络获取最新资源
            return fetch(event.request).catch((error) => {
                console.error(`[Service Worker] Fetch failed for: ${event.request.url}`, error);
            });
        })
    );
});

// 激活事件：清理旧版本的缓存
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 确保 SW 控制所有客户端
    );
});
