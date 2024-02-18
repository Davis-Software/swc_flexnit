import {Button} from "@mui/material";
import {checkSyncEnabled, handleSyncUpload} from "../../utils/syncControls";
import {navigateTo} from "../../utils/navigation";
import React from "react";

function VideoControlGoBack(){
    return (
        <div className="position-relative d-flex justify-content-between"
             style={{left: "40px", top: "40px", width: "calc(100% - 80px)"}}>
            <Button variant="text" size="large" onClick={() => {
                if (!checkSyncEnabled()) {
                    navigateTo(history.state || "/")
                }
                handleSyncUpload((state) => {
                    !state && alert("Failed to sync playback progress")
                    navigateTo(history.state || "/")
                })
            }}>
                <i className="material-icons" style={{fontSize: "2rem"}}>arrow_back</i>
            </Button>
        </div>
    )
}

export default VideoControlGoBack;