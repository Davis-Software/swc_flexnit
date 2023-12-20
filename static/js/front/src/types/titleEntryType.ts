interface TitleEntryType{
    uuid: string
    type: "movie" | "series" | "episode" | "episode_group"
    title?: string
    description?: string
    year?: string
    is_nsfw?: boolean
    runtime?: number
    season_count?: number
    series?: TitleEntryType,
    hls?: boolean
    episodes?: number
}

export default TitleEntryType;