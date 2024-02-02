from flask import Request, Response
from models.metrics import UserMetricStruct, UserMetrics
from .metrics_queue import get_from_metrics_queue, push_to_queue


def set_user_request_metrics(user: str, request: Request, response: Response):
    if user is None:
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

    ip = request.headers.get("X-Forwarded-For") or request.headers.get("Forwarded") or \
        (request.remote_addr if not request.remote_addr.startswith("127.") else "unknown") \
        .split(",")[0].strip()

    if metrics.last_ip != ip:
        if ip not in metrics.previous_ips:
            metrics.previous_ips.append(ip)
        metrics.last_ip = ip

    if metrics.last_user_agent != request.user_agent.string:
        if request.user_agent.string not in metrics.previous_user_agents:
            metrics.previous_user_agents.append(request.user_agent.string)
        metrics.last_user_agent = request.user_agent.string

    push_to_queue(metrics)


def get_all_metrics():
    return [metric.to_json() for metric in UserMetrics.query.all()]
