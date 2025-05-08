import base64
import json
from urllib.parse import urlencode

from django.conf import settings

import requests


class PMP_API:

    def __init__(self):

        self.url_prototype = settings.PMP_API_ENDPOINT
        self.username = settings.PMP_API_USER
        self.password = settings.PMP_API_PASSWORD
        self.http = requests.Session()

    def _gen_auth_headers(self, data=None):
        headers = {}
        headers['Content-Type'] = 'application/json'
        headers['Keep-Alive'] = '1800'
        if data:
            headers['Content-Length'] = len(data)

        auth_pair_str = '%s:%s' % (self.username, self.password)
        headers['Authorization'] = 'Basic ' + \
            base64.b64encode(auth_pair_str.encode()).decode()
        self.headers = headers

    def _push_request(self, data=None, timeout=None):
        try:
            self._gen_auth_headers(data)
            # POST
            if data:
                self.headers['Content-Type'] = 'application/x-www-form-urlencoded'
                r = self.http.post(
                    url=self.url,
                    headers=self.headers,
                    data=data,
                    verify=True,
                    timeout=timeout
                )
            # GET
            else:
                r = self.http.get(
                    url=self.url,
                    headers=self.headers,
                    verify=True,
                    timeout=timeout
                )
            # Any status code answer below 400 is OK
            if r.status_code < 400:
                content = r.text
            else:
                r.raise_for_status()

            try:
                data = json.loads(content)
            except Exception as e:
                Exception(e)

            return data
        except Exception as e:
            raise Exception(e)

    def _simple_get_request(self, timeout=None):
        self._gen_auth_headers()
        r = self.http.get(
            url=self.url,
            headers=self.headers,
            verify=True,
            timeout=timeout
        )
        if r.status_code < 400:
            return json.loads(r.text)
        else:
            r.raise_for_status()

    def workspaces(self):
        self.url = self.url_prototype + "/v2/workspaces/"
        data = self._push_request(timeout=300)
        return data

    def programme_documents(self, business_area_code, limit=10, offset=0, url=None, **kwargs):
        if url:
            self.url = url
        else:
            kwargs.update({'limit': limit, 'offset': offset, 'workspace': business_area_code})
            querystring = urlencode(kwargs)
            self.url = self.url_prototype + "/prp/v1/interventions/?" + querystring
        data = self._push_request(timeout=300)
        return data

    def government_documents(self, business_area_code, limit=10, offset=0, url=None, **kwargs):
        if url:
            self.url = url
        else:
            kwargs.update({'limit': limit, 'offset': offset, 'workspace': business_area_code})
            querystring = urlencode(kwargs)
            self.url = self.url_prototype + "/gdd/prp-gdds/?" + querystring
        data = self._push_request(timeout=300)
        return data

    def partners(self, business_area_code, url=None):
        self.url = self.url_prototype + "/prp/v1/partners/?workspace=%s" % (
            business_area_code) if not url else url
        data = self._push_request(timeout=300)
        return data

    def get_pd_document_url(self, business_area_code, pd_external_id):
        self.url = self.url_prototype + "/prp/v1/get_pd_document/{}/?workspace={}".format(pd_external_id,
                                                                                          business_area_code)
        data = self._simple_get_request(timeout=300)
        return data

    def get_gpd_document_url(self, business_area_code, gpd_external_id):
        self.url = self.url_prototype + "/gdd/prp-get-gpd-document/{}/?workspace={}".format(gpd_external_id,
                                                                                            business_area_code)
        data = self._simple_get_request(timeout=300)
        return data

    def get_locations(self, business_area_code, offset=0, limit=10, admin_level=0, url=None, **kwargs):
        if url:
            self.url = url
        else:
            kwargs.update({'workspace': business_area_code, 'admin_level': admin_level, 'limit': limit, 'offset': offset})
            querystring = urlencode(kwargs)
            self.url = self.url_prototype + "/prp-locations/?" + querystring
        data = self._push_request(timeout=None)  # wait indefinitely for the response
        return data
