import React from "react"
import {ErrorCodes} from "../../types/ErrorCodes";
import ErrorBase from "./ErrorBase";

function Wave(props: {type: number}){
    return (
        <img
            className="wave"
            src={"/static/img/wave_" + props.type + ".png"}
            alt="Wavy water"
        />
    )
}
function Boat(){
    return (
        <div className="boat">
            <img
                src="/static/img/boat.png"
                alt="Boat"
            />
        </div>
    )
}
function NotFound() {
    return (
        <ErrorBase errorCode={ErrorCodes.NotFound}>
            <div className="error-404">
                <div className="text d-none d-md-block">
                    <h1>Error 404</h1>
                    <h4>Oops! There are no fishes in the water over here!</h4>
                    <h4>Try sailing somewhere else.</h4>
                </div>
                <div className="d-block d-md-none mt-5 pt-5 ms-2">
                    <h1>Error 404</h1>
                    <h4>Oops! There are no fishes in the water over here!</h4>
                    <h4>Try sailing somewhere else.</h4>
                </div>
                <Boat/>
                <div className="water">
                    <Wave type={0}/>
                    <Wave type={1}/>
                </div>
            </div>
        </ErrorBase>
    )
}

export default NotFound