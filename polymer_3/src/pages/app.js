var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-toast/paper-toast';
import '../elements/etools-prp-workspaces';
import '../etools-prp-common/elements/etools-prp-ajax';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import Endpoints from '../endpoints';
import { fetchWorkspaces, setWorkspace, fetchUserProfile, setApp } from '../redux/actions';
import { fetchCurrencies } from '../redux/actions/currencies';
import '../pages/app/ip-reporting';
import { locationSet } from '../redux/actions/location';
import { getDomainByEnv } from '../etools-prp-common/config';
// import {reset} from '../redux/actions';  (dci) TODO check use of reset
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageApp extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.interventionsUrl = Endpoints.interventions();
        this.profileUrl = Endpoints.userProfile();
        this.currenciesUrl = Endpoints.currencies();
    }
    static get template() {
        return html `
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

      <paper-toast id="changes-saved" text="[[localize('changes_saved')]]" duration="3000"> </paper-toast>

      <paper-toast id="server-error" text="[[localize('an_error_occurred')]]" duration="3000"> </paper-toast>

      <paper-toast id="file-uploaded" text="[[localize('file_uploaded')]]" duration="3000"> </paper-toast>

      <paper-toast id="file-deleted" text="[[localize('file_deleted')]]" duration="3000"> </paper-toast>

      <paper-toast id="ocha-timeout" text="[[localize('request_ocha_timed_out')]]" duration="3000"> </paper-toast>

      <paper-toast id="message-sent" text="[[localize('message_sent')]]" duration="3000"> </paper-toast>

      <paper-toast id="error-message" duration="5000"> </paper-toast>
    `;
    }
    static get observers() {
        return [
            '_routeWorkspaceChanged(routeData.workspace_code, workspaces)',
            '_routeAppChanged(routeData.app)',
            '_handleWorkspaceChange(currentWorkspace, workspaces)'
        ];
    }
    _redirectToWorkspace(workspace) {
        const code = workspace.code;
        this.set('route.path', '/' + code + '/');
        // this.set('routeData.workspace_code', code);
    }
    _redirectToApp(app) {
        this.set('route.path', `/${this.routeData.workspace_code}/${app}`);
    }
    _handleWorkspacesAsync(e) {
        const change = e.detail;
        try {
            if (change.value.length) {
                this.$.workspaces.removeEventListener('all-changed', this._handleWorkspacesAsync);
                const workspace = change.value[0];
                this._redirectToWorkspace(workspace);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    _routeWorkspaceChanged(workspaceCodeFromUrl) {
        if (!workspaceCodeFromUrl) {
            // this.reduxStore.dispatch(reset()); // Switch workspace === wipe all the data
            if (this.workspaces && this.workspaces.length) {
                // Default to first
                this._redirectToWorkspace(this.workspaces[0]);
            }
            else {
                // Wait until workspaces are available, then pick one & redirect
                // this._handleWorkspacesAsync = this._handleWorkspacesAsync.bind(this);
                // this.$.workspaces.addEventListener('all-changed', this._handleWorkspacesAsync as any);
            }
        }
        else if (!this._workspaceCode) {
            this.reduxStore.dispatch(setWorkspace(workspaceCodeFromUrl));
        }
    }
    _routeAppChanged(app) {
        setTimeout(() => {
            const defaultApp = 'ip-reporting';
            if (!this.routeData.workspace_code) {
                return;
            }
            if (!app) {
                this._redirectToApp(defaultApp);
            }
            else if (!this._app) {
                this.reduxStore.dispatch(setApp(app));
                this._fetchCurrencies(app);
                // Render
                this.page = app;
            }
        });
    }
    cleanUpStorageVal(val) {
        if (val.indexOf('"') === 0 && val.lastIndexOf('"') === val.length - 1) {
            return val.slice(1, val.length - 1);
        }
        return val;
    }
    _computeUserHasPrpRolesOrAccess(prpRoles, access) {
        return !!prpRoles.length || !!access.length;
    }
    _pageChanged(page) {
        if (page === 'pages') {
            return;
        }
        const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/${page}.js`;
        import(resolvedPageUrl).catch((err) => {
            console.log(err);
            this._notFound();
        });
    }
    _notFound() {
        window.location.href = '/not-found';
    }
    _handleWorkspaceChange(currentWorkspace, workspaces) {
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
    _notify(e) {
        e.stopPropagation();
        const options = e.detail;
        try {
            if (options.text) {
                this.$[options.type].text = options.text;
            }
            this.$[options.type].open();
            // eslint-disable-next-line no-empty
        }
        catch (err) { }
    }
    _fetchProfile() {
        const userProfileThunk = this.$.userProfile.thunk();
        return this.reduxStore.dispatch(fetchUserProfile(userProfileThunk));
    }
    _fetchCurrencies(app) {
        if (this.page !== app && app === 'ip-reporting') {
            const currenciesDataThunk = this.$.currenciesData.thunk();
            this.reduxStore.dispatch(fetchCurrencies(currenciesDataThunk));
        }
    }
    _addEventListeners() {
        this._notify = this._notify.bind(this);
        this.addEventListener('notify', this._notify);
        this._fetchProfile = this._fetchProfile.bind(this);
        this.addEventListener('fetch-profile', this._fetchProfile);
    }
    _removeEventListeners() {
        this.removeEventListener('notify', this._notify);
        this.removeEventListener('fetch-profile', this._fetchProfile);
    }
    async connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
        const interventionsThunk = this.$.interventions.thunk();
        await Promise.all([this.reduxStore.dispatch(fetchWorkspaces(interventionsThunk)), this._fetchProfile()]).catch((_err) => {
            window.location.href = '/landing';
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: Object })
], PageApp.prototype, "route", void 0);
__decorate([
    property({ type: Object })
], PageApp.prototype, "routeData", void 0);
__decorate([
    property({ type: String, observer: '_pageChanged' })
], PageApp.prototype, "page", void 0);
__decorate([
    property({ type: String })
], PageApp.prototype, "interventionsUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.workspaces.current)' })
], PageApp.prototype, "_workspaceCode", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], PageApp.prototype, "_app", void 0);
__decorate([
    property({ type: String })
], PageApp.prototype, "profileUrl", void 0);
__decorate([
    property({ type: String })
], PageApp.prototype, "currenciesUrl", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.prp_roles)' })
], PageApp.prototype, "prpRoles", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.access)' })
], PageApp.prototype, "access", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)' })
], PageApp.prototype, "workspaces", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeUserHasPrpRolesOrAccess(prpRoles, access)' })
], PageApp.prototype, "userHasPrpRolesOrAccess", void 0);
__decorate([
    property({ type: String })
], PageApp.prototype, "locationId", void 0);
window.customElements.define('page-app', PageApp);
