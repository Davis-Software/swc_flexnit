import TitleEntryType from "../../types/titleEntryType";
import React, {lazy, useEffect, useMemo, useState} from "react";
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
                    // make sure the image is loaded after the page is loaded
                    // @ts-ignore
                    fetchpriority="low"
                />
            </div>
        </Box>
    )
}

const stableStorage: {[key: string] : any} = {}
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
    titleFilter: "movie" | "series"
    setSelectedTitle?: (title: TitleEntryType) => void
}
function TitleBrowser(props: TitleBrowserProps){
    const [titles, setTitles] = useState<TitleEntryType[]>([])
    const scrollRef = React.useRef<HTMLDivElement>(null);

    function loadData(reset: boolean = false){
        let currPage = reset ? 1 : (getStableProp(props.id, "page") as number + 1)
        setStableProp(props.id, "pause", true)
        fetch(`/search/${props.titleFilter}?c=8&p=${currPage}`)
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
    }, [props.titleFilter]);

    function updatePage(){
        if(getStableProp(props.id, "pause") || getStableProp(props.id, "end")) return
        if(!scrollRef.current) return
        if(scrollRef.current.clientWidth > scrollRef.current.scrollWidth) return
        if(Math.abs(scrollRef.current.scrollWidth - scrollRef.current.scrollLeft - scrollRef.current.clientWidth) > 10) return
        loadData()
    }
    function scroll(e: any){
        if(!scrollRef.current) return
        scrollRef.current.scrollLeft -= (e.wheelDelta || -e.detail * 30)
        e.preventDefault()
        e.stopPropagation()

    }
    useEffect(() => {
        if(!scrollRef.current) return
        scrollRef.current.addEventListener("scroll", updatePage)
        scrollRef.current.addEventListener("mousewheel", scroll)
        scrollRef.current.addEventListener("DOMMouseScroll", scroll)
        return () => {
            scrollRef.current?.removeEventListener("scroll", updatePage)
            scrollRef.current?.removeEventListener("mousewheel", scroll)
            scrollRef.current?.removeEventListener("DOMMouseScroll", scroll)
        }
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
    id: string
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
                        className="mx-3 d-flex flex-column justify-content-evenly"
                        style={{height: `calc(100vh - 64px * ${props.forceTab === undefined ? "2" : "1"})`}}
                    >
                        <div className="h-50 d-flex flex-column">
                            <h2>Movies</h2>
                            <TitleBrowser titleFilter="movie" setSelectedTitle={props.setSelectedTitle} id={"m-" + props.id} />
                        </div>
                        <div className="h-50 d-flex flex-column">
                            <h2>Series</h2>
                            <TitleBrowser titleFilter="series" setSelectedTitle={props.setSelectedTitle} id={"s-" + props.id} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ContentBrowser