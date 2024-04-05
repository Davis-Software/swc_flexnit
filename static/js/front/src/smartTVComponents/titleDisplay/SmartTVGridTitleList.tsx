import React from "react";
import TitleEntryType from "../../types/titleEntryType";
import {FocusContext, useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import SmartTVTitleDisplay from "./SmartTVTitleDisplay";

interface SmartTVGridTitleListProps {
    titles: TitleEntryType[]
    setFocusedTitle: (title: TitleEntryType) => void
    name?: string
}
function SmartTVGridTitleList(props: SmartTVGridTitleListProps){
    const { ref, focusKey } = useFocusable()

    function handleFocus(title: TitleEntryType){
        props.setFocusedTitle(title)
    }

    return (
        <FocusContext.Provider value={focusKey}>
            <div className="position-relative ms-3" style={{zIndex: 100}}>
                {props.name && <h4>{props.name}</h4>}
                <div ref={ref} className="row me-0 my-0 ms-2">
                    {props.titles.map((title, i) => (
                        <div className="col p-2" key={i}>
                            <SmartTVTitleDisplay title={title} onFocused={() => handleFocus(title)} />
                        </div>
                    ))}
                </div>
            </div>
        </FocusContext.Provider>
    )
}

export default SmartTVGridTitleList;