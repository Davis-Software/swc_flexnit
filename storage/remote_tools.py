import os
import time
import requests
import socketio
import mimetypes

from __init__ import config
from flask import copy_current_request_context, Response


AUTO_CONNECT_IN_DEBUG = config.get_bool("REMOTE_CONVERSION") and \
                        config.get_bool("DEBUG") and \
                        config.get_bool("DEBUG_AUTO_CONNECT")
REMOTE_URI = f"http://{config.get('REMOTE_CONVERSION_HOST')}:{config.get('REMOTE_CONVERSION_PORT')}"


socket = socketio.Client(
    reconnection=True,
    reconnection_delay=1,
    reconnection_delay_max=5,
    reconnection_attempts=5
)
state = {
    "enabled": config.get_bool("REMOTE_CONVERSION")
}


def info():
    if socket.connected:
        state["files"] = socket.call("info")
        state["output"] = socket.call("output")
    else:
        state["files"] = []
        state["output"] = None

    return {
        "connected": socket.connected,
        **state
    }


def connect():
    socket.connect(REMOTE_URI)


def disconnect():
    socket.disconnect()


def upload_file_to_remote(file):
    if not os.path.exists(file):
        raise FileNotFoundError(f"File {file} does not exist.")

    if not os.path.isfile(file):
        raise FileNotFoundError(f"File {file} is not a file.")

    with open(file, "rb") as f:
        resp = requests.post(
            f"{REMOTE_URI}/upload",
            files={
                "file": (os.path.basename(file), f, mimetypes.guess_type(file)[0])
            }
        )

        if resp.status_code != 200:
            raise Exception(f"Could not upload file to remote server: {resp.text}")

    return resp.json()


def delete_file_from_remote(file_uuid):
    return socket.call("delete", file_uuid)


def convert_file_on_remote(file_uuid, transcode_audio, transcode_video, accelerator, encoder_preset, output_format, stream=False):
    call_options = (file_uuid, transcode_audio, transcode_video, accelerator, encoder_preset, output_format)

    if stream:
        progress = 0

        def update_progress(data):
            nonlocal progress
            progress = data["progress"]

        @copy_current_request_context
        def progress_callback():
            while True:
                yield progress

                if progress >= 100:
                    break

                time.sleep(1)

            return progress

        socket.on("progress", update_progress)
        socket.emit("convert", call_options)

        return Response(progress_callback(), mimetype="text/event-stream")

    return socket.call("convert", call_options)


def download_file_from_remote(to):
    if not os.path.exists(to):
        raise FileNotFoundError(f"Folder {to} does not exist.")

    if not os.path.isdir(to):
        raise FileNotFoundError(f"{to} is not a folder.")

    with requests.get(f"{REMOTE_URI}/download", stream=True) as resp:
        if resp.status_code != 200:
            raise Exception(f"Could not download file from remote server: {resp.text}")

        local_filename = os.path.join(to, resp.headers["Content-Disposition"].split("=").pop())
        with open(local_filename, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        return local_filename


if AUTO_CONNECT_IN_DEBUG:
    try:
        connect()
        print("Connected to remote conversion server.")
    except Exception as e:
        print("Could not connect to remote conversion server:")
        print(e)
        pass
