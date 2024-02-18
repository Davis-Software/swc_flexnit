import {Button} from "@mui/material";
import SwcLoader from "../SwcLoader";
import React from "react";

interface VideoControlHUDProps {
    handleBack: () => void;
    handleForward: () => void;
    setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    playing: boolean;
    displayPlaybackError: boolean;
    mode: "movie" | "series";
    loading: boolean;
}
function VideoControlHUD(props: VideoControlHUDProps) {
    return !props.loading ? (
        <div style={{transform: "translateY(-50px)"}}>
            <div className="text-center">
                {props.displayPlaybackError && <h6>Press the Play button to start
                    the {props.mode === "movie" ? props.mode : "episode"}</h6>}
            </div>
            <div
                className="d-flex justify-content-center align-items-center p-5"
                style={{background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.25) 20%,rgba(0,0,0,0) 50%)"}}
            >
                <Button variant="text" size="large" onClick={props.handleBack}>
                    <i className="material-icons" style={{fontSize: "2rem"}}>replay_10</i>
                </Button>
                <Button variant="text" size="large" onClick={() => props.setPlaying(p => !p)}>
                    <i className="material-icons"
                       style={{fontSize: "5rem"}}>{props.playing ? "pause" : "play_arrow"}</i>
                </Button>
                <Button variant="text" size="large" onClick={props.handleForward}>
                    <i className="material-icons" style={{fontSize: "2rem"}}>forward_10</i>
                </Button>
            </div>
        </div>
    ) : <SwcLoader style={{transform: "translateY(-50px)"}}/>
}

export default VideoControlHUD;