import {TableComponents, TableVirtuoso} from "react-virtuoso";
import {
    Button, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip, Typography
} from "@mui/material";
import React, {useCallback} from "react";
import SongType from "../../types/songType";
import {getTimeString} from "../../utils/FormatDate";
import {useIsAdmin} from "../../contexts/showAdminContext";

interface RowContentProps {
    song: SongType,
    setSelectedSong: (song: SongType) => void
    deleteSong: (song: SongType) => void
    playSong: (song: SongType) => void
    playingSong: SongType | null
    setSearch: (search: string) => void
    queueSong: (song: SongType) => void
    unQueueSong: (song: SongType) => void
    queue: SongType[]
    likeUnLikeSong: (song: SongType) => void
    isLiked: boolean
    isAdmin: boolean
}
function rowContent(_index: number, props: RowContentProps){
    const isInQueue = props.queue.includes(props.song)

    return (
        <>
            <TableCell padding="checkbox">
                <IconButton color={props.isLiked ? "error" : "primary"} onClick={() => props.likeUnLikeSong(props.song)}>
                    <i className="material-icons">{props.isLiked ? "favorite" : "favorite_border"}</i>
                </IconButton>
            </TableCell>
            <TableCell padding="checkbox">
                <img src={`/music/${props.song.uuid}?thumbnail`} alt="" width={40} height={40} style={{objectFit: "cover"}} />
            </TableCell>
            <TableCell
                onClick={() => {
                    if(props.queue.at(0)?.uuid === props.song.uuid) props.unQueueSong(props.song)
                    props.playSong(props.song)
                }} sx={{cursor: "pointer"}}
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
            {props.isAdmin && (
                <TableCell align="right">
                    <Button variant="outlined" size="small" color="warning" onClick={() => props.setSelectedSong(props.song)}>Edit</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => props.deleteSong(props.song)}>Delete</Button>
                </TableCell>
            )}
            <TableCell padding="checkbox">
                <Tooltip title={(isInQueue ? "Remove from" : "Add to") + " Queue"} placement="left">
                    <IconButton onClick={() => {
                        isInQueue ? props.unQueueSong(props.song) : props.queueSong(props.song)
                    }}>
                        <i className="material-icons">{isInQueue ? "remove" : "add"}</i>
                    </IconButton>
                </Tooltip>
            </TableCell>
        </>
    )
}

interface FixedHeaderContentProps {
    search: string
    setSearch: (search: string) => void
    albums: string[]
}
function FixedHeaderContent(props: FixedHeaderContentProps){
    const isAdmin = useIsAdmin()

    function handleSearchChange(e: SelectChangeEvent){
        props.setSearch(e.target.value !== "" ? `album:${e.target.value}` : "")
    }

    return (
        <TableRow sx={{backgroundColor: "background.paper"}}>
            <TableCell padding="checkbox"></TableCell>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>Title</TableCell>
            <TableCell width="25%" padding="none">
                <FormControl variant="standard" size="small" fullWidth>
                    <InputLabel>Album</InputLabel>
                    <Select
                        value={props.search.startsWith("album:") ? props.search.substring("album:".length) : ""}
                        onChange={handleSearchChange}
                    >
                        <MenuItem value="">All</MenuItem>
                        {props.albums.map(album => (
                            <MenuItem key={album} value={album}>{album}</MenuItem>
                        ))}
                    </Select>

                </FormControl>
            </TableCell>
            <TableCell align="right" width="30px">Duration</TableCell>
            {isAdmin && (
                <TableCell align="right" width="80px">Operations</TableCell>
            )}
            <TableCell padding="checkbox"></TableCell>
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
    // @ts-ignore
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
    queue: SongType[]
    setQueue: (queue: (prev: SongType[]) => SongType[]) => void
    queuePage: boolean
    playingSong: SongType | null
    setPlayingSong: (song: SongType | null) => void
    likeUnLikeSong: (song: SongType) => void
    likedSongs: SongType[]
}
function SongList(props: SongListProps){
    const isAdmin = useIsAdmin()
    const [search, setSearch] = React.useState("")

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
    function queueSong(song: SongType){
        props.setQueue(prev => [...prev, song])
    }
    function unQueueSong(song: SongType){
        props.setQueue(prev => prev.filter(s => s.uuid !== song.uuid))
    }

    const LoadedFixedHeaderContent = useCallback(() => (
        <FixedHeaderContent
            search={search}
            setSearch={setSearch}
            albums={props.songs.map(s => s.album).filter((v, i, a) => a.indexOf(v) === i)}
        />
    ), [search, setSearch, props.songs])

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
                fixedHeaderContent={LoadedFixedHeaderContent}
                components={VirtuosoTableComponents}
                itemContent={rowContent}
                data={props.songs.filter(filterFunc).map(song =>
                    ({
                        song,
                        playingSong: props.playingSong,
                        queueSong,
                        unQueueSong,
                        setSearch,
                        setSelectedSong: props.setSelectedSong,
                        deleteSong: props.deleteSong,
                        playSong: props.setPlayingSong,
                        queuePage: props.queuePage,
                        queue: props.queue,
                        likeUnLikeSong: props.likeUnLikeSong,
                        isLiked: props.likedSongs.includes(song),
                        isAdmin
                    })
                )}
                style={{
                    position: "absolute",
                    height: "calc(100% - 2*64px - 32px)",
                }}
            />
        </>
    )
}

export default SongList