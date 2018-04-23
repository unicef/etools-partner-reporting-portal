from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

from social_core.backends.azuread_b2c import AzureADB2COAuth2
from social_core.pipeline import social_auth
from social_core.pipeline import user as social_core_user


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
    # This is where we update the user
    # see what the property to map by is here
    updates_available = False

    if user:
        user_groups = [group.name for group in user.groups.all()]
        # business_area_code = details.get("business_area_code", 'defaultBA1235')

        if details.get("idp") == "UNICEF Azure AD" and "UNICEF User" not in user_groups:
            user.groups.add(Group.objects.get(name='UNICEF User'))
            user.is_staff = True
            updates_available = True

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

        if updates_available:
            user.save()
            user.profile.save()

    print("user_details: ", strategy, details, user)

    return social_core_user.user_details(strategy, details, user, *args, **kwargs)


class CustomAzureADBBCOAuth2(AzureADB2COAuth2):

    def __init__(self, *args, **kwargs):
        super(CustomAzureADBBCOAuth2, self).__init__(*args, **kwargs)
        self.redirect_uri = settings.FRONTEND_HOST + '/social/complete/azuread-b2c-oauth2/'
