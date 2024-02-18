import React from "react";
import {Button, Tooltip} from "@mui/material";

interface HoverMenuProps {
    placement: "top" | "bottom" | "left" | "right"
    children: React.ReactNode
    icon: string
}
function HoverMenu(props: HoverMenuProps){
    return (
        <Tooltip title={props.children} placement={props.placement} arrow>
            <Button variant="text" size="large">
                <i className="material-icons" style={{fontSize: "2rem"}}>{props.icon}</i>
            </Button>
        </Tooltip>
    )
}

export default HoverMenu
