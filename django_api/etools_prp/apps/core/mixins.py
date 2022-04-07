from datetime import datetime, timedelta
from urllib.parse import quote

from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.utils.deconstruct import deconstructible

from storages.backends.azure_storage import AzureStorage
from storages.utils import setting


def get_username(strategy, details, backend, user=None, *args, **kwargs):
    """allow to login only existing/already created users """
    username = details.get('email')

    try:
        get_user_model().objects.get(username=username)

    except get_user_model().DoesNotExist:
        email = quote(username)
        return HttpResponseRedirect(f"/unauthorized/?eu={email}&msgc=nouser")

    return {'username': details.get('email')}


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
