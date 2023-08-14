import React from "react";
import {Fab, Tooltip, Zoom} from "@mui/material";
import {TransitionGroup} from "react-transition-group";
import {gatherSubProps} from "../utils/propUtils";

interface SwcFabContainerProps {
    children: React.ReactNode | React.ReactNode[]
    flexDirection?: "row" | "column"
    bottom?: number
    right?: number
    hide?: boolean
}
function SwcFabContainer(props: SwcFabContainerProps) {
    const style = {
        bottom: props.bottom || 16,
        right: props.right || 16,
        display: "flex",
        flexDirection: props.flexDirection || "row"
    }

    return !props.hide ? (
        <div className="position-absolute" style={style}>
            <TransitionGroup component={null}>
                {props.children}
            </TransitionGroup>
        </div>
    ) : <></>
}

interface SwcFabProps {
    icon: string | React.ReactNode
    onClick: () => void
    color?: "primary" | "secondary" | "inherit" | "default" | "success" | "error" | "info" | "warning" | undefined
    tooltip?: string
    tooltipPlacement?: "top" | "right" | "bottom" | "left"
    [key: string]: any
}
function SwcFab(props: SwcFabProps) {
    const eProps = gatherSubProps(
        props,
        ["icon", "onClick", "color", "tooltip", "tooltipPlacement"]
    )

    return (
        <Zoom {...eProps}>
            <Tooltip
                title={props.tooltip || ""}
                placement={props.tooltipPlacement || "top"}
                TransitionComponent={Zoom}
            >
                <Fab
                    className="ms-3 mt-3"
                    color={props.color}
                    onClick={props.onClick}
                >
                    {typeof props.icon === "string" ? <i className="material-icons">{props.icon}</i> : props.icon}
                </Fab>
            </Tooltip>
        </Zoom>
    )
}

export {SwcFabContainer, SwcFab};