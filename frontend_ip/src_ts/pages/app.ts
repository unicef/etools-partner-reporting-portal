import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-toast/paper-toast.js';
import '@unicef-polymer/etools-toasts/src/etools-toasts.js';

import '../elements/etools-prp-workspaces.js';
import '../etools-prp-common/elements/etools-prp-ajax.js';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin.js';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin.js';
import Endpoints from '../endpoints.js';
import {setWorkspace, fetchUserProfile, setApp} from '../redux/actions.js';
import {fetchCurrencies} from '../redux/actions/currencies.js';
import {Route} from '../etools-prp-common/typings/globals.types.js';
import {locationSet} from '../redux/actions/location.js';
import {EtoolsPrpAjaxEl} from '../etools-prp-common/elements/etools-prp-ajax.js';
import {connect} from 'pwa-helpers';
import {store} from '../redux/store.js';
import {RootState} from '../typings/redux.types.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router.js';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces.js';

@customElement('page-app')
export class PageApp extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
    }

    .no-groups-notification {
      margin-top: 20%;
      width: 100%;
      text-align: center;
    }

    .no-groups-notification h3 {
      font-size: 36px;
    }

    .no-groups-notification p {
      font-size: 24px;
    }
  `;

  @property({type: Object})
  route!: Route;

  @property({type: Object})
  routeData!: {workspace_code: string; app: string};

  @property({type: String})
  page = '';

  @property({type: String})
  profileUrl = Endpoints.userProfile();

  @property({type: String})
  currenciesUrl = Endpoints.currencies();

  @property({type: String})
  userPartner = '';

  @property({type: Array})
  prpRoles: any[] = [];

  @property({type: Array})
  access: any[] = [];

  @property({type: Array})
  workspaces: any[] = [];

  @property({type: Boolean})
  userHasPrpRolesOrAccess = false;

  @property({type: String})
  locationId?: string;

  @property({type: String})
  _workspaceCode?: string;

  @property({type: String})
  _language?: string;

  @property({type: String})
  _app?: string;

  render() {
    return html`
      <etools-prp-workspaces id="workspaces" .all="${this.workspaces}" .current="${this._workspaceCode}">
      </etools-prp-workspaces>

      <etools-prp-ajax id="userProfile" .url="${this.profileUrl}"> </etools-prp-ajax>

      <etools-prp-ajax id="currenciesData" .url="${this.currenciesUrl}"> </etools-prp-ajax>

      ${!this.userHasPrpRolesOrAccess
        ? html`<div class="no-groups-notification">
            <h3>${this.localize('account_created')}</h3>
            <p>${this.localize('please_wait_business_days')}</p>
          </div>`
        : html``}

      <page-ip-reporting name="ip-reporting"> </page-ip-reporting>

      <etools-toasts></etools-toasts>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('prpRoles') || changedProperties.has('access') || changedProperties.has('userPartner')) {
      this.userHasPrpRolesOrAccess = this._computeUserHasPrpRolesOrAccess(this.prpRoles, this.access, this.userPartner);
    }

    if (changedProperties.has('language')) {
      this._languageChanged(this.language);
    }
    if (changedProperties.has('_workspaceCode') || changedProperties.has('workspaces')) {    
      this._handleWorkspaceChange(this._workspaceCode, this.workspaces);
    }
  }

  stateChanged(state: RootState) {
    if (state.app.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      this._routeAppChanged(state.app?.routeDetails);
    }

    if (this._workspaceCode !== state.workspaces.current) {
      this._workspaceCode = state.workspaces.current;
    }
    if (this._language !== state.localize.language) {
      this._language = state.localize.language;
    }
    if (this._app !== state.app.current) {
      this._app = state.app.current;
    }
    if (this.userPartner !== state.userProfile.profile?.partner) {
      this.userPartner = state.userProfile.profile?.partner;
    }
    if (this.prpRoles !== state.userProfile.profile?.prp_roles) {
      this.prpRoles = state.userProfile.profile?.prp_roles;
    }
    if (this.access !== state.userProfile.profile?.access) {
      this.access = state.userProfile.profile?.access;
    }
    if (this.workspaces !== state.workspaces?.all) {
      this.workspaces = state.workspaces?.all || [];
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
    setTimeout(async () => {
      await Promise.all([this._fetchProfile()]).catch((_err: any) => {
        window.location.href = '/landing';
      });
    }, 300);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

  _addEventListeners() {
    this._fetchProfile = this._fetchProfile.bind(this);
    this.addEventListener('fetch-profile', this._fetchProfile);
  }

  _removeEventListeners() {
    this.removeEventListener('fetch-profile', this._fetchProfile);
  }

  _redirectToWorkspace(workspace_code: string) {
    EtoolsRouter.updateAppLocation(`/ip/${workspace_code}`);
  }

  _redirectToApp(app: string) {
    EtoolsRouter.updateAppLocation(`/ip/${this._workspaceCode}/${app}`);
  }

  _handleWorkspacesAsync(e: CustomEvent) {
    const change = e.detail;
    try {
      if (change.value.length) {
        this.shadowRoot!.querySelector('#workspaces')!.removeEventListener(
          'all-changed',
          this._handleWorkspacesAsync as any
        );
        const workspace = change.value[0];
        this._redirectToWorkspace(workspace.code);
      }
    } catch (err) {
      console.log(err);
    }
  }

  _routeWorkspaceChanged(workspaceCodeFromUrl: any) {
    if (!workspaceCodeFromUrl) {
      // store.dispatch(reset()); // Switch workspace === wipe all the data
      if ((this.workspaces && this.workspaces.length) || this._workspaceCode) {
        // Default to first
        this._redirectToWorkspace(this._workspaceCode ? this._workspaceCode : this.workspaces?.[0]?.code);
      } else {
        // Wait until workspaces are available, then pick one & redirect
        // this._handleWorkspacesAsync = this._handleWorkspacesAsync.bind(this);
        // this.$.workspaces.addEventListener('all-changed', this._handleWorkspacesAsync as any);
      }
    } else if (!this._workspaceCode) {
      store.dispatch(setWorkspace(workspaceCodeFromUrl));
    }
  }

  private _routeAppChanged(routeDetails: EtoolsRouteDetails) {
    setTimeout(() => {
      const defaultApp = 'ip-reporting';
      if (!this._workspaceCode) {
        return;
      }

      if (!routeDetails.subRouteName) {
        this._redirectToApp(defaultApp);
      } else if (!this._app) {
        store.dispatch(setApp(routeDetails.subRouteName));
        this._fetchCurrencies(routeDetails.subRouteName);
        this.page = routeDetails.subRouteName;
      }
    });
  }

  private _languageChanged(_language: string) {
    this.setHtmlDirAttribute();
  }

  private setHtmlDirAttribute() {
    setTimeout(() => {
      const htmlTag = document.querySelector('html');
      if (this._language === 'ar') {
        htmlTag!.setAttribute('dir', 'rtl');
      } else if (htmlTag!.getAttribute('dir')) {
        htmlTag!.removeAttribute('dir');
      }
    }, 300);
  }

  cleanUpStorageVal(val: string) {
    if (val.indexOf('"') === 0 && val.lastIndexOf('"') === val.length - 1) {
      return val.slice(1, val.length - 1);
    }
    return val;
  }

  _computeUserHasPrpRolesOrAccess(prpRoles: any[], access: any[], userPartner: string) {
    return userPartner ? !!prpRoles.length || !!access.length : true;
  }

  _handleWorkspaceChange(currentWorkspace?: string, workspaces?: any[]) {
    if (!currentWorkspace || !workspaces || !workspaces.length) {
      return;
    }
    const currentWorkspaceData = workspaces.find((workspace) => workspace.code === currentWorkspace);

    if (!currentWorkspaceData) {
      return;
    }
    const workspaceId = currentWorkspaceData.id;

    if (this.locationId !== workspaceId) {
      this.locationId = workspaceId;
      store.dispatch(locationSet(workspaceId));
    }
  }

  private _fetchProfile() {
    const userProfileThunk = (this.shadowRoot!.getElementById('userProfile') as EtoolsPrpAjaxEl)?.thunk();
    return store.dispatch(fetchUserProfile(userProfileThunk));
  }

  private _fetchCurrencies(app: string) {
    if (this.page !== app && app === 'ip-reporting') {
      const currenciesDataThunk = (this.shadowRoot!.getElementById('currenciesData') as EtoolsPrpAjaxEl)?.thunk();
      store.dispatch(fetchCurrencies(currenciesDataThunk));
    }
  }
}
