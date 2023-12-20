import React, {Suspense, lazy, useEffect, useState, useMemo} from "react"

import lightTheme from "./themes/lightTheme";
import darkTheme from "./themes/darkTheme";
import amoledTheme from "./themes/amoledTheme";

const NavBar = lazy(() => import("./components/navigation/NavBar"));
const PageLoader = lazy(() => import("./components/PageLoader"));
const CssBaseline = lazy(() => import("@mui/material/CssBaseline"));
const ThemeProvider = lazy(() => import("@mui/material/styles/ThemeProvider"));

import {setWindowTitle} from "./utils/navigation";
import {isAdminSet, systemThemeIsDark} from "./utils/constants";
import {ThemeContext} from "./contexts/themeContext";
import {ShowAdminContext} from "./contexts/showAdminContext";
import {handleSyncDownload} from "./utils/syncControls";

const Home = lazy(() => import("./pages/Home"));
const Info = lazy(() => import("./pages/InfoPage"));
const Browser = lazy(() => import("./pages/ContentBrowserPage"))
const UserLibrary = lazy(() => import("./pages/UserLibrary"));
const Music = lazy(() => import("./pages/Music"))
const Watch = lazy(() => import("./pages/Watch"));
const News = lazy(() => import("./pages/NewsPage"));
const About = lazy(() => import("./pages/About"));
const Settings = lazy(() => import("./pages/Settings"));

const FileManager = lazy(() => import("./pages/FileManager"));

const NotFound = lazy(() => import("./pages/other/NotFound"));

const pageNames: {[key: string]: string} = {
    "/": "Home",
    "/news": "News",
    "/about": "About",
    "/browse": "Browse",
    "/watch": "Watch",
    "/info": "Info",
    "/library": "Library",
    "/music": "Music",
    "/settings": "Settings",
    "/file-manager": "File Manager",
}
const navItems: [string, string, boolean][] = [
    ["Home", "/", false],
    ["Browse", "/browse", false],
    ["Library", "/library", false],
    ["Music", "/music", false],
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
            case "/news":
                return <News />
            case "/about":
                return <About />
            case "/watch":
                return <Watch />
            case "/info":
                return <Info />
            case "/browse":
                return <Browser />
            case "/library":
                return <UserLibrary />
            case "/music":
                return <Music />
            case "/settings":
                return <Settings />
            case "/file-manager":
                return isAdminSet ? <FileManager /> : <NotFound />
            default:
                return <NotFound />
        }
    }, [page])

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "system")
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

    const [showAdmin, setShowAdmin] = useState(localStorage.getItem("showAdminOptions") === "true")

    return (
        <ThemeProvider theme={computedTheme}>
            <ThemeContext.Provider value={{theme, setTheme}}>
                <ShowAdminContext.Provider value={{showAdmin, setShowAdmin}}>
                    <CssBaseline />

                    {page !== "/watch" && <NavBar navItems={navItems} />}
                    <Suspense fallback={<PageLoader />}>
                        {RenderPage}
                    </Suspense>
                </ShowAdminContext.Provider>
            </ThemeContext.Provider>
        </ThemeProvider>
    )
}

export default App;
