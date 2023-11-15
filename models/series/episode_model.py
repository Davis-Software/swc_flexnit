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

    has_intro = Column(Boolean, nullable=False, default=False)
    intro_start = Column(Integer, nullable=True)

    def __init__(self, title, season, episode, series_id):
        super().__init__(title)
        self.season = season
        self.episode = episode
        self.series_id = series_id
