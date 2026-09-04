from channels.routing import URLRouter
from django.urls import re_path
from django.utils.module_loading import import_string

websocket_urlpatterns = [
    re_path(
        r"^ws/",
        URLRouter(
            [
                re_path(
                    r"^main/",
                    URLRouter(import_string("apps.main.routing.websocket_urlpatterns")),  # type: ignore[arg-type]
                ),  # type: ignore[list-item]
                re_path(
                    r"^healthz$",
                    URLRouter(
                        import_string("apps.healthz.routing.websocket_urlpatterns")
                    ),  # type: ignore[arg-type]
                ),  # type: ignore[list-item]
            ]
        ),
    )
]
