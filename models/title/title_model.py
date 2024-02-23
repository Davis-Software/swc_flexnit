from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, BLOB

from models.base_model import BaseModel


class TitleModel(BaseModel):
    __abstract__ = True

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    tags = Column(Text, nullable=True, default="")
    description = Column(Text, nullable=False, default="")

    year = Column(String(64), nullable=True)
    language = Column(String(255), nullable=True)
    is_visible = Column(Boolean, nullable=False, default=False)
    is_nsfw = Column(Boolean, nullable=False, default=False)

    thumbnail = Column(BLOB, nullable=True)
    poster = Column(BLOB, nullable=True)

    added_on = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, title):
        self.uuid = str(uuid4())
        self.title = title

