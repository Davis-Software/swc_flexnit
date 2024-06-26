import os
import sys
from typing import Iterator, TextIO

from __init__ import working_dir, config
from ai_tools.ai_helper_funcs import make_custom_monitor, format_srt_timestamp, format_vtt_timestamp


WHISPER_MODEL = config.get("AI_SUBTITLE_MODEL", "small")
MODEL_LOCATION = os.path.join(working_dir, "ai_tools/ai_models")


def write_srt(transcript: Iterator[dict], file: TextIO):
    for i, segment in enumerate(transcript, start=1):
        file.write(
            f"{i}\n"
            f"{format_srt_timestamp(segment['start'], always_include_hours=True)} --> "
            f"{format_srt_timestamp(segment['end'], always_include_hours=True)}\n"
            f"{segment['text'].strip().replace('-->', '->')}\n"
        )


def write_vtt(transcript: Iterator[dict], file: TextIO):
    file.write("WEBVTT\n\n")
    for segment in transcript:
        file.write(
            f"{format_vtt_timestamp(segment['start'])} --> "
            f"{format_vtt_timestamp(segment['end'])}\n"
            f"{segment['text'].strip()}\n\n"
        )


def generate_subtitles_from_audio_stream(
    audio_stream: bytes,
    output_file: str,
    language: str = "en",
    output_format: str = "srt",
    verbose: bool = False,
    monitor: callable = None
):
    if monitor is not None:
        import whisper.transcribe
        transcription_module = sys.modules["whisper.transcribe"]
        transcription_module.tqdm.tqdm = make_custom_monitor(monitor)

    import torch
    import whisper
    import numpy as np

    assert torch.cuda.is_available(), "CUDA is required for this operation"
    assert WHISPER_MODEL in ["tiny", "small", "medium", "large"], f"Unsupported model: {WHISPER_MODEL}"
    assert output_format in ["srt", "vtt"], f"Unsupported output format: {output_format}"

    model = whisper.load_model(WHISPER_MODEL, download_root=MODEL_LOCATION)
    audio = np.frombuffer(audio_stream, np.int16).flatten().astype(np.float32) / 32768.0

    result = model.transcribe(
        audio,
        task="transcribe",
        language=language,
        verbose=None if not verbose else False
    )["segments"]

    with open(output_file, "w", encoding="utf-8") as f:
        if output_format == "srt":
            write_srt(result, f)
        else:
            write_vtt(result, f)

    return output_file
