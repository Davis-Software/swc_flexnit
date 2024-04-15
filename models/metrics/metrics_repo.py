import re
from flask import Request, Response
from models.metrics import UserMetricStruct, UserMetrics
from .metrics_queue import get_from_metrics_queue, push_to_queue
from ..movie import get_movie
from ..series import get_series
from ..title.title_repo import make_title_entry

title_detect_regex = re.compile(r"(/movies/([a-f0-9-]{36})/deliver/(file|hls|dash)/|/series/([a-f0-9-]{36})/episode/([a-f0-9-]{36})/deliver/(file|hls|dash))")


def set_user_request_metrics(user: str, request: Request, response: Response):
    if user is None or request.path.startswith("/static"):
        return

    metrics = get_from_metrics_queue(user) or UserMetricStruct(user)

    if response.content_type in ["image/png", "image/jpeg", "image/jpg", "audio/x-mpegurl", "audio/mpegurl", "text/plain", "video/mp4", "video/webm"]:
        metrics.delivered_media += 1

    metrics.delivered_bytes += response.content_length

    match response.status_code:
        case 200:
            metrics.delivered_requests_2xx += 1
        case 300:
            metrics.delivered_requests_3xx += 1
        case 400:
            metrics.delivered_requests_4xx += 1
        case 500:
            metrics.delivered_requests_5xx += 1

    if match := title_detect_regex.search(request.path):
        title_uuid = match.group(2) or match.group(4)
        if metrics.delivered_title_uuids is None:
            metrics.delivered_title_uuids = []
        if title_uuid not in metrics.delivered_title_uuids:
            metrics.delivered_title_uuids.append(title_uuid)

    ip = request.headers.get("X-Forwarded-For") or request.headers.get("Forwarded") or \
        (request.remote_addr if not request.remote_addr.startswith("127.") else "unknown") \
        .split(",")[0].strip()

    if metrics.last_ip != ip:
        if metrics.previous_ips is None:
            metrics.previous_ips = []
        if ip not in metrics.previous_ips:
            metrics.previous_ips.append(ip)
        metrics.last_ip = ip

    if metrics.last_user_agent != request.user_agent.string:
        if metrics.previous_user_agents is None:
            metrics.previous_user_agents = []
        if request.user_agent.string not in metrics.previous_user_agents:
            metrics.previous_user_agents.append(request.user_agent.string)
        metrics.last_user_agent = request.user_agent.string

    push_to_queue(metrics)


def get_all_metrics():
    return [metric.to_json() for metric in UserMetrics.query.all()]


def parse_metrics(formatter: callable = None):
    metrics = get_all_metrics()

    f = formatter or (lambda x: x)

    for user_metric in metrics:
        user_metric["delivered_titles"] = list(map(
            lambda title_uuid: f(make_title_entry(get_movie(title_uuid) or get_series(title_uuid))) or title_uuid,
            user_metric["delivered_title_uuids"] or []
        ))

    return metrics
