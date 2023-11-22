import {TableComponents, TableVirtuoso} from "react-virtuoso";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import React from "react";
import SongType from "../../types/songType";

function rowContent(_index: number, song: SongType){
    return (
        <TableRow hover>
            <TableCell padding="checkbox">
                <img src={song.uuid} alt={song.title} width={50} height={50} />
            </TableCell>
            <TableCell sx={{flexGrow: 1}}>{song.title}</TableCell>
            <TableCell>{song.artist}</TableCell>
            <TableCell>{song.album}</TableCell>
            <TableCell>{song.audio_info.duration}</TableCell>
        </TableRow>
    )
}

const VirtuosoTableComponents: TableComponents<SongType> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer {...props} ref={ref} />
    )),
    Table: (props) => (
        <Table {...props} />
    ),
    TableHead,
    TableRow: ({item: _item, ...props}) => <TableRow hover {...props} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref} />
    ))
}

function fixedHeaderContent(){
    return (
        <TableRow sx={{backgroundColor: "background.paper"}}>
            <TableCell padding="checkbox">Title</TableCell>
            <TableCell sx={{flexGrow: 1}}>Title</TableCell>
            <TableCell>Artist</TableCell>
            <TableCell>Album</TableCell>
            <TableCell>Duration</TableCell>
        </TableRow>
    )
}

interface SongListProps {
    songs: SongType[]
}
function SongList(props: SongListProps){
    return (
        <TableVirtuoso
            fixedHeaderContent={fixedHeaderContent}
            components={VirtuosoTableComponents}
            itemContent={rowContent}
            data={props.songs}
        />
    )
}

export default SongList