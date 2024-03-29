import TitleType from "./titleType";

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
    video_dash: boolean;
    is_nsfw: boolean;
    has_intro: boolean;
    intro_start: number;
}

interface SeriesType extends TitleType{
    episodes: EpisodeType[];
    season_count: number;
    intro_skip: boolean;
    intro_global: boolean;
    intro_start: number;
    intro_length: number;
    endcard: boolean;
    endcard_length: number;
}

export default SeriesType;
export type {EpisodeType};