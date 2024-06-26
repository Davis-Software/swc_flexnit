import React, {useEffect, useMemo, useState} from "react";
import SeriesType, {EpisodeType} from "../../types/seriesType";
import TitleEntryType from "../../types/titleEntryType";
import PageLoader from "../PageLoader";
import {TransitionGroup} from "react-transition-group";
import {
    Box,
    Button,
    Chip,
    Collapse,
    Fade,
    List,
    ListItemButton,
    Skeleton,
    Typography,
    useTheme
} from "@mui/material";
import SwcModal from "../SwcModal";
import {SwcFab, SwcFabContainer} from "../SwcFab";
import {navigateTo} from "../../utils/navigation";
import TitleProgress, {InfoCallbackType} from "../other/TitleProgress";
import {handleSyncUpload} from "../../utils/syncControls";
import {hasNSFWPermission} from "../../utils/permissionChecks";
import {useIsAdmin} from "../../contexts/showAdminContext";
import {selectStreamingMode} from "../../utils/streaming";

const EditSeries = React.lazy(() => import("./EditSeries"));

interface EpisodeListProps{
    series: SeriesType;
    season: number;
    handlePlayEpisode: (episode: EpisodeType) => void;
    selectedEpisode?: EpisodeType;
}
function EpisodeList(props: EpisodeListProps){
    const [open, setOpen] = React.useState<boolean>(false);
    const listRef = React.useRef<HTMLUListElement>(null);

    useEffect(() => {
        const episodeInSeason = props.series.episodes.filter(episode => episode.uuid === props.selectedEpisode?.uuid).pop()
        if(props.selectedEpisode?.uuid === episodeInSeason?.uuid && props.season + 1 === episodeInSeason?.season){
            setOpen(true)
            setTimeout(() => {
                if(!listRef.current) return
                listRef.current.querySelector(".active")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                })
            }, 500)
        }
    }, [props.selectedEpisode])

    return (
        <>
            <ListItemButton onClick={() => setOpen(v => !v)}>
                <Typography variant="h5">Season {props.season + 1}</Typography>
            </ListItemButton>
            <Collapse in={open}>
                <List className="ms-4" ref={listRef}>
                    {props.series.episodes.sort((a, b) => a.episode - b.episode)
                        .filter(episode => episode.season === props.season + 1).map((episode, i) => (
                        <ListItemButton
                            key={i}
                            selected={props.selectedEpisode?.uuid === episode.uuid}
                            onClick={() => props.handlePlayEpisode(episode)}
                            className="d-flex flex-column align-items-start"
                            disabled={
                                (episode.is_nsfw && !hasNSFWPermission()) ||
                                !episode.video_file
                            }
                        >
                            <Box className="d-flex justify-content-between w-100">
                                <Typography variant="h5">{episode.episode} - {episode.title}</Typography>
                                <Box>
                                    {!episode.video_file && <Chip size="small" label="No File" color="error" className="ms-3" />}
                                    <Chip size="small" label={episode.is_nsfw ? "NSFW" : "SFW"} color={episode.is_nsfw ? "warning" : "secondary"} className="ms-3" />
                                </Box>
                            </Box>
                            <Box className="w-100">
                                <TitleProgress title={props.series} episode={episode} />
                                <Typography className="pt-1 ps-2">{episode.description}</Typography>
                            </Box>
                        </ListItemButton>
                    ))}
                </List>
            </Collapse>
        </>
    )
}

