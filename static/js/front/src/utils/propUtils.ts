function gatherSubProps(
    propList: { [key: string]: any },
    propNameList: string[],
    whitelist: boolean = false
): {[key: string]: any} {
    let eProps: {[key: string]: any} = {}
    for(let key in propList){
        if(propNameList.includes(key) === whitelist){
            eProps[key] = propList[key]
        }
    }
    return eProps;
}

export {gatherSubProps}