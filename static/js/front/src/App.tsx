import React, {Suspense, lazy, useEffect} from "react"

const CssBaseline = lazy(() => import("@mui/material/CssBaseline"));

import PageLoader from "./components/PageLoader";
import ContextProvider from "./ContextProvider";
import {handleSyncDownload} from "./utils/syncControls";
import {useIsSmartTV} from "./contexts/isSmartTVContext";

const DesktopMobileEntry = lazy(() => import("./entry/DesktopMobileEntry"));
const SmartTVEntry = lazy(() => import("./entry/SmartTVEntry"));

function App(){
    const isTV = useIsSmartTV()

    useEffect(() => {
        handleSyncDownload(undefined, false, true)
    }, []);

    return (
        <Suspense fallback={<PageLoader />}>
            <ContextProvider>
                <CssBaseline />

                {!isTV ? (
                    <DesktopMobileEntry />
                ) : (
                    <SmartTVEntry />
                )}
            </ContextProvider>
        </Suspense>
    )
}

export default App;
