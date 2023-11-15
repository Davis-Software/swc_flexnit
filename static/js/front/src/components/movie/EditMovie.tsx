import React, {useEffect} from "react";
import MovieType from "../../types/movieType";
import {Button, Checkbox, Collapse, FormControlLabel, TextField} from "@mui/material";
import FileTable from "../FileTable";
import FileType from "../../types/fileType";
import {hasNSFWPermission} from "../../utils/permissionChecks";

interface EditMovieProps{
    movie: MovieType;
    setMovie: React.Dispatch<React.SetStateAction<MovieType | null>>;
    setShowEdit: (show: boolean) => void;
}
function EditMovie(props: EditMovieProps){
    const [title, setTitle] = React.useState<string>(props.movie.title)
    const [year, setYear] = React.useState<string>(props.movie.year || "")
    const [description, setDescription] = React.useState<string>(props.movie.description || "")
    const [language, setLanguage] = React.useState<string>(props.movie.language || "")
    const [subtitles, setSubtitles] = React.useState<boolean>(props.movie.subtitles || false)
    const [subtitleLanguage, setSubtitleLanguage] = React.useState<string>(props.movie.subtitle_language || "")
    const [isVisible, setIsVisible] = React.useState<boolean>(props.movie.is_visible || false)
    const [isNsfw, setIsNsfw] = React.useState<boolean>(props.movie.is_nsfw || false)
    const [newThumbnail, setNewThumbnail] = React.useState<File | null | undefined>(null)
    const [newPoster, setNewPoster] = React.useState<File | null | undefined>(null)

    const [files, setFiles] = React.useState<FileType[]>([])
    const [mainFile, setMainFile] = React.useState<string | null>(null)
    const [updateFiles, setUpdateFiles] = React.useState<boolean>(false)
    const [uploading, setUploading] = React.useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = React.useState<number>(0)

    useEffect(() => {
        fetch(`/movies/${props.movie.uuid}/files`)
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

        formData.append("movie", file)
        req.upload.addEventListener("progress", e => {
            setUploadProgress(e.loaded / e.total * 100)
        })
        req.addEventListener("load", () => {
            setUploading(false)
            setUploadProgress(0)
            setUpdateFiles(!updateFiles)
        })
        req.open("POST", `/movies/${props.movie.uuid}/upload`)
        req.send(formData)
    }
    function handleFileConvert(reEncode: boolean = false){
        fetch(`/movies/${props.movie.uuid}/convert${reEncode ? "?encode" : ""}`, {
            method: "POST"
        })
            .then(res => {
                if(res.ok){
                    setUpdateFiles(!updateFiles)
                    props.setMovie(pv => (pv ? {...pv, video_hls: true} : pv))
                }
            })
    }
    function handleSetMainFile(file: FileType){
        const formData = new FormData()
        formData.append("file_name", file.name)
        fetch(`/movies/${props.movie.uuid}/set_main_file`, {
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
            fetch(`/movies/${props.movie.uuid}/revert`, {
                method: "POST"
            })
                .then(res => {
                    if(res.ok){
                        setUpdateFiles(!updateFiles)
                        props.setMovie(pv => (pv ? {...pv, video_hls: false} : pv))
                    }
                })
        }
    }
    function handleDeleteHLS(){
        if(confirm("Are you sure you want to delete the HLS files?")){
            fetch(`/movies/${props.movie.uuid}/delete_hls`, {
                method: "POST"
            })
                .then(res => {
                    if(res.ok){
                        setUpdateFiles(!updateFiles)
                        props.setMovie(pv => (pv ? {...pv, video_hls: false} : pv))
                    }
                })
        }
    }
    function handleFileDelete(file: FileType){
        if(confirm("Are you sure you want to delete this file?")){
            const formData = new FormData()
            formData.append("file_name", file.name)
            fetch(`/movies/${props.movie.uuid}/delete_file`, {
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

    function handleScrapeIMDB(){
        let id = prompt("Enter IMDB ID")
        if(!id || id === "") return

        const formData = new FormData()
        formData.append("imdb_id", id)

        fetch(`/movies/${props.movie.uuid}/scrape_imdb`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then((data: MovieType) => {
                props.setMovie(data)
                props.setShowEdit(false)
            })
    }

    function handleSave(){
        const formData = new FormData()
        formData.append("title", title)
        formData.append("year", year)
        formData.append("description", description)
        formData.append("language", language)
        formData.append("subtitles", subtitles.toString())
        formData.append("subtitle_language", subtitleLanguage)
        formData.append("is_visible", isVisible.toString())
        formData.append("is_nsfw", isNsfw.toString())
        if(newThumbnail) formData.append("thumbnail", newThumbnail)
        if(newPoster) formData.append("poster", newPoster)

        fetch(`/movies/${props.movie.uuid}/edit`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then((data: MovieType) => {
                props.setMovie(data)
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
                label="Year"
                value={year}
                onChange={e => setYear(e.target.value)}
                error={Number.isNaN(year)}
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
                label="Language Code"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                fullWidth
            />
            <div className="row m-0">
                <FormControlLabel
                    className="col-3"
                    control={<Checkbox
                            checked={subtitles}
                            onChange={e => setSubtitles(e.target.checked)}
                        />}
                    label="Has subtitles"
                />
                <Collapse in={subtitles} className="col-5">
                    <TextField
                        variant="standard"
                        label="Subtitle Language Code"
                        value={subtitleLanguage}
                        onChange={e => setSubtitleLanguage(e.target.value)}
                        error={subtitles && subtitleLanguage.length === 0}
                        fullWidth
                    />
                </Collapse>
            </div>
            <FormControlLabel
                control={<Checkbox
                        checked={isVisible}
                        onChange={e => setIsVisible(e.target.checked)}
                    />}
                label="Is visible"
            />
            <FormControlLabel
                control={<Checkbox
                        checked={isNsfw}
                        disabled={!hasNSFWPermission()}
                        onChange={e => setIsNsfw(e.target.checked)}
                    />}
                label="Is NSFW"
            />
            <div className="d-flex">
                <img style={{width: "40px", height: "40px"}} src={`/movies/${props.movie.uuid}?thumbnail&q=s`} alt="thumbnail" />
                <Button className="flex-grow-1" variant="contained" component="label" fullWidth>
                    {newThumbnail ? "Change Selected Thumbnail" : "Upload Thumbnail"}
                    <input hidden accept="image/png" type="file" onChange={e => setNewThumbnail(e.target.files?.item(0))} />
                </Button>
            </div>
            <div className="d-flex">
                <img style={{width: "40px", height: "40px"}} src={`/movies/${props.movie.uuid}?poster`} alt="poster" />
                <Button className="flex-grow-1" variant="contained" component="label" fullWidth>
                    {newPoster ? "Change Selected Poster" : "Upload Poster"}
                    <input hidden accept="image/png" type="file" onChange={e => setNewPoster(e.target.files?.item(0))} />
                </Button>
            </div>

            <h4>Files</h4>
            {uploading && <progress value={uploadProgress} max="100" />}
            <span>Main: {mainFile}</span><br/>
            <Button variant="contained" component="label">
                Add File
                <input hidden type="file" accept="video/mp4" onChange={e => handleFileAdd(e.target.files?.item(0) as File)} />
            </Button>
            <Button variant="contained" color="warning" disabled={props.movie.video_hls} onClick={() => handleFileConvert()}>Convert to HLS</Button>
            <Button variant="contained" color="warning" disabled={props.movie.video_hls} onClick={() => handleFileConvert(true)}>Re-encode to HLS</Button>
            <Button variant="contained" color="warning" disabled={!props.movie.video_hls} onClick={handleFileRevert}>Revert to MP4</Button>
            <Button variant="contained" color="error" onClick={handleDeleteHLS}>Delete HLS Files</Button>
            <FileTable files={files} onDelete={handleFileDelete} customActions={file => (
                <Button variant="contained" color="warning" disabled={mainFile === file.name || file.name.endsWith(".m3u8")} onClick={() => handleSetMainFile(file)}>Set as Main</Button>
            )} sx={{maxHeight: "350px", overflow: "auto"}} />

            <div className="d-flex flex-row float-start mt-5">
                <Button variant="contained" onClick={handleScrapeIMDB}>Scrape IMDB</Button>
            </div>
            <div className="d-flex flex-row float-end mt-5">
                <Button variant="contained" onClick={() => props.setShowEdit(false)}>Close</Button>
                <Button variant="contained" color="warning" onClick={handleSave}>Save</Button>
            </div>
        </>
    )
}

export default EditMovie;
