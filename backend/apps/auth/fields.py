import base64
import json

from altcha import verify_solution
from django.conf import settings
from django.core.cache import cache
from rest_framework import serializers


class AltchaField(serializers.CharField):
    def to_internal_value(self, data):
        payload = super().to_internal_value(data)

        if not verify_solution(payload, settings.ALTCHA_HMAC_SECRET).verified:
            raise serializers.ValidationError("Invalid Altcha")

        try:
            payload_dict = json.loads(base64.b64decode(payload).decode())
            challenge = payload_dict["challenge"]
        except (ValueError, TypeError, KeyError):
            raise serializers.ValidationError("Invalid Altcha")

        if not cache.add(
            f"altcha:{challenge}", True, timeout=settings.ALTCHA_CHALLENGE_TTL
        ):
            raise serializers.ValidationError("Invalid Altcha")

        return payload
