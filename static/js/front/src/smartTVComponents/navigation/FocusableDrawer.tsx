import React from "react";
import {Box, CSSObject, Drawer as MuiDrawer, Fade, List, styled, Theme} from "@mui/material";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

interface FocusableDrawerContextInterface {
    open: boolean,
    focusChanged?: (key: string) => void,
}
const FocusableDrawerContext = React.createContext<FocusableDrawerContextInterface>({
    open: false
})

const brandStyle: any = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translateX(-50%) translateY(-30%)",
}
interface BrandProps {
    open: boolean,
}
function Brand(props: BrandProps){
    return (
        <Box sx={{height: "26px", position: "relative", paddingBottom: "20px"}}>
            <Fade in={props.open}>
                <img src="/static/img/icon.png" alt="FlexNit" style={{width: "100px", ...brandStyle}}/>
            </Fade>
            <Fade in={!props.open}>
                <img src="/static/img/favicon-256.png" alt="FlexNit" style={{width: "25px", ...brandStyle}}/>
            </Fade>
        </Box>
    )
}

interface FocusableDrawerProps {
    open: boolean,
    listRef: React.RefObject<HTMLUListElement>,
    children: React.ReactNode | React.ReactNode[],
    focusChanged?: (key: string) => void,
}
function FocusableDrawer(props: FocusableDrawerProps){
    return (
        <FocusableDrawerContext.Provider value={{open: props.open, focusChanged: props.focusChanged}}>
            <Drawer variant="permanent" open={props.open}>
                <Brand open={props.open} />
                <List ref={props.listRef}>
                    {props.children}
                </List>
            </Drawer>
        </FocusableDrawerContext.Provider>
    )
}

export default FocusableDrawer;
export {FocusableDrawerContext};