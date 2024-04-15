from __init__ import db

from models.movie.movie_model import MovieModel
from models.series import EpisodeModel, EpisodeGroup
from models.series.series_model import SeriesModel


TITLE_CACHE = []
TYPE_NAME_MAP = {
    "MovieModel": "movie",
    "SeriesModel": "series",
    "EpisodeModel": "episode",
    "EpisodeGroup": "episode_group"
}


def get_titles(page: int, count: int, transform=lambda title: title.to_json()) -> list[dict]:
    title_count = MovieModel.query.count() + SeriesModel.query.count()

    if len(TITLE_CACHE) != title_count:
        TITLE_CACHE.clear()
        TITLE_CACHE.extend([transform(movie) for movie in db.session.query(MovieModel).all()])
        TITLE_CACHE.extend([transform(series) for series in db.session.query(SeriesModel).all()])

        TITLE_CACHE.sort(key=lambda title: title["title"].lower())

    return TITLE_CACHE[(page - 1) * count:page * count]


def get_title_tags():
    tags = set()

    for movie in MovieModel.query.all():
        if movie.tags is None:
            continue
        tags.update(movie.tags.split(","))
    for series in SeriesModel.query.all():
        if series.tags is None:
            continue
        tags.update(series.tags.split(","))

    return list(tags)


def make_title_entry(title: MovieModel or SeriesModel or EpisodeModel or EpisodeGroup):
    if title is None:
        return None
    entry = {
        "uuid": title.uuid,
        "type": TYPE_NAME_MAP[type(title).__name__]
    }

    if type(title) is not EpisodeGroup:
        entry["title"] = title.title
        entry["description"] = title.description

    if type(title) is not EpisodeModel and type(title) is not EpisodeGroup:
        entry["year"] = title.year
        entry["tags"] = title.tags
        entry["is_nsfw"] = title.is_nsfw

    if type(title) is not SeriesModel and type(title) is not EpisodeGroup:
        entry["hls"] = title.video_hls
        entry["dash"] = title.video_dash

    if type(title) is EpisodeGroup:
        entry["series"] = make_title_entry(title.series)
        entry["episodes"] = len(title.episodes)

    if type(title) is MovieModel:
        entry["runtime"] = title.video_info["format"]["duration"] if title.video_info is not None and title.video_info != {} else None
    elif type(title) is SeriesModel:
        entry["season_count"] = title.season_count
    elif type(title) is EpisodeModel:
        entry["series"] = make_title_entry(title.series)

    return entry
