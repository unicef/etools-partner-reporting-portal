import logging
from datetime import datetime, timedelta
from urllib.parse import quote

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.utils.deconstruct import deconstructible

from social_core.backends.azuread_b2c import AzureADB2COAuth2
from social_core.pipeline import social_auth, user as social_core_user
from social_django.middleware import SocialAuthExceptionMiddleware
from storages.backends.azure_storage import AzureStorage
from storages.utils import setting

logger = logging.getLogger(__name__)


def social_details(backend, details, response, *args, **kwargs):
    r = social_auth.social_details(backend, details, response, *args, **kwargs)

    user = kwargs.get('user', None)
    if user:
        # here we are preventing messing up between current us and social user
        return HttpResponseRedirect(f"/unauthorized/?eu={user.email}&msgc=alreadyauthenticated")

    r['details']['idp'] = response.get('idp')

    if not r['details'].get('email'):
        if not response.get('email'):
            r['details']['email'] = response["signInNames.emailAddress"]
        else:
            r['details']['email'] = response.get('email')

    email = r['details'].get('email')
    if isinstance(email, str):
        r['details']['email'] = email.lower().strip()
    return r


def get_username(strategy, details, backend, user=None, *args, **kwargs):
    username = details.get('email')

    try:
        get_user_model().objects.get(username=username)

    except get_user_model().DoesNotExist:
        email = quote(username)
        return HttpResponseRedirect(f"/unauthorized/?eu={email}&msgc=nouser")

    return {'username': details.get('email')}


def user_details(strategy, details, backend, user=None, *args, **kwargs):
    # # This is where we update the user
    # # see what the property to map by is here
    # updates_available = False

    if user:
        # user_groups = [group.name for group in user.groups.all()]
        # business_area_code = details.get("business_area_code", 'defaultBA1235')

        # Update username with email and unusable password
        user.username = user.email
        user.first_name = details['first_name']
        user.last_name = details['last_name']
        user.set_unusable_password()
        user.save()

    return social_core_user.user_details(strategy, details, backend, user, *args, **kwargs)


class CustomAzureADBBCOAuth2(AzureADB2COAuth2):
    BASE_URL = 'https://{tenant_id}.b2clogin.com/{tenant_id}.onmicrosoft.com'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.redirect_uri = settings.FRONTEND_HOST + '/social/complete/azuread-b2c-oauth2/'

    def request_access_token(self, *args, **kwargs):
        logger.info("Params for requesting token - args:{} -- kwargs:{}".format(args, kwargs))  # Temporal

        try:
            return super().request_access_token(*args, **kwargs)
        except Exception as exception:
            response = exception.response if hasattr(exception, 'response') else None
            error_message = response.json() if response else str(exception)
            logger.error("Failed to exchange code for token with Azure B2C: {}".format(error_message), exc_info=True)
            response = getattr(exception, 'response', None)

            logger.info("Exception raised in request_access_token - {}".format(exception.__dict__))  # Temporal

            error_message = self._get_response_error_message(exception, response)

            logger.error("Failed to exchange code for token with Azure B2C: %s", error_message, exc_info=True)
            raise

    def _get_response_error_message(self, exception, response):
        if response is not None:
            try:
                error_message = response.json()
            except Exception:
                error_message = response.text
        else:
            error_message = str(exception)

        return error_message


class CustomSocialAuthExceptionMiddleware(SocialAuthExceptionMiddleware):

    def get_redirect_uri(self, request, exception):
        error = request.GET.get('error', None)

        # This is what we should expect:
        # ['AADB2C90118: The user has forgotten their password.\r\n
        # Correlation ID: 7e8c3cf9-2fa7-47c7-8924-a1ea91137ba9\r\n
        # Timestamp: 2018-11-13 11:37:56Z\r\n']
        error_description = request.GET.get('error_description', None)
        if error == "access_denied" and error_description is not None:
            logger.error("Failed while getting redirect uri: %s", error_description, exc_info=True)

            if 'AADB2C90118' in error_description:
                auth_class = CustomAzureADBBCOAuth2()
                redirect_home = auth_class.get_redirect_uri()
                redirect_url = auth_class.base_url + '/oauth2/v2.0/' + \
                    'authorize?p=' + settings.SOCIAL_PASSWORD_RESET_POLICY + \
                    '&client_id=' + settings.KEY + \
                    '&nonce=defaultNonce&redirect_uri=' + redirect_home + \
                    '&scope=openid+email&response_type=code'
                return redirect_url

        # TODO: In case of password reset the state can't be verified figure out a way to log the user in after reset
        if error is None:
            return "/landing/"

        strategy = getattr(request, 'social_strategy', None)
        redirect_url = strategy.setting('LOGIN_ERROR_URL') + "?msgc=loginerror"
        return redirect_url


@deconstructible
class EToolsAzureStorage(AzureStorage):
    account_name = setting("AZURE_ACCOUNT_NAME")
    account_key = setting("AZURE_ACCOUNT_KEY")
    azure_container = setting("AZURE_CONTAINER")
    azure_ssl = setting("AZURE_SSL")

    auto_sign = setting("AZURE_AUTO_SIGN")
    azure_access_policy_permission = setting("AZURE_ACCESS_POLICY_PERMISSION")
    ap_expiry = setting("AZURE_ACCESS_POLICY_EXPIRY")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._service = None

    def url(self, name, expire=None):
        if hasattr(self.service, 'make_blob_url'):
            if self.auto_sign:
                start = (datetime.utcnow() + timedelta(seconds=-120)).strftime('%Y-%m-%dT%H:%M:%SZ')
                expiry = (datetime.utcnow() + timedelta(seconds=self.ap_expiry)).strftime('%Y-%m-%dT%H:%M:%SZ')
                sas_token = self.service.generate_blob_shared_access_signature(
                    self.azure_container,
                    name,
                    permission=self.azure_access_policy_permission,
                    expiry=expiry,
                    start=start,
                )
            else:
                sas_token = None
            return self.service.make_blob_url(
                container_name=self.azure_container,
                blob_name=name,
                protocol=self.azure_protocol,
                sas_token=sas_token,
            )
        else:
            return "{}{}/{}".format(setting('MEDIA_URL'), self.azure_container, name)
