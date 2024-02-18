import {Button, Fade} from "@mui/material";
import React from "react";

interface VolatileEventControlsProps {
    showSkipIntro: boolean;
    showPlayNextEpisode: boolean;
    handleSkipIntro: () => void;
    handlePlayNextEpisode: () => void;
}
function VolatileEventControls(props: VolatileEventControlsProps) {
    return (
        <>
            <Fade in={props.showSkipIntro}>
                <div
                    className="position-absolute"
                    style={{left: "40px", bottom: "160px", zIndex: 2000}}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={props.handleSkipIntro}
                    >
                        Skip intro
                    </Button>
                </div>
            </Fade>
            <Fade in={props.showPlayNextEpisode}>
                <div
                    className="position-absolute"
                    style={{right: "40px", bottom: "160px", zIndex: 2000}}
                >
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={props.handlePlayNextEpisode}
                    >
                        Play next episode
                    </Button>
                </div>
            </Fade>
        </>
    )
}

export default VolatileEventControls;