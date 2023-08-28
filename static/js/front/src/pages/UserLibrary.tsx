import React, {useEffect, useMemo, useState} from "react";
import TitleEntryType from "../types/titleEntryType";
import TitleProgress, {InfoCallbackType} from "../components/other/TitleProgress";
import MovieType from "../types/movieType";
import SeriesType, {EpisodeType} from "../types/seriesType";
import {Button, LinearProgress, Skeleton, Tooltip, Zoom} from "@mui/material";
import {TransitionGroup} from "react-transition-group";
import {navigateTo} from "../utils/navigation";
import {handleSyncUpload} from "../components/SyncPlaybackProgress";

interface TitleDisplayProps {
    titles: TitleEntryType[]
    library: {[key: string]: any}
    setLibrary: React.Dispatch<React.SetStateAction<{[key: string]: any}>>
}
function TitleDisplay(props: TitleDisplayProps){
    function InnerTitleDisplay({title}: {title: TitleEntryType}){
        const [actualTitle, setActualTitle] = React.useState<MovieType | SeriesType | null>(null);
        const [titleProgressInfo, setTitleProgressInfo] = React.useState<InfoCallbackType | null>(null);
        const [imageLoaded, setImageLoaded] = React.useState(false);

        function removeFromLibrary(e: React.MouseEvent<HTMLButtonElement>){
            e.stopPropagation();
            props.setLibrary(prev => {
                let newLibrary = {...prev};
                newLibrary[title.type][title.uuid].showInLibrary = false;

                localStorage.setItem("library", JSON.stringify(newLibrary));
                handleSyncUpload(state => {
                    if(!state)alert("Failed to sync library")
                }, false, true)

                return newLibrary;
            })
        }
        function playTitle(e: React.MouseEvent<HTMLButtonElement>){
            e.stopPropagation();
            if(title.type === "movie"){
                handlePlayMovie(actualTitle as MovieType);
            }else{
                handlePlayEpisode(actualTitle as SeriesType, titleProgressInfo?.lastEpisode ||
                    (actualTitle as SeriesType).episodes.sort((a, b) => a.episode - b.episode)[0]);
            }
        }
        function handlePlayMovie(movie: MovieType){
            navigateTo(`/watch?movie=${movie.uuid}${movie.video_hls ? "&hls" : ""}`)
        }
        function handlePlayEpisode(series: SeriesType, episode: EpisodeType){
            navigateTo(`/watch?series=${series.uuid}&episode=${episode.uuid}${episode.video_hls ? "&hls" : ""}`)
        }

        function handleShowInfo(){
            navigateTo(`/info?mode=${title.type}&uuid=${title.uuid}`)
        }

        useEffect(() => {
            setImageLoaded(false);
            fetch(`/${title.type === "movie" ? "movies" : "series"}/${title.uuid}`)
                .then(res => res.json())
                .then((title: MovieType | SeriesType) => {
                    setActualTitle(title);
                })
        }, [title])

        return (
            <div className="card position-relative" onClick={handleShowInfo}>
                {!imageLoaded && <Skeleton animation="wave" variant="rectangular" width="100%" height={180} />}
                <img
                    src={`/${title.type === "movie" ? "movies" : "series"}/${title.uuid}?poster`}
                    className="card-img-top"
                    alt={title.title}
                    onLoad={() => setImageLoaded(true)}
                    hidden={!imageLoaded}
                />
                <LinearProgress variant="determinate" value={titleProgressInfo?.seriesWatched !== undefined ? titleProgressInfo?.seriesWatched : (titleProgressInfo?.progress || 0)} />
                <div className="card-body">
                    <h5 className="card-title">{title.title}</h5>
                    {actualTitle ?
                        <TitleProgress title={actualTitle} infoCallback={setTitleProgressInfo} hideProgress /> :
                        <Skeleton animation="wave" variant="text" width="100%" height={30} />
                    }
                </div>

                <div className="position-absolute top-0 end-0 p-2" style={{backgroundColor: "rgba(0,0,0,.7)", borderBottomLeftRadius: "5px"}}>
                    <Tooltip title={titleProgressInfo?.progress ? "Continue watching" : "Play"}>
                        <Button variant="outlined" color="primary" className="me-2" onClick={playTitle}>
                            <i className="material-icons">play_arrow</i>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Remove from library">
                        <Button variant="outlined" color={"error"} onClick={removeFromLibrary}>
                            <i className="material-icons">delete</i>
                        </Button>
                    </Tooltip>
                </div>
            </div>
        )
    }

    return (
        <div className="row m-0">
            <TransitionGroup component={null}>
                {props.titles
                    .filter(title => props.library[title.type] && props.library[title.type][title.uuid] && props.library[title.type][title.uuid].showInLibrary)
                    .map((title, i) => (
                    <Zoom key={i}>
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-3">
                            <InnerTitleDisplay title={title} />
                        </div>
                    </Zoom>
                ))}
            </TransitionGroup>
        </div>
    )
}

function UserLibrary(){
    const [library, setLibrary] = useState<{[key: string]: any}>(JSON.parse(localStorage.getItem("library") || "{}"))
    const [libraryTitles, setLibraryTitles] = React.useState<TitleEntryType[]>([]);
    const playbackProgress = useMemo(() => (
        JSON.parse(localStorage.getItem("playbackProgress") || "{}")
    ), [])

    useEffect(() => {
        fetch("/search/all")
            .then(res => res.json())
            .then((titles: TitleEntryType[]) => {
                setLibraryTitles(titles.filter(title =>
                    (!!playbackProgress[title.uuid] && !(library[title.type] && library[title.type][title.uuid])) ||
                    (library[title.type] && library[title.type][title.uuid] && library[title.type][title.uuid].showInLibrary)
                ))
            })
    }, [])

    return (
        <div className="mt-3">
            <div className="container d-flex justify-content-center py-3 mb-3">
                <h4>My Library</h4>
            </div>
            <TitleDisplay titles={libraryTitles.filter(title => title.type === "movie")} library={library} setLibrary={setLibrary} />
            <TitleDisplay titles={libraryTitles.filter(title => title.type === "series")}  library={library} setLibrary={setLibrary} />
        </div>
    )
}

export default UserLibrary;