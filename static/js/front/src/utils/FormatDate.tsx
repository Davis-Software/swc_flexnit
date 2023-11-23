import React from "react"
import {Tooltip} from "@mui/material";

function getTimeString(seconds: number, showNothing: boolean = false, nothing: string = "-"){
    if(!seconds && showNothing) return nothing
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const seconds2 = Math.round(seconds % 60);
    return `${hours > 0 ? hours + "h" : ""} ${minutes > 0 ? minutes + "m" : ""} ${seconds2 > 0 ? seconds2 + "s" : ""}`
}

function FormatDate(props: { children: Date }) {
    return (
        <Tooltip title={`at ${props.children.toLocaleTimeString(["de"])}`} arrow>
            <span>{props.children.toLocaleDateString(["de"])}</span>
        </Tooltip>
    )
}

export default FormatDate
export {getTimeString}