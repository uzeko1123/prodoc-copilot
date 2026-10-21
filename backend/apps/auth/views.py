from altcha import create_challenge
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from ..responses import MessageResponse
from ..serializers import MessageResponseSerializer
from .serializers import AltchaChallengeSerializer, UserSerializer


class CSRFTokenAPIView(APIView):
    authentication_classes = ()
    permission_classes = ()
    throttle_classes = ()

    @extend_schema(responses={200: MessageResponseSerializer})
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return MessageResponse("CSRF cookie set")


class AltchaAPIView(APIView):
    authentication_classes = ()
    permission_classes = ()
    throttle_classes = ()

    @extend_schema(responses={200: AltchaChallengeSerializer})
    def get(self, request):
        challenge = create_challenge(
            algorithm=settings.ALTCHA_ALGORITHM,
            cost=settings.ALTCHA_COST,
            hmac_secret=settings.ALTCHA_HMAC_SECRET,
            hmac_key_secret=settings.ALTCHA_HMAC_KEY_SECRET,
        )
        return Response(challenge.to_dict())


class UserListAPIView(ListAPIView):
    serializer_class = UserSerializer
    queryset = (
        User.objects.exclude(username="AnonymousUser")
        .select_related("profile")
        .order_by("username")
    )
    filter_backends = (SearchFilter,)
    search_fields = ("username", "profile__full_name")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
