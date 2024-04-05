import React, {Suspense, lazy} from "react"

const CssBaseline = lazy(() => import("@mui/material/CssBaseline"));

import PageLoader from "./components/PageLoader";
import ContextProvider from "./ContextProvider";
import useIsTV from "./hooks/useIsTV";

const DesktopMobileEntry = lazy(() => import("./entry/DesktopMobileEntry"));
const SmartTVEntry = lazy(() => import("./entry/SmartTVEntry"));

function App(){
    const isTV = useIsTV()

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
