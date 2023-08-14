import React from "react";
import {ErrorCodes} from "../../types/ErrorCodes";
import PageBase from "../PageBase";


interface ErrorBaseProps {
    errorCode: ErrorCodes
    children?: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[]
}
function ErrorBase(props: ErrorBaseProps){
    return (
        <PageBase>
            {props.children ? props.children : (
                <div className="text-center mt-5">
                    <h1>Error {props.errorCode} - {ErrorCodes[props.errorCode]}</h1>
                </div>
            )}
        </PageBase>
    )
}

export default ErrorBase