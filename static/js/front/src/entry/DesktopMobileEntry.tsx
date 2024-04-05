import React, {lazy, Suspense, useEffect, useMemo, useState} from "react";
import {setWindowTitle} from "../utils/navigation";
import {isAdminSet} from "../utils/constants";
import PageLoader from "../components/PageLoader";

const NavBar = lazy(() => import("../components/navigation/NavBar"));

const Home = lazy(() => import("../pages/Home"));
const Info = lazy(() => import("../pages/InfoPage"));
const Browser = lazy(() => import("../pages/BrowsePage"))
const UserLibrary = lazy(() => import("../pages/UserLibrary"));
const ContentRequestPage = lazy(() => import("../pages/ContentRequestPage"));
const Music = lazy(() => import("../pages/Music"))
const Watch = lazy(() => import("../pages/Watch"));
const News = lazy(() => import("../pages/NewsPage"));
const About = lazy(() => import("../pages/About"));
const Settings = lazy(() => import("../pages/Settings"));

const Admin = lazy(() => import("../pages/AdminPage"));

const NotFound = lazy(() => import("../pages/other/NotFound"));

const pageNames: {[key: string]: string} = {
    "/": "Home",
    "/news": "News",
    "/about": "About",
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

function DesktopMobileEntry(){
    const [page, setPage] = useState(window.location.pathname || "/")

    useEffect(() => {
        function pageSetter(){
            setPage(window.location.pathname)
        }
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
        <>
            {page !== "/watch" && <NavBar navItems={navItems} />}
            <Suspense fallback={<PageLoader />}>
                {RenderPage}
            </Suspense>
        </>
    )
}

export default DesktopMobileEntry;