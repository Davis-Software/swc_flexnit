from __init__ import app
from flask import request, make_response, send_file

from models.series import get_series, add_series, edit_series, add_episode, get_episode, edit_episode
from storage.series_storage import upload_episode_file, convert_episode_to_hls, revert_episode_to_mp4, \
    get_episode_files, \
    get_episode_file, delete_episode, get_episode_part, delete_episode_file, set_main_file, create_and_upload_episode, \
    convert_season_to_hls, delete_episode_hls_files, get_episode_frame
from utils.adv_responses import send_binary_image
from utils.password_manager import auth_required, admin_required
from utils.request_codes import RequestCode


@app.route("/series/new", methods=["POST"])
@admin_required
def new_series():
    title = request.form.get("title")

    if title is not None:
        series = add_series(title)
        return make_response(series.to_json(), RequestCode.Success.OK)

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)


@app.route("/series/<uuid>", methods=["GET"])
@auth_required
def series_info(uuid):
    series = get_series(uuid)

    if series is None:
        return make_response("Series not found", RequestCode.ClientError.NotFound)

    if "poster" in request.args:
        return send_binary_image(series.poster)

    if "thumbnail" in request.args:
        return send_binary_image(series.thumbnail)

    return make_response(series.to_json(), RequestCode.Success.OK)


@app.route("/series/<uuid>/<action>", methods=["GET", "POST"])
@admin_required
def series_actions(uuid, action):
    series = get_series(uuid)

    if series is None:
        return make_response("Series not found", RequestCode.ClientError.NotFound)

    if action == "edit":
        return edit_series(series.uuid, **request.form, **request.files).to_json()

    if action == "convert":
        season = request.form.get("season")
        if season is None or not season.isdigit():
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)

        print("Converting season", season, "of series", series.uuid, "to HLS")
        if convert_season_to_hls(series.uuid, int(season), "encode" in request.args):
            return make_response("Converted", RequestCode.Success.OK)

        return make_response("Unknown error", RequestCode.ServerError.InternalServerError)

    if action == "upload":
        season = request.form.get("season")
        episode = request.form.get("episode")
        episode_file = request.files.get("episode_file")

        if season is None or episode is None or episode_file is None:
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)

        episode = create_and_upload_episode(series.uuid, int(season), int(episode), episode_file)

        if episode is None:
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)

        return make_response(episode.to_json(), RequestCode.Success.OK)

    if action == "delete":
        series.delete()
        return make_response("Deleted", RequestCode.Success.OK)


@app.route("/series/<uuid>/episode/new", methods=["POST"])
@admin_required
def new_episode(uuid):
    series = get_series(uuid)

    if series is None:
        return make_response("Series not found", RequestCode.ClientError.NotFound)

    episode = add_episode(series, **request.form, **request.files)

    if episode is None:
        return make_response("Invalid request", RequestCode.ClientError.BadRequest)

    return make_response(episode.to_json(), RequestCode.Success.OK)


@app.route("/series/<uuid>/episode/<episode_uuid>", methods=["GET"])
@app.route("/series/<uuid>/episode/<episode_uuid>/<action>", methods=["GET", "POST"])
@admin_required
def episode_info(uuid, episode_uuid, action=None):
    series = get_series(uuid)

    if series is None:
        return make_response("Series not found", RequestCode.ClientError.NotFound)

    episode = get_episode(series.uuid, episode_uuid)

    if episode is None:
        return make_response("Episode not found", RequestCode.ClientError.NotFound)

    if action is None:
        return make_response(episode.to_json(), RequestCode.Success.OK)

    if action == "edit":
        return edit_episode(episode_uuid, **request.form).to_json()

    if action == "files":
        return get_episode_files(series.uuid, episode_uuid)

    if action == "upload":
        episode_file = request.files.get("episode")

        if episode_file is None:
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)

        upload_episode_file(series.uuid, episode_uuid, episode_file)
        return make_response("Uploaded", RequestCode.Success.OK)

    if action == "set_main_file":
        set_main_file(series.uuid, episode_uuid, request.form.get("file_name"))
        return make_response("Set", RequestCode.Success.OK)

    if action == "convert":
        convert_episode_to_hls(series.uuid, episode_uuid, "encode" in request.args)
        return make_response("Converted", RequestCode.Success.OK)

    if action == "revert":
        revert_episode_to_mp4(series.uuid, episode_uuid)
        return make_response("Reverted", RequestCode.Success.OK)

    if action == "delete_hls":
        delete_episode_hls_files(series.uuid, episode_uuid)
        return make_response("Deleted", RequestCode.Success.OK)

    if action == "delete_file":
        delete_episode_file(series.uuid, episode_uuid, request.form.get("file_name"))
        return make_response("Deleted", RequestCode.Success.OK)

    if action == "delete":
        delete_episode(uuid, episode_uuid)
        return make_response("Deleted", RequestCode.Success.OK)

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)


@app.route("/series/<uuid>/episode/<episode_uuid>/deliver/main", methods=["GET"])
@app.route("/series/<uuid>/episode/<episode_uuid>/deliver/main/<frame>", methods=["GET"])
@app.route("/series/<uuid>/episode/<episode_uuid>/deliver/<file_name>", methods=["GET"])
@auth_required
def deliver_episode_file(uuid, episode_uuid, file_name=None, frame=None):
    series = get_series(uuid)

    if series is None:
        return make_response("Series not found", RequestCode.ClientError.NotFound)

    episode = get_episode(series.uuid, episode_uuid)

    if episode is None:
        return make_response("Episode not found", RequestCode.ClientError.NotFound)

    if frame is not None and frame.isdigit():
        response = make_response(get_episode_frame(series.uuid, episode_uuid, int(frame)))
        response.cache_control.max_age = 60 * 60 * 24 * 365
        return response

    if file_name is None:
        return send_file(get_episode_file(series.uuid, episode_uuid, "hls" in request.args))

    episode_file = get_episode_part(series.uuid, episode_uuid, file_name)

    if episode_file is None:
        return make_response("File not found", RequestCode.ClientError.NotFound)

    return send_file(episode_file)
