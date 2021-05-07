from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from rest_framework_swagger.views import get_swagger_view

schema_view = get_swagger_view(title='eTools PRP API')

urlpatterns = [
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
