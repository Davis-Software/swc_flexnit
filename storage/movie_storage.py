from __init__ import config

import os
import shutil
from os import path
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from models.movie import get_movie, delete_movie as delete_movie_model
from .storage_tools import get_video_file_info, convert_file_to_hls, remove_hls_files, get_video_frame, get_dir_files, \
    remove_dash_files, convert_file_to_dash

MOVIE_STORAGE_PATH = path.join(config.get("VIDEO_DIR"), "movies")


def get_movie_storage_path(movie_uuid: str, ensure_exists: bool = True):
    movie_path = path.join(MOVIE_STORAGE_PATH, movie_uuid)

    if ensure_exists and not path.exists(movie_path):
        os.makedirs(movie_path)

    return movie_path


def upload_movie(movie_uuid: str, file: FileStorage):
    movie = get_movie(movie_uuid)
    if movie is None:
        return False

    name = secure_filename(file.filename)

    movie_path = get_movie_storage_path(movie_uuid)
    file.save(path.join(movie_path, name))

    movie.video_file = name
    movie.video_info = get_video_file_info(path.join(movie_path, name))
    movie.video_hls = False
    movie.commit()
    return True


def convert_movie_to_hls(movie_uuid: str, re_encode: bool = False):
    movie = get_movie(movie_uuid)
    if movie is None or movie.video_file is None:
        return False
    if movie.video_hls:
        return True

    movie_path = get_movie_storage_path(movie_uuid)
    file_path = path.join(movie_path, movie.video_file)

    convert_file_to_hls(file_path, movie_path, re_encode)

    movie.video_hls = True
    movie.commit()
    return True


def convert_movie_to_dash(movie_uuid: str):
    movie = get_movie(movie_uuid)
    if movie is None or movie.video_file is None:
        return False
    if movie.video_dash:
        return True

    movie_path = get_movie_storage_path(movie_uuid)
    file_path = path.join(movie_path, movie.video_file)

    convert_file_to_dash(file_path, movie_path)

    movie.video_dash = True
    movie.commit()
    return True


def revert_movie_to_mp4(movie_uuid: str):
    movie = get_movie(movie_uuid)
    if movie is None or movie.video_file is None:
        return False
    if not movie.video_hls and not movie.video_dash:
        return True

    movie.video_hls = False
    movie.video_dash = False
    movie.commit()
    return True


def delete_movie_hls_files(movie_uuid: str):
    movie = get_movie(movie_uuid)
    if movie is None or movie.video_file is None:
        return False

    movie_path = get_movie_storage_path(movie_uuid)
    remove_hls_files(movie_path)

    movie.video_hls = False
    movie.commit()
    return True


def delete_movie_dash_files(movie_uuid: str):
    movie = get_movie(movie_uuid)
    if movie is None or movie.video_file is None:
        return False

    movie_path = get_movie_storage_path(movie_uuid)
    remove_dash_files(movie_path)

    movie.video_dash = False
    movie.commit()
    return True


def get_movie_frame(movie_uuid: str, time_index: int):
    movie = get_movie(movie_uuid)
    if movie is None or movie.video_file is None:
        return None

    movie_path = get_movie_storage_path(movie_uuid)
    file_path = path.join(movie_path, movie.video_file)

    return get_video_frame(file_path, time_index)


def get_movie_files(movie_uuid: str):
    movie = get_movie(movie_uuid)
    if movie is None:
        return None

    movie_path = get_movie_storage_path(movie_uuid)

    return {
        "main": movie.video_file,
        "files": get_dir_files(movie_path),
    }


def set_main_file(movie_uuid: str, file_name: str):
    movie = get_movie(movie_uuid)
    if movie is None:
        return False

    movie_path = get_movie_storage_path(movie_uuid)
    file_path = path.join(movie_path, file_name)

    if not path.exists(file_path):
        return False

    movie.video_file = file_name
    movie.video_info = get_video_file_info(file_path)
    movie.video_hls = file_name == "index.m3u8"
    movie.commit()
    return True


def get_movie_file(movie_uuid: str, mode: str = "file"):
    if mode not in ["file", "hls", "dash"]:
        return None

    movie = get_movie(movie_uuid)
    if movie is None or movie.video_file is None:
        return None

    movie_path = get_movie_storage_path(movie_uuid)
    file_path = path.join(movie_path, movie.video_file)

    if mode == "hls" and movie.video_hls:
        return path.join(movie_path, "hls/index.m3u8")
    elif mode == "dash" and movie.video_dash:
        return path.join(movie_path, "dash/index.mpd")
    elif path.exists(file_path):
        return file_path

    return None


def get_movie_part(movie_uuid: str, part: str, mode: str = "dash"):
    if mode not in ["hls", "dash"]:
        return None

    movie = get_movie(movie_uuid)
    if movie is None or movie.video_file is None:
        return None

    movie_path = get_movie_storage_path(movie_uuid)

    if mode == "hls" and movie.video_hls:
        return path.join(movie_path, "hls", part)
    elif mode == "dash" and movie.video_dash:
        return path.join(movie_path, "dash", part)

    return None


def delete_movie_file(movie_uuid: str, file_name: str):
    movie = get_movie(movie_uuid)
    if movie is None:
        return False

    movie_path = get_movie_storage_path(movie_uuid, ensure_exists=False)
    file_path = path.join(movie_path, file_name)
    if path.exists(file_path):
        os.remove(file_path)

    movie.video_file = None
    movie.video_info = {}
    movie.video_hls = False
    movie.commit()
    return True


def delete_movie(movie_uuid: str):
    movie = get_movie(movie_uuid)
    if movie is None:
        return False

    movie_path = get_movie_storage_path(movie_uuid, ensure_exists=False)
    if path.exists(movie_path):
        shutil.rmtree(movie_path)

    delete_movie_model(movie_uuid)
    return True
