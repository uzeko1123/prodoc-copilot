from django.urls import include, path

from .. import views

urlpatterns = [
    path("", include("dj_rest_auth.urls")),
    path("registration/", include("dj_rest_auth.registration.urls")),
    path("csrf/", views.CSRFTokenAPIView.as_view(), name="csrf_token"),
    path("altcha/", views.AltchaAPIView.as_view(), name="altcha"),
]
