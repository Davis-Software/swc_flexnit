import React from "react";
import {Button, TextField} from "@mui/material";
import SongType from "../../types/songType";

interface EditSongProps{
    song: SongType;
    setSong: (song: SongType) => void;
    setShowEdit: (show: boolean) => void;
}
function EditSong(props: EditSongProps){
    const [title, setTitle] = React.useState<string>(props.song.title)
    const [artists, setArtists] = React.useState<string>(props.song.artists || "")
    const [album, setAlbum] = React.useState<string>(props.song.album || "")
    const [description, setDescription] = React.useState<string>(props.song.description || "")
    const [newThumbnail, setNewThumbnail] = React.useState<File | null | undefined>(null)

    function handleSave(){
        const formData = new FormData()
        formData.append("title", title)
        formData.append("artists", artists)
        formData.append("album", album)
        formData.append("description", description)
        if(newThumbnail) formData.append("thumbnail", newThumbnail)

        fetch(`/music/${props.song.uuid}/edit`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then((data: SongType) => {
                props.setSong(data)
                props.setShowEdit(false)
            })
    }

    return (
        <>
            <TextField
                variant="standard"
                label="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                error={title.length === 0}
                fullWidth
            />
            <TextField
                variant="standard"
                label="Artists"
                value={artists}
                onChange={e => setArtists(e.target.value)}
                fullWidth
            />
            <TextField
                variant="standard"
                label="Album"
                value={album}
                onChange={e => setAlbum(e.target.value)}
                fullWidth
            />
            <TextField
                variant="standard"
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                multiline
                fullWidth
            />
            <div className="d-flex">
                <img style={{width: "40px", height: "40px"}} src={`/music/${props.song.uuid}?thumbnail&q=s`} alt="thumbnail" />
                <Button className="flex-grow-1" variant="contained" component="label" fullWidth>
                    {newThumbnail ? "Change Selected Thumbnail" : "Upload Thumbnail"}
                    <input hidden accept="image/png" type="file" onChange={e => setNewThumbnail(e.target.files?.item(0))} />
                </Button>
            </div>

            <div className="d-flex flex-row float-end mt-5">
                <Button variant="contained" onClick={() => props.setShowEdit(false)}>Close</Button>
                <Button variant="contained" color="warning" onClick={handleSave}>Save</Button>
            </div>
        </>
    )
}

export default EditSong;
