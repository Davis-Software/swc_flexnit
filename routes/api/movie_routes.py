from __init__ import app
from flask import request, make_response, send_file

from models.movie import get_movie, add_movie, edit_movie
from storage.movie_storage import upload_movie, convert_movie_to_hls, revert_movie_to_mp4, get_movie_files, \
    get_movie_file, delete_movie, get_movie_part, delete_movie_file, set_main_file, delete_movie_hls_files, \
    get_movie_frame
from storage.storage_tools import get_sized_thumbnail
from scraper.imdb_scraper import IMDBScraper
from utils.adv_responses import send_binary_image
from utils.password_manager import auth_required, admin_required, check_permission
from utils.request_codes import RequestCode


@app.route("/movies/new", methods=["POST"])
@admin_required
def new_movie():
    title = request.form.get("title")

    if title is not None:
        movie = add_movie(title)
        return make_response(movie.to_json(), RequestCode.Success.OK)

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)


@app.route("/movies/<uuid>", methods=["GET"])
@auth_required
def movie_info(uuid):
    movie = get_movie(uuid)

    if movie is None:
        return make_response("Movie not found", RequestCode.ClientError.NotFound)

    if "poster" in request.args:
        return send_binary_image(movie.poster)

    if "thumbnail" in request.args:
        return send_binary_image(get_sized_thumbnail(
            movie,
            request.args.get("q", "h")
        ))

    return make_response(movie.to_json(), RequestCode.Success.OK)


@app.route("/movies/<uuid>/<action>", methods=["GET", "POST"])
@admin_required
def movie_actions(uuid, action):
    movie = get_movie(uuid)

    if movie is None:
        return make_response("Movie not found", RequestCode.ClientError.NotFound)

    if action == "edit":
        return edit_movie(movie.uuid, **request.form, **request.files).to_json()

    if action == "files":
        return get_movie_files(movie.uuid)

    if action == "scrape_imdb":
        if "imdb_id" not in request.form:
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)
        scraper = IMDBScraper(request.form.get("imdb_id"))
        return scraper.link_to_movie(movie).to_json()

    if action == "upload":
        movie_file = request.files.get("movie")

        if movie_file is None or movie_file.filename == "":
            return make_response("Invalid request", RequestCode.ClientError.BadRequest)

        upload_movie(movie.uuid, movie_file)
        return make_response("Uploaded", RequestCode.Success.OK)

    if action == "set_main_file":
        set_main_file(movie.uuid, request.form.get("file_name"))
        return make_response("Set", RequestCode.Success.OK)

    if action == "convert":
        convert_movie_to_hls(movie.uuid, "encode" in request.args)
        return make_response("Converted", RequestCode.Success.OK)

    if action == "revert":
        revert_movie_to_mp4(movie.uuid)
        return make_response("Reverted", RequestCode.Success.OK)

    if action == "delete_hls":
        delete_movie_hls_files(movie.uuid)
        return make_response("Deleted", RequestCode.Success.OK)

    if action == "delete_file":
        delete_movie_file(movie.uuid, request.form.get("file_name"))
        return make_response("Deleted", RequestCode.Success.OK)

    if action == "delete":
        delete_movie(movie.uuid)
        return make_response("Deleted", RequestCode.Success.OK)

    return make_response("Invalid request", RequestCode.ClientError.BadRequest)


@app.route("/movies/<uuid>/deliver/main", methods=["GET"])
@app.route("/movies/<uuid>/deliver/main/<frame>", methods=["GET"])
@app.route("/movies/<uuid>/deliver/<file_name>", methods=["GET"])
@auth_required
def deliver_movie(uuid, file_name=None, frame=None):
    movie = get_movie(uuid)

    if movie is None:
        return make_response("Movie not found", RequestCode.ClientError.NotFound)

    if movie.is_nsfw and not check_permission("nsfw"):
        return make_response("Age-Restricted Content", RequestCode.ClientError.Forbidden)

    if frame is not None and frame.isdigit():
        response = make_response(get_movie_frame(movie.uuid, int(frame)))
        response.cache_control.max_age = 60 * 60 * 24 * 365
        return response

    if file_name is None:
        return send_file(
            get_movie_file(movie.uuid, "hls" in request.args)
        )

    movie_file = get_movie_part(movie.uuid, file_name)

    if movie_file is None:
        return make_response("File not found", RequestCode.ClientError.NotFound)

    return send_file(movie_file)
