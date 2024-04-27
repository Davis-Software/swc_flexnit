from __init__ import app, config
from flask import request, redirect


UMS_ROUTE = config.get("UMS_ROUTE", "https://ums.software-city.org")


@app.route("/login", methods=["GET", "POST"])
def login():
    return redirect(f"{UMS_ROUTE}/login?title=FlexNit%20Login&redirect={request.root_url}{request.args.get('redirect') or '/'}")


@app.route("/logout")
def logout():
    return redirect(f"{UMS_ROUTE}/logout?redirect={request.root_url}")
