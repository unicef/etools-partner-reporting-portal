var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import Constants from '../../constants';
import UtilsMixin from '../../mixins/utils-mixin';
import PaginationMixin from '../../mixins/pagination-mixin';
import DataTableMixin from '../../mixins/data-table-mixin';
import '../confirm-box';
import '../list-placeholder';
import './cluster-report-proxy';
import { clusterIndicatorsReportsAll } from '../../redux/selectors/clusterIndicatorReports';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin DataTableMixin
 */
class ClusterReportList extends DataTableMixin(PaginationMixin(UtilsMixin(ReduxConnectedElement))) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;

          --list-bg-color: transparent;
          --list-divider-color: transparent;
        }

        .wrapper {
          min-height: 120px;
          position: relative;
        }

        etools-data-table-row {
          display: block;
        }

        etools-data-table-row:not(:last-of-type) {
          margin-bottom: 2px;
        }
      </style>

      <iron-location
        query="{{query}}">
      </iron-location>

      <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
      </iron-query-params>

      <etools-data-table-footer
        page-size="[[pageSize]]"
        page-number="[[pageNumber]]"
        total-results="[[totalResults]]"
        on-page-size-changed="_pageSizeChanged"
        on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <div class="wrapper">
        <template
          is="dom-repeat"
          items="[[data]]"
          initial-count="[[pageSize]]">
          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <cluster-report-proxy
                data="[[item]]"
                mode="[[mode]]">
              </cluster-report-proxy>
            </div>
          </etools-data-table-row>
        </template>

        <list-placeholder
          data="[[data]]"
          loading="[[loading]]">
        </list-placeholder>

        <etools-loading active="[[loading]]"></etools-loading>
      </div>

      <etools-data-table-footer
        page-size="[[pageSize]]"
        page-number="[[pageNumber]]"
        total-results="[[totalResults]]"
        on-page-size-changed="_pageSizeChanged"
        on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <confirm-box id="confirm"></confirm-box>
    `;
    }
    _clusterIndicatorsReportsAll(rootState) {
        if (rootState) {
            return clusterIndicatorsReportsAll(rootState);
        }
    }
    _computeIsIMOClusters(profile) {
        return profile.prp_roles ? profile.prp_roles.some((role) => {
            return role.role === Constants.PRP_ROLE.CLUSTER_IMO;
        }) : [];
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
    _onContentsChanged(e) {
        const tail = this.totalResults % this.pageSize;
        const last = Math.ceil(this.totalResults / this.pageSize);
        if (tail === 1 && last !== 1 && this.pageNumber === last) {
            e.stopPropagation();
            this.set('queryParams.page', this.pageNumber - 1);
        }
        else {
            // Let the parent component handle the event
        }
    }
    _addEventListeners() {
        this._onConfirm = this._onConfirm.bind(this);
        this.addEventListener('report-submit-confirm', this._onConfirm);
        this._onContentsChanged = this._onContentsChanged.bind(this);
        this.addEventListener('report-submitted', this._onContentsChanged);
        this.addEventListener('report-reviewed', this._onContentsChanged);
    }
    _removeEventListeners() {
        this.removeEventListener('report-submit-confirm', this._onConfirm);
        this.removeEventListener('report-submitted', this._onContentsChanged);
        this.removeEventListener('report-reviewed', this._onContentsChanged);
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
], ClusterReportList.prototype, "query", void 0);
__decorate([
    property({ type: String })
], ClusterReportList.prototype, "mode", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterIndicatorReports.loading)' })
], ClusterReportList.prototype, "loading", void 0);
__decorate([
    property({ type: Array, computed: '_clusterIndicatorsReportsAll(rootState)' })
], ClusterReportList.prototype, "data", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterIndicatorReports.count)' })
], ClusterReportList.prototype, "totalResults", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)' })
], ClusterReportList.prototype, "profile", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsIMOClusters(profile)' })
], ClusterReportList.prototype, "isIMO", void 0);
window.customElements.define('cluster-report-list', ClusterReportList);
