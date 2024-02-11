import React, {useMemo, lazy, Suspense} from "react";
import PageBase from "./PageBase";
import {Tab, Tabs} from "@mui/material";
import PageLoader from "../components/PageLoader";

const Overview = lazy(() => import("../components/fileManager/FileManagerOverview"))
const Metrics = lazy(() => import("../components/fileManager/FileManagerUserMetrics"))
const MovieFileManager = lazy(() => import("../components/fileManager/MovieFileManager"))
const SeriesFileManager = lazy(() => import("../components/fileManager/SeriesFileManager"))


function AdminPage() {
    const [tab, setTab] = React.useState(parseInt(sessionStorage.getItem("fm-tab") || "0"))

    const RenderPage = useMemo(() => {
        sessionStorage.setItem("fm-tab", tab.toString())
        switch(tab){
            case 1:
                return <Metrics />
            case 2:
                return <MovieFileManager />
            case 3:
                return <SeriesFileManager />
            default:
                return <Overview />
        }
    }, [tab])

    return (
        <PageBase>
            <div className="border-secondary border-bottom">
                <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
                    <Tab label="Overview" />
                    <Tab label="Metrics" />
                    <Tab label="Movies" />
                    <Tab label="Sieries" />
                </Tabs>
            </div>
            <div>
                <Suspense fallback={<PageLoader/>}>
                    {RenderPage}
                </Suspense>
            </div>
        </PageBase>
    )
}

export default AdminPage