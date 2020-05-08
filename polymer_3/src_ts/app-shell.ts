import {ReduxConnectedElement} from './ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import 'etools-piwik-analytics/etools-piwik-analytics.js';

import LocalizeMixin from './mixins/localize-mixin';
import UtilsMixin from './mixins/utils-mixin';
import ErrorHandlerMixin from './mixins/errors-mixin';
import Endpoints from './endpoints';
import './elements/app-redirect';
import './elements/etools-prp-ajax';
import './elements/etools-prp-auth';
import {EtoolsPrpAjaxEl} from './elements/etools-prp-ajax';
import {GenericObject} from './typings/globals.types';
import {reset, userLogout} from './redux/actions';
import {getDomainByEnv, BASE_PATH} from './config';
import {locales} from './locales';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin ErrorHandlerMixin
 * @appliesMixin LocalizeMixin
 */
class AppShell extends (LocalizeMixin(ErrorHandlerMixin(UtilsMixin(ReduxConnectedElement)))) {

  public static get template() {
    return html`
    <style>
      :host {
        display: block;
        height: 100%;
      }

      iron-pages {
        height: 100%;
      }
    </style>
    <etools-piwik-analytics user="[[profile]]" page="[[route.path]]"></etools-piwik-analytics>

    <app-redirect></app-redirect>

    <etools-prp-auth authenticated="{{authenticated}}"></etools-prp-auth>

    <etools-prp-ajax
      id="signOut"
      url="[[signoutUrl]]"
      body="{}"
      content-type="application/json"
      method="post">
    </etools-prp-ajax>

    <app-location route="{{route}}"></app-location>

    <app-route
        route="{{route}}"
        pattern="/:page"
        data="{{routeData}}"
        tail="{{subroute}}"></app-route>


    <iron-pages
        selected="[[page]]"
        attr-for-selected="name"
        role="main">
      <template is="dom-if" if="[[_equals(page, basePath)]]" restamp="true">
        <page-app
            name="[[basePath]]"
            route="{{subroute}}">
        </page-app>
      </template>

      <template is="dom-if" if="[[_equals(page, 'login')]]" restamp="true">
        <page-login name="login" value="{{error}}"></page-login>
      </template>

      <template is="dom-if" if="[[_equals(page, 'unauthorized')]]" restamp="true">
        <page-unauthorized name="unauthorized"></page-unauthorized>
      </template>

      <template is="dom-if" if="[[_equals(page, 'not-found')]]" restamp="true">
        <page-not-found name="not-found"></page-not-found>
      </template>

      <template is="dom-if" if="[[_equals(page, 'login-token')]]" restamp="true">
        <page-login-token name="login-token"></page-login-token>
      </template>

    </iron-pages>
    `;
  }
  @property({type: String})
  basePath = BASE_PATH;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object})
  subroute!: GenericObject;

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  @property({type: Boolean})
  authenticated!: boolean;

  @property({type: String})
  signoutUrl: string = Endpoints.userSignOut();

  @property({type: String, computed: '_computeRedirectPath(authenticated)'})
  redirectPath!: string;

  @property({type: Boolean})
  error: boolean = false;

  @property({type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)'})
  profile!: GenericObject;

  constructor() {
    super();
    // Gesture events like tap and track generated from touch will not be
    // preventable, allowing for better scrolling performance.
    setPassiveTouchGestures(true);
  }

  public static get observers() {
    return [
      '_routePageChanged(routeData.page)',
    ]
  }

  _goToLanding() {
    location.pathname = '/landing';
  }

  _routePageChanged(page: string) {
    const validPages = [BASE_PATH, 'landing', 'unauthorized', 'not-found', 'login-token'];  // TODO - add `app` when app_poly3 is no longer used
    const isPageValid = validPages.includes(page);  // Check if page is valid

    if (!page) {
      location.pathname = '/' + BASE_PATH;
    } else if (isPageValid === false) {
      this.page = 'not-found';  // If page is invalid, redirect to not-found page
    } else {
      this.page = page;
    }
  }

  _onTokenError() {
    this.set('error', true);
    this._goToLanding();
  }

  async _pageChanged(page: string) {
    let componentName = '';
    if (page === BASE_PATH) {
      componentName = 'app';
    } else {
      componentName = page;
    }
    const resolvedPageUrl = getDomainByEnv() + `/src/pages/${componentName}.js`;
    await import(resolvedPageUrl)
      .catch((err: any) => {
        console.log(err);
        this._notFound();
      });
  }

  _onSignOut() {
    const self = this;
    const thunk = (this.$.signOut as EtoolsPrpAjaxEl).thunk();
    this.reduxStore.dispatch(userLogout(thunk))
      // @ts-ignore
      .then(() => {
        self._goToLanding();
        self.reduxStore.dispatch(reset());
      })
      .catch((_err: any) => {
        // TODO: error handling
      });
  }

  _notFound() {
    this.page = 'not-found';
  }

  _computeRedirectPath(authenticated: boolean) {
    return authenticated ? '/' + BASE_PATH : '/landing';
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

  connectedCallback() {
    super.connectedCallback();
    this.dispatchResources(locales);
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
  }
}

window.customElements.define('app-shell', AppShell);
