import React, {lazy, Suspense, useEffect, useMemo} from "react";
import PageBase from "./PageBase";
import Sidebar from "../components/navigation/Sidebar";
import PageLoader from "../components/PageLoader";
import TitleEntryType from "../types/titleEntryType";
import {navigateTo} from "../utils/navigation";

const ContentBrowser = lazy(() => import("../components/other/ContentBrowser"))

const MovieInfo = React.lazy(() => import("../components/movie/MovieInfo"));
const SeriesInfo = React.lazy(() => import("../components/series/SeriesInfo"));

function Home(){
    const [selectedUUID, setSelectedUUID] = React.useState<string | null>((new URLSearchParams(window.location.search)).get("selected"));
    const [searchResults, setSearchResults] = React.useState<TitleEntryType[]>([])
    const [selectedTitle, setSelectedTitle] = React.useState<TitleEntryType | null>(null)

    useEffect(() => {
        if(searchResults.length > 0 && !selectedTitle){
            history.replaceState(window.location.href, "", "/")
            setSelectedUUID(null)
        }else if(selectedTitle && selectedTitle.uuid !== selectedUUID){
            history.replaceState(window.location.href, "", `?selected=${selectedTitle.uuid}`)
            setSelectedUUID(selectedTitle.uuid)
        }
    }, [selectedTitle])

    useEffect(() => {
        if(!searchResults) return
        setSelectedTitle(searchResults.find((title) => title.uuid === selectedUUID) || null)
    }, [searchResults]);

    function navigateToTitle(title: TitleEntryType){
        if(window.innerWidth < 840) {
            navigateTo(`/info?mode=${title.type}&uuid=${title.uuid}`)
        }else{
            setSelectedTitle(title)
        }
    }

    const RenderContent = useMemo(() => {
        if(selectedUUID || selectedTitle){
            switch (selectedTitle?.type) {
                case "movie":
                    return <MovieInfo title={selectedTitle} setTitle={setSelectedTitle} setSearchResults={setSearchResults} />
                case "series":
                    return <SeriesInfo title={selectedTitle} setTitle={setSelectedTitle}  setSearchResults={setSearchResults} />
                default:
                    return <PageLoader />
            }
        }else{
            return <ContentBrowser setSelectedTitle={navigateToTitle} />
        }
    }, [selectedTitle])

    return (
        <PageBase className="page-home flex-column flex-md-row">
            <Sidebar
                selectedTitle={selectedTitle}
                setSelectedTitle={navigateToTitle}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
            />
            <div className="content d-none d-md-block">
                <Suspense fallback={<PageLoader />}>
                    {RenderContent}
                </Suspense>
            </div>
        </PageBase>
    )
}

export default Home;