import {AdvancedFileType} from "../../types/fileType";
import React, {useState} from "react";
import hrFileSize from "../../utils/hrFileSize";
import {Checkbox, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import SwcLoader from "../SwcLoader";

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

interface FileManagerFileTableProps{
    files: AdvancedFileType[]
    path: string
    setPath: (path: (prevState: string) => string) => void
    loading: boolean
}
function FileManagerFileTable(props: FileManagerFileTableProps){
    const [selected, setSelected] = useState<string[]>([])

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            checked={selected.length === props.files.length}
                            indeterminate={selected.length > 0 && selected.length < props.files.length}
                            onChange={e => {
                                if(e.target.checked){
                                    setSelected(props.files.map(f => f.filename))
                                }else{
                                    setSelected([])
                                }
                            }}
                        />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Size</TableCell>
                </TableRow>
            </TableHead>
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
                        {props.files.map(file => (
                            <FileTableEntry
                                key={file.filename}
                                file={file}
                                selected={selected}
                                setSelected={setSelected}
                                setPath={props.setPath}
                            />
                        ))}
                    </>
                ) : <SwcLoader />}
            </TableBody>
        </Table>
    )
}

export default FileManagerFileTable;