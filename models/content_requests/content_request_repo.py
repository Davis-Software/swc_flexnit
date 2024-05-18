from models.content_requests import ContentRequestModel


def create_or_edit_content_request(cr_id, username, content_type=None, content_title=None, **kwargs):
    content_request = get_content_request(cr_id)

    if content_request is None:
        content_request = ContentRequestModel(username, content_type, content_title)
        content_request.add()

    if content_title is not None:
        content_request.content_title = content_title
    for key, value in kwargs.items():
        setattr(content_request, key, value)

    content_request.commit()

    return content_request


def get_content_requests(username=None):
    if username is not None:
        return ContentRequestModel.query.filter_by(username=username).all()
    return ContentRequestModel.query.all()


def paginate_content_requests(page, per_page):
    return ContentRequestModel.query.paginate(page=page, per_page=per_page, max_per_page=50, error_out=False).items


def get_content_request(cr_id):
    return ContentRequestModel.query.filter_by(id=cr_id).first()
