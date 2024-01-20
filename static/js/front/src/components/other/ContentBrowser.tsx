import TitleEntryType from "../../types/titleEntryType";
import React, {lazy, useEffect, useState} from "react";
import {Box, Skeleton, Tab, Tabs, Typography, useTheme} from "@mui/material";
import {getTimeString} from "../../utils/FormatDate";

const News = lazy(() => import("./News"))

interface TitlePreviewProps{
    title: TitleEntryType
    onClick?: () => void
}
function TitlePreview(props: TitlePreviewProps){
    const [loaded, setLoaded] = useState(false)
    const theme = useTheme()

    return (
        <Box
            className="col-6 col-xl-4 col-xxl-3"
            sx={{
                "&:hover":{
                    cursor: "pointer",
                    transform: "scale(1.05)"
                },
                transition: "transform 0.2s ease-in-out"
            }}
            onClick={props.onClick}
        >
            <div className="p-3 position-relative">
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
                />
                <Box
                    className="p-5 position-absolute top-0 start-0 text-break w-100 h-100"
                    sx={{
                        "&:hover": {
                            opacity: 1
                        },
                        transition: "opacity 0.2s ease-in-out",
                        backgroundColor: theme.palette.mode === "dark" ? "rgba(35,35,35, .6)" : "rgba(255,255,255, .6)",
                        opacity: 0
                    }}
                >
                    <div className="fw-bold mb-2">{props.title.title}</div>
                    {props.title.type === "movie" ? (
                        <>
                            <Typography variant="overline">Runtime: </Typography>
                            <Typography variant="caption">{getTimeString(props.title.runtime!)}</Typography>
                        </>
                    ) : (
                        <Typography variant="overline">Seasons: {props.title.season_count}</Typography>
                    )}
                    {props.title.description && (
                        <p className="mt-1">{props.title.description?.length > 100 ? props.title.description?.slice(0, 200) + "..." : props.title.description}</p>
                    )}
                </Box>
            </div>
        </Box>
    )
}

const stableStorage: { [key: string]: any } = {}

function setStableProp(preKey: string, key: string, value: string | number | boolean){
    if(!stableStorage.hasOwnProperty(preKey)){
        stableStorage[preKey] = {}
    }
    stableStorage[preKey][key] = value
}
function getStableProp(preKey: string, key: string) : string | number | boolean{
    if(!stableStorage.hasOwnProperty(preKey)){
        stableStorage[preKey] = {}
    }
    return stableStorage[preKey][key]
}

interface TitleBrowserProps{
    id: string
    setSelectedTitle?: (title: TitleEntryType) => void
}
function TitleBrowser(props: TitleBrowserProps){
    const [titles, setTitles] = useState<TitleEntryType[]>([])
    const scrollRef = React.useRef<HTMLDivElement>(null);

    function loadData(reset: boolean = false){
        let currPage = reset ? 1 : (getStableProp(props.id, "page") as number + 1)
        setStableProp(props.id, "pause", true)
        fetch(`/browse?c=15&p=${currPage}`)
            .then(r => r.json())
            .then((data) => {
                if(data.length === 0) {
                    setStableProp(props.id, "end", true)
                }else{
                    setTitles(prevTitles => [...prevTitles, ...data])
                    setStableProp(props.id, "page", currPage)
                }
                setStableProp(props.id, "pause", false)
            })
    }

    useEffect(() => {
        loadData(true)

        return () => {
            setTitles([])
            setStableProp(props.id, "page", 1)
            setStableProp(props.id, "pause", false)
            setStableProp(props.id, "end", false)
        }
    }, []);

    function updatePage(){
        if(getStableProp(props.id, "pause") || getStableProp(props.id, "end")) return
        if(!scrollRef.current) return
        if(scrollRef.current.clientHeight > scrollRef.current.scrollHeight) return
        if(Math.abs(scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight) > 10) return
        loadData()
    }
    useEffect(() => {
        if(!scrollRef.current) return
        scrollRef.current.addEventListener("scroll", updatePage)
        return () => {
            scrollRef.current?.removeEventListener("scroll", updatePage)
        }
    }, [scrollRef.current])

    return (
        <div
            className="row m-0 flex-grow-1"
            style={{overflowY: "auto", overflowX: "hidden", height: "calc(100svh - 180px)"}}
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
    id: string
    startTab?: "browse" | "news"
    forceTab?: "browse" | "news"
    setSelectedTitle?: (title: TitleEntryType) => void
}
function ContentBrowser(props: ContentBrowserProps){
    const [tab, setTab] = useState<"browse" | "news">(
        props.forceTab ||
        sessionStorage.getItem("home-tab") as "browse" | "news" ||
        props.startTab ||
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
                        className="mx-3 d-flex flex-column justify-content-evenly"
                        style={{height: `calc(100vh - 64px * ${props.forceTab === undefined ? "2" : "1"})`}}
                    >
                        <div className="d-flex flex-column">
                            <h2>All FlexNit Titles</h2>
                            <TitleBrowser setSelectedTitle={props.setSelectedTitle} id={"m-" + props.id} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ContentBrowser