import React, {useEffect, useMemo, useState} from "react";
import TitleEntryType from "../types/titleEntryType";
import TitleProgress, {InfoCallbackType} from "../components/other/TitleProgress";
import MovieType from "../types/movieType";
import SeriesType, {EpisodeType} from "../types/seriesType";
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    LinearProgress,
    Paper,
    Skeleton,
    Tooltip,
    Typography,
    Zoom
} from "@mui/material";
import {TransitionGroup} from "react-transition-group";
import {navigateTo} from "../utils/navigation";
import {handleSyncUpload} from "../utils/syncControls";
import {selectStreamingMode} from "../utils/streaming";
import SwcLoader from "../components/SwcLoader";
import fetchUserLibrary from "../fetcher/fetchUserLibrary";

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
            navigateTo(`/watch?movie=${movie.uuid}&${selectStreamingMode(movie)}`)
        }
        function handlePlayEpisode(series: SeriesType, episode: EpisodeType){
            navigateTo(`/watch?series=${series.uuid}&episode=${episode.uuid}&${selectStreamingMode(episode)}`)
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
            // <Card className="position-relative" onClick={handleShowInfo}>
            <Card className="position-relative">
                {!imageLoaded && <Skeleton animation="wave" variant="rectangular" width="100%" height={300} />}
                <img
                    src={`/${title.type === "movie" ? "movies" : "series"}/${title.uuid}?thumbnail&q=h`}
                    alt={title.title}
                    className="card-img-top"
                    onLoad={() => setImageLoaded(true)}
                    hidden={!imageLoaded}
                />
                <LinearProgress variant="determinate" value={titleProgressInfo?.seriesWatched !== undefined ? titleProgressInfo?.seriesWatched : (titleProgressInfo?.progress || 0)} />
                <CardContent>
                    <h5 className="card-title">{title.title}</h5>
                    {actualTitle ?
                        <TitleProgress title={actualTitle} infoCallback={setTitleProgressInfo} hideProgress /> :
                        <Skeleton animation="wave" variant="text" width="100%" height={30} />
                    }
                </CardContent>

                <div className="position-absolute top-0 end-0 p-2" style={{borderBottomLeftRadius: "5px"}}>
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
            </Card>
        )
    }

    return (
        <div className="row m-0">
            <TransitionGroup component={null} enter={false} exit>
                {props.titles
                    .filter(title => props.library[title.type] && props.library[title.type][title.uuid] && props.library[title.type][title.uuid].showInLibrary)
                        .map((title, i) => (
                        <Zoom key={i}>
                            <div className="col-xxl-2 col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-3">
                                <InnerTitleDisplay title={title} />
                            </div>
                        </Zoom>
                    ))
                }
            </TransitionGroup>
        </div>
    )
}

function UserLibrary(){
    const [loading, setLoading] = useState(true)
    const [library, setLibrary] = useState<{[key: string]: any}>(JSON.parse(localStorage.getItem("library") || "{}"))
    const [libraryTitles, setLibraryTitles] = React.useState<TitleEntryType[]>([]);

    useEffect(() => {
        fetchUserLibrary(library).then(titles => {
            setLibraryTitles(titles)
            setLoading(false)
        })
    }, [])

    return (
        <div className="mt-3">
            <Paper elevation={4} className="container d-flex justify-content-center py-3 mb-3">
                <h4>My Library</h4>
            </Paper>
            <TitleDisplay titles={libraryTitles} library={library} setLibrary={setLibrary} />
            {libraryTitles.length === 0 && (loading ? (
                <div className="d-flex justify-content-center">
                    <SwcLoader/>
                </div>
            ) : (
                <div className="d-flex justify-content-center">
                    <Typography>No titles in library</Typography>
                </div>
            ))}
        </div>
    )
}

export default UserLibrary;