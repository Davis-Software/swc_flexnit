import React, {useEffect, useState} from "react";
import SeriesType, {EpisodeType} from "../../types/seriesType";
import TitleEntryType from "../../types/titleEntryType";
import PageLoader from "../PageLoader";
import {TransitionGroup} from "react-transition-group";
import {Button, Chip, Collapse, Fade} from "@mui/material";
import SwcModal from "../SwcModal";
import {SwcFab, SwcFabContainer} from "../SwcFab";
import {isAdmin} from "../../utils/constants";
import {navigateTo} from "../../utils/navigation";
import TitleProgress, {InfoCallbackType} from "../other/TitleProgress";

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
            <li className="list-group-item pointer-event" onClick={() => setOpen(v => !v)}>
                <h4>Season {props.season + 1}</h4>
            </li>
            <Collapse in={open}>
                <ul className="list-group ms-4" ref={listRef}>
                    {props.series.episodes.sort((a, b) => a.episode - b.episode)
                        .filter(episode => episode.season === props.season + 1).map((episode, i) => (
                        <li key={i} className={`list-group-item ${props.selectedEpisode?.uuid === episode.uuid ? "active" : ""}`} onClick={() => props.handlePlayEpisode(episode)}>
                            <h5>{episode.episode} - {episode.title}</h5>
                            <TitleProgress title={props.series} episode={episode} />
                            <p>{episode.description}</p>
                        </li>
                    ))}
                </ul>
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
    const [showEpisodes, setShowEpisodes] = React.useState<boolean>(false);
    const [progressInfo, setProgressInfo] = useState<InfoCallbackType | null>(null)
    const [library, setLibrary] = useState<{[key: string]: any}>(JSON.parse(localStorage.getItem("library") || "{}"))

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
        navigateTo(`/watch?series=${props.series.uuid}&episode=${episode.uuid}${episode.video_hls ? "&hls" : ""}`)
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
            <div
                className="content-inner px-lg-5 pt-lg-5"
                style={{
                    backgroundImage: `url(/series/${props.series.uuid}?poster)`,
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}
            >
                <div className="content-info rounded-top rounded-3 d-lg-flex d-block">
                    <div className="d-flex flex-column">
                        <div className="info-inner d-flex flex-column flex-lg-row">
                            <img className="m-5" src={`/series/${props.series.uuid}?thumbnail`} alt={props.series.title} />
                            <div className="m-5 pt-5 w-100 pe-5">
                                <h1>{props.series.title}</h1>
                                <p className="text-muted">{props.series.year > 0 && props.series.year}</p>
                                <hr />
                                {props.series.language && <Chip label={props.series.language} className="me-2" />}
                                <Chip label={`${props.series.season_count} Season${props.series.season_count > 1 ? "s" : ""}`} className="me-2" />
                                <Chip label={props.series.is_nsfw ? "NSFW" : "SFW"} color={props.series.is_nsfw ? "warning" : "secondary"} className="me-2" />

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
                            </div>
                        </div>
                        <div className="m-5">
                            {props.series.description}
                        </div>
                    </div>
                </div>
            </div>

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
                <ul className="list-group">
                    {[...Array(props.series.season_count)].map((_, season) => (
                        <EpisodeList
                            key={season}
                            series={props.series}
                            season={season}
                            handlePlayEpisode={handlePlayEpisode}
                            selectedEpisode={progressInfo?.lastEpisode}
                        />
                    ))}
                </ul>
            </SwcModal>
        </>
    )
}

interface SeriesInfoProps{
    title: TitleEntryType;
    setTitle: (title: TitleEntryType | null) => void;
    setSearchResults: (results: (prevState: TitleEntryType[]) => TitleEntryType[]) => void;
}
function SeriesInfo(props: SeriesInfoProps){
    const [loading, setLoading] = React.useState<boolean>(true);
    const [series, setSeries] = React.useState<SeriesType | null>(null);
    const [showEdit, setShowEdit] = React.useState<boolean>(false);

    useEffect(() => {
        setLoading(true)
        fetch(`/series/${props.title.uuid}`)
            .then(res => res.json())
            .then(data => {
                setSeries(data)
                setLoading(false)
            })
    }, [props.title.uuid])

    function handleDeleted(){
        props.setTitle(null)
        props.setSearchResults(prevState => prevState.filter(t => t.uuid !== props.title.uuid))
    }

    return !loading && series !== null ? (
        <>
            <TransitionGroup>
                <Fade>
                    <div>
                        <SeriesInfoDisplay setShowEdit={setShowEdit} series={series} resetSeries={handleDeleted} />
                    </div>
                </Fade>
            </TransitionGroup>
            <SwcModal show={showEdit} onHide={() => {}}>
                <React.Suspense fallback={<PageLoader />}>
                    <EditSeries series={series} setSeries={setSeries} setShowEdit={setShowEdit} />
                </React.Suspense>
            </SwcModal>
        </>
    ) : <PageLoader />
}

export default SeriesInfo;
export {EpisodeList}