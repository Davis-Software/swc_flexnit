import MovieType from "../types/movieType";
import {EpisodeType} from "../types/seriesType";
import TitleEntryType from "../types/titleEntryType";

const streamingModeParameterName = "streamingMode"

function selectStreamingMode(video: MovieType | EpisodeType | TitleEntryType, favor: "hls" | "dash" | undefined = undefined, noUrl: boolean = false){
    let streamingMode
    if(
        ((video as MovieType | EpisodeType).video_dash || (video as TitleEntryType).dash)
        && favor === "dash"
    ) {
        streamingMode = "dash"
    }else if(
        ((video as MovieType | EpisodeType).video_hls || (video as TitleEntryType).hls)
        && favor === "hls"
    ) {
        streamingMode = "hls"
    }else if((video as MovieType | EpisodeType).video_dash || (video as TitleEntryType).dash) {
        streamingMode = "dash"
    }else if((video as MovieType | EpisodeType).video_hls || (video as TitleEntryType).hls) {
        streamingMode = "hls"
    }else{
        streamingMode = "file"
    }

    if(noUrl) return streamingMode
    return `${streamingModeParameterName}=${streamingMode}`
}

export {streamingModeParameterName}
export {selectStreamingMode}