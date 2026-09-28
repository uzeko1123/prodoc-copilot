import hashlib
from pathlib import Path

from django.core.files import File
from django.core.files.storage import default_storage
from drf_spectacular.utils import extend_schema
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from . import serializers


def file_md5(file: File) -> str:
    md5 = hashlib.md5()
    for chunk in file.chunks():
        md5.update(chunk)
    file.seek(0)
    return md5.hexdigest()


class UploadAPIView(APIView):
    permission_classes = ()

    @extend_schema(
        request={"multipart/form-data": serializers.UploadFileSerializer},
        responses={200: serializers.UploadFileUrlSerializer},
    )
    def post(self, request: Request):
        file = request.data["file"]
        md5 = file_md5(file)
        suffix = Path(file.name).suffix
        name = default_storage.save(f"upload/{md5}{suffix}", file)
        url = default_storage.url(name)
        return Response({"url": url})
