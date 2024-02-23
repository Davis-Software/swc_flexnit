import TitleType from "./titleType";

interface MovieType extends TitleType{
    subtitles: boolean;
    subtitle_language: string;
    video_file: string;
    video_info: any;
    video_hls: boolean;
    video_dash: boolean;
}

export default MovieType;