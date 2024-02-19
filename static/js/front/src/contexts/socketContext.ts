import {io, Socket} from "socket.io-client"
import {SOCKET_ROUTE} from "../utils/constants";
import React from "react";
import MovieType from "../types/movieType";
import SeriesType, {EpisodeType} from "../types/seriesType";

const socket: Socket = io(SOCKET_ROUTE, {
    upgrade: true,
    // transports: ['http', 'websocket']
})
const SocketContext = React.createContext<Socket>(socket)

socket.on("connect", () => {
    console.log("Connected to socket")
})
socket.on("disconnect", () => {
    console.log("Disconnected from socket")
})
socket.io.on("reconnect", () => {
    console.log("Reconnected to socket")
})
socket.io.on("reconnect_attempt", () => {
    console.log("Reconnecting to socket")
})
socket.on("connect_error", (error) => {
    console.log("Error connecting to socket: ", error)
})


interface ActivityType {
    activity: "online" | "watching"
    title?: MovieType | SeriesType
    episode?: EpisodeType
    type?: "movie" | "series"
}
function setActivity(activity: ActivityType | ActivityType["activity"]){
    if(typeof activity === "string"){
        socket.emit("change-activity", {activity})
        return
    }
    socket.emit("change-activity", activity)
}


export {SocketContext, socket}
export {setActivity}
export type {ActivityType}
