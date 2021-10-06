var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import Constants from '../../../constants';
import '../../list-placeholder';
import '../../cluster-reporting/cluster-report';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 */
class ReportsList extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this.active = false;
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;

        --ecp-content: {
          min-height: 110px;
          padding: 1px 0 0;
        };
      }

      cluster-report:not(:last-of-type) {
        margin-bottom: 2px;
      }
    </style>

    <confirm-box id="confirm"></confirm-box>

    <etools-content-panel panel-title="[[label]]">
      <template
        is="dom-if"
        if="[[active]]"
        restamp="true">
        <template
          is="dom-repeat"
          items="[[data]]">
          <cluster-report
            data="[[item]]"
            mode="edit">
          </cluster-report>
        </template>
      </template>

      <list-placeholder
        data="[[data]]"
        loading="[[loading]]">
      </list-placeholder>

      <etools-loading active="[[loading]]"></etools-loading>
    </etools-content-panel>
    `;
    }
    _refresh() {
        // Force re-render:
        this.set('active', false);
        setTimeout(() => {
            this.set('active', true);
        });
    }
    _computeData(dashboardData, collection) {
        if (dashboardData) {
            return dashboardData[collection];
        }
    }
    _computeIsIMOClusters(profile) {
        return profile.prp_roles ? profile.prp_roles.some(function (role) {
            return role.role === Constants.PRP_ROLE.CLUSTER_IMO;
        }) : false;
    }
    _onConfirm(e) {
        e.stopPropagation();
        const result = e.detail;
        if (!this.isIMO) {
            this.$.confirm.run({
                body: 'The IMO will be informed of this submission and you will ' +
                    'not be able to make any changes on this report unless it ' +
                    'is sent back to you. Are you sure you’d like to Submit this report?',
                result: result,
                maxWidth: '500px',
                mode: Constants.CONFIRM_MODAL
            });
        }
        else if (this.isIMO) {
            this.$.confirm.run({
                body: 'Are you sure you’d like to Submit this report?',
                result: result,
                maxWidth: '500px',
                mode: Constants.CONFIRM_MODAL
            });
        }
    }
    _addEventListeners() {
        this._onConfirm = this._onConfirm.bind(this);
        this.addEventListener('report-submit-confirm', this._onConfirm);
    }
    _removeEventListeners() {
        this.removeEventListener('report-submit-confirm', this._onConfirm);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], ReportsList.prototype, "label", void 0);
__decorate([
    property({ type: String })
], ReportsList.prototype, "collection", void 0);
__decorate([
    property({ type: Boolean })
], ReportsList.prototype, "active", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.clusterDashboardData.data)' })
], ReportsList.prototype, "dashboardData", void 0);
__decorate([
    property({ type: Array, computed: '_computeData(dashboardData, collection)', observer: '_refresh' })
], ReportsList.prototype, "data", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)' })
], ReportsList.prototype, "loading", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)' })
], ReportsList.prototype, "profile", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsIMOClusters(profile)' })
], ReportsList.prototype, "isIMO", void 0);
window.customElements.define('reports-list', ReportsList);
export { ReportsList as ReportsListEl };
