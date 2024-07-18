import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import './utils/routes';
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
import {connect, installRouter} from 'pwa-helpers';
import {store} from './redux/store.js';
import dayjs from 'dayjs';
import dayJsUtc from 'dayjs/plugin/utc';
import {initializeIcons} from '@unicef-polymer/etools-unicef/src/etools-icons/etools-icons';
import {handleUrlChange} from './redux/actions/app';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import cloneDeep from 'lodash-es/cloneDeep';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum';
import {setBasePath} from '@shoelace-style/shoelace/dist/utilities/base-path';
import {registerTranslateConfig, translate, use} from 'lit-translate';

dayjs.extend(dayJsUtc);

function fetchLangFiles(lang: string) {
  return Promise.allSettled([fetch(`assets/i18n/${lang}.json`).then((res: any) => res.json())]).then(
    (response: any) => {
      return response[0].value;
    }
  );
}

const translationConfig = registerTranslateConfig({
  empty: (key) => `${key && key[0].toUpperCase() + key.slice(1).toLowerCase()}`,
  loader: (lang: string) => fetchLangFiles(lang)
});

setBasePath('/ip/');
initializeIcons();

@customElement('app-shell')
export class AppShell extends LocalizeMixin(ErrorHandlerMixin(UtilsMixin(connect(store)(LitElement)))) {
  static styles = css`
    :host {
      display: block;
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
  page?: string;

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

  @property({type: Object})
  reduxRouteDetails = {};

  @state() hasLoadedStrings = false;

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  protected shouldUpdate(props: PropertyValues) {
    return this.hasLoadedStrings && super.shouldUpdate(props);
  }

  render() {
    return html`
      <etools-piwik-analytics .user="${this.profile}" .page="${this.route?.path}"></etools-piwik-analytics>

      <app-redirect></app-redirect>

      <etools-prp-auth .authenticated="${this.authenticated}"></etools-prp-auth>

      <etools-prp-ajax id="signOut" .url="${this.signoutUrl}" body="{}" content-type="application/json" method="post">
      </etools-prp-ajax>

      ${this._equals(this.page, 'app') ? html`<page-app name="${this.basePath}"></page-app>` : ''}
      ${this._equals(this.page, 'login') ? html` <page-login name="login" .value="${this.error}"></page-login>` : ''}
      ${this._equals(this.page, 'unauthorized')
        ? html` <page-unauthorized name="unauthorized"></page-unauthorized>`
        : ''}
      ${this._equals(this.page, 'not-found') ? html` <page-not-found name="not-found"></page-not-found>` : ''}
      ${this._equals(this.page, 'login-token') ? html` <page-login-token name="login-token"></page-login-token>` : ''}
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('authenticated')) {
      this.redirectPath = this.authenticated ? '/' + BASE_PATH : '/landing';
    }
  }

  stateChanged(state: RootState) {
    if (state.userProfile.profile && !isJsonStrMatch(this.profile, state.userProfile.profile)) {
      this.profile = state.userProfile.profile;
    }

    if (
      state.localize.resources &&
      Object.keys(state.localize.resources).length &&
      this.selectedLanguage !== state.localize.language
    ) {
      this.selectedLanguage = state.localize.language;
      this.loadLocalization();
    }

    if (state.app.routeDetails && !isJsonStrMatch(this.reduxRouteDetails, state.app.routeDetails)) {
      if (this.canAccessPage(state.app.routeDetails.routeName)) {
        this.page = state.app.routeDetails?.routeName || 'app';
        this.reduxRouteDetails = cloneDeep(state.app.routeDetails);
      } else {
        EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT));
      }
    }
  }

  async loadLocalization() {
    this.waitForTranslationsToLoad().then(async () => {
      await use(this.selectedLanguage);
      this.hasLoadedStrings = true;
    });
  }

  waitForTranslationsToLoad() {
    return new Promise((resolve) => {
      const translationsCheck = setInterval(() => {
        if (translationConfig) {
          clearInterval(translationsCheck);
          resolve(true);
        }
      }, 50);
    });
  }

  canAccessPage(_routeName: string) {
    return true;
  }

  _goToLanding() {
    location.pathname = '/landing';
  }

  _onTokenError() {
    this.error = true;
    this._goToLanding();
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

  connectedCallback() {
    super.connectedCallback();
    this.dispatchResources(locales);
    this._addEventListeners();

    installRouter((location) =>
      store.dispatch(handleUrlChange(decodeURIComponent(location.pathname + location.search)))
    );
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
