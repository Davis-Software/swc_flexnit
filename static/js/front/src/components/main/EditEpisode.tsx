import React, {useEffect, useState} from "react";
import SeriesType, {EpisodeType} from "../../types/seriesType";
import FileType from "../../types/fileType";
import {Button, TextField} from "@mui/material";
import FileTable from "../FileTable";

interface EditEpisodeProps{
    series: SeriesType;
    episode: EpisodeType;
    setEpisode: (episode: ((prevState: EpisodeType) => EpisodeType)) => void;
    setSeries: (series: (prevState: SeriesType) => SeriesType) => void;
    setClose: () => void;
}
function EditEpisode(props: EditEpisodeProps){
    const [title, setTitle] = useState<string>(props.episode.title)
    const [description, setDescription] = useState<string>(props.episode.description || "")
    const [season, setSeason] = useState<string>(props.episode.season.toString() || "1")
    const [episode, setEpisode] = useState<string>(props.episode.episode.toString() || "1")

    const [files, setFiles] = useState<FileType[]>([])
    const [mainFile, setMainFile] = useState<string | null>(null)
    const [updateFiles, setUpdateFiles] = useState<boolean>(false)
    const [uploading, setUploading] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)

    useEffect(() => {
        fetch(`/series/${props.series.uuid}/episode/${props.episode.uuid}/files`)
            .then(res => res.json())
            .then((data: {files: FileType[], main: string}) => {
                setMainFile(data.main)
                setFiles(data.files)
            })
    }, [updateFiles]);

    function handleFileAdd(file: File){
        setUploading(true)
        const req = new XMLHttpRequest()
        const formData = new FormData()

        formData.append("episode", file)
        req.upload.addEventListener("progress", e => {
            setUploadProgress(e.loaded / e.total * 100)
        })
        req.addEventListener("load", () => {
            setUploading(false)
            setUploadProgress(0)
            setUpdateFiles(!updateFiles)
        })
        req.open("POST", `/series/${props.series.uuid}/episode/${props.episode.uuid}/upload`)
        req.send(formData)
    }
    function handleFileConvert(reEncode: boolean = false){
        fetch(`/series/${props.series.uuid}/episode/${props.episode.uuid}/convert${reEncode ? "?encode" : ""}`, {
            method: "POST"
        })
            .then(res => {
                if(res.ok){
                    setUpdateFiles(!updateFiles)
                    props.setEpisode(pv => ({...pv, video_hls: true}))
                }
            })
    }
    function handleSetMainFile(file: FileType){
        const formData = new FormData()
        formData.append("file_name", file.name)
        fetch(`/series/${props.series.uuid}/episode/${props.episode.uuid}/set_main_file`, {
            method: "POST",
            body: formData
        })
            .then(res => {
                if(res.ok){
                    setMainFile(file.name)
                }
            })
    }
    function handleFileRevert(){
        if(confirm("Warning! This will not delete the HLS files. Are you sure you want to continue?")){
            fetch(`/series/${props.series.uuid}/episode/${props.episode.uuid}/revert`, {
                method: "POST"
            })
                .then(res => {
                    if(res.ok){
                        setUpdateFiles(!updateFiles)
                        props.setEpisode(pv => ({...pv, video_hls: false}))
                    }
                })
        }
    }
    function handleDeleteHLS(){
        if(confirm("Are you sure you want to delete the HLS files?")){
            fetch(`/series/${props.series.uuid}/episode/${props.episode.uuid}/delete_hls`, {
                method: "POST"
            })
                .then(res => {
                    if(res.ok){
                        setUpdateFiles(!updateFiles)
                        props.setEpisode(pv => ({...pv, video_hls: false}))
                    }
                })
        }
    }
    function handleFileDelete(file: FileType){
        if(confirm("Are you sure you want to delete this file?")){
            const formData = new FormData()
            formData.append("file_name", file.name)
            fetch(`/series/${props.series.uuid}/episode/${props.episode.uuid}/delete_file`, {
                method: "POST",
                body: formData
            })
                .then(res => {
                    if(res.ok){
                        setUpdateFiles(!updateFiles)
                    }
                })
        }
    }

    function handleSave(){
        const formData = new FormData()
        formData.append("title", title)
        formData.append("description", description)
        formData.append("season", season)
        formData.append("episode", episode)

        fetch(`/series/${props.series.uuid}/episode/${props.episode.uuid}/edit`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then((data) => {
                props.setEpisode(() => data)
                props.setClose()
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
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                multiline
                fullWidth
            />
            <TextField
                variant="standard"
                label="Season"
                value={season}
                onChange={e => setSeason(e.target.value)}
                error={Number.isNaN(season)}
                fullWidth
            />
            <TextField
                variant="standard"
                label="Episode"
                value={episode}
                onChange={e => setEpisode(e.target.value)}
                error={Number.isNaN(episode)}
                fullWidth
            />

            <h4>Files</h4>
            {uploading && <progress value={uploadProgress} max="100" />}
            <span>Main: {mainFile}</span><br/>
            <Button variant="contained" component="label">
                Add File
                <input hidden type="file" accept="video/mp4" onChange={e => handleFileAdd(e.target.files?.item(0) as File)} />
            </Button>
            <Button variant="contained" color="warning" disabled={props.episode.video_hls} onClick={() => handleFileConvert()}>Convert to HLS</Button>
            <Button variant="contained" color="warning" disabled={props.episode.video_hls} onClick={() => handleFileConvert(true)}>Re-encode to HLS</Button>
            <Button variant="contained" color="warning" disabled={!props.episode.video_hls} onClick={handleFileRevert}>Revert to MP4</Button>
            <Button variant="contained" color="error" onClick={handleDeleteHLS}>Delete HLS Files</Button>
            <FileTable files={files} onDelete={handleFileDelete} customActions={file => (
                <Button variant="contained" color="warning" disabled={mainFile === file.name} onClick={() => handleSetMainFile(file)}>Set as Main</Button>
            )} sx={{maxHeight: "350px", overflow: "auto"}} />

            <div className="d-flex flex-row float-end mt-5">
                <Button variant="contained" onClick={props.setClose}>Close</Button>
                <Button variant="contained" color="warning" onClick={handleSave}>Save</Button>
            </div>
        </>
    )
}

export default EditEpisode;