import os

from flask import Flask
from tools.python_mml import load_mods
from flask_sqlalchemy import SQLAlchemy
from swc_utils.tools import Config
from swc_utils.database import database_connection, ConnectionProfile


working_dir = os.path.dirname(os.path.realpath(__file__))
config = Config(os.path.join(working_dir, 'config.ini'))

app = Flask(__name__)

app.secret_key = config["SECRET_KEY"]
database_connection.connect_to_database(
    app,
    ConnectionProfile(
        config["DB_HOST"],
        config["DB_PORT"],
        config["DB_NAME"],
        config["DB_USER"],
        config["DB_PASS"],
        config["DB_TYPE"]
    ),
    {}
)
db = SQLAlchemy(app)

# Load module modifications
load_mods(working_dir)


with app.app_context():
    from swc_utils.tools import load_routes
    load_routes(working_dir, "routes")

    db.create_all()
