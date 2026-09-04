from django.urls import path

from .. import views

urlpatterns = [
    path("", views.api_healthz, name="api_healthz"),
]
