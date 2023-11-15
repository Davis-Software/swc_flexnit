from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text

from models.base_model import BaseModel


class TitleModel(BaseModel):
    __abstract__ = True

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    added_on = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, title):
        self.uuid = str(uuid4())
        self.title = title

