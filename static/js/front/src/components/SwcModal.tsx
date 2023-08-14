import {Box, Fade, Modal} from "@mui/material";
import React from "react";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: "95%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY: "auto",
    maxHeight: "95%"
};

interface SwcModalProps {
    show: boolean
    onHide: () => void
    children: React.ReactNode
}
function SwcModal(props: SwcModalProps) {
    return (
        <Modal
            sx={{outline: "none !important"}}
            open={props.show}
            onClose={props.onHide}
            closeAfterTransition
            componentsProps={{
                backdrop: {timeout: 500}
            }}
        >
            <Fade in={props.show}>
                <Box sx={style}>
                    {props.children}
                </Box>
            </Fade>
        </Modal>
    )
}

export default SwcModal