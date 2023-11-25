from __init__ import app

from models.music import get_song, get_songs, edit_song
from models.liked_songs import get_liked_songs, add_liked_song, remove_liked_song
from storage.music_storage import upload_song, get_song_storage_file, delete_song, get_or_generate_song_thumbnail

from flask import make_response, request, send_file, session

from utils.adv_responses import send_binary_image
from utils.password_manager import auth_required, admin_required
from utils.request_codes import RequestCode


@app.route("/music/new", methods=["POST"])
@admin_required
def new_song():
    songs = request.files.getlist("files")
    album = request.form.get("album")

    if songs is None or len(songs) == 0:
        return make_response("Invalid request", RequestCode.ClientError.BadRequest)

    for song in songs:
        upload_song(None, song, album)

    return make_response("Songs uploaded", RequestCode.Success.Created)


@app.route("/music/files", methods=["GET"])
@auth_required
def song_files():
    return make_response([song.to_json() for song in get_songs()], RequestCode.Success.OK)


@app.route("/music/liked", methods=["GET"])
@auth_required
def liked_songs():
    return make_response(get_liked_songs(session.get("username")), RequestCode.Success.OK)


@app.route("/music/<uuid>", methods=["GET"])
@auth_required
def song_info(uuid):
    song = get_song(uuid)

    if song is None:
        return make_response("Song not found", RequestCode.ClientError.NotFound)

    if "thumbnail" in request.args:
        if song.thumbnail is None:
            return send_binary_image(get_or_generate_song_thumbnail(song))
        return send_binary_image(song.thumbnail)

    if "like" in request.args:
        return "ok" if add_liked_song(session.get("username"), song.id) else "error"

    if "unlike" in request.args:
        return "ok" if remove_liked_song(session.get("username"), song.id) else "error"

    return send_file(get_song_storage_file(song.uuid), mimetype="audio/mpeg")


@app.route("/music/<uuid>/<action>", methods=["POST"])
@admin_required
def song_actions(uuid, action):
    song = get_song(uuid)

    if song is None:
        return make_response("Song not found", RequestCode.ClientError.NotFound)

    if action == "edit":
        return edit_song(song.uuid, **request.form, **request.files).to_json()

    if action == "delete":
        return "ok" if delete_song(song.uuid) else "error"

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)
