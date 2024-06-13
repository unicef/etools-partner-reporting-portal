import {ReduxConnectedElement} from '../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-toast/paper-toast';

import '../elements/etools-prp-workspaces';
import '../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../etools-prp-common/elements/etools-prp-ajax';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import Endpoints from '../endpoints';
import {setWorkspace, fetchUserProfile, setApp} from '../redux/actions';
import {fetchCurrencies} from '../redux/actions/currencies';
import {GenericObject, Route} from '../etools-prp-common/typings/globals.types';
import '../pages/app/ip-reporting';
import {locationSet} from '../redux/actions/location';
import {getDomainByEnv} from '../etools-prp-common/config';
import '@unicef-polymer/etools-toasts';
// import {reset} from '../redux/actions';  (dci) TODO check use of reset

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageApp extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      <style>
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
      </style>

      <etools-prp-workspaces id="workspaces" all="{{workspaces}}" current="{{currentWorkspace}}">
      </etools-prp-workspaces>

      <etools-prp-ajax id="userProfile" url="[[profileUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="currenciesData" url="[[currenciesUrl]]"> </etools-prp-ajax>

      <app-route route="{{route}}" pattern="/:workspace_code/:app" data="{{routeData}}" tail="{{subroute}}">
      </app-route>

      <template is="dom-if" if="[[!userHasPrpRolesOrAccess]]">
        <div class="no-groups-notification">
          <h3>[[localize('account_created')]]</h3>
          <p>[[localize('please_wait_business_days')]]</p>
        </div>
      </template>

      <iron-pages selected="[[page]]" attr-for-selected="name">
        <template is="dom-if" if="[[_equals(page, 'ip-reporting')]]" restamp="true">
          <page-ip-reporting name="ip-reporting" route="{{subroute}}"> </page-ip-reporting>
        </template>
      </iron-pages>

      <etools-toasts></etools-toasts>
    `;
  }

  @property({type: Object})
  route!: Route;

  @property({type: Object})
  routeData!: {workspace_code: string; app: string};

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
  _workspaceCode!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.localize.language)'})
  _language!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  _app!: string;

  @property({type: String})
  profileUrl: string = Endpoints.userProfile();

  @property({type: String})
  currenciesUrl: string = Endpoints.currencies();

  @property({type: String, computed: 'getReduxStateValue(rootState.userProfile.profile.partner)'})
  userPartner!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.prp_roles)'})
  prpRoles!: any[];

  @property({type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.access)'})
  access!: [];

  @property({type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)'})
  workspaces!: any[];

  @property({type: Boolean, computed: '_computeUserHasPrpRolesOrAccess(prpRoles, access, userPartner)'})
  userHasPrpRolesOrAccess!: boolean;

  @property({type: String})
  locationId!: string;

  public static get observers() {
    return [
      '_routeWorkspaceChanged(routeData.workspace_code, workspaces)',
      '_routeAppChanged(routeData.app)',
      '_handleWorkspaceChange(currentWorkspace, workspaces)',
      '_languageChanged(language)'
    ];
  }

  _redirectToWorkspace(workspace_code: string) {
    this.set('route.path', `/${workspace_code}/`);
  }

  _redirectToApp(app: string) {
    this.set('route.path', `/${this.routeData.workspace_code}/${app}`);
  }

  _handleWorkspacesAsync(e: CustomEvent) {
    const change = e.detail;
    try {
      if (change.value.length) {
        this.$.workspaces.removeEventListener('all-changed', this._handleWorkspacesAsync as any);
        const workspace = change.value[0];
        this._redirectToWorkspace(workspace);
      }
    } catch (err) {
      console.log(err);
    }
  }

  _routeWorkspaceChanged(workspaceCodeFromUrl: any) {
    if (!workspaceCodeFromUrl) {
      // this.reduxStore.dispatch(reset()); // Switch workspace === wipe all the data
      if ((this.workspaces && this.workspaces.length) || this._workspaceCode) {
        // Default to first
        this._redirectToWorkspace(this._workspaceCode ? this._workspaceCode : this.workspaces[0].code);
      } else {
        // Wait until workspaces are available, then pick one & redirect
        // this._handleWorkspacesAsync = this._handleWorkspacesAsync.bind(this);
        // this.$.workspaces.addEventListener('all-changed', this._handleWorkspacesAsync as any);
      }
    } else if (!this._workspaceCode) {
      this.reduxStore.dispatch(setWorkspace(workspaceCodeFromUrl));
    }
  }

  _routeAppChanged(app: string) {
    setTimeout(() => {
      const defaultApp = 'ip-reporting';
      if (!this.routeData.workspace_code) {
        return;
      }
      if (!app) {
        this._redirectToApp(defaultApp!);
      } else if (!this._app) {
        this.reduxStore.dispatch(setApp(app));

        this._fetchCurrencies(app);

        // Render
        this.page = app;
      }
    });
  }

  _languageChanged(_language: string) {
    this.setHtmlDirAttribute();
  }

  setHtmlDirAttribute() {
    setTimeout(() => {
      if (this.language) {
        const htmlTag = document.querySelector('html');
        if (this.language === 'ar') {
          htmlTag!.setAttribute('dir', 'rtl');
        } else if (htmlTag!.getAttribute('dir')) {
          htmlTag!.removeAttribute('dir');
        }
      }
    }, 300);
  }

  cleanUpStorageVal(val: string) {
    if (val.indexOf('"') === 0 && val.lastIndexOf('"') === val.length - 1) {
      return val.slice(1, val.length - 1);
    }
    return val;
  }

  _computeUserHasPrpRolesOrAccess(prpRoles: any[], access: any[], userPartner: GenericObject) {
    return userPartner ? !!prpRoles.length || !!access.length : true;
  }

  _pageChanged(page: string) {
    if (page === 'pages') {
      return;
    }
    const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/${page}.js`;
    import(resolvedPageUrl).catch((err: any) => {
      console.log(err);
      this._notFound();
    });
  }

  _notFound() {
    window.location.href = '/not-found';
  }

  _handleWorkspaceChange(currentWorkspace: string, workspaces: any[]) {
    if (!currentWorkspace || !workspaces || !workspaces.length) {
      return;
    }

    const currentWorkspaceData = workspaces.filter((workspace) => {
      return workspace.code === currentWorkspace;
    });

    if (!currentWorkspaceData.length) {
      return;
    }
    const workspaceId = currentWorkspaceData[0].id;

    if (this.locationId !== workspaceId) {
      this.locationId = workspaceId;
      this.reduxStore.dispatch(locationSet(workspaceId));
    }
  }

  _fetchProfile() {
    const userProfileThunk = (this.$.userProfile as EtoolsPrpAjaxEl).thunk();
    return this.reduxStore.dispatch(fetchUserProfile(userProfileThunk));
  }

  _fetchCurrencies(app: string) {
    if (this.page !== app && app === 'ip-reporting') {
      const currenciesDataThunk = (this.$.currenciesData as EtoolsPrpAjaxEl).thunk();
      this.reduxStore.dispatch(fetchCurrencies(currenciesDataThunk));
    }
  }

  _addEventListeners() {
    this._fetchProfile = this._fetchProfile.bind(this);
    this.addEventListener('fetch-profile', this._fetchProfile);
  }

  _removeEventListeners() {
    this.removeEventListener('fetch-profile', this._fetchProfile);
  }

  async connectedCallback() {
    super.connectedCallback();

    this._addEventListeners();
    await Promise.all([this._fetchProfile()]).catch((_err: GenericObject) => {
      window.location.href = '/landing';
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
}

window.customElements.define('page-app', PageApp);
