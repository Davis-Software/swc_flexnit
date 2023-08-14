import {Button, Collapse, IconButton, ListItem, TextField} from "@mui/material";
import React from "react";
import {TransitionGroup} from "react-transition-group";

interface KeyValuePairProps {
    key_: string
    value: string
    onKeyChange: (key: string) => void
    onValueChange: (value: string) => void
    additions?: React.ReactNode
}
function KeyValuePair(props: KeyValuePairProps){
    return (
        <div className="d-flex">
            <div className="flex-grow-1">
                <TextField
                    label="Key"
                    value={props.key_}
                    onChange={(e) => props.onKeyChange(e.target.value)}
                    variant="standard"
                    className="w-50"
                />
                <TextField
                    label="Value"
                    value={props.value}
                    onChange={(e) => props.onValueChange(e.target.value)}
                    variant="standard"
                    className="w-50"
                />
            </div>
            <div>
                {props.additions}
            </div>
        </div>
    )
}

interface KeyValueTableEditProps {
    object: {[key: string]: string}
    onChange: (object: {[key: string]: string}) => void
    label?: string
}
function KeyValueTableEdit(props: KeyValueTableEditProps){
    const [newKey, setNewKey] = React.useState("")
    const [newValue, setNewValue] = React.useState("")

    return (
        <div className="w-100 mt-3" style={{borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.23)", padding: "16.5px 14px"}}>
            <h6>{props.label}</h6>
            <KeyValuePair
                key_={newKey}
                value={newValue}
                onKeyChange={setNewKey}
                onValueChange={setNewValue}
                additions={
                    <Button
                        variant={"contained"}
                        onClick={() => {
                            if(newKey === "" || newValue === "") return
                            props.onChange({...props.object, [newKey]: newValue})
                            setNewKey("")
                            setNewValue("")
                        }}
                        className="ml-1 mt-2"
                    >Add</Button>
                }
            />
            <TransitionGroup>
                {Object.keys(props.object).map((key, index) => (
                    <Collapse key={index}>
                        <ListItem
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    title="Delete"
                                    onClick={() => {
                                        const newObject = {...props.object}
                                        delete newObject[key]
                                        props.onChange(newObject)
                                    }}
                                >
                                    <i className="material-icons">delete</i>
                                </IconButton>
                            }
                        >
                            <span className="w-50">{key}</span>
                            <span className="w-50">{props.object[key]}</span>
                        </ListItem>
                    </Collapse>
                ))}
            </TransitionGroup>
        </div>
    )
}

export default KeyValueTableEdit