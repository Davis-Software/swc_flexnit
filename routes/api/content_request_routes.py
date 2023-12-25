from __init__ import app

from models.content_requests import get_content_requests, paginate_content_requests, create_or_edit_content_request
from utils.password_manager import auth_required

from flask import request, session


@app.route("/content_requests", methods=["GET", "POST"])
@auth_required
def get_content_requests_route():
    if request.method == "POST":
        create_or_edit_content_request(
            **request.form
        )

    if "my" in request.args:
        return [cr.to_json() for cr in get_content_requests(session.get("username"))]

    return [cr.to_json() for cr in paginate_content_requests(
        request.args.get("page", 1, type=int),
        request.args.get("per_page", 15, type=int)
    )]
