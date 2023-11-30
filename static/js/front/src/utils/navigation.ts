import TitleEntryType from "../types/titleEntryType";

function setWindowTitle(title: string, basic?: boolean){
    document.title = `${basic ? "" : "SWC flexNit -"} ${title}`
}

function navigateTo(url: string, noSetPrevState?: boolean){
    if(url === location.pathname) return

    window.history.pushState(!noSetPrevState ? location.href : (history.state || null), "", url)
    window.dispatchEvent(new Event("popstate"))
}

function navigateToTitle(title: TitleEntryType){
    if(window.innerWidth < 840) {
        navigateTo(`/info?mode=${title.type}&uuid=${title.uuid}`)
    }else{
        navigateTo(`/?type=${title.type}&selected=${title.uuid}`)
    }
}

export { setWindowTitle, navigateTo, navigateToTitle }