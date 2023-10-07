import React, {useEffect} from "react";
import {Button, ButtonTypeMap, MenuItem, Typography} from "@mui/material";
import {navigateTo} from "../../utils/navigation";

interface NavButtonProps {
    children: string
    target: string
    noButton?: boolean
    onClick?: () => void
    className?: string
}
function NavButton(props: NavButtonProps){
    const [color, setColor] = React.useState<ButtonTypeMap["props"]["color"]>("inherit")

    useEffect(() => {
        if(window.location.pathname === props.target){
            setColor("primary")
        }else{
            setColor("inherit")
        }
    }, [props.target, window.location.pathname])

    function handleClick(){
        props.onClick?.()
        if(props.target.startsWith("/")){
            navigateTo(props.target)
        }else{
            window.open(props.target, "_blank")
        }
    }
    function handleMiddleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent> | any){
        if(e.button !== 1 && e.buttons !== 4) return
        props.onClick?.()
        window.open(props.target, "_blank")
    }

    return !props.noButton ? (
        <Button
            color={color}
            onClick={handleClick}
            onMouseDown={handleMiddleClick}
            className={props.className}
        >{props.children}</Button>
    ) : (
        <MenuItem onClick={handleClick} onMouseDown={handleMiddleClick}>
            <Typography
                color={color}
                className={props.className}
            >{props.children}</Typography>
        </MenuItem>
    )
}

export default NavButton