from django.conf import settings


def user_is_unicef(user):
    return user.username == getattr(settings, 'DEFAULT_UNICEF_USER', None)
