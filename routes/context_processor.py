from __init__ import app

from datetime import datetime


@app.context_processor
def processor():
    dictionary = dict(
        py={
            "len": len,
            "type": type,
            "zip": zip,
            "enum": enumerate,
            "round": round,
            "datetime": datetime,
            "dir": dir
        }
    )

    return dictionary
