import React from 'react';
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import {Box} from "@mui/material";

function SmartTVUser(){
    const {ref, focused} = useFocusable()

    return (
        <Box ref={ref} style={{width: "400px", height: "200px", marginLeft: "200px"}}>
            {focused ? "focused user" : "TVUser"}
        </Box>
    )
}

export default SmartTVUser;