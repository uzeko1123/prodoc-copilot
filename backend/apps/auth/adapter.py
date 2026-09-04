from urllib.parse import quote

from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class AccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        return str(settings.FRONTEND_URLS["account_verify_email"]).replace(
            "{key}", quote(str(emailconfirmation.key), safe="")
        )
