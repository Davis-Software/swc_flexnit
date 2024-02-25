from __init__ import app
from flask import request, make_response

from models.movie import MovieModel
from models.movie import get_movies, latest_movies, search_movies
from models.series import SeriesModel, EpisodeModel, EpisodeGroup
from models.series import get_all_series, latest_series, search_series
from models.title.title_repo import get_titles, get_title_tags
from utils.password_manager import auth_required
from utils.request_codes import RequestCode


TYPE_NAME_MAP = {
    "MovieModel": "movie",
    "SeriesModel": "series",
    "EpisodeModel": "episode",
    "EpisodeGroup": "episode_group"
}


def make_title_entry(title: MovieModel or SeriesModel or EpisodeModel or EpisodeGroup):
    entry = {
        "uuid": title.uuid,
        "type": TYPE_NAME_MAP[type(title).__name__]
    }

    if type(title) is not EpisodeGroup:
        entry["title"] = title.title
        entry["description"] = title.description

    if type(title) is not EpisodeModel and type(title) is not EpisodeGroup:
        entry["year"] = title.year
        entry["is_nsfw"] = title.is_nsfw

    if type(title) is not SeriesModel and type(title) is not EpisodeGroup:
        entry["hls"] = title.video_hls

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


@app.route("/search/<mode>")
@auth_required
def search_title(mode):
    if mode not in ["latest", "movie", "series", "browse", "all"]:
        return make_response({"message": "Invalid mode"}, RequestCode.ClientError.BadRequest)

    results = list()
    search_term = request.args.get("q")

    if mode == "browse":
        return get_titles(
            request.args.get("p", 1, type=int),
            request.args.get("c", 15, type=int),
            make_title_entry
        )

    elif mode == "latest":
        count = int(request.args.get("count", 5))
        latest = []
        for movie in latest_movies(limit=count):
            latest.append(movie)
        for series in latest_series(limit=count, grouping_time=240):
            latest.append(series)

        results = list(sorted(latest, key=lambda x: x.added_on, reverse=True))[:count]

    elif search_term is None:
        if mode in ["movie", "all"]:
            for movie in get_movies(
                request.args.get("c", 25, type=int),
                request.args.get("p", 1, type=int)
            ):
                results.append(movie)
        if mode in ["series", "all"]:
            for series in get_all_series(
                request.args.get("c", 25, type=int),
                request.args.get("p", 1, type=int)
            ):
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


@app.route("/tags")
@auth_required
def get_tags():
    return get_title_tags()
