import UAParser from "ua-parser-js";

const parser = new UAParser();

// @ts-ignore
const user = global.hasOwnProperty("user") && global.user
// @ts-ignore
const isAdminSet = global.hasOwnProperty("admin") && global.admin
// @ts-ignore
const isCloud = global.hasOwnProperty("cloud") && global.cloud
// @ts-ignore
const permissions = global.hasOwnProperty("permissions") && global.permissions

const systemThemeIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches

const deviceIsSmartTV = (
    // @ts-ignore
    (global.hasOwnProperty("tvApp") && global.tvApp.isTv()) ||
    parser.getDevice().type?.toLowerCase().includes("tv") ||
    parser.getDevice().model?.toLowerCase().includes("tv") ||
    parser.getOS().name?.toLowerCase().includes("tv") ||
    parser.getUA().toLowerCase().includes("tv") ||
    false
)

function hasPermission(permission: string) {
    return permissions && permissions.includes(permission)
}

export { user, isAdminSet, isCloud, permissions, systemThemeIsDark, deviceIsSmartTV }
export { hasPermission }
