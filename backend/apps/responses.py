from rest_framework.response import Response

from .serializers import MessageResponseSerializer


class MessageResponse(Response):
    def __init__(
        self, message: str, code: int | None = None, status: int | None = None, **kwargs
    ):
        if code is None:
            code = 200
        if status is None:
            status = code if 100 <= code <= 599 else 200
        data = MessageResponseSerializer({"code": code, "message": message}).data
        super().__init__(data=data, status=status, **kwargs)
