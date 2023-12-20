import React, {useContext, useEffect, useState} from "react";
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
import {ThemeContext} from "../contexts/themeContext";
import {ShowAdminContext} from "../contexts/showAdminContext";

function Settings(){
    const [syncPlayback, setSyncPlayback] = useState(localStorage.getItem("syncPlayback") !== null ? localStorage.getItem("syncPlayback") === "true" : true)
    const {showAdmin, setShowAdmin} = useContext(ShowAdminContext)
    const {theme, setTheme} = useContext(ThemeContext)

    useEffect(() => {
        localStorage.setItem("syncPlayback", syncPlayback.toString());
    }, [syncPlayback]);
    useEffect(() => {
        localStorage.setItem("showAdminOptions", showAdmin.toString());
    }, [showAdmin]);
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
                                    onChange={e => setSyncPlayback(e.target.checked)}
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
                                checked={showAdmin}
                                onChange={e => setShowAdmin(e.target.checked)}
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
                            }}
                            variant="standard"
                        >
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                            <MenuItem value="amoled">AMOLED</MenuItem>
                            <MenuItem value="system">System</MenuItem>
                        </Select>
                    </FormControl>
                </Paper>
            </Container>
        </PageBase>
    )
}

export default Settings;