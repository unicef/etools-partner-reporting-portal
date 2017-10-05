from django.conf import settings


def passwordless_token_email():
    """
    Doesn't take a request since its a passwordless specific context processor.
    """
    return {
        'www_root': settings.WWW_ROOT
    }
