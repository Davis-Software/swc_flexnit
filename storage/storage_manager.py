import os
import psutil

from __init__ import config
from models.movie import get_movie
from models.series import get_series
from storage.movie_storage import MOVIE_STORAGE_PATH
from storage.series_storage import SERIES_STORAGE_PATH

STATIC_PATH = config.get("VIDEO_DIR")

CACHE = {
    "SIZE_CACHE": {}
}


def get_file_size(path, force=False):
    if not force and path in CACHE["SIZE_CACHE"]:
        return CACHE["SIZE_CACHE"][path]
    else:
        size = os.path.getsize(path)
        CACHE["SIZE_CACHE"][path] = size
        return size


def calculate_size(path, force_level=1):
    if force_level <= 0 and "total_size" in CACHE["SIZE_CACHE"]:
        return CACHE["SIZE_CACHE"]["total_size"]
    else:
        total_size = 0
        for dir_path, dir_names, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dir_path, f)
                total_size += get_file_size(fp, force=force_level > 1)

        return total_size


def process_info():
    process = psutil.Process(os.getpid())
    return {
        "memory": process.memory_info().rss,
        "cpu": process.cpu_percent(),
        "threads": process.num_threads()
    }


def get_storage_info(force=False):
    force = 1 if force else 0
    return {
        "movie_size": calculate_size(MOVIE_STORAGE_PATH, force_level=force),
        "series_size": calculate_size(SERIES_STORAGE_PATH, force_level=force),
        "process_info": process_info(),
    }


def get_movie_path(path_var):
    return os.path.join(MOVIE_STORAGE_PATH, path_var)


def get_series_path(path_var):
    return os.path.join(SERIES_STORAGE_PATH, path_var)


def get_movie_files(path_var):
    path = get_movie_path(path_var)

    if not os.path.exists(path):
        return []

    files: list[str] = os.listdir(path)
    ret_files = []

    if path_var == "":
        for file in files:
            movie = get_movie(file)
            ret_files.append({
                "filename": file,
                "display_name": movie.title if movie is not None else file,
                "size": calculate_size(os.path.join(path, file)),
                "is_dir": True,
                "not_found": movie is None,
            })

    else:
        for file in files:
            is_dir = os.path.isdir(os.path.join(path, file))

            if not is_dir and file.endswith(".ts"):
                continue
            elif not is_dir and file.endswith(".m3u8"):
                segments = list(filter(lambda x: x.endswith(".ts"), files))
                display_name = f"{file} (HLS with {len(segments)} segments)"
                size = 0
                for segment in [file] + segments:
                    size += get_file_size(os.path.join(path, segment))
            else:
                display_name = file
                size = calculate_size(os.path.join(path, file)) if is_dir else get_file_size(os.path.join(path, file))

            ret_files.append({
                "filename": file,
                "display_name": display_name,
                "size": size,
                "is_dir": is_dir,
                "not_found": False,
            })

    return ret_files


def get_series_files(path_var):
    path = get_series_path(path_var)

    if not os.path.exists(path):
        return []

    files: list[str] = os.listdir(path)
    ret_files = []

    if path_var == "":
        for file in files:
            series = get_series(file)
            ret_files.append({
                "filename": file,
                "display_name": series.title if series is not None else file,
                "size": calculate_size(os.path.join(path, file)),
                "is_dir": True,
                "not_found": series is None,
            })

    else:
        for file in files:
            is_dir = os.path.isdir(os.path.join(path, file))
            display_name = file

            if is_dir:
                if display_name.startswith("season_"):
                    display_name = "Season " + display_name.split("_").pop()
                elif display_name.startswith("episode_"):
                    display_name = "Episode " + display_name.split("_").pop()
                size = calculate_size(os.path.join(path, file))
            else:
                if file.endswith(".ts"):
                    continue
                elif file.endswith(".m3u8"):
                    segments = list(filter(lambda x: x.endswith(".ts"), files))
                    display_name = f"{file} (HLS with {len(segments)} segments)"
                    size = 0
                    for segment in [file] + segments:
                        size += get_file_size(os.path.join(path, segment))
                else:
                    display_name = file
                    size = get_file_size(os.path.join(path, file))

            ret_files.append({
                "filename": file,
                "display_name": display_name,
                "size": size,
                "is_dir": is_dir,
                "not_found": False,
            })

    return ret_files


def delete_file(path, file, mode):
    path = get_movie_path(path) if mode == "movie" else get_series_path(path)
    file = os.path.join(path, file)

    if not os.path.exists(file):
        return False

    if os.path.isdir(file):
        os.rmdir(file)
    else:
        os.remove(file)

    return True
