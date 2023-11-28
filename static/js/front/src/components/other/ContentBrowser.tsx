import TitleEntryType from "../../types/titleEntryType";
import React, {lazy, useEffect, useState} from "react";
import {Paper, Skeleton, Tab, Tabs} from "@mui/material";

const News = lazy(() => import("./News"))

interface TitlePreviewProps{
    title: TitleEntryType
}
function TitlePreview(props: TitlePreviewProps){
    const [loaded, setLoaded] = useState(false)

    return (
        <div className="col-12 col-md-5 col-xl-4 col-xxl-3 h-100">
            <div className="p-3 h-100">
                {!loaded && <Skeleton className="h-100" variant="rectangular" animation="wave" />}
                <img
                    alt=""
                    style={{width: "100%", height: "100%", maxHeight: "100%", objectFit: "cover"}}
                    hidden={!loaded}
                    onLoad={() => setLoaded(true)}
                    src={`/${props.title.type === "movie" ? "movies" : "series"}/${props.title.uuid}?thumbnail`}
                />
            </div>
        </div>
    )
}

interface TitleBrowserProps{
    titleFilter: "movie" | "series"
}
function TitleBrowser(props: TitleBrowserProps){
    const [page, setPage] = useState<number>(0)
    const [titles, setTitles] = useState<TitleEntryType[]>([])

    useEffect(() => {
        fetch(`/search/${props.titleFilter}?c=8&p=${page}`)
            .then(r => r.json())
            .then(setTitles)
    }, [props.titleFilter, page]);

    return (
        <div className="d-flex flex-row flex-grow-1" style={{overflowX: "auto"}}>
            {titles.map((title, i) => <TitlePreview key={i} title={title} />)}
        </div>
    )
}

interface ContentBrowserProps{
    forceTab?: "browse" | "news"
}
function ContentBrowser(props: ContentBrowserProps){
    const [tab, setTab] = useState<"browse" | "news">(props.forceTab || "browse")

    return (
        <>
            <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth" className="mb-3" hidden={!!props.forceTab}>
                <Tab value="browse" label="Browse" />
                <Tab value="news" label="News" />
            </Tabs>
            {(props.forceTab === undefined || props.forceTab === "news") && (
                <div hidden={tab !== "news"}>
                    <Paper elevation={3} className="rounded-3 p-3 m-4">
                        <h3 className="text-center text-info">No Title selected</h3>
                        <hr/>
                        <span>You can select a title through the sidebar on the left!</span>
                    </Paper>

                    <News/>
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
                            <TitleBrowser titleFilter="movie" />
                        </div>
                        <div className="h-50 d-flex flex-column">
                            <h2>Series</h2>
                            <TitleBrowser titleFilter="series" />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ContentBrowser