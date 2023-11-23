interface SongType{
    id: number;
    uuid: string;
    title: string;
    description: string;
    artists: string;
    album: string;
    audio_info: {[key: string]: any};
}

export default SongType;