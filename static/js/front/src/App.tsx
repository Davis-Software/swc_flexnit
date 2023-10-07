import React, {Suspense, lazy, useEffect, useState, useMemo} from "react"
import defaultTheme from "./themes/defaultTheme";

import NavBar from "./components/navigation/NavBar";
import PageLoader from "./components/PageLoader";
import {ThemeProvider} from "@mui/material";
import {setWindowTitle} from "./utils/navigation";
import {handleSyncDownload} from "./components/SyncPlaybackProgress";
import {isAdmin} from "./utils/constants";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Watch = lazy(() => import("./pages/Watch"));
const Info = lazy(() => import("./pages/InfoPage"));
const UserLibrary = lazy(() => import("./pages/UserLibrary"));
const Settings = lazy(() => import("./pages/Settings"));

const FileManager = lazy(() => import("./pages/FileManager"));

const NotFound = lazy(() => import("./pages/other/NotFound"));

const pageNames: {[key: string]: string} = {
    "/": "Home",
    "/about": "About",
    "/watch": "Watch",
    "/info": "Info",
    "/library": "Library",
    "/settings": "Settings",
    "/file-manager": "File Manager",
}
const navItems: [string, string, boolean][] = [
    ["Home", "/", false],
    ["Library", "/library", false],
    ["File Manager", "/file-manager", true],
]

function App(){
    const [page, setPage] = useState(window.location.pathname || "/")

    useEffect(() => {
        function pageSetter(){
            setPage(window.location.pathname)
        }
        handleSyncDownload(undefined, false, true)
        window.addEventListener("popstate", pageSetter)

        return () => {
            window.removeEventListener("popstate", pageSetter)
        }
    }, [])
    useEffect(() => {
        setWindowTitle(pageNames[page] || page)

        if(window.location.pathname === page) return
        history.pushState(null, "", page)
    }, [page])

    const RenderPage = useMemo(() => {
        switch(page){
            case "/":
                return <Home />
            case "/about":
                return <About />
            case "/watch":
                return <Watch />
            case "/info":
                return <Info />
            case "/library":
                return <UserLibrary />
            case "/settings":
                return <Settings />
            case "/file-manager":
                if(isAdmin) return <FileManager />
            default:
                return <NotFound />
        }
    }, [page])

    return (
        <ThemeProvider theme={defaultTheme}>
            {page !== "/watch" && <NavBar navItems={navItems} />}
            <Suspense fallback={<PageLoader />}>
                {RenderPage}
            </Suspense>
        </ThemeProvider>
    )
}

export default App;
