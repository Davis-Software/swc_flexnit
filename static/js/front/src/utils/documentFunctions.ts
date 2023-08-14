function openFullscreen(video?: HTMLVideoElement) {
    if (document.documentElement.requestFullscreen) {
        return document.documentElement.requestFullscreen();
    // @ts-ignore
    } else if (video && video.webkitRequestFullscreen) { /* Safari */
        // @ts-ignore
        return video.webkitRequestFullscreen();
    // @ts-ignore
    } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
        // @ts-ignore
        return document.documentElement.msRequestFullscreen();
    }
}
function closeFullscreen(video?: HTMLVideoElement) {
    if (document.exitFullscreen) {
        return document.exitFullscreen();
    // @ts-ignore
    } else if (video && video.webkitExitFullscreen) { /* Safari */
        // @ts-ignore
        return video.webkitExitFullscreen();
    // @ts-ignore
    } else if (document.msExitFullscreen) { /* IE11 */
        // @ts-ignore
        return document.msExitFullscreen();
    }
}

export {openFullscreen, closeFullscreen}