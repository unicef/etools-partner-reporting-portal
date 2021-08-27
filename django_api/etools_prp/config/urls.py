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
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from rest_framework_swagger.views import get_swagger_view

from etools_prp.apps.core.views import HomeView, UnauthorizedView

schema_view = get_swagger_view(title='eTools PRP API')

urlpatterns = [
    url(r'^$', HomeView.as_view()),
    url(r'^api/docs/', schema_view),
    url(r'^api/admin/', admin.site.urls),
    url(r'^api/core/', include('etools_prp.apps.core.urls')),
    url(r'^api/account/', include('etools_prp.apps.account.urls')),
    url(r'^api/indicator/', include('etools_prp.apps.indicator.urls')),
    url(r'^api/partner/', include('etools_prp.apps.partner.urls')),
    url(r'^api/unicef/', include('etools_prp.apps.unicef.urls')),
    url(r'^api/cluster/', include('etools_prp.apps.cluster.urls')),
    url(r'^api/ocha/', include('etools_prp.apps.ocha.urls')),
    url(r'^api/id-management/', include('etools_prp.apps.id_management.urls')),

    # Social auth urls
    url(r'^social/', include('social_django.urls', namespace='social')),
    url(r'^unauthorized/$', UnauthorizedView.as_view(), name="unauthorized"),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

    # Serving staticserve files for both dev and remote environments
    urlpatterns += staticfiles_urlpatterns('/api/static/')
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
elif settings.STATICFILES_STORAGE == 'django.contrib.staticfiles.storage.StaticFilesStorage':
    from django.views.static import serve
    urlpatterns += [
        url(r'^api/static/(?P<path>.*)$', serve, {
            'document_root': settings.STATIC_ROOT,
        }),
        url(r'^api/media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
