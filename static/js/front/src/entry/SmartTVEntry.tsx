import React, {createElement, lazy, LazyExoticComponent, useState} from "react";

const SmartTVHome = lazy(() => import('../smartTVPages/SmartTVHome'));

interface PageMappingInterface {
    [key: string]: LazyExoticComponent<() => React.JSX.Element>
}
const pageMapping: PageMappingInterface = {
    "home": SmartTVHome,
}

function SmartTVEntry(){
    const [page, setPage] = useState('home');

    return (
        <>
            {createElement(pageMapping[page])}
        </>
    )
}

export default SmartTVEntry;