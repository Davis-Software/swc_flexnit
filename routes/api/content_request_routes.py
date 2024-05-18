from __init__ import app

from models.content_requests import get_content_request, get_content_requests, paginate_content_requests, create_or_edit_content_request
from swc_utils.web.auth_manager import auth_required
from swc_utils.web import RequestCode

from flask import request, session, make_response


@app.route("/content_requests", methods=["GET", "POST", "DELETE"])
@auth_required
def get_content_requests_route():
    if request.method == "DELETE":
        get_content_request(request.args.get("id")).delete()
        return make_response("", RequestCode.Success.NoContent)

    if request.method == "POST":
        return create_or_edit_content_request(
            request.form.get("id"),
            session.get("username"),
            **request.form
        ).to_json()

    if "my" in request.args:
        return [cr.to_json() for cr in get_content_requests(session.get("username"))]

    return [cr.to_json() for cr in paginate_content_requests(
        request.args.get("page", 1, type=int),
        request.args.get("per_page", 15, type=int)
    )]
