import React from "react";
import TitleEntryType from "../../types/titleEntryType";
import {FocusContext, useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import SmartTVTitleDisplay from "./SmartTVTitleDisplay";

interface SmartTVHorizontalTitleListProps {
    titles: TitleEntryType[]
    setFocusedTitle: (title: TitleEntryType) => void
    name?: string
}
function SmartTVHorizontalTitleList(props: SmartTVHorizontalTitleListProps){
    const { ref, focusKey } = useFocusable({
        focusKey: "ENTRY"
    })

    function handleFocus(title: TitleEntryType){
        props.setFocusedTitle(title)
    }

    return (
        <FocusContext.Provider value={focusKey}>
            <div className="position-relative ms-3" style={{zIndex: 100}}>
                {props.name && <h4>{props.name}</h4>}
                <div ref={ref} className="d-flex flex-row overflow-hidden ms-2">
                    {props.titles.map((title, i) => (
                        <div className="p-2" key={i}>
                            <SmartTVTitleDisplay title={title} onFocused={() => handleFocus(title)} />
                        </div>
                    ))}
                </div>
            </div>
        </FocusContext.Provider>
    )
}

export default SmartTVHorizontalTitleList;