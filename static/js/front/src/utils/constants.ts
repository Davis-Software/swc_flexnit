// @ts-ignore
const user = global.hasOwnProperty("user") && global.user
// @ts-ignore
const isAdmin = global.hasOwnProperty("admin") && global.admin
// @ts-ignore
const isCloud = global.hasOwnProperty("cloud") && global.cloud
// @ts-ignore
const permissions = global.hasOwnProperty("permissions") && global.permissions

function hasPermission(permission: string) {
    return permissions && permissions.includes(permission)
}

export { user, isAdmin, isCloud, permissions }
export { hasPermission }
