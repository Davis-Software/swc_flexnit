import React, {lazy} from "react";
import {Button} from "@mui/material";

const LinearProgress = lazy(() => import("@mui/material/LinearProgress"))
const Modal = lazy(() => import("@mui/material/Modal"))
const Box = lazy(() => import("@mui/material/Box"))
const Grow = lazy(() => import("@mui/material/Grow"))

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) !important',
    width: "60%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    outline: "none !important"
}

interface ResourceUploadDialogProps{
    open: boolean
    setOpen: (open: boolean) => void
    targetPath: string
    triggerUpdate: (file: File) => void
    label?: string
    moreElements?: React.ReactNode | React.ReactNode[]
    accept?: string
}
function ResourceUploadDialog(props: ResourceUploadDialogProps){
    const [file, setFile] = React.useState<File | undefined | null>(null)
    const [uploading, setUploading] = React.useState(false)
    const [uploadProgress, setUploadProgress] = React.useState(0)
    const [uploadError, setUploadError] = React.useState("")

    function handleUpload(){
        if(!file) return
        setUploading(true)

        const xhr = new XMLHttpRequest()
        const formData = new FormData()

        formData.append("file", file)

        xhr.open("POST", props.targetPath)
        xhr.upload.addEventListener("progress", (e) => {
            if(!e.lengthComputable) return
            setUploadProgress(e.loaded / e.total * 100)

        })
        xhr.addEventListener("load", () => {
            props.triggerUpdate(file)
            setFile(null)
            props.setOpen(false)
            setUploading(false)
        })
        xhr.addEventListener("error", () => {
            setUploading(false)
            setUploadError("An error occurred while uploading the file")
        })
        xhr.send(formData)
    }

    return (
        <Modal
            open={props.open}
            onClose={() => props.setOpen(false)}
            closeAfterTransition
            componentsProps={{
                backdrop: {timeout: 500}
            }}
        >
            <Grow in={props.open}>
                <Box sx={modalStyle}>
                    <h1>Upload {props.label || "Resource"}</h1>
                    <p>Target Path: {props.targetPath}</p>
                    <hr/>
                    {uploadError && (
                        <div className="alert alert-danger">{uploadError}</div>
                    )}
                    {uploading ? (
                        <LinearProgress color="primary" variant="determinate" value={uploadProgress} />
                    ) : (
                        <Button className="mb-3" variant="contained" component="label" fullWidth>
                            {file ? `${file.name} (${file.size} B) - Change ${props.label || "Resource"}` : `Upload ${props.label || "Resource"}`}
                            <input hidden accept={props.accept || "*/*"} type="file" onChange={(e) => setFile(e.currentTarget.files?.item(0))} />
                        </Button>
                    )}
                    {props.moreElements}

                    <div className="d-flex justify-content-end">
                        <Button variant="contained" onClick={handleUpload} disabled={uploading || !file}>Upload</Button>
                    </div>
                </Box>
            </Grow>
        </Modal>
    )
}

export default ResourceUploadDialog;