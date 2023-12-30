import PageBase from "./PageBase";
import ContentBrowser from "../components/other/ContentBrowser";
import React from "react";
import {navigateToTitle} from "../utils/navigation";

function ContentBrowserPage(){
    return (
        <PageBase>
            <ContentBrowser id="browser-page" forceTab="browse" setSelectedTitle={navigateToTitle} />
        </PageBase>
    )
}

export default ContentBrowserPage