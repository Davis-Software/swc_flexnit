import MovieType from "../types/movieType";
import {EpisodeType} from "../types/seriesType";

const streamingModeParameterName = "streamingMode"

function selectStreamingMode(video: MovieType | EpisodeType, favor: "hls" | "dash" | undefined = undefined, clean=false){
    let mode
    if(video.video_dash && favor === "dash") {
        mode = "dash"
    }else if(video.video_hls && favor === "hls") {
        mode = "hls"
    }else if(video.video_dash) {
        mode = "dash"
    }else if(video.video_hls) {
        mode = "hls"
    }else{
        mode = "file"
    }
    return clean ? mode : `${streamingModeParameterName}=${mode}`
}

export {streamingModeParameterName}
export {selectStreamingMode}