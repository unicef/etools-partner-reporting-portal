from django.http import HttpResponseRedirect
from django.urls import reverse


class AuthRequiredMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if not request.user.is_authenticated and \
                request.method == 'GET' and \
                'text/html' in response.headers['Content-Type'] and \
                request.path != reverse('admin:login'):
            return HttpResponseRedirect(reverse('admin:login'))
        return response
