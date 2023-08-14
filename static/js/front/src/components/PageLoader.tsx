import React from "react";
import PageBase from "../pages/PageBase";
import SwcLoader from "./SwcLoader";

function PageLoader(){
    return (
        <PageBase>
            <div className="d-flex justify-content-center swc-loader-middle">
                <SwcLoader />
            </div>
        </PageBase>
    )
}

export default PageLoader;