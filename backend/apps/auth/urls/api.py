from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ..views import AltchaAPIView, CSRFTokenAPIView, UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet)

urlpatterns = [
    path("", include("dj_rest_auth.urls")),
    path("registration/", include("dj_rest_auth.registration.urls")),
    path("csrf/", CSRFTokenAPIView.as_view(), name="csrf_token"),
    path("altcha/", AltchaAPIView.as_view(), name="altcha"),
    path("", include(router.urls)),
]
