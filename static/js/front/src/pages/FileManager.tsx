import React, {useEffect, useMemo} from "react";
import PageBase from "./PageBase";
import {Paper, Skeleton, Tab, Tabs} from "@mui/material";
import hrFileSize from "../utils/hrFileSize";
import MovieFileManager from "../components/fileManager/MovieFileManager";
import SeriesFileManager from "../components/fileManager/SeriesFileManager";

const loader =  <Skeleton animation="wave" variant="text" width={100} />

function Overview() {
    const [overviewData, setOverviewData] = React.useState<any>(null)

    useEffect(() => {
        getOverviewData()
    }, [])

    function getOverviewData(force?: boolean){
        if(overviewData && !force) return
        fetch(`/files${force ? "?force" : ""}`)
            .then(res => res.json())
            .then(setOverviewData)
    }

    const totalFileSize = useMemo(() => (
        overviewData ?
            hrFileSize(overviewData.movie_size + overviewData.series_size + overviewData.music_size + overviewData.thumbnail_cache_size) :
            loader
    ), [overviewData])
    const movieFileSize = useMemo(() => (
        overviewData ?
            hrFileSize(overviewData.movie_size) :
            loader
    ), [overviewData])
    const seriesFileSize = useMemo(() => (
        overviewData ?
            hrFileSize(overviewData.series_size) :
            loader
    ), [overviewData])
    const musicFileSize = useMemo(() => (
        overviewData ?
            hrFileSize(overviewData.music_size) :
            loader
    ), [overviewData])
    const thumbnailCacheSize = useMemo(() => (
        overviewData ?
            hrFileSize(overviewData.thumbnail_cache_size) :
            loader
    ), [overviewData])

    const cpuUsage = useMemo(() => (
        overviewData ?
            `${overviewData.process_info.cpu}%` :
            loader
    ), [overviewData])
    const memoryUsage = useMemo(() => (
        overviewData ?
            hrFileSize(overviewData.process_info.memory) :
            loader
    ), [overviewData])
    const threadCount = useMemo(() => (
        overviewData ?
            overviewData.process_info.threads :
            loader
    ), [overviewData])

    return (
        <Paper elevation={2} className="container mt-5 p-3">
            <div className="border-secondary border-bottom">
                <h4>Drive Usage</h4>
                <div className="ms-2">
                    <p>Total: {totalFileSize}</p>
                    <p>Movies: {movieFileSize}</p>
                    <p>Series: {seriesFileSize}</p>
                    <p>Music: {musicFileSize}</p>
                    <p>Thumbnail Cache: {thumbnailCacheSize}</p>
                </div>
            </div>
            <div className="mt-2">
                <h4>Process Info</h4>
                <div className="ms-2">
                    <p>CPU Usage: {cpuUsage}</p>
                    <p>Memory Usage: {memoryUsage}</p>
                    <p>Thread Count: {threadCount}</p>
                </div>
            </div>
        </Paper>
    )
}


function FileManager() {
    const [tab, setTab] = React.useState(parseInt(sessionStorage.getItem("fm-tab") || "0"))

    const RenderPage = useMemo(() => {
        sessionStorage.setItem("fm-tab", tab.toString())
        switch(tab){
            case 1:
                return <MovieFileManager />
            case 2:
                return <SeriesFileManager />
            default:
                return <Overview />
        }
    }, [tab])

    return (
        <PageBase>
            <div className="border-secondary border-bottom">
                <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
                    <Tab label="Overview" />
                    <Tab label="Movies" />
                    <Tab label="Sieries" />
                </Tabs>
            </div>
            <div>
                {RenderPage}
            </div>
        </PageBase>
    )
}

export default FileManager