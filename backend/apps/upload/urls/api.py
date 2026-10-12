from django.urls import path

from ..views import UploadAPIView

urlpatterns = [
    path("", UploadAPIView.as_view(), name="upload"),
]
