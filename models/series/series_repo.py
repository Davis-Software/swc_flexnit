from datetime import timedelta

from werkzeug.datastructures import FileStorage
from sqlalchemy import or_

from utils.password_manager import check_admin
from .series_model import SeriesModel
from .episode_model import EpisodeModel


EPISODE_GROUP_CACHE = {
    "episode_groups": [],
    "set": -1
}


class EpisodeGroup:
    def __init__(self, uuid: str, series: SeriesModel, episodes: list[EpisodeModel], added_on: str):
        self.uuid = uuid
        self.series = series
        self.episodes = episodes
        self.added_on = added_on


def add_series(title: str):
    series = SeriesModel(title)
    series.add()
    return series


def edit_series(
        uuid: str,
        title: str = None,
        year: str = None,
        tags: str = None,
        description: str = None,
        language: str = None,
        is_visible: str = None,
        is_nsfw: str = None,
        thumbnail: FileStorage = None,
        poster: FileStorage = None,
        intro_audio: FileStorage = None,
        intro_skip: bool = None,
        intro_global: bool = None,
        intro_start: int = None,
        intro_length: int = None,
        endcard: bool = None,
        endcard_length: int = None
):
    series = SeriesModel.query.filter_by(uuid=uuid).first()
    if not series:
        return None

    year = int(year) if year is not None and year.isdigit() else None
    is_visible = is_visible == "true"
    is_nsfw = is_nsfw == "true"
    intro_skip = intro_skip == "true"
    intro_global = intro_global == "true"
    endcard = endcard == "true"

    thumbnail = thumbnail.stream.read() if thumbnail is not None else None
    poster = poster.stream.read() if poster is not None else None
    intro_audio = intro_audio.stream.read() if intro_audio is not None else None

    def check_for_change(attr, value, allow_empty=False):
        return (value is not None or allow_empty) and getattr(series, attr) != value

    if check_for_change("title", title):
        series.title = title
    if check_for_change("year", year, allow_empty=True):
        series.year = year
    if check_for_change("tags", tags, allow_empty=True):
        series.tags = tags
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
    if check_for_change("intro_audio", intro_audio):
        series.intro_audio = intro_audio
    if check_for_change("intro_skip", intro_skip):
        series.intro_skip = intro_skip
    if check_for_change("intro_start", intro_start):
        series.intro_start = intro_start
    if check_for_change("intro_global", intro_global):
        series.intro_global = intro_global
    if check_for_change("intro_length", intro_length):
        series.intro_length = intro_length
    if check_for_change("endcard", endcard):
        series.endcard = endcard
    if check_for_change("endcard_length", endcard_length):
        series.endcard_length = endcard_length

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
        episode: str = None,
        is_nsfw: bool = None,
        has_intro: bool = None,
        intro_start: int = None,
):
    episode_model = EpisodeModel.query.filter_by(uuid=uuid).first()
    if not episode:
        return None

    season = int(season) if season is not None and season.isdigit() else None
    episode = int(episode) if episode is not None and episode.isdigit() else None

    is_nsfw = is_nsfw == "true"
    has_intro = has_intro == "true"

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
    if check_for_change("is_nsfw", is_nsfw):
        episode_model.is_nsfw = is_nsfw
    if check_for_change("has_intro", has_intro):
        episode_model.has_intro = has_intro
    if check_for_change("intro_start", intro_start):
        episode_model.intro_start = intro_start

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


def get_episode_by_season_and_episode(series_uuid: str, season: int, episode: int):
    series = SeriesModel.query.filter_by(uuid=series_uuid).first()
    if not series:
        return None

    return EpisodeModel.query.filter_by(series_id=series.id, season=season, episode=episode).first()


def get_episodes(series_uuid: str, season: int = None):
    series = SeriesModel.query.filter_by(uuid=series_uuid).first()
    if not series:
        return None

    query = EpisodeModel.query.filter_by(series_id=series.id)

    if season is not None:
        query = query.filter_by(season=season)

    return query.all()


def get_all_episodes(limit: int = 25, page: int = 1):
    if limit == -1:
        return EpisodeModel.query.all()
    return EpisodeModel.query.paginate(page, limit, False).items


def base_query(order: bool = True):
    query = SeriesModel.query

    if order:
        query = query.order_by(SeriesModel.title.asc())
    if not check_admin():
        query = query.filter(SeriesModel.is_visible)

    return query


def get_all_series(limit: int = 25, page: int = 1):
    if limit == -1:
        return base_query().all()
    return base_query().paginate(page, limit, False).items


def latest_series(both: bool = True, limit: int = 25, grouping_time: int = 30):
    set_check = (
            len(EPISODE_GROUP_CACHE["episode_groups"]) == 0 or
            EPISODE_GROUP_CACHE["set"] !=
            (both + limit + grouping_time * (EpisodeModel.query.count() + SeriesModel.query.count()))
    )

    if set_check:
        EPISODE_GROUP_CACHE["set"] = \
            both + limit + grouping_time * (EpisodeModel.query.count() + SeriesModel.query.count())
    else:
        return EPISODE_GROUP_CACHE["episode_groups"]

    result = \
        base_query(False) \
        .order_by(SeriesModel.added_on.desc()) \
        .limit(limit) \
        .all()

    if both:
        episodes = EpisodeModel.query.order_by(EpisodeModel.added_on.desc()).all()
        episode_groups = []

        if not check_admin():
            episodes = [episode for episode in episodes if episode.series.is_visible]

        for episode in episodes:
            episode_group = EpisodeGroup(episode.uuid, episode.series, [episode], episode.added_on)

            for ep in episodes:
                if ep.uuid == episode.uuid:
                    continue
                if episode.added_on - timedelta(minutes=grouping_time) < ep.added_on < episode.added_on + timedelta(minutes=grouping_time) and \
                        ep.series_id == episode.series_id:
                    episode_group.episodes.append(ep)

            if len(episode_group.episodes) > 1:
                episode_groups.append(episode_group)
                for ep in episode_group.episodes:
                    episodes.remove(ep)

            if episode_group.series in result:
                result.remove(episode_group.series)

        result.extend(episode_groups)
        result.extend(episodes)

    EPISODE_GROUP_CACHE["episode_groups"] = result
    return result


def search_series(search: str, limit: int = 25):
    return base_query().filter(or_(
        SeriesModel.title.ilike(f"%{search}%"),
        SeriesModel.tags.ilike(f"%{search}%"),
        SeriesModel.description.ilike(f"%{search}%")
    )).limit(limit).all()

