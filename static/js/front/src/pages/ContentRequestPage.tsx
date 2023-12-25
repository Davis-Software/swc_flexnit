import React, {useEffect, useState} from "react";
import PageBase from "./PageBase";
import ContentRequestType from "../types/contentRequestType";
import {SwcFab, SwcFabContainer} from "../components/SwcFab";

function ContentRequestPage(){
    const [userRequests, setUserRequests] = useState<ContentRequestType[]>([])

    const [page, setPage] = useState(1)
    const [reachedEnd, setReachedEnd] = useState(false)
    const [allRequests, setAllRequests] = useState<ContentRequestType[]>([])

    function handleAddRequest(){

    }

    useEffect(() => {
        if(reachedEnd) return
        fetch(`/content_requests?page=${page}`)
            .then(res => res.json())
            .then(data => {
                if(data.length === 0) setReachedEnd(true)
                setAllRequests([...allRequests, ...data])
            })
    }, [page]);
    useEffect(() => {
        fetch("/content_requests?my")
            .then(res => res.json())
            .then(setUserRequests)
    }, []);

    return (
        <PageBase>
            {userRequests.map(ur => ur.id)}
            <hr />
            {allRequests.map(ar => ar.id)}

            <SwcFabContainer>
                <SwcFab icon="add" onClick={handleAddRequest} />
            </SwcFabContainer>
        </PageBase>
    )
}

export default ContentRequestPage;