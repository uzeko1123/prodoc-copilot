from django.urls import path

from .. import views

urlpatterns = [
    path("", views.events_healthz, name="events_healthz"),
]
