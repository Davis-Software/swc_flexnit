import React, {useEffect, useState} from "react";
import MovieType from "../../types/movieType";
import TitleEntryType from "../../types/titleEntryType";
import PageLoader from "../PageLoader";
import {TransitionGroup} from "react-transition-group";
import {Box, Button, Chip, Fade, Skeleton, Typography, useTheme} from "@mui/material";
import SwcModal from "../SwcModal";
import {SwcFab, SwcFabContainer} from "../SwcFab";
import {navigateTo} from "../../utils/navigation";
import TitleProgress, {InfoCallbackType} from "../other/TitleProgress";
import {handleSyncUpload} from "../../utils/syncControls";
import {useIsAdmin} from "../../contexts/showAdminContext";
import {selectStreamingMode} from "../../utils/streaming";

const EditMovie = React.lazy(() => import("./EditMovie"));

interface MovieInfoDisplayProps{
    movie: MovieType;
    resetMovie: () => void;
    setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
}
function MovieInfoDisplay(props: MovieInfoDisplayProps){
    const isAdmin = useIsAdmin()
    const [progressInfo, setProgressInfo] = useState<InfoCallbackType | null>(null)
    const [library, setLibrary] = useState<{[key: string]: any}>(JSON.parse(localStorage.getItem("library") || "{}"))
    const [loading, setLoading] = useState<boolean>(true)
    const theme = useTheme()

    function toggleLibrary(){
        setLibrary(prevState => {
            const newLibrary = {...prevState}
            if(!newLibrary.movie){
                newLibrary.movie = {}
            }
            if(!newLibrary.movie[props.movie.uuid]){
                newLibrary.movie[props.movie.uuid] = {
                    lastWatched: Date.now(),
                    showInLibrary: true
                }
            }else{
                newLibrary.movie[props.movie.uuid].showInLibrary = !newLibrary.movie[props.movie.uuid].showInLibrary
            }
            localStorage.setItem("library", JSON.stringify(newLibrary))
            handleSyncUpload(state => {
                if(!state)alert("Failed to sync library")
            }, false, true)
            return newLibrary
        })
    }

    function handlePlay(){
        navigateTo(`/watch?movie=${props.movie.uuid}&${selectStreamingMode(props.movie)}`)
    }
    function handleDelete(){
        if(confirm("Are you sure you want to delete this movie?")){
            fetch(`/movies/${props.movie.uuid}/delete`, {
                method: "POST"
            })
                .then(res => {
                    if(res.ok){
                        props.resetMovie()
                    }
                })
        }
    }

    return (
        <>
            <Box
                className="content-inner px-lg-5 pt-lg-5"
                style={{
                    backgroundImage: `url(/movies/${props.movie.uuid}?poster)`,
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
                                src={`/movies/${props.movie.uuid}?thumbnail&q=h`}
                                alt={props.movie.title}
                                onLoad={() => setLoading(false)}
                                hidden={loading}
                            />
                            <Box className="m-5 pt-5 w-100 pe-5">
                                <Typography variant="h3" className="text-break text-wrap">{props.movie.title}</Typography>
                                <Box className="d-flex justify-content-between">
                                    <Typography variant="caption">{props.movie.year > "0" && props.movie.year}</Typography>
                                    <Typography variant="caption">{props.movie.tags}</Typography>
                                </Box>
                                <hr />
                                {props.movie.language && <Chip label={props.movie.language} className="me-2" />}
                                <Chip label={
                                    props.movie.subtitles ?
                                        (props.movie.subtitle_language === "" ? "Has subtitles" : "Has " + props.movie.subtitle_language + " subtitles") :
                                        "No subtitles"
                                } className="me-2" />
                                <Chip label={props.movie.is_nsfw ? "NSFW" : "SFW"} color={props.movie.is_nsfw ? "error" : "secondary"} className="me-2" />

                                <br /><br />
                                <TitleProgress title={props.movie} infoCallback={setProgressInfo} />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handlePlay}
                                    className="mt-3"
                                    size="large"
                                >{progressInfo?.progress && progressInfo.progress > 1 ? (
                                    progressInfo.progress < 100 ? "Continue Watching" : "Watch Again"
                                ) : "Play"}</Button>
                            </Box>
                        </Box>
                        <Box className="m-5">
                            {props.movie.description}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <SwcFabContainer>
                <SwcFab
                    color="primary"
                    icon={<i className="material-icons">play_arrow</i>}
                    onClick={handlePlay}
                    tooltip={progressInfo?.progress && progressInfo.progress > 1 ? (
                        progressInfo.progress < 100 ? "Continue Watching" : "Watch Again"
                    ) : "Play"}
                />
                <SwcFab
                    color="secondary"
                    icon={
                        library.movie && library.movie[props.movie.uuid] && library.movie[props.movie.uuid].showInLibrary ?
                            <i className="material-icons">bookmark</i> :
                            <i className="material-icons">bookmark_border</i>
                    }
                    tooltip={
                        library.movie && library.movie[props.movie.uuid] && library.movie[props.movie.uuid].showInLibrary ?
                            "Remove from library" :
                            "Add to library"
                    }
                    onClick={toggleLibrary}
                />

                <SwcFab color="warning" icon={<i className="material-icons">edit</i>} onClick={() => props.setShowEdit(true)} hide={!isAdmin} />
                <SwcFab color="error" icon={<i className="material-icons">delete</i>} onClick={handleDelete} hide={!isAdmin} />
            </SwcFabContainer>
        </>
    )
}

interface MovieInfoProps{
    titleUUID: string;
    setTitle: (title: TitleEntryType | null) => void;
    setSearchResults: (results: (prevState: TitleEntryType[]) => TitleEntryType[]) => void;
}
function MovieInfo(props: MovieInfoProps){
    const [loading, setLoading] = React.useState<boolean>(true);
    const [movie, setMovie] = React.useState<MovieType | null>(null);
    const [showEdit, setShowEdit] = React.useState<boolean>(false);

    useEffect(() => {
        setLoading(true)
        fetch(`/movies/${props.titleUUID}`)
            .then(res => res.json())
            .then(data => {
                setMovie(data)
                setLoading(false)
            })
    }, [props.titleUUID])

    function handleDeleted(){
        props.setTitle(null)
        props.setSearchResults(prevState => prevState.filter(title => title.uuid !== props.titleUUID))
    }

    return !loading && movie !== null ? (
        <>
            <TransitionGroup>
                <Fade>
                    <Box>
                        <MovieInfoDisplay setShowEdit={setShowEdit} movie={movie} resetMovie={handleDeleted} />
                    </Box>
                </Fade>
            </TransitionGroup>
            <SwcModal show={showEdit} onHide={() => {}} width="95%">
                <React.Suspense fallback={<PageLoader />}>
                    <EditMovie movie={movie} setMovie={setMovie} setShowEdit={setShowEdit} />
                </React.Suspense>
            </SwcModal>
        </>
    ) : <PageLoader />
}

export default MovieInfo;