from flask import make_response

from utils.request_codes import RequestCode


def send_binary_image(data, content_type = "image/jpeg", cache_control = 3600):
    resp = make_response(data, RequestCode.Success.OK)
    resp.headers.set("Content-Type", content_type)
    resp.cache_control.max_age = cache_control
    return resp
