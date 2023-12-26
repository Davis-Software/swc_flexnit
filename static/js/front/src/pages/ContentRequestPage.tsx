import React, {useEffect, useState} from "react";
import PageBase from "./PageBase";
import ContentRequestType from "../types/contentRequestType";
import {SwcFab, SwcFabContainer} from "../components/SwcFab";
import SwcModal from "../components/SwcModal";
import PageLoader from "../components/PageLoader";
import {user} from "../utils/constants";
import {
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import {useIsAdmin} from "../contexts/showAdminContext";

const EditContentRequest = React.lazy(() => import("../components/contentRequest/EditContentRequest"));

interface ContentRequestTableRowProps {
    cr: ContentRequestType;
    setCr: (cr: ContentRequestType) => void;
    onEditRequest: (contentRequest: ContentRequestType) => void;
}
function ContentRequestTableRow(props: ContentRequestTableRowProps){
    const isAdmin = useIsAdmin()

    function handleSetStatus(status: string){
        const formData = new FormData();
        formData.append("id", props.cr.id.toString());
        formData.append("status", status);
        fetch(`/content_requests`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(props.setCr)
    }

    return (
        <TableRow key={props.cr.id}>
            <TableCell>{props.cr.content_type}</TableCell>
            <TableCell>{props.cr.content_title}</TableCell>
            <TableCell>{isAdmin ? (
                <FormControl fullWidth>
                    <InputLabel>Content Type</InputLabel>
                    <Select
                        value={props.cr.status}
                        variant="standard"
                        onChange={e => handleSetStatus(e.target.value as string)}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="added">Added</MenuItem>
                        <MenuItem value="denied">Denied</MenuItem>
                    </Select>
                </FormControl>
            ) : props.cr.status}</TableCell>
            <TableCell padding="checkbox">
                <IconButton
                    onClick={() => props.onEditRequest(props.cr)}
                    disabled={user !== props.cr.username && !isAdmin}
                    color="warning"
                >
                    <i className="material-icons">edit</i>
                </IconButton>
            </TableCell>
        </TableRow>
    )
}

interface ContentRequestTableProps {
    contentRequests: ContentRequestType[];
    setContentRequests: React.Dispatch<React.SetStateAction<ContentRequestType[]>>;
    onEditRequest: (contentRequest: ContentRequestType) => void;
    displayFilter?: (cr: ContentRequestType) => boolean;
}
function ContentRequestTable(props: ContentRequestTableProps){
    function handleStatusCHanged(contentRequest: ContentRequestType){
        props.setContentRequests(prev => {
            const index = prev.findIndex(cr => cr.id === contentRequest.id)
            if(index === -1) return prev
            return [...prev.slice(0, index), contentRequest, ...prev.slice(index + 1)]
        })
    }

    return props.contentRequests.filter(props.displayFilter || (() => true)).length > 0 ? (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell padding="checkbox"></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.contentRequests.filter(props.displayFilter || (() => true)).map(cr => (
                    <ContentRequestTableRow
                        key={cr.id}
                        cr={cr}
                        setCr={handleStatusCHanged}
                        onEditRequest={props.onEditRequest}
                    />
                ))}
            </TableBody>
        </Table>
    ) : (
        <div className="text-center">
            <p>No content requests found</p>
        </div>
    )
}

let firstLoad = true
let reachedEnd = false
function ContentRequestPage(){
    const [showEdit, setShowEdit] = useState(false)
    const [editContentRequestId, setEditContentRequestId] = useState<number | null>(null)

    const [userRequests, setUserRequests] = useState<ContentRequestType[]>([])

    const [page, setPage] = useState(1)
    const [allRequests, setAllRequests] = useState<ContentRequestType[]>([])

    function handleAddRequest(){
        setEditContentRequestId(null)
        setShowEdit(true)
    }
    function handleEditRequest(contentRequest: ContentRequestType){
        setEditContentRequestId(contentRequest.id)
        setShowEdit(true)
    }
    function handleEditComplete(contentRequest: ContentRequestType, del?: boolean){
        setShowEdit(false)
        function adder(prev: ContentRequestType[]){
            const index = prev.findIndex(cr => cr.id === contentRequest.id)
            if(index === -1){
                if(del) return prev
                return [...prev, contentRequest]
            }
            if(del) return [...prev.slice(0, index), ...prev.slice(index + 1)]
            return [...prev.slice(0, index), contentRequest, ...prev.slice(index + 1)]
        }
        setAllRequests(adder)
        setUserRequests(adder)
    }

    useEffect(() => {
        if(reachedEnd) return
        fetch(`/content_requests?page=${page}`)
            .then(res => res.json())
            .then(data => {
                if(data.length === 0) reachedEnd = true
                setAllRequests([...allRequests, ...data])
                if(firstLoad) firstLoad = false
            })
    }, [page]);
    useEffect(() => {
        fetch("/content_requests?my")
            .then(res => res.json())
            .then(setUserRequests)
    }, []);

    function updatePage(){
        if(firstLoad || reachedEnd) return
        // @ts-ignore
        if((window.scrollY + 5) < window.scrollMaxY) return
        setPage(page + 1)
    }
    useEffect(() => {
        window.addEventListener("scroll", updatePage)
        return () => {
            window.removeEventListener("scroll", updatePage)
        }
    }, [])

    return (
        <PageBase className="container-fluid">
            <div className="text-center py-4">
                <h1>Content Requests</h1>
            </div>
            <h2>My Requests</h2>
            <ContentRequestTable
                contentRequests={userRequests}
                setContentRequests={setUserRequests}
                onEditRequest={handleEditRequest}
            />
            <hr />
            <h2>All Requests</h2>
            <ContentRequestTable
                contentRequests={allRequests}
                setContentRequests={setAllRequests}
                onEditRequest={handleEditRequest}
                displayFilter={cr => cr.username !== user}
            />

            <SwcFabContainer>
                <SwcFab icon="add" color="primary" onClick={handleAddRequest} />
            </SwcFabContainer>
            <SwcModal show={showEdit} onHide={() => setShowEdit(false)} width="95%">
                <React.Suspense fallback={<PageLoader />}>
                    <EditContentRequest
                        contentRequest={allRequests.find(ar => ar.id === editContentRequestId) || null}
                        setContentRequest={handleEditComplete}
                        setShowEdit={setShowEdit}
                    />
                </React.Suspense>
            </SwcModal>
        </PageBase>
    )
}

export default ContentRequestPage;