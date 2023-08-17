import MovieType from "../../types/movieType";
import SeriesType, {EpisodeType} from "../../types/seriesType";
import {useEffect, useMemo, useState} from "react";
import {LinearProgress} from "@mui/material";
import React from "react";

function TitleProgress(props: {title: MovieType | SeriesType, episode?: EpisodeType}){
    const [progress, _] = useState(localStorage.getItem("playbackProgress") ? JSON.parse(localStorage.getItem("playbackProgress")!) : {})
    const [progressValue, setProgressValue] = useState(0)

    useEffect(() => {
        if(progress[props.title.uuid]){
            if((props.title as SeriesType).episodes && !props.episode){
                const episode = (props.title as SeriesType).episodes.filter(e => progress[props.title.uuid][e.uuid] && progress[props.title.uuid].latestEpisode === e.uuid).pop()!
                if(!episode) return
                setProgressValue(progress[props.title.uuid][episode.uuid] / episode.video_info.format.duration * 100)
            }else{
                if(props.episode){
                    const episode = (props.title as SeriesType).episodes.filter(e => progress[props.title.uuid][e.uuid] && props.episode?.uuid === e.uuid).pop()!
                    episode && setProgressValue(progress[props.title.uuid][episode.uuid] / episode.video_info.format.duration * 100)
                }else{
                    setProgressValue(progress[props.title.uuid] / (props.title as MovieType).video_info.format.duration * 100)
                }
            }
        }
    }, [progress]);

    const lastEpisode = useMemo(() => (
        (props.title as SeriesType).episodes && progress[props.title.uuid] ?
        (props.title as SeriesType).episodes.filter(e => progress[props.title.uuid] && progress[props.title.uuid][e.uuid] && progress[props.title.uuid].latestEpisode === e.uuid).pop()! :
        null
    ), [props.title, progress])
    const episodesWatched = useMemo(() => (
        (props.title as SeriesType).episodes && progress[props.title.uuid] ?
        Object.keys(progress[props.title.uuid])
            .filter(uuid => progress[props.title.uuid][uuid] > ((props.title as SeriesType).episodes.filter(e => e.uuid === uuid).pop()?.video_info.format.duration * 0.9)).length :
        null
    ), [props.title, progress])

    return (
        progressValue > 0 && <>
            <p className="text-muted">
                {(props.title as SeriesType).episodes && !props.episode && (
                    <>
                        {episodesWatched} / {(props.title as SeriesType).episodes.length} episodes watched <br/>
                        Last: {lastEpisode?.title} (Season {lastEpisode?.season}, Episode {lastEpisode?.episode})&nbsp;
                    </>
                )}
                {Math.round(progressValue)}% watched
            </p>
            <LinearProgress variant="determinate" value={progressValue} />
        </>
    )
}

export default TitleProgress;