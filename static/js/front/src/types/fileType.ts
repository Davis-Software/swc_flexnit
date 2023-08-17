interface FileType{
    name: string;
    size: number;
}
interface AdvancedFileType{
    filename: string;
    size: number;
    display_name: string;
    is_dir: boolean;
    not_found: boolean;
}

export default FileType;
export type {AdvancedFileType};