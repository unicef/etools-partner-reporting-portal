# -*- coding: utf-8 -*-

import json
import base64
import requests

from django.conf import settings


class PMP_API(object):

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
        headers['Authorization'] = 'Basic ' + base64.b64encode(auth_pair_str.encode()).decode()
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


    def workspaces(self):
        self.url = self.url_prototype + "/v2/workspaces/"
        data = self._push_request(timeout=30)
        return data

    def programme_documents(self, business_area_code, page=0, url=None):
        self.url = self.url_prototype + "/prp/v1/interventions?page=%s&workspace=%s" % (page, business_area_code) if not url else url
        data = self._push_request(timeout=30)
        return data

    def partners(self):
        self.url = self.url_prototype + "/v2/partners/"
        data = self._push_request(timeout=30)
        return data
