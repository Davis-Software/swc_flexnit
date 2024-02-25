import React from "react";
import {Autocomplete, Chip, TextField, TextFieldProps} from "@mui/material";

interface CategoryInputProps {
    categories: string[];
    selectedCategories: string[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
    autoCompleteProps?: {
        multiple: boolean;
        freeSolo: boolean;
    }
    textFieldProps?: TextFieldProps;
    className?: string;
}
function CategoryInput({ categories, selectedCategories, setSelectedCategories, ...props }: CategoryInputProps) {
    return (
        <Autocomplete
            className={props.className}
            renderInput={(params) => (
                <TextField
                    variant="standard"
                    {...params}
                    {...props.textFieldProps}
                />
            )}
            renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
            }
            options={categories}
            value={selectedCategories}
            onChange={(e, newValue) => setSelectedCategories(newValue && typeof newValue === "object" ? newValue : [])}
            {...props.autoCompleteProps}
        />
    )
}

export default CategoryInput;
