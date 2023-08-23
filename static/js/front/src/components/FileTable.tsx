import React from "react";
import {Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import FileType from "../types/fileType";

interface FileTableProps{
    files: FileType[];
    onDelete: (file: FileType) => void;
    customActions?: (file: FileType) => React.ReactNode;
    sx?: React.CSSProperties;
}
function FileTable(props: FileTableProps){
    return (
        <TableContainer sx={props.sx}>
            <Table
                sx={{width: "100%"}}
                size="small"
            >
                <TableHead>
                    <TableRow>
                        <TableCell>File</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.files.map((file, i) => (
                        <TableRow key={i}>
                            <TableCell>{file.display_name}</TableCell>
                            <TableCell>{file.size}</TableCell>
                            <TableCell>
                                {props.customActions && props.customActions(file)}
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => {
                                        props.onDelete(file)
                                    }}
                                    disabled={file.name.endsWith(".m3u8")}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default FileTable;