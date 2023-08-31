import React from "react";
import {useEffect, useState} from "react";
import {Button} from "@mui/material";

interface FileManagerConverterProps {
    path: string
    mode: string
}
function FileManagerConverter(props: FileManagerConverterProps){
    const [loading, setLoading] = useState(false)
    const [enabled, setEnabled] = useState(false)
    const [uri, setUri] = useState<string>("")
    const [connected, setConnected] = useState(false)
    const [files, setFiles] = useState([])
    const [outputFile, setOutputFile] = useState<any>({})

    function setData(data: any){
        setEnabled(data.enabled)
        setUri(data.uri)
        setConnected(data.connected)
        setFiles(data.files)
        setOutputFile(data.output)
    }

    function connect_toggle(){
        fetch(`/files/converter/${connected ? "disconnect" : "connect"}`)
            .then(res => res.json())
            .then(setData)
    }

    function updateInfo(){
        setLoading(true)
        fetch("/files/converter")
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
    }
    function deleteFile(uuid: string){
        fetch(`/files/converter/delete/${uuid}`)
            .then(res => res.json())
            .then(data => {
                setFiles(data)
            })
    }

    function handleDownload(){
        const formData = new FormData()
        formData.append("path", props.path)
        formData.append("mode", props.mode)
        fetch(`/files/converter/download`, {
            method: "POST",
            body: formData
        })
            .then(() => {
                window.location.reload()
            })
    }

    useEffect(() => {
        updateInfo()
    }, []);

    return loading ? "Loading..." : (
        enabled ? (
            <>
                <h4>Converter</h4>
                <Button
                    variant="contained"
                    onClick={connect_toggle}
                    color={connected ? "error" : "success"}
                >
                    {connected ? "Disconnect" : "Connect"}
                </Button>
                {!connected ? <>
                    <p>Not connected to the converter server</p>
                </> : <>
                    <Button variant="contained" onClick={updateInfo}>Update</Button>
                    <a className="float-end" href={uri} target="_blank" rel="noreferrer">Open converter</a>
                </>}

                <div className="row m-0" hidden={!connected}>
                    <div className="col-lg-6 col-12">
                        <h5 className="mt-5">Files on server</h5>
                        {files.length === 0 && "None" }
                        <ul>
                            {files.map((file: any) => (
                                <li key={file.uuid}>
                                    {file.name}
                                    <Button size="small" variant="text" color="error" onClick={() => deleteFile(file.uuid)}>
                                        <i className="material-icons">delete</i>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <Button variant="contained" color="error" onClick={() => deleteFile("all")}
                            hidden={files.length === 0}
                        >
                            Delete All
                        </Button>
                    </div>
                    <div className="col-lg-6 col-12">
                        <h5 className="mt-5">Output file</h5>
                        <span>{outputFile?.name !== undefined ? outputFile.name : "None"}</span><br/>
                        <a href="#" hidden={outputFile?.name === undefined} onClick={e => {
                            e.preventDefault()
                            deleteFile("output")
                            setOutputFile({})
                        }}>Delete</a>
                    </div>
                </div>

                <div>

                </div>

                <Button
                    variant="contained"
                    color="warning"
                    onClick={handleDownload}
                    disabled={outputFile?.name === undefined}
                    className="float-end me-3"
                >
                    Download to this folder
                </Button>
            </>
        ) : "Converter is not enabled"
    )
}

export default FileManagerConverter;