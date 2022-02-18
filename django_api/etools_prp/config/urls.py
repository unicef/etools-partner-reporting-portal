"""django_api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, re_path

from rest_framework_swagger.views import get_swagger_view

from etools_prp.apps.core.views import HomeView, RedirectAppView, SocialLogoutView, UnauthorizedView

schema_view = get_swagger_view(title='eTools PRP API')

urlpatterns = [
    re_path(r'^$', HomeView.as_view()),
    re_path(r'^app/', RedirectAppView.as_view()),
    re_path(settings.DOCS_URL, schema_view),
    re_path(r'^api/admin/', admin.site.urls),
    re_path(r'^api/core/', include('etools_prp.apps.core.urls')),
    re_path(r'^api/account/', include('etools_prp.apps.account.urls')),
    re_path(r'^api/indicator/', include('etools_prp.apps.indicator.urls')),
    re_path(r'^api/partner/', include('etools_prp.apps.partner.urls')),
    re_path(r'^api/unicef/', include('etools_prp.apps.unicef.urls')),
    re_path(r'^api/cluster/', include('etools_prp.apps.cluster.urls')),
    re_path(r'^api/ocha/', include('etools_prp.apps.ocha.urls')),
    re_path(r'^api/id-management/', include('etools_prp.apps.id_management.urls')),

    # Social auth urls
    re_path(r'^social/unicef-logout/', SocialLogoutView.as_view()),
    re_path(r'^social/', include('social_django.urls', namespace='social')),
    re_path(r'^unauthorized/$', UnauthorizedView.as_view(), name="unauthorized"),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        re_path(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

    # Serving staticserve files for both dev and remote environments
    urlpatterns += staticfiles_urlpatterns('/api/static/')
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [re_path(r'api-auth/', include('rest_framework.urls')), ]
elif settings.STATICFILES_STORAGE == 'django.contrib.staticfiles.storage.StaticFilesStorage':
    from django.views.static import serve
    urlpatterns += [
        re_path(r'^api/static/(?P<path>.*)$', serve, {
            'document_root': settings.STATIC_ROOT,
        }),
        re_path(r'^api/media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
