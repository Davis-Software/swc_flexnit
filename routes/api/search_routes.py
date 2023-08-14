from __init__ import app
from flask import request

from models.movie import MovieModel
from models.movie import get_movies, search_movies
from models.series import SeriesModel
from models.series import get_all_series, search_series
from utils.password_manager import auth_required


def make_title_entry(title: MovieModel or SeriesModel):
    entry = {
        "uuid": title.uuid,
        "type": "movie" if type(title) is MovieModel else "series",
        "title": title.title,
        "description": title.description,
        "year": title.year,
        "is_nsfw": title.is_nsfw,
    }
    if type(title) is MovieModel:
        entry["runtime"] = title.video_info["format"]["duration"] if title.video_info is not None and title.video_info != {} else None
    else:
        entry["season_count"] = title.season_count

    return entry


@app.route("/search/<mode>")
@auth_required
def search_title(mode=None):
    results = list()
    search_term = request.args.get("q")

    if search_term is None:
        if mode in ["movie", "all"]:
            for movie in get_movies():
                results.append(movie)
        if mode in ["series", "all"]:
            for series in get_all_series():
                results.append(series)
    else:
        if mode in ["movie", "all"]:
            for movie in search_movies(search_term):
                results.append(movie)
        if mode in ["series", "all"]:
            for series in search_series(search_term):
                results.append(series)

    return list(
        map(make_title_entry, results)
    )
