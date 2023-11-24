import {TableComponents, TableVirtuoso} from "react-virtuoso";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip, Typography
} from "@mui/material";
import React from "react";
import SongType from "../../types/songType";
import {isAdmin} from "../../utils/constants";
import {getTimeString} from "../../utils/FormatDate";
import SongPlayer from "./SongPlayer";

interface RowContentProps {
    song: SongType,
    setSelectedSong: (song: SongType) => void
    deleteSong: (song: SongType) => void
    playSong: (song: SongType) => void
    playingSong: SongType | null
    setSearch: (search: string) => void
}
function rowContent(_index: number, props: RowContentProps){
    return (
        <>
            <TableCell padding="checkbox">
                <img src={`/music/${props.song.uuid}?thumbnail`} alt={props.song.title} width={40} height={40} />
            </TableCell>
            <TableCell
                onClick={() => props.playSong(props.song)} sx={{cursor: "pointer"}}
            >
                <Typography variant="body1">{props.song.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {props.song.artists?.split(",").map((artist, index) => (
                        <Tooltip key={index} title="Sort by this Artist">
                            <span>
                                <span style={{cursor: "pointer"}} onClick={(e) => {
                                    e.stopPropagation()
                                    props.setSearch("artist:" + artist)
                                }}>{artist}</span>
                                {index !== props.song.artists?.split(",").length - 1 && ", "}
                            </span>
                        </Tooltip>
                    ))}
                </Typography>
            </TableCell>
            <TableCell>
                <Tooltip title="Sort by this Album">
                    <span style={{cursor: "pointer"}} onClick={() => props.setSearch("album:" + props.song.album)}>{props.song.album}</span>
                </Tooltip>
            </TableCell>
            <TableCell align="right">{getTimeString(props.song.audio_info.duration, true)}</TableCell>
            {isAdmin && (
                <TableCell align="right">
                    <Button variant="outlined" size="small" color="warning" onClick={() => props.setSelectedSong(props.song)}>Edit</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => props.deleteSong(props.song)}>Delete</Button>
                </TableCell>
            )}
        </>
    )
}

function fixedHeaderContent(){
    return (
        <TableRow sx={{backgroundColor: "background.paper"}}>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Album</TableCell>
            <TableCell align="right">Duration</TableCell>
            {isAdmin && (
                <TableCell align="right">Operations</TableCell>
            )}
        </TableRow>
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
    TableRow: ({item: _item, ...props}) => <TableRow selected={_item.song.uuid === _item.playingSong?.uuid} hover {...props} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref} />
    ))
}

interface SongListProps {
    songs: SongType[]
    setSelectedSong: (song: SongType) => void
    deleteSong: (song: SongType) => void
}
function SongList(props: SongListProps){
    const [search, setSearch] = React.useState("")

    const [playingSong, setPlayingSong] = React.useState<SongType | null>(null)

    function filterFunc(song: SongType){
        if(!search || search.trim() === "") return true
        let searchVal = search.trim()
        if(search.startsWith("artist:")){
            return (
                song.artists &&
                song.artists !== "" &&
                song.artists?.toLowerCase().includes(searchVal.substring("artist:".length).toLowerCase())
            )
        } else if(searchVal.startsWith("album:")){
            return (
                song.album &&
                song.album !== "" &&
                song.album?.toLowerCase().includes(searchVal.substring("album:".length).toLowerCase())
            )
        } else {
            return (
                song.title?.toLowerCase().includes(searchVal.toLowerCase()) ||
                song.artists?.toLowerCase().includes(searchVal.toLowerCase()) ||
                song.album?.toLowerCase().includes(searchVal.toLowerCase())
            )
        }
    }

    return (
        <>
            <TextField
                sx={{backgroundColor: "background.paper"}}
                variant="standard"
                placeholder={`Search ${props.songs.length} songs`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                fullWidth
            />
            <TableVirtuoso
                fixedHeaderContent={fixedHeaderContent}
                components={VirtuosoTableComponents}
                itemContent={rowContent}
                data={props.songs.filter(filterFunc).map(song =>
                    ({
                        song,
                        playingSong,
                        setSearch,
                        setSelectedSong: props.setSelectedSong,
                        deleteSong: props.deleteSong,
                        playSong: setPlayingSong
                    })
                )}
                style={{
                    position: "absolute",
                    height: "calc(100% - 2*64px - 32px)",
                }}
            />
            <SongPlayer playingSong={playingSong} />
        </>
    )
}

export default SongList