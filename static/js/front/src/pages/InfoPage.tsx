import React, {Suspense} from "react";
import PageBase from "./PageBase";
import PageLoader from "../components/PageLoader";
import TitleEntryType from "../types/titleEntryType";

const MovieInfo = React.lazy(() => import("../components/main/MovieInfo"));
const SeriesInfo = React.lazy(() => import("../components/main/SeriesInfo"));

function InfoPage(){
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get("mode");
    const uuid = searchParams.get("uuid");

    const [title, setTitle] = React.useState<TitleEntryType | null>({
        uuid: uuid as string,
        type: type as "movie" | "series",
        title: ""
    })

    return (
        <PageBase>
            <div className="content">
                <Suspense fallback={<PageLoader />}>
                    {title && type === "movie" && <MovieInfo title={title} setTitle={setTitle} />}
                    {title && type === "series" && <SeriesInfo title={title} setTitle={setTitle} />}
                </Suspense>
            </div>
        </PageBase>
    )
}

export default InfoPage;