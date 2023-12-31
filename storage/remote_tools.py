import os
import requests
import socketio
import mimetypes

from __init__ import config


AUTO_CONNECT_IN_DEBUG = config.get_bool("REMOTE_CONVERSION") and \
                        config.get_bool("DEBUG") and \
                        config.get_bool("DEBUG_AUTO_CONNECT")
REMOTE_HOST = config.get("REMOTE_CONVERSION_HOST")
REMOTE_PORT = config.get("REMOTE_CONVERSION_PORT")
REMOTE_URI = f"http://{REMOTE_HOST}:{REMOTE_PORT}"


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
        "host": REMOTE_HOST,
        "port": REMOTE_PORT,
        "uri": REMOTE_URI,
        **state
    }


def connect(host=None, port=None):
    global REMOTE_URI
    if host is not None and port is not None:
        global REMOTE_HOST, REMOTE_PORT
        REMOTE_HOST = host
        REMOTE_PORT = port
        REMOTE_URI = f"http://{host}:{port}"

    socket.connect(REMOTE_URI)


def disconnect():
    socket.disconnect()


def upload_file_to_remote(file):
    if not socket.connected:
        raise Exception("Not connected to remote conversion server.")

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
