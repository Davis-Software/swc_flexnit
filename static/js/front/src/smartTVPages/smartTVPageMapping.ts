import React, {lazy, LazyExoticComponent} from "react";
import {user} from "../utils/constants";

const SmartTVHome = lazy(() => import('../smartTVPages/SmartTVHome'));
const SmartTVSearch = lazy(() => import('../smartTVPages/SmartTVSearch'));
const SmartTVTitleEntryInfo = lazy(() => import('./SmartTVTitleEntryInfo'));
const SmartTVWatch = lazy(() => import('../smartTVPages/SmartTVWatch'));
const SmartTVSettings = lazy(() => import('../smartTVPages/SmartTVSettings'));
const SmartTVUser = lazy(() => import('../smartTVPages/SmartTVUser'));

interface PageMappingInterface {
    [key: string]: {
        name: string,
        component: LazyExoticComponent<() => React.JSX.Element>,
        icon?: string,
        spawn?: boolean
    }
}
const smartTVPageMapping: PageMappingInterface = {
    "home": {
        name: "Home",
        icon: "home",
        component: SmartTVHome,
        spawn: true
    },
    "search": {
        name: "Search",
        icon: "search",
        component: SmartTVSearch,
        spawn: true
    },
    "info": {
        name: "Info",
        component: SmartTVTitleEntryInfo
    },
    "watch": {
        name: "Watch",
        component: SmartTVWatch
    },
    "settings": {
        name: "Settings",
        component: SmartTVSettings
    },
    "user": {
        name: user,
        component: SmartTVUser
    }
}

export default smartTVPageMapping;