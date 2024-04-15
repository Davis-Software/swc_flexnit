from datetime import datetime

from __init__ import config

from sqlalchemy import Column, Integer, String, DateTime, PickleType
from sqlalchemy.ext.mutable import MutableList
from models.base_model import BaseModel


METRIC_RETAIN = config.get_int("METRIC_RETAIN", 10)


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

    delivered_title_uuids = Column(MutableList.as_mutable(PickleType), nullable=False, default=[])

    last_ip = Column(String(255), nullable=True)
    last_user_agent = Column(String(4096), nullable=True)
    previous_ips = Column(MutableList.as_mutable(PickleType), nullable=False, default=[])
    previous_user_agents = Column(MutableList.as_mutable(PickleType), nullable=False, default=[])

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, username: str):
        super().__init__()

        self.username = username

        self.delivered_media = 0
        self.delivered_bytes = 0
        self.delivered_requests_2xx = 0
        self.delivered_requests_3xx = 0
        self.delivered_requests_4xx = 0
        self.delivered_requests_5xx = 0

        self.delivered_title_uuids = []

        self.last_ip = None
        self.last_user_agent = None
        self.previous_ips = []
        self.previous_user_agents = []

    def update(self):
        if len(self.previous_ips) > 10:
            self.previous_ips = self.previous_ips[-METRIC_RETAIN:]

        if len(self.previous_user_agents) > 10:
            self.previous_user_agents = self.previous_user_agents[-METRIC_RETAIN:]

        self.updated_at = datetime.utcnow()
        self.commit()

    @staticmethod
    def get_or_create(username: str):
        metrics = UserMetrics.query.filter_by(username=username).first()
        if metrics is None:
            metrics = UserMetrics(username)
            metrics.add()
        return metrics


class UserMetricStruct:
    def __init__(self, username):
        self.__model = UserMetrics.get_or_create(username)

        self.id = self.__model.id
        self.username = self.__model.username
        self.delivered_media = self.__model.delivered_media
        self.delivered_bytes = self.__model.delivered_bytes
        self.delivered_requests_2xx = self.__model.delivered_requests_2xx
        self.delivered_requests_3xx = self.__model.delivered_requests_3xx
        self.delivered_requests_4xx = self.__model.delivered_requests_4xx
        self.delivered_requests_5xx = self.__model.delivered_requests_5xx
        self.delivered_title_uuids = self.__model.delivered_title_uuids
        self.last_ip = self.__model.last_ip
        self.last_user_agent = self.__model.last_user_agent
        self.previous_ips = self.__model.previous_ips
        self.previous_user_agents = self.__model.previous_user_agents

    def push_to_db(self):
        model = UserMetrics.get_or_create(self.username)
        model.delivered_media = self.delivered_media
        model.delivered_bytes = self.delivered_bytes
        model.delivered_requests_2xx = self.delivered_requests_2xx
        model.delivered_requests_3xx = self.delivered_requests_3xx
        model.delivered_requests_4xx = self.delivered_requests_4xx
        model.delivered_requests_5xx = self.delivered_requests_5xx
        model.delivered_title_uuids = self.delivered_title_uuids
        model.last_ip = self.last_ip
        model.last_user_agent = self.last_user_agent
        model.previous_ips = self.previous_ips
        model.previous_user_agents = self.previous_user_agents
        model.update()
