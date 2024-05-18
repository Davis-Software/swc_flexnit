import time
import threading

from __init__ import app, config

from models.metrics import UserMetricStruct


metrics_queue = {}
updater_thread = None

METRIC_INTERVAL = config.get_int("METRIC_SYNC_INTERVAL", 10)


def updater():
    global metrics_queue

    while True:
        time.sleep(METRIC_INTERVAL)
        with app.test_request_context():
            for username, metrics in metrics_queue.items():
                metrics.push_to_db()
        metrics_queue = {}


def push_to_queue(metrics: UserMetricStruct):
    global updater_thread

    if updater_thread is None:
        updater_thread = threading.Thread(target=updater, daemon=True)
        updater_thread.start()

    metrics_queue[metrics.username] = metrics


def get_from_metrics_queue(username):
    return metrics_queue.get(username)
