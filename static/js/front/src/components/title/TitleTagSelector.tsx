import CategoryInput from "../CategoryInput";
import React, {useEffect} from "react";
import {Button, CircularProgress} from "@mui/material";

interface TitleTagSelectorProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}
function TitleTagSelector({ tags, setTags }: TitleTagSelectorProps) {
    const [loadedTags, setLoadedTags] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(true);

    function fetchTags() {
        fetch("/tags")
            .then((res) => res.json())
            .then(ts => {
                setLoadedTags(ts);
                setLoading(false);
            })
    }
    useEffect(() => {
        fetchTags();
    }, []);

    return (
        <div className="d-flex ">
            <CategoryInput
                className="flex-grow-1"
                categories={loadedTags}
                selectedCategories={tags}
                setSelectedCategories={setTags}
                autoCompleteProps={{
                    multiple: true,
                    freeSolo: true
                }}
                textFieldProps={{
                    label: "Tags",
                    disabled: loading
                }}
            />
            <Button size="small" variant="text" disabled={loading} onClick={fetchTags}>
                {loading ? <CircularProgress size={20} /> : <i className="material-icons">refresh</i>}
            </Button>
        </div>
    )
}

export default TitleTagSelector;
