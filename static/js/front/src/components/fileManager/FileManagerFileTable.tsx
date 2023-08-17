import {AdvancedFileType} from "../../types/fileType";
import React, {useEffect, useState} from "react";
import hrFileSize from "../../utils/hrFileSize";
import {
    Checkbox, Fade,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField
} from "@mui/material";
import SwcLoader from "../SwcLoader";
import {SwcFabContainer} from "../SwcFab";

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
}
function FileTableEntry({file, selected, setSelected, setPath}: FileTableEntryProps){
    return (
        <TableRow
            hover
        >
            <TableCell padding="checkbox">
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
            >
                {file.not_found ? (
                    <span style={{color: "red"}}>{file.display_name}</span>
                ) : file.display_name}
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
                    <span className="text-muted ms-3">{hrPath(props.path, fileCache)}</span>
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
}
function FileManagerFileTable(props: FileManagerFileTableProps){
    const [files, setFiles] = useState<AdvancedFileType[]>(props.files)
    const [selected, setSelected] = useState<string[]>([])
    const [sortBy, setSortBy] = useState<string>("display_name")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [search, setSearch] = useState<string>("")

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
                                                props.setPath(prevState => prevState.substring(0, prevState.lastIndexOf("/")))
                                            }
                                        }}
                                    >
                                        ..
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            )}
                            {files.map(file => (
                                <FileTableEntry
                                    key={file.filename}
                                    file={file}
                                    selected={selected}
                                    setSelected={setSelected}
                                    setPath={props.setPath}
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
            <SwcFabContainer>
                <Fade>
                    <TextField
                        label="Search"
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
            </SwcFabContainer>
        </>
    )
}

export default FileManagerFileTable;