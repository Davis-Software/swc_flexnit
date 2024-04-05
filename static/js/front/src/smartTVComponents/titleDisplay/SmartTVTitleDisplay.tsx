import React, {useEffect} from "react";
import TitleEntryType from "../../types/titleEntryType";
import {useFocusable} from "@noriginmedia/norigin-spatial-navigation";
import {Card, Skeleton} from "@mui/material";

interface SmartTVTitleDisplayProps {
    title: TitleEntryType
    onFocused?: () => void
}
function SmartTVTitleDisplay(props: SmartTVTitleDisplayProps){
    const { ref, focused } = useFocusable()
    const [imageLoaded, setImageLoaded] = React.useState(false);

    useEffect(() => {
        if(focused && props.onFocused) {
            props.onFocused()
            ref.current.scrollIntoView({behavior: "smooth", inline: "start"})
        }
    }, [focused]);

    return (
        <div ref={ref}>
            <Card className="position-relative" sx={{
                transition: "transform 0.1s",
                transform: focused ? "scale(1.05)" : "scale(1)",
                height: 300,
                width: 200,
            }}>
                {!imageLoaded && <Skeleton animation="wave" variant="rectangular" width="100%" height="100%" />}
                <img
                    src={`/${props.title.type === "movie" ? "movies" : "series"}/${props.title.uuid}?thumbnail&q=h`}
                    alt={props.title.title}
                    className="card-img-top"
                    onLoad={() => setImageLoaded(true)}
                    hidden={!imageLoaded}
                    style={{height: "100%", width: "100%", objectFit: "cover"}}
                />
            </Card>
        </div>
    );
}

export default SmartTVTitleDisplay;