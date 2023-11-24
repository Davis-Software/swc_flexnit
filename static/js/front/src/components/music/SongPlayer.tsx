import React, {useEffect, useState} from "react"
import {IconButton, Paper, Slider, useTheme} from "@mui/material";
import SongType from "../../types/songType";

interface SongPlayerProps {
    playingSong: SongType | null
}
function SongPlayer(props: SongPlayerProps){
    const [playing, setPlaying] = React.useState<boolean>(false)

    const audioRef = React.useRef<HTMLAudioElement>(null)
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem("music-volume") || "1"))
    const [duration, setDuration] = React.useState<number>(0)
    const [position, setPosition] = React.useState<number>(0)

    const theme = useTheme()

    function handleSetDuration(){
        setDuration(audioRef.current?.duration!)
    }
    function handleSetPosition(){
        setPosition(audioRef.current?.currentTime!)
    }

    useEffect(() => {
        if(!audioRef.current) return
        audioRef.current.addEventListener("loadedmetadata", handleSetDuration)
        audioRef.current.addEventListener("timeupdate", handleSetPosition)

        return () => {
            if(!audioRef.current) return
            audioRef.current.removeEventListener("loadedmetadata", handleSetDuration)
            audioRef.current.removeEventListener("timeupdate", handleSetPosition)
        }
    }, []);
    useEffect(() => {
        if(!audioRef.current) return;
        audioRef.current.volume = volume
        localStorage.setItem("music-volume", volume.toString())
    }, [volume])

    return (
        <div style={{height: "64px", width: "100%", position: "fixed", bottom: 0}}>
            <Paper sx={{height: "100%", width: "100%"}} className="d-flex align-items-center justify-content-between px-3" elevation={5}>
                <IconButton
                    onClick={() => {
                        if(!audioRef.current) return
                        !audioRef.current.paused ? audioRef.current.pause() : audioRef.current.play().then()
                    }}
                >
                    <i className="material-icons">{!playing ? "play_arrow" : "pause"}</i>
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
                        onChange={(_, value) => audioRef.current && (audioRef.current.currentTime = value as number)}
                        step={1}
                        min={0}
                        max={duration}
                        value={position}
                    />
                </div>
                <div className="mx-3" style={{width: "10%"}}>
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
            </Paper>
            <audio
                src={props.playingSong ? `/music/${props.playingSong.uuid}` : undefined}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                ref={audioRef}
                autoPlay
            />
        </div>
    )
}

export default SongPlayer