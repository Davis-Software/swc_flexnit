from sqlalchemy import Column, Integer, String, Text, BLOB, Boolean, DateTime
from sqlalchemy_json import NestedMutableJson
from models.base_model import BaseModel
from datetime import datetime
from uuid import uuid4


class MovieModel(BaseModel):
    __tablename__ = 'movie'

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), nullable=False, unique=True)
    title = Column(String(255), nullable=False)
    year = Column(String(64), nullable=True)
    description = Column(Text, nullable=True)
    language = Column(String(255), nullable=True)
    subtitles = Column(Boolean, nullable=False, default=False)
    is_visible = Column(Boolean, nullable=False, default=False)
    is_nsfw = Column(Boolean, nullable=False, default=False)
    added_on = Column(DateTime, nullable=False, default=datetime.utcnow)

    thumbnail = Column(BLOB, nullable=True)
    poster = Column(BLOB, nullable=True)

    video_file = Column(String(255), nullable=True)
    video_info = Column(NestedMutableJson, nullable=False, default={})
    video_hls = Column(Boolean, nullable=False, default=False)

    def __init__(self, title):
        self.uuid = str(uuid4())
        self.title = title
