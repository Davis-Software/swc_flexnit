import TitleEntryType from "../types/titleEntryType";
import SongType from "../types/songType";

function setMediaInfo(title: TitleEntryType | SongType | null){
    if(!("mediaSession" in navigator)) return
    if(!title) {
        navigator.mediaSession.metadata = null
        return
    }
    navigator.mediaSession.metadata = new MediaMetadata({
        title: title.title,
        artist: (title as SongType).artists ? (title as SongType).artists : undefined,
        album: (title as SongType).album ? (title as SongType).album : undefined,
        artwork: [
            {src: (
                (title as SongType).audio_info ?
                `/music/${(title as SongType).uuid}?thumbnail` :
                `/${(title as TitleEntryType).type === "movie" ? "movies" : "series"}/${(title as TitleEntryType).uuid}?poster&q=m`
            ), type: 'image/png'},
        ]
    })
}

export {setMediaInfo}