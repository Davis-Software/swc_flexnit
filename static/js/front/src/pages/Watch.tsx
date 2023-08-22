import React, {useCallback, useEffect, useRef, useState} from "react";
import PageBase from "./PageBase";
import Hls from "hls.js";
import {Button, CircularProgress, Fade, Menu, Slider} from "@mui/material";
import MovieType from "../types/movieType";
import SeriesType from "../types/seriesType";
import SwcLoader from "../components/SwcLoader";
import {navigateTo} from "../utils/navigation";
import {EpisodeList} from "../components/series/SeriesInfo";
import {closeFullscreen, openFullscreen} from "../utils/documentFunctions";
import {handleSyncUpload} from "../components/SyncPlaybackProgress";

function getTimeString(seconds: number){
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const seconds2 = Math.round(seconds % 60);
    return `${hours < 9 ? "0" + hours : hours}:${minutes < 9 ? "0" + minutes : minutes}:${seconds2 < 9 ? "0" + seconds2 : seconds2}`
}

function Home(){
    const mode: "movie" | "series" = window.location.href.includes("?movie=") ? "movie" : "series"
    const videoRef = useRef<HTMLVideoElement>(null);
    const showEpisodeSelectorButtonRef = useRef<HTMLButtonElement>(null);
    const showVolumeControlsButtonRef = useRef<HTMLButtonElement>(null);
    const showPlaybackSpeedControlsRef = useRef<HTMLButtonElement>(null);

    const [videoLink, setVideoLink] = useState<string>("")
    const [videoInfo, setVideoInfo] = useState<MovieType | SeriesType | null>(null)
    const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search))

    const [showControls, setShowControls] = useState(false)
    const [showTimelineFramePreview, setShowTimelineFramePreview] = useState(false)
    const [timelineFramePreviewLocation, setTimelineFramePreviewLocation] = useState<number>(0)
    const [showEpisodeSelector, setShowEpisodeSelector] = useState(false)
    const [showVolumeControls, setShowVolumeControls] = useState(false)
    const [showPlaybackSpeedControls, setShowPlaybackSpeedControls] = useState(false)
    const [_, setShowControlsTimeout] = useState<NodeJS.Timeout | null>(null)
    const [fullscreen, setFullscreen] = useState(false)
    const [loading, setLoading] = useState(true)

    const [playing, setPlaying] = useState(false)
    const [timePlayed, setTimePlayed] = useState(0)

    const [volume, setVolume] = useState(parseFloat(localStorage.getItem("volume") || "1"))
    const [playbackSpeed, setPlaybackSpeed] = useState(parseFloat(localStorage.getItem("playbackSpeed") || "1"))
    const [showPlayNextEpisode, setShowPlayNextEpisode] = useState(false)
    const [episodeEnded, setEpisodeEnded] = useState(false)
    const [displayError, setDisplayError] = useState(false)

    useEffect(() => {
        if(!videoRef.current) return;
        videoRef.current.pause()

        const searchParams = new URLSearchParams(window.location.search)
        setSearchParams(searchParams)
        const uuid = (searchParams.get("movie") || searchParams.get("series")) as string
        if(!uuid) return;

        const library = JSON.parse(localStorage.getItem("library") || "{}")
        if(!library[mode]){
            library[mode] = {}
        }
        if(!Object.keys(library[mode]).includes(uuid)){
            library[mode][uuid] = {
                lastWatched: Date.now(),
                showInLibrary: true
            }
        }else{
            library[mode][uuid].lastWatched = Date.now()
        }
        localStorage.setItem("library", JSON.stringify(library))

        const playbackProgress = JSON.parse(localStorage.getItem("playbackProgress") || "{}")

        fetch(mode === "movie" ? `/movies/${uuid}` : `/series/${uuid}`)
            .then(res => res.json())
            .then(setVideoInfo)

        function startPlayback(){
            setEpisodeEnded(false)
            if(playbackProgress[uuid]){
                if(mode === "series"){
                    const episode = searchParams.get("episode")
                    if((playbackProgress[uuid] as {[key: string]: number})[episode!]){
                        const targetTime = (playbackProgress[uuid] as {[key: string]: number})[episode!]
                        videoRef.current!.currentTime = targetTime < 10 || (targetTime >= (videoRef.current!.duration - 60)) ? 0 : targetTime
                    }
                }else{
                    let targetTime = playbackProgress[uuid] as number
                    videoRef.current!.currentTime = targetTime < 10 || (targetTime >= (videoRef.current!.duration - 180)) ? 0 : targetTime
                }
            }

            videoRef.current?.play()
                .then(() => setDisplayError(false))
                .catch(() => setDisplayError(true))
        }

        let path
        if(mode == "movie"){
            path = `/movies/${uuid}/deliver/main`
        }else{
            const episode = searchParams.get("episode")
            path = `/series/${uuid}/episode/${episode}/deliver/main`
        }
        setVideoLink(path)

        if(searchParams.has("hls") && Hls.isSupported()){
            const hls = new Hls()
            hls.loadSource(path + "?hls")
            hls.attachMedia(videoRef.current)
            hls.on(Hls.Events.MEDIA_ATTACHED, startPlayback)

            return () => {
                hls.destroy()
            }
        }else{
            videoRef.current.src = path
            videoRef.current.addEventListener("loadeddata", startPlayback)
        }
    }, [window.location.search]);

    function handleMouseMove(){
        if(showControls) return;
        setShowControls(true)
        setShowControlsTimeout(t => {
            if(t) clearTimeout(t)
            return setTimeout(() => setShowControls(false), 3000)
        })
    }
    function handlePlayFromBeginning(){
        videoRef.current!.currentTime = 0
        setPlaying(true)
    }
    function handleBack(){
        if(videoRef.current!.currentTime < 10){
            videoRef.current!.currentTime = 0
        }else{
            videoRef.current!.currentTime -= 10
        }
    }
    function handleForward(){
        if(videoRef.current!.currentTime + 10 > videoRef.current!.duration){
            videoRef.current!.currentTime = videoRef.current!.duration
        }else{
            videoRef.current!.currentTime += 10
        }
    }

    function handleKeyDown(e: KeyboardEvent){
        if(!videoRef.current) return;
        if([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "f", "Escape"].includes(e.key)){
            e.preventDefault()
        }

        handleMouseMove()
        switch (e.key) {
            case " ":
                setPlaying(p => !p)
                break;
            case "ArrowLeft":
                handleBack()
                break;
            case "ArrowRight":
                handleForward()
                break;
            case "ArrowUp":
                setVolume(v => Math.min(v + 0.1, 1))
                break;
            case "ArrowDown":
                setVolume(v => Math.max(v - 0.1, 0))
                break;
            case "f":
                setFullscreen(f => !f)
                break;
            case "Escape":
                setFullscreen(false)
                break;
            default:
                break;
        }
    }

    function timeUpdate(){
        if(!videoRef.current) return;
        setTimePlayed(videoRef.current.currentTime)
        setShowPlayNextEpisode(mode === "series" && (videoRef.current.currentTime >= videoRef.current.duration - 60))

        const searchParams = new URLSearchParams(window.location.search)
        const uuid = searchParams.get("movie") || searchParams.get("series")

        if(videoRef.current?.paused) return
        const p = JSON.parse(localStorage.getItem("playbackProgress") || "{}")
        const episode = searchParams.get("episode")
        const newPlaybackProgress = {
            ...p,
            [uuid!]: mode === "series" ? {
                ...(p[uuid!] ? p[uuid!] as {[key: string]: number} : {}),
                [episode!]: videoRef.current!.currentTime,
                latestEpisode: episode!
            } : videoRef.current!.currentTime
        }
        localStorage.setItem("playbackProgress", JSON.stringify(newPlaybackProgress))
        localStorage.setItem("playbackProgressLastUpdated", Date.now().toString())
    }

    function handlePlayNextEpisode(){
        if(mode !== "series" || !videoInfo) return;
        videoRef.current?.pause()
        setEpisodeEnded(false)

        const searchParams = new URLSearchParams(window.location.search)
        const uuid = searchParams.get("series")
        const episode = searchParams.get("episode")

        const currentEpisode = (videoInfo as SeriesType).episodes.find(e => e.uuid === episode)
        const episodes = (videoInfo as SeriesType).episodes.sort((a, b) => a.episode - b.episode)
        const episodesInCurrentSeason = episodes.filter(e => e.season === currentEpisode?.season)

        if(episodesInCurrentSeason.length === currentEpisode?.episode && currentEpisode?.season === (videoInfo as SeriesType).season_count){
            return
        }

        handleSyncUpload((state) => {
            !state && alert("Failed to sync playback progress")
            if(episodesInCurrentSeason.length === currentEpisode?.episode){
                const nextSeason = episodesInCurrentSeason[0].season + 1
                const nextEpisode = episodes.find(e => e.season === nextSeason && e.episode === 1)
                navigateTo(`/watch?series=${uuid}&episode=${nextEpisode?.uuid}${nextEpisode?.video_hls ? "&hls" : ""}`)
            }else{
                const nextEpisode = episodes.find(e => e.season === currentEpisode?.season && e.episode === currentEpisode?.episode + 1)
                navigateTo(`/watch?series=${uuid}&episode=${nextEpisode?.uuid}${nextEpisode?.video_hls ? "&hls" : ""}`)
            }
        })
    }

    useEffect(() => {
        if(!videoRef.current) return;
        if(episodeEnded){
            handlePlayNextEpisode()
        }
    }, [episodeEnded, videoRef.current]);

    useEffect(() => {
        if(!videoRef.current) return;
        if(playing){
            videoRef.current.play()
                .then(() => setDisplayError(false))
                .catch(() => setDisplayError(true))
        }else{
            videoRef.current.pause()
        }
    }, [playing])
    useEffect(() => {
        if(!videoRef.current) return;

        function handlePlay(){
            setPlaying(true)
        }
        function handlePause(){
            setPlaying(false)
        }
        function beginLoading(){
            setLoading(true)
        }
        function endLoading(){
            setLoading(false)
        }
        function nextEpisode(){
            setEpisodeEnded(true)
        }

        videoRef.current.addEventListener("play", handlePlay)
        videoRef.current.addEventListener("pause", handlePause)
        videoRef.current.addEventListener("ended", nextEpisode)

        videoRef.current.addEventListener("timeupdate", timeUpdate)
        videoRef.current.addEventListener("loadstart", beginLoading)
        videoRef.current.addEventListener("seek", beginLoading)
        videoRef.current.addEventListener("waiting", beginLoading)
        videoRef.current.addEventListener("loadeddata", endLoading)
        videoRef.current.addEventListener("seeked", endLoading)
        videoRef.current.addEventListener("canplay", endLoading)

        document.addEventListener("keydown", handleKeyDown)

        return () => {
            if(!videoRef.current) return;

            videoRef.current.removeEventListener("play", handlePlay)
            videoRef.current.removeEventListener("pause", handlePause)
            videoRef.current.removeEventListener("ended", nextEpisode)

            videoRef.current.removeEventListener("timeupdate", timeUpdate)
            videoRef.current.removeEventListener("loadstart", beginLoading)
            videoRef.current.removeEventListener("seek", beginLoading)
            videoRef.current.removeEventListener("waiting", beginLoading)
            videoRef.current.removeEventListener("loadeddata", endLoading)
            videoRef.current.removeEventListener("seeked", endLoading)
            videoRef.current.removeEventListener("canplay", endLoading)

            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [videoRef.current])
    useEffect(() => {
        // @ts-ignore
        if(fullscreen && !document.fullscreenElement && (document.fullscreenEnabled || document.webkitFullscreenEnabled)){
            openFullscreen(videoRef.current!)
        }else if(!fullscreen && document.fullscreenElement !== null){
            closeFullscreen(videoRef.current!)
        }
    }, [fullscreen])
    useEffect(() => {
        if(!videoRef.current) return;
        videoRef.current.volume = volume
        localStorage.setItem("volume", volume.toString())
    }, [volume])
    useEffect(() => {
        if(!videoRef.current) return;
        videoRef.current.playbackRate = playbackSpeed
        localStorage.setItem("playbackSpeed", playbackSpeed.toString())
    }, [playbackSpeed])

    const computeTimelinePreviewFrameLocation = useCallback(() => {
        if((timelineFramePreviewLocation - 100) < 0){
            return 0
        }else if((timelineFramePreviewLocation + 115) > window.innerWidth){
            return window.innerWidth - 215
        }else{
            return timelineFramePreviewLocation - 100
        }
    }, [timelineFramePreviewLocation])

    return (
        <PageBase className="d-flex flex-md-row flex-column" style={{backgroundColor: "black"}}>
            <div className="overflow-hidden position-relative" style={{height: "100vh", width: "100vw"}}>
                <video ref={videoRef} style={{width: "100%", height: "100%", objectFit: "contain", zIndex: 0}} />
                <Fade in={showPlayNextEpisode}>
                    <div
                        className="position-absolute"
                        style={{right: "40px", bottom: "160px", zIndex: 2000}}
                    >
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={handlePlayNextEpisode}
                        >
                            Play next episode
                        </Button>
                    </div>
                </Fade>
                <div
                    className="position-absolute start-0 top-0 w-100 h-100"
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleMouseMove}
                    onClick={handleMouseMove}
                    style={{zIndex: 1000}}
                >
                    <Fade in={showControls || !playing || loading}>
                        <div
                            className="w-100 h-100 position-relative"
                            style={{cursor: (showControls|| !playing) ? "default" : "none"}}
                        >
                            <div className="position-relative d-flex justify-content-between" style={{left: "40px", top: "40px", width: "calc(100% - 80px)"}}>
                                <Button variant="text" size="large" onClick={() => {
                                    handleSyncUpload((state) => {
                                        !state && alert("Failed to sync playback progress")
                                        navigateTo("/")
                                    })
                                }}>
                                    <i className="material-icons" style={{fontSize: "2rem"}}>arrow_back</i>
                                </Button>
                            </div>
                            <div
                                className="h-100 d-flex flex-column justify-content-center align-items-center"
                            >
                                {!loading ? (
                                    <div style={{transform: "translateY(-50px)"}}>
                                        <div className="text-center">
                                            {displayError && <h6>Press the Play button to start the {mode === "movie" ? mode : "episode"}</h6>}
                                        </div>
                                        <div
                                            className="d-flex justify-content-center align-items-center p-5"
                                            style={{background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.25) 20%,rgba(0,0,0,0) 50%)"}}
                                        >
                                            <Button variant="text" size="large" onClick={handleBack}>
                                                <i className="material-icons" style={{fontSize: "2rem"}}>replay_10</i>
                                            </Button>
                                            <Button variant="text" size="large" onClick={() => setPlaying(p => !p)}>
                                                <i className="material-icons" style={{fontSize: "5rem"}}>{playing ? "pause" : "play_arrow"}</i>
                                            </Button>
                                            <Button variant="text" size="large" onClick={handleForward}>
                                                <i className="material-icons" style={{fontSize: "2rem"}}>forward_10</i>
                                            </Button>
                                        </div>
                                    </div>
                                ) : <SwcLoader style={{transform: "translateY(-50px)"}} />}
                            </div>
                            <div
                                className="position-absolute w-100 start-0 bottom-0"
                                style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}}
                            >
                                <div className="mx-2 position-relative">
                                    <Slider
                                        value={timePlayed}
                                        onChange={(_, v) => {
                                            setTimePlayed(v as number)
                                        }}
                                        onChangeCommitted={(_, v) => {
                                            videoRef.current!.currentTime = v as number
                                        }}
                                        onMouseEnter={() => setShowTimelineFramePreview(true)}
                                        onMouseLeave={() => setShowTimelineFramePreview(false)}
                                        onTouchStart={() => setShowTimelineFramePreview(true)}
                                        onTouchEnd={() => setShowTimelineFramePreview(false)}
                                        onMouseMove={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            const x = e.clientX - rect.left
                                            setTimelineFramePreviewLocation(x)
                                        }}
                                        sx={{width: "100%"}}
                                        max={videoRef.current?.duration || 0}
                                    />
                                    <Fade in={showTimelineFramePreview}>
                                        <div
                                            className="position-absolute d-flex justify-content-center align-items-center"
                                            style={{
                                                left: `${computeTimelinePreviewFrameLocation()}px`,
                                                bottom: "40px",
                                                width: "200px",
                                                height: "100px",
                                            }}
                                        >
                                            <CircularProgress />
                                            {(() => {
                                                if(!videoRef.current || !timelineFramePreviewLocation) return null;
                                                const frameNumber = Math.floor((timelineFramePreviewLocation / window.innerWidth) * videoRef.current!.duration)
                                                const nearestFrameInStorage = Math.floor(frameNumber / 25) * 25

                                                return (
                                                    <img
                                                        alt={`Frame ${nearestFrameInStorage}`}
                                                        className="position-absolute top-0 start-0"
                                                        src={videoLink + `/${nearestFrameInStorage}`}
                                                        style={{width: "100%", height: "100%", objectFit: "contain"}}
                                                    />
                                                )
                                            })()}
                                        </div>
                                    </Fade>
                                </div>
                                <div className="d-flex" style={{height: "100px"}}>
                                    <div className="d-flex m-2 justify-content-center align-items-center">
                                        <Button variant="text" size="large" onClick={() => setPlaying(p => !p)}>
                                            <i className="material-icons" style={{fontSize: "2rem"}}>{playing ? "pause" : "play_arrow"}</i>
                                        </Button>
                                        <Button variant="text" size="large" onClick={handlePlayFromBeginning}>
                                            <i className="material-icons" style={{fontSize: "2rem"}}>replay</i>
                                        </Button>
                                    </div>
                                    <div className="d-flex m-2 ms-4 justify-content-center align-items-start flex-column">
                                        <h4>{videoInfo?.title}</h4>
                                        {mode === "series" && (() => {
                                            const episode = (videoInfo as SeriesType)?.episodes.find(episode => episode.uuid === searchParams.get("episode"))
                                            return (
                                                <h6>Season {episode?.season} Episode {episode?.episode}</h6>
                                            )
                                        })()}
                                    </div>
                                    <div className="d-flex m-2 justify-content-center align-items-center flex-grow-1">
                                        {videoInfo && mode === "series" && (
                                            <h5>{(videoInfo as SeriesType)?.episodes.find(episode => episode.uuid === searchParams.get("episode"))?.title}</h5>
                                        )}
                                    </div>
                                    {!!videoInfo && (
                                        <div className="d-flex m-2 justify-content-center align-items-center">
                                            {getTimeString(timePlayed)} / {getTimeString(videoRef.current!.duration)}
                                        </div>
                                    )}
                                    <div className="d-flex m-2 justify-content-center align-items-center">
                                        <>
                                            <Button ref={showVolumeControlsButtonRef} variant="text" size="large" onMouseEnter={() => setShowVolumeControls(s => !s)}>
                                                <i className="material-icons" style={{fontSize: "2rem"}}>
                                                    {volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
                                                </i>
                                            </Button>
                                            <Menu
                                                open={showVolumeControls}
                                                onClose={() => setShowVolumeControls(false)}
                                                anchorEl={showVolumeControlsButtonRef.current}
                                                anchorOrigin={{vertical: "top", horizontal: "center"}}
                                                transformOrigin={{vertical: "bottom", horizontal: "center"}}
                                            >
                                                <div className="d-flex flex-column p-1 overflow-hidden" style={{height: "150px"}}>
                                                    <div
                                                        className="my-3 flex-grow-1"
                                                    >
                                                        <Slider
                                                            value={volume}
                                                            onChange={(_, v) => {
                                                                setVolume(v as number)
                                                            }}
                                                            orientation="vertical"
                                                            sx={{height: "100%"}}
                                                            min={0}
                                                            max={1}
                                                            step={0.01}
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        <span className="small">{Math.round(volume * 100)}%</span>
                                                    </div>
                                                </div>
                                            </Menu>
                                        </>
                                        <>
                                            <Button ref={showPlaybackSpeedControlsRef} variant="text" size="large" onMouseEnter={() => setShowPlaybackSpeedControls(s => !s)}>
                                                <i className="material-icons" style={{fontSize: "2rem"}}>speed</i>
                                            </Button>
                                            <Menu
                                                open={showPlaybackSpeedControls}
                                                onClose={() => setShowPlaybackSpeedControls(false)}
                                                anchorEl={showPlaybackSpeedControlsRef.current}
                                                anchorOrigin={{vertical: "top", horizontal: "center"}}
                                                transformOrigin={{vertical: "bottom", horizontal: "center"}}
                                            >
                                                <div className="d-flex flex-column p-1 overflow-hidden" style={{width: "250px"}}>
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        Playback speed {playbackSpeed}
                                                    </div>
                                                    <div
                                                        className="mx-3 flex-grow-1"
                                                    >
                                                        <Slider
                                                            value={playbackSpeed}
                                                            onChange={(_, v) => {
                                                                setPlaybackSpeed(v as number)
                                                            }}
                                                            orientation="horizontal"
                                                            sx={{width: "100%"}}
                                                            min={0.25}
                                                            max={2.5}
                                                            step={0.25}
                                                            marks={[
                                                                {value: 0.5, label: "0.5x"},
                                                                {value: 1, label: "1x"},
                                                                {value: 1.5, label: "1.5x"},
                                                                {value: 2, label: "2x"},
                                                                {value: 2.5, label: "2.5x"},
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            </Menu>
                                        </>
                                        {videoInfo && mode === "series" && (
                                            <>
                                                <Button ref={showEpisodeSelectorButtonRef} variant="text" size="large" onClick={() => setShowEpisodeSelector(s => !s)}>
                                                    <i className="material-icons" style={{fontSize: "2rem"}}>{showEpisodeSelector ? "menu_open" : "menu"}</i>
                                                </Button>
                                                <Menu
                                                    open={showEpisodeSelector}
                                                    onClose={() => setShowEpisodeSelector(false)}
                                                    anchorEl={showEpisodeSelectorButtonRef.current}
                                                    anchorOrigin={{vertical: "top", horizontal: "left"}}
                                                    transformOrigin={{vertical: "bottom", horizontal: "left"}}
                                                >
                                                    <div
                                                        style={{
                                                            height: "50vh",
                                                            width: "40vw",
                                                        }}
                                                    >
                                                        {[...Array((videoInfo as SeriesType).season_count)].map((_, season) => (
                                                            <EpisodeList
                                                                key={season}
                                                                series={videoInfo as SeriesType}
                                                                season={season}
                                                                handlePlayEpisode={(e) => {
                                                                    handleSyncUpload(state => {
                                                                        !state && alert("Failed to sync playback progress")
                                                                        navigateTo(`/watch?series=${videoInfo.uuid}&episode=${e.uuid}${e?.video_hls ? "&hls" : ""}`)
                                                                        setShowEpisodeSelector(false)
                                                                    })
                                                                }}
                                                                selectedEpisode={(videoInfo as SeriesType).episodes.find(e => e.uuid === searchParams.get("episode"))}
                                                            />
                                                        ))}
                                                    </div>
                                                </Menu>
                                            </>
                                        )}
                                        <Button variant="text" size="large" onClick={() => setFullscreen(f => !f)}>
                                            <i className="material-icons" style={{fontSize: "2rem"}}>{fullscreen ? "fullscreen_exit" : "fullscreen"}</i>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Fade>
                </div>
            </div>
        </PageBase>
    )
}

export default Home;