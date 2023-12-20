from models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy_json import NestedMutableJson
from datetime import datetime


class PlaybackProgressModel(BaseModel):
    __tablename__ = 'playback_progress'

    id = Column(Integer, primary_key=True)
    username = Column(String(255), nullable=False, unique=True)
    progress = Column(NestedMutableJson, nullable=False, default={})
    library = Column(NestedMutableJson, nullable=False, default={})
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, username):
        self.username = username
