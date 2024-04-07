import {TransitionGroup} from "react-transition-group";
import {Box, Fade} from "@mui/material";
import React from "react";
import {FocusContext, useFocusable} from "@noriginmedia/norigin-spatial-navigation";

interface SmartTVPageBaseProps {
    children: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[];
    style?: React.CSSProperties;
    className?: string;
}
function SmartTVPageBase(props: SmartTVPageBaseProps){
    const {ref, focusKey} = useFocusable({
        saveLastFocusedChild: true
    })

    return (
        <FocusContext.Provider value={focusKey}>
            <TransitionGroup component={null}>
                <Fade>
                    <Box
                        ref={ref}
                        style={props.style}
                        className={props.className}
                    >{props.children}</Box>
                </Fade>
            </TransitionGroup>
        </FocusContext.Provider>
    )
}

export default SmartTVPageBase;