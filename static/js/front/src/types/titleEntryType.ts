interface TitleEntryType{
    uuid: string
    type: "movie" | "series"
    title: string
    description?: string
    year?: number
    is_nsfw?: boolean
    runtime?: number
    season_count?: number
}

export default TitleEntryType;