import React, {useEffect, useMemo} from "react";
import PageBase from "./PageBase";
import SongType from "../types/songType";
import SongList from "../components/music/SongList";
import {SwcFab, SwcFabContainer} from "../components/SwcFab";
import PageLoader from "../components/PageLoader";
import SwcModal from "../components/SwcModal";
import EditSong from "../components/music/EditSong";
import {Button, ButtonGroup, List, ListItem, Tab, Tabs, TextField} from "@mui/material";
import SongPlayer from "../components/music/SongPlayer";
import {useIsAdmin} from "../contexts/showAdminContext";

function Music(){
    const isAdmin = useIsAdmin()
    const [tab, setTab] = React.useState(0)
    const [requestUpdate, setRequestUpdate] = React.useState<boolean>(false)
    const [songs, setSongs] = React.useState<SongType[]>([])
    const [queue, setQueue] = React.useState<SongType[]>([])
    const [liked, setLiked] = React.useState<number[]>([])
    const [playingSong, setPlayingSong] = React.useState<SongType | null>(null)

    const [showEdit, setShowEdit] = React.useState<boolean>(false)
    const [selectedSong, setSelectedSong] = React.useState<SongType | null>(null)

    const [showAdd, setShowAdd] = React.useState<boolean>(false)
    const [newSongs, setNewSongs] = React.useState<FileList | null>()
    const [newAlbum, setNewAlbum] = React.useState<string>("")
    const [uploading, setUploading] = React.useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = React.useState<number>(0)

    function handleUpload(){
        if(!newSongs || newSongs.length < 1) return
        const formData = new FormData()
        const xhr = new XMLHttpRequest()

        for(let i = 0; i < newSongs.length; i++){
            formData.append("files", newSongs[i])
        }
        if(newAlbum && newAlbum !== ""){
            formData.append("album", newAlbum)
        }

        setUploading(true)
        setUploadProgress(0)

        xhr.open("POST", "/music/new")
        xhr.upload.addEventListener("progress", e => {
            if(e.lengthComputable){
                setUploadProgress(Math.round((e.loaded / e.total) * 100))
            }
        })
        xhr.addEventListener("load", () => {
            setUploadProgress(100)
            setUploading(false)
            setNewSongs(null)
            setRequestUpdate(prev => !prev)
            setNewAlbum("")
        })
        xhr.send(formData)
    }
    function handleEdit(song: SongType){
        setSelectedSong(song)
        setShowEdit(true)
    }
    function handleDelete(song: SongType){
        if(!confirm(`Are you sure to delete "${song.title}"?`)) return
        fetch(`/music/${song.uuid}/delete`, {method: "POST"})
            .then(() => {
                setSongs(prev => prev.filter(s => s.uuid !== song.uuid))
            })
    }

    function handleLikeUnLike(song: SongType){
        let action = liked.includes(song.id) ? "unlike" : "like"
        fetch(`/music/${song.uuid}?${action}`, {method: "GET"})
            .then(() => {
                setLiked(prev => {
                    if(action === "like"){
                        return [...prev, song.id]
                    } else {
                        return prev.filter(uuid => uuid !== song.id)
                    }
                })
            })
    }

    useEffect(() => {
        fetch("/music/files")
            .then(res => res.json())
            .then(setSongs)
        fetch("/music/liked")
            .then(res => res.json())
            .then(setLiked)
    }, [requestUpdate]);

    const songList = useMemo(() => {
        if(tab === 0){
            return songs
        } else if(tab === 1){
            return queue
        } else {
            return songs.filter(song => liked.includes(song.id))
        }
    }, [tab, songs, queue])
    function songEnded(){
        if(queue.length > 0) {
            setQueue(prev => {
                setPlayingSong(prev[0])
                return prev.slice(1)
            })
        }else if(liked.length > 0 && liked.includes(playingSong!.id)){
            setPlayingSong(() => {
                let likedSongs = songs.filter(song => liked.includes(song.id))
                if(likedSongs.includes(playingSong!)){
                    return likedSongs[(likedSongs.indexOf(playingSong!) + 1) % likedSongs.length]
                }else{
                    return likedSongs[0]
                }
            })
        }else{
            setPlayingSong(songs[(songs.indexOf(playingSong!) + 1) % songs.length])
        }


    }

    return (
        <PageBase>
            <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
                <Tab label="Song Library" />
                <Tab label={queue.length > 0 ? `Queue (${queue.length})` : "Queue"} />
                <Tab label={liked.length > 0 ? `Liked (${liked.length})` : "Liked"} />
            </Tabs>
            <SongList
                songs={songList}
                playingSong={playingSong}
                setPlayingSong={setPlayingSong}
                setSelectedSong={handleEdit}
                deleteSong={handleDelete}
                queue={queue}
                setQueue={setQueue}
                queuePage={tab === 1}
                likeUnLikeSong={handleLikeUnLike}
                likedSongs={songs.filter(song => liked.includes(song.id))}
            />

            <SwcFabContainer bottom={6+64}>
                <SwcFab icon="add" onClick={() => setShowAdd(true)} color="primary" tooltip="Add song" hide={!isAdmin} />
            </SwcFabContainer>

            <SwcModal show={selectedSong !== null && showEdit} onHide={() => {}} width="95%">
                <React.Suspense fallback={<PageLoader />}>
                    <EditSong song={selectedSong!} setSong={newSong => {
                        setSongs(prev => prev.map(song => song.uuid === newSong.uuid ? newSong : song))
                    }} setShowEdit={setShowEdit} />
                </React.Suspense>
            </SwcModal>
            <SwcModal show={showAdd} onHide={() => setShowAdd(false)}>
                <List>
                    {!uploading && newSongs && Array.from(newSongs).map((file, i) => (
                        <ListItem className="d-flex" key={i}>
                            <span className="flex-grow-1">{file.name}</span>
                            <span>({file.size} bytes)</span>
                        </ListItem>
                    ))}
                    {uploading && (
                        <ListItem>
                            <progress value={uploadProgress} max={100} />
                        </ListItem>
                    )}
                </List>
                <TextField
                    value={newAlbum}
                    onChange={(e) => setNewAlbum(e.target.value)}
                    variant="standard"
                    label="Album Name"
                    disabled={uploading || !newSongs || newSongs.length < 1}
                    fullWidth
                />
                <ButtonGroup disabled={uploading} fullWidth>
                    <Button variant="contained" component="label">
                        {newSongs && newSongs.length > 0 ? `${newSongs.length} Song${newSongs.length > 1 ? 's' : ''} selected - Click to change` : "Select songs"}
                        <input hidden accept="audio/*" type="file" onChange={e => setNewSongs(e.target.files)} multiple />
                    </Button>
                    <Button variant="contained" color="error" onClick={() => setNewSongs(null)} disabled={!newSongs || newSongs.length < 1}>
                        Clear
                    </Button>
                </ButtonGroup>
                <Button variant="contained" color="primary" disabled={uploading || !newSongs || newSongs.length < 1} onClick={handleUpload} fullWidth>
                    Upload
                </Button>
            </SwcModal>

            <SongPlayer playingSong={playingSong} songEnded={songEnded} />
        </PageBase>
    )
}

export default Music