import React from "react";

interface VideoContextProps {
    videoRef: React.RefObject<HTMLVideoElement>
}
const VideoContext = React.createContext<VideoContextProps>({
    videoRef: {current: null},
})

export {VideoContext}
export type {VideoContextProps}