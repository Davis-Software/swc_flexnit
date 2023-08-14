import React from "react"

function Triangle(){
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="0,100 100,0 100,100"/>
        </svg>
    )
}

function DoubleTriangle(){
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="100,0 70,70 0,100 30,30"/>
        </svg>
    )
}

function SwcLoader(){
    return (
        <div className="swc-loader">
            <div className="swc-loader-inner">
                <div className="triangle left">
                    <Triangle />
                </div>
                <div className="double-triangle">
                    <DoubleTriangle />
                </div>
                <div className="triangle right">
                    <Triangle />
                </div>
            </div>
        </div>
    )
}

export default SwcLoader