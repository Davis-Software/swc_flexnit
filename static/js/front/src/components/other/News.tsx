import React, {useEffect} from "react";
import {Button, Container} from "@mui/material";
import SwcModal from "../SwcModal";
import PageLoader from "../PageLoader";

function CommitHistory(){
    const [commits, setCommits] = React.useState<any[]>([]);

    useEffect(() => {
        fetch('https://api.github.com/repos/Davis-Software/swc_flexnit/commits')
            .then(res => res.json())
            .then(setCommits)
            .catch(console.error)
    }, []);

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
        </Container>
    )
}

function News(){
    const [show, setShow] = React.useState(false);

    return (
        <>
            <Container className="pt-5 p-3">
                <h3 className="text-center">Latest flexNit Features</h3>
                <hr/>

                <ul className="mb-5">

                    <li>Intro location can now be set on a per-episode basis</li>
                    <li>Play next episode button can now be displayed as episode endcard starts</li>
                    <li>Added intro detection for series using <a href="https://projects.software-city.org/p/aivd" target="_blank">AIVD</a></li>

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