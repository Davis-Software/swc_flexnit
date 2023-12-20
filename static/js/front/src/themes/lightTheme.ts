import {createTheme} from "@mui/material";

const light = createTheme({
    palette: {
        mode: "light"
    },
    components: {
        MuiAppBar: {
            defaultProps: {
                color: "transparent"
            }
        }
    }
})

export default light
