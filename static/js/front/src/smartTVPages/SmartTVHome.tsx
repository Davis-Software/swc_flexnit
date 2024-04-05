import React, {useEffect} from 'react';
import SmartTVPageBase from "./SmartTVPageBase";
import SmartTVHorizontalTitleList from "../smartTVComponents/titleDisplay/SmartTVHorizontalTitleList";
import TitleEntryType from "../types/titleEntryType";
import fetchUserLibrary from "../fetcher/fetchUserLibrary";
import SmartTVTitlePreview from "../smartTVComponents/titleDisplay/SmartTVTitlePreview";

function SmartTVHome(){
    const [focusedTitle, setFocusedTitle] = React.useState<TitleEntryType | null>(null);
    const [libraryTitles, setLibraryTitles] = React.useState<TitleEntryType[]>([]);

    useEffect(() => {
        fetchUserLibrary().then(setLibraryTitles)
    }, []);

    return (
        <SmartTVPageBase>
            <SmartTVTitlePreview title={focusedTitle} />
            <SmartTVHorizontalTitleList name="Your Library" titles={libraryTitles} setFocusedTitle={setFocusedTitle} />
        </SmartTVPageBase>
    )
}

export default SmartTVHome;