import React from "react";

interface ConditionalFlashProps {
    children: React.ReactNode | React.ReactNode[];
    flashType: "warn" | "info" | "success" | "error";
    condition: boolean;
}
function ConditionalFlash(props: ConditionalFlashProps) {
    return props.condition ? (
        <div className={"flash flash-" + props.flashType + " border-top-0 text-center text-bold py-2"}>
            {props.children}
        </div>
    ) : null
}

export default ConditionalFlash;