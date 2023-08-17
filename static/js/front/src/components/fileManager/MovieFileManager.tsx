import React, {useEffect} from "react";
import {AdvancedFileType} from "../../types/fileType";
import FileManagerFileTable from "./FileManagerFileTable";

function MovieFileManager(){
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
    }, [path])

    return (
        <div>
            <FileManagerFileTable files={files} path={path} setPath={setPath} loading={loading} />
        </div>
    )
}

export default MovieFileManager;