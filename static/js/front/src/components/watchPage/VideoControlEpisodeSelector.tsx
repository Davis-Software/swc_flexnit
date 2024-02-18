import {Button, Menu} from "@mui/material";
import SeriesType from "../../types/seriesType";
import {EpisodeList} from "../series/SeriesInfo";
import {handleSyncUpload} from "../../utils/syncControls";
import {navigateTo} from "../../utils/navigation";
import {selectStreamingMode} from "../../utils/streaming";
import React from "react";

interface VideoControlEpisodeSelectorProps {
    videoInfo: SeriesType | null;
    mode: "series" | "movie";
    showEpisodeSelector: boolean;
    setShowEpisodeSelector: React.Dispatch<React.SetStateAction<boolean>>;
    showEpisodeSelectorButtonRef: React.RefObject<HTMLButtonElement>;
}
function VideoControlEpisodeSelector(props: VideoControlEpisodeSelectorProps) {
    const searchParams = new URLSearchParams(window.location.search)

    return props.videoInfo && props.mode === "series" ? (
        <>
            <Button ref={props.showEpisodeSelectorButtonRef} variant="text" size="large"
                    onClick={() => props.setShowEpisodeSelector(s => !s)}>
                <i className="material-icons"
                   style={{fontSize: "2rem"}}>{props.showEpisodeSelector ? "menu_open" : "menu"}</i>
            </Button>
            <Menu
                open={props.showEpisodeSelector}
                onClose={() => props.setShowEpisodeSelector(false)}
                anchorEl={props.showEpisodeSelectorButtonRef.current}
                anchorOrigin={{vertical: "top", horizontal: "left"}}
                transformOrigin={{vertical: "bottom", horizontal: "left"}}
            >
                <div
                    style={{
                        height: "50vh",
                        width: "40vw",
                    }}
                >
                    {[...Array((props.videoInfo as SeriesType).season_count)].map((_, season) => (
                        <EpisodeList
                            key={season}
                            series={props.videoInfo as SeriesType}
                            season={season}
                            handlePlayEpisode={(e) => {
                                handleSyncUpload(state => {
                                    !state && alert("Failed to sync playback progress")
                                    navigateTo(`/watch?series=${props.videoInfo?.uuid}&episode=${e.uuid}&${selectStreamingMode(e)}`, true)
                                    props.setShowEpisodeSelector(false)
                                })
                            }}
                            selectedEpisode={(props.videoInfo as SeriesType).episodes.find(e => e.uuid === searchParams.get("episode"))}
                        />
                    ))}
                </div>
            </Menu>
        </>
    ) : null
}

export default VideoControlEpisodeSelector;