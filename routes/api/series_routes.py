from __init__ import app
from flask import request, make_response, send_file

from models.series import get_series, add_series, edit_series, add_episode, get_episode, edit_episode, get_all_episodes
from storage.series_storage import upload_episode_file, convert_episode_to_hls, revert_episode_to_mp4, \
    get_episode_files, \
    get_episode_file, delete_episode, get_episode_part, delete_episode_file, set_main_file, create_and_upload_episode, \
    convert_season_to_hls, delete_episode_hls_files, get_episode_frame, detect_season_intros, convert_episode_to_dash, \
    reinitialize_legacy_hls, convert_season_to_dash, delete_episode_dash_files
from storage.storage_tools import get_sized_thumbnail
from scraper.imdb_scraper import IMDBScraper
from swc_utils.web import send_binary_image, RequestCode
from swc_utils.web.auth_manager import auth_required, admin_required, check_permission


@app.route("/series/new", methods=["POST"])
@admin_required
def new_series():
    title = request.form.get("title")

    if title is not None:
        series = add_series(title)
        return make_response(series.to_json(), RequestCode.Success.OK)

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)


@app.route("/series/util/<action>", methods=["GET"])
@admin_required
def series_options(action=None):
    if action is None:
        return make_response("Invalid request", RequestCode.ClientError.BadRequest)

    if action == "reload-legacies":
        reinitialize_legacy_hls(get_all_episodes(-1))
        return make_response("Reloaded", RequestCode.Success.OK)


@app.route("/series/<uuid>", methods=["GET"])
@auth_required
def series_info(uuid):
    series = get_series(uuid)

    if series is None:
        return make_response("Series not found", RequestCode.ClientError.NotFound)

    if "poster" in request.args:
        return send_binary_image(series.poster)

    if "thumbnail" in request.args:
        return send_binary_image(get_sized_thumbnail(
            series,
            request.args.get("q", "h")
        ))

    if "intro_audio" in request.args:
        if series.intro_audio is None:
            return make_response("No intro audio", RequestCode.ClientError.NotFound)

        resp = make_response(series.intro_audio, RequestCode.Success.OK)
        resp.headers.set("Content-Type", "audio/wav")
        return resp

    return make_response(series.to_json(), RequestCode.Success.OK)


@app.route("/series/<uuid>/<action>", methods=["GET", "POST"])
@admin_required
def series_actions(uuid, action):
    series = get_series(uuid)

    if series is None:
        return make_response("Series not found", RequestCode.ClientError.NotFound)

    if action == "edit":
        return edit_series(series.uuid, **request.form, **request.files).to_json()

    if action == "scrape_imdb":
        if "imdb_id" not in request.form:
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)
        scraper = IMDBScraper(
            request.form.get("imdb_id"),
            set_metadata=request.form.get("metadata") == "1",
            set_media=request.form.get("media") == "1",
            set_sub_info=request.form.get("sub_info") == "1"
        )
        return scraper.link_to_series(series).to_json()

    if action == "detect":
        season = request.form.get("season")
        if season is None or not season.isdigit():
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)

        if detect_season_intros(series.uuid, int(season)):
            return make_response("Detected", RequestCode.Success.OK)

        return make_response("Unknown error", RequestCode.ServerError.InternalServerError)

    if action == "convert":
        mode = request.args.get("mode", "dash")
        season = request.form.get("season")

        if mode not in ["dash", "hls"] or season is None or not season.isdigit():
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)

        print("Converting season", season, "of series", series.uuid, "to", mode)

        if mode == "hls":
            if convert_season_to_hls(series.uuid, int(season), "encode" in request.args):
                return make_response("Converted", RequestCode.Success.OK)
        else:
            if convert_season_to_dash(series.uuid, int(season)):
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

    episode = add_episode(series.uuid, **request.form)

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
        mode = request.args.get("mode", "dash")

        if mode not in ["dash", "hls"]:
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)

        if mode == "hls":
            convert_episode_to_hls(series.uuid, episode_uuid, "encode" in request.args)
        else:
            convert_episode_to_dash(series.uuid, episode_uuid)

        return make_response("Converted", RequestCode.Success.OK)

    if action == "revert":
        revert_episode_to_mp4(series.uuid, episode_uuid)
        return make_response("Reverted", RequestCode.Success.OK)

    if action == "delete_hls":
        delete_episode_hls_files(series.uuid, episode_uuid)
        return make_response("Deleted", RequestCode.Success.OK)

    if action == "delete_dash":
        delete_episode_dash_files(series.uuid, episode_uuid)
        return make_response("Deleted", RequestCode.Success.OK)

    if action == "delete_file":
        delete_episode_file(series.uuid, episode_uuid, request.form.get("file_name"))
        return make_response("Deleted", RequestCode.Success.OK)

    if action == "delete":
        delete_episode(uuid, episode_uuid)
        return make_response("Deleted", RequestCode.Success.OK)

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)


@app.route("/series/<uuid>/episode/<episode_uuid>/deliver/frame/<frame>", methods=["GET"])
@app.route("/series/<uuid>/episode/<episode_uuid>/deliver/<mode>/index", methods=["GET"])
@app.route("/series/<uuid>/episode/<episode_uuid>/deliver/<mode>/index.mpd", methods=["GET"])
@app.route("/series/<uuid>/episode/<episode_uuid>/deliver/<mode>/index.m3u8", methods=["GET"])
@app.route("/series/<uuid>/episode/<episode_uuid>/deliver/<mode>/<file_name>", methods=["GET"])
@auth_required
def deliver_episode_file(uuid, episode_uuid, mode=None, file_name=None, frame=None):
    series = get_series(uuid)

    if series is None:
        return make_response("Series not found", RequestCode.ClientError.NotFound)

    if series.is_nsfw and not check_permission("nsfw"):
        return make_response("Age-Restricted Content", RequestCode.ClientError.Forbidden)

    episode = get_episode(series.uuid, episode_uuid)

    if episode is None:
        return make_response("Episode not found", RequestCode.ClientError.NotFound)

    if episode.is_nsfw and not check_permission("nsfw"):
        return make_response("Age-Restricted Content", RequestCode.ClientError.Forbidden)

    if frame is not None and frame.isdigit():
        frame = get_episode_frame(series.uuid, episode_uuid, int(frame))
        response = make_response(frame if frame is not None else "", RequestCode.Success.OK)
        response.cache_control.max_age = 60 * 60 * 24 * 365
        response.content_type = "image/jpeg"
        return response

    if file_name is None and mode is not None:
        mimetype = "application/vnd.apple.mpegurl" if mode == "hls" else "application/dash+xml" if mode == "dash" else None
        file = get_episode_file(series.uuid, episode_uuid, mode)
        return send_file(
            file,
            mimetype=mimetype,
        ) if file is not None else make_response("File not found", RequestCode.ClientError.NotFound)

    if file_name is not None and mode is not None:
        episode_file = get_episode_part(series.uuid, episode_uuid, file_name, mode)

        if episode_file is None:
            return make_response("File not found", RequestCode.ClientError.NotFound)

        return send_file(episode_file)

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)
