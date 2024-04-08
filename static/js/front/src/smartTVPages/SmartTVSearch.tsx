import React, {useEffect, useRef, useState} from 'react';
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import SmartTVPageBase from "./SmartTVPageBase";
import {Box, TextField} from "@mui/material";
import SmartTVGridTitleList from "../smartTVComponents/titleDisplay/SmartTVGridTitleList";
import TitleEntryType from "../types/titleEntryType";

interface FocusableTextFieldProps {
    searchText: string,
    setSearchText: (searchText: string) => void,
}
function FocusableTextField(props: FocusableTextFieldProps){
    const {ref, focused} = useFocusable({
        focusKey: "ENTRY"
    })
    const inputRef = useRef<HTMLInputElement>()

    useEffect(() => {
        if(focused) {
            inputRef.current?.focus()
        }else{
            inputRef.current?.blur()
        }
    }, [focused]);

    return (
        <Box className="d-flex justify-content-center my-3">
            <Box className="w-50">
                <TextField
                    ref={ref}
                    label="Search"
                    value={props.searchText}
                    onChange={(e) => props.setSearchText(e.target.value)}
                    variant="standard"
                    inputRef={inputRef}
                    fullWidth
                />
            </Box>
        </Box>
    )
}

function SmartTVHome(){
    const [searchText, setSearchText] = useState("");
    const [titles, setTitles] = useState<TitleEntryType[]>([]);

    useEffect(() => {
        fetch(`/search/all${searchText !== "" ? "?q=" + searchText : ""}`)
            .then(res => res.json())
            .then(setTitles)
    }, [searchText])

    return (
        <SmartTVPageBase>
            <FocusableTextField searchText={searchText} setSearchText={setSearchText} />
            <SmartTVGridTitleList titles={titles} setFocusedTitle={() => {}} skeletonAmount={35} />
        </SmartTVPageBase>
    )
}

export default SmartTVHome;