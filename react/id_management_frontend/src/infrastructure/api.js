import qs from "query-string";
import axios from "axios";
import { SubmissionError } from "redux-form";
import store from "../store";
import { error as errorAction } from "../actions";
import * as R from 'ramda';
const baseUrl = "/api/";
function transformParam(param) {
    if (Array.isArray(param)) {
        return String(param);
    }
    return param;
}
function makeRequest(method, url, data, params) {
    return axios({
        method: method,
        url: baseUrl + url,
        data: data,
        params: method === 'get' ? data : params,
        paramsSerializer: function (params) {
            return qs.stringify(R.mapObjIndexed(transformParam, params), { encode: false });
        },
        xsrfHeaderName: "X-CSRFToken",
        xsrfCookieName: "csrftoken",
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(error => {
        if (error.response.data.error_codes === "not_authenticated") {
            document.location.href = "/";
        }
        switch (error.response.status) {
            case 500:
                alert("Internal Server Error occurred");
                throw new Error(error.response);
            default:
                const errorDetail = error.response.data.detail ? error.response.data.detail[0] : undefined;
                switch (method) {
                    case 'post':
                    case 'put':
                    case 'patch':
                        const errors = {
                            _error: errorDetail
                        };
                        throw new SubmissionError(Object.assign({}, error.response.data, errors));
                    default:
                        store.dispatch(errorAction(errorDetail));
                }
        }
    });
}
export const api = {
    post: function (url, data, params) {
        return makeRequest('post', url, data, params);
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
