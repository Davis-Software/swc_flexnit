interface FileType{
    name: string;
    size: number;
    display_name: string;
}
interface AdvancedFileType{
    filename: string;
    size: number;
    display_name: string;
    is_dir: boolean;
    not_found: boolean;
    video_info?: any
}

export default FileType;
export type {AdvancedFileType};