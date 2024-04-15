from flask import request, session, make_response

from __init__ import app, config
from models.metrics import set_user_request_metrics, get_all_metrics, parse_metrics

from utils.password_manager import admin_required


USE_METRICS = config.get_bool("METRIC", False)


@app.after_request
def after_request_metrics(response):
    if not USE_METRICS:
        return response

    if session.get("username") is not None and session.get("logged_in"):
        set_user_request_metrics(session['username'], request, response)

    return response


@app.route("/metrics", methods=["GET"])
@admin_required
def get_metrics():
    if not USE_METRICS:
        return make_response("Metrics are disabled", 404)

    if "parse" in request.args:
        return parse_metrics(lambda x: {
            "title": x["title"],
            "type": x["type"]
        })

    return get_all_metrics()
