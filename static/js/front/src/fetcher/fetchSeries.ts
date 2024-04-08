import TitleEntryType from "../types/titleEntryType";
import SeriesType from "../types/seriesType";

async function fetchSeries(uuid: string | TitleEntryType) {
    const res = await fetch(`/series/${typeof uuid === "string" ? uuid : uuid.uuid}`);
    const episodeInfo: SeriesType = await res.json();
    return episodeInfo;
}

export default fetchSeries;