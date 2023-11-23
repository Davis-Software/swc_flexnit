import {TableComponents, TableVirtuoso} from "react-virtuoso";
import {Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import React from "react";
import SongType from "../../types/songType";
import {isAdmin} from "../../utils/constants";

interface RowContentProps {
    song: SongType,
    setSelectedSong: (song: SongType) => void
}
function rowContent(_index: number, props: RowContentProps){
    return (
        <>
            <TableCell padding="checkbox">
                <img src={props.song.uuid} alt={props.song.title} width={50} height={50} />
            </TableCell>
            <TableCell>{props.song.title}</TableCell>
            <TableCell>{props.song.artists}</TableCell>
            <TableCell>{props.song.album}</TableCell>
            <TableCell>{props.song.audio_info.duration}</TableCell>
            {isAdmin && (
                <TableCell>
                    <Button variant="outlined" size="small" color="warning" onClick={() => props.setSelectedSong(props.song)}>Edit</Button>
                    <Button variant="outlined" size="small" color="error">Delete</Button>
                </TableCell>
            )}
        </>
    )
}

const VirtuosoTableComponents: TableComponents<RowContentProps> = {
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
        <TableRow>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Artist</TableCell>
            <TableCell>Album</TableCell>
            <TableCell>Duration</TableCell>
            {isAdmin && (
                <TableCell>Operations</TableCell>
            )}
        </TableRow>
    )
}

interface SongListProps {
    songs: SongType[]
    setSelectedSong: (song: SongType) => void
}
function SongList(props: SongListProps){
    return (
        <TableVirtuoso
            fixedHeaderContent={fixedHeaderContent}
            components={VirtuosoTableComponents}
            itemContent={rowContent}
            data={props.songs.map(song => ({song, setSelectedSong: props.setSelectedSong}))}
            style={{
                position: "absolute",
                height: "calc(100% - 64px)",
            }}
        />
    )
}

export default SongList