import React from "react";
import {isAdminSet, user} from "../../utils/constants";
import {
    Typography,
    SxProps,
    Box,
    Tooltip,
    Toolbar,
    IconButton,
    Menu,
    AppBar,
    Badge,
    Avatar,
    Divider, MenuItem
} from "@mui/material";
import {hasNSFWPermission} from "../../utils/permissionChecks";
import HideOnScroll from "../../utils/HideOnScroll";
import NavButton from "./NavButton";
import {navigateTo} from "../../utils/navigation";
import {useIsAdmin} from "../../contexts/showAdminContext";

const largeStyling: SxProps = { display: { xs: 'none', md: 'flex' } }
const smallStyling: SxProps = { display: { xs: 'flex', md: 'none' } }

function Brand(){
    return (
        <Box sx={{display: "flex", alignItems: "center"}}>
            <Typography
                variant="h6"
                onClick={() => {
                    navigateTo("/")
                }}
                style={{
                    cursor: "pointer"
                }}
            >
                SWC flexNit
            </Typography>
        </Box>
    )
}

function UserInfo(){
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    function handleLogout(){
        setAnchorEl(null)
        location.href = "/logout"
    }

    return (
        <>
            <Tooltip title={user + (hasNSFWPermission() ? "\n(You can see NSFW content)" : "")}>
                <IconButton
                    sx={{ p: 0 }}
                    onClick={e => setAnchorEl(e.currentTarget)}
                >
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        color="primary"
                        badgeContent={isAdminSet ? "A" : ""}
                        invisible={!isAdminSet}
                    >
                        <Avatar alt={user} src={`https://interface.software-city.org/user?avatar=${user}`} />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                open={!!anchorEl}
                anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
                keepMounted
            >
                <NavButton target="/news" onClick={() => setAnchorEl(null)} noButton>News</NavButton>
                <NavButton target="/about" onClick={() => setAnchorEl(null)} noButton>About</NavButton>
                <Divider />
                <NavButton target={`https://interface.software-city.org/user/${user}`} onClick={() => setAnchorEl(null)} noButton>Profile</NavButton>
                <NavButton target="/settings" onClick={() => setAnchorEl(null)} noButton>Settings</NavButton>
                <Divider />
                <MenuItem onClick={handleLogout} className="text-danger">Logout</MenuItem>
            </Menu>
        </>
    )
}

interface ToolbarProps{
    navItems: [string, string, boolean][]
}
function ToolbarLarge(props: ToolbarProps){
    const isAdmin = useIsAdmin()

    return (
        <Toolbar sx={largeStyling}>
            <Brand />

            <Box sx={{marginLeft: "25px"}} />
            {props.navItems.map(([name, path, adminRequired]) => (
                !adminRequired || isAdmin ? (
                    <NavButton target={path} key={path}>
                        {name}
                    </NavButton>
                ) : null
            ))}
            <Box sx={{flexGrow: 1}} />

            <div className="d-flex flex-row">
                <UserInfo />
            </div>
        </Toolbar>
    )
}
function ToolbarSmall(props: ToolbarProps){
    const isAdmin = useIsAdmin()
    const [open, setOpen] = React.useState<null | HTMLElement>(null);

    function handleOpenNavMenu(event: React.MouseEvent<HTMLElement>){
        setOpen(event.currentTarget)
    }
    function handleCloseNavMenu(){
        setOpen(null)
    }

    return (
        <Toolbar sx={{justifyContent: "space-between", ...smallStyling}}>
            <IconButton
                size="large"
                onClick={handleOpenNavMenu}
                color="inherit"
            >
                <span className="material-icons">menu</span>
            </IconButton>
            <Menu
                anchorEl={open}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(open)}
                onClose={handleCloseNavMenu}
            >
                {props.navItems.map(([name, path, adminRequired]) => (
                    !adminRequired || isAdmin ?
                        <NavButton key={path} target={path} onClick={handleCloseNavMenu} noButton>{name}</NavButton> :
                        null
                ))}
            </Menu>

            <Brand />

            <div className="d-flex flex-row">
                <UserInfo />
            </div>
        </Toolbar>
    )
}

function NavBar(props: ToolbarProps){
    return (
        <>
            <HideOnScroll>
                <AppBar>
                    <ToolbarLarge navItems={props.navItems} />
                    <ToolbarSmall navItems={props.navItems} />
                </AppBar>
            </HideOnScroll>
            <Toolbar />
        </>
    )
}

export default NavBar