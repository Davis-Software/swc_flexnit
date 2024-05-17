from sqlalchemy import or_

from models.movie import MovieModel, get_movie
from models.series import SeriesModel, get_series
from models.title.title_repo import make_title_entry


def build_tastes_from_progress(progress: dict):
    parsed_tastes = {}

    for title in progress:
        mode = "movie" if type(progress[title]) == int else "series"

        if mode == "movie":
            movie = get_movie(title)
            if movie is None or not movie.tags:
                continue
            runtime = movie.video_info["format"]["duration"] if movie.video_info \
                      is not None and movie.video_info != {} else None
            factor = progress[title] / runtime if runtime is not None and runtime != 0 else 0
            for tag in movie.tags.split(","):
                if tag not in parsed_tastes:
                    parsed_tastes[tag] = factor
                parsed_tastes[tag] += factor

        elif mode == "series":
            series = get_series(title)
            if series is None or not series.tags:
                continue
            episode_count = len(series.episodes) if series.episodes is not None else None
            factor = ((len(progress[title]) - 1) / episode_count) if episode_count is not None and episode_count != 0 else 0
            for tag in series.tags.split(","):
                if tag not in parsed_tastes:
                    parsed_tastes[tag] = factor
                parsed_tastes[tag] += factor

    return parsed_tastes


def build_recommendations_from_taste_profile(progress: dict, taste_profile: dict, limit, include_watched):
    movies_query = MovieModel.query.filter(or_(*[MovieModel.tags.contains(tag) for tag in taste_profile.keys()]))
    series_query = SeriesModel.query.filter(or_(*[SeriesModel.tags.contains(tag) for tag in taste_profile.keys()]))

    movies = [make_title_entry(movie) for movie in movies_query.all()]
    series = [make_title_entry(series) for series in series_query.all()]

    if not include_watched:
        movies = [movie for movie in movies if movie["uuid"] not in progress.keys()]
        series = [series for series in series if series["uuid"] not in progress.keys()]

    def sort_titles(titles):
        for title in titles:
            title["score"] = sum([taste_profile[tag] if tag in taste_profile else 0 for tag in title["tags"].split(",")])
        sorted_titles = sorted(titles, key=lambda x: x["score"], reverse=True)
        print([title["score"] for title in sorted_titles])
        highest_score = max([title["score"] for title in sorted_titles]) if len(sorted_titles) > 0 else 0
        for title in sorted_titles:
            title["score"] = title["score"] / highest_score if highest_score != 0 else 0
        return sorted_titles

    recommended_movies = sort_titles(movies)
    recommended_series = sort_titles(series)

    if len(recommended_movies) > limit:
        recommended_movies = recommended_movies[:limit]
    if len(recommended_series) > limit:
        recommended_series = recommended_series[:limit]

    return {
        "movies": recommended_movies,
        "series": recommended_series
    }
