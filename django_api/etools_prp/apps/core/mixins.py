from datetime import datetime, timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.deconstruct import deconstructible

from social_core.backends.azuread_b2c import AzureADB2COAuth2
from social_core.pipeline import social_auth, user as social_core_user
from social_django.middleware import SocialAuthExceptionMiddleware
from storages.backends.azure_storage import AzureStorage
from storages.utils import setting


def social_details(backend, details, response, *args, **kwargs):
    r = social_auth.social_details(backend, details, response, *args, **kwargs)
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
        return
        # return HttpResponseRedirect("/workspace_inactive/")

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

        # TODO: Not using country in profile for PRP at the moment. May need to re-evaluate
        # def update_user_country():
        #     try:
        #         user.profile.country = Country.objects.get(business_area_code=business_area_code)

        #     except Country.DoesNotExist:
        #         user.profile.country = Country.objects.get(name='UAT')

        # if not user.profile.country:
        #     update_user_country()
        #     updates_available = True

        # elif not user.profile.country_override:
        #     # make sure that we update the workspace based business area
        #     if business_area_code != user.profile.country.business_area_code:
        #         update_user_country()
        #         updates_available = True

        # if updates_available:
        #     user.save()
        #     user.profile.save()

    return social_core_user.user_details(strategy, details, backend, user, *args, **kwargs)


class CustomAzureADBBCOAuth2(AzureADB2COAuth2):
    BASE_URL = 'https://{tenant_id}.b2clogin.com/{tenant_id}.onmicrosoft.com'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.redirect_uri = settings.FRONTEND_HOST + '/social/complete/azuread-b2c-oauth2/'


class CustomSocialAuthExceptionMiddleware(SocialAuthExceptionMiddleware):
    def get_redirect_uri(self, request, exception):
        error = request.GET.get('error', None)

        # This is what we should expect:
        # ['AADB2C90118: The user has forgotten their password.\r\n
        # Correlation ID: 7e8c3cf9-2fa7-47c7-8924-a1ea91137ba9\r\n
        # Timestamp: 2018-11-13 11:37:56Z\r\n']
        error_description = request.GET.get('error_description', None)

        if error == "access_denied" and error_description is not None:
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
            return "/landing"

        strategy = getattr(request, 'social_strategy', None)
        return strategy.setting('LOGIN_ERROR_URL')


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
