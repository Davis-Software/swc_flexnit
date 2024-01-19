from __init__ import config

import os
import shutil
from os import path
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from models.series import get_series, add_episode, delete_episode as delete_episode_model, get_episode, get_episodes, \
    get_episode_by_season_and_episode
from .storage_tools import get_video_file_info, convert_file_to_hls, remove_hls_files, get_video_frame, get_dir_files, \
    detect_audio_offsets, remove_dash_files, convert_file_to_dash

SERIES_STORAGE_PATH = path.join(config.get("VIDEO_DIR"), "series")


def get_series_storage_path(series_uuid: str, ensure_exists: bool = True):
    series_path = path.join(SERIES_STORAGE_PATH, series_uuid)

    if ensure_exists and not path.exists(series_path):
        os.makedirs(series_path)

    return series_path


def create_and_upload_episode(series_uuid: str, season: int, episode: int, file: FileStorage):
    series_model = get_series(series_uuid)
    if series_model is None:
        return False

    episode_model = add_episode(series_uuid, file.filename, season, episode)
    if episode_model is None:
        return False

    return upload_episode_file(series_uuid, episode_model.uuid, file)


def upload_episode_file(series_uuid: str, episode_uuid, file: FileStorage):
    episode_model = get_episode(series_uuid, episode_uuid)

    if episode_model is None:
        return False

    name = secure_filename(file.filename)

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")
    episode_file_path = path.join(episode_path, name)

    if not path.exists(episode_path):
        os.makedirs(episode_path)

    file.save(episode_file_path)

    episode_model.video_file = name
    episode_model.video_info = get_video_file_info(episode_file_path)
    episode_model.video_hls = False
    episode_model.add()

    return episode_model


def detect_season_intros(series_uuid: str, season: int):
    series_model = get_series(series_uuid)
    if series_model is None:
        return False

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{season}")

    offsets = detect_audio_offsets(series_model.intro_audio, season_path)
    for file in offsets:
        season = int(file.split("/season_")[1].split("/")[0])
        episode = int(file.split("/episode_")[1].split("/")[0])
        episode_model = get_episode_by_season_and_episode(series_uuid, season, episode)
        if episode_model is None:
            return False

        episode_model.has_intro = True
        episode_model.intro_start = int(offsets[file])
        episode_model.commit()

    return True


def convert_episode_to_hls(series_uuid: str, episode_uuid: str, re_encode: bool = False):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None or episode_model.video_file is None:
        return False
    if episode_model.video_hls:
        return True

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")
    file_path = path.join(episode_path, episode_model.video_file)

    convert_file_to_hls(file_path, episode_path, re_encode)

    episode_model.video_hls = True
    episode_model.commit()

    return True


def convert_episode_to_dash(series_uuid: str, episode_uuid: str):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None or episode_model.video_file is None:
        return False
    if episode_model.video_dash:
        return True

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")
    file_path = path.join(episode_path, episode_model.video_file)

    convert_file_to_dash(file_path, episode_path)

    episode_model.video_dash = True
    episode_model.commit()

    return True


def convert_season_to_hls(series_uuid: str, season: int, re_encode: bool = False):
    episodes = get_episodes(series_uuid, season)
    if episodes is None:
        return False

    for episode in episodes:
        convert_episode_to_hls(series_uuid, episode.uuid, re_encode)

    return True


def convert_season_to_dash(series_uuid: str, season: int):
    episodes = get_episodes(series_uuid, season)
    if episodes is None:
        return False

    for episode in episodes:
        convert_episode_to_dash(series_uuid, episode.uuid)

    return True


def revert_episode_to_mp4(series_uuid: str, episode_uuid: str):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None or episode_model.video_file is None:
        return False
    if not episode_model.video_hls and not episode_model.video_dash:
        return True

    episode_model.video_hls = False
    episode_model.video_dash = False
    episode_model.commit()

    return True


def delete_episode_hls_files(series_uuid: str, episode_uuid: str):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None or episode_model.video_file is None:
        return False

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")

    remove_hls_files(episode_path)

    episode_model.video_hls = False
    episode_model.commit()

    return True


def delete_episode_dash_files(series_uuid: str, episode_uuid: str):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None or episode_model.video_file is None:
        return False

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")

    remove_dash_files(episode_path)

    episode_model.video_dash = False
    episode_model.commit()

    return True


def get_episode_frame(series_uuid: str, episode_uuid: str, time_index: int):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None or episode_model.video_file is None:
        return None

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")
    file_path = path.join(episode_path, episode_model.video_file)

    return get_video_frame(file_path, time_index)


def get_episode_files(series_uuid: str, episode_uuid: str):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None:
        return None

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")

    if not path.exists(episode_path):
        os.makedirs(episode_path)

    return {
        "main": episode_model.video_file,
        "files": get_dir_files(episode_path),
    }


def set_main_file(series_uuid: str, episode_uuid: str, file_name: str):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None:
        return False

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")
    file_path = path.join(episode_path, file_name)

    if not path.exists(file_path):
        return False

    episode_model.video_file = file_name
    episode_model.video_info = get_video_file_info(file_path)
    episode_model.video_hls = file_name == "index.m3u8"
    episode_model.commit()

    return True


def get_episode_file(series_uuid: str, episode_uuid: str, mode: str = "file"):
    if mode not in ["file", "hls", "dash"]:
        return None

    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None or episode_model.video_file is None:
        return None

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")
    file_path = path.join(episode_path, episode_model.video_file)

    if mode == "hls" and episode_model.video_hls:
        return path.join(episode_path, "hls/index.m3u8")
    elif mode == "dash" and episode_model.video_dash:
        return path.join(episode_path, "dash/index.mpd")
    elif path.exists(file_path):
        return file_path

    return None


def get_episode_part(series_uuid: str, episode_uuid: str, part: str, mode: str = "dash"):
    if mode not in ["hls", "dash"]:
        return None

    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None or episode_model.video_file is None:
        return None

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")

    if mode == "hls" and episode_model.video_hls:
        return path.join(episode_path, "hls", part)
    elif mode == "dash" and episode_model.video_dash:
        return path.join(episode_path, "dash", part)

    return None


def delete_episode_file(series_uuid: str, episode_uuid: str, file_name: str):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None:
        return False

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")
    file_path = path.join(episode_path, file_name)

    if not path.exists(file_path):
        return False

    os.remove(file_path)

    if episode_model.video_file == file_name:
        episode_model.video_file = None
        episode_model.video_info = {}
        episode_model.video_hls = False
        episode_model.commit()

    return True


def delete_episode(series_uuid: str, episode_uuid: str):
    episode_model = get_episode(series_uuid, episode_uuid)
    if episode_model is None:
        return False

    series_path = get_series_storage_path(series_uuid)
    season_path = path.join(series_path, f"season_{episode_model.season}")
    episode_path = path.join(season_path, f"episode_{episode_model.episode}")

    if path.exists(episode_path):
        shutil.rmtree(episode_path)

    delete_episode_model(episode_model.uuid)

    return True
