from models.content_requests import ContentRequestModel


def create_or_edit_content_request(uuid, username, content_type, content_title, **kwargs):
    content_request = get_content_request(uuid)

    if uuid is None or content_request is None:
        content_request = ContentRequestModel(username, content_type, content_title)
        content_request.add()

    for key, value in kwargs.items():
        setattr(content_request, key, value)

    content_request.commit()


def get_content_requests(username=None):
    if username is not None:
        return ContentRequestModel.query.filter_by(username=username).all()
    return ContentRequestModel.query.all()


def paginate_content_requests(page, per_page):
    return ContentRequestModel.query.paginate(page, per_page, False).items


def get_content_request(uuid):
    return ContentRequestModel.query.filter_by(uuid=uuid).first()
