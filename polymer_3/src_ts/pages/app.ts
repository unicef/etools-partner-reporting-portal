import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-toast/paper-toast';

import '../elements/etools-prp-workspaces';
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../elements/etools-prp-ajax';
import LocalizeMixin from '../mixins/localize-mixin';
import UtilsMixin from '../mixins/utils-mixin';
import Endpoints from '../endpoints';
import {fetchWorkspaces, setWorkspace, fetchUserProfile, setApp} from '../redux/actions';
import {GenericObject, Route} from '../typings/globals.types';
import '../pages/app/ip-reporting';
import {locationSet} from '../redux/actions/location';
import {getDomainByEnv} from '../config';
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

      <etools-prp-ajax id="interventions" url="[[interventionsUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="userProfile" url="[[profileUrl]]"> </etools-prp-ajax>

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

        <template is="dom-if" if="[[_equals(page, 'cluster-reporting')]]" restamp="true">
          <page-cluster-reporting name="cluster-reporting" route="{{subroute}}"> </page-cluster-reporting>
        </template>
      </iron-pages>

      <paper-toast id="changes-saved" text="[[localize('changes_saved')]]" duration="3000"> </paper-toast>

      <paper-toast id="server-error" text="[[localize('an_error_occurred')]]" duration="3000"> </paper-toast>

      <paper-toast id="file-uploaded" text="[[localize('file_uploaded')]]" duration="3000"> </paper-toast>

      <paper-toast id="file-deleted" text="[[localize('file_deleted')]]" duration="3000"> </paper-toast>

      <paper-toast id="ocha-timeout" text="[[localize('request_ocha_timed_out')]]" duration="3000"> </paper-toast>

      <paper-toast id="message-sent" text="[[localize('message_sent')]]" duration="3000"> </paper-toast>

      <paper-toast id="error-message" duration="5000"> </paper-toast>
    `;
  }

  @property({type: Object})
  route!: Route;

  @property({type: Object})
  routeData!: {workspace_code: string; app: string};

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  @property({type: String})
  interventionsUrl: string = Endpoints.interventions();

  @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
  _workspaceCode!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  _app!: string;

  @property({type: String})
  profileUrl: string = Endpoints.userProfile();

  @property({type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.prp_roles)'})
  prpRoles!: any[];

  @property({type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.access)'})
  access!: [];

  @property({type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)'})
  workspaces!: any[];

  @property({type: Boolean, computed: '_computeUserHasPrpRolesOrAccess(prpRoles, access)'})
  userHasPrpRolesOrAccess!: boolean;

  @property({type: String})
  locationId!: string;

  public static get observers() {
    return [
      '_routeWorkspaceChanged(routeData.workspace_code, workspaces)',
      '_routeAppChanged(routeData.app)',
      '_handleWorkspaceChange(currentWorkspace, workspaces)'
    ];
  }

  _redirectToWorkspace(workspace: GenericObject) {
    const code = workspace.code;

    this.set('route.path', '/' + code + '/');
    // this.set('routeData.workspace_code', code);
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
      if (this.workspaces && this.workspaces.length) {
        // Default to first
        this._redirectToWorkspace(this.workspaces[0]);
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
      let defaultApp = localStorage.getItem('defaultApp');
      defaultApp = defaultApp ? this.cleanUpStorageVal(defaultApp) : 'ip-reporting';

      if (!this.routeData.workspace_code) {
        return;
      }
      if (!app) {
        this._redirectToApp(defaultApp!);
      } else if (!this._app) {
        this.reduxStore.dispatch(setApp(app));

        // Store selected app
        localStorage.setItem('defaultApp', app);

        // Render
        this.page = app;
      } else {
        localStorage.setItem('defaultApp', app);
      }
    });
  }

  cleanUpStorageVal(val: string) {
    if (val.indexOf('"') === 0 && val.lastIndexOf('"') === val.length - 1) {
      return val.slice(1, val.length - 1);
    }
    return val;
  }

  _computeUserHasPrpRolesOrAccess(prpRoles: any[], access: any[]) {
    return !!prpRoles.length || !!access.length;
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

  _notify(e: CustomEvent) {
    e.stopPropagation();
    const options = e.detail;
    try {
      if (options.text) {
        (this.$[options.type] as any).text = options.text;
      }
      (this.$[options.type] as any).open();
      // eslint-disable-next-line no-empty
    } catch (err) {}
  }

  _fetchProfile() {
    const userProfileThunk = (this.$.userProfile as EtoolsPrpAjaxEl).thunk();
    return this.reduxStore.dispatch(fetchUserProfile(userProfileThunk));
  }

  _addEventListeners() {
    this._notify = this._notify.bind(this);
    this.addEventListener('notify', this._notify as any);
    this._fetchProfile = this._fetchProfile.bind(this);
    this.addEventListener('fetch-profile', this._fetchProfile);
  }

  _removeEventListeners() {
    this.removeEventListener('notify', this._notify as any);
    this.removeEventListener('fetch-profile', this._fetchProfile);
  }

  async connectedCallback() {
    super.connectedCallback();

    this._addEventListeners();
    const interventionsThunk = (this.$.interventions as EtoolsPrpAjaxEl).thunk();
    await Promise.all([this.reduxStore.dispatch(fetchWorkspaces(interventionsThunk)), this._fetchProfile()]).catch(
      (_err: GenericObject) => {
        window.location.href = '/landing';
      }
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
}

window.customElements.define('page-app', PageApp);
