import os
import json
import shutil
import subprocess
import multiprocessing
import ffmpeg_streaming

from uuid import uuid4
from hashlib import md5

from __init__ import config
from models.movie import MovieModel
from models.music import SongModel
from models.series import SeriesModel
from utils.wsl_compatability import make_wsl_command, get_wsl_path, get_local_wsl_temp_dir

frame_cache = {}
thumbnail_cache = os.path.join(config.get("VIDEO_DIR"), "thumbnail_cache")

if not os.path.exists(thumbnail_cache):
    os.makedirs(thumbnail_cache)
for file in os.listdir(thumbnail_cache):
    os.remove(os.path.join(thumbnail_cache, file))


def get_video_file_info(file_path: str):
    ffprobe = subprocess.Popen(
        [
            config.get("FFPROBE_PATH"),
            "-v", "quiet",
            "-print_format", "json",
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

    # Preload empty frames to prevent multiple requests for the same frame
    frame_cache[key] = None

    ffmpeg = subprocess.Popen(
        [
            config.get("FFMPEG_PATH"),
            "-y",
            "-loglevel", "quiet",
            "-ss", str(time_index),
            "-i", file_path,
            "-vframes", "1",
            "-vf", f"scale='min(101,-1)':'min(101,100)'",
            "-f", "image2",
            "-preset", "ultrafast",
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
        "-r",
        "-x", ignore_files,
        "-w", "900",
        "-f", "json",
        "-c", str(multiprocessing.cpu_count()),
        "--ffmpeg", ffmpeg if not config.get_bool("USE_WSL") else config.get("WSL_FFMPEG"),
        "--silent",
        f"/tmp/{file}",
        get_wsl_path(video_folder)
    ]),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

    resp = aivd.stdout.read()
    os.remove(get_local_wsl_temp_dir() + file)

    return json.loads(resp.strip())


def convert_file_to_hls(input_file: str, output_location: str, re_encode: bool = False):
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

    destination = os.path.join(output_location, "hls")
    if not os.path.exists(destination):
        os.makedirs(destination)

    if re_encode and hw_accel:
        opts = [
            ffmpeg,
            "-hwaccel", accelerator,
            "-hwaccel_output_format", "cuda",
            "-i", input_file,
            "-c:v", "h264_nvenc",
            "-preset", encoder_preset,
            "-c:a", "aac",
            "-ac", "2"
        ]
    else:
        opts = [
            ffmpeg,
            "-i", input_file,
            "-c:v", "copy" if not re_encode else "h264",
            "-c:a", "copy" if not re_encode else "aac",
        ]
        if re_encode:
            opts.extend([
                "-ac", "2"
            ])

    subprocess.run(
        [
            *opts,
            "-start_number", "0",
            "-hls_time", "20",
            "-hls_list_size", "0",
            "-f", "hls",
            f"{destination}/index.m3u8"
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )


def convert_file_to_dash(input_file: str, output_location: str):
    debug = config.get_bool("DEBUG")
    hw_accel = config.get_bool("FFMPEG_NVENC")

    def monitor(_ffmpeg, duration, time_, time_left, _process):
        import sys
        import datetime
        per = round(time_ / duration * 100)
        sys.stdout.write(
            "\rTranscoding...(%s%%) %s left [%s%s]" %
            (per, datetime.timedelta(seconds=int(time_left)), '#' * per, '-' * (100 - per))
        )
        sys.stdout.flush()

    video = ffmpeg_streaming.input(input_file, pre_opts={
        "hide_banner": None,
        "hwaccel": "cuda" if hw_accel else None,
    })
    c_opts = {
        "pix_fmt": "yuv420p",
        "sn": None,
        "dn": None
    }
    dash = video.dash(
        ffmpeg_streaming.Formats.h264(video="h264_nvenc" if hw_accel else "h264"),
        **c_opts,
        seg_duration=20,
        frag_duration=10,
    )
    dash.auto_generate_representations([])
    dash.output(f"{output_location}/dash/index.mpd", monitor=monitor if debug else None)


def reinitialize_hls(file_path: str):
    os.makedirs(os.path.join(file_path, "hls"), exist_ok=True)
    for file in os.listdir(file_path):
        if file.endswith(".ts") or file.endswith(".m3u8"):
            shutil.move(os.path.join(file_path, file), os.path.join(file_path, "hls", file))


def cleanup_legacy_files(file_path: str):
    for file in os.listdir(file_path):
        if file.endswith(".ts") or file.endswith(".m3u8"):
            os.remove(os.path.join(file_path, file))


def remove_hls_files(file_path: str):
    shutil.rmtree(os.path.join(file_path, "hls"), ignore_errors=True)


def remove_dash_files(file_path: str):
    shutil.rmtree(os.path.join(file_path, "dash"), ignore_errors=True)


def get_sized_thumbnail(title: MovieModel or SeriesModel, quality: str = "o"):
    if title is None or title.thumbnail is None:
        return None

    if quality == "o":
        return title.thumbnail

    key = f"{md5(title.title.encode('utf-8')).hexdigest()}_{quality}"
    path = os.path.join(thumbnail_cache, key)

    if os.path.exists(path):
        with open(path, "rb") as f:
            return f.read()

    if quality == "h":
        conversion = "'min(561,-1)':'min(801,800)'"

    elif quality == "m":
        conversion = "'min(401,-1)':'min(581,580)'"

    elif quality == "l":
        conversion = "'min(201,-1)':'min(301,300)'"

    elif quality == "s":
        conversion = "'min(101,-1)':'min(141,140)'"

    else:
        return None

    ffmpeg = subprocess.Popen(
        [
            config.get("FFMPEG_PATH"),
            "-y",
            "-loglevel", "quiet",
            "-i", "-",
            "-f", "png_pipe",
            "-vf", f"scale={conversion}",
            "-f", "image2",
            "-preset", "ultrafast",
            "-",
        ],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    frame = ffmpeg.communicate(input=title.thumbnail)[0]

    with open(path, "wb") as f:
        f.write(frame)

    return frame


def extract_song_thumbnail(song: SongModel, file_path: str):
    if song.audio_info is None or "streams" not in song.audio_info:
        return

    png_stream = None
    for stream in song.audio_info["streams"]:
        if "codec_name" not in stream or stream["codec_name"] not in ["png", "mjpeg", "bmp", "gif", "tiff", "webp"]:
            continue
        png_stream = stream
        break

    if png_stream is None:
        return

    png_index = png_stream["index"]

    ffmpeg = subprocess.Popen([
        config.get("FFMPEG_PATH"),
        "-y",
        "-loglevel", "quiet",
        "-i", file_path,
        "-map", f"0:{png_index}",
        "-f", "image2",
        "-"
    ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

    image = ffmpeg.stdout.read()
    song.thumbnail = image
    song.commit()

    return image
