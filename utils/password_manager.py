import requests

from functools import wraps
from utils.request_codes import RequestCode
from flask import session, request, render_template, abort


def check_password(user, password) -> (bool, bool):
    resp = requests.post(
        "https://api.software-city.org/app/check_login?non-hash&is-admin",
        data={"username": user, "password": password}
    )

    if resp.status_code == 200:
        resp = resp.json()
        return resp["resp"], resp

    return False, {
        "is_admin": False,
        "is_cloud": False,
        "permissions": []
    }


def check_auth():
    return session.get("logged_in")


def auth_required(func):
    @wraps(func)
    def check(*args, **kwargs):
        if check_auth():
            return func(*args, **kwargs)
        return render_template("auth/login.html", redirect=request.path)

    return check


def check_admin():
    return session.get("admin")


def check_permission(permission):
    perms = session.get("permissions")

    if perms is None:
        return False

    return permission in perms


def admin_required(func):
    @wraps(func)
    def check(*args, **kwargs):
        if check_admin():
            return func(*args, **kwargs)
        return abort(RequestCode.ClientError.Unauthorized)

    return check
