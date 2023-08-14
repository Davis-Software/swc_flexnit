from __init__ import app
from flask import send_file


@app.route("/favicon")
def favicon():
    return send_file("static/img/favicon.png")


@app.route("/icon")
def icon():
    return send_file("static/img/icon.png")
