import React from "react";
import TitleEntryType from "../../types/titleEntryType";
import SmartTVTitleList from "./SmartTVTitleList";

interface SmartTVHorizontalTitleListProps {
    titles: TitleEntryType[]
    setFocusedTitle: (title: TitleEntryType) => void
    name?: string
}
function SmartTVHorizontalTitleList(props: SmartTVHorizontalTitleListProps){
    return (
        <SmartTVTitleList
            titles={props.titles}
            setFocusedTitle={props.setFocusedTitle}
            name={props.name}
            skeletonAmount={8}
            refClassName="d-flex flex-row overflow-hidden"
            focusOptions={{
                focusKey: "ENTRY",
                saveLastFocusedChild: true,
                preferredChildFocusKey: "FIRST"
            }}
            testFirst
        />
    )
}

export default SmartTVHorizontalTitleList;