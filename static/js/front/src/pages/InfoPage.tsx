import React, {Suspense} from "react";
import PageBase from "./PageBase";
import PageLoader from "../components/PageLoader";

const MovieInfo = React.lazy(() => import("../components/movie/MovieInfo"));
const SeriesInfo = React.lazy(() => import("../components/series/SeriesInfo"));

function InfoPage(){
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get("mode");
    const uuid = searchParams.get("uuid");

    function setTitle(){}

    return (
        <PageBase>
            <div className="content">
                <Suspense fallback={<PageLoader />}>
                    {uuid && type === "movie" && <MovieInfo titleUUID={uuid} setTitle={setTitle} setSearchResults={() => {}} />}
                    {uuid && type === "series" && <SeriesInfo titleUUID={uuid} setTitle={setTitle} setSearchResults={() => {}} />}
                </Suspense>
            </div>
        </PageBase>
    )
}

export default InfoPage;