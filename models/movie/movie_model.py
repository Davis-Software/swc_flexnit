from sqlalchemy import Column, String, BLOB, Boolean
from sqlalchemy_json import NestedMutableJson
from models.title import TitleModel


class MovieModel(TitleModel):
    __tablename__ = 'movie'

    year = Column(String(64), nullable=True)
    language = Column(String(255), nullable=True)
    subtitles = Column(Boolean, nullable=False, default=False)
    subtitle_language = Column(String(255), nullable=True)
    is_visible = Column(Boolean, nullable=False, default=False)
    is_nsfw = Column(Boolean, nullable=False, default=False)

    thumbnail = Column(BLOB, nullable=True)
    poster = Column(BLOB, nullable=True)

    video_file = Column(String(255), nullable=True)
    video_info = Column(NestedMutableJson, nullable=False, default={})
    video_hls = Column(Boolean, nullable=False, default=False)
    video_dash = Column(Boolean, nullable=False, default=False)
