var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from './etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import 'etools-piwik-analytics/etools-piwik-analytics.js';
import LocalizeMixin from './etools-prp-common/mixins/localize-mixin';
import UtilsMixin from './etools-prp-common/mixins/utils-mixin';
import ErrorHandlerMixin from './etools-prp-common/mixins/errors-mixin';
import Endpoints from './endpoints';
import './etools-prp-common/elements/app-redirect';
import './etools-prp-common/elements/etools-prp-ajax';
import './etools-prp-common/elements/etools-prp-auth';
import { reset, userLogout } from './redux/actions';
import { getDomainByEnv, BASE_PATH } from './etools-prp-common/config';
import { locales } from './locales';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';
dayjs.extend(dayjs_plugin_utc);
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin ErrorHandlerMixin
 * @appliesMixin LocalizeMixin
 */
class AppShell extends LocalizeMixin(ErrorHandlerMixin(UtilsMixin(ReduxConnectedElement))) {
    constructor() {
        super();
        this.basePath = BASE_PATH;
        this.signoutUrl = Endpoints.userSignOut();
        this.error = false;
        // Gesture events like tap and track generated from touch will not be
        // preventable, allowing for better scrolling performance.
        setPassiveTouchGestures(true);
    }
    static get template() {
        return html `
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

      <etools-prp-ajax id="signOut" url="[[signoutUrl]]" body="{}" content-type="application/json" method="post">
      </etools-prp-ajax>

      <app-location route="{{route}}"></app-location>

      <app-route route="{{route}}" pattern="/:page" data="{{routeData}}" tail="{{subroute}}"></app-route>

      <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
        <template is="dom-if" if="[[_equals(page, basePath)]]" restamp="true">
          <page-app name="[[basePath]]" route="{{subroute}}"> </page-app>
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
    static get observers() {
        return ['_routePageChanged(routeData.page)'];
    }
    _goToLanding() {
        location.pathname = '/landing';
    }
    _routePageChanged(page) {
        const validPages = [BASE_PATH, 'landing', 'unauthorized', 'not-found', 'login-token'];
        const isPageValid = validPages.includes(page); // Check if page is valid
        if (!page) {
            location.pathname = '/' + BASE_PATH;
        }
        else if (isPageValid === false) {
            this.page = 'not-found'; // If page is invalid, redirect to not-found page
        }
        else {
            this.page = page;
        }
    }
    _onTokenError() {
        this.set('error', true);
        this._goToLanding();
    }
    async _pageChanged(page) {
        let componentName = '';
        if (page === BASE_PATH) {
            componentName = 'app';
        }
        else {
            componentName = page;
        }
        const resolvedPageUrl = getDomainByEnv() + `/src/pages/${componentName}.js`;
        await import(resolvedPageUrl).catch((err) => {
            console.log(err);
            this._notFound();
        });
    }
    _onSignOut() {
        const thunk = this.$.signOut.thunk();
        this.reduxStore
            .dispatch(userLogout(thunk))
            // @ts-ignore
            .then(() => {
            this._goToLanding();
            this.reduxStore.dispatch(reset());
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _notFound() {
        this.page = 'not-found';
    }
    _computeRedirectPath(authenticated) {
        return authenticated ? '/' + BASE_PATH : '/landing';
    }
    _addEventListeners() {
        this._handleError = this._handleError.bind(this);
        this.addEventListener('error', this._handleError);
        this._onSignOut = this._onSignOut.bind(this);
        this.addEventListener('sign-out', this._onSignOut);
        this._onTokenError = this._onTokenError.bind(this);
        this.addEventListener('token-error', this._onTokenError);
    }
    _removeEventListeners() {
        this.removeEventListener('error', this._handleError);
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
__decorate([
    property({ type: String })
], AppShell.prototype, "basePath", void 0);
__decorate([
    property({ type: Object })
], AppShell.prototype, "routeData", void 0);
__decorate([
    property({ type: Object })
], AppShell.prototype, "subroute", void 0);
__decorate([
    property({ type: String, observer: '_pageChanged' })
], AppShell.prototype, "page", void 0);
__decorate([
    property({ type: Boolean })
], AppShell.prototype, "authenticated", void 0);
__decorate([
    property({ type: String })
], AppShell.prototype, "signoutUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeRedirectPath(authenticated)' })
], AppShell.prototype, "redirectPath", void 0);
__decorate([
    property({ type: Boolean })
], AppShell.prototype, "error", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)' })
], AppShell.prototype, "profile", void 0);
window.customElements.define('app-shell', AppShell);
