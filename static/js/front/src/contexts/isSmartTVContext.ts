import React from "react";
import {deviceIsSmartTV} from "../utils/constants";

const IsSmartTVContext = React.createContext({
    forceSmartTV: false,
    setForceSmartTV: (forceSmartTV: boolean) => {}
})

function useIsSmartTV() {
    const context = React.useContext(IsSmartTVContext)
    return deviceIsSmartTV || context.forceSmartTV
}

export {IsSmartTVContext, useIsSmartTV}
