import {TransitionGroup} from "react-transition-group";
import {Fade} from "@mui/material";
import React from "react";

interface SmartTVPageBaseProps {
    children: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[];
    style?: React.CSSProperties;
    className?: string;
}
function SmartTVPageBase(props: SmartTVPageBaseProps){
    return (
        <TransitionGroup component={null}>
            <Fade>
                <div
                    style={props.style}
                    className={props.className}
                >{props.children}</div>
            </Fade>
        </TransitionGroup>
    )
}

export default SmartTVPageBase;