from __init__ import app
from flask import request, make_response

from utils.password_manager import admin_required
from storage.storage_manager import get_storage_info, get_movie_files, get_series_files
from utils.request_codes import RequestCode


@app.route("/files")
@app.route("/files/<mode>")
@app.route("/files/<mode>/<path:path>")
@admin_required
def file_manager_index(mode=None, path=None):
    if path is None and mode is None:
        return get_storage_info(force="force" in request.args)

    path = path if path is not None else ""

    if mode == "movie":
        return get_movie_files(path)

    elif mode == "series":
        return get_series_files(path)

    return make_response("Invalid mode", RequestCode.ClientError.BadRequest)
