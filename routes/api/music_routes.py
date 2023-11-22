from __init__ import app

from models.music import get_song, get_songs, edit_song
from storage.music_storage import upload_song, get_song_storage_file, delete_song

from flask import make_response, request, send_file

from utils.adv_responses import send_binary_image
from utils.password_manager import auth_required, admin_required
from utils.request_codes import RequestCode


@app.route("/music/new", methods=["POST"])
@admin_required
def new_song():
    title = request.form.get("title")
    song = request.files.get("song")

    if title is None or song is None:
        return make_response("Invalid request", RequestCode.ClientError.BadRequest)

    song = upload_song(title, song)
    return make_response(song.to_json(), RequestCode.Success.OK)


@app.route("/music/files", methods=["GET"])
@auth_required
def song_files():
    return make_response(get_songs(), RequestCode.Success.OK)


@app.route("/music/<uuid>", methods=["GET"])
@auth_required
def song_info(uuid):
    song = get_song(uuid)

    if song is None:
        return make_response("Song not found", RequestCode.ClientError.NotFound)

    if "thumbnail" in request.args:
        return send_binary_image(song.thumbnail)

    return send_file(get_song_storage_file(song), mimetype="audio/mpeg")


@app.route("/music/<uuid>/<action>", methods=["GET", "POST"])
@admin_required
def song_actions(uuid, action):
    song = get_song(uuid)

    if song is None:
        return make_response("Song not found", RequestCode.ClientError.NotFound)

    if action == "edit":
        return edit_song(song.uuid, **request.form, **request.files).to_json()

    if action == "delete":
        return delete_song(song.uuid)

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)
