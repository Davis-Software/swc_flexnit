import React, {useCallback, useEffect, useRef, useState} from "react"
import {
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Slider,
    useTheme
} from "@mui/material";
import SongType from "../../types/songType";
import {setMediaInfo} from "../../utils/mediaControls";

interface SongPlayerProps {
    playingSong: SongType | null
    setPlayingSong: React.Dispatch<React.SetStateAction<SongType | null>>
    songEnded?: () => void
    mounted?: boolean
}
function SongPlayer(props: SongPlayerProps){
    const audioRef = useRef<HTMLAudioElement>(null)

    const [playing, setPlaying] = React.useState<boolean>(!audioRef?.current?.paused || false)
    const [lockSpeedSelect, setLockSpeedSelect] = React.useState<boolean>(false)
    const [audioSpeed, setAudioSpeed] = React.useState<string>("1")
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem("music-volume") || "1"))
    const [duration, setDuration] = React.useState<number>(0)
    const [position, setPosition] = React.useState<number>(0)

    const [loopState, setLoopState] = React.useState<boolean>(false)
    const loop = useRef<boolean>(false)
    useEffect(() => {
        setLoopState(loop.current)
    }, [loop.current]);

    const theme = useTheme()

    function handleSetDuration(){
        setDuration(audioRef?.current?.duration!)
    }
    function handleSetPosition(){
        setPosition(audioRef?.current?.currentTime!)
    }

    function setNightcoreMode(speed: number, skip_ramp=false){
        if(!audioRef?.current) return
        if(!skip_ramp){
            setLockSpeedSelect(true)
            function advanceValue(){
                if(!audioRef?.current) return;
                let advance = 0.01
                if(audioRef?.current.playbackRate + advance >= speed){
                    setLockSpeedSelect(false)
                    audioRef.current.playbackRate = speed
                    return
                }
                if(audioRef?.current?.playbackRate < speed){
                    audioRef.current.playbackRate += advance
                }
                setTimeout(advanceValue, 10)
            }
            function reduceValue(){
                if(!audioRef?.current) return;
                let reduce = 0.01
                if(audioRef?.current.playbackRate - reduce <= speed){
                    setLockSpeedSelect(false)
                    audioRef.current.playbackRate = speed
                    return
                }
                if(audioRef?.current?.playbackRate > speed){
                    audioRef.current.playbackRate -= reduce
                }
                setTimeout(reduceValue, 10)
            }
            if(audioRef.current.playbackRate < speed){
                advanceValue()
            }else{
                reduceValue()
            }
        } else {
            audioRef.current.preservesPitch = false
            audioRef.current.playbackRate = speed
        }
    }
    function handleSpeedChange(e: SelectChangeEvent){
        setAudioSpeed(e.target.value)
        setNightcoreMode(parseFloat(e.target.value))
    }

    function handlePlay(){
        setPlaying(true)
    }
    function handlePause() {
        setPlaying(false)
    }
    function handleEnded() {
        if (loop.current) {
            if (!audioRef?.current) return
            audioRef.current.currentTime = 0
            audioRef.current.play().then()
            return
        }
        setPlaying(false)
        if (props.songEnded) props.songEnded()
    }
    useEffect(() => {
        if(!audioRef?.current) return
        audioRef.current.addEventListener("loadedmetadata", handleSetDuration)
        audioRef.current.addEventListener("timeupdate", handleSetPosition)

        audioRef.current.addEventListener("play", handlePlay)
        audioRef.current.addEventListener("pause", handlePause)
        audioRef.current.addEventListener("ended", handleEnded)

        return () => {
            if(!audioRef.current) return
            audioRef.current.removeEventListener("loadedmetadata", handleSetDuration)
            audioRef.current.removeEventListener("timeupdate", handleSetPosition)

            audioRef.current.removeEventListener("play", handlePlay)
            audioRef.current.removeEventListener("pause", handlePause)
            audioRef.current.removeEventListener("ended", handleEnded)
        }
    }, [audioRef, audioRef?.current]);
    useEffect(() => {
        if(!audioRef?.current) return;
        audioRef.current.volume = volume
        localStorage.setItem("music-volume", volume.toString())
    }, [volume])
    useEffect(() => {
        if(!audioRef?.current) return
        if(props.playingSong){
            audioRef.current.src = `/music/${props.playingSong.uuid}`
            setMediaInfo(props.playingSong)
        }else{
            audioRef.current.removeAttribute("src")
            setMediaInfo(null)
        }
        setNightcoreMode(parseFloat(audioSpeed), true)
    }, [props.playingSong]);

    return (
        <div
            style={{height: "64px", width: "100%", position: "fixed", bottom: 0}}
            hidden={props.mounted === false && (!playing || !props.playingSong)}
        >
            <Paper sx={{height: "100%", width: "100%"}}
                   className="d-flex align-items-center justify-content-between px-3" elevation={5}>
                <IconButton
                    onClick={() => {
                        if (!audioRef?.current) return
                        !audioRef.current.paused ? audioRef.current.pause() : audioRef.current.play().then()
                    }}
                >
                    <i className="material-icons">{!playing ? "play_arrow" : "pause"}</i>
                </IconButton>
                <IconButton onClick={props.songEnded}>
                    <i className="material-icons">skip_next</i>
                </IconButton>
                <div className="me-3 flex-grow-1 d-flex flex-column ps-3">
                    {!!props.playingSong && (
                        <span>{props.playingSong?.artists} - {props.playingSong?.title}</span>
                    )}
                    <Slider
                        size="small"
                        sx={{
                            color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
                            height: 4,
                            '& .MuiSlider-thumb': {
                                width: 8,
                                height: 8,
                                transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                '&:before': {
                                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                                },
                                '&:hover, &.Mui-focusVisible': {
                                    boxShadow: `0px 0px 0px 8px ${
                                        theme.palette.mode === 'dark'
                                            ? 'rgb(255 255 255 / 16%)'
                                            : 'rgb(0 0 0 / 16%)'
                                    }`,
                                },
                                '&.Mui-active': {
                                    width: 20,
                                    height: 20,
                                },
                            },
                            '& .MuiSlider-rail': {
                                opacity: 0.28,
                            },
                        }}
                        onChange={(_, value) => audioRef?.current && (audioRef.current.currentTime = value as number)}
                        step={1}
                        min={0}
                        max={duration}
                        value={position}
                    />
                </div>
                <IconButton
                    onClick={() => {
                        loop.current = !loop.current
                        setLoopState(loop.current)
                    }}
                    color={loopState ? "primary" : "default"}
                >
                    <i className="material-icons">repeat</i>
                </IconButton>
                <div className="mx-3" style={{width: "8%"}}>
                    <Slider
                        value={volume}
                        onChange={(_, v) => {
                            setVolume(v as number)
                        }}
                        orientation="horizontal"
                        min={0}
                        max={1}
                        step={0.01}
                    />
                </div>
                <FormControl
                    sx={{
                        width: "200px",
                    }}
                    size="small"
                >
                    <InputLabel id="nightcore-mode-select-label">Music Mod</InputLabel>
                    <Select
                        labelId="nightcore-mode-select-label"
                        id="nightcore-mode-select"
                        value={audioSpeed}
                        label="Nightcore Mode"
                        onChange={handleSpeedChange}
                        disabled={lockSpeedSelect}
                    >
                        <MenuItem value=".5">Slowdrive</MenuItem>
                        <MenuItem value=".8">Daycore</MenuItem>
                        <MenuItem value=".85">Daycore N#</MenuItem>
                        <MenuItem value="1">Off</MenuItem>
                        <MenuItem value="1.2">Nightcore</MenuItem>
                        <MenuItem value="1.25">Nightcore N#</MenuItem>
                        <MenuItem value="1.3">Hypercore</MenuItem>
                        <MenuItem value="1.5">Beatpump</MenuItem>
                    </Select>

                </FormControl>
            </Paper>

            <audio
                ref={audioRef}
                autoPlay
            />
        </div>
    )
}

export default SongPlayer