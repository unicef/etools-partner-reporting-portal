var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-ajax/iron-ajax';
import UtilsMixin from '../mixins/utils-mixin';
import NotificationsMixin from '../mixins/notifications-mixin';
import { fireEvent } from '../utils/fire-custom-event';
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { setToken, resetToken } from '../redux/actions';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 */
class EtoolsPrpAjax extends NotificationsMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.headers = {};
        this.formattedMethod = 'GET';
    }
    static get template() {
        return html `

    <iron-ajax
        id="ajax"
        bubbles

        auto$="[[auto]]"

        method="[[formattedMethod]]"
        content-type="[[contentType]]"
        url="[[url]]"
        body="[[body]]"
        params="[[params]]"
        headers="[[customHeaders]]"
        timeout="[[timeout]]"
        handle-as="[[handleAs]]"
        json-prefix="[[jsonPrefix]]"
        sync="[[sync]]"
        withCredentials="[[withCredentials]]"

        loading="{{loading}}"
        active-requests="{{activeRequests}}"
        debounce-duration="{{debounceDuration}}"
        last-error="{{lastError}}"
        last-request="{{lastRequest}}"
        last-response="{{lastResponse}}">
    </iron-ajax>
  `;
    }
    _computeHeaders(headers, token) {
        return Object.assign({}, {
            Authorization: 'Bearer ' + token,
            'X-CSRFToken': this._getCSRFCookie()
        }, headers);
    }
    _getCSRFCookie() {
        // check for a csrftoken cookie and return its value
        const csrfCookieName = 'csrftoken';
        let csrfToken = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, csrfCookieName.length + 1) === (csrfCookieName + '=')) {
                    csrfToken = decodeURIComponent(cookie.substring(csrfCookieName.length + 1));
                    break;
                }
            }
        }
        return csrfToken;
    }
    _computeFormattedMethod(method) {
        return (method || '').toUpperCase();
    }
    _handleResponse(e) {
        const request = e.detail;
        const token = request.xhr.getResponseHeader('token');
        if (token) {
            this.reduxStore.dispatch(setToken(token));
        }
        fireEvent(this, ['response'].concat(arguments));
    }
    _handleRequest() {
        fireEvent(this, ['request'].concat(arguments));
    }
    _handleError() {
        if (this.lastError && this.lastError.status === 401) {
            this.reduxStore.dispatch(resetToken());
        }
        if (this.lastError && this.lastError.status === 500) {
            this._notifyServerError();
        }
        fireEvent(this, ['error'].concat(arguments));
    }
    _buildResponse(req) {
        return {
            status: req.status,
            data: req.parseResponse(),
            xhr: req.xhr,
        };
    }
    generateRequest() {
        return this.$.ajax.generateRequest.apply(this.$.ajax, arguments);
    }
    toRequestOptions() {
        return this.$.ajax.toRequestOptions.apply(this.$.ajax, arguments);
    }
    thunk() {
        const self = this;
        return (function () {
            const req = self.generateRequest();
            return req.completes
                .then(() => {
                return self._buildResponse(req);
            })
                .catch(() => {
                return Promise.reject(self._buildResponse(req));
            });
        }.bind(this));
    }
    abort() {
        if (this.lastRequest) {
            this.lastRequest.xhr.abort();
        }
    }
    _addEventListeners() {
        // TODO: (dci) it seems these are not triggered, need to be checked, maybe can be removed ?
        this._handleResponse = this._handleResponse.bind(this);
        this.addEventListener('ajax.response', this._handleResponse);
        this._handleRequest = this._handleRequest.bind(this);
        this.addEventListener('ajax.request', this._handleRequest);
        this._handleError = this._handleError.bind(this);
        this.addEventListener('ajax.error', this._handleError);
    }
    _removeEventListeners() {
        this.removeEventListener('ajax.response', this._handleResponse);
        this.removeEventListener('ajax.request', this._handleRequest);
        this.removeEventListener('ajax.error', this._handleError);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], EtoolsPrpAjax.prototype, "method", void 0);
__decorate([
    property({ type: String })
], EtoolsPrpAjax.prototype, "contentType", void 0);
__decorate([
    property({ type: String })
], EtoolsPrpAjax.prototype, "url", void 0);
__decorate([
    property({ type: Object })
], EtoolsPrpAjax.prototype, "body", void 0);
__decorate([
    property({ type: Object })
], EtoolsPrpAjax.prototype, "params", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.auth.token)' })
], EtoolsPrpAjax.prototype, "token", void 0);
__decorate([
    property({ type: Object })
], EtoolsPrpAjax.prototype, "headers", void 0);
__decorate([
    property({ type: Boolean, notify: true })
], EtoolsPrpAjax.prototype, "loading", void 0);
__decorate([
    property({ type: Object, computed: '_computeHeaders(headers, token)' })
], EtoolsPrpAjax.prototype, "customHeaders", void 0);
__decorate([
    property({ type: String, computed: '_computeFormattedMethod(method)' })
], EtoolsPrpAjax.prototype, "formattedMethod", void 0);
__decorate([
    property({ type: Object, notify: true })
], EtoolsPrpAjax.prototype, "lastRequest", void 0);
__decorate([
    property({ type: Object, notify: true })
], EtoolsPrpAjax.prototype, "lastResponse", void 0);
__decorate([
    property({ type: Object, notify: true })
], EtoolsPrpAjax.prototype, "lastError", void 0);
__decorate([
    property({ type: Object, notify: true, readOnly: true })
], EtoolsPrpAjax.prototype, "lastProgress", void 0);
__decorate([
    property({ type: Array, notify: true })
], EtoolsPrpAjax.prototype, "activeRequests", void 0);
window.customElements.define('etools-prp-ajax', EtoolsPrpAjax);
export { EtoolsPrpAjax as EtoolsPrpAjaxEl };
