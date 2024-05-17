from flask import request, session

from __init__ import app

from models.playback_progress import get_playback_progress
from models.taste_profile.taste_profile_model import TasteProfile

from utils.password_manager import auth_required


@app.route("/taste_profile")
@app.route("/taste_profile/<username>")
@auth_required
def get_taste_profile(username=None):
    if username is None:
        username = session.get("user").get("username")

    limit = request.args.get("limit", 5, int)
    include_watched = "include_watched" in request.args
    playback_progress = get_playback_progress(username)
    taste_profile = TasteProfile(playback_progress).build()
    return {
        "taste_profile": taste_profile.get_taste_profile(),
        "recommendations": taste_profile.get_recommendations(limit, include_watched)
    }
