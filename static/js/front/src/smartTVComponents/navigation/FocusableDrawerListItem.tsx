import {
    ListItem,
    ListItemButton,
    ListItemButtonProps,
    ListItemIcon,
    ListItemIconProps,
    ListItemProps,
    ListItemText, ListItemTextProps
} from "@mui/material";
import React, {useContext} from "react";
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import {FocusableDrawerContext} from "./FocusableDrawer";

interface FocusableListItemProps {
    id?: string,
    icon?: string,
    name?: string,
    navItem?: {
        id: string,
        name: string,
        icon: string
    },
    selected?: boolean,
    listItemProps?: ListItemProps,
    listItemButtonProps?: ListItemButtonProps,
    listItemIconProps?: ListItemIconProps,
    listItemTextProps?: ListItemTextProps,
}
function FocusableDrawerListItem(props: FocusableListItemProps){
    const {open, focusChanged} = useContext(FocusableDrawerContext)
    const {ref, focused} = useFocusable({
        onFocus: () => {
            focusChanged && focusChanged(props.id || props.navItem?.id || "null")
        }
    })

    return (
        <ListItem
            ref={ref}
            {...props.listItemProps}
            disablePadding
            sx={{ display: 'block' }}
        >
            <ListItemButton
                {...props.listItemButtonProps}
                selected={focused}
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                }}
            >
                <ListItemIcon
                    {...props.listItemIconProps}
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: (props.selected && !focused) ? 'primary.main' : 'inherit'
                    }}
                >
                    <i className="material-icons">{props.icon || props.navItem?.icon}</i>
                </ListItemIcon>
                <ListItemText
                    {...props.listItemTextProps}
                    primary={props.name || props.navItem?.name}
                    sx={{ opacity: open ? 1 : 0 }}
                />
            </ListItemButton>
        </ListItem>
    )
}

export default FocusableDrawerListItem;