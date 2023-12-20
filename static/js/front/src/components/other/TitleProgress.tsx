import MovieType from "../../types/movieType";
import SeriesType, {EpisodeType} from "../../types/seriesType";
import {useEffect, useMemo, useState} from "react";
import {LinearProgress, Typography} from "@mui/material";
import React from "react";

interface InfoCallbackType{
    title: MovieType | SeriesType,
    progress: number
    lastEpisode?: EpisodeType
    episodesWatched?: number
    seriesWatched?: number
}
interface TitleProgressProps {
    title: MovieType | SeriesType,
    episode?: EpisodeType
    hideProgress?: boolean
    infoCallback?: (info: InfoCallbackType) => void
}
function TitleProgress(props: TitleProgressProps){
    const [progress, _] = useState(JSON.parse(localStorage.getItem("playbackProgress") || "{}"))
    const [progressValue, setProgressValue] = useState(0)

    useEffect(() => {
        if(progress[props.title.uuid]){
            function episodeProgress(episode: EpisodeType){
                return progress[props.title.uuid][episode.uuid] > (episode.video_info.format?.duration - (props.title as SeriesType).endcard_length) ? 100 : (
                    progress[props.title.uuid][episode.uuid] / episode.video_info.format?.duration * 100
                )
            }
            if((props.title as SeriesType).episodes && !props.episode){
                const episode = (props.title as SeriesType).episodes.filter(e => progress[props.title.uuid][e.uuid] && progress[props.title.uuid].latestEpisode === e.uuid).pop()!
                if(!episode) return
                setProgressValue(episodeProgress(episode))
            }else{
                if(props.episode){
                    const episode = (props.title as SeriesType).episodes.filter(e => progress[props.title.uuid][e.uuid] && props.episode?.uuid === e.uuid).pop()!
                    episode && setProgressValue(episodeProgress(episode))
                }else{
                    setProgressValue(progress[props.title.uuid] > (props.title as MovieType).video_info.format?.duration - 180 ? 100 : (
                        progress[props.title.uuid] / (props.title as MovieType).video_info.format?.duration * 100
                    ))
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

    useEffect(() => {
        props.infoCallback && props.infoCallback({
            title: props.title,
            progress: progressValue,
            lastEpisode: lastEpisode!,
            episodesWatched: episodesWatched!,
            seriesWatched: episodesWatched !== null ? (episodesWatched / (props.title as SeriesType).episodes.length * 100) : undefined
        })
    }, [props.title, props.episode, progressValue, lastEpisode, episodesWatched])

    return (
        progressValue > 1 && <>
            <Typography variant="caption" paragraph>
                {(props.title as SeriesType).episodes && !props.episode && (
                    <>
                        {episodesWatched} / {(props.title as SeriesType).episodes.length} episodes watched <br/>
                        Last: {lastEpisode?.title} (Season {lastEpisode?.season}, Episode {lastEpisode?.episode})&nbsp;
                    </>
                )}
                {Math.round(progressValue)}% watched
            </Typography>
            {!props.hideProgress && (
                <LinearProgress variant="determinate" value={progressValue} />
            )}
        </>
    )
}

export default TitleProgress;
export type {InfoCallbackType}