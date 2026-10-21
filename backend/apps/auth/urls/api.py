from django.urls import include, path

from ..views import AltchaAPIView, CSRFTokenAPIView, UserListAPIView

urlpatterns = [
    path("", include("dj_rest_auth.urls")),
    path("registration/", include("dj_rest_auth.registration.urls")),
    path("csrf/", CSRFTokenAPIView.as_view(), name="csrf_token"),
    path("altcha/", AltchaAPIView.as_view(), name="altcha"),
    path("users/", UserListAPIView.as_view(), name="user_list"),
]
