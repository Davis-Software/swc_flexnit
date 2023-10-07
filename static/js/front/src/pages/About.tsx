import React, {useEffect, useState} from "react";
import PageBase from "./PageBase";
import {Button, ButtonGroup, Container} from "@mui/material";
import PageLoader from "../components/PageLoader";
import SwcModal from "../components/SwcModal";

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

function About(){
    const [show, setShow] = useState(false);

    return (
        <PageBase>
            <Container className="pt-5 p-3">
                <h3 className="text-center mt-5">What is FlexNit?</h3>
                <hr/>
                <span>
                    FlexNit is a media server that allows you to stream your favorite movies and TV shows from anywhere.
                    It is custom built by and for SWC members and thus only accessible to them.
                </span>

                <h3 className="text-center mt-5">Updates</h3>
                <hr/>
                <Button variant="contained" onClick={() => setShow(true)} fullWidth>Show commit history</Button>
            </Container>

            <SwcModal show={show} onHide={() => setShow(false)}>
                <CommitHistory/>
            </SwcModal>
        </PageBase>
    )
}

export default About;