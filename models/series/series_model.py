from models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, Boolean, BLOB
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4


class SeriesModel(BaseModel):
    __tablename__ = "series"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    year = Column(Integer, nullable=True)
    description = Column(String(255), nullable=True)
    language = Column(String(255), nullable=True)
    is_visible = Column(Boolean, nullable=False, default=False)
    is_nsfw = Column(Boolean, nullable=False, default=False)
    added_on = Column(DateTime, nullable=False, default=datetime.utcnow)

    intro_skip = Column(Boolean, nullable=False, default=False)
    intro_start = Column(Integer, nullable=True)
    intro_length = Column(Integer, nullable=True)
    endcard = Column(Boolean, nullable=False, default=False)
    endcard_length = Column(Integer, nullable=True)

    thumbnail = Column(BLOB, nullable=True)
    poster = Column(BLOB, nullable=True)

    episodes = relationship("EpisodeModel", back_populates="series")

    def __init__(self, title):
        self.uuid = str(uuid4())
        self.title = title

    @property
    def season_count(self):
        season = 0
        for episode in self.episodes:
            if episode.season > season:
                season = episode.season
        return season

    def to_dict(self, show: list = None, to_json=True, parent_type=None):
        return {
            **super().to_dict(),
            "season_count": self.season_count
        }
