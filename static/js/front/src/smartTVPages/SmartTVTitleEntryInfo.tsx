import React, {useEffect} from "react";
import {Box} from "@mui/material";
import {useNavigation} from "../smartTVComponents/navigation/SmartTVNavigation";
import SmartTVPageBase from "./SmartTVPageBase";
import SmartTVTitlePreview from "../smartTVComponents/titleDisplay/SmartTVTitlePreview";
import {InfoCallbackType} from "../components/other/TitleProgress";
import FocusableButton from "../smartTVComponents/FocusableButton";
import {FocusContext, useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import {EpisodeType} from "../types/seriesType";
import SmartTVSeriesEpisodeList from "../smartTVComponents/SmartTVSeriesEpisodeList";

function SmartTVTitleEntryInfo() {
    const {state, navigate} = useNavigation()
    const {ref, focusKey, focusSelf} = useFocusable()
    const [progressInfo, setProgressInfo] = React.useState<InfoCallbackType | null>(null)
    const [showEpisodes, setShowEpisodes] = React.useState(false)

    useEffect(() => {
        focusSelf()
    }, []);

    function handlePlay(episode?: EpisodeType){
        navigate("watch", {title: state.title, progressInfo, episode})
    }

    return (
        <SmartTVPageBase className="p-5">
            <SmartTVTitlePreview title={state.title} setProgress={setProgressInfo} />
            <FocusContext.Provider value={focusKey}>
                <Box ref={ref} className="position-relative mt-5 z-1">
                    {state.title.type === "movie" ? (
                        <FocusableButton
                            variant="contained"
                            color="primary"
                            onClick={() => handlePlay()}
                            className="mt-3"
                            size="large"
                        >{progressInfo?.progress && progressInfo.progress > 1 ? (
                            progressInfo.progress < 100 ? "Continue Watching" : "Watch Again"
                        ) : "Play"}</FocusableButton>
                    ) : (
                        <>
                            <FocusableButton
                                variant="contained"
                                color="primary"
                                onClick={() => handlePlay(
                                    progressInfo?.lastEpisode ||
                                    state.title.episodes.sort((a: EpisodeType, b: EpisodeType) => a.episode - b.episode)[0]
                                )}
                                className="mt-3"
                                size="large"
                            >{progressInfo?.lastEpisode ? "Continue Watching" : "Play"}</FocusableButton>
                            <FocusableButton
                                variant="contained"
                                color="secondary"
                                onClick={() => setShowEpisodes(s => !s)}
                                className="mt-3 ms-lg-3"
                                size="large"
                            >{showEpisodes ? "Hide" : "Show"} Episodes</FocusableButton>
                        </>
                    )}
                </Box>
                {state.title.type === "series" && (
                    <SmartTVSeriesEpisodeList
                        title={state.title}
                        show={showEpisodes}
                        className="z-1"
                        onChoose={handlePlay}
                    />
                )}
            </FocusContext.Provider>
        </SmartTVPageBase>
    )
}

export default SmartTVTitleEntryInfo;