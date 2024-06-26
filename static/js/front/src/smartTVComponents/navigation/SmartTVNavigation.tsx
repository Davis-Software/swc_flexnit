import React, {createContext, useContext, useEffect} from "react";
import {FocusContext, setFocus, useFocusable, doesFocusableExist} from "@noriginmedia/norigin-spatial-navigation";
import FocusableDrawerListItem from "./FocusableDrawerListItem";
import FocusableDrawer from "./FocusableDrawer";
import {isAdminSet, user} from "../../utils/constants";
import {Avatar, Badge} from "@mui/material";

interface NavigationContextType {
    page: string
    state?: any
    navigate: (page: string, state?: any) => void
}
const NavigationContext = createContext<NavigationContextType>({
    page: 'home',
    navigate: () => {}
})
function useNavigation(){
    return useContext(NavigationContext)
}

function LowerNav(){
    return (
        <>
            <FocusableDrawerListItem navItem={{
                id: "settings",
                name: "Settings",
                icon: "settings"
            }} />
            <FocusableDrawerListItem navItem={{
                id: "user",
                name: user,
                icon: (
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        color="primary"
                        badgeContent={isAdminSet ? "A" : ""}
                        invisible={!isAdminSet}
                    >
                        <Avatar alt={user} src={`https://interface.software-city.org/user?avatar=${user}`} />
                    </Badge>
                )
            }} />
        </>
    )
}


interface SmartTVNavigationProps {
    page: string,
    navItems: {
        id: string,
        name: string,
        icon?: string
    }[]
    onNavigate: (key: string) => void
    setFocus?: boolean
}
function SmartTVNavigation(props: SmartTVNavigationProps){
    const {ref, focusKey, hasFocusedChild, focusSelf} = useFocusable({
        focusKey: "MENU",
        saveLastFocusedChild: true,
        trackChildren: true,
        autoRestoreFocus: true,
        forceFocus: true
    })

    useEffect(() => {
        if(!props.setFocus) return
        focusSelf()
    }, []);
    function handleFocusOut(){
        if(!doesFocusableExist("ENTRY")) return
        setFocus("ENTRY")
    }

    return (
        <FocusContext.Provider value={focusKey}>
            <FocusableDrawer
                listRef={ref}
                open={hasFocusedChild}
                focusChanged={props.onNavigate}
                leaveFocus={handleFocusOut}
                lowerChildren={<LowerNav />}
            >
                {props.navItems.map((navItem, i) => (
                    <FocusableDrawerListItem key={i} selected={navItem.id === props.page} navItem={navItem} />
                ))}
            </FocusableDrawer>
        </FocusContext.Provider>
    )
}

export default SmartTVNavigation;
export {NavigationContext, useNavigation};