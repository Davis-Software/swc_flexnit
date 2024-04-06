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
    const [tags, setTags] = React.useState<string[]>([]);

    useEffect(() => {
        fetchUserLibrary().then(setLibraryTitles);
        fetchSearchAll().then(setTitles);
    }, []);
    useEffect(() => {
        let tagList: string[] = [];
        titles.forEach(title => {
            if(!title.tags || title.tags === "") return;
            title.tags.split(",").forEach(tag => {
                if(!tagList.includes(tag)) tagList.push(tag);
            })
        })
        setTags(tagList);
    }, [titles]);

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
            {tags.length > 0 ? (
                <>
                    {tags.map(tag => (
                        <SmartTVGridTitleList
                            key={tag}
                            name={tag}
                            titles={titles.filter(title => title.tags?.split(",").includes(tag))}
                            setFocusedTitle={setFocusedTitle}
                        />
                    ))}
                    <SmartTVGridTitleList
                        name="Other Titles"
                        titles={titles.filter(title => !title.tags || title.tags === "")}
                        setFocusedTitle={setFocusedTitle}
                    />
                </>
            ) : (
                <SmartTVGridTitleList name="More Titles" titles={titles} setFocusedTitle={setFocusedTitle} />
            )}
        </SmartTVPageBase>
    )
}

export default SmartTVHome;