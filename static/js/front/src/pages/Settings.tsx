import React, {useEffect, useState} from "react";
import PageBase from "./PageBase";
import {Checkbox, Container, FormControlLabel, Tooltip} from "@mui/material";
import SyncPlaybackProgress, {ResetPlaybackProgress} from "../components/SyncPlaybackProgress";

function Settings(){
    const [syncPlayback, setSyncPlayback] = useState(localStorage.getItem("syncPlayback") !== null ? localStorage.getItem("syncPlayback") === "true" : true)

    useEffect(() => {
        localStorage.setItem("syncPlayback", syncPlayback.toString());
    }, [syncPlayback]);

    return (
        <PageBase>
            <Container className="pt-5">
                <h3>Settings</h3>
                <hr/>

                <div className="ps-5 p-3 bg-dark">
                    <h5>Playback progress synchronization</h5>
                    <p>When enabled, playback progress will be synchronized across all devices.</p>
                    <Tooltip title="This setting is saved on a per-device basis">
                        <FormControlLabel
                            control={<Checkbox
                                    checked={syncPlayback}
                                    onChange={(e) => setSyncPlayback(e.target.checked)}
                                />}
                            label="Enable"
                        />
                    </Tooltip>
                    <SyncPlaybackProgress text="Sync progress now"/>
                    <ResetPlaybackProgress/>
                </div>
            </Container>
        </PageBase>
    )
}

export default Settings;