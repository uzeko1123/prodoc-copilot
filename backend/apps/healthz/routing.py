from django.urls import re_path

from .consumers import HealthzWebsocketConsumer

websocket_urlpatterns = [
    re_path(r"$", HealthzWebsocketConsumer.as_asgi()),  # type: ignore[arg-type]
]
