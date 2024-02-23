interface TitleType {
    id: number;
    uuid: string;
    title: string;
    tags: string;
    description: string;
    year: string;
    language: string;
    is_visible: boolean;
    is_nsfw: boolean;
    added_on: number;
}

export default TitleType;
