import subprocess
from __init__ import config
import os
import json
from uuid import uuid4
from hashlib import md5

from models.movie import MovieModel
from models.series import SeriesModel
from utils.wsl_compatability import make_wsl_command, get_wsl_path, get_local_wsl_temp_dir

frame_cache = {}
thumbnail_cache = os.path.join(config.get("VIDEO_DIR"), "thumbnail_cache")


if os.path.exists(thumbnail_cache):
    for file in os.listdir(thumbnail_cache):
        os.remove(os.path.join(thumbnail_cache, file))


def get_video_file_info(file_path: str):
    ffprobe = subprocess.Popen(
        [
            config.get("FFPROBE_PATH"),
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            file_path,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    return json.loads(ffprobe.stdout.read())


def get_dir_files(file_path: str):
    files = []
    dir_files = os.listdir(file_path)
    for file in dir_files:
        if file.endswith(".ts"):
            continue
        elif file.endswith(".m3u8"):
            segments = list(filter(lambda x: x.endswith(".ts"), dir_files))
            display_name = f"{file} (HLS with {len(segments)} segments)"
            size = sum([os.path.getsize(os.path.join(file_path, segment)) for segment in segments])
        else:
            display_name = file
            size = os.path.getsize(os.path.join(file_path, file))

        files.append({
            "name": file,
            "size": size,
            "display_name": display_name,
        })

    return files


def get_video_frame(file_path: str, time_index: int):
    key = f"{file_path}_{time_index}"

    if key in frame_cache:
        return frame_cache[key]

    ffmpeg = subprocess.Popen(
        [
            config.get("FFMPEG_PATH"),
            "-y",
            "-loglevel",
            "quiet",
            "-ss",
            str(time_index),
            "-i",
            file_path,
            "-vframes",
            "1",
            "-f",
            "image2",
            "-preset",
            "ultrafast",
            "-",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    frame = ffmpeg.stdout.read()
    frame_cache[key] = frame

    return frame


def detect_audio_offsets(search_file: bytes, video_folder: str, ignore_files: str = "m3u8,ts"):
    ffmpeg = config.get("FFMPEG_PATH")

    file = str(uuid4()) + ".wav"
    with open(get_local_wsl_temp_dir() + file, "wb") as f:
        f.write(search_file)

    aivd = subprocess.Popen(make_wsl_command([
        config.get("AIVD_PATH"),
        "--find-offset-of",
        f"/tmp/{file}",
        "--within",
        get_wsl_path(video_folder),
        "--extension-skip",
        ignore_files,
        "--recursive",
        "true",
        "--window",
        "900",
        "--log-level",
        "fatal",
        "--raw",
        "true",
        "--ffmpeg",
        ffmpeg if not config.get_bool("USE_WSL") else config.get("WSL_FFMPEG")
    ]),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

    resp = aivd.stdout.read()
    os.remove(get_local_wsl_temp_dir() + file)

    return json.loads(resp)


def convert_file_to_hls(input_file: str, output_file: str, re_encode: bool = False):
    ffmpeg = config.get("FFMPEG_PATH")
    hw_accel = config.get_bool("FFMPEG_NVENC")
    accelerator = config.get("FFMPEG_NVENC_ACCELERATOR")
    encoder_preset = config.get("FFMPEG_NVENC_PRESET")
    accelerator = accelerator if (accelerator in
                                  ["cuda", "nvdec", "vdpau", "vaapi"]
                                  ) else "cuda"
    encoder_preset = encoder_preset if (encoder_preset in
                                        ["slow", "medium", "fast", "hp", "hq", "bd", "ll", "llhq", "llhp", "lossless", "losslesshp"]
                                        ) else "slow"

    if re_encode and hw_accel:
        opts = [
            ffmpeg,
            "-hwaccel",
            accelerator,
            "-hwaccel_output_format",
            "cuda",
            "-i",
            input_file,
            "-c:v",
            "h264_nvenc",
            "-preset",
            encoder_preset,
            "-c:a",
            "copy"
        ]
    else:
        opts = [
            ffmpeg,
            "-i",
            input_file,
            "-c" if not re_encode else "-c:a",
            "copy",
        ]

    subprocess.run(
        [
            *opts,
            "-start_number",
            "0",
            "-hls_time",
            "20",
            "-hls_list_size",
            "0",
            "-f",
            "hls",
            output_file
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )


def remove_hls_files(file_path: str):
    for file in os.listdir(file_path):
        if file.endswith(".ts") or file.endswith(".m3u8"):
            os.remove(os.path.join(file_path, file))


def get_sized_thumbnail(title: MovieModel or SeriesModel, quality: str = "o"):
    if title is None or title.thumbnail is None:
        return None

    if not os.path.exists(thumbnail_cache):
        os.makedirs(thumbnail_cache)

    if quality == "o":
        return title.thumbnail

    key = f"{md5(title.title.encode('utf-8')).hexdigest()}_{quality}"
    path = os.path.join(thumbnail_cache, key)

    if os.path.exists(path):
        with open(path, "rb") as f:
            return f.read()

    temp_target = os.path.join(thumbnail_cache, f"{key}_conv-temp")

    with open(temp_target, "wb") as f:
        f.write(title.thumbnail)

    if quality == "h":
        conversion = "iw/1.5:ih/1.5"

    elif quality == "m":
        conversion = "iw/2:ih/2"

    elif quality == "l":
        conversion = "iw/4:ih/4"

    elif quality == "s":
        conversion = "iw/8:ih/8"

    else:
        return None

    ffmpeg = subprocess.Popen(
        [
            config.get("FFMPEG_PATH"),
            "-y",
            "-loglevel",
            "quiet",
            "-i",
            temp_target,
            "-vf",
            f"scale={conversion}",
            "-f",
            "image2",
            "-preset",
            "ultrafast",
            "-",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    frame = ffmpeg.stdout.read()

    with open(path, "wb") as f:
        f.write(frame)

    os.remove(temp_target)

    return frame
