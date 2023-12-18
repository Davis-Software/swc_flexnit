import {user} from "./constants";

function checkSyncEnabled(){
    return localStorage.getItem("syncPlayback") !== null ? (localStorage.getItem("syncPlayback") === "true") : true
}

function handleSyncDownload(callback?: (data: any) => void, force?: boolean, uploadIfOutdated?: boolean){
    if(!checkSyncEnabled() && !force) return

    fetch("/sync")
        .then(res => res.json())
        .then(data => {
            if((localStorage.getItem("playbackProgress") || localStorage.getItem("library")) &&
                parseFloat(localStorage.getItem("playbackProgressLastUpdated") || "0") > data.updated_at &&
                localStorage.getItem("playbackProgressUser") === user
            ){
                if(uploadIfOutdated){
                    handleSyncUpload()
                }
                return
            }
            localStorage.setItem("playbackProgressLastUpdated", data.updated_at)
            localStorage.setItem("playbackProgress", data.progress ? JSON.stringify(data.progress) : "{}")
            localStorage.setItem("library", data.library ? JSON.stringify(data.library) : "{}")
            localStorage.setItem("playbackProgressUser", user)
            callback && callback(data)
        })
}
function handleSyncUpload(callback?: (state: boolean) => void, force?: boolean, libraryOnly?: boolean){
    if(!checkSyncEnabled() && !force) return

    const formData = new FormData()

    if(!libraryOnly){
        formData.append("playback_progress", localStorage.getItem("playbackProgress") || "{}")
    }
    formData.append("playback_library", localStorage.getItem("library") || "{}")

    formData.append("playback_user", user)
    fetch("/sync", {
        method: "POST",
        body: formData
    })
        .then(res => {
            callback && callback(res.ok)
        })
}

export {handleSyncDownload, handleSyncUpload, checkSyncEnabled}
