import TitleEntryType from "../types/titleEntryType";

async function fetchUserLibrary(libraryPass?: { [key: string]: any }) {
    let library = libraryPass || JSON.parse(localStorage.getItem("library") || "{}")
    const playbackProgress = JSON.parse(localStorage.getItem("playbackProgress") || "{}")

    const res = await fetch("/search/all");
    const titles: TitleEntryType[] = await res.json();
    return (
        titles.filter(title => (!!playbackProgress[title.uuid] && !(library[title.type] && library[title.type][title.uuid])) ||
        (library[title.type] && library[title.type][title.uuid] && library[title.type][title.uuid].showInLibrary))
    )
}

export default fetchUserLibrary;