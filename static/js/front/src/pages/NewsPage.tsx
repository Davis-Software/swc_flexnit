import React from "react";
import PageBase from "./PageBase";
import News from "../components/other/News";

function NewsPage(){
    return (
        <PageBase>
            <News setSelectedTitle={() => {}} count={15} />
        </PageBase>
    )
}

export default NewsPage;
