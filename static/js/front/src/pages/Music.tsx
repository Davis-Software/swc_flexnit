import React, {useEffect} from "react";
import PageBase from "./PageBase";
import SongType from "../types/songType";
import SongList from "../components/music/SongList";
import {SwcFab, SwcFabContainer} from "../components/SwcFab";
import {isAdmin} from "../utils/constants";
import PageLoader from "../components/PageLoader";
import SwcModal from "../components/SwcModal";
import EditSong from "../components/music/EditSong";

function Music(){
    const [songs, setSongs] = React.useState<SongType[]>([])

    const [showEdit, setShowEdit] = React.useState<boolean>(false)
    const [selectedSong, setSelectedSong] = React.useState<SongType | null>(null)

    function handleEdit(song: SongType){
        setSelectedSong(song)
        setShowEdit(true)
    }

    useEffect(() => {
        fetch("/music/files")
            .then(res => res.json())
            .then(setSongs)
    }, []);

    function handleAddSong(){

    }

    return (
        <PageBase>
            <SongList songs={songs} setSelectedSong={handleEdit} />

            <SwcFabContainer>
                <SwcFab icon="add" onClick={handleAddSong} color="primary" tooltip="Add song" hide={!isAdmin} />
            </SwcFabContainer>

            <SwcModal show={selectedSong !== null && showEdit} onHide={() => {}} width="95%">
                <React.Suspense fallback={<PageLoader />}>
                    <EditSong song={selectedSong!} setSong={newSong => {
                        setSongs(prev => prev.map(song => song.uuid === newSong.uuid ? newSong : song))
                    }} setShowEdit={setShowEdit} />
                </React.Suspense>
            </SwcModal>
        </PageBase>
    )
}

export default Music