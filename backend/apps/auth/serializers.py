from urllib.parse import quote

from allauth.account.utils import user_pk_to_url_str
from dj_rest_auth.registration.serializers import (
    RegisterSerializer as RegisterSerializer_,
)
from dj_rest_auth.serializers import (
    LoginSerializer as LoginSerializer_,
)
from dj_rest_auth.serializers import (
    PasswordChangeSerializer as PasswordChangeSerializer_,
)
from dj_rest_auth.serializers import (
    PasswordResetConfirmSerializer as PasswordResetConfirmSerializer_,
)
from dj_rest_auth.serializers import (
    PasswordResetSerializer as PasswordResetSerializer_,
)
from dj_rest_auth.serializers import (
    UserDetailsSerializer as UserDetailsSerializer_,
)
from django.conf import settings
from rest_framework import serializers

from .fields import AltchaField
from .models import UserProfile


def _password_reset_url_generator(request, user, temp_key):
    return (
        str(settings.FRONTEND_URLS["account_reset_password_confirm"])
        .replace("{uid}", quote(str(user_pk_to_url_str(user)), safe=""))
        .replace("{token}", quote(str(temp_key), safe=""))
    )


class AltchaChallengeSerializer(serializers.Serializer):
    algorithm = serializers.CharField()
    cost = serializers.IntegerField()
    keyLength = serializers.IntegerField()
    keyPrefix = serializers.CharField()
    nonce = serializers.CharField()
    salt = serializers.CharField()
    keySignature = serializers.CharField(required=False)
    memoryCost = serializers.IntegerField(required=False)
    parallelism = serializers.IntegerField(required=False)
    expiresAt = serializers.IntegerField(required=False)
    signature = serializers.CharField(required=False)


class AltchaMixin(serializers.Serializer):
    altcha = AltchaField(write_only=True)

    def validate(self, attrs: dict):
        attrs = super().validate(attrs)
        attrs.pop("altcha")
        return attrs


class RegisterSerializer(AltchaMixin, RegisterSerializer_):
    pass


class LoginSerializer(AltchaMixin, LoginSerializer_):
    pass


class PasswordChangeSerializer(AltchaMixin, PasswordChangeSerializer_):
    pass


class PasswordResetSerializer(AltchaMixin, PasswordResetSerializer_):
    def get_email_options(self):
        return {"url_generator": _password_reset_url_generator}


class PasswordResetConfirmSerializer(AltchaMixin, PasswordResetConfirmSerializer_):
    pass


class UserDetailsSerializer(UserDetailsSerializer_):
    full_name = serializers.CharField(
        source="profile.full_name", required=False, allow_blank=True
    )
    avatar = serializers.URLField(
        source="profile.avatar", required=False, allow_blank=True
    )

    class Meta(UserDetailsSerializer_.Meta):
        fields = (*UserDetailsSerializer_.Meta.fields, "full_name", "avatar")

    def update(self, instance, validated_data):
        profile = validated_data.pop("profile", None)
        user = super().update(instance, validated_data)
        if profile is not None:
            UserProfile.objects.update_or_create(user=user, defaults=profile)
        return user
