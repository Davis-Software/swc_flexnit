import React, {useContext, useEffect} from "react";
import PageBase from "./PageBase";
import {ActivityType, SocketContext} from "../contexts/socketContext";

function WatchAlongInfo(){
    const socket = useContext(SocketContext)
    const [selectedActivity, setSelectedActivity] = React.useState<ActivityType>()
    const [watchAlongInfo, setWatchAlongInfo] = React.useState<{[username: string]: ActivityType}>({})

    useEffect(() => {
        socket.on("activity", setWatchAlongInfo)
        socket.emit("get-activity")

        socket.on("room-joined", watchAlongRequestResponse)

        return () => {
            socket.off("activity", setWatchAlongInfo)

            socket.off("room-joined", watchAlongRequestResponse)
        }
    }, []);
    function watchAlongRequestResponse(response: boolean){
        console.log(response)
    }
    function handleWatchAlongRequest(username: string, activity: ActivityType){
        socket.emit("join-room", username)
    }

    return (
        <PageBase>
            <div>
                <h1>Watch Along Info</h1>
                <div>
                    {Object.entries(watchAlongInfo).map(([username, activity]) => (
                        <div key={username} onClick={() => handleWatchAlongRequest(username, activity)}>
                            <p>{username} is {activity.activity} {activity.title && activity.title.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </PageBase>
    )
}

export default WatchAlongInfo;