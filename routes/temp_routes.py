from flask import render_template

from __init__ import app
from utils.password_manager import admin_required


@app.route("/make_subs")
@admin_required
def make_subs_route():
    return render_template("temp_pages/make_subs.html")
