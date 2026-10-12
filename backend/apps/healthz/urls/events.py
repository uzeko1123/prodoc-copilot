from django.urls import path

from ..views import events_healthz

urlpatterns = [
    path("", events_healthz, name="events_healthz"),
]
