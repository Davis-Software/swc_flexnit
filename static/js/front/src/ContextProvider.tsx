import React, {lazy, useMemo, useState} from "react";

const ThemeProvider = lazy(() => import("@mui/material/styles/ThemeProvider"));

import {systemThemeIsDark} from "./utils/constants";
import lightTheme from "./themes/lightTheme";
import amoledTheme from "./themes/amoledTheme";
import darkTheme from "./themes/darkTheme";

import {ThemeContext} from "./contexts/themeContext";
import {ShowAdminContext} from "./contexts/showAdminContext";
import {AudioPlayerContextProvider} from "./contexts/AudioPlayerContextProvider";
import {IsSmartTVContext} from "./contexts/isSmartTVContext";

interface ContextProviderProps {
    children: React.ReactNode;
}
function ContextProvider(props: ContextProviderProps) {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "system")
    const [showAdmin, setShowAdmin] = useState(localStorage.getItem("showAdminOptions") === "true")

    const computedTheme = useMemo(() => {
        switch (theme) {
            case "light":
                return lightTheme
            case "amoled":
                return amoledTheme
            case "system":
                return systemThemeIsDark ? darkTheme : lightTheme
            case "dark":
            default:
                return darkTheme
        }
    }, [theme])

    return (
        <ThemeProvider theme={computedTheme}>
            <ThemeContext.Provider value={{theme, setTheme}}>
                <ShowAdminContext.Provider value={{showAdmin, setShowAdmin}}>
                    <AudioPlayerContextProvider>

                        {props.children}

                    </AudioPlayerContextProvider>
                </ShowAdminContext.Provider>
            </ThemeContext.Provider>
        </ThemeProvider>
    )
}

function BaseContextProvider(props: ContextProviderProps) {
    const [forceSmartTV, setForceSmartTV] = useState(localStorage.getItem("forceSmartTV") === "true")

    return (
        <IsSmartTVContext.Provider value={{forceSmartTV, setForceSmartTV}}>

            {props.children}

        </IsSmartTVContext.Provider>
    )
}

export default ContextProvider;
export {BaseContextProvider};