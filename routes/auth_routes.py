from __init__ import app, config
from flask import request, redirect, make_response, session

UMS_ROUTE = config.get("UMS_ROUTE", "https://ums.software-city.org")


@app.route("/login", methods=["GET", "POST"])
def login():
    url = request.root_url
    if "http://" in url or "https://" in url:
        url = url.split("//")[1]

    resp = make_response(
        redirect(f"{UMS_ROUTE}/login?title=FlexNit%20Login&redirect={url}{request.args.get('redirect') or '/'}")
    )

    if session.get("user") is None:
        session.clear()
        resp.delete_cookie("session")

    return resp


@app.route("/logout")
def logout():
    url = request.root_url
    if "http://" in url or "https://" in url:
        url = url.split("//")[1]

    return redirect(f"{UMS_ROUTE}/logout?redirect={url}")
