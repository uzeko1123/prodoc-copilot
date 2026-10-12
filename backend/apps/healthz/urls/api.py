from django.urls import path

from ..views import api_healthz

urlpatterns = [
    path("", api_healthz, name="api_healthz"),
]
