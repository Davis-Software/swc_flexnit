import React, {useEffect, useMemo, useState} from "react";
import {TVPlayer, TVPlayerButtonProps} from "react-tv-player";
import {selectStreamingMode} from "../utils/streaming";
import PageLoader from "../components/PageLoader";
import {useNavigation} from "../smartTVComponents/navigation/SmartTVNavigation";


function SmartTVWatch(){
    const {state, navigate} = useNavigation()
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
        if(
            !state.title ||
            (state.title.type === "series" && !state.episode)
        ){
            navigate("home")
            return
        }

        let bestStreamingMethod = selectStreamingMode(state.title, "dash", true)
        let streamFileExtension = bestStreamingMethod === "dash" ? ".mpd" : (bestStreamingMethod === "hls" ? ".m3u8" : "")
        let urlEnd = `deliver/${bestStreamingMethod}/index${streamFileExtension}`
        if(state.title.type === "movie"){
            setStreamingPath(`/movies/${state.title.uuid}/${urlEnd}`)
        }else{
            setStreamingPath(`/series/${state.title.uuid}/episode/${state.episode.uuid}/${urlEnd}`)
        }
    }, [state.title]);

    if(!streamingPath) return <PageLoader />

    return (
        <>
            <style>
                {`
                    .progress-bar {
                        flex-direction: revert;
                    }
                `}
            </style>
            <TVPlayer
                url={streamingPath}
                title={state.title?.type === "series" ? state.episode?.title : state.title?.title}
                subTitle={state.title?.type === "series" ? state.title?.title : undefined}
                light={`/${state.title.type === "movie" ? "movies" : "series"}/${state.title.uuid}?poster`}
                customButtons={customButtons}
                hideControlsOnArrowUp
                playing
            />
        </>
    )
}

export default SmartTVWatch;