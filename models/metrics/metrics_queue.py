import time
import threading

from models.metrics import UserMetricStruct


metrics_queue = {}
updater_thread = None


def updater():
    global metrics_queue

    while True:
        time.sleep(10)
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
