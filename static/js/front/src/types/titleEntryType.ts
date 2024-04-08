interface TitleEntryType{
    uuid: string
    type: "movie" | "series" | "episode" | "episode_group"
    tags: string
    title?: string
    description?: string
    year?: string
    is_nsfw?: boolean
    runtime?: number
    season_count?: number
    series?: TitleEntryType,
    hls?: boolean
    dash?: boolean
    episodes?: number
}

export default TitleEntryType;