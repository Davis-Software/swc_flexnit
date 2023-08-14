import React from "react";
import {TransitionGroup} from "react-transition-group";
import {Fade} from "@mui/material";

interface PageBaseProps {
    children: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[];
    style?: React.CSSProperties;
    className?: string;
}
function PageBase(props: PageBaseProps) {
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

export default PageBase;