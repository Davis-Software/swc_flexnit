import React from "react";
import {useEffect, useState} from "react";
import {Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select} from "@mui/material";

const accelerators = ["cuda", "nvdec", "vdpau", "vaapi"]
const encoderPresets = ["slow", "medium", "fast", "hp", "hq", "bd", "ll", "llhq", "llhp", "lossless", "losslesshp"]
const outputFormats = ["mp4", "mkv", "mov", "avi", "webm", "flv"]
const acceleratorDefault = "cuda"
const encoderPresetDefault = "medium"
const outputFormatDefault = "mp4"

interface FileManagerConverterProps {
    path: string
    mode: string
}
function FileManagerConverter(props: FileManagerConverterProps){
    const [loading, setLoading] = useState(false)
    const [enabled, setEnabled] = useState(false)
    const [connected, setConnected] = useState(false)
    const [files, setFiles] = useState([])
    const [outputFile, setOutputFile] = useState<any>({})

    const [selectedFile, setSelectedFile] = useState("")
    const [transcodeAudio, setTranscodeAudio] = useState(false)
    const [transcodeVideo, setTranscodeVideo] = useState(false)
    const [toHLS, setToHLS] = useState(false)
    const [accelerator, setAccelerator] = useState(acceleratorDefault)
    const [encoderPreset, setEncoderPreset] = useState(encoderPresetDefault)
    const [outputFormat, setOutputFormat] = useState(outputFormatDefault)

    const [working, setWorking] = useState(false)

    function setData(data: any){
        setEnabled(data.enabled)
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
    function handleConvert(){
        const formData = new FormData()

        formData.append("transcodeAudio", transcodeAudio.toString())
        formData.append("transcodeVideo", transcodeVideo.toString())
        formData.append("toHLS", toHLS.toString())
        formData.append("accelerator", accelerator)
        formData.append("encoderPreset", encoderPreset)
        formData.append("outputFormat", outputFormat)

        setWorking(true)
        fetch(`/files/converter/convert/${selectedFile}`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                setOutputFile(data)
                setWorking(false)
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
                </> : <Button variant="contained" onClick={updateInfo}>Update</Button>}

                <div className="row m-0">
                    <div className="col-lg-6 col-12">
                        <h5 className="mt-5">Files on server</h5>
                        <ul>
                            {files.map((file: any) => (
                                <li key={file.uuid}>
                                    {file.name}
                                    <Checkbox
                                        checked={selectedFile === file.uuid}
                                        onChange={() => setSelectedFile(file.uuid)}
                                    />
                                    <Button size="small" variant="text" color="error" onClick={() => deleteFile(file.uuid)}>
                                        <i className="material-icons">delete</i>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <Button variant="contained" color="error" onClick={() => deleteFile("all")}>
                            Delete All
                        </Button>
                    </div>
                    <div className="col-lg-6 col-12">
                        <h5 className="mt-5">Convert options</h5>
                        <FormControlLabel control={
                            <Checkbox
                                checked={transcodeAudio}
                                onChange={(e) => setTranscodeAudio(e.target.checked)}
                            />
                        } label="Transcode audio" />
                        <FormControlLabel control={
                            <Checkbox
                                checked={transcodeVideo}
                                onChange={(e) => setTranscodeVideo(e.target.checked)}
                            />
                        } label="Transcode video" />
                        <FormControlLabel disabled={true} control={
                            <Checkbox
                                checked={toHLS}
                                onChange={(e) => setToHLS(e.target.checked)}
                            />
                        } label="Convert to HLS" />
                    </div>
                    <div className="col-12 my-4 d-flex justify-content-evenly">
                        <FormControl variant="standard" fullWidth>
                            <InputLabel>Accelerator</InputLabel>
                            <Select value={accelerator} onChange={(e) => setAccelerator(e.target.value as string)}>
                                {accelerators.map((accelerator: string) => (
                                    <MenuItem key={accelerator} value={accelerator}>{accelerator}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel>Encoder preset</InputLabel>
                            <Select value={encoderPreset} onChange={(e) => setEncoderPreset(e.target.value as string)}>
                                {encoderPresets.map((encoderPreset: string) => (
                                    <MenuItem key={encoderPreset} value={encoderPreset}>{encoderPreset}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel>Output Format</InputLabel>
                            <Select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as string)}>
                                {outputFormats.map((outputFormat: string) => (
                                    <MenuItem key={outputFormat} value={outputFormat}>{outputFormat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>

                <div>
                    Output file: {outputFile?.name !== undefined ? outputFile.name : "None"}<br/>
                    <a href="#" hidden={working || outputFile?.name === undefined} onClick={e => {
                        e.preventDefault()
                        deleteFile("output")
                        setOutputFile({})
                    }}>Delete</a>
                </div>

                <Button
                    variant="contained"
                    color="success"
                    onClick={handleConvert}
                    disabled={working || selectedFile === "" || files.filter((file: any) => file.uuid === selectedFile).length === 0}
                    className="float-end"
                >
                    Convert
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={handleDownload}
                    disabled={working || outputFile?.name === undefined}
                    className="float-end me-3"
                >
                    Download to this folder
                </Button>
            </>
        ) : "Converter is not enabled"
    )
}

export default FileManagerConverter;