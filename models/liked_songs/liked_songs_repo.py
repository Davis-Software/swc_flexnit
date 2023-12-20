from .liked_songs_model import LikedSongsModel


def get_liked_songs(username: str) -> list[int]:
    liked_songs = LikedSongsModel.query.filter_by(username=username).first()
    if liked_songs is not None:
        return liked_songs.list()
    return []


def add_liked_song(username: str, song_id: int) -> bool:
    liked_songs = LikedSongsModel.query.filter_by(username=username).first()
    if liked_songs is None:
        liked_songs = LikedSongsModel(username, [song_id])
        liked_songs.add()
    else:
        liked_songs.append(song_id)

    return True


def remove_liked_song(username: str, song_id: int) -> bool:
    liked_songs = LikedSongsModel.query.filter_by(username=username).first()
    if liked_songs is not None:
        liked_songs.remove(song_id)
        return True

    return False
