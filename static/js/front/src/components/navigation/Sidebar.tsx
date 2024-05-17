import React, {useEffect, useRef, useState} from "react";
import {
    Button,
    Collapse,
    FormControl,
    Link,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    TextField,
    Typography
} from "@mui/material";
import SwcModal from "../SwcModal";
import TitleEntryType from "../../types/titleEntryType";
import EffectGenerator from "../EffectGenerator";
import {SwcFab, SwcFabContainer} from "../SwcFab";
import {getTimeString} from "../../utils/FormatDate";
import useIsInView from "../../hooks/useIsInView";
import {navigateTo} from "../../utils/navigation";
import {useIsAdmin} from "../../contexts/showAdminContext";
import News from "../other/News";

interface CreateNewModalProps {
    show: boolean;
    onHide: () => void;
    setSelectedResult: (title: TitleEntryType) => void;
}
function CreateNewModal(props: CreateNewModalProps){
    const [createMode, setCreateMode] = React.useState<"movie" | "series">("movie")
    const [title, setTitle] = React.useState("")

    return (
        <SwcModal show={props.show} onHide={props.onHide}>
            <h5>Create new...</h5>
            <Select
                variant="standard"
                value={createMode}
                onChange={e => setCreateMode(e.target.value as "movie" | "series")}
            >
                <MenuItem value="movie">Movie</MenuItem>
                <MenuItem value="series">Series</MenuItem>
            </Select>
            <TextField
                variant="standard"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                error={title.length === 0}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    const formData = new FormData();
                    formData.append("title", title);
                    fetch(`/${createMode === "movie" ? "movies" : "series"}/new`, {
                        method: "POST",
                        body: formData
                    }).then(res => res.json()).then(res => {
                        props.setSelectedResult({
                            uuid: res.uuid,
                            title: title,
                            type: createMode,
                            description: "",
                            tags: res.tags || [],
                        });
                        props.onHide();
                    })
                }}
                disabled={title.length === 0}
            >
                Create
            </Button>
        </SwcModal>
    )
}

interface TitleEntryProps {
    searchResult: TitleEntryType;
}
function TitleEntry({searchResult}: TitleEntryProps){
    const entryTextRef = useRef<HTMLDivElement>(null)
    const inView = useIsInView(entryTextRef)
    const [show, setShow] = useState(false)
    const [loading, setLoading] = React.useState(true)

    useEffect(() => {
        inView && setShow(true)
    }, [inView]);

    return (
        <>
            {(loading || !inView) && <Skeleton variant="rectangular" sx={{minWidth: "70px"}} height="100%" animation="wave" />}
            <img
                src={show ? `/${searchResult.type === "movie" ? "movies" : "series"}/${searchResult.uuid}?thumbnail&q=l` : ""}
                alt="title"
                onLoad={() => setLoading(false)}
                hidden={loading || !inView}
            />
            <div className="ms-3" ref={entryTextRef}>
                <div className="fw-bold">{searchResult.title}</div>
                {searchResult.type === "movie" ? (
                    <>
                        <Typography variant="overline">Runtime: </Typography>
                        <Typography variant="caption">{getTimeString(searchResult.runtime!)}</Typography>
                    </>
                ) : (
                    <Typography variant="overline">Seasons: {searchResult.season_count}</Typography>
                )}
            </div>
        </>
    )
}
function TitleEntryLoader(){
    return (
        <EffectGenerator
            className="result p-2 ps-3 border-bottom border-secondary position-relative"
            candleEffect
            candleSize={2}
        >
            <Skeleton variant="rectangular" sx={{minWidth: "70px"}} height="100%" animation="wave" />
            <div className="ms-3 w-100">
                <div className="fw-bold"><Skeleton variant="text" width="50%" animation="wave" /></div>
                <Typography variant="caption"><Skeleton variant="text" width="60%" animation="wave" /></Typography>
            </div>
        </EffectGenerator>
    )
}

