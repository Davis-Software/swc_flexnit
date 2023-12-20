import React, {useEffect} from "react";
import {Button} from "@mui/material";
import SwcModal from "./SwcModal";
import {checkSyncEnabled, handleSyncDownload, handleSyncUpload} from "../utils/syncControls";


interface SyncPlaybackProgressProps{
    text?: string
    callback?: () => void
    component?: (props: any) => React.Component
    setSyncing?: (syncing: boolean) => void
}
function SyncPlaybackProgress(props: SyncPlaybackProgressProps){
    const [syncing, setSyncing] = React.useState(false)
    const [showModal, setShowModal] = React.useState(false)
    const [error, setError] = React.useState("")

    useEffect(() => {
        props.setSyncing && props.setSyncing(syncing)
    }, [syncing]);

    const componentProps = {
        onClick: () => setShowModal(true)
    }

    function handleDownload(){
        setError("")
        setSyncing(true)
        handleSyncDownload(() => {
            setSyncing(false)
            props.callback && props.callback()
            setShowModal(false)
        }, true, false)
    }
    function handleUpload(){
        setError("")
        setSyncing(true)
        handleSyncUpload((state) => {
            setSyncing(false)
            if(state){
                props.callback && props.callback()
                setShowModal(false)
            }else{
                setError("Failed to sync")
            }
        }, true)
    }

    return (
        <>
            <SwcModal show={showModal} onHide={() => setShowModal(false)}>
                <>
                    <h4>Sync playback progress</h4>
                    <p>Sync playback progress with the server</p>
                    {error && <p className="text-danger">{error}</p>}
                    <div className="d-flex flex-row">
                        <Button variant="text" size="large" onClick={handleDownload} className="flex-grow-1" disabled={syncing}>
                            <i className="material-icons" style={{fontSize: "2rem"}}>download</i>
                            <span>Download from server</span>
                        </Button>
                        <Button variant="text" size="large" onClick={handleUpload} className="flex-grow-1" disabled={syncing}>
                            <i className="material-icons" style={{fontSize: "2rem"}}>upload</i>
                            <span>Upload to server</span>
                        </Button>
                    </div>
                </>
            </SwcModal>
            {props.component ? props.component(componentProps) : (
                <Button variant="text" size="large" {...componentProps}>
                    <i className="material-icons" style={{fontSize: "2rem"}}>sync</i>
                    <span>{props.text || "Sync playback progress"}</span>
                </Button>
            )}
        </>
    )
}
function ResetPlaybackProgress(){
    const [askAgain, setAskAgain] = React.useState(false)

    function handleReset(){
        if(!askAgain){
            setAskAgain(true)
        }else{
            localStorage.removeItem("playbackProgress")
            if(!checkSyncEnabled()){
                setAskAgain(false)
                alert("Playback reset locally only! Please enable progress sync and clear again to delete your progress entirely.")
            }
            handleSyncUpload(state => {
                if(state){
                    setAskAgain(false)
                    alert("Playback progress reset successfully")
                }else{
                    alert("Failed to reset playback progress")
                }
            })
        }
    }

    return (
        <Button variant="contained" color="error" onClick={handleReset}>
            {!askAgain && <i className="material-icons">delete_forever</i>}
            {askAgain ? "Are you sure?" : "Reset playback progress"}
        </Button>
    )
}

export default SyncPlaybackProgress
export {ResetPlaybackProgress}