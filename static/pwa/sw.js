const cacheName = "flexNit-cache-v1"

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll([
            "/favicon",
            "/",
            "/login",
            "/logout",
            "/offline"
        ]))
    )
    console.info('[SW] Service worker installed')
})
self.addEventListener('fetch', event => {
    event.respondWith(
        navigator.onLine ? caches.match(event.request).then(response => {
            return response || fetch(event.request, {redirect: "follow", mode: "no-cors"})
        }) : caches.match("/offline")
    )
})