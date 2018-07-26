import qs from "query-string";
import axios from "axios";

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
    }).catch(function (error) {
        alert('API call error occurred!');
        console.error(error);
        console.error('Request URL', error.config.url);
        console.error('Response Data', JSON.stringify(error.response.data));
        console.error('Request Data', error.config.data);
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
};