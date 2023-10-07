interface TitleEntryType{
    uuid: string
    type: "movie" | "series" | "episode"
    title: string
    description: string
    year?: number
    is_nsfw?: boolean
    runtime?: number
    season_count?: number
    series?: TitleEntryType,
    hls?: boolean
}

export default TitleEntryType;