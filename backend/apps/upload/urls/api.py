from django.urls import path

from .. import views

urlpatterns = [
    path("", views.UploadAPIView.as_view(), name="upload"),
]
