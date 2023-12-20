from __init__ import app
from flask import request, make_response

from utils.password_manager import admin_required
from storage.storage_manager import get_storage_info, get_movie_files, get_series_files, get_movie_path, get_series_path, \
    delete_file, recover_file
from storage.remote_tools import info, connect, disconnect, upload_file_to_remote, delete_file_from_remote, \
    download_file_from_remote, REMOTE_HOST, REMOTE_PORT
from utils.request_codes import RequestCode


@app.route("/files")
@app.route("/files/<mode>", methods=["GET", "POST"])
@app.route("/files/<mode>/<path:path>", methods=["GET", "POST"])
@admin_required
def file_manager_index(mode=None, path=None):
    if path is None and mode is None:
        return get_storage_info(force="force" in request.args)

    path = path if path is not None else ""

    if mode == "movie":
        return get_movie_files(path)

    elif mode == "series":
        return get_series_files(path)

    elif mode == "delete":
        m_mode = request.form.get("mode")
        files = request.form.get("files")

        if m_mode is None or path is None or files is None:
            return make_response("Missing mode, path or files", RequestCode.ClientError.BadRequest)

        for file in files.split("//"):
            if delete_file(path, file, m_mode):
                return make_response("Deleted", RequestCode.Success.OK)

        return make_response("Failed to delete", RequestCode.ServerError.InternalServerError)

    elif mode == "recover":
        m_mode = request.form.get("mode")
        file = request.form.get("file")

        if m_mode is None or file is None:
            return make_response("Missing mode or file", RequestCode.ClientError.BadRequest)

        if recover_file(file, m_mode):
            return make_response("Recovered", RequestCode.Success.OK)

    return make_response("Invalid mode", RequestCode.ClientError.BadRequest)


@app.route("/files/converter", methods=["GET"])
@app.route("/files/converter/<mode>", methods=["GET", "POST"])
@app.route("/files/converter/<mode>/<uuid>", methods=["GET", "POST"])
@admin_required
def file_manager_converter(mode=None, uuid=None):
    if mode is None:
        return info()

    if mode == "connect":
        host = request.args.get("host", REMOTE_HOST)
        port = request.args.get("port", REMOTE_PORT, type=int)
        connect(host, port)
        return info()

    elif mode == "disconnect":
        disconnect()
        return info()

    elif mode == "upload":
        mode = request.form.get("mode")
        file_path = request.form.get("path")

        if mode is None or file_path is None:
            return make_response("Missing mode or path", RequestCode.ClientError.BadRequest)

        if file_path.startswith("/"):
            file_path = file_path[1:]

        return upload_file_to_remote(
            get_movie_path(file_path) if mode == "movie" else get_series_path(file_path)
        )

    elif mode == "download":
        path = request.form.get("path")
        mode = request.form.get("mode")

        if mode is None or path is None:
            return make_response("Missing mode or path", RequestCode.ClientError.BadRequest)

        if path.startswith("/"):
            path = path[1:]

        return download_file_from_remote(
            get_movie_path(path) if mode == "movie" else get_series_path(path)
        )

    elif mode == "delete":
        if uuid is None:
            return make_response("Missing uuid", RequestCode.ClientError.BadRequest)

        return delete_file_from_remote(uuid)
