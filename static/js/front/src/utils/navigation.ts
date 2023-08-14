function setWindowTitle(title: string, basic?: boolean){
    document.title = `${basic ? "" : "SWC flexNit -"} ${title}`
}

function navigateTo(page: string, url?: string, pageName?: string){
    if(!url) url = page
    if(url === location.pathname) return

    window.history.pushState(null, "", url)
    window.dispatchEvent(new Event("popstate"))
}

export { setWindowTitle, navigateTo }