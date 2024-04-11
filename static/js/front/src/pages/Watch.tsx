import React, {useCallback, useEffect, useRef, useState} from "react";
import PageBase from "./PageBase";
import {Button} from "@mui/material";
import MovieType from "../types/movieType";
import SeriesType from "../types/seriesType";
import {navigateTo} from "../utils/navigation";
import {closeFullscreen, openFullscreen} from "../utils/documentFunctions";
import {hasNSFWPermission} from "../utils/permissionChecks";
import SwcModal from "../components/SwcModal";
import {user} from "../utils/constants";
import {handleSyncUpload} from "../utils/syncControls";
import {selectStreamingMode, streamingModeParameterName} from "../utils/streaming";
import {MediaInfo} from "dashjs";
import VolatileEventControls from "../components/watchPage/VolatileEventControls";
import VideoMount from "../components/watchPage/VideoMount";
import VideoControls from "../components/watchPage/VideoControls";
import {setMediaInfo} from "../utils/mediaControls";


let extVideoInfo: MovieType | SeriesType | null = null
let hls: any
let dash: any

function Watch(){
    const mode: "movie" | "series" = window.location.href.includes("?movie=") ? "movie" : "series"
    const videoRef = useRef<HTMLVideoElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);
    const showEpisodeSelectorButtonRef = useRef<HTMLButtonElement>(null);

    const [videoFramePreviewLink, setVideoFramePreviewLink] = useState<string>("")
    const [videoInfo, setVideoInfo] = useState<MovieType | SeriesType | null>(null)
    const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search))

    const [showControls, setShowControls] = useState(false)
    const [showTimelineFramePreview, setShowTimelineFramePreview] = useState(false)
    const [timelineFramePreviewLocation, setTimelineFramePreviewLocation] = useState<number>(0)
    const [showEpisodeSelector, setShowEpisodeSelector] = useState(false)
    const [_, setShowControlsTimeout] = useState<NodeJS.Timeout | null>(null)
    const [fullscreen, setFullscreen] = useState(false)
    const [loading, setLoading] = useState(true)

    const [playing, setPlaying] = useState(false)
    const [timePlayed, setTimePlayed] = useState(0)

    const [audioTracks, setAudioTracks] = useState<MediaInfo[]>([])
    const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(0)
    const [subtitleTracks, setSubtitleTracks] = useState<MediaInfo[]>([])
    const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<number>(0)
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem("volume") || "1"))
    const [playbackSpeed, setPlaybackSpeed] = useState(parseFloat(localStorage.getItem("playbackSpeed") || "1"))
    const [showSkipIntro, setShowSkipIntro] = useState(false)
    const [showPlayNextEpisode, setShowPlayNextEpisode] = useState(false)
    const [episodeEnded, setEpisodeEnded] = useState(false)
    const [displayPlaybackError, setDisplayPlaybackError] = useState(false)

    const [showNSFWModal, setShowNSFWModal] = useState(false)
    const [showNoFileErrorModal, setShowNoFileErrorModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorModalMessage, setErrorModalMessage] = useState("")

    useEffect(() => {
        if(!videoRef.current) return;
        videoRef.current.pause()

        const searchParams = new URLSearchParams(window.location.search)
        setSearchParams(searchParams)
        const uuid = (searchParams.get("movie") || searchParams.get("series")) as string
        if(!uuid || !searchParams.has(streamingModeParameterName)){
            setErrorModalMessage("An error occurred while trying to load the video")
            setShowErrorModal(true)
            return
        }

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

        function getStartTime(){
            if(playbackProgress[uuid]){
                if(mode === "series"){
                    const episode = searchParams.get("episode")
                    if((playbackProgress[uuid] as {[key: string]: number})[episode!]){
                        const targetTime = (playbackProgress[uuid] as {[key: string]: number})[episode!]
                        return targetTime < 10 || (targetTime >= (videoRef.current!.duration - 60)) ? 0 : targetTime
                    }
                }else{
                    let targetTime = playbackProgress[uuid] as number
                    return targetTime < 10 || (targetTime >= (videoRef.current!.duration - 180)) ? 0 : targetTime
                }
            }
            return 0
        }
        function startPlayback(){
            setEpisodeEnded(false)
            videoRef.current!.currentTime = getStartTime()

            videoRef.current?.play()
                .then(() => setDisplayPlaybackError(false))
                .catch(() => setDisplayPlaybackError(true))
        }

        let path: string
        let streamingMode = searchParams.has(streamingModeParameterName) ? searchParams.get(streamingModeParameterName) : "file"
        if(mode == "movie"){
            path = `/movies/${uuid}/deliver/${streamingMode}/index`
            setVideoFramePreviewLink(`/movies/${uuid}/deliver/frame`)
        }else{
            const episode = searchParams.get("episode")
            path = `/series/${uuid}/episode/${episode}/deliver/${streamingMode}/index`
            setVideoFramePreviewLink(`/series/${uuid}/episode/${episode}/deliver/frame`)
        }

        function waitForVideo(){
            if(videoRef.current?.readyState !== undefined && videoRef.current?.readyState >= 3){
                startPlayback()
            }else{
                setTimeout(waitForVideo, 100)
            }
        }

        function loadVideo(){
            if(!videoRef.current) return
            videoRef.current.src = path
            videoRef.current.addEventListener("loadeddata", waitForVideo)
        }
        function loadVideoWithHls(){
            import("hls.js").then(({default: Hls}) => {
                if(!videoRef.current || !Hls.isSupported()) return
                const new_hls = new Hls()
                new_hls.loadSource(path)
                new_hls.attachMedia(videoRef.current)
                new_hls.on(Hls.Events.MEDIA_ATTACHED, waitForVideo)
                new_hls.on(Hls.Events.ERROR, (_, data) => {
                    if(data.response?.code === 403){
                        setShowNSFWModal(true)
                    }else{
                        setDisplayPlaybackError(true)
                    }
                })
                hls = new_hls
            })
        }
        function loadVideoWithDash(){
            import("dashjs").then(({default: dashJs}) => {
                if(!videoRef.current || !subtitleRef.current) return
                const new_dash = dashJs.MediaPlayer().create()
                new_dash.initialize(videoRef.current, path, true, getStartTime())
                new_dash.enableText(true)
                new_dash.attachTTMLRenderingDiv(subtitleRef.current)
                new_dash.on("error", () => {
                    setDisplayPlaybackError(true)
                })
                new_dash.on("streamInitialized", () => {
                    setAudioTracks(new_dash.getTracksFor("audio").filter(track =>
                        track.audioChannelConfiguration!.length > 0 && track.audioChannelConfiguration![0] !== "0"
                    ))
                    setSelectedAudioTrack(new_dash.getCurrentTrackFor("audio")?.index || -1)
                    setSubtitleTracks(new_dash.getTracksFor("text"))
                    setSelectedSubtitleTrack(new_dash.getCurrentTrackFor("text")?.index || -1)
                })
                dash = new_dash
            })
        }

        if(streamingMode === "hls"){
            loadVideoWithHls()
        }else if(streamingMode === "dash"){
            loadVideoWithDash()
        }else if(streamingMode === "file"){
            loadVideo()
        }else{
            setErrorModalMessage("An error occurred while trying to load the video - invalid streaming mode")
            setShowErrorModal(true)
        }

        return () => {
            if(hls) {
                hls.destroy()
            }
            if(dash){
                dash.reset()
                dash.destroy()
            }
        }
    }, [window.location.search]);

    useEffect(() => {
        // @ts-ignore
        setMediaInfo(videoInfo)
        if(!videoInfo) return;
        if(videoInfo.is_nsfw && !hasNSFWPermission()){
            setShowNSFWModal(true)
        }
        if(mode === "series"){
            const episode = (videoInfo as SeriesType).episodes.find(e => e.uuid === searchParams.get("episode"))
            if(!episode?.video_file){
                setShowNoFileErrorModal(true)
            }
        }
        extVideoInfo = videoInfo
    }, [videoInfo])

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

    function selectDashAudioTrack(index: number){
        if(!dash) return;
        dash.setCurrentTrack(audioTracks.find(track => track.index === index) || audioTracks[0])
        setSelectedAudioTrack(index)
    }
    function selectDashSubtitleTrack(index: number){
        if(!dash) return;
        dash.setCurrentTrack(subtitleTracks.find(track => track.index === index) || subtitleTracks[0])
        setSelectedSubtitleTrack(index)
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

        const searchParams = new URLSearchParams(window.location.search)

        if(mode === "series" && extVideoInfo){
            let info = extVideoInfo as SeriesType
            let episode = info.episodes.find(e => e.uuid === searchParams.get("episode"))
            setShowSkipIntro(
                info.intro_skip && info.intro_global ?
                (videoRef.current.currentTime >= info.intro_start &&
                videoRef.current.currentTime < info.intro_start + info.intro_length) : (
                    (episode?.has_intro || false) &&
                    videoRef.current.currentTime >= episode?.intro_start &&
                    videoRef.current.currentTime < episode?.intro_start + info.intro_length
                )
            )
            setShowPlayNextEpisode(videoRef.current.currentTime >= videoRef.current.duration - (
                info.endcard ? info.endcard_length : 60
            ))
        }

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
        localStorage.setItem("playbackProgressUser", user)
    }

    function handleSkipIntro(){
        if(!videoRef.current) return;
        const searchParams = new URLSearchParams(window.location.search)

        let info = extVideoInfo as SeriesType
        let episode = info.episodes.find(e => e.uuid === searchParams.get("episode"))

        videoRef.current.currentTime = info.intro_skip && info.intro_global ?
            info.intro_start + info.intro_length :
            (episode?.intro_start || 0) + info.intro_length
    }
    function handlePlayNextEpisode(force?: boolean){
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
            let nextEpisode
            if(episodesInCurrentSeason.length === currentEpisode?.episode){
                const nextSeason = episodesInCurrentSeason[0].season + 1
                nextEpisode = episodes.find(e => e.season === nextSeason && e.episode === 1)
            }else{
                nextEpisode = episodes.find(e => e.season === currentEpisode?.season && e.episode === currentEpisode?.episode + 1)
            }
            navigateTo(`/watch?series=${uuid}&episode=${nextEpisode?.uuid}&${selectStreamingMode(nextEpisode!)}`, true)
        })

        if(force){
            setTimeout(() => {
                window.location.reload()
            }, 150)
        }
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
                .then(() => setDisplayPlaybackError(false))
                .catch(() => setDisplayPlaybackError(true))
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
        function handleCheckFullscreen(){
            setFullscreen(document.fullscreenElement !== null)
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

        window.addEventListener("fullscreenchange", handleCheckFullscreen)
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

            window.removeEventListener("fullscreenchange", handleCheckFullscreen)
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
            <VideoMount
                mountVideo={!showNSFWModal && !showErrorModal}
                videoRef={videoRef}
                subtitleRef={subtitleRef}
                handleInteract={handleMouseMove}
            >
                <VolatileEventControls
                    showSkipIntro={!loading && showSkipIntro}
                    showPlayNextEpisode={showPlayNextEpisode}
                    handleSkipIntro={handleSkipIntro}
                    handlePlayNextEpisode={() => handlePlayNextEpisode()}
                />
                <VideoControls
                    videoInfo={videoInfo}
                    mode={mode}
                    showControls={showControls}
                    showTimelineFramePreview={showTimelineFramePreview}
                    timelineFramePreviewLocation={computeTimelinePreviewFrameLocation()}
                    showEpisodeSelector={showEpisodeSelector}
                    showEpisodeSelectorButtonRef={showEpisodeSelectorButtonRef}
                    setShowEpisodeSelector={setShowEpisodeSelector}
                    setPlaying={setPlaying}
                    playing={playing}
                    displayPlaybackError={displayPlaybackError}
                    loading={loading}
                    handleBack={handleBack}
                    handleForward={handleForward}
                    setVolume={setVolume}
                    setPlaybackSpeed={setPlaybackSpeed}
                    audioTracks={audioTracks}
                    selectedAudioTrack={selectedAudioTrack}
                    selectDashAudioTrack={selectDashAudioTrack}
                    subtitleTracks={subtitleTracks}
                    selectedSubtitleTrack={selectedSubtitleTrack}
                    selectDashSubtitleTrack={selectDashSubtitleTrack}
                    volume={volume}
                    playbackSpeed={playbackSpeed}
                    setSelectedSubtitleTrack={setSelectedSubtitleTrack}
                    setShowControls={setShowControls}
                    setShowTimelineFramePreview={setShowTimelineFramePreview}
                    setTimelineFramePreviewLocation={setTimelineFramePreviewLocation}
                    computeTimelinePreviewFrameLocation={computeTimelinePreviewFrameLocation}
                    videoFramePreviewLink={videoFramePreviewLink}
                    timePlayed={timePlayed}
                    fullscreen={fullscreen}
                    handlePlayFromBeginning={handlePlayFromBeginning}
                    setFullscreen={setFullscreen}
                    setTimePlayed={setTimePlayed}
                    showErrorModal={showErrorModal}
                    showNSFWModal={showNSFWModal}
                />
            </VideoMount>

            <SwcModal show={showNSFWModal} onHide={() => {}}>
                <div className="d-flex justify-content-center flex-column">
                    <h3>Restricted Access</h3>
                    <hr />
                </div>
                <div className="container p-3 mb-3">
                    <p>The content you are trying to watch is age-restricted!</p>
                    <p>As you do not have the required permissions to view NSFW topics, you cannot watch this content.</p>
                </div>
                <div className="d-flex justify-content-between">
                    <Button variant="text" onClick={() => navigateTo(history.state || "/")} color="secondary">Go back</Button>
                    {mode === "series" && (
                        <Button variant="text" onClick={() => handlePlayNextEpisode(true)} color="primary">Next Episode</Button>
                    )}
                    <Button variant="contained" color="primary" onClick={() => window.location.href = "/logout"}>Switch account</Button>
                </div>
            </SwcModal>
            <SwcModal show={showNoFileErrorModal} onHide={() => {}}>
                <div className="d-flex justify-content-center flex-column">
                    <h3>Error - No video file found</h3>
                    <hr />
                </div>
                <div className="container p-3 mb-3">
                    <p>The video file for this episode could not be found.</p>
                </div>
                <div className="d-flex justify-content-between">
                    <Button variant="text" onClick={() => navigateTo(history.state || "/")} color="secondary">Go back</Button>
                    {mode === "series" && (
                        <Button variant="text" onClick={() => handlePlayNextEpisode(true)} color="primary">Next Episode</Button>
                    )}
                </div>
            </SwcModal>
            <SwcModal show={showErrorModal} onHide={() => {}}>
                <div className="d-flex justify-content-center flex-column">
                    <h3>An error occurred</h3>
                    <hr />
                </div>
                <div className="container p-3 mb-3">
                    <p>{errorModalMessage}</p>
                </div>
                <div className="d-flex justify-content-between">
                    <Button variant="text" onClick={() => navigateTo(history.state || "/")} color="secondary">Go back</Button>
                </div>
            </SwcModal>
        </PageBase>
    )
}

export default Watch;