interface SidebarProps {
    setSelectedTitle: (title: TitleEntryType) => void;
    selectedTitleUUID: string | null;
    searchResults: TitleEntryType[];
    setSearchResults: (results: (prevState: TitleEntryType[]) => TitleEntryType[]) => void;
    setLoadedOnce: (loadedOnce: boolean) => void;
}
function Sidebar(props: SidebarProps){
    const isAdmin = useIsAdmin()
    const [search, setSearch] = React.useState(sessionStorage.getItem("search") || "")
    const [searchMode, setSearchMode] =
        React.useState<"all" | "movie" | "series">(sessionStorage.getItem("search-mode") as "all" | "movie" | "series" || "all")
    const searchBarRef = useRef<HTMLInputElement>(null)
    const [showNews, setShowNews] = React.useState(window.innerWidth < 840)

    const [loading, setLoading] = React.useState(true)
    const loadTimeout = useRef<NodeJS.Timeout | null>(null)
    const [createNewModal, setCreateNewModal] = React.useState(false)

    function updateShowNews(){
        setShowNews(window.innerWidth < 840)
    }
    useEffect(() => {
        window.addEventListener("resize", updateShowNews)
        return () => window.removeEventListener("resize", updateShowNews)
    }, []);

    useEffect(() => {
        const abortController = new AbortController()
        loadTimeout.current && clearTimeout(loadTimeout.current)
        setLoading(true)
        if(search !== ""){
            setShowNews(false)
        }

        sessionStorage.setItem("search", search)
        sessionStorage.setItem("search-mode", searchMode)
        fetch(`/search/${searchMode}${search !== "" ? "?q=" + search : ""}`, {
            signal: abortController.signal
        })
            .then(res => res.json())
            .then(res => {
                props.setLoadedOnce(true)
                props.setSearchResults(res)
                loadTimeout.current = setTimeout(() => setLoading(false), 100 + Math.random() * 300)
            })

        return () => {
            abortController.abort()
        }
    }, [search, searchMode])

    function handleClick(searchResult: TitleEntryType){
        props.setSelectedTitle(searchResult)
    }
    function handleMiddleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, searchResult: TitleEntryType){
        if(e.button !== 1 && e.buttons !== 4) return
        window.open(`/info?mode=${searchResult.type}&uuid=${searchResult.uuid}`, "_blank")
    }

    return (
        <>
            <div className="sidebar d-flex flex-column border-end border-secondary">
                <div className="sidebar-form">
                    <FormControl fullWidth>
                        <TextField
                            inputRef={searchBarRef}
                            variant="standard"
                            placeholder="Search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            sx={{"& input": {paddingLeft: ".5rem"}}}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <Select
                            variant="standard"
                            value={searchMode}
                            onChange={e => setSearchMode(e.target.value as "all" | "movie" | "series")}
                            sx={{paddingLeft: ".5rem"}}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="movie">Movie</MenuItem>
                            <MenuItem value="series">Series</MenuItem>
                        </Select>
                    </FormControl>
                    <hr className="mb-0" />
                </div>

                <div className="results">
                    {showNews && search === "" && (
                        <Paper elevation={5}>
                            <News
                                setSelectedTitle={title => {
                                    navigateTo(`/info?mode=${title.series ? "series" : "movie"}&uuid=${title.series ? title.series.uuid : title.uuid}`)
                                }}
                                count={3}
                                small
                                className="px-2 pt-3"
                            />
                            <div className="text-center pb-1">
                                <Typography variant="overline">
                                    <Link
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            navigateTo("/news")
                                        }}
                                    >Show more</Link>
                                </Typography>
                            </div>
                        </Paper>
                    )}

                    {loading && Array.from(new Array(8)).map((_, i) => (
                        <TitleEntryLoader key={i} />
                    ))}
                    {props.searchResults.map((searchResult, i) => (
                        <EffectGenerator
                            key={i}
                            onClick={() => handleClick(searchResult)}
                            onMouseDown={(e) => handleMiddleClick(e, searchResult)}
                            className="result p-2 ps-3 border-bottom border-secondary"
                            rippleEffect
                            candleEffect
                            candleSize={2}
                            selected={props.selectedTitleUUID === searchResult.uuid}
                        >
                            <TitleEntry searchResult={searchResult} />
                        </EffectGenerator>
                    ))}

                    {props.searchResults.length > 0 && search === "" && (
                        <div className="text-center mt-3 mb-5 pb-5">
                            <Typography variant="caption">Searching for something... ?</Typography><br/>
                            <Typography variant="caption">
                                This list only contains some title entries. <br/>
                                Use the
                                <a href="#" onClick={(e) => {
                                    e.preventDefault()
                                    searchBarRef.current?.focus()
                                }}> search </a>
                                or go to
                                <a href="#" onClick={(e) => {
                                    e.preventDefault()
                                    navigateTo("/browse")
                                }}> Browse</a>
                                .
                            </Typography>
                        </div>
                    )}
                </div>

                <SwcFabContainer hide={!isAdmin} position="absolute">
                    <SwcFab
                        icon={<i className="material-icons">add</i>}
                        onClick={() => setCreateNewModal(true)}
                        color="primary"
                    />
                </SwcFabContainer>
            </div>
            <CreateNewModal
                show={createNewModal}
                onHide={() => setCreateNewModal(false)}
                setSelectedResult={props.setSelectedTitle}
            />
        </>
    )
}

export default Sidebar;