from __init__ import app
from flask import request, make_response, session

from models.playback_progress import get_playback_progress, set_playback_progress
from utils.password_manager import auth_required


@app.route("/sync", methods=["GET", "POST"])
@auth_required
def sync():
    if request.method == "GET":
        username = session.get("username")
        playback_progress = get_playback_progress(username).to_json()
        return make_response(playback_progress, 200)

    elif request.method == "POST":
        username = session.get("username")
        playback_user = request.form.get("playback_user")

        if playback_user is None or playback_user != username:
            return make_response("Unauthorized", 401)

        playback_progress = request.form.get("playback_progress")
        playback_library = request.form.get("playback_library")
        set_playback_progress(username, playback_progress, playback_library)
        return make_response("OK", 200)