interface SeriesInfoDisplayProps{
    series: SeriesType;
    resetSeries: () => void;
    setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
}
function SeriesInfoDisplay(props: SeriesInfoDisplayProps){
    const isAdmin = useIsAdmin()
    const [showEpisodes, setShowEpisodes] = React.useState<boolean>(false);
    const [progressInfo, setProgressInfo] = useState<InfoCallbackType | null>(null)
    const [library, setLibrary] = useState<{[key: string]: any}>(JSON.parse(localStorage.getItem("library") || "{}"))
    const [loading, setLoading] = useState<boolean>(true)
    const theme = useTheme()

    const nsfwEpisodes = useMemo(
        () => props.series.episodes.filter(episode => episode.is_nsfw),
        [props.series.episodes]
    )

    function toggleLibrary(){
        setLibrary(prevState => {
            const newLibrary = {...prevState}
            if(!newLibrary.series){
                newLibrary.series = {}
            }
            if(!newLibrary.series[props.series.uuid]){
                newLibrary.series[props.series.uuid] = {
                    lastWatched: Date.now(),
                    showInLibrary: true
                }
            }else{
                newLibrary.series[props.series.uuid].showInLibrary = !newLibrary.series[props.series.uuid].showInLibrary
            }
            localStorage.setItem("library", JSON.stringify(newLibrary))
            handleSyncUpload(state => {
                if(!state)alert("Failed to sync library")
            }, false, true)
            return newLibrary
        })
    }

    function handlePlay(){
        if(progressInfo?.lastEpisode){
            handlePlayEpisode(progressInfo.lastEpisode)
        }else{
            handlePlayEpisode(props.series.episodes.sort((a, b) => a.episode - b.episode)[0])
        }
    }
    function handlePlayEpisode(episode: EpisodeType){
        navigateTo(`/watch?series=${props.series.uuid}&episode=${episode.uuid}&${selectStreamingMode(episode)}`)
    }
    function handleDelete(){
        if(confirm("Are you sure you want to delete this series?")){
            fetch(`/series/${props.series.uuid}/delete`, {
                method: "POST"
            })
                .then(res => {
                    if(res.ok){
                        props.resetSeries()
                    }
                })
        }
    }

    return (
        <>
            <Box
                className="content-inner px-lg-5 pt-lg-5"
                style={{
                    backgroundImage: `url(/series/${props.series.uuid}?poster)`,
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}
            >
                <Box className="content-info d-lg-flex d-block">
                    <Box className={`d-flex flex-column rounded-top theme-${theme.palette.mode}`}>
                        <Box className="info-inner d-flex flex-column flex-lg-row">
                            {loading && <Skeleton variant="rectangular" sx={{minWidth: "300px", minHeight: "450px"}} className="m-5" animation="wave" />}
                            <img
                                className="m-5 rounded-1"
                                src={`/series/${props.series.uuid}?thumbnail&q=h`}
                                alt={props.series.title}
                                onLoad={() => setLoading(false)}
                                hidden={loading}
                            />
                            <Box className="m-5 pt-5 w-100 pe-5">
                                <Typography variant="h3" className="text-break text-wrap">{props.series.title}</Typography>
                                <Box className="d-flex justify-content-between">
                                    <Typography variant="caption">{props.series.year > "0" && props.series.year}</Typography>
                                    <Typography variant="caption">{props.series.tags}</Typography>
                                </Box>
                                <hr/>
                                {props.series.language && <Chip label={props.series.language} className="me-2" />}
                                <Chip label={`${props.series.season_count} Season${props.series.season_count > 1 ? "s" : ""}`} className="me-2" />
                                <Chip label={props.series.is_nsfw ? "NSFW" : (
                                    nsfwEpisodes.length > 0 ? `${nsfwEpisodes.length} NSFW Episode${nsfwEpisodes.length > 1 ? "s" : ""}` : "SFW"
                                )} color={props.series.is_nsfw ? "error" : (
                                    nsfwEpisodes.length > 0 ? "warning" : "secondary"
                                )} className="me-2" />

                                <br /><br />
                                <TitleProgress title={props.series} infoCallback={setProgressInfo} />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handlePlay}
                                    className="mt-3"
                                    size="large"
                                >{progressInfo?.lastEpisode ? "Continue Watching" : "Play"}</Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setShowEpisodes(true)}
                                    className="mt-3 ms-lg-3"
                                    size="large"
                                >Show Episodes</Button>
                            </Box>
                        </Box>
                        <Box className="m-5">
                            {props.series.description}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <SwcFabContainer>
                <SwcFab
                    color="primary"
                    icon={<i className="material-icons">play_arrow</i>}
                    onClick={handlePlay}
                    tooltip={progressInfo?.progress ? "Continue Watching" : "Play"}
                />
                <SwcFab
                    color="secondary"
                    icon={
                        library.series && library.series[props.series.uuid] && library.series[props.series.uuid].showInLibrary ?
                            <i className="material-icons">bookmark</i> :
                            <i className="material-icons">bookmark_border</i>
                    }
                    tooltip={
                        library.series && library.series[props.series.uuid] && library.series[props.series.uuid].showInLibrary ?
                            "Remove from library" :
                            "Add to library"
                    }
                    onClick={toggleLibrary}
                />

                <SwcFab color="warning" icon={<i className="material-icons">edit</i>} onClick={() => props.setShowEdit(true)} hide={!isAdmin} />
                <SwcFab color="error" icon={<i className="material-icons">delete</i>} onClick={handleDelete} hide={!isAdmin} />
            </SwcFabContainer>

            <SwcModal show={showEpisodes} onHide={() => {setShowEpisodes(false)}}>
                <List>
                    {[...Array(props.series.season_count)].map((_, season) => (
                        <EpisodeList
                            key={season}
                            series={props.series}
                            season={season}
                            handlePlayEpisode={handlePlayEpisode}
                            selectedEpisode={progressInfo?.lastEpisode}
                        />
                    ))}
                </List>
            </SwcModal>
        </>
    )
}

interface SeriesInfoProps{
    titleUUID: string;
    setTitle: (title: TitleEntryType | null) => void;
    setSearchResults: (results: (prevState: TitleEntryType[]) => TitleEntryType[]) => void;
}
function SeriesInfo(props: SeriesInfoProps){
    const [loading, setLoading] = React.useState<boolean>(true);
    const [series, setSeries] = React.useState<SeriesType | null>(null);
    const [showEdit, setShowEdit] = React.useState<boolean>(false);

    useEffect(() => {
        setLoading(true)
        fetch(`/series/${props.titleUUID}`)
            .then(res => res.json())
            .then(data => {
                setSeries(data)
                setLoading(false)
            })
    }, [props.titleUUID])

    function handleDeleted(){
        props.setTitle(null)
        props.setSearchResults(prevState => prevState.filter(t => t.uuid !== props.titleUUID))
    }

    return !loading && series !== null ? (
        <>
            <TransitionGroup>
                <Fade>
                    <Box>
                        <SeriesInfoDisplay setShowEdit={setShowEdit} series={series} resetSeries={handleDeleted} />
                    </Box>
                </Fade>
            </TransitionGroup>
            <SwcModal show={showEdit} onHide={() => {}} width="95%">
                <React.Suspense fallback={<PageLoader />}>
                    <EditSeries series={series} setSeries={setSeries} setShowEdit={setShowEdit} />
                </React.Suspense>
            </SwcModal>
        </>
    ) : <PageLoader />
}

export default SeriesInfo;
export {EpisodeList}