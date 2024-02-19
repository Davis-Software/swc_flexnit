import {Button, CircularProgress, Fade, Slider} from "@mui/material";
import SeriesType from "../../types/seriesType";
import React, {useContext} from "react";
import VideoControlActions from "./VideoControlActions";
import VideoControlHUD from "./VideoControlHUD";
import VideoControlElements from "./VideoControlElements";
import VideoControlEpisodeSelector from "./VideoControlEpisodeSelector";
import MovieType from "../../types/movieType";
import {VideoContext} from "../../contexts/watchPageVideoContext";

function getTimeString(seconds: number){
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const seconds2 = Math.round(seconds % 60);
    return `${hours <= 9 ? "0" + hours : hours}:${minutes <= 9 ? "0" + minutes : minutes}:${seconds2 <= 9 ? "0" + seconds2 : seconds2}`
}

interface VideoControlMountProps {
    showControls: boolean;
    playing: boolean;
    setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    handlePlayFromBeginning: () => void;
    setSelectedSubtitleTrack: React.Dispatch<React.SetStateAction<number>>;
    loading: boolean;
    showNSFWModal: boolean;
    showErrorModal: boolean;
    timePlayed: number;
    setTimePlayed: React.Dispatch<React.SetStateAction<number>>;
    showTimelineFramePreview: boolean;
    setShowTimelineFramePreview: React.Dispatch<React.SetStateAction<boolean>>;
    computeTimelinePreviewFrameLocation: () => number;
    videoInfo: MovieType | SeriesType | null;
    mode: "series" | "movie";
    audioTracks: any[];
    selectedAudioTrack: number;
    selectDashAudioTrack: (index: number) => void;
    subtitleTracks: any[];
    selectedSubtitleTrack: number;
    selectDashSubtitleTrack: (index: number) => void;
    volume: number;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
    playbackSpeed: number;
    setPlaybackSpeed: React.Dispatch<React.SetStateAction<number>>;
    fullscreen: boolean;
    setFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
    showEpisodeSelector: boolean;
    setShowEpisodeSelector: React.Dispatch<React.SetStateAction<boolean>>;
    showEpisodeSelectorButtonRef: React.RefObject<HTMLButtonElement>;
    displayPlaybackError: boolean;
    handleBack: () => void;
    handleForward: () => void;
    setTimelineFramePreviewLocation: React.Dispatch<React.SetStateAction<number>>;
    setShowControls: React.Dispatch<React.SetStateAction<boolean>>;
    timelineFramePreviewLocation: number | null;
    videoFramePreviewLink: string;
    watchAlong: boolean;
    setWatchAlong: React.Dispatch<React.SetStateAction<boolean>>;
    hostingRoom: boolean;
}
function VideoControls(props: VideoControlMountProps) {
    const searchParams = new URLSearchParams(window.location.search)
    const {videoRef} = useContext(VideoContext)

    function handleTimelineFramePreview(e: React.TouchEvent<HTMLSpanElement> | React.MouseEvent<HTMLSpanElement> | any){
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        props.setTimelineFramePreviewLocation(x)
        props.setShowControls(true)
    }

    function TimelineFramePreview(){
        if(!videoRef.current || !props.timelineFramePreviewLocation) return null;
        const frameNumber = Math.floor((props.timelineFramePreviewLocation / window.innerWidth) * videoRef.current!.duration)
        let splittingAmount = Math.floor(videoRef.current!.duration / 10)
        splittingAmount = splittingAmount > 25 ? 25 : splittingAmount
        const nearestFrameInStorage = Math.floor(frameNumber / splittingAmount) * splittingAmount

        if(!nearestFrameInStorage) return null;

        return (
            <img
                alt=""
                className="position-absolute top-0 start-0"
                src={props.videoFramePreviewLink + `/${nearestFrameInStorage}`}
                style={{width: "100%", height: "100%", objectFit: "contain"}}
            />
        )
    }

    return (
        <div
            className="w-100 h-100"
            style={{zIndex: 1000}}
        >
            <Fade in={(props.showControls || !props.playing || props.loading) && !props.showNSFWModal && !props.showErrorModal}>
                <div
                    className="w-100 h-100 position-relative"
                    style={{cursor: (props.showControls || !props.playing) ? "default" : "none"}}
                >
                    <VideoControlActions
                        watchAlong={props.watchAlong}
                        setWatchAlong={props.setWatchAlong}
                        hostingRoom={props.hostingRoom}
                    />
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center">
                        <VideoControlHUD
                            playing={props.playing}
                            setPlaying={props.setPlaying}
                            loading={props.loading}
                            mode={props.mode}
                            displayPlaybackError={props.displayPlaybackError}
                            handleBack={props.handleBack}
                            handleForward={props.handleForward}
                        />
                    </div>
                    <div
                        className="position-absolute w-100 start-0 bottom-0"
                        style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}}
                    >
                        <div className="mx-2 position-relative">
                            <Slider
                                value={props.timePlayed}
                                onChange={(_, v) => {
                                    props.setTimePlayed(v as number)
                                }}
                                onChangeCommitted={(_, v) => {
                                    videoRef.current!.currentTime = v as number
                                }}
                                onMouseEnter={() => props.setShowTimelineFramePreview(true)}
                                onMouseLeave={() => props.setShowTimelineFramePreview(false)}
                                onMouseMove={handleTimelineFramePreview}
                                onTouchStart={() => props.setShowTimelineFramePreview(true)}
                                onTouchEnd={() => props.setShowTimelineFramePreview(false)}
                                onTouchMove={handleTimelineFramePreview}
                                sx={{width: "100%"}}
                                max={videoRef.current?.duration || 0}
                                step={.01}
                            />
                            <Fade in={props.showTimelineFramePreview}>
                                <div
                                    className="position-absolute d-flex justify-content-center align-items-center"
                                    style={{
                                        left: `${props.computeTimelinePreviewFrameLocation()}px`,
                                        bottom: "40px",
                                        width: "200px",
                                        height: "100px",
                                    }}
                                >
                                    <CircularProgress/>
                                    <TimelineFramePreview/>
                                </div>
                            </Fade>
                        </div>
                        <div className="d-flex" style={{height: "100px"}}>
                            <div className="d-flex m-2 justify-content-center align-items-center">
                                <Button variant="text" size="large" onClick={() => props.setPlaying(p => !p)}>
                                    <i className="material-icons"
                                       style={{fontSize: "2rem"}}>{props.playing ? "pause" : "play_arrow"}</i>
                                </Button>
                                <Button variant="text" size="large" onClick={props.handlePlayFromBeginning}>
                                    <i className="material-icons" style={{fontSize: "2rem"}}>replay</i>
                                </Button>
                            </div>
                            <div className="d-flex m-2 ms-4 justify-content-center align-items-start flex-column">
                                <h4>{props.videoInfo?.title}</h4>
                                {props.mode === "series" && (() => {
                                    const episode = (props.videoInfo as SeriesType)?.episodes.find(episode => episode.uuid === searchParams.get("episode"))
                                    return (
                                        <h6>Season {episode?.season} Episode {episode?.episode}</h6>
                                    )
                                })()}
                            </div>
                            <div className="d-flex m-2 justify-content-center align-items-center flex-grow-1">
                                {props.videoInfo && props.mode === "series" && (
                                    <h5>{(props.videoInfo as SeriesType)?.episodes.find(episode => episode.uuid === searchParams.get("episode"))?.title}</h5>
                                )}
                            </div>
                            {!!props.videoInfo && (
                                <div className="d-flex m-2 justify-content-center align-items-center">
                                    {getTimeString(props.timePlayed)} / {getTimeString(videoRef.current?.duration || 0)}
                                </div>
                            )}
                            <div className="d-flex m-2 justify-content-center align-items-center">
                                <VideoControlElements
                                    volume={props.volume}
                                    setVolume={props.setVolume}
                                    playbackSpeed={props.playbackSpeed}
                                    setPlaybackSpeed={props.setPlaybackSpeed}
                                    audioTracks={props.audioTracks}
                                    selectedAudioTrack={props.selectedAudioTrack}
                                    selectDashAudioTrack={props.selectDashAudioTrack}
                                    subtitleTracks={props.subtitleTracks}
                                    selectedSubtitleTrack={props.selectedSubtitleTrack}
                                    selectDashSubtitleTrack={props.selectDashSubtitleTrack}
                                />
                                <VideoControlEpisodeSelector
                                    videoInfo={(props.videoInfo as SeriesType)}
                                    mode={props.mode}
                                    showEpisodeSelector={props.showEpisodeSelector}
                                    setShowEpisodeSelector={props.setShowEpisodeSelector}
                                    showEpisodeSelectorButtonRef={props.showEpisodeSelectorButtonRef}
                                />
                                <Button variant="text" size="large" onClick={() => props.setFullscreen(f => !f)}>
                                    <i className="material-icons"
                                       style={{fontSize: "2rem"}}>{props.fullscreen ? "fullscreen_exit" : "fullscreen"}</i>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Fade>
        </div>
    )
}

export default VideoControls;
