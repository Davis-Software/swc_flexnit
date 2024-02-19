import React, {Suspense, lazy, useEffect, useState, useMemo} from "react"

const CssBaseline = lazy(() => import("@mui/material/CssBaseline"));
const NavBar = lazy(() => import("././components/navigation/NavBar"));

import PageLoader from "./components/PageLoader";

import {setWindowTitle} from "./utils/navigation";
import {isAdminSet} from "./utils/constants";
import {handleSyncDownload} from "./utils/syncControls";
import ContextProvider from "./ContextProvider";

const Home = lazy(() => import("./pages/Home"));
const Info = lazy(() => import("./pages/InfoPage"));
const Browser = lazy(() => import("./pages/BrowsePage"))
const UserLibrary = lazy(() => import("./pages/UserLibrary"));
const ContentRequestPage = lazy(() => import("./pages/ContentRequestPage"));
const Music = lazy(() => import("./pages/Music"))
const Watch = lazy(() => import("./pages/Watch"));
const News = lazy(() => import("./pages/NewsPage"));
const About = lazy(() => import("./pages/About"));
const WatchAlong = lazy(() => import("./pages/WatchAlongInfo"));
const Settings = lazy(() => import("./pages/Settings"));

const Admin = lazy(() => import("./pages/AdminPage"));

const NotFound = lazy(() => import("./pages/other/NotFound"));

const pageNames: {[key: string]: string} = {
    "/": "Home",
    "/news": "News",
    "/about": "About",
    "/watch-along": "Watch Along",
    "/browse": "Browse",
    "/request": "Content Requests",
    "/watch": "Watch",
    "/info": "Info",
    "/library": "Library",
    "/music": "Music",
    "/settings": "Settings",
    "/admin": "Admin Tools Page",
}
const navItems: [string, string, boolean][] = [
    ["Home", "/", false],
    ["Browse", "/browse", false],
    ["Library", "/library", false],
    ["Request", "/request", false],
    ["Music", "/music", false],
    ["Admin Tools", "/admin", true],
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
            case "/news":
                return <News />
            case "/about":
                return <About />
            case "/watch-along":
                return <WatchAlong />
            case "/watch":
                return <Watch />
            case "/info":
                return <Info />
            case "/browse":
                return <Browser />
            case "/library":
                return <UserLibrary />
            case "/request":
                return <ContentRequestPage />
            case "/music":
                return <Music />
            case "/settings":
                return <Settings />
            case "/admin":
                return isAdminSet ? <Admin /> : <NotFound />
            default:
                return <NotFound />
        }
    }, [page])

    return (
        <Suspense fallback={<PageLoader />}>
            <ContextProvider>
                <CssBaseline />

                {page !== "/watch" && <NavBar navItems={navItems} />}
                <Suspense fallback={<PageLoader />}>
                    {RenderPage}
                </Suspense>
            </ContextProvider>
        </Suspense>
    )
}

export default App;
