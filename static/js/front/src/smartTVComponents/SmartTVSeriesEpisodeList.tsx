import React, {useEffect} from "react";
import SeriesType, {EpisodeType} from "../types/seriesType";
import TitleEntryType from "../types/titleEntryType";
import fetchSeries from "../fetcher/fetchSeries";
import {Collapse, List, ListItem, ListItemButton, Typography} from "@mui/material";
import SwcLoader from "../components/SwcLoader";
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";

interface SelectableEpisodeProps {
    e: EpisodeType
    onChoose: (e: EpisodeType) => void
}
function SelectableEpisode(props: SelectableEpisodeProps){
    const {ref, focused} = useFocusable({
        onEnterPress: () => props.onChoose(props.e)
    })

    useEffect(() => {
        if(!focused) return
        ref.current?.scrollIntoView({block: "end"})
    }, [focused]);

    return (
        <ListItemButton ref={ref} selected={focused}>
            <Typography>{props.e.episode}. {props.e.title}</Typography>
        </ListItemButton>
    )
}

interface SmartTVSeriesEpisodeListProps {
    title?: SeriesType | TitleEntryType
    show?: boolean
    className?: string
    onChoose?: (e: EpisodeType) => void
}
function SmartTVSeriesEpisodeList(props: SmartTVSeriesEpisodeListProps){
    const [title, setTitle] = React.useState<SeriesType | null>(
        !!(props.title as TitleEntryType)?.type ? null : props.title as SeriesType
    )

    useEffect(() => {
        if(!props.title || !(props.title as TitleEntryType)?.type) return
        fetchSeries(props.title as TitleEntryType).then(setTitle)
    }, [])

    if(!title) return <SwcLoader />
    return (
        <Collapse in={props.show === undefined || props.show}>
            <List className={props.className}>
                {Array.from(new Array(title.season_count)).map((_, i) => (
                    <ListItem className="d-flex flex-column align-items-start" key={i}>
                        <Typography variant="h6">Season {i + 1}</Typography>
                        <List>
                            {title.episodes.filter((e) => e.season === i + 1).sort((a, b) => a.episode - b.episode)
                                .map((e, i) => (
                                    <SelectableEpisode e={e} onChoose={props.onChoose || (() => {})} key={i} />
                                ))
                            }
                        </List>
                    </ListItem>
                ))}
            </List>
        </Collapse>
    )
}

export default SmartTVSeriesEpisodeList;