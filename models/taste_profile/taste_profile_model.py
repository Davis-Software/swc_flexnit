from models.taste_profile.taste_profile_builder import build_tastes_from_progress, build_recommendations_from_taste_profile
from models.playback_progress import PlaybackProgressModel


class TasteProfile:
    def __init__(self, playback_progress: PlaybackProgressModel):
        self._username = playback_progress.username
        self._playback_progress = playback_progress.progress
        self._taste_profile = {}

    def build(self):
        self._taste_profile = build_tastes_from_progress(self._playback_progress)
        return self

    def get_recommendations(self, limit=5, include_watched=False):
        if self._taste_profile == {}:
            self.build()
        return build_recommendations_from_taste_profile(self._playback_progress, self._taste_profile, limit, include_watched)

    def get_taste_profile(self):
        return self._taste_profile
