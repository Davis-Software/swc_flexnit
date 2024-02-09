# Python Module mod-loader


import os
import hashlib


def file_hash(base_path, file_name):
    return hashlib.md5(open(os.path.join(base_path, file_name), 'rb').read()).hexdigest()


def mod_ffmpeg_streaming():
    path = os.path.dirname(__import__('ffmpeg_streaming').__file__)
    modified = False

    if file_hash(path, "_command_builder.py") != file_hash("tools/mods/ffmpeg_streaming", "_command_builder.py"):
        print("Patching ffmpeg_streaming")

        with open(os.path.join(path, "_command_builder.py"), "w") as f:
            f.write(open("tools/mods/ffmpeg_streaming/_command_builder.py").read())

        modified = True

    return modified


def load_mods():
    modified = any([
        mod_ffmpeg_streaming()
    ])

    if modified:
        print("Modules have been updated. Please restart the server.")
        exit(-1)
