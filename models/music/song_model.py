from models.title import BasicTitleModel
from sqlalchemy import Column, String, BLOB
from sqlalchemy_json import NestedMutableJson


class SongModel(BasicTitleModel):
    __tablename__ = "songs"

    artists = Column(String(2048), nullable=False, default="")
    thumbnail = Column(BLOB, nullable=True)
    album = Column(String(1024), nullable=True)

    audio_info = Column(NestedMutableJson, nullable=True, default={})

    def to_dict(self, show: list = None, to_json=True, parent_type=None):
        dict_obj = super().to_dict(show, to_json, parent_type)
        dict_obj["audio_info"] = {
            "duration": self.audio_info["format"]["duration"] if self.audio_info is not None and "format" in self.audio_info else None
        }
        return dict_obj
