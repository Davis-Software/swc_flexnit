from werkzeug.datastructures import FileStorage
from sqlalchemy import or_

from utils.password_manager import check_admin
from .series_model import SeriesModel
from .episode_model import EpisodeModel


def add_series(title: str):
    series = SeriesModel(title)
    series.add()
    return series


def edit_series(
        uuid: str,
        title: str = None,
        year: str = None,
        description: str = None,
        language: str = None,
        is_visible: str = None,
        is_nsfw: str = None,
        thumbnail: FileStorage = None,
        poster: FileStorage = None,
        intro_skip: bool = None,
        intro_start: int = None,
        intro_length: int = None
):
    series = SeriesModel.query.filter_by(uuid=uuid).first()
    if not series:
        return None

    year = int(year) if year is not None and year.isdigit() else None
    is_visible = is_visible == "true"
    is_nsfw = is_nsfw == "true"
    intro_skip = intro_skip == "true"

    thumbnail = thumbnail.stream.read() if thumbnail is not None else None
    poster = poster.stream.read() if poster is not None else None

    def check_for_change(attr, value, allow_empty=False):
        return (value is not None or allow_empty) and getattr(series, attr) != value

    if check_for_change("title", title):
        series.title = title
    if check_for_change("year", year, allow_empty=True):
        series.year = year
    if check_for_change("description", description):
        series.description = description
    if check_for_change("language", language):
        series.language = language
    if check_for_change("is_visible", is_visible):
        series.is_visible = is_visible
    if check_for_change("is_nsfw", is_nsfw):
        series.is_nsfw = is_nsfw
    if check_for_change("thumbnail", thumbnail):
        series.thumbnail = thumbnail
    if check_for_change("poster", poster):
        series.poster = poster
    if check_for_change("intro_skip", intro_skip):
        series.intro_skip = intro_skip
    if check_for_change("intro_start", intro_start):
        series.intro_start = intro_start
    if check_for_change("intro_length", intro_length):
        series.intro_length = intro_length

    series.commit()
    return series


def get_series(uuid: str):
    return SeriesModel.query.filter_by(uuid=uuid).first()


def delete_series(uuid: str):
    series = SeriesModel.query.filter_by(uuid=uuid).first()
    if not series:
        return False

    series.delete()
    return True


def add_episode(series_uuid: str, title: str, season: int, episode: int):
    series = SeriesModel.query.filter_by(uuid=series_uuid).first()
    if not series:
        return None

    episode = EpisodeModel(title, season, episode, series.id)
    episode.add()
    return episode


def edit_episode(
        uuid: str,
        title: str = None,
        description: str = None,
        season: str = None,
        episode: str = None
):
    episode_model = EpisodeModel.query.filter_by(uuid=uuid).first()
    if not episode:
        return None

    season = int(season) if season is not None and season.isdigit() else None
    episode = int(episode) if episode is not None and episode.isdigit() else None

    def check_for_change(attr, value):
        return value is not None and getattr(episode_model, attr) != value

    if check_for_change("title", title):
        episode_model.title = title
    if check_for_change("description", description):
        episode_model.description = description
    if check_for_change("season", season):
        episode_model.season = season
    if check_for_change("episode", episode):
        episode_model.episode = episode

    episode_model.commit()
    return episode_model


def delete_episode(uuid: str):
    episode = EpisodeModel.query.filter_by(uuid=uuid).first()
    if not episode:
        return False

    episode.delete()
    return True


def get_episode(series_uuid: str, episode_uuid: str):
    series = SeriesModel.query.filter_by(uuid=series_uuid).first()
    if not series:
        return None

    return EpisodeModel.query.filter_by(uuid=episode_uuid, series_id=series.id).first()


def get_episodes(series_uuid: str, season: int = None):
    series = SeriesModel.query.filter_by(uuid=series_uuid).first()
    if not series:
        return None

    query = EpisodeModel.query.filter_by(series_id=series.id)

    if season is not None:
        query = query.filter_by(season=season)

    return query.all()


def base_query():
    query = SeriesModel.query.order_by(SeriesModel.title)

    if not check_admin():
        query = query.filter_by(is_visible=True)

    return query


def get_all_series(limit: int = 25):
    return base_query().limit(limit).all()


def search_series(search: str, limit: int = 25):
    return base_query().filter(or_(
        SeriesModel.title.like(f"%{search}%"),
        SeriesModel.description.like(f"%{search}%")
    )).limit(limit).all()

