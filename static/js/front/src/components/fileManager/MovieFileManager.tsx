import React, {useEffect} from "react";
import {AdvancedFileType} from "../../types/fileType";
import FileManagerFileTable from "./FileManagerFileTable";

function MovieFileManager(){
    const [update, setUpdate] = React.useState<boolean>(false)
    const [loading, setLoading] = React.useState<boolean>(true)
    const [files, setFiles] = React.useState<AdvancedFileType[]>([])
    const [path, setPath] = React.useState<string>(sessionStorage.getItem("fm-movie-path") || "/")

    useEffect(() => {
        setLoading(true)
        sessionStorage.setItem("fm-movie-path", path)
        let urlPath = path !== "/" && path.length > 1 ? path : ""
        fetch(`/files/movie${urlPath}`)
            .then(res => res.json())
            .then(f => {
                setFiles(f)
                setLoading(false)
            })
    }, [path, update])

    function recoverMovie(file: AdvancedFileType){
        if(!file.not_found) return
        if(!confirm(`Recover ${file.display_name}?`)) return

        const formData = new FormData()
        formData.append("mode", "movie")
        formData.append("file", file.filename)

        fetch(`/files/recover`, {
            method: "POST",
            body: formData
        }).then(() => setUpdate(u => !u))
    }

    return (
        <div>
            <FileManagerFileTable
                files={files}
                setFiles={setFiles}
                path={path}
                setPath={setPath}
                loading={loading}
                passedValue="movie"
                onRecover={recoverMovie}
            />
        </div>
    )
}

export default MovieFileManager;