import {Button, Checkbox, Popover, Typography} from "@mui/material";
import {checkSyncEnabled, handleSyncUpload} from "../../utils/syncControls";
import {navigateTo} from "../../utils/navigation";
import React from "react";

interface VideoControlActionsProps {
    watchAlong: boolean
    setWatchAlong: React.Dispatch<React.SetStateAction<boolean>>
    hostingRoom: boolean
}
function VideoControlActions(props: VideoControlActionsProps){
    const [optionsOpen, setOptionsOpen] = React.useState(false)
    const [optionsAnchor, setOptionsAnchor] = React.useState<HTMLElement | null>(null)

    function handleOptionsClick(event: React.MouseEvent<HTMLElement>){
        setOptionsAnchor(event.currentTarget)
        setOptionsOpen(true)
    }

    return (
        <div
            className="position-relative d-flex justify-content-between"
            style={{left: "40px", top: "40px", width: "calc(100% - 80px)"}}
        >
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

            <Button variant="text" size="large" onClick={handleOptionsClick} hidden={!props.hostingRoom}>
                Options
            </Button>
            <Popover
                open={optionsOpen}
                anchorEl={optionsAnchor}
                onClose={() => setOptionsOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Typography sx={{p: 2}}>
                    <Checkbox
                        checked={props.watchAlong}
                        onChange={(event) => props.setWatchAlong(s => !s)}
                    />
                    Allow others to watch along
                </Typography>
            </Popover>
        </div>
    )
}

export default VideoControlActions;