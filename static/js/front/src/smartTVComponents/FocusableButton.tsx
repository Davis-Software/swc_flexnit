import React from "react";
import {Button, ButtonProps} from "@mui/material";
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";

function FocusableButton(props: ButtonProps){
    const {ref, focused} = useFocusable({
        onEnterPress: props.onClick
    })

    return <Button
        ref={ref}
        sx={{
            border: focused ? "8px solid #b5b" : "8px solid transparent",
        }}
        {...props}
    />
}

export default FocusableButton;