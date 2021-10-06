var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import './cluster-report-toolbar';
import './cluster-report-list';
import '../etools-prp-ajax';
import { property } from '@polymer/decorators/lib/decorators';
import { clusterIndicatorReportsFetch, clusterIndicatorReportsFetchSingle } from '../../redux/actions/clusterIndicatorReports';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ClusterReports extends UtilsMixin(ReduxConnectedElement) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location
          query="{{query}}">
      </iron-location>

      <iron-query-params
          params-string="{{query}}"
          params-object="{{queryParams}}">
      </iron-query-params>

      <etools-prp-ajax
          id="reports"
          url="[[reportsUrl]]"
          params="[[params]]">
      </etools-prp-ajax>

      <etools-prp-ajax
          id="refresh">
      </etools-prp-ajax>

      <cluster-report-toolbar
          submitted="[[submitted]]">
      </cluster-report-toolbar>

      <cluster-report-list mode="[[mode]]"></cluster-report-list>
    `;
    }
    static get observers() {
        return ['_onParamsChanged(reportsUrl, params)'];
    }
    _computeParams(queryParams) {
        return Object.assign({}, queryParams, {
            submitted: this.submitted + ''
        });
    }
    _computeReportsUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterIndicatorReports(responsePlanId);
    }
    _fetchData(reset) {
        if (!this.reportsUrl) {
            return;
        }
        const reportsThunk = this.$.reports.thunk();
        this.$.reports.abort();
        this.reduxStore.dispatch(clusterIndicatorReportsFetch(reportsThunk, reset))
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _onParamsChanged() {
        const self = this;
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(100), () => {
            self._fetchData();
        });
    }
    _onContentsChanged(e) {
        e.stopPropagation();
        this._fetchData();
    }
    _onRefreshReport(e) {
        e.stopPropagation();
        const reportId = e.detail;
        const refreshAjaxEl = this.$.refresh;
        refreshAjaxEl.url = Endpoints.clusterIndicatorReport(this.responsePlanId, reportId);
        const refreshThunk = refreshAjaxEl.thunk();
        refreshAjaxEl.abort();
        this.reduxStore.dispatch(clusterIndicatorReportsFetchSingle(refreshThunk, reportId))
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _onTemplateFileUploaded(e) {
        e.stopPropagation();
        this._fetchData(true);
    }
    _addEventListeners() {
        this._onContentsChanged = this._onContentsChanged.bind(this);
        this.addEventListener('report-submitted', this._onContentsChanged);
        this.addEventListener('report-reviewed', this._onContentsChanged);
        this._onTemplateFileUploaded = this._onTemplateFileUploaded.bind(this);
        this.addEventListener('template-file-uploaded', this._onTemplateFileUploaded);
        this._onRefreshReport = this._onRefreshReport.bind(this);
        this.addEventListener('refresh-report', this._onRefreshReport);
    }
    _removeEventListeners() {
        this.removeEventListener('report-submitted', this._onContentsChanged);
        this.removeEventListener('report-reviewed', this._onContentsChanged);
        this.removeEventListener('template-file-uploaded', this._onTemplateFileUploaded);
        this.removeEventListener('refresh-report', this._onRefreshReport);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.reports.abort();
        this._removeEventListeners();
        if (this._debouncer && this._debouncer.isActive()) {
            this._debouncer.cancel();
        }
    }
}
__decorate([
    property({ type: String })
], ClusterReports.prototype, "mode", void 0);
__decorate([
    property({ type: Number })
], ClusterReports.prototype, "submitted", void 0);
__decorate([
    property({ type: Object })
], ClusterReports.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterReports.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_computeReportsUrl(responsePlanId)' })
], ClusterReports.prototype, "reportsUrl", void 0);
__decorate([
    property({ type: Object, computed: '_computeParams(queryParams)' })
], ClusterReports.prototype, "params", void 0);
window.customElements.define('cluster-reports', ClusterReports);
