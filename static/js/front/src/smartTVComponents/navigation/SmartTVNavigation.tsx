import React, {useEffect} from "react";
import {FocusContext, useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import FocusableDrawerListItem from "./FocusableDrawerListItem";
import FocusableDrawer from "./FocusableDrawer";


interface SmartTVNavigationProps {
    page: string,
    navItems: {[key: string]: {
        name: string,
        icon: string
    }}
    onNavigate: (key: string) => void
}
function SmartTVNavigation(props: SmartTVNavigationProps){
    const {ref, focusKey, hasFocusedChild, focusSelf} = useFocusable({
        focusKey: "MENU",
        saveLastFocusedChild: true,
        trackChildren: true
    })

    useEffect(() => {
        focusSelf()
    }, []);

    return (
        <FocusContext.Provider value={focusKey}>
            <FocusableDrawer listRef={ref} open={hasFocusedChild} focusChanged={props.onNavigate}>
                {Object.keys(props.navItems).map((key) => (
                    <FocusableDrawerListItem key={key} selected={key === props.page} navItem={{
                        id: key,
                        ...props.navItems[key]
                    }} />
                ))}
            </FocusableDrawer>
        </FocusContext.Provider>
    )
}

export default SmartTVNavigation;