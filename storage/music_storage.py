from __init__ import config

import os
from os import path
from werkzeug.datastructures import FileStorage

from models.music import add_song, get_song, delete_song as delete_song_model, SongModel
from .storage_tools import get_video_file_info, extract_song_thumbnail

MUSIC_STORAGE_PATH = path.join(config.get("VIDEO_DIR"), "music")
if not path.exists(MUSIC_STORAGE_PATH):
    os.makedirs(MUSIC_STORAGE_PATH)


def get_song_storage_file(song_uuid: str, ensure_exists: bool = True):
    if ensure_exists and not path.exists(MUSIC_STORAGE_PATH):
        os.makedirs(MUSIC_STORAGE_PATH)

    file = path.join(MUSIC_STORAGE_PATH, song_uuid)

    return file if path.exists(file) else None


def upload_song(song_uuid: str or None, file: FileStorage, album: str = None):
    if song_uuid is None:
        title = ".".join(file.filename.split(".")[:-1])
        artist = title.split(" - ")[0].strip()
        title = " - ".join(title.split(" - ")[1:]).strip()

        if title == "":
            title = artist
            artist = "Unknown"

        song = add_song(title)
        song.artists = ",".join(artist.split(", "))
        if album is not None:
            song.album = album
    else:
        song = get_song(song_uuid)

    if song is None:
        return False

    file_path = path.join(MUSIC_STORAGE_PATH, song.uuid)
    file.save(file_path)

    song.audio_info = get_video_file_info(file_path)

    if song.audio_info is not None and "format" in song.audio_info and "tags" in song.audio_info["format"]:
        song.artists = song.audio_info["format"]["tags"].get("artist", song.artists)\
            .replace("/", ",")\
            .replace(";", ",")\
            .replace(" and ", ",")\
            .replace(" & ", ",")\
            .replace(" ft. ", ",")\
            .replace(" ft ", ",")\
            .replace(" feat. ", ",")\
            .replace(" x ", ",")
        song.title = song.audio_info["format"]["tags"].get("title", song.title)

        if album is None:
            song.album = song.audio_info["format"]["tags"].get("album", song.album)

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


def get_or_generate_song_thumbnail(song: SongModel):
    return extract_song_thumbnail(song, get_song_storage_file(song.uuid))
