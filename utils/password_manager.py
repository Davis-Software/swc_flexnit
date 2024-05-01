from functools import wraps
from utils.request_codes import RequestCode
from flask import session, request, abort, redirect


def check_auth():
    return session.get("logged_in") and session.get("user")


def auth_required(func):
    @wraps(func)
    def check(*args, **kwargs):
        if check_auth():
            return func(*args, **kwargs)
        return redirect(f"/login?redirect={request.path}")

    return check


def check_admin():
    return session.get("user").get("admin", False) or session.get("admin", False)


def check_permission(permission):
    perms = session.get("user").get("permissions") or []
    perms.extend(session.get("permissions", []))

    if perms is None:
        return False
    if "*" in perms:
        return True

    return permission in perms


def admin_required(func):
    @wraps(func)
    def check(*args, **kwargs):
        if check_admin():
            return func(*args, **kwargs)
        return abort(RequestCode.ClientError.Unauthorized)

    return check
