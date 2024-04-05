import React from 'react';
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";

function SmartTVHome(){
    const {ref, focused} = useFocusable()

    return (
        <div ref={ref}>
            {focused ? "focused search" : "TVSearch"}
        </div>
    )
}

export default SmartTVHome;