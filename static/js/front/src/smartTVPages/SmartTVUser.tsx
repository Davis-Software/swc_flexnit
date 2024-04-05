import React from 'react';
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";

function SmartTVUser(){
    const {ref, focused} = useFocusable()

    return (
        <div ref={ref} style={{width: "400px", height: "200px", marginLeft: "200px"}}>
            {focused ? "focused user" : "TVUser"}
        </div>
    )
}

export default SmartTVUser;