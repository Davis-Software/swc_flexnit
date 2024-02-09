"""
ffmpeg_streaming.build_args
~~~~~~~~~~~~

Build a command for the FFmpeg


:copyright: (c) 2020 by Amin Yazdanpanah.
:website: https://www.aminyazdanpanah.com
:email: contact@aminyazdanpanah.com
:license: MIT, see LICENSE for more details.

This file was modified by flexnit's python module mod-loader for the following reasons:
- Added required but missing features that are necessary for the application to function properly

Changes made to this file are as follows:
- Modified "input_args" function to not omit custom options
- Modified "command_builder" function to include custom options from media and input_args

All changes are marked with "@flexnit"
All other code is the same as the original file from the source repository
All copyright and licensing information is preserved
"""
import sys

from ._utiles import cnv_options_to_args, get_path_info, clean_args

# DASH default values
USE_TIMELINE = 1
USE_TEMPLATE = 1

# HLS default values
HLS_LIST_SIZE = 0
HLS_TIME = 10
HLS_ALLOW_CACHE = 1


def _stream2file(stream2file):
    args = stream2file.format.all
    args.update({'c': 'copy'})
    args.update(stream2file.options)

    return cnv_options_to_args(args) + [stream2file.output_]


def _get_audio_bitrate(rep, index: int = None):
    if rep.bitrate.audio_ is not None and rep.bitrate.audio_ != 0:
        opt = 'b:a' if index is None else 'b:a:' + str(index)
        return {opt: rep.bitrate.audio}

    return {}


def _get_dash_stream(key, rep):
    args = {
        'map': 0,
        's:v:' + str(key): rep.size,
        'b:v:' + str(key): rep.bitrate.calc_video()
    }
    args.update(_get_audio_bitrate(rep, key))
    args.update(rep.options)
    return cnv_options_to_args(args)


def _dash(dash):
    dirname, name = get_path_info(dash.output_)
    _args = dash.format.all
    _args.update({
        'use_timeline':     USE_TIMELINE,
        'use_template':     USE_TEMPLATE,
        'init_seg_name':    '{}_init_$RepresentationID$.$ext$'.format(name),
        "media_seg_name":   '{}_chunk_$RepresentationID$_$Number%05d$.$ext$'.format(name),
        'f': 'dash'
    })
    _args.update(dash.options)
    args = cnv_options_to_args(_args)

    for key, rep in enumerate(dash.reps):
        args += _get_dash_stream(key, rep)

    return args + ['-strict', '-2', '{}/{}.mpd'.format(dirname, name)]


def _hls_seg_ext(hls):
    return 'm4s' if hls.options.get('hls_segment_type', '') == 'fmp4' else 'ts'


def _get_hls_stream(hls, rep, dirname, name):
    args = hls.format.all
    args.update({
        'hls_list_size':            HLS_LIST_SIZE,
        'hls_time':                 HLS_TIME,
        'hls_allow_cache':          HLS_ALLOW_CACHE,
        'hls_segment_filename':     "{}/{}_{}p_%04d.{}".format(dirname, name, rep.size.height, _hls_seg_ext(hls)),
        'hls_fmp4_init_filename':   "{}_{}p_init.mp4".format(name, rep.size.height),
        's:v':                      rep.size,
        'b:v':                      rep.bitrate.calc_video()
    })
    args.update(_get_audio_bitrate(rep))
    args.update(rep.options)
    args.update({'strict': '-2'})
    args.update(hls.options)

    return cnv_options_to_args(args) + ["{}/{}_{}p.m3u8".format(dirname, name, str(rep.size.height))]


def _hls(hls):
    dirname, name = get_path_info(hls.output_)
    streams = []
    for key, rep in enumerate(hls.reps):
        if key > 0:
            streams += input_args(hls)
        streams += _get_hls_stream(hls, rep, dirname, name)

    return streams


def stream_args(media):
    return getattr(sys.modules[__name__], "_%s" % type(media).__name__.lower())(media)


def input_args(media):
    """
    @flexnit: Modified to not omit custom options
    """
    inputs = []
    for key, _input in enumerate(media.media.inputs.inputs):
        _input = dict(_input)
        _input.pop('is_tmp', None)
        if key > 0:
            _input.pop('y', None)
        hw_accel = _input.pop('hwaccel', None)
        if hw_accel is not None:
            inputs = ["-hwaccel", hw_accel] + inputs
        inputs += cnv_options_to_args(_input)

    return inputs


def command_builder(ffmpeg_bin: str, media):
    """
    @flexnit: Modified to include custom options from media and input_args
    """
    input_ = input_args(media)
    stream = stream_args(media)
    if "-c:v" in input_:
        stream.pop(stream.index("-c:v"))

    return " ".join(clean_args([ffmpeg_bin] + input_ + stream))
