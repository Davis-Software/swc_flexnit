import React from "react";
import {useNavigation} from "../smartTVComponents/navigation/SmartTVNavigation";
import SmartTVPageBase from "./SmartTVPageBase";

function SmartTVTitleEntryInfo() {
    const {state} = useNavigation()

    return (
        <SmartTVPageBase>
            <h1>{state.title.title}</h1>
            <p>{state.title.description}</p>
        </SmartTVPageBase>
    )
}

export default SmartTVTitleEntryInfo;