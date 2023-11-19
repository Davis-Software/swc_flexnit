import React, {useEffect, useState} from "react";
import PageBase from "./PageBase";
import {
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tooltip
} from "@mui/material";
import SyncPlaybackProgress, {ResetPlaybackProgress} from "../components/SyncPlaybackProgress";
import {isAdminSet} from "../utils/constants";

function Settings(){
    const [syncPlayback, setSyncPlayback] = useState(localStorage.getItem("syncPlayback") !== null ? localStorage.getItem("syncPlayback") === "true" : true)
    const [showAdminMode, setShowAdminMode] = useState(localStorage.getItem("showAdminOptions") !== null ? localStorage.getItem("showAdminOptions") === "true" : false)
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark")

    useEffect(() => {
        localStorage.setItem("syncPlayback", syncPlayback.toString());
    }, [syncPlayback]);
    useEffect(() => {
        localStorage.setItem("showAdminOptions", showAdminMode.toString());
    }, [showAdminMode]);
    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <PageBase>
            <Container className="pt-5">
                <h3>Settings</h3>
                <hr/>

                <Paper elevation={3} className="ps-5 p-3 mb-3">
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
                </Paper>

                <Paper elevation={3} className="ps-5 p-3 mb-3">
                    <h5>UI Config</h5>
                    <p>Some options to change how the UI looks. <br/> All settings are saved on a per-device basis.</p>
                    <div>
                        <FormControlLabel
                            control={<Checkbox
                                checked={showAdminMode}
                                onChange={(e) => {
                                    setShowAdminMode(e.target.checked)
                                    window.location.reload();
                                }}
                            />}
                            label="Activate Admin Mode"
                            disabled={!isAdminSet}
                        />
                    </div>
                    <FormControl className="mt-5" sx={{width: "50%"}}>
                        <InputLabel>Theme</InputLabel>
                        <Select
                            value={theme}
                            onChange={(e) => {
                                setTheme(e.target.value)
                                window.location.reload();
                            }}
                            variant="standard"
                        >
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                            <MenuItem disabled value="amoled">AMOLED</MenuItem>
                            <MenuItem disabled value="system">System</MenuItem>
                        </Select>
                    </FormControl>
                </Paper>
            </Container>
        </PageBase>
    )
}

export default Settings;