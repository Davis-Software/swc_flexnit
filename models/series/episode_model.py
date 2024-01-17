from models.title import TitleModel
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson


class EpisodeModel(TitleModel):
    __tablename__ = "episode"

    season = Column(Integer, nullable=False)
    episode = Column(Integer, nullable=False)

    series_id = Column(Integer, ForeignKey("series.id"))
    series = relationship("SeriesModel", back_populates="episodes")

    video_file = Column(String(255), nullable=True)
    video_info = Column(NestedMutableJson, nullable=False, default={})
    video_hls = Column(Boolean, nullable=False, default=False)

    is_nsfw = Column(Boolean, nullable=False, default=False)
    has_intro = Column(Boolean, nullable=False, default=False)
    intro_start = Column(Integer, nullable=True)

    @property
    def is_nsfw_inherited(self):
        return self.is_nsfw or self.series.is_nsfw

    def __init__(self, title, season, episode, series_id):
        super().__init__(title)
        self.season = season
        self.episode = episode
        self.series_id = series_id

    def to_dict(self, show: list = None, to_json=True, parent_type = None):
        episode = super().to_dict(show, to_json, parent_type)
        episode["is_nsfw"] = self.is_nsfw_inherited

        return episode
