import React from "react";
import {useEffect, useState} from "react";
import {Button, TextField} from "@mui/material";

interface Info{
    host: string
    port: number
    uri: string
    enabled: boolean
    connected: boolean
    files: any[]
    output: any
}
interface FileManagerConverterProps {
    path: string
    mode: string
}
function FileManagerConverter(props: FileManagerConverterProps){
    const [loading, setLoading] = useState(false)
    const [hostInfo, setHostInfo] = useState<Info | null>(null)
    const [selectedHost, setSelectedHost] = useState<string>("")
    const [selectedPort, setSelectedPort] = useState<number>(0)

    function connect_toggle(){
        fetch(`/files/converter/${hostInfo?.connected ? "disconnect" : "connect"}?host=${selectedHost}&port=${selectedPort}`)
            .then(res => res.json())
            .then(setHostInfo)
    }

    function updateInfo(){
        setLoading(true)
        fetch("/files/converter")
            .then(res => res.json())
            .then(data => {
                if(selectedHost === "" && selectedPort === 0){
                    setSelectedHost(data.host)
                    setSelectedPort(data.port)
                }

                setHostInfo(data)
                setLoading(false)
            })
    }
    function deleteFile(uuid: string){
        fetch(`/files/converter/delete/${uuid}`)
            .then(res => res.json())
            .then(() => {
                updateInfo()
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
        hostInfo?.enabled ? (
            <>
                <h4>Converter</h4>
                <Button
                    variant="contained"
                    onClick={connect_toggle}
                    color={hostInfo.connected ? "error" : "success"}
                >
                    {hostInfo.connected ? "Disconnect" : "Connect"}
                </Button>
                {!hostInfo.connected ? <>
                    <TextField value={selectedHost} onChange={e => setSelectedHost(e.target.value)} label="Host" variant="standard" className="mt-3"/>
                    <TextField value={selectedPort} onChange={e => setSelectedPort(parseInt(e.target.value))} label="Port" variant="standard" className="mt-3"/>
                    <p>Not connected to the converter server</p>
                </> : <>
                    <Button variant="contained" onClick={updateInfo}>Update</Button>
                    <a className="float-end" href={hostInfo.uri} target="_blank" rel="noreferrer">Open converter</a>
                </>}

                <div className="row m-0" hidden={!hostInfo.connected}>
                    <div className="col-lg-6 col-12">
                        <h5 className="mt-5">Files on server</h5>
                        {hostInfo.files.length === 0 && "None" }
                        <ul>
                            {hostInfo.files.map((file: any) => (
                                <li key={file.uuid}>
                                    {file.name}
                                    <Button size="small" variant="text" color="error" onClick={() => deleteFile(file.uuid)}>
                                        <i className="material-icons">delete</i>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <Button variant="contained" color="error" onClick={() => deleteFile("all")}
                            hidden={hostInfo.files.length === 0}
                        >
                            Delete All
                        </Button>
                    </div>
                    <div className="col-lg-6 col-12">
                        <h5 className="mt-5">Output file</h5>
                        <span>{hostInfo.output?.name !== undefined ? hostInfo.output.name : "None"}</span><br/>
                        <a href="#" hidden={hostInfo.output?.name === undefined} onClick={e => {
                            e.preventDefault()
                            deleteFile("output")
                            updateInfo()
                        }}>Delete</a>
                    </div>
                </div>

                <div>

                </div>

                <Button
                    variant="contained"
                    color="warning"
                    onClick={handleDownload}
                    disabled={!hostInfo.output}
                    className="float-end me-3"
                >
                    Download to this folder
                </Button>
            </>
        ) : "Converter is not enabled"
    )
}

export default FileManagerConverter;