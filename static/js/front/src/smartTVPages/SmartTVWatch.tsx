import React, {useEffect, useMemo, useState} from "react";
import {TVPlayer, TVPlayerButtonProps} from "react-tv-player";
import MovieType from "../types/movieType";
import {EpisodeType} from "../types/seriesType";
import {selectStreamingMode} from "../utils/streaming";
import PageLoader from "../components/PageLoader";
import {useNavigation} from "../smartTVComponents/navigation/SmartTVNavigation";


function SmartTVWatch(){
    const {state, navigate} = useNavigation()
    const [actualTitle, setActualTitle] = useState<MovieType | EpisodeType | null>(null)
    const [streamingPath, setStreamingPath] = useState<string | null>(null)

    const customButtons: TVPlayerButtonProps[] = useMemo(() => [
        {
            action: "custom",
            align: "left",
            onPress: () => navigate("info", {...state}),
            label: "Go Back"
        },
        { action: "skipback", align: "center" },
        { action: "playpause", align: "center" },
        { action: "skipforward", align: "center" }
    ], [])

    useEffect(() => {
        fetch(`/${state.title.type === "movie" ? "movies" : "series"}/${state.title.uuid}`)
            .then(res => res.json())
            .then(setActualTitle)
    }, [state.title]);
    useEffect(() => {
        if(!actualTitle) return
        let bestStreamingMethod = selectStreamingMode(actualTitle, "dash", true)
        let streamFileExtension = bestStreamingMethod === "dash" ? ".mpd" : (bestStreamingMethod === "hls" ? ".m3u8" : "")
        setStreamingPath(`/${state.title.type === "movie" ? "movies" : "series"}/${actualTitle.uuid}/deliver/${bestStreamingMethod}/index${streamFileExtension}`)
    }, [actualTitle]);

    if(!streamingPath) return <PageLoader />

    return <TVPlayer
        url={streamingPath}
        title={state.title.title}
        light={`/${state.title.type === "movie" ? "movies" : "series"}/${state.title.uuid}?poster`}
        customButtons={customButtons}
        hideControlsOnArrowUp
        playing
    />
}

export default SmartTVWatch;