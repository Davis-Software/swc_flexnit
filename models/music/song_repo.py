from werkzeug.datastructures import FileStorage

from .song_model import SongModel


def add_song(song_uuid: str, title: str):
    song = SongModel.query.filter_by(uuid=song_uuid).first()
    if not song:
        return None

    song = SongModel(title)
    song.add()
    return song


def edit_song(
    uuid: str,
    title: str = None,
    description: str = None,
    artists: str = None,
    thumbnail: FileStorage = None,
    album: str = None
):
    song_model = SongModel.query.filter_by(uuid=uuid).first()
    if not song_model:
        return None

    thumbnail = thumbnail.stream.read() if thumbnail is not None else None

    def check_for_change(attr, value, allow_empty=False):
        return (value is not None or allow_empty) and getattr(song_model, attr) != value

    if check_for_change("title", title):
        song_model.title = title
    if check_for_change("description", description):
        song_model.description = description
    if check_for_change("artists", artists):
        song_model.artists = artists
    if check_for_change("thumbnail", thumbnail):
        song_model.thumbnail = thumbnail
    if check_for_change("album", album):
        song_model.album = album

    song_model.commit()
    return song_model


def delete_song(song_uuid: str):
    song = SongModel.query.filter_by(uuid=song_uuid).first()
    if not song:
        return None

    song.delete()
    return True


def get_song(song_uuid: str):
    song = SongModel.query.filter_by(uuid=song_uuid).first()
    if not song:
        return None

    return song


def get_songs():
    return SongModel.query.all()


def get_songs_by_artist(artist: str):
    return SongModel.query.filter_by(artist=artist).all()
