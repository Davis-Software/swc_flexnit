from __init__ import db

from models.movie.movie_model import MovieModel
from models.series.series_model import SeriesModel


TITLE_CACHE = []


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
