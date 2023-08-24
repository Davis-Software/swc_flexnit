from __init__ import app
from utils.password_manager import auth_required
from utils.valid_react_routes import VALID_REACT_ROUTES
from utils.request_codes import RequestCode

from flask import render_template, make_response, request, redirect


@app.route("/")
@app.route("/<path:page>")
@auth_required
def route_index(page=None):
    page_base = page.split("/")[0] if page else "/"
    not_found = page_base not in VALID_REACT_ROUTES or request.args.get("error") == RequestCode.ClientError.NotFound

    resp = make_response(
        render_template("pages/index.html"),
        RequestCode.ClientError.NotFound if not_found else RequestCode.Success.OK
    )

    return resp


@app.route("/sw")
def route_service_worker():
    resp = app.send_static_file("pwa/sw.js")
    resp.headers.set("Service-Worker-Allowed", "/")
    resp.headers.set("Content-Type", "application/javascript")

    return resp


@app.route("/home")
def route_home():
    return redirect("/")
