import React, {useEffect} from 'react';
import SmartTVPageBase from "./SmartTVPageBase";
import SmartTVHorizontalTitleList from "../smartTVComponents/titleDisplay/SmartTVHorizontalTitleList";
import TitleEntryType from "../types/titleEntryType";
import fetchUserLibrary from "../fetcher/fetchUserLibrary";
import SmartTVTitlePreview from "../smartTVComponents/titleDisplay/SmartTVTitlePreview";
import fetchSearchAll from "../fetcher/fetchSearchAll";
import SmartTVGridTitleList from "../smartTVComponents/titleDisplay/SmartTVGridTitleList";

function SmartTVHome(){
    const [focusedTitle, setFocusedTitle] = React.useState<TitleEntryType | null>(null);
    const [libraryTitles, setLibraryTitles] = React.useState<TitleEntryType[]>([]);
    const [titles, setTitles] = React.useState<TitleEntryType[]>([]);

    useEffect(() => {
        fetchUserLibrary().then(setLibraryTitles);
        fetchSearchAll().then(setTitles);
    }, []);

    return (
        <SmartTVPageBase>
            <SmartTVTitlePreview title={focusedTitle} />
            {libraryTitles.length > 0 && (
                <SmartTVHorizontalTitleList
                    name="Your Library"
                    titles={libraryTitles}
                    setFocusedTitle={setFocusedTitle}
                />
            )}
            <SmartTVGridTitleList name="More Titles" titles={titles} setFocusedTitle={setFocusedTitle} />
        </SmartTVPageBase>
    )
}

export default SmartTVHome;