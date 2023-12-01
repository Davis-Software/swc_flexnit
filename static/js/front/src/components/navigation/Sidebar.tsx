import React, {useEffect, useRef, useState} from "react";
import {Button, FormControl, MenuItem, Select, Skeleton, TextField, Typography} from "@mui/material";
import SwcModal from "../SwcModal";
import TitleEntryType from "../../types/titleEntryType";
import EffectGenerator from "../EffectGenerator";
import {SwcFab, SwcFabContainer} from "../SwcFab";
import {isAdmin} from "../../utils/constants";
import {getTimeString} from "../../utils/FormatDate";
import useIsInView from "../../hooks/useIsInView";

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
                            description: ""
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

interface SidebarProps {
    setSelectedTitle: (title: TitleEntryType) => void;
    selectedTitleUUID: string | null;
    searchResults: TitleEntryType[];
    setSearchResults: (results: (prevState: TitleEntryType[]) => TitleEntryType[]) => void;
}
function Sidebar(props: SidebarProps){
    const [search, setSearch] = React.useState(sessionStorage.getItem("search") || "")
    const [searchMode, setSearchMode] =
        React.useState<"all" | "movie" | "series">(sessionStorage.getItem("search-mode") as "all" | "movie" | "series" || "all")

    const [createNewModal, setCreateNewModal] = React.useState(false)

    useEffect(() => {
        sessionStorage.setItem("search", search)
        sessionStorage.setItem("search-mode", searchMode)
        fetch(`/search/${searchMode}${search !== "" ? "?q=" + search : ""}`)
            .then(res => res.json())
            .then(props.setSearchResults)
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
                    {props.searchResults.map((searchResult, i) => (
                        <EffectGenerator
                            key={i}
                            onClick={() => handleClick(searchResult)}
                            onMouseDown={(e) => handleMiddleClick(e, searchResult)}
                            className={"result p-2 ps-3 border-bottom border-secondary"}
                            rippleEffect
                            candleEffect
                            candleSize={2}
                            selected={props.selectedTitleUUID === searchResult.uuid}
                        >
                            <TitleEntry searchResult={searchResult} />
                        </EffectGenerator>
                    ))}
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