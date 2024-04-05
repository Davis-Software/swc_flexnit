import {useEffect, useState} from "react";
import UAParser from "ua-parser-js";

const parser = new UAParser();

function UseIsTV(){
    const [isTV, setIsTV] = useState(false);

    useEffect(() => {
        setIsTV(
            (
                // @ts-ignore
                (global.hasOwnProperty("tvApp") && global.tvApp.isTv()) ||
                parser.getDevice().type?.toLowerCase().includes("tv") ||
                parser.getDevice().model?.toLowerCase().includes("tv") ||
                parser.getOS().name?.toLowerCase().includes("tv") ||
                parser.getUA().toLowerCase().includes("tv") ||
                false
            ) &&
            sessionStorage.getItem("ignoreTV") !== "true"
        );
    }, []);

    return isTV;
}

export default UseIsTV;