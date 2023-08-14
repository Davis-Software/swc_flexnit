import React from "react";
import {CircularProgress} from "@mui/material";

function FallbackLoader(){
    return (
        <div className="text-center">
            <CircularProgress size={20} />
        </div>
    )
}

export default FallbackLoader