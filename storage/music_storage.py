from __init__ import config

import os
from os import path
from werkzeug.datastructures import FileStorage

from models.music import add_song, get_song, delete_song as delete_song_model
from .storage_tools import get_video_file_info

MUSIC_STORAGE_PATH = path.join(config.get("VIDEO_DIR"), "music")


def get_song_storage_file(song_uuid: str, ensure_exists: bool = True):
    if ensure_exists and not path.exists(MUSIC_STORAGE_PATH):
        os.makedirs(MUSIC_STORAGE_PATH)

    file = path.join(MUSIC_STORAGE_PATH, song_uuid)

    return file if path.exists(file) else None


def upload_song(song_uuid: str, file: FileStorage):
    song = get_song(song_uuid)
    if song is None:
        song = add_song(song_uuid, file.name)

    file_path = path.join(MUSIC_STORAGE_PATH, song.uuid)
    file.save(file_path)

    song.audio_info = get_video_file_info(file_path)
    song.add()


def delete_song(song_uuid: str):
    song = get_song(song_uuid)
    if song is None:
        return False

    file_path = path.join(MUSIC_STORAGE_PATH, song.uuid)
    if path.exists(file_path):
        os.remove(file_path)

    delete_song_model(song_uuid)
    return True
