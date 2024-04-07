import TitleEntryType from "../../types/titleEntryType";
import React, {lazy, useEffect, useState} from "react";
import {Box, Skeleton, Tab, Tabs, Typography, useTheme} from "@mui/material";
import SwcLoader from "../SwcLoader";

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
            className="p-0 col-12 col-md-6 col-lg-4 col-xxl-2"
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
                    className="p-2 p-xl-5 position-absolute top-0 start-0 text-break w-100 h-100"
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
                    <Typography variant="caption">{props.title.tags}</Typography>
                    {props.title.description && (
                        <p className="mt-1">{props.title.description?.length > 100 ? props.title.description?.slice(0, 200) + "..." : props.title.description}</p>
                    )}
                </Box>
            </Box>
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
    isNotStandAlone?: boolean
    setSelectedTitle?: (title: TitleEntryType) => void
}
function TitleBrowser(props: TitleBrowserProps){
    const [titles, setTitles] = useState<TitleEntryType[]>([])
    const [loading, setLoading] = useState(true)
    const scrollRef = React.useRef<HTMLDivElement | Window>(
        props.isNotStandAlone ?
            null :
            window
    );

    function loadData(reset: boolean = false){
        let currPage = reset ? 1 : (getStableProp(props.id, "page") as number + 1)
        setStableProp(props.id, "pause", true)
        setLoading(true)
        fetch(`/search/browse?c=15&p=${currPage}`)
            .then(r => r.json())
            .then((data) => {
                if(data.length === 0) {
                    setStableProp(props.id, "end", true)
                }else{
                    setTitles(prevTitles => [...prevTitles, ...data])
                    setStableProp(props.id, "page", currPage)
                }
                setStableProp(props.id, "pause", false)
                setLoading(false)
            })
    }

    useEffect(() => {
        loadData(true)

        if(scrollRef.current) {
            scrollRef.current.scrollTo(0, 0)
        }

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
        if(scrollRef.current instanceof Window) {
            if(window.innerHeight + window.scrollY < document.body.offsetHeight - 100) return
        }else{
            if(scrollRef.current.clientHeight > scrollRef.current.scrollHeight) return
            if(Math.abs(scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight) > 10) return
        }
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
        <>
            {props.isNotStandAlone ? (
                <Box
                    className="row m-0 flex-grow-1"
                    style={{overflowY: "auto", overflowX: "hidden"}}
                    ref={scrollRef as React.RefObject<HTMLDivElement>}
                >
                    {titles.map((title, i) => (
                        <TitlePreview key={i} title={title} onClick={() => {
                            if(props.setSelectedTitle) props.setSelectedTitle(title)
                        }} />
                    ))}
                </Box>
            ) : (
                <Box className="row m-0" style={{overflowX: "hidden", overflowY: "clip", height: "auto"}}>
                    {titles.map((title, i) => (
                        <TitlePreview key={i} title={title} onClick={() => {
                            if(props.setSelectedTitle) props.setSelectedTitle(title)
                        }} />
                    ))}
                </Box>
            )}
            {loading && (
                <Box className="d-flex justify-content-center">
                    <SwcLoader />
                </Box>
            )}
        </>
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
            {props.forceTab === undefined && (
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" className="mb-3">
                    <Tab value="browse" label="Browse" />
                    <Tab value="news" label="News" />
                </Tabs>
            )}
            {(props.forceTab === undefined || props.forceTab === "news") && (
                <Box hidden={tab !== "news"}>
                    <News setSelectedTitle={props.setSelectedTitle} count={7} />
                </Box>
            )}
            {(props.forceTab === undefined || props.forceTab === "browse") && (
                (props.forceTab === undefined ? (
                    <Box hidden={tab !== "browse"}>
                        <Box className="d-flex flex-column" style={{height: `calc(100vh - 128px)`}}>
                            <TitleBrowser setSelectedTitle={props.setSelectedTitle} id={"m-" + props.id} isNotStandAlone />
                        </Box>
                    </Box>
                ) : (
                    <TitleBrowser setSelectedTitle={props.setSelectedTitle} id={"m-" + props.id}/>
                ))
            )}
        </>
    )
}

export default ContentBrowser