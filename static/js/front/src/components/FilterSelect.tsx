import React, {lazy} from "react";
import {Checkbox, ListItemText, MenuItem, Select, SelectChangeEvent, Tooltip} from "@mui/material";
import {isAdmin, user} from "../utils/constants";

const FormControl = lazy(() => import("@mui/material/FormControl"));
const InputLabel = lazy(() => import("@mui/material/InputLabel"));

interface FilterSelectProps {
    id: string;
    label: string;
    value: string[];
    onChange: (val: string[]) => void;
    options: string[];
    disabledOptions?: string[];
    disabledTag?: React.ReactNode;
    onlyShowDisabledToUser?: boolean;
    onlyShowDisabledToAdmin?: boolean;
    allowReverse?: boolean;
    reverseHelp?: string;
}
function FilterSelect(props: FilterSelectProps){
    const [reversed, setReversed] = React.useState(props.value.includes("rev"))

    function handleChange(event: SelectChangeEvent<string[]>){
        const value = event.target.value
        setReversed(value.includes("rev"))
        props.onChange(typeof value === 'string' ? value.split(',') : value)
    }

    function isDisabled(option: string){
        return props.disabledOptions && props.disabledOptions.includes(option)
    }
    function isHidden(option: string){
        return isDisabled(option) && ((props.onlyShowDisabledToUser && !user) || (props.onlyShowDisabledToAdmin && !isAdmin))
    }

    return (
        <div className="col-lg-3 col-md-6 col-sm-12 px-3 py-1">
            <FormControl variant="standard" className="w-100">
                <InputLabel id={props.id + "-label"}>{props.label}</InputLabel>
                <Select
                    labelId={props.id + "-label"}
                    id={props.id}
                    multiple
                    value={props.value}
                    onChange={handleChange}
                    renderValue={selected => selected.join(', ')}
                >
                    {props.options.map((option, index) => (
                        <MenuItem key={index} value={option} disabled={isDisabled(option)} hidden={isHidden(option)}>
                            <Checkbox checked={props.value.indexOf(option) > -1} />
                            <ListItemText primary={option} />
                            {props.disabledOptions && props.disabledOptions.includes(option) && (
                                <span className="badge bg-danger rounded-pill">{props.disabledTag}</span>
                            )}
                        </MenuItem>
                    ))}
                    {props.allowReverse && <hr />}
                    {props.allowReverse && (
                        <MenuItem value="rev" disabled={props.disabledOptions && props.disabledOptions.length > 0}>
                            <Checkbox checked={reversed} />
                            <ListItemText primary="Reverse Search" />
                            {props.reverseHelp && (
                                <Tooltip title={props.reverseHelp}>
                                    <span className="material-icons">help</span>
                                </Tooltip>
                            )}
                        </MenuItem>

                    )}
                </Select>
            </FormControl>
        </div>
    )
}

export default FilterSelect