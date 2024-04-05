import TitleEntryType from "../types/titleEntryType";

async function fetchSearchAll() {
    const res = await fetch("/search/all");
    const titles: TitleEntryType[] = await res.json();
    return titles;
}

export default fetchSearchAll;