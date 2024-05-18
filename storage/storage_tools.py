import os
import json
import shutil
import iso639
import subprocess
import multiprocessing
import ffmpeg_streaming

from uuid import uuid4
from hashlib import md5

from __init__ import config
from models.movie import MovieModel
from models.music import SongModel
from models.series import SeriesModel
from swc_utils.wsl import make_wsl_command, get_wsl_path, get_local_wsl_temp_dir
from ai_tools.subtitle_generator import generate_subtitles_from_audio_stream

frame_cache = {}
thumbnail_cache = os.path.join(config.get("VIDEO_DIR"), "thumbnail_cache")

AIVD = config.get("AIVD_PATH")
FFMPEG = config.get("FFMPEG_PATH")
FFPROBE = config.get("FFPROBE_PATH")

DEBUG = config.get_bool("DEBUG")
HW_ACCELERATION = config.get_bool("FFMPEG_NVENC")

if not os.path.exists(thumbnail_cache):
    os.makedirs(thumbnail_cache)
for file in os.listdir(thumbnail_cache):
    os.remove(os.path.join(thumbnail_cache, file))


def get_video_file_info(file_path: str, sort_streams: bool = False):
    ffprobe = subprocess.Popen(
        [
            FFPROBE,
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    if sort_streams:
        info = json.loads(ffprobe.stdout.read())

        video = filter(lambda x: x["codec_type"] == "video", info["streams"])
        audio = filter(lambda x: x["codec_type"] == "audio", info["streams"])
        subtitle = filter(lambda x: x["codec_type"] == "subtitle", info["streams"])
        attachment = filter(lambda x: x["codec_type"] == "attachment", info["streams"])

        return {
            "format": info["format"],
            "video": list(video),
            "audio": list(audio),
            "subtitle": list(subtitle),
            "attachment": list(attachment)
        }

    return json.loads(ffprobe.stdout.read())


def get_dir_files(file_path: str):
    files = []
    dir_files = os.listdir(file_path)
    for file_ in dir_files:
        if file_.endswith(".ts"):
            continue
        elif file_.endswith(".m3u8"):
            segments = list(filter(lambda x: x.endswith(".ts"), dir_files))
            display_name = f"{file_} (HLS with {len(segments)} segments)"
            size = sum([os.path.getsize(os.path.join(file_path, segment)) for segment in segments])
        else:
            display_name = file_
            size = os.path.getsize(os.path.join(file_path, file_))

        files.append({
            "name": file_,
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
            FFMPEG,
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
    audio_file = str(uuid4()) + ".wav"
    with open(get_local_wsl_temp_dir(config) + file, "wb") as f:
        f.write(search_file)

    aivd = subprocess.Popen(make_wsl_command(config, [
        AIVD,
        "-r",
        "-x", ignore_files,
        "-w", "900",
        "-f", "json",
        "-c", str(multiprocessing.cpu_count()),
        "--ffmpeg", FFMPEG if not config.get_bool("USE_WSL") else config.get("WSL_FFMPEG"),
        "--silent",
        f"/tmp/{audio_file}",
        get_wsl_path(config, video_folder)
    ]),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

    resp = aivd.stdout.read()
    os.remove(get_local_wsl_temp_dir(config) + file)

    return json.loads(resp.strip())


def extract_subtitles(input_file: str, output_location: str, file_info: dict = None):
    file_info = file_info or get_video_file_info(input_file, sort_streams=True)

    subtitle_tracks = file_info["subtitle"]

    if not os.path.exists(output_location):
        os.makedirs(output_location)

    generated_files = []
    for track in subtitle_tracks:
        if "tags" in track and "language" in track["tags"]:
            lang = track["tags"]["language"]
        else:
            lang = track['index']
        file_target = os.path.join(output_location, f"{lang}.vtt")

        opts = [
            FFMPEG,
            "-y", "-hide_banner",
            "-loglevel", "quiet",
            "-i", input_file,
            "-map", f"0:{track['index']}",
            "-c:s", "webvtt",
            file_target
        ]

        subprocess.run(
            opts,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )

        generated_files.append({
            "path": file_target,
            "lang": lang
        })

    return generated_files


def add_subtitles_to_dash(mpd_path: str, subtitles: list):
    import xml.dom.minidom as minidom

    mpd = minidom.parse(mpd_path)

    for subtitle in subtitles:
        adaptation_set = mpd.createElement("AdaptationSet")
        adaptation_set.setAttribute("contentType", "text")
        adaptation_set.setAttribute("mimeType", "text/vtt")
        adaptation_set.setAttribute("lang", subtitle["lang"])

        representation = mpd.createElement("Representation")
        representation.setAttribute("id", f"textstream_{subtitle['lang']}")
        representation.setAttribute("bandwidth", "1")

        base_url = mpd.createElement("BaseURL")
        base_url.appendChild(mpd.createTextNode(f"{subtitle['lang']}.vtt"))

        representation.appendChild(base_url)
        adaptation_set.appendChild(representation)
        mpd.getElementsByTagName("Period")[0].appendChild(adaptation_set)

    with open(mpd_path, "w") as f:
        f.write(mpd.toxml())


def convert_file_to_hls(input_file: str, output_location: str, re_encode: bool = False):
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

    if re_encode and HW_ACCELERATION:
        opts = [
            FFMPEG,
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
            FFMPEG,
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


def convert_file_to_dash(input_file: str, output_location: str, add_lq: bool = False):
    file_info = get_video_file_info(input_file, sort_streams=True)

    video_codec = file_info["video"][0]["codec_name"]
    audio_codecs = list(map(lambda x: x["codec_name"], file_info["audio"]))
    subtitle_codecs = list(map(lambda x: x["codec_name"], file_info["subtitle"]))

    if video_codec == "h264":
        video_encoder = "copy"
    else:
        video_encoder = "h264_nvenc" if HW_ACCELERATION else "h264"

    if all(map(lambda x: x == "aac", audio_codecs)):
        audio_encoder = "copy"
    else:
        audio_encoder = "aac"

    if all(map(lambda x: x in ["webvtt", "ass", "srt", "mov_text"], subtitle_codecs)):
        encode_subtitles = True
    else:
        encode_subtitles = False

    def monitor(_ffmpeg, duration, time_, time_left, _process):
        import sys
        import datetime
        per = round(time_ / duration * 100)
        sys.stdout.write(
            "\rTranscoding...(%s%%) %s left [%s%s]" %
            (per, datetime.timedelta(seconds=int(time_left)), '#' * per, '-' * (100 - per))
        )
        sys.stdout.flush()

    input_args = {}
    if HW_ACCELERATION:
        input_args["hwaccel"] = "cuda"
    if video_encoder == "copy":
        input_args["c:v"] = "copy"
    video = ffmpeg_streaming.input(
        input_file,
        **input_args
    )

    c_opts = {
        "dn": None,
        "sn": None
    }
    extra_ops = []
    if video_encoder != "copy":
        c_opts["pix_fmt"] = "yuv420p"

    qualities = []
    if add_lq:
        qualities.append(72)

    if len(file_info["attachment"]) > 0:
        for stream in file_info["attachment"]:
            extra_ops.append({"map": f"-0:{stream['index']}"})

    dash_target = f"{output_location}/dash/index.mpd"
    dash = video.dash(
        ffmpeg_streaming.Formats.h264(video=video_encoder, audio=audio_encoder),
        **c_opts,
        seg_duration=20,
        frag_duration=10,
        extra_ops=extra_ops
    )
    dash.auto_generate_representations([])
    dash.output(dash_target, monitor=monitor if DEBUG else None)

    if encode_subtitles:
        subtitles = extract_subtitles(
            input_file,
            f"{output_location}/dash",
            file_info
        )

        add_subtitles_to_dash(dash_target, subtitles)


def generate_subtitles_for_video(
    input_file: str,
    add_to_dash: bool = False,
    sample_rate: int = 16000,
    monitor: callable = None
):
    file_info = get_video_file_info(input_file, sort_streams=True)
    audio_tracks = file_info["audio"]

    if not audio_tracks:
        return

    output_location = os.path.dirname(input_file)
    if add_to_dash:
        output_location = os.path.join(output_location, "dash")

    subtitle_files = []
    for track in audio_tracks:
        cmd = [
            FFMPEG,
            "-nostdin",
            "-threads", "8",
            "-i", input_file,
            "-map", f"0:{track['index']}",
            "-f", "s16le",
            "-ac", "1",
            "-acodec", "pcm_s16le",
            "-ar", str(sample_rate),
            "-"
        ]
        if HW_ACCELERATION:
            cmd.insert(1, "-hwaccel")
            cmd.insert(2, "cuda")

        language = track["tags"]["language"] if "tags" in track and "language" in track["tags"] else track["index"]
        audio_stream = subprocess.run(cmd, capture_output=True, check=True).stdout

        try:
            language = iso639.Lang(language).pt1
        except iso639.iso639.InvalidLanguageValue:
            language = None

        def internal_monitor(progress: float):
            if monitor is None:
                return
            monitor({
                "progress": progress,
                "language": language
            })

        file_name = generate_subtitles_from_audio_stream(
            audio_stream,
            os.path.join(output_location, f"{language}.vtt"),
            language=language,
            output_format="vtt",
            verbose=DEBUG,
            monitor=internal_monitor if monitor is not None else None
        )
        subtitle_files.append({
            "path": file_name,
            "lang": language
        })

    if add_to_dash:
        add_subtitles_to_dash(
            os.path.join(output_location, "index.mpd"),
            subtitle_files
        )


def reinitialize_hls(file_path: str):
    os.makedirs(os.path.join(file_path, "hls"), exist_ok=True)
    for file_ in os.listdir(file_path):
        if file_.endswith(".ts") or file_.endswith(".m3u8"):
            shutil.move(os.path.join(file_path, file_), os.path.join(file_path, "hls", file_))


def cleanup_legacy_files(file_path: str):
    for file_ in os.listdir(file_path):
        if file_.endswith(".ts") or file_.endswith(".m3u8"):
            os.remove(os.path.join(file_path, file_))


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
            FFMPEG,
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
        FFMPEG,
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
