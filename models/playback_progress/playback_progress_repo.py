from .playback_progress_model import PlaybackProgressModel
from datetime import datetime
import json


def set_playback_progress(username, progress):
    playback_progress = PlaybackProgressModel.query.filter_by(username=username).first()

    try:
        progress = json.loads(progress)
    except json.decoder.JSONDecodeError:
        progress = {}

    if playback_progress is None:
        playback_progress = PlaybackProgressModel(username, progress)
        playback_progress.add()
    else:
        playback_progress.progress = progress
        playback_progress.updated_at = datetime.utcnow()
        playback_progress.commit()


def get_playback_progress(username):
    playback_progress = PlaybackProgressModel.query.filter_by(username=username).first()
    if playback_progress is None:
        return {"updated_at": 0}
    else:
        return playback_progress
