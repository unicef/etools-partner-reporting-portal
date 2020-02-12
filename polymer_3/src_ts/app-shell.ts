import {ReduxConnectedElement} from './ReduxConnectedElement';
import {html} from '@polymer/polymer/polymer-element.js';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/app-localize-behavior/app-localize-behavior.js';

import LocalizeMixin from './mixins/localize-mixin';
import UtilsMixin from './mixins/utils-mixin';
import ErrorHandlerMixin from './mixins/errors-mixin';
import Endpoints from './endpoints';
import './elements/app-redirect';
import './elements/etools-prp-ajax';
import './elements/etools-prp-auth';
import './pages/login';
import './pages/login-token';
import './pages/not-found';
import './pages/unauthorized';
import {EtoolsPrpAjaxEl} from './elements/etools-prp-ajax';
import {GenericObject} from './typings/globals.types';
import {reset, userLogout, setL11NResources} from './redux/actions';
import {store} from './redux/store';
import {getDomainByEnv} from './config';

// behaviors: [
//   App.Behaviors.UtilsBehavior,
//   App.Behaviors.ErrorHandlerBehavior,
//   App.Behaviors.ReduxBehavior,
//   Polymer.AppLocalizeBehavior,
// ],

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
      <template is="dom-if" if="[[_equals(page, 'app')]]" restamp="true">
        <page-app
            name="app"
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

  @property({type: Object, computed: 'getReduxStateValue(state.userProfile.profile)'})
  profile!: GenericObject;

  public static get observers() {
    return [
      '_routePageChanged(routeData.page)',
      '_handleResources(resources)',
    ]
  }

  _goToLanding() {
    location.pathname = '/landing';
  }

  _routePageChanged(page: string) {
    if (page === 'app_poly3') {
      page = 'app';
    }
    const validPages = ['app', 'landing', 'unauthorized', 'not-found', 'login-token'];  // Array of valid pages
    const isPageValid = validPages.includes(page);  // Check if page is valid

    if (!page) {
      //page = 'app'
      location.pathname = '/app';
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
    const resolvedPageUrl = getDomainByEnv() + `/src/pages/${page}.js`;
    //`./pages/${page}.js`;
    await import(resolvedPageUrl)
      .catch((err: any) => {
        console.log(err);
        this._notFound();
      });
  }

  _onSignOut() {
    const self = this;
    const thunk = (this.$.signOut as EtoolsPrpAjaxEl).thunk();
    store.dispatch(userLogout(thunk));
    //(dci) it was a then before
    setTimeout(() => {
      self._goToLanding();
      store.dispatch(reset());
    });
    //     .catch(function(err: any) { //jshint ignore:line
    //   // TODO: error handling
    // });
  }

  _notFound() {
    this.page = 'not-found';
  }

  _computeRedirectPath(authenticated: boolean) {
    return authenticated ? '/app' : '/landing';
  }

  _handleResources(resources: []) {
    store.dispatch(setL11NResources(resources));
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
    //(dci)
    // this.loadResources(this.resolveUrl('locales.json'));
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
  }
}

window.customElements.define('app-shell', AppShell);
