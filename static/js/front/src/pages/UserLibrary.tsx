import React, {useEffect, useMemo} from "react";
import TitleEntryType from "../types/titleEntryType";
import TitleProgress from "../components/other/TitleProgress";
import MovieType from "../types/movieType";
import SeriesType from "../types/seriesType";

interface TitleDisplayProps {
    titles: TitleEntryType[]
}
function TitleDisplay(props: TitleDisplayProps){
    function InnerTitleDisplay({title}: {title: TitleEntryType}){
        const [actualTitle, setActualTitle] = React.useState<MovieType | SeriesType | null>(null);

        useEffect(() => {
            fetch(`/${title.type === "movie" ? "movies" : "series"}/${title.uuid}`)
                .then(res => res.json())
                .then((title: MovieType | SeriesType) => {
                    setActualTitle(title);
                })
        }, [title])

        return (
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-3">
                <div className="card">
                    <img src={`/${title.type === "movie" ? "movies" : "series"}/${title.uuid}?poster`} className="card-img-top" alt={title.title}/>
                    <div className="card-body">
                        <h5 className="card-title">{title.title}</h5>
                        {actualTitle && <TitleProgress title={actualTitle} />}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="row m-0">
            {props.titles.map(title => (
                <InnerTitleDisplay title={title} key={title.uuid}/>
            ))}
        </div>
    )
}

function UserLibrary(){
    const [libraryTitles, setLibraryTitles] = React.useState<TitleEntryType[]>([]);
    const playbackProgress = useMemo(() => (
        JSON.parse(localStorage.getItem("playbackProgress") || "{}")
    ), [])

    useEffect(() => {
        fetch("/search/all")
            .then(res => res.json())
            .then((titles: TitleEntryType[]) => {
                setLibraryTitles(titles.filter(title => !!playbackProgress[title.uuid]))
            })
    }, [])

    return (
        <div className="mt-3">
            <div className="container d-flex justify-content-center py-3 mb-3">
                <h4>My Library</h4>
            </div>
            <TitleDisplay titles={libraryTitles.filter(title => title.type === "movie")}/>
            <TitleDisplay titles={libraryTitles.filter(title => title.type === "series")}/>
        </div>
    )
}

export default UserLibrary;