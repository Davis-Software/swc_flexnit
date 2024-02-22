import React from "react"

interface SwcLoaderProps{
    className?: string
    style?: React.CSSProperties
    text?: string
}
function SwcLoader(props: SwcLoaderProps){
    return (
        <div className={`swc-loader ${props.className}`} style={props.style}>
            <img src="/static/img/favicon-256.png" className="box" alt="Loader"/>
            <div className="shadow"></div>
            <div className="text">{props.text}</div>
        </div>
    )
}

export default SwcLoader