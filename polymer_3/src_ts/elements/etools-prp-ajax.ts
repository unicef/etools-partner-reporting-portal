import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-ajax/iron-ajax';
import {IronAjaxElement} from '@polymer/iron-ajax/iron-ajax';
import UtilsMixin from '../mixins/utils-mixin';
import NotificationsMixin from '../mixins/notifications-mixin';
import {GenericObject} from '../typings/globals.types';
import {fireEvent} from '../utils/fire-custom-event';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {setToken, resetToken} from '../redux/actions';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 */
class EtoolsPrpAjax extends NotificationsMixin(UtilsMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
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
        last-response="{{lastResponse}}"
      >
      </iron-ajax>
    `;
  }

  @property({type: String})
  method!: string;

  @property({type: String})
  contentType!: string;

  @property({type: String})
  url!: string;

  @property({type: Object})
  body!: GenericObject;

  @property({type: Object})
  params!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.auth.token)'})
  token!: string;

  @property({type: Object})
  headers: GenericObject = {};

  @property({type: Boolean, notify: true})
  loading!: boolean;

  @property({type: Object, computed: '_computeHeaders(headers, token)'})
  customHeaders!: GenericObject;

  @property({type: String, computed: '_computeFormattedMethod(method)'})
  formattedMethod = 'GET';

  @property({type: Object, notify: true})
  lastRequest!: GenericObject;

  @property({type: Object, notify: true})
  lastResponse!: GenericObject;

  @property({type: Object, notify: true})
  lastError!: GenericObject;

  @property({type: Object, notify: true, readOnly: true})
  lastProgress!: GenericObject;

  @property({type: Array, notify: true})
  activeRequests!: GenericObject[];

  _computeHeaders(headers: GenericObject, token: string) {
    return Object.assign(
      {},
      {
        Authorization: 'Bearer ' + token,
        'X-CSRFToken': this._getCSRFCookie()
      },
      headers
    );
  }

  _getCSRFCookie() {
    // check for a csrftoken cookie and return its value
    const csrfCookieName = 'csrftoken';
    let csrfToken = '';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, csrfCookieName.length + 1) === csrfCookieName + '=') {
          csrfToken = decodeURIComponent(cookie.substring(csrfCookieName.length + 1));
          break;
        }
      }
    }
    return csrfToken;
  }

  _computeFormattedMethod(method: string) {
    return (method || '').toUpperCase();
  }

  _handleResponse(e: CustomEvent, ...args: any[]) {
    const request = e.detail;
    const token = request.xhr.getResponseHeader('token');

    if (token) {
      this.reduxStore.dispatch(setToken(token));
    }
    fireEvent(this, 'response', ['response'].concat(Array.from(args)));
  }

  _handleRequest(...args: any[]) {
    fireEvent(this, 'request', ['request'].concat(Array.from(args)));
  }

  _handleError(...args: any[]) {
    if (this.lastError && this.lastError.status === 401) {
      this.reduxStore.dispatch(resetToken());
    }

    if (this.lastError && this.lastError.status === 500) {
      this._notifyServerError();
    }
    fireEvent(this, 'error', ['error'].concat(Array.from(args)));
  }

  _buildResponse(req: GenericObject) {
    return {
      status: req.status,
      data: req.parseResponse(),
      xhr: req.xhr
    };
  }

  generateRequest(...args: []) {
    return (this.$.ajax as IronAjaxElement).generateRequest.apply(this.$.ajax, args);
  }

  toRequestOptions(...args: []) {
    return (this.$.ajax as IronAjaxElement).toRequestOptions.apply(this.$.ajax, args);
  }

  thunk() {
    return () => {
      const req = this.generateRequest();

      return req
        .completes!.then(() => {
          return this._buildResponse(req);
        })
        .catch(() => {
          return Promise.reject(this._buildResponse(req));
        });
    };
  }

  abort() {
    if (this.lastRequest) {
      this.lastRequest.xhr.abort();
    }
  }

  _addEventListeners() {
    // TODO: (dci) it seems these are not triggered, need to be checked, maybe can be removed ?
    this._handleResponse = this._handleResponse.bind(this);
    this.addEventListener('ajax.response', this._handleResponse as any);
    this._handleRequest = this._handleRequest.bind(this);
    this.addEventListener('ajax.request', this._handleRequest);
    this._handleError = this._handleError.bind(this);
    this.addEventListener('ajax.error', this._handleError);
  }

  _removeEventListeners() {
    this.removeEventListener('ajax.response', this._handleResponse as any);
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
window.customElements.define('etools-prp-ajax', EtoolsPrpAjax);

export {EtoolsPrpAjax as EtoolsPrpAjaxEl};
