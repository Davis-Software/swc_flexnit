import {createTheme} from "@mui/material";

const amoledTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: '#000000',
            paper: '#000000',
        },
        primary: {
            main: '#3f51b5',
        },
        secondary: {
            main: '#f50057',
        },
        text: {
            primary: '#ffffff',
            secondary: '#ffffff'
        }
    }
})

export default amoledTheme
