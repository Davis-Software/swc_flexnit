from models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, Text


class LikedSongsModel(BaseModel):
    __tablename__ = 'liked_songs'

    id = Column(Integer, primary_key=True)
    username = Column(String(255), nullable=False, unique=True)
    liked_songs = Column(Text, nullable=False, default="")

    def __init__(self, username, liked_songs: list):
        self.username = username
        self.liked_songs = ",".join(liked_songs)

    def list(self):
        return list(map(int, self.liked_songs.split(","))) if self.liked_songs != "" else []

    def append(self, song_id: int):
        if self.liked_songs == "":
            self.liked_songs = song_id
        else:
            self.liked_songs += "," + str(song_id)
        self.commit()

    def remove(self, song_id: int):
        if str(song_id) in self.liked_songs:
            self.liked_songs = self.liked_songs.replace(str(song_id), "")
            self.liked_songs = self.liked_songs.replace(",,", ",")
            self.liked_songs = self.liked_songs.strip(",")
            self.commit()
