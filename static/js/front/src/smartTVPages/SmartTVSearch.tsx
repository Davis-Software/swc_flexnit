import React from 'react';
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";

function SmartTVHome(){
    const {ref, focused} = useFocusable()

    return (
        <div ref={ref} style={{width: "400px", height: "200px", marginLeft: "200px"}}>
            {focused ? "focused search" : "TVSearch"}
        </div>
    )
}

export default SmartTVHome;