from sqlalchemy import or_
from werkzeug.datastructures import FileStorage

from swc_utils.web.auth_manager import check_admin
from .movie_model import MovieModel


def add_movie(title: str):
    movie = MovieModel(title)
    movie.add()
    return movie


def edit_movie(
        uuid: str,
        title: str = None,
        year: str = None,
        tags: str = None,
        description: str = None,
        language: str = None,
        subtitles: str = None,
        subtitle_language: str = None,
        is_visible: str = None,
        is_nsfw: str = None,
        thumbnail: FileStorage = None,
        poster: FileStorage = None
):
    movie = MovieModel.query.filter_by(uuid=uuid).first()
    if not movie:
        return None

    year = int(year) if year is not None and year.isdigit() else None
    subtitles = subtitles == "true"
    is_visible = is_visible == "true"
    is_nsfw = is_nsfw == "true"

    thumbnail = thumbnail.stream.read() if thumbnail is not None else None
    poster = poster.stream.read() if poster is not None else None

    def check_for_change(attr, value, allow_empty=False):
        return (value is not None or allow_empty) and getattr(movie, attr) != value

    if check_for_change("title", title):
        movie.title = title
    if check_for_change("year", year, allow_empty=True):
        movie.year = year
    if check_for_change("tags", tags, allow_empty=True):
        movie.tags = tags
    if check_for_change("description", description):
        movie.description = description
    if check_for_change("language", language):
        movie.language = language
    if check_for_change("subtitles", subtitles):
        movie.subtitles = subtitles
    if check_for_change("subtitle_language", subtitle_language):
        movie.subtitle_language = subtitle_language
    if check_for_change("is_visible", is_visible):
        movie.is_visible = is_visible
    if check_for_change("is_nsfw", is_nsfw):
        movie.is_nsfw = is_nsfw
    if check_for_change("thumbnail", thumbnail):
        movie.thumbnail = thumbnail
    if check_for_change("poster", poster):
        movie.poster = poster

    movie.commit()
    return movie


def get_movie(uuid: str):
    return MovieModel.query.filter_by(uuid=uuid).first()


def delete_movie(uuid: str):
    movie = MovieModel.query.filter_by(uuid=uuid).first()
    if not movie:
        return None

    movie.delete()
    return True


def base_query(order: bool = True):
    query = MovieModel.query

    if order:
        query = query.order_by(MovieModel.title.asc())
    if not check_admin():
        query = query.filter(MovieModel.is_visible)

    return query


def get_movies(limit: int = 25, page: int = 1):
    if limit == -1:
        return base_query().all()
    return base_query().paginate(page=page, per_page=limit, max_per_page=100, error_out=False).items


def latest_movies(limit: int = 25):
    return base_query(False).order_by(MovieModel.added_on.desc()).limit(limit).all()


def search_movies(search_term: str = None, tag_filter: str = None, limit: int = 25):
    query = base_query()
    if tag_filter is not None:
        query = query.filter(MovieModel.tags.like(f"%{tag_filter}%"))
    if search_term is not None:
        query = query.filter(or_(
            MovieModel.title.ilike(f"%{search_term}%"),
            MovieModel.description.ilike(f"%{search_term}%")
        ))
    return query.limit(limit).all()
