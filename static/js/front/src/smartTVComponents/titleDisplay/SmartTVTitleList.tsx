import React from "react";
import SmartTVTitleDisplay from "./SmartTVTitleDisplay";
import TitleEntryType from "../../types/titleEntryType";
import {FocusContext, useFocusable, UseFocusableConfig} from "@noriginmedia/norigin-spatial-navigation";

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
            <div className="position-relative ms-3" style={{zIndex: 100}}>
                {props.name && <h4>{props.name}</h4>}
                <div ref={ref} className={`${props.refClassName} ms-2`}>
                    {(
                        props.titles ||
                        Array.from(new Array(props.skeletonAmount || 8)).map(() => null)
                    ).map((title, i) => (
                        <div className={`${props.displayClassName} p-2`} key={i}>
                            <SmartTVTitleDisplay title={title} onFocused={() => handleFocus(title)} first={props.testFirst && i === 0}/>
                        </div>
                    ))}
                </div>
            </div>
        </FocusContext.Provider>
    )
}

export default SmartTVTitleList;