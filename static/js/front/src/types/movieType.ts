interface MovieType{
    id: number;
    uuid: string;
    title: string;
    year: string;
    description: string;
    language: string;
    subtitles: boolean;
    subtitle_language: string;
    is_visible: boolean;
    is_nsfw: boolean;
    added_on: number;
    video_file: string;
    video_info: any;
    video_hls: boolean;
    video_dash: boolean;
}

export default MovieType;