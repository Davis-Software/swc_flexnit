import React, {createElement, lazy, Suspense, useEffect, useState} from "react";

import { init } from '@noriginmedia/norigin-spatial-navigation';
import PageLoader from "../components/PageLoader";
import pageMapping from "../smartTVPages/smartTVPageMapping";
import {setWindowTitle} from "../utils/navigation";

init({
    // debug: process.env.NODE_ENV === 'development',
})

const SmartTVNavigation = lazy(() => import('../smartTVComponents/navigation/SmartTVNavigation'));

function SmartTVEntry(){
    const [page, setPage] = useState('home');
    const navItems = Object.keys(pageMapping).filter((key) => pageMapping[key].spawn).map(key => ({
        id: key,
        ...pageMapping[key]
    }))

    useEffect(() => {
        setWindowTitle("TV App")
    }, []);

    return (
        <>
            <SmartTVNavigation page={page} navItems={navItems} onNavigate={setPage} />
            <div style={{paddingLeft: "65px"}}>
                <Suspense fallback={<PageLoader />}>
                    {pageMapping[page] ? createElement(pageMapping[page].component) : null}
                </Suspense>
            </div>
        </>
    )
}

export default SmartTVEntry;