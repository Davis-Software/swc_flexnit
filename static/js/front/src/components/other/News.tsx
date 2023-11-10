import React, {useEffect, useState} from "react";
import {Container} from "@mui/material";
import TitleEntryType from "../../types/titleEntryType";
import SwcLoader from "../SwcLoader";
import EffectGenerator from "../EffectGenerator";
import {navigateTo} from "../../utils/navigation";
import titleEntryType from "../../types/titleEntryType";

const nameMapping = {
    "movie": "Movie",
    "series": "Series",
    "episode": "Episode",
    "episode_group": "Episodes"
}

interface NewsProps {
    setSelectedTitle: (title: TitleEntryType | null) => void
}
function News(props: NewsProps){
    const [latestRelease, setLatestRelease] = useState<TitleEntryType | null>(null)
    const [latestReleases, setLatestReleases] = useState<TitleEntryType[]>([])

    useEffect(() => {
        fetch("/search/latest")
            .then(res => res.json())
            .then((releases) => {
                setLatestReleases(releases)
                setLatestRelease(releases.at(0))
            })
    }, []);

    function getTitleImage(title: TitleEntryType){
        if(["episode", "episode_group"].includes(title.type) && title.series){
            title = title.series
        }
        return `/${title.type === "movie" ? "movies" : "series"}/${title.uuid}?thumbnail`
    }

    function handleTitleLink(title: TitleEntryType){
        if(title.type === "episode" && title.series){
            navigateTo(`/watch?series=${title.series.uuid}&episode=${title.uuid}${title.hls ? "&hls" : ""}`)
        }
        if(title.type === "episode_group" && title.series){
            title = title.series
        }
        if(window.innerWidth < 840) {
            navigateTo(`/info?mode=${title.type}&uuid=${title.uuid}`)
        }else{
            props.setSelectedTitle(title)
        }
    }

    function TitleView(title: TitleEntryType, imageHeight: number = 100){
        return (
            <>
                <img
                    alt={title.type !== "episode_group" ? title.title : title.series?.title}
                    height={imageHeight}
                    width="auto"
                    style={{objectFit: "cover", zIndex: 1000}}
                    src={getTitleImage(title)}
                />
                <div className="ms-3 flex-grow-1">
                    {title.type === "episode" ? (
                        <small className="text-white-50">{title.series?.title}</small>
                    ) : (
                        <small className="text-white-50">New {nameMapping[title.type]}</small>
                    )}
                    <h5>{title.type === "episode" && "New Episode: "}{title.type !== "episode_group" ? title.title : title.series?.title}</h5>
                    <p>{title.type === "episode_group" ? (
                        title.episodes + " New Episodes Available"
                    ) : (
                        title.description ? (title.description.length > 100 ? title.description.slice(0, 100).trimEnd() + "..." : title.description) : ""
                    )}</p>
                </div>
            </>
        )
    }

    return (
        <>
            <Container className="pt-5 p-3">
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
                                {TitleView(latestRelease, 200)}
                            </EffectGenerator>
                        )}
                        <div className="row m-0">
                            {latestReleases.slice(1).map((title, i) => (
                                <EffectGenerator
                                    className="col-6 d-flex p-1"
                                    style={{cursor: "pointer"}}
                                    key={i}
                                    rippleEffect
                                    candleEffect
                                    onClick={() => handleTitleLink(title)}
                                >
                                    {TitleView(title)}
                                </EffectGenerator>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="d-flex justify-content-center">
                        <SwcLoader />
                    </div>
                )}
            </Container>
        </>
    )
}

export default News;