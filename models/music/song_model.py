from models.title import TitleModel
from sqlalchemy import Column, String, BLOB
from sqlalchemy_json import NestedMutableJson


class SongModel(TitleModel):
    __tablename__ = "songs"

    artists = Column(String(2048), nullable=False, default="")
    thumbnail = Column(BLOB, nullable=True)
    album = Column(String(1024), nullable=True)

    audio_info = Column(NestedMutableJson, nullable=True, default={})
