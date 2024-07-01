import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@unicef-polymer/etools-piwik-analytics/etools-piwik-analytics.js';

import LocalizeMixin from './etools-prp-common/mixins/localize-mixin.js';
import UtilsMixin from './etools-prp-common/mixins/utils-mixin.js';
import ErrorHandlerMixin from './etools-prp-common/mixins/errors-mixin.js';
import Endpoints from './endpoints.js';
import './etools-prp-common/elements/app-redirect.js';
import './etools-prp-common/elements/etools-prp-ajax.js';
import './etools-prp-common/elements/etools-prp-auth.js';
import {EtoolsPrpAjaxEl} from './etools-prp-common/elements/etools-prp-ajax.js';
import {reset, userLogout} from './redux/actions.js';
import {BASE_PATH} from './etools-prp-common/config.js';
import {locales} from './locales.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';
import {RootState} from './typings/redux.types.js';
import {connect} from 'pwa-helpers';
import {store} from './redux/store.js';
import dayjs from 'dayjs';
import dayJsUtc from 'dayjs/plugin/utc';
import {initializeIcons} from '@unicef-polymer/etools-unicef/src/etools-icons/etools-icons';
dayjs.extend(dayJsUtc);
initializeIcons();

@customElement('app-shell')
export class AppShell extends LocalizeMixin(ErrorHandlerMixin(UtilsMixin(connect(store)(LitElement)))) {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    iron-pages {
      height: 100%;
    }
  `;

  @property({type: String})
  basePath = BASE_PATH;

  @property({type: Object})
  routeData: any = {};

  @property({type: Object})
  subroute: any = {};

  @property({type: String})
  page = '';

  @property({type: Boolean})
  authenticated = false;

  @property({type: String})
  signoutUrl = Endpoints.userSignOut();

  @property({type: String})
  redirectPath?: string;

  @property({type: Boolean})
  error = false;

  @property({type: Object})
  profile = {};

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  render() {
    return html`
      <etools-piwik-analytics .user="${this.profile}" .page="${this.route?.path}"></etools-piwik-analytics>

      <app-redirect></app-redirect>

      <etools-prp-auth .authenticated="${this.authenticated}"></etools-prp-auth>

      <etools-prp-ajax id="signOut" .url="${this.signoutUrl}" body="{}" content-type="application/json" method="post">
      </etools-prp-ajax>

      <app-location
        .route="${this.route}"
        @route-changed=${(e) => {
          if (e.detail.value && e.detail.value.path && JSON.stringify(this.route) !== JSON.stringify(e.detail.value)) {
            this.route = e.detail.value;
          }
        }}
      ></app-location>

      <app-route
        .route="${this.route}"
        pattern="/:page"
        .data="${this.routeData}"
        .tail="${this.subroute}"
        @tail-changed=${(e) => {
          if (
            e.detail.value &&
            e.detail.value.path &&
            JSON.stringify(this.subroute) !== JSON.stringify(e.detail.value)
          ) {
            this.subroute = e.detail.value;
          }
        }}
        @data-changed=${(e) => {
          if (
            e.detail.value &&
            e.detail.value.page &&
            JSON.stringify(this.routeData) !== JSON.stringify(e.detail.value)
          ) {
            this.routeData = e.detail.value;
            this._routePageChanged(this.routeData.page);
          }
        }}
      ></app-route>

      <iron-pages .selected="${this.page}" attr-for-selected="name" role="main">
        ${this._equals(this.page, this.basePath)
          ? html`<page-app name="${this.basePath}" .route="${this.subroute}"></page-app>`
          : ''}
        ${this._equals(this.page, 'login') ? html` <page-login name="login" .value="${this.error}"></page-login>` : ''}
        ${this._equals(this.page, 'unauthorized')
          ? html` <page-unauthorized name="unauthorized"></page-unauthorized>`
          : ''}
        ${this._equals(this.page, 'not-found') ? html` <page-not-found name="not-found"></page-not-found>` : ''}
        ${this._equals(this.page, 'login-token') ? html` <page-login-token name="login-token"></page-login-token>` : ''}
      </iron-pages>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('page')) {
      this._pageChanged(this.page);
    }

    if (changedProperties.has('authenticated')) {
      this.redirectPath = this.authenticated ? '/' + BASE_PATH : '/landing';
    }
  }

  stateChanged(state: RootState) {
    if (this.profile !== state.userProfile.profile) {
      this.profile = state.userProfile.profile;
    }
  }

  _goToLanding() {
    location.pathname = '/landing';
  }

  _routePageChanged(page: string) {
    const validPages = [BASE_PATH, 'landing', 'unauthorized', 'not-found', 'login-token'];
    const isPageValid = validPages.includes(page); // Check if page is valid

    if (!page) {
      this.page = '/' + BASE_PATH;
    } else if (!isPageValid) {
      this.page = 'not-found'; // If page is invalid, redirect to not-found page
    } else {
      this.page = page;
    }
  }

  _onTokenError() {
    this.error = true;
    this._goToLanding();
  }

  async _pageChanged(page: string) {
    let componentName = page === BASE_PATH ? 'app' : page;
    switch (componentName) {
      case 'app':
        await import('./pages/app.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
      case 'unauthorized':
        await import('./pages/unauthorized.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
      case 'not-found':
        await import('./pages/not-found.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
      case 'login-token':
        await import('./pages/login-token.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
      default:
        await import('./pages/app.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
    }
  }

  _onSignOut() {
    const thunk = (this.shadowRoot!.getElementById('signOut') as EtoolsPrpAjaxEl).thunk();
    store
      .dispatch(userLogout(thunk))
      .then(() => {
        this._goToLanding();
        store.dispatch(reset());
      })
      .catch((_err: any) => {
        // TODO: error handling
      });
  }

  _notFound() {
    this.page = 'not-found';
  }

  connectedCallback() {
    super.connectedCallback();
    this.dispatchResources(locales);
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

  _addEventListeners() {
    this._handleError = this._handleError.bind(this);
    this.addEventListener('error', this._handleError as any);
    this._onSignOut = this._onSignOut.bind(this);
    this.addEventListener('sign-out', this._onSignOut);
    this._onTokenError = this._onTokenError.bind(this);
    this.addEventListener('token-error', this._onTokenError);
  }

  _removeEventListeners() {
    this.removeEventListener('error', this._handleError as any);
    this.removeEventListener('sign-out', this._onSignOut);
    this.removeEventListener('token-error', this._onTokenError);
  }
}

export {AppShell as AppShellEl};
