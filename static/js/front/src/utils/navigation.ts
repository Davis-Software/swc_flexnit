function setWindowTitle(title: string, basic?: boolean){
    document.title = `${basic ? "" : "SWC flexNit -"} ${title}`
}

function navigateTo(url: string, noSetPrevState?: boolean){
    if(url === location.pathname) return

    window.history.pushState(!noSetPrevState ? location.href : (history.state || null), "", url)
    window.dispatchEvent(new Event("popstate"))
}

export { setWindowTitle, navigateTo }