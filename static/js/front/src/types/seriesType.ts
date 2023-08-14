interface EpisodeType{
    id: number;
    uuid: string;
    title: string;
    description: string;
    season: number;
    episode: number;
    video_file: string;
    video_info: any;
    video_hls: boolean;
}

interface SeriesType{
    id: number;
    uuid: string;
    title: string;
    year: number;
    description: string;
    language: string;
    is_visible: boolean;
    is_nsfw: boolean;
    added_on: number;
    episodes: EpisodeType[];
    season_count: number;
}

export default SeriesType;
export type {EpisodeType};