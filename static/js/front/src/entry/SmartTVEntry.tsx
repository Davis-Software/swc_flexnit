import React, {createElement, lazy, Suspense, useEffect, useState} from "react";

import { init } from '@noriginmedia/norigin-spatial-navigation';
import PageLoader from "../components/PageLoader";
import pageMapping from "../smartTVPages/smartTVPageMapping";
import {setWindowTitle} from "../utils/navigation";
import {Box} from "@mui/material";
import { NavigationContext } from "../smartTVComponents/navigation/SmartTVNavigation";

init({
    // debug: process.env.NODE_ENV === 'development',
})

const SmartTVNavigation = lazy(() => import('../smartTVComponents/navigation/SmartTVNavigation'));


function SmartTVEntry(){
    const [page, setPage] = useState('home');
    const [pageState, setPageState] = useState<any>();
    const navItems = Object.keys(pageMapping).filter((key) => pageMapping[key].spawn).map(key => ({
        id: key,
        ...pageMapping[key]
    }))

    useEffect(() => {
        setWindowTitle("TV App")
    }, []);
    function handleNavigate(page: string, state?: any){
        setPage(page)
        setPageState(state)
    }

    const hideNavigation = page === "watch"

    return (
        <>
            {!hideNavigation && (
                <SmartTVNavigation page={page} navItems={navItems} onNavigate={setPage} />
            )}
            <Box style={{paddingLeft: hideNavigation? "0" : "65px"}}>
                <Suspense fallback={<PageLoader />}>
                    <NavigationContext.Provider value={{ page, state: pageState, navigate: handleNavigate }}>
                        {pageMapping[page] ? createElement(pageMapping[page].component) : null}
                    </NavigationContext.Provider>
                </Suspense>
            </Box>
        </>
    )
}

export default SmartTVEntry;