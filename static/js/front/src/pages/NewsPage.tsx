import React from "react";
import PageBase from "./PageBase";
import News from "../components/other/News";
import {navigateToTitle} from "../utils/navigation";

function NewsPage(){
    return (
        <PageBase>
            <News setSelectedTitle={(title) => {
                if(title.series){
                    navigateToTitle(title.series)
                }else{
                    navigateToTitle(title)
                }
            }} count={15} />
        </PageBase>
    )
}

export default NewsPage;
