import React, {useEffect} from "react";
import TitleEntryType from "../../types/titleEntryType";
import TitleProgress from "../../components/other/TitleProgress";
import MovieType from "../../types/movieType";
import SeriesType from "../../types/seriesType";
import {Box, Typography, useTheme} from "@mui/material";

interface SmartTVTitlePreviewProps {
    title: TitleEntryType | null
}
function SmartTVTitlePreview(props: SmartTVTitlePreviewProps){
    const [actualTitle, setActualTitle] = React.useState<MovieType | SeriesType | null>(null);
    const theme = useTheme()

    const background = theme.palette.mode === "dark"
        ? "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.8), rgba(0,0,0,0.9))"
        : "linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0.9))";

    useEffect(() => {
        if(!props.title) return;
        fetch(`/${props.title.type === "movie" ? "movies" : "series"}/${props.title.uuid}`)
            .then(res => res.json())
            .then((title: MovieType | SeriesType) => {
                setActualTitle(title);
            })
    }, [props.title])

    return (
        <>
            <Box className="position-fixed start-0 top-0 w-100 h-100" style={{
                zIndex: 1,
                filter: "blur(7px)"
            }}>
                <img
                    src={props.title ? `/${props.title?.type === "movie" ? "movies" : "series"}/${props.title?.uuid}?poster` : undefined}
                    alt={props.title?.title}
                    style={{objectFit: "cover"}}
                    className="w-100 h-100 position-absolute start-0 top-0"
                />
                <Box
                    className="w-100 h-100 position-absolute start-0 top-0"
                    style={{background: background}}
                />
            </Box>
            <Box style={{height: "300px", maxHeight: "50%", zIndex: 100}} className="w-100 position-relative">
                <Box className="position-absolute start-0 top-0 w-100">
                    {props.title ? (
                        <>
                            <Typography variant="h3" className="p-4">{props.title?.title}</Typography>
                            <Box className="ps-5 pe-5 m-3">
                                {actualTitle && <TitleProgress title={actualTitle}/>}
                            </Box>
                            <Box className="ps-5 pe-5 m-3">
                                {props.title?.description}
                            </Box>
                        </>
                    ) : (
                        <Box className="w-100 mt-5 pt-5 d-flex justify-content-center">
                            <img src="/static/img/icon.png" alt=""/>
                        </Box>
                    )}
                </Box>
            </Box>
        </>
    )
}

export default SmartTVTitlePreview;