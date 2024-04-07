import React, {useEffect} from "react";
import TitleEntryType from "../../types/titleEntryType";
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import {Box, Card, Skeleton} from "@mui/material";
import useIsInView from "../../hooks/useIsInView";
import {useNavigation} from "../navigation/SmartTVNavigation";

interface SmartTVTitleDisplayProps {
    title: TitleEntryType | null
    onFocused?: () => void
    first?: boolean
}
function SmartTVTitleDisplay(props: SmartTVTitleDisplayProps){
    const {navigate} = useNavigation()
    const { ref, focused } = useFocusable({
        focusKey: props.first ? "FIRST" : undefined,
        onEnterPress: () => {
            if(!props.title) return
            navigate("info", {title: props.title})
            // navigate("watch", {title: props.title})
        }
    })
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const isInView = useIsInView(ref, true)

    useEffect(() => {
        if(focused && props.onFocused) {
            props.onFocused()
            ref.current.scrollIntoView({behavior: "smooth", inline: "start", block: "end"})
        }
    }, [focused]);

    return (
        <Box ref={ref}>
            <Card className="position-relative" sx={{
                transition: "transform 0.1s",
                transform: focused ? "scale(1.05)" : "scale(1)",
                height: 300,
                width: 200,
            }}>
                {!imageLoaded && <Skeleton animation="wave" variant="rectangular" width="100%" height="100%" />}
                {props.title && isInView && <img
                    src={`/${props.title.type === "movie" ? "movies" : "series"}/${props.title.uuid}?thumbnail&q=h`}
                    alt={props.title.title}
                    className="card-img-top"
                    onLoad={() => setImageLoaded(true)}
                    hidden={!imageLoaded}
                    style={{height: "100%", width: "100%", objectFit: "cover"}}
                />}
            </Card>
        </Box>
    );
}

export default SmartTVTitleDisplay;