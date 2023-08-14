interface MovieType{
    id: number;
    uuid: string;
    title: string;
    year: number;
    description: string;
    language: string;
    subtitles: boolean;
    is_visible: boolean;
    is_nsfw: boolean;
    added_on: number;
    video_file: string;
    video_info: any;
    video_hls: boolean;
}

export default MovieType;