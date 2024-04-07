import React, {useEffect, useRef, useState} from 'react';
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import SmartTVPageBase from "./SmartTVPageBase";
import {Box, TextField} from "@mui/material";
import SmartTVGridTitleList from "../smartTVComponents/titleDisplay/SmartTVGridTitleList";
import TitleEntryType from "../types/titleEntryType";

function SmartTVHome(){
    const {ref, focused} = useFocusable()
    const inputRef = useRef<HTMLInputElement>()

    const [searchText, setSearchText] = useState("");
    const [titles, setTitles] = useState<TitleEntryType[]>([]);

    useEffect(() => {
        if(focused) {
            inputRef.current?.focus()
        }else{
            inputRef.current?.blur()
        }
    }, [focused]);

    useEffect(() => {
        fetch(`/search/all${searchText !== "" ? "?q=" + searchText : ""}`)
            .then(res => res.json())
            .then(setTitles)
    }, [searchText])

    return (
        <SmartTVPageBase>
            <Box className="d-flex justify-content-center my-3">
                <TextField
                    label="Search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    ref={ref}
                    variant="standard"
                    sx={{width: "50%"}}
                    inputRef={inputRef}
                />
            </Box>
            <SmartTVGridTitleList titles={titles} setFocusedTitle={() => {}} skeletonAmount={35} />
        </SmartTVPageBase>
    )
}

export default SmartTVHome;