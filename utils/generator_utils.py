import time
import threading


def generator_from_callback_consumer(consumer: callable, args: tuple = None, callback_name: str = "monitor", kwargs: dict = None):
    args = args or ()
    kwargs = kwargs or {}

    data = None

    def monitor(new_data):
        nonlocal data
        data = new_data

    def thread():
        kwargs[callback_name] = monitor
        consumer(*args, **kwargs)
    thread = threading.Thread(target=thread, daemon=True)

    thread.start()
    while thread.is_alive():
        time.sleep(0.1)
        if data is not None:
            yield data

    yield data
