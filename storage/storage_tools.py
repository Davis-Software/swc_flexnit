import subprocess
from __init__ import config
import os
import json


frame_cache = {}


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
