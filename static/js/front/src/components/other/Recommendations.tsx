import React, {useEffect, useState} from "react";
import TitleEntryType from "../../types/titleEntryType";
import {Box, Container, Skeleton, Typography, useTheme} from "@mui/material";

interface TitlePreviewProps{
    title: TitleEntryType
    onClick?: () => void
}
function TitlePreview(props: TitlePreviewProps){
    const [loaded, setLoaded] = useState(false)
    const theme = useTheme()

    return (
        <Box
            className="p-0 col-12 col-md-6 col-lg-4 col-xxl-3"
            sx={{
                "&:hover":{
                    cursor: "pointer",
                    transform: "scale(1.01)"
                },
                transition: "transform 0.2s ease-in-out"
            }}
            onClick={props.onClick}
        >
            <Box className="p-2 position-relative w-100 h-100">
                {!loaded && <Skeleton className="h-100" variant="rectangular" animation="wave" />}
                <img
                    alt=""
                    style={{width: "100%", height: "100%", maxHeight: "100%", objectFit: "cover"}}
                    hidden={!loaded}
                    onLoad={() => setLoaded(true)}
                    src={`/${props.title.type === "movie" ? "movies" : "series"}/${props.title.uuid}?thumbnail&q=h`}
                    // make sure the image is loaded after the page is loaded
                    // @ts-ignore
                    fetchpriority="low"
                    className="rounded-1"
                />
                <Box
                    className="p-3 position-absolute top-0 start-0 text-break w-100 h-100"
                    sx={{
                        "&:hover": {
                            opacity: 1
                        },
                        transition: "opacity 0.2s ease-in-out",
                        backgroundColor: theme.palette.mode === "dark" ? "rgba(35,35,35, .6)" : "rgba(255,255,255, .6)",
                        opacity: 0
                    }}
                >
                    <Box className="fw-bold mb-2">{props.title.title}</Box>
                    <Typography variant="caption">{props.title.tags} - {props.title.score! * 100}% match</Typography>
                    {props.title.description && (
                        <p className="mt-1">{props.title.description?.length > 100 ? props.title.description?.slice(0, 200) + "..." : props.title.description}</p>
                    )}
                </Box>
            </Box>
        </Box>
    )
}
function TitlePreviewLoader({count}: {count: number}){
    return (
        Array.from(new Array(count)).map((_, i) => (
            <Box className="p-2 col-12 col-md-6 col-lg-4 col-xxl-3" sx={{height: 280}} key={i}>
                <Skeleton className="h-100" variant="rectangular" animation="wave" />
            </Box>
        ))
    )
}

interface RecommendedProps {
    setSelectedTitle?: (title: TitleEntryType) => void
    className?: string
}
function Recommendations(props: RecommendedProps){
    const [loading, setLoading] = useState(true)
    const [recommendedMovies, setRecommendedMovies] = useState<TitleEntryType[]>([])
    const [recommendedSeries, setRecommendedSeries] = useState<TitleEntryType[]>([])

    useEffect(() => {
        const abortController = new AbortController()

        fetch(`/taste_profile?limit=4`, {
            signal: abortController.signal
        })
            .then(res => res.json())
            .then((data) => {
                setRecommendedMovies(data.recommendations.movies)
                setRecommendedSeries(data.recommendations.series)
                setLoading(false)
            })

        return () => {
            abortController.abort()
        }
    }, []);

    return (
        <Container  className={props.className || "pt-5 p-3"}>
            <h3 className="text-center">Recommended</h3>
            <hr/>
            {(recommendedMovies.length > 0 || loading) && (
                <>
                    <h4 className="text-center">Movies</h4>
                    <div className="row m-0">
                    {loading ? <TitlePreviewLoader count={4}/> : (
                        recommendedMovies.map((title, i) => (
                            <TitlePreview
                                key={i}
                                title={title}
                                onClick={() => {
                                    props.setSelectedTitle && props.setSelectedTitle(title)
                                }}
                            />
                        ))
                    )}
                    </div>
                </>
            )}
            {(recommendedSeries.length > 0 || loading) && (
                <>
                    <h4 className="text-center">Series</h4>
                    <div className="row m-0">
                    {loading ? <TitlePreviewLoader count={4}/> : (
                        recommendedSeries.map((title, i) => (
                            <TitlePreview
                                key={i}
                                title={title}
                                onClick={() => {
                                    props.setSelectedTitle && props.setSelectedTitle(title)
                                }}
                            />
                        ))
                    )}
                    </div>
                </>
            )}
        </Container>
    )
}

export default Recommendations