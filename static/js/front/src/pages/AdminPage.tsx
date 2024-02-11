import React, {useMemo, lazy, Suspense} from "react";
import PageBase from "./PageBase";
import {Drawer, List, ListItem, ListItemButton, ListItemText, Tab, Tabs, Toolbar} from "@mui/material";
import PageLoader from "../components/PageLoader";

const Overview = lazy(() => import("../components/adminPages/AdminPageOverview"))
const Metrics = lazy(() => import("../components/adminPages/AdminPageUserMetrics"))
const FileManager = lazy(() => import("../components/adminPages/AdminPageFileManager"))


const AdminPageTabs = [
    "Overview",
    "Metrics",
    "File Manager"
]


function AdminPage() {
    const [page, setPage] = React.useState(parseInt(sessionStorage.getItem("admin-page") || "0"))

    const RenderPage = useMemo(() => {
        sessionStorage.setItem("admin-page", page.toString())
        switch(page){
            case 1:
                return <Metrics />
            case 2:
                return <FileManager />
            default:
                return <Overview />
        }
    }, [page])

    return (
        <PageBase>
            <div className="d-flex">
                <Drawer
                    variant="permanent"
                    anchor="left"
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                            width: 240,
                            boxSizing: "border-box",
                        },
                        zIndex: 800,
                    }}
                >
                    <Toolbar/>
                    <List>
                        {AdminPageTabs.map((text, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton selected={index === page} onClick={() => setPage(index)}>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <div className="flex-grow-1">
                    <Suspense fallback={<PageLoader/>}>
                        {RenderPage}
                    </Suspense>
                </div>
            </div>
        </PageBase>
    )
}

export default AdminPage