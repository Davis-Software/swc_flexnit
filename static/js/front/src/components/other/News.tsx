import React, {useEffect, useState} from "react";
import {Container, Skeleton, Typography} from "@mui/material";
import TitleEntryType from "../../types/titleEntryType";
import EffectGenerator from "../EffectGenerator";

function getTitleImage(title: TitleEntryType){
    if(["episode", "episode_group"].includes(title.type) && title.series){
        title = title.series
    }
    return `/${title.type === "movie" ? "movies" : "series"}/${title.uuid}?thumbnail&q=h`
}

interface TitleViewProps {
    title: TitleEntryType
    imageHeight?: number
    small?: boolean
}
function TitleView({title, imageHeight = 100, small}: TitleViewProps){
    const [loading, setLoading] = useState(true)
    imageHeight = small ? 100 : imageHeight

    return (
        <>
            {loading && <Skeleton variant="rectangular" width={imageHeight * 11/16} height={imageHeight} animation="wave" />}
            <img
                alt={title.type !== "episode_group" ? title.title : title.series?.title}
                height={imageHeight}
                width={imageHeight * 11/16}
                style={{objectFit: "cover", zIndex: 1000}}
                src={getTitleImage(title)}
                onLoad={() => setLoading(false)}
                hidden={loading}
            />
            <div className="ms-3 flex-grow-1">
                {title.type === "episode" ? (
                    <Typography variant="overline">{title.series?.title}</Typography>
                ) : (
                    <Typography variant="overline">New {nameMapping[title.type]}</Typography>
                )}
                <Typography variant={small ? "h6" : "h5"}>{title.type === "episode" && "New Episode: "}{title.type !== "episode_group" ? title.title : title.series?.title}</Typography>
                <p>{title.type === "episode_group" ? (
                    title.episodes + " New Episodes Available"
                ) : (
                    title.description ? (title.description.length > 100 ? title.description.slice(0, 100).trimEnd() + "..." : title.description) : ""
                )}</p>
            </div>
        </>
    )
}
function TitleViewLoader({count, small}: {count: number, small?: boolean}){
    const TextSkeleton = () => (
        <div className="ms-3 flex-grow-1">
            <Skeleton variant="text" height="30px" width="30%" animation="wave"/>
            <Skeleton variant="text" width="25%" animation="wave"/>
        </div>
    )

    return <>
        <EffectGenerator
            className="d-flex mb-4 p-2 position-relative"
            candleEffect
        >
            <>
                <Skeleton variant="rectangular" width={!small ? 120 : 60} height={!small ? 200 : 100} animation="wave"/>
                <TextSkeleton />
            </>
        </EffectGenerator>
        <div className="row m-0">
            {Array.from({length: count - 1}).map((_, i) => (
                <EffectGenerator
                    className="col-lg-6 col-12 d-flex p-1 position-relative"
                    key={i}
                    candleEffect
                >
                    <>
                        <Skeleton variant="rectangular" width={60} height={100} animation="wave"/>
                        <TextSkeleton />
                    </>
                </EffectGenerator>
            ))}
        </div>
    </>
}

const nameMapping = {
    "movie": "Movie",
    "series": "Series",
    "episode": "Episode",
    "episode_group": "Episodes"
}

interface NewsProps {
    setSelectedTitle?: (title: TitleEntryType) => void
    count?: number
    small?: boolean
    className?: string
}
function News(props: NewsProps){
    const [latestRelease, setLatestRelease] = useState<TitleEntryType | null>(null)
    const [latestReleases, setLatestReleases] = useState<TitleEntryType[]>([])

    useEffect(() => {
        fetch(`/search/latest?count=${props.count || 5}`)
            .then(res => res.json())
            .then((releases) => {
                setLatestReleases(releases)
                setLatestRelease(releases.at(0))
            })
    }, []);

    function handleTitleLink(title: TitleEntryType){
        if(!props.setSelectedTitle) return
        props.setSelectedTitle(title)
    }

    return (
        <>
            <Container className={props.className || "pt-5 p-3"}>
                <h3 className="text-center">Latest Additions</h3>
                <hr/>
                {latestReleases.length > 0 ? (
                    <>
                        {!!latestRelease && (
                            <EffectGenerator
                                className="d-flex mb-4 p-2"
                                style={{cursor: "pointer"}}
                                rippleEffect
                                candleEffect
                                onClick={() => handleTitleLink(latestRelease)}
                            >
                                <TitleView title={latestRelease} imageHeight={200} small={props.small} />
                            </EffectGenerator>
                        )}
                        <div className="row m-0">
                            {latestReleases.slice(1).map((title, i) => (
                                <EffectGenerator
                                    className="col-lg-6 col-12 d-flex p-1"
                                    style={{cursor: "pointer"}}
                                    key={i}
                                    rippleEffect
                                    candleEffect
                                    onClick={() => handleTitleLink(title)}
                                >
                                    <TitleView title={title} small={props.small} />
                                </EffectGenerator>
                            ))}
                        </div>
                    </>
                ) : <TitleViewLoader count={props.count || 5} small={props.small} />}
            </Container>
        </>
    )
}

export default News;