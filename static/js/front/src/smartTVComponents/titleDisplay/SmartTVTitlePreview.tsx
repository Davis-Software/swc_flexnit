import React, {useEffect} from "react";
import TitleEntryType from "../../types/titleEntryType";
import TitleProgress from "../../components/other/TitleProgress";
import MovieType from "../../types/movieType";
import SeriesType from "../../types/seriesType";

interface SmartTVTitlePreviewProps {
    title: TitleEntryType | null
}
function SmartTVTitlePreview(props: SmartTVTitlePreviewProps){
    const [actualTitle, setActualTitle] = React.useState<MovieType | SeriesType | null>(null);

    useEffect(() => {
        if(!props.title) return;
        fetch(`/${props.title.type === "movie" ? "movies" : "series"}/${props.title.uuid}`)
            .then(res => res.json())
            .then((title: MovieType | SeriesType) => {
                setActualTitle(title);
            })
    }, [props.title])

    return (
        <>
            <div className="position-fixed start-0 top-0 w-100 h-100" style={{
                zIndex: 1,
                filter: "blur(7px)"
            }}>
                <img
                    src={props.title ? `/${props.title?.type === "movie" ? "movies" : "series"}/${props.title?.uuid}?poster` : undefined}
                    alt={props.title?.title}
                    style={{objectFit: "cover"}}
                    className="w-100 h-100 position-absolute start-0 top-0"
                />
                <div
                    className="w-100 h-100 position-absolute start-0 top-0"
                    style={{background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.8), rgba(0,0,0,0.9))"}}
                />
            </div>
            <div style={{height: "300px", maxHeight: "50%", zIndex: 100}} className="w-100 position-relative">
                <div className="position-absolute start-0 top-0 w-100">
                    <h1 className="p-4">{props.title?.title}</h1>
                    <div className="ps-5 pe-5 m-3">
                        {actualTitle && <TitleProgress title={actualTitle}/>}
                    </div>
                    <div className="ps-5 pe-5 m-3">
                        {props.title?.description}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SmartTVTitlePreview;