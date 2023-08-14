from flask import Flask
from database.connection_profile import ConnectionProfile


def connect_to_database(app: Flask, conn: ConnectionProfile, extra_db: dict = None):
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = conn.connection_uri()

    if extra_db:
        for key, value in extra_db.items():
            extra_db[key] = value.connection_uri()

        app.config['SQLALCHEMY_BINDS'] = extra_db
