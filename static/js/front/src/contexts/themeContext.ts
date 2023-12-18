import React from "react";

const ThemeContext = React.createContext({
    theme: "system",
    setTheme: (theme: string) => {}
})

export {ThemeContext}