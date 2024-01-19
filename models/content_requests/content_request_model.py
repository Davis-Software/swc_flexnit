from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text

from models.base_model import BaseModel


class ContentRequestModel(BaseModel):
    __tablename__ = 'content_requests'

    id = Column(Integer, primary_key=True)
    username = Column(String(255), nullable=False)

    content_type = Column(String(255), nullable=False)
    content_title = Column(String(255), nullable=False)
    content_description = Column(Text, nullable=False, default="")
    content_url = Column(String(255), nullable=False, default="")

    status = Column(String(255), nullable=False, default="pending")
    added_on = Column(DateTime, nullable=False, default=datetime.utcnow())
    updated_on = Column(DateTime, nullable=False, default=datetime.utcnow())

    def __init__(self, username, content_type, content_title):
        self.username = username
        self.content_type = content_type
        self.content_title = content_title
