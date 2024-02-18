import HoverMenu from "./HoverMenu";
import {List, ListItemButton, Slider} from "@mui/material";
import React from "react";

const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
})

interface VideoControlElementsProps {
    audioTracks: any[];
    selectedAudioTrack: number;
    selectDashAudioTrack: (index: number) => void;
    subtitleTracks: any[];
    selectedSubtitleTrack: number;
    selectDashSubtitleTrack: (index: number) => void;
    volume: number;
    setVolume: (volume: number) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
}
function VideoControlElements(props: VideoControlElementsProps) {
    return (
        <>
            {props.audioTracks.length > 0 && (
                <HoverMenu placement="top" icon="language">
                    <List>
                        {props.audioTracks.map((track, index) => (
                            <ListItemButton
                                key={index}
                                selected={track.index === props.selectedAudioTrack}
                                onClick={() => props.selectDashAudioTrack(track.index || -1)}
                            >
                                {languageNames.of(track.lang || "unknown")} ({track.audioChannelConfiguration}.1)
                            </ListItemButton>
                        ))}
                    </List>
                </HoverMenu>
            )}
            {props.subtitleTracks.length > 0 && (
                <HoverMenu placement="top" icon="subtitles">
                    <List>
                        <ListItemButton
                            selected={props.selectedSubtitleTrack === -1}
                            onClick={() => props.selectDashSubtitleTrack(-1)}
                        >
                            Off
                        </ListItemButton>
                        {props.subtitleTracks.map((track, index) => (
                            <ListItemButton
                                key={index}
                                selected={track.index === props.selectedSubtitleTrack}
                                onClick={() => props.selectDashSubtitleTrack(track.index || -1)}
                            >
                                {languageNames.of(track.lang || "und")}
                            </ListItemButton>
                        ))}
                    </List>
                </HoverMenu>
            )}
            <HoverMenu placement="top"
                       icon={props.volume === 0 ? "volume_off" : props.volume < 0.5 ? "volume_down" : "volume_up"}>
                <div className="d-flex flex-column p-1 overflow-hidden"
                     style={{height: "150px"}}>
                    <div
                        className="my-3 flex-grow-1"
                    >
                        <Slider
                            value={props.volume}
                            onChange={(_, v) => {
                                props.setVolume(v as number)
                            }}
                            orientation="vertical"
                            sx={{height: "100%"}}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                    </div>
                    <div className="d-flex justify-content-center align-items-center">
                        <span className="small">{Math.round(props.volume * 100)}%</span>
                    </div>
                </div>
            </HoverMenu>
            <HoverMenu placement="top" icon="speed">
                <div className="d-flex flex-column p-1 overflow-hidden"
                     style={{width: "250px"}}>
                    <div className="d-flex justify-content-center align-items-center">
                        Playback speed {props.playbackSpeed}
                    </div>
                    <div
                        className="mx-3 flex-grow-1"
                    >
                        <Slider
                            value={props.playbackSpeed}
                            onChange={(_, v) => {
                                props.setPlaybackSpeed(v as number)
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
            </HoverMenu>
        </>
    )
}

export default VideoControlElements;
