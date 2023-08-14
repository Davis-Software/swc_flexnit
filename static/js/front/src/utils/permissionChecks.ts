import {hasPermission} from "./constants";

function hasNSFWPermission() {
    return hasPermission("nsfw");
}

export {hasNSFWPermission};