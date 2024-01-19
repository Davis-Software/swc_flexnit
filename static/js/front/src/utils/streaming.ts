import MovieType from "../types/movieType";
import {EpisodeType} from "../types/seriesType";

const streamingModeParameterName = "streamingMode"

function selectStreamingMode(video: MovieType | EpisodeType, favor: "hls" | "dash" | undefined = undefined){
    if(video.video_dash && favor === "dash") {
        return `${streamingModeParameterName}=dash`
    }else if(video.video_hls && favor === "hls") {
        return `${streamingModeParameterName}=hls`
    }else if(video.video_dash) {
        return `${streamingModeParameterName}=dash`
    }else if(video.video_hls) {
        return `${streamingModeParameterName}=hls`
    }else{
        return `${streamingModeParameterName}=file`
    }
}

export {streamingModeParameterName}
export {selectStreamingMode}