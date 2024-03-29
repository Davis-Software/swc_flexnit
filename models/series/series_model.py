from models.title import TitleModel
from sqlalchemy import Column, Integer, String, Boolean, BLOB
from sqlalchemy.orm import relationship


class SeriesModel(TitleModel):
    __tablename__ = "series"

    intro_skip = Column(Boolean, nullable=False, default=False)
    intro_global = Column(Boolean, nullable=False, default=False)
    intro_start = Column(Integer, nullable=True)
    intro_length = Column(Integer, nullable=True)
    endcard = Column(Boolean, nullable=False, default=False)
    endcard_length = Column(Integer, nullable=True)

    intro_audio = Column(BLOB, nullable=True)

    episodes = relationship("EpisodeModel", back_populates="series")

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
