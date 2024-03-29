import {AdvancedFileType} from "../../types/fileType";
import React, {useEffect, useState} from "react";
import hrFileSize from "../../utils/hrFileSize";
import {
    Button,
    Checkbox, Fade,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField, Tooltip, Typography
} from "@mui/material";
import SwcLoader from "../SwcLoader";
import {SwcFab, SwcFabContainer} from "../SwcFab";
import {TransitionGroup} from "react-transition-group";
import SwcModal from "../SwcModal";
import FileManagerConverter from "./FileManagerConverter";

function hrPath(path: string, files: AdvancedFileType[]){
    return path.split("/").map(p => {
        if (p.length === 36){
            const file = files.find(f => f.filename === p)
            if(file) return file.display_name;
        }else if(p.startsWith("season_")){
            return `Season ${p.split("season_").pop()}`
        }else if(p.startsWith("episode_")){
            return `Episode ${p.split("episode_").pop()}`
        }
        return p
    }).join("/")
}

interface FileTableEntryProps{
    file: AdvancedFileType
    selected: string[]
    setSelected: (selected: (prevState: string[]) => string[]) => void
    setPath: (path: (prevState: string) => string) => void
    onRecover?: (file: AdvancedFileType) => void
}
function FileTableEntry({file, selected, setSelected, setPath, onRecover}: FileTableEntryProps){
    return (
        <TableRow
            hover
            selected={selected.includes(file.filename)}
        >
            <TableCell padding="checkbox">
                <div className="d-flex flex-row">
                    <Checkbox
                        checked={selected.includes(file.filename)}
                        onChange={e => {
                            if(e.target.checked){
                                setSelected(prevState => [...prevState, file.filename])
                            }else{
                                setSelected(prevState => prevState.filter(f => f !== file.filename))
                            }
                        }}
                    />
                    {onRecover && file.not_found && (
                        <Tooltip title="Recover from Files">
                            <Button onClick={() => onRecover(file)}>
                                <i className="material-icons">unarchive</i>
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </TableCell>
            <TableCell
                onClick={() => {
                    if(file.is_dir){
                        setPath(prevState => (
                            prevState +
                            (prevState.endsWith("/") ? "" : "/") +
                            file.filename
                        ))
                    }
                }}
                sx={{cursor: file.is_dir ? "pointer" : "default"}}
            >
                {file.not_found ? (
                    <span style={{color: "red"}}>{file.display_name}</span>
                ) : file.display_name}
            </TableCell>
            <TableCell>
                {file.display_name !== file.filename ? file.filename : "-"}
            </TableCell>
            <TableCell>
                {hrFileSize(file.size)}
            </TableCell>
        </TableRow>
    )
}

interface FileManagerTableHeadProps{
    path: string
    selected: string[]
    setSelected: (selected: (prevState: string[]) => string[]) => void
    sort: string
    setSort: (sort: (prevState: string) => string) => void
    order: "asc" | "desc"
    setOrder: (order: (prevState: "asc" | "desc") => "asc" | "desc") => void
    files: AdvancedFileType[]
    allFiles: AdvancedFileType[]
}
function FileManagerTableHead(props: FileManagerTableHeadProps){
    const [fileCache, setFileCache] = useState<AdvancedFileType[]>([])

    useEffect(() => {
        setFileCache(p => {
            const newFiles = props.allFiles.filter(f => p.find(pf => pf.filename === f.filename) === undefined)
            return [...p, ...newFiles]
        })
    }, [props.allFiles])

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        checked={props.selected.length === props.files.length}
                        indeterminate={props.selected.length > 0 && props.selected.length < props.files.length}
                        onChange={e => {
                            if(e.target.checked){
                                props.setSelected(() => props.files.map(f => f.filename))
                            }else{
                                props.setSelected(() => [])
                            }
                        }}
                    />
                </TableCell>
                <TableCell
                    onClick={() => {
                        props.setSort(() => "display_name")
                        props.setOrder(prevState => prevState === "asc" ? "desc" : "asc")
                    }}
                >
                    <i className={`material-icons ${props.sort !== "display_name" ? "text-muted" : ""}`}>{(props.sort === "display_name" && props.order === "asc") ? "arrow_upward" : "arrow_downward"}</i>Name
                    <Typography variant="caption" className="ms-3">{hrPath(props.path, fileCache)}</Typography>
                </TableCell>
                <TableCell>
                    UUID / Actual Name
                </TableCell>
                <TableCell
                    onClick={() => {
                        props.setSort(() => "size")
                        props.setOrder(prevState => prevState === "asc" ? "desc" : "asc")
                    }}
                >
                    <i className={`material-icons ${props.sort !== "size" ? "text-muted" : ""}`}>{(props.sort === "size" && props.order === "asc") ? "arrow_upward" : "arrow_downward"}</i>Size
                </TableCell>
            </TableRow>
        </TableHead>
    )
}

interface FileManagerFileTableProps{
    files: AdvancedFileType[]
    setFiles: (files: (prevState: AdvancedFileType[]) => AdvancedFileType[]) => void
    path: string
    setPath: (path: (prevState: string) => string) => void
    loading: boolean
    passedValue: string
    onRecover?: (file: AdvancedFileType) => void
}
function FileManagerFileTable(props: FileManagerFileTableProps){
    const [files, setFiles] = useState<AdvancedFileType[]>(props.files)
    const [selected, setSelected] = useState<string[]>([])
    const [sortBy, setSortBy] = useState<string>("display_name")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [search, setSearch] = useState<string>("")
    const [showConverterModal, setShowConverterModal] = useState<boolean>(false)

    useEffect(() => {
        setFiles(() => {
            let files = [...props.files.filter(f => (
                f.display_name.toLowerCase().includes(search.toLowerCase()) ||
                f.filename.toLowerCase().includes(search.toLowerCase())
            ))]
            files.sort((a, b) => {
                if(sortBy === "display_name"){
                    if(a.display_name.toLowerCase() < b.display_name.toLowerCase()){
                        return sortOrder === "asc" ? -1 : 1
                    }else if(a.display_name.toLowerCase() > b.display_name.toLowerCase()){
                        return sortOrder === "asc" ? 1 : -1
                    }else{
                        return 0
                    }
                }else if(sortBy === "size"){
                    if(a.size < b.size){
                        return sortOrder === "asc" ? -1 : 1
                    }else if(a.size > b.size){
                        return sortOrder === "asc" ? 1 : -1
                    }else{
                        return 0
                    }
                }else{
                    return 0
                }
            })
            return files
        })
    }, [props.files, sortBy, sortOrder, search])

    function deleteSelected(){
        let sFiles = files.filter(f => selected.includes(f.filename) && !f.not_found)
        if(sFiles.length === 0) return;

        const formData = new FormData()
        formData.append("files", sFiles.map(f => f.filename).join("//"))
        formData.append("mode", props.passedValue)
        fetch(`/files/delete/${props.path}`, {
            method: "POST",
            body: formData
        })
            .then(() => {
                window.location.reload()
            })

    }

    function remoteUploadSelected(){
        let file = files.find(f => f.filename === selected[0])
        if(!file || file.is_dir) return;

        const formData = new FormData()
        formData.append("mode", props.passedValue)
        formData.append("path", props.path + (props.path.endsWith("/") ? "" : "/") + file.filename)
        fetch("/files/converter/upload", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                alert(`File "${data.name}" has been uploaded to the converter server`)
            })
    }

    return (
        <>
            <Table>
                <FileManagerTableHead
                    path={props.path}
                    selected={selected}
                    setSelected={setSelected}
                    sort={sortBy}
                    setSort={setSortBy}
                    order={sortOrder}
                    setOrder={setSortOrder}
                    files={files}
                    allFiles={props.files}
                />
                <TableBody>
                    {!props.loading ? (
                        <>
                            {!["", "/"].includes(props.path) && (
                                <TableRow hover>
                                    <TableCell padding="checkbox" />
                                    <TableCell
                                        onClick={() => {
                                            if(props.path !== "/"){
                                                setSelected(() => [])
                                                props.setPath(prevState => prevState.substring(0, prevState.lastIndexOf("/")))
                                            }
                                        }}
                                        sx={{cursor: "pointer"}}
                                    >
                                        ..
                                    </TableCell>
                                    <TableCell />
                                    <TableCell />
                                </TableRow>
                            )}
                            {files.map(file => (
                                <FileTableEntry
                                    key={file.filename}
                                    file={file}
                                    selected={selected}
                                    setSelected={setSelected}
                                    setPath={(path: (prevState: string) => string) => {
                                        setSelected(() => [])
                                        props.setPath(path)
                                    }}
                                    onRecover={props.onRecover}
                                />
                            ))}
                        </>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <SwcLoader />
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <TransitionGroup className="position-fixed start-0 bottom-0 p-3" style={{zIndex: 3000}}>
                <Fade>
                    <TextField
                        label="Search"
                        sx={{width: "200px"}}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setSearch("")}
                                    >
                                        <i className="material-icons">clear</i>
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Fade>
            </TransitionGroup>
            <SwcFabContainer>
                <SwcFab icon={<i className="material-icons">cloud_upload</i>} onClick={remoteUploadSelected} color="primary"
                    show={selected.length > 0 && files.filter(f => selected.includes(f.filename)).filter(f => f.is_dir || f.not_found).length === 0}
                    tooltip="Remote upload" tooltipPlacement="top"
                />
                <SwcFab icon={<i className="material-icons">mediation</i>} onClick={() => {
                    setShowConverterModal(true)
                }} color="primary" tooltip="Converter" tooltipPlacement="top" />
                <SwcFab icon={<i className="material-icons">delete</i>} onClick={deleteSelected} color="error" hide={selected.length === 0} />
            </SwcFabContainer>

            <SwcModal show={showConverterModal} onHide={() => setShowConverterModal(false)} width="90%">
                <FileManagerConverter path={props.path} mode={props.passedValue} />
            </SwcModal>
        </>
    )
}

export default FileManagerFileTable;