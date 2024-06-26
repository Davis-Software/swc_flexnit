import React from "react";
import TitleEntryType from "../../types/titleEntryType";
import SmartTVTitleList from "./SmartTVTitleList";

interface SmartTVGridTitleListProps {
    titles: TitleEntryType[] | null
    setFocusedTitle: (title: TitleEntryType) => void
    name?: string
    skeletonAmount?: number
}
function SmartTVGridTitleList(props: SmartTVGridTitleListProps){
    return (
        <SmartTVTitleList
            titles={props.titles}
            setFocusedTitle={props.setFocusedTitle}
            name={props.name}
            skeletonAmount={props.skeletonAmount || 20}
            refClassName="d-flex flex-wrap me-0 my-0"
        />
    )
}

export default SmartTVGridTitleList;