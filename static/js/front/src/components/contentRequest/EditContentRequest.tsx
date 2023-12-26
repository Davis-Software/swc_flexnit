import ContentRequestType from "../../types/contentRequestType";
import React, {useState} from "react";
import {Button, ButtonGroup, FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";

type ContentType = "movie" | "series" | "season" | "episode" | "song" | "album" | "other";

interface EditContentRequestProps {
    contentRequest: ContentRequestType | null;
    setContentRequest: (contentRequest: ContentRequestType, del?: boolean) => void;
    setShowEdit: (show: boolean) => void;
}
function EditContentRequest(props: EditContentRequestProps){
    const [type, setType] = useState<ContentType>((props.contentRequest?.content_type as ContentType) || "movie")
    const [title, setTitle] = useState(props.contentRequest?.content_title || "")
    const [description, setDescription] = useState(props.contentRequest?.content_description || "")
    const [url, setUrl] = useState(props.contentRequest?.content_url || "")

    const [confirmDelete, setConfirmDelete] = useState(false)

    function handleSave(){
        const formData = new FormData();
        if(props.contentRequest !== null){
            formData.append("id", props.contentRequest.id.toString());
        }
        formData.append("content_type", type);
        formData.append("content_title", title);
        formData.append("content_description", description);
        formData.append("content_url", url);

        fetch("/content_requests", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(props.setContentRequest)
    }
    function handleDelete(){
        if(confirmDelete){
            fetch(`/content_requests?id=${props.contentRequest?.id}`, {
                method: "DELETE"
            })
                .then(() => {
                    props.setContentRequest(props.contentRequest as ContentRequestType, true)
                })
        } else {
            setConfirmDelete(true)
        }
    }

    return (
        <>
            <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                    value={type}
                    onChange={e => setType(e.target.value as ContentType)}
                    variant="standard"
                >
                    <MenuItem value="movie">Movie</MenuItem>
                    <MenuItem value="series">Series</MenuItem>
                    <MenuItem value="season">Season</MenuItem>
                    <MenuItem value="episode">Episode</MenuItem>
                    <MenuItem value="song">Song</MenuItem>
                    <MenuItem value="album">Album</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                variant="standard"
                fullWidth
            />
            <TextField
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                variant="standard"
                multiline
                fullWidth
            />
            <TextField
                label="URL"
                value={url}
                onChange={e => setUrl(e.target.value)}
                variant="standard"
                fullWidth
            />

            <div className="d-flex flex-row mt-5 justify-content-between">
                <ButtonGroup>
                    <Button variant="contained" color="error" disabled={!props.contentRequest} onClick={handleDelete}>{confirmDelete ? "Confirm?" : "Delete"}</Button>
                </ButtonGroup>
                <ButtonGroup>
                    <Button variant="contained" onClick={() => props.setShowEdit(false)}>Close</Button>
                    <Button variant="contained" color="warning" onClick={handleSave}>Save</Button>
                </ButtonGroup>
            </div>
        </>
    )
}

export default EditContentRequest;