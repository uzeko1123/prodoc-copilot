from altcha import create_challenge
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from ..responses import MessageResponse
from ..serializers import MessageResponseSerializer
from . import serializers


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

    @extend_schema(responses={200: serializers.AltchaChallengeSerializer})
    def get(self, request):
        challenge = create_challenge(
            algorithm=settings.ALTCHA_ALGORITHM,
            cost=settings.ALTCHA_COST,
            hmac_secret=settings.ALTCHA_HMAC_SECRET,
            hmac_key_secret=settings.ALTCHA_HMAC_KEY_SECRET,
        )
        return Response(challenge.to_dict())
