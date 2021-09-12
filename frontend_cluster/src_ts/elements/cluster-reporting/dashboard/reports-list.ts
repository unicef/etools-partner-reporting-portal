import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import Constants from '../../../etools-prp-common/constants';
import {ConfirmBoxEl} from '../../../etools-prp-common/elements/confirm-box';
import '../../../etools-prp-common/elements/list-placeholder';
import '../../cluster-reporting/cluster-report';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 */
class ReportsList extends ReduxConnectedElement {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        etools-content-panel::part(ecp-content) {
          min-height: 110px;
          padding: 1px 0 0;
        }

        cluster-report:not(:last-of-type) {
          margin-bottom: 2px;
        }
      </style>

      <confirm-box id="confirm"></confirm-box>

      <etools-content-panel panel-title="[[label]]">
        <template is="dom-if" if="[[active]]" restamp="true">
          <template is="dom-repeat" items="[[data]]">
            <cluster-report data="[[item]]" mode="edit"> </cluster-report>
          </template>
        </template>

        <list-placeholder data="[[data]]" loading="[[loading]]"> </list-placeholder>

        <etools-loading active="[[loading]]"></etools-loading>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  label!: string;

  @property({type: String})
  collection!: string;

  @property({type: Boolean})
  active = false;

  @property({type: Object, computed: 'getReduxStateObject(rootState.clusterDashboardData.data)'})
  dashboardData!: GenericObject;

  @property({type: Array, computed: '_computeData(dashboardData, collection)', observer: '_refresh'})
  data!: any[];

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)'})
  loading!: boolean;

  @property({type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)'})
  profile!: GenericObject;

  @property({type: Boolean, computed: '_computeIsIMOClusters(profile)'})
  isIMO!: boolean;

  _refresh() {
    // Force re-render:
    this.set('active', false);

    setTimeout(() => {
      this.set('active', true);
    });
  }

  _computeData(dashboardData: any, collection: any) {
    if (dashboardData) {
      return dashboardData[collection];
    }
  }

  _computeIsIMOClusters(profile: GenericObject) {
    return profile.prp_roles
      ? profile.prp_roles.some(function (role: any) {
          return role.role === Constants.PRP_ROLE.CLUSTER_IMO;
        })
      : false;
  }

  _onConfirm(e: CustomEvent) {
    e.stopPropagation();
    const result = e.detail;
    if (!this.isIMO) {
      (this.$.confirm as ConfirmBoxEl).run({
        body:
          'The IMO will be informed of this submission and you will ' +
          'not be able to make any changes on this report unless it ' +
          'is sent back to you. Are you sure you’d like to Submit this report?',
        result: result,
        maxWidth: '500px',
        mode: Constants.CONFIRM_MODAL
      });
    } else if (this.isIMO) {
      (this.$.confirm as ConfirmBoxEl).run({
        body: 'Are you sure you’d like to Submit this report?',
        result: result,
        maxWidth: '500px',
        mode: Constants.CONFIRM_MODAL
      });
    }
  }

  _addEventListeners() {
    this._onConfirm = this._onConfirm.bind(this);
    this.addEventListener('report-submit-confirm', this._onConfirm as any);
  }

  _removeEventListeners() {
    this.removeEventListener('report-submit-confirm', this._onConfirm as any);
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

window.customElements.define('reports-list', ReportsList);

export {ReportsList as ReportsListEl};
