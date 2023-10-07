import React, {useEffect, useState} from "react";
import {Container} from "@mui/material";
import TitleEntryType from "../../types/titleEntryType";
import SwcLoader from "../SwcLoader";

function News(){
    const [latestReleases, setLatestReleases] = useState<TitleEntryType[]>([])

    useEffect(() => {
        fetch("/search/latest")
            .then(res => res.json())
            .then(setLatestReleases)
    }, []);

    function getTitleImage(title: TitleEntryType){
        if(title.type === "episode" && title.series){
            // title is an episode entry
            title = title.series
        }
        return `/${title.type === "movie" ? "movies" : "series"}/${title.uuid}?thumbnail`
    }

    return (
        <>
            <Container className="pt-5 p-3">
                <h3 className="text-center">Latest Additions</h3>
                <hr/>
                {latestReleases.length > 0 ? (
                    <>
                        <div className="d-flex mb-4">
                            <img height={200} width="auto" style={{objectFit: "cover"}} src={getTitleImage(latestReleases.at(0)!)}/>
                            <div className="ms-3 flex-grow-1">
                                <h5>{latestReleases.at(0)!.title}</h5>
                                <p>{latestReleases.at(0)!.description}</p>
                            </div>
                        </div>
                        <div className="row m-0">
                            {latestReleases.slice(1).map((title, i) => (
                                <div className="col-6 d-flex p-1" key={i}>
                                    <img height={100} width="auto" style={{objectFit: "cover"}} src={getTitleImage(title)}/>
                                    <div className="ms-3 flex-grow-1">
                                        <h5>{title.title}</h5>
                                        <p>{title.description.slice(0, 100)}</p>
                                    </div>
                                </div>
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