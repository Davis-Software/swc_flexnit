# Python Module mod-loader


import os
import hashlib


def file_hash(base_path, file_name):
    return hashlib.md5(open(os.path.join(base_path, file_name), 'rb').read()).hexdigest()


def mod_ffmpeg_streaming(base_dir: str):
    path = os.path.dirname(__import__('ffmpeg_streaming').__file__)
    modified = False

    mod_path = os.path.join(base_dir, "tools/mods/ffmpeg_streaming")
    if file_hash(path, "_command_builder.py") != file_hash(mod_path, "_command_builder.py"):
        print("Patching ffmpeg_streaming")

        with open(os.path.join(path, "_command_builder.py"), "w") as f:
            f.write(open(os.path.join(mod_path, "_command_builder.py"), "r").read())

        modified = True

    return modified


def load_mods(base_dir: str):
    modified = any([
        mod_ffmpeg_streaming(base_dir)
    ])

    if modified:
        print("Modules have been updated. Please restart the server.")
        exit(-1)
