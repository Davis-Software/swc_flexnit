import React from "react";
import SmartTVTitleDisplay from "./SmartTVTitleDisplay";
import TitleEntryType from "../../types/titleEntryType";
import {FocusContext, useFocusable, UseFocusableConfig} from "@noriginmedia/norigin-spatial-navigation";
import {Box, Typography} from "@mui/material";

interface SmartTVTitleListProps {
    titles: TitleEntryType[] | null
    setFocusedTitle: (title: TitleEntryType) => void
    name?: string
    refClassName?: string
    displayClassName?: string
    skeletonAmount?: number
    focusOptions?: UseFocusableConfig<unknown>
    testFirst?: boolean
}
function SmartTVTitleList(props: SmartTVTitleListProps){
    const { ref, focusKey } = useFocusable(props.focusOptions)

    function handleFocus(title: TitleEntryType | null){
        if(!title) return
        props.setFocusedTitle(title)
    }

    return (
        <FocusContext.Provider value={focusKey}>
            <Box className="position-relative ms-3" style={{zIndex: 100}}>
                {props.name && <Typography variant="h5">{props.name}</Typography>}
                <Box ref={ref} className={`${props.refClassName} ms-2`}>
                    {(
                        (props.titles && props.titles.length > 0) ? props.titles :
                        Array.from(new Array(props.skeletonAmount || 8)).map(() => null)
                    ).map((title, i) => (
                        <Box className={`${props.displayClassName} p-2`} key={i}>
                            <SmartTVTitleDisplay title={title} onFocused={() => handleFocus(title)} first={props.testFirst && i === 0}/>
                        </Box>
                    ))}
                </Box>
            </Box>
        </FocusContext.Provider>
    )
}

export default SmartTVTitleList;