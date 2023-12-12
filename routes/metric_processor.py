from flask import request, session

from __init__ import app
from models.metrics import set_user_request_metrics


@app.after_request
def after_request_metrics(response):
    if session.get("username") is not None and session.get("logged_in"):
        set_user_request_metrics(session['username'], request, response)

    return response
