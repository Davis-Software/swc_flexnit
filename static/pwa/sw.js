const cacheName = "flexNit-cache-v1"

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll([
            "/offline"
        ]))
    )
    console.info('[SW] Service worker installed')
})
self.addEventListener('fetch', event => {
    if(!navigator.onLine){
        event.respondWith(caches.match("/offline"))
    }
})