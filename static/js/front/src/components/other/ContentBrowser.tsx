import TitleEntryType from "../../types/titleEntryType";
import React, {lazy, useEffect, useState} from "react";
import {Box, Skeleton, Tab, Tabs} from "@mui/material";

const News = lazy(() => import("./News"))

interface TitlePreviewProps{
    title: TitleEntryType
    onClick?: () => void
}
function TitlePreview(props: TitlePreviewProps){
    const [loaded, setLoaded] = useState(false)

    return (
        <Box
            className="col-12 col-md-5 col-xl-4 col-xxl-3 h-100"
            sx={{
                "&:hover":{
                    cursor: "pointer",
                    transform: "scale(1.05)"
                },
                transition: "transform 0.2s ease-in-out"
            }}
            onClick={props.onClick}
        >
            <div className="p-3 h-100">
                {!loaded && <Skeleton className="h-100" variant="rectangular" animation="wave" />}
                <img
                    alt=""
                    style={{width: "100%", height: "100%", maxHeight: "100%", objectFit: "cover"}}
                    hidden={!loaded}
                    onLoad={() => setLoaded(true)}
                    src={`/${props.title.type === "movie" ? "movies" : "series"}/${props.title.uuid}?thumbnail&q=h`}
                />
            </div>
        </Box>
    )
}

interface TitleBrowserProps{
    titleFilter: "movie" | "series"
    setSelectedTitle?: (title: TitleEntryType) => void
}
function TitleBrowser(props: TitleBrowserProps){
    const [page, setPage] = useState<number>(0)
    const [pauseDetection, setPauseDetection] = useState<boolean>(false)
    const [titles, setTitles] = useState<TitleEntryType[]>([])
    const scrollRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/search/${props.titleFilter}?c=8&p=${page}`)
            .then(r => r.json())
            .then((data) => {
                setTitles([...titles, ...data])
                setPauseDetection(false)
            })
    }, [props.titleFilter, page]);

    function updatePage(){
        if(pauseDetection) return
        if(!scrollRef.current) return
        if(Math.abs(scrollRef.current.scrollWidth - scrollRef.current.scrollLeft - scrollRef.current.clientWidth) > 10) return
        setPauseDetection(true)
        setPage(p => p + 1)
    }
    useEffect(() => {
        if(!scrollRef.current) return
        scrollRef.current.addEventListener("scroll", updatePage)
        return () => scrollRef.current?.removeEventListener("scroll", updatePage)
    }, [scrollRef.current])

    return (
        <div
            className="d-flex flex-row flex-grow-1"
            style={{overflowX: "auto", overflowY: "hidden"}}
            ref={scrollRef}
        >
            {titles.map((title, i) => (
                <TitlePreview key={i} title={title} onClick={() => {
                    if(props.setSelectedTitle) props.setSelectedTitle(title)
                }} />
            ))}
        </div>
    )
}

interface ContentBrowserProps{
    forceTab?: "browse" | "news"
    setSelectedTitle?: (title: TitleEntryType) => void
}
function ContentBrowser(props: ContentBrowserProps){
    const [tab, setTab] = useState<"browse" | "news">(
        props.forceTab ||
        sessionStorage.getItem("home-tab") as "browse" | "news" ||
        "browse"
    )

    useEffect(() => {
        if(props.forceTab) return
        sessionStorage.setItem("home-tab", tab)
    }, [tab])

    return (
        <>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" className="mb-3" hidden={!!props.forceTab}>
                <Tab value="browse" label="Browse" />
                <Tab value="news" label="News" />
            </Tabs>
            {(props.forceTab === undefined || props.forceTab === "news") && (
                <div hidden={tab !== "news"}>
                    <News setSelectedTitle={props.setSelectedTitle} count={7} />
                </div>
            )}
            {(props.forceTab === undefined || props.forceTab === "browse") && (
                <div hidden={tab !== "browse"}>
                    <div
                        className="container d-flex flex-column justify-content-evenly"
                        style={{height: `calc(100vh - 64px * ${props.forceTab === undefined ? "2" : "1"})`}}
                    >
                        <div className="h-50 d-flex flex-column">
                            <h2>Movies</h2>
                            <TitleBrowser titleFilter="movie" setSelectedTitle={props.setSelectedTitle} />
                        </div>
                        <div className="h-50 d-flex flex-column">
                            <h2>Series</h2>
                            <TitleBrowser titleFilter="series" setSelectedTitle={props.setSelectedTitle} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ContentBrowser