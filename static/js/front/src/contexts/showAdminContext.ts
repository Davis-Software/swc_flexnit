import React from "react";
import {isAdminSet} from "../utils/constants";

const ShowAdminContext = React.createContext({
    showAdmin: false,
    setShowAdmin: (showAdmin: boolean) => {}
})

function useIsAdmin() {
    const context = React.useContext(ShowAdminContext)
    return context.showAdmin && isAdminSet
}

export {ShowAdminContext, useIsAdmin}
