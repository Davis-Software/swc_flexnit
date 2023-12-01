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
    const [showWideContent, setShowWideContent] = React.useState<boolean>(window.innerWidth >= 840)
    const [selectedUUID, setSelectedUUID] = React.useState<string | null>((new URLSearchParams(window.location.search)).get("selected"));
    const [selectedType, setSelectedType] = React.useState<string | null>((new URLSearchParams(window.location.search)).get("type"));
    const [searchResults, setSearchResults] = React.useState<TitleEntryType[]>([])

    useEffect(() => {
        if(searchResults.length > 0 && selectedUUID === null){
            history.replaceState(window.location.href, "", "/")
        }else if(selectedUUID !== null && selectedType !== null){
            history.replaceState(window.location.href, "", `?type=${selectedType}&selected=${selectedUUID}`)
        }
    }, [selectedUUID, selectedType])
    useEffect(() => {
        function handleResize(){
            setShowWideContent(window.innerWidth >= 840)
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    function navigateToTitle(title: TitleEntryType | null){
        if(title?.series !== undefined) title = title.series
        if(window.innerWidth < 840 && title !== null) {
            navigateTo(`/info?mode=${title.type}&uuid=${title.uuid}`)
        }else{
            setSelectedUUID(title!.uuid)
            setSelectedType(title!.type)
        }
    }

    const RenderContent = useMemo(() => {
        if(selectedUUID !== null && selectedType !== null){
            switch (selectedType) {
                case "movie":
                    return <MovieInfo titleUUID={selectedUUID} setTitle={navigateToTitle} setSearchResults={setSearchResults} />
                case "series":
                    return <SeriesInfo titleUUID={selectedUUID} setTitle={navigateToTitle}  setSearchResults={setSearchResults} />
                default:
                    return <PageLoader />
            }
        }else{
            return <ContentBrowser setSelectedTitle={navigateToTitle} />
        }
    }, [selectedUUID, selectedType])

    return (
        <PageBase className="page-home flex-column flex-md-row">
            <Sidebar
                selectedTitleUUID={selectedUUID}
                setSelectedTitle={navigateToTitle}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
            />
            {showWideContent && (
                <div className="content d-none d-md-block">
                    <Suspense fallback={<PageLoader />}>
                        {RenderContent}
                    </Suspense>
                </div>
            )}
        </PageBase>
    )
}

export default Home;