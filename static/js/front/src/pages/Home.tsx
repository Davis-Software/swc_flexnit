import React, {Suspense, useEffect, useMemo} from "react";
import PageBase from "./PageBase";
import Sidebar from "../components/navigation/Sidebar";
import PageLoader from "../components/PageLoader";
import TitleEntryType from "../types/titleEntryType";
import {navigateTo} from "../utils/navigation";
import News from "../components/main/News";

const MovieInfo = React.lazy(() => import("../components/main/MovieInfo"));
const SeriesInfo = React.lazy(() => import("../components/main/SeriesInfo"));

function Home(){
    const [selectedTitle, setSelectedTitle] =
        React.useState<TitleEntryType | null>(sessionStorage.getItem("selected-title") ? JSON.parse(sessionStorage.getItem("selected-title")!) : null);
    const [searchResults, setSearchResults] =
        React.useState<TitleEntryType[]>(JSON.parse(sessionStorage.getItem("search-results") || "[]"))

    useEffect(() => {
        sessionStorage.setItem("selected-title", JSON.stringify(selectedTitle));
    }, [selectedTitle])

    const RenderContent = useMemo(() => {
        if(selectedTitle){
            switch (selectedTitle.type) {
                case "movie":
                    return <MovieInfo title={selectedTitle} setTitle={setSelectedTitle} setSearchResults={setSearchResults} />
                case "series":
                    return <SeriesInfo title={selectedTitle} setTitle={setSelectedTitle}  setSearchResults={setSearchResults} />
                default:
                    return <span>Something went wrong</span>
            }
        }else{
            return <News />
        }
    }, [selectedTitle])

    return (
        <PageBase className="page-home flex-column flex-md-row">
            <Sidebar
                selectedTitle={selectedTitle}
                setSelectedTitle={(title) => {
                    if(window.innerWidth < 840) {
                        navigateTo(`/info?mode=${title.type}&uuid=${title.uuid}`)
                    }else{
                        setSelectedTitle(title)
                    }
                }}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
            />
            <div className="content d-none d-lg-block">
                <Suspense fallback={<PageLoader />}>
                    {RenderContent}
                </Suspense>
            </div>
        </PageBase>
    )
}

export default Home;