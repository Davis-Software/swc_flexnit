import React, {createElement, lazy, LazyExoticComponent, useState} from "react";

import { init } from '@noriginmedia/norigin-spatial-navigation';
init({
    // debug: process.env.NODE_ENV === 'development',
})

const SmartTVNavigation = lazy(() => import('../smartTVComponents/navigation/SmartTVNavigation'));
const SmartTVHome = lazy(() => import('../smartTVPages/SmartTVHome'));
const SmartTVSearch = lazy(() => import('../smartTVPages/SmartTVSearch'));

interface PageMappingInterface {
    [key: string]: {
        name: string,
        icon: string,
        component: LazyExoticComponent<() => React.JSX.Element>
    }
}
const pageMapping: PageMappingInterface = {
    "home": {
        name: "Home",
        icon: "home",
        component: SmartTVHome
    },
    "search": {
        name: "Search",
        icon: "search",
        component: SmartTVSearch
    }
}

function SmartTVEntry(){
    const [page, setPage] = useState('home');

    return (
        <>
            <SmartTVNavigation page={page} navItems={pageMapping} onNavigate={setPage} />
            <div style={{paddingLeft: "65px"}}>
                {createElement(pageMapping[page].component)}
            </div>
        </>
    )
}

export default SmartTVEntry;