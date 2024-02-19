export const SOCKET_ROUTE = `ws://${window.location.hostname}:${window.location.port}`

// @ts-ignore
const user = global.hasOwnProperty("user") && global.user
// @ts-ignore
const isAdminSet = global.hasOwnProperty("admin") && global.admin
// @ts-ignore
const isCloud = global.hasOwnProperty("cloud") && global.cloud
// @ts-ignore
const permissions = global.hasOwnProperty("permissions") && global.permissions

const systemThemeIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches

function hasPermission(permission: string) {
    return permissions && permissions.includes(permission)
}

export { user, isAdminSet, isCloud, permissions, systemThemeIsDark }
export { hasPermission }
