import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App";
import {BaseContextProvider} from "./ContextProvider";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BaseContextProvider>
            <App />
        </BaseContextProvider>
    </React.StrictMode>
)
