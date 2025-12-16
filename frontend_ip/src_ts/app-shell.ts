import "@fontsource/roboto/300.css";
import "@fontsource/roboto/300-italic.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/500-italic.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/700-italic.css";

import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/700.css";

import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import './utils/routes';
import '@unicef-polymer/etools-piwik-analytics/etools-piwik-analytics.js';

import ErrorHandlerMixin from './etools-prp-common/mixins/errors-mixin.js';
import Endpoints from './endpoints.js';
import './etools-prp-common/elements/app-redirect.js';
import './etools-prp-common/elements/etools-prp-auth.js';
import {reset, resetToken} from './redux/actions.js';
import {BASE_PATH} from './etools-prp-common/config.js';
import {RootState} from './typings/redux.types.js';
import {connect, installRouter} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from './redux/store.js';
import dayjs from 'dayjs';
import dayJsUtc from 'dayjs/plugin/utc';
import {initializeIcons} from '@unicef-polymer/etools-unicef/src/etools-icons/etools-icons';
import {handleUrlChange} from './redux/actions/app';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import cloneDeep from 'lodash-es/cloneDeep';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum';
import {setBasePath} from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import {registerTranslateConfig, translate, use} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {setActiveLanguage} from './redux/actions/active-language';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';

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
export class AppShell extends ErrorHandlerMixin(connect(store)(LitElement)) {
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
  }

  protected shouldUpdate(props: PropertyValues) {
    return this.hasLoadedStrings && super.shouldUpdate(props);
  }

  render() {
    return html`
      <etools-piwik-analytics .user="${this.profile}" .page="${this.route?.path}"></etools-piwik-analytics>

      <app-redirect></app-redirect>

      <etools-prp-auth .authenticated="${this.authenticated}"></etools-prp-auth>

      ${this.page === 'app' ? html`<page-app name="${this.basePath}"></page-app>` : ''}
      ${this.page === 'login' ? html` <page-login name="login" .value="${this.error}"></page-login>` : ''}
      ${this.page === 'unauthorized' ? html` <page-unauthorized name="unauthorized"></page-unauthorized>` : ''}
      ${this.page === 'not-found' ? html` <page-not-found name="not-found"></page-not-found>` : ''}
      ${this.page === 'login-token' ? html` <page-login-token name="login-token"></page-login-token>` : ''}
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('authenticated')) {
      this.redirectPath = this.authenticated ? '/' + BASE_PATH : '/landing';
    }
  }

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.waitForTranslationsToLoad().then(async () => {
      this.checkAppVersion();
    });
  }

  stateChanged(state: RootState) {
    this.setCurrentLanguage(state);

    if (state.userProfile.profile && !isJsonStrMatch(this.profile, state.userProfile.profile)) {
      this.profile = state.userProfile.profile;
    }

    if (this.selectedLanguage !== state.activeLanguage.activeLanguage) {
      this.selectedLanguage = state.activeLanguage.activeLanguage;
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

  setCurrentLanguage(state: RootState) {
    let currentLanguage = localStorage.getItem('defaultLanguage');

    if (!state.activeLanguage.activeLanguage) {
      if (!currentLanguage) {
        currentLanguage = navigator.language.split('-')[0];
      }

      if (!currentLanguage) {
        currentLanguage = 'en';
      }

      store.dispatch(setActiveLanguage(currentLanguage));
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

  checkAppVersion() {
    fetch('version.json')
      .then((res) => res.json())
      .then((version) => {
        if (version.revision != document.getElementById('buildRevNo')!.innerText) {
          console.log('version.json', version.revision);
          console.log('buildRevNo ', document.getElementById('buildRevNo')!.innerText);
          this._showConfirmNewVersionDialog();
        }
      });
  }

  private async _showConfirmNewVersionDialog() {
    // COMMENT THIS TO OUT TO REMOVE CONFIRMATION DIALOG FOR REFRESH APP
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('A_NEW_VERSION_OF_THE_APP_IS_AV'),
        confirmBtnText: translate('YES')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      if (navigator.serviceWorker) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
          location.reload();
        });
      }
    }
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
    sendRequest({
      method: 'POST',
      endpoint: {url: this.signoutUrl}
    })
      .then((_resp: any) => {
        store.dispatch(resetToken());
        this._goToLanding();
        store.dispatch(reset());
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  connectedCallback() {
    super.connectedCallback();
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
