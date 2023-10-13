import React, {useEffect} from "react";
import {AdvancedFileType} from "../../types/fileType";
import FileManagerFileTable from "./FileManagerFileTable";

function SeriesFileManager(){
    const [update, setUpdate] = React.useState<boolean>(false)
    const [loading, setLoading] = React.useState<boolean>(true)
    const [files, setFiles] = React.useState<AdvancedFileType[]>([])
    const [path, setPath] = React.useState<string>(sessionStorage.getItem("fm-series-path") || "/")

    useEffect(() => {
        setLoading(true)
        sessionStorage.setItem("fm-series-path", path)
        let urlPath = path !== "/" && path.length > 1 ? path : ""
        fetch(`/files/series${urlPath}`)
            .then(res => res.json())
            .then(f => {
                setFiles(f)
                setLoading(false)
            })
    }, [path, update])

    function recoverSeries(file: AdvancedFileType){
        if(!file.not_found) return
        if(!confirm(`Recover ${file.display_name}?`)) return

        const formData = new FormData()
        formData.append("mode", "series")
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
                passedValue="series"
                onRecover={recoverSeries}
            />
        </div>
    )
}

export default SeriesFileManager;