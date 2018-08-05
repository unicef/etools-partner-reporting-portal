from datetime import datetime, timedelta

from django.utils.deconstruct import deconstructible
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

from social_core.backends.azuread_b2c import AzureADB2COAuth2
from social_core.pipeline import social_auth
from social_core.pipeline import user as social_core_user

from azure.storage import AccessPolicy, SharedAccessPolicy

from storages.backends.azure_storage import AzureStorage
from storages.utils import setting


def social_details(backend, details, response, *args, **kwargs):
    r = social_auth.social_details(backend, details, response, *args, **kwargs)
    r['details']['idp'] = response.get('idp')

    if not r['details'].get('email'):
        r['details']['email'] = response.get('email')

    return r


def get_username(strategy, details, backend, user=None, *args, **kwargs):
    username = details.get('email')

    try:
        get_user_model().objects.get(username=username)

    except get_user_model().DoesNotExist:
        return
        # return HttpResponseRedirect("/workspace_inactive/")

    return {'username': details.get('email')}


def user_details(strategy, details, user=None, *args, **kwargs):
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

    return social_core_user.user_details(strategy, details, user, *args, **kwargs)


class CustomAzureADBBCOAuth2(AzureADB2COAuth2):

    def __init__(self, *args, **kwargs):
        super(CustomAzureADBBCOAuth2, self).__init__(*args, **kwargs)
        self.redirect_uri = settings.FRONTEND_HOST + '/social/complete/azuread-b2c-oauth2/'


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
        super(EToolsAzureStorage, self).__init__(*args, **kwargs)
        self._connection = None

    def url(self, name):
        if hasattr(self.connection, 'make_blob_url'):
            if self.auto_sign:
                access_policy = AccessPolicy()
                access_policy.start = (datetime.utcnow() + timedelta(seconds=-120)).strftime('%Y-%m-%dT%H:%M:%SZ')
                access_policy.expiry = (
                    datetime.utcnow()
                    + timedelta(seconds=self.ap_expiry)
                ).strftime('%Y-%m-%dT%H:%M:%SZ')
                access_policy.permission = self.azure_access_policy_permission
                sap = SharedAccessPolicy(access_policy)
                sas_token = self.connection.generate_shared_access_signature(
                    self.azure_container,
                    blob_name=name,
                    shared_access_policy=sap,
                )
            else:
                sas_token = None
            return self.connection.make_blob_url(
                container_name=self.azure_container,
                blob_name=name,
                protocol=self.azure_protocol,
                sas_token=sas_token,
            )
        else:
            return "{}{}/{}".format(setting('MEDIA_URL'), self.azure_container, name)
