import React from "react";
import {Container} from "@mui/material";

function News(){
    return (
        <Container className="pt-5 p-3">
            <h3 className="text-center">Latest Features</h3>
            <hr/>

            <ul>

                <li>Intro location can now be set on a per-episode basis</li>
                <li>Play next episode button can now be displayed as episode endcard starts</li>
                <li>Added intro detection for series using <a href="https://projects.software-city.org/p/aivd" target="_blank">AIVD</a></li>

            </ul>

            <h5 className="mt-5">Change history</h5>
            <hr/>

            <ul>

                <li>Added a intro skip button for episodes</li>
                <li>Added a play next episode button for episodes</li>

            </ul>
        </Container>
    )
}

export default News;