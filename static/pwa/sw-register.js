(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw').then(() => {
            console.debug('[SW] Service Worker Registered')
        })
    }
})()