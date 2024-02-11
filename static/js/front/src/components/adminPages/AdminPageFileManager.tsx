import React, {Suspense, useMemo} from "react";
import PageLoader from "../PageLoader";
import {Tab, Tabs} from "@mui/material";
import SeriesFileManager from "./SeriesFileManager";
import MovieFileManager from "./MovieFileManager";

function AdminPageFileManager(){
    const [tab, setTab] = React.useState(parseInt(sessionStorage.getItem("fm-tab") || "0"))

    const RenderPage = useMemo(() => {
        sessionStorage.setItem("fm-tab", tab.toString())
        switch(tab){
            case 1:
                return <SeriesFileManager />
            default:
                return <MovieFileManager />
        }
    }, [tab])

    return (
        <>
            <div className="border-secondary border-bottom">
                <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
                    <Tab label="Movies"/>
                    <Tab label="Sieries"/>
                </Tabs>
            </div>
            <div className="flex-grow-1">
                <Suspense fallback={<PageLoader/>}>
                    {RenderPage}
                </Suspense>
            </div>
        </>
    )
}

export default AdminPageFileManager