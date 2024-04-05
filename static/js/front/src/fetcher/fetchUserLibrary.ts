import TitleEntryType from "../types/titleEntryType";
import fetchSearchAll from "./fetchSearchAll";

async function fetchUserLibrary(libraryPass?: { [key: string]: any }) {
    let library = libraryPass || JSON.parse(localStorage.getItem("library") || "{}")
    const playbackProgress = JSON.parse(localStorage.getItem("playbackProgress") || "{}")

    const titles: TitleEntryType[] = await fetchSearchAll()
    return (
        titles.filter(title => (!!playbackProgress[title.uuid] && !(library[title.type] && library[title.type][title.uuid])) ||
            (library[title.type] && library[title.type][title.uuid] && library[title.type][title.uuid].showInLibrary))
    )
}

export default fetchUserLibrary;