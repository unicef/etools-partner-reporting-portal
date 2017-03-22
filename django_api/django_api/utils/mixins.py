"""
Project wide mixins for models and classes
"""


import logging

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.db import connection
from django.http.response import HttpResponseRedirect
from django.template.response import SimpleTemplateResponse
from django.utils.http import urlsafe_base64_encode

from tenant_schemas.middleware import TenantMiddleware
from tenant_schemas.utils import get_public_schema_name

from rest_framework.exceptions import PermissionDenied
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework.authentication import TokenAuthentication
from rest_framework_jwt.settings import api_settings

from allauth.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import perform_login


jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
logger = logging.getLogger('etools-prp.mixins')


class AdminURLMixin(object):
    """
    Provides a method to get the admin link for the mixed in model
    """
    admin_url_name = 'admin:{app_label}_{model_name}_{action}'

    def get_admin_url(self):
        content_type = ContentType.objects.get_for_model(self.__class__)
        return reverse(self.admin_url_name.format(
            app_label=content_type.app_label,
            model_name=content_type.model,
            action='change'
        ), args=(self.id,))
