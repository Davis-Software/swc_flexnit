from __init__ import app
from flask import request, make_response

from models.movie import MovieModel
from models.movie import get_movies, latest_movies, search_movies
from models.series import SeriesModel, EpisodeModel
from models.series import get_all_series, latest_series, search_series
from utils.password_manager import auth_required
from utils.request_codes import RequestCode


TYPE_NAME_MAP = {
    "MovieModel": "movie",
    "SeriesModel": "series",
    "EpisodeModel": "episode"
}


def make_title_entry(title: MovieModel or SeriesModel or EpisodeModel):
    entry = {
        "uuid": title.uuid,
        "type": TYPE_NAME_MAP[type(title).__name__],
        "title": title.title,
        "description": title.description
    }

    if type(title) is not EpisodeModel:
        entry["year"] = title.year
        entry["is_nsfw"] = title.is_nsfw

    if type(title) is MovieModel:
        entry["runtime"] = title.video_info["format"]["duration"] if title.video_info is not None and title.video_info != {} else None
    elif type(title) is SeriesModel:
        entry["season_count"] = title.season_count
    else:
        entry["series"] = make_title_entry(title.series)
        entry["hls"] = title.video_hls

    return entry


@app.route("/search/<mode>")
@auth_required
def search_title(mode):
    if mode not in ["latest", "movie", "series", "all"]:
        return make_response({"message": "Invalid mode"}, RequestCode.ClientError.BadRequest)

    results = list()
    search_term = request.args.get("q")

    if mode == "latest":
        latest = []
        for movie in latest_movies(5):
            latest.append(movie)
        for series in latest_series(limit=5):
            latest.append(series)

        results = list(sorted(latest, key=lambda x: x.added_on, reverse=True))[:5]

    elif search_term is None:
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
