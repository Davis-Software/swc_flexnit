import {useEffect, useState} from "react";
import UAParser from "ua-parser-js";

const parser = new UAParser();

function UseIsTV(){
    const [isTV, setIsTV] = useState(false);

    useEffect(() => {
        setIsTV(
            (parser.getDevice().type?.toLowerCase().includes("tv") || false) &&
            sessionStorage.getItem("ignoreTV") !== "true"
        );
    }, []);

    return isTV;
}

export default UseIsTV;