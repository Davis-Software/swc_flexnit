from utils.db_compatible_dict import DBCompatibleDict
from .playback_progress_model import PlaybackProgressModel
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import json


def set_playback_progress(username, progress=None, library=None):
    playback_progress = PlaybackProgressModel.query.filter_by(username=username).first()

    if playback_progress is None:
        playback_progress = PlaybackProgressModel(username)
        playback_progress.add()

    if progress is not None:
        try:
            progress = json.loads(progress)
        except json.decoder.JSONDecodeError:
            progress = {}
        finally:
            playback_progress.progress = progress

    if library is not None:
        try:
            library = json.loads(library)
        except json.decoder.JSONDecodeError:
            library = {}
        finally:
            playback_progress.library = library

    if progress is not None or library is not None:
        playback_progress.updated_at = datetime.utcnow()

    try:
        playback_progress.commit()
    except IntegrityError as e:
        print(e)


def get_playback_progress(username):
    playback_progress = PlaybackProgressModel.query.filter_by(username=username).first()
    if playback_progress is None:
        return DBCompatibleDict({"updated_at": 0})
    else:
        return playback_progress
