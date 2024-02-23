from sqlalchemy import Column, String, BLOB, Boolean
from sqlalchemy_json import NestedMutableJson
from models.title import TitleModel


class MovieModel(TitleModel):
    __tablename__ = 'movie'

    subtitles = Column(Boolean, nullable=False, default=False)
    subtitle_language = Column(String(255), nullable=True)

    video_file = Column(String(255), nullable=True)
    video_info = Column(NestedMutableJson, nullable=False, default={})
    video_hls = Column(Boolean, nullable=False, default=False)
    video_dash = Column(Boolean, nullable=False, default=False)
