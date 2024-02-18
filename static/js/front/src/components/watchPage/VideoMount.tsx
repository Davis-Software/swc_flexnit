import React from "react";
import {VideoContext} from "../../contexts/watchPageVideoContext";

interface VideoMountProps {
    mountVideo: boolean;
    videoRef: React.RefObject<HTMLVideoElement>;
    subtitleRef: React.RefObject<HTMLDivElement>;
    handleInteract: () => void;
    children: React.ReactNode | React.ReactNode[];
}
function VideoMount(props: VideoMountProps) {
    return (
        <VideoContext.Provider value={{
            videoRef: props.videoRef,
        }}>
            <div
                className="overflow-hidden position-relative"
                style={{height: "100vh", width: "100vw"}}
                onMouseMove={props.handleInteract}
                onTouchStart={props.handleInteract}
                onClick={props.handleInteract}
            >
                {props.mountVideo && (
                    <video
                        className="position-absolute top-0 start-0"
                        ref={props.videoRef}
                        style={{width: "100%", height: "100%", objectFit: "contain", zIndex: 0}}
                    />
                )}
                <div ref={props.subtitleRef}></div>

                {props.children}
            </div>
        </VideoContext.Provider>
    )
}

export default VideoMount;