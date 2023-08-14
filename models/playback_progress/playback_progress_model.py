from models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy_json import NestedMutableJson
from datetime import datetime


class PlaybackProgressModel(BaseModel):
    __tablename__ = 'playback_progress'

    id = Column(Integer, primary_key=True)
    username = Column(String(255), nullable=False)
    progress = Column(NestedMutableJson, nullable=False)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, username, progress):
        self.username = username
        self.progress = progress
