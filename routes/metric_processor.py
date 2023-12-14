from flask import request, session

from __init__ import app, config
from models.metrics import set_user_request_metrics


USE_METRICS = config.get_bool("METRIC", False)


@app.after_request
def after_request_metrics(response):
    if not USE_METRICS:
        return response

    if session.get("username") is not None and session.get("logged_in"):
        set_user_request_metrics(session['username'], request, response)

    return response
