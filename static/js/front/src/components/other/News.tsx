import React, {useEffect, useState} from "react";
import {Button, ButtonGroup, Container} from "@mui/material";
import SwcModal from "../SwcModal";
import PageLoader from "../PageLoader";
import TitleEntryType from "../../types/titleEntryType";
import SwcLoader from "../SwcLoader";

function CommitHistory(){
    const [commits, setCommits] = React.useState<any[]>([]);
    const [page, setPage] = React.useState<number>(1);

    useEffect(() => {
        fetch(`https://api.github.com/repos/Davis-Software/swc_flexnit/commits?per_page=30&page=${page}`)
            .then(res => res.json())
            .then(setCommits)
            .catch(console.error)
    }, [page]);

    return (
        <Container className="pt-5 p-3">
            <h3 className="text-center">Commit History</h3>
            <hr/>

            {commits.length > 0 ? (
                <ul>
                    {commits.map((commit, i) => (
                        <li key={i}>
                            <a href={commit.html_url} target="_blank">{commit.commit.message}</a>
                        </li>
                    ))}
                </ul>
            ) : <PageLoader />}

            <div className="w-100 d-flex justify-content-center">
                <ButtonGroup>
                    <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button disabled={true}>{page}</Button>
                    <Button disabled={commits.length < 30} onClick={() => setPage(page + 1)}>Next</Button>
                </ButtonGroup>
            </div>
        </Container>
    )
}

function News(){
    const [latestReleases, setLatestReleases] = useState<TitleEntryType[]>([])
    const [show, setShow] = React.useState(false);

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


                <h3 className="text-center mt-5">Latest flexNit Features</h3>
                <hr/>
                <ul className="mb-5">

                    <li>Intro location can now be set on a per-episode basis</li>
                    <li>Play next episode button can now be displayed as episode endcard starts</li>
                    <li>Added intro detection for series using <a href="https://projects.software-city.org/p/aivd" target="_blank">AIVD</a></li>
                    <li>User Library is now also auto-syncing with server</li>

                </ul>

                <Button variant="contained" onClick={() => setShow(true)} fullWidth>Show commit history</Button>
            </Container>

            <SwcModal show={show} onHide={() => setShow(false)}>
                <CommitHistory/>
            </SwcModal>
        </>
    )
}

export default News;