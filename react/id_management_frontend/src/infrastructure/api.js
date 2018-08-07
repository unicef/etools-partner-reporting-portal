import qs from "query-string";
import axios from "axios";
import {SubmissionError} from "redux-form";

const baseUrl = "/api/";

function makeRequest(method, url, data) {
    return axios({
        method: method,
        url: baseUrl + url,
        data: data,
        params: method === 'get' ? data : undefined,
        paramsSerializer: qs.stringify,
        xsrfHeaderName: "X-CSRFToken",
        xsrfCookieName: "csrftoken",
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(error => {
        if (error.response.data.error_codes === "not_authenticated") {
            document.location.href = "/";
        }

        throw new SubmissionError(error.response.data);
    });
}

export var api = {
    post: function (url, data) {
        return makeRequest('post', url, data);
    },
    get: function (url, params) {
        return makeRequest('get', url, params);
    },
    patch: function (url, data) {
        return makeRequest('patch', url, data);
    },
    put: function (url, data) {
        return makeRequest('put', url, data);
    },
    delete: function (url) {
        return makeRequest('delete', url);
    },
    options: function (url) {
        return makeRequest('options', url);
    }
};