import React from "react";
import TitleEntryType from "../../types/titleEntryType";
import SmartTVTitleList from "./SmartTVTitleList";

interface SmartTVGridTitleListProps {
    titles: TitleEntryType[] | null
    setFocusedTitle: (title: TitleEntryType) => void
    name?: string
}
function SmartTVGridTitleList(props: SmartTVGridTitleListProps){
    return (
        <SmartTVTitleList
            titles={props.titles}
            setFocusedTitle={props.setFocusedTitle}
            name={props.name}
            skeletonAmount={20}
            refClassName="row me-0 my-0"
            displayClassName="col"
        />
    )
}

export default SmartTVGridTitleList;