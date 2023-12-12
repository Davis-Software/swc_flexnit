from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, PickleType
from sqlalchemy.ext.mutable import MutableList
from models.base_model import BaseModel


class UserMetrics(BaseModel):
    __tablename__ = 'user_metrics'

    id = Column(Integer, primary_key=True)
    username = Column(String(255), nullable=False, unique=True)

    delivered_media = Column(Integer, nullable=False, default=0)

    delivered_bytes = Column(Integer, nullable=False, default=0)
    delivered_requests_2xx = Column(Integer, nullable=False, default=0)
    delivered_requests_3xx = Column(Integer, nullable=False, default=0)
    delivered_requests_4xx = Column(Integer, nullable=False, default=0)
    delivered_requests_5xx = Column(Integer, nullable=False, default=0)

    last_ip = Column(String(255), nullable=True)
    last_user_agent = Column(String(4096), nullable=True)
    previous_ips = Column(MutableList.as_mutable(PickleType), nullable=False, default=[])
    previous_user_agents = Column(MutableList.as_mutable(PickleType), nullable=False, default=[])

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, username: str):
        self.username = username

        self.delivered_media = 0
        self.delivered_bytes = 0
        self.delivered_requests_2xx = 0
        self.delivered_requests_3xx = 0
        self.delivered_requests_4xx = 0
        self.delivered_requests_5xx = 0

        self.last_ip = None
        self.last_user_agent = None
        self.previous_ips = []
        self.previous_user_agents = []

    def update(self):
        if len(self.previous_ips) > 10:
            self.previous_ips = self.previous_ips[-10:]

        if len(self.previous_user_agents) > 10:
            self.previous_user_agents = self.previous_user_agents[-10:]

        self.updated_at = datetime.utcnow()
        self.commit()

    @staticmethod
    def get_or_create(username: str):
        metrics = UserMetrics.query.filter_by(username=username).first()
        if metrics is None:
            metrics = UserMetrics(username)
            metrics.add()
        return metrics
