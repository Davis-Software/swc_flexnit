import MovieType from "../types/movieType";
import {EpisodeType} from "../types/seriesType";

const streamingModeParameterName = "streamingMode"

function selectStreamingMode(video: MovieType | EpisodeType, favor: "hls" | "dash" | undefined = undefined, noUrl: boolean = false){
    let streamingMode
    if(video.video_dash && favor === "dash") {
        streamingMode = "dash"
    }else if(video.video_hls && favor === "hls") {
        streamingMode = "hls"
    }else if(video.video_dash) {
        streamingMode = "dash"
    }else if(video.video_hls) {
        streamingMode = "hls"
    }else{
        streamingMode = "file"
    }

    if(noUrl) return streamingMode
    return `${streamingModeParameterName}=${streamingMode}`
}

export {streamingModeParameterName}
export {selectStreamingMode}