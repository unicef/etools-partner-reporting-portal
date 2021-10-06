var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-loading/etools-loading.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/list-placeholder';
import '../../etools-prp-common/elements/etools-prp-permissions';
import './pd-reports-report-title';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import PaginationMixin from '../../etools-prp-common/mixins/pagination-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import { programmeDocumentReportsAll, programmeDocumentReportsCount } from '../../redux/selectors/programmeDocumentReports';
import { getLink } from './js/pd-reports-list-functions';
import { tableStyles } from '../../etools-prp-common/styles/table-styles';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin ProgressReportUtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportsList extends LocalizeMixin(ProgressReportUtilsMixin(RoutingMixin(UtilsMixin(PaginationMixin(DataTableMixin(ReduxConnectedElement)))))) {
    static get template() {
        return html `
      ${tableStyles}
      <style include="data-table-styles">
        :host {
          display: block;
        }
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-content-panel panel-title="[[localize('list_of_reports')]]">
        <etools-data-table-header
          no-collapse
          label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]"
        >
          <etools-data-table-column>
            <div class="table-column">[[localize('report_number')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable>
            <div class="table-column">[[localize('report_status')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="due_date" sortable>
            <div class="table-column">[[localize('due_date')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="date_of_submission" sortable>
            <div class="table-column">[[localize('date_of_submission')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="reporting_period" sortable>
            <div class="table-column">[[localize('reporting_period')]]</div>
          </etools-data-table-column>
        </etools-data-table-header>

        <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged"
        >
        </etools-data-table-footer>

        <template id="list" is="dom-repeat" items="[[data]]" as="report" initial-count="[[pageSize]]">
          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <div class="table-cell table-cell--text cell-reports">
                <pd-reports-report-title display-link report="[[report]]"></pd-reports-report-title>
              </div>
              <div class="table-cell table-cell--text">
                <report-status status="[[report.status]]" report-type="[[report.report_type]]"> </report-status>
              </div>
              <div class="table-cell table-cell--text">[[_withDefault(report.due_date, '-')]]</div>
              <div class="table-cell table-cell--text">[[_withDefault(report.submission_date)]]</div>
              <div class="table-cell table-cell--text">[[_withDefault(report.reporting_period)]]</div>
            </div>
          </etools-data-table-row>
        </template>

        <list-placeholder data="[[data]]" loading="[[!loaded]]"> </list-placeholder>

        <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged"
        >
        </etools-data-table-footer>

        <etools-loading active="[[!loaded]]"></etools-loading>
      </etools-content-panel>
    `;
    }
    _getLink(report, permissions) {
        const suffix = this._getMode(report, permissions);
        return getLink(report, suffix, this.buildUrl, this._baseUrl);
    }
    _programmeDocumentReportsAll(rootState) {
        return programmeDocumentReportsAll(rootState);
    }
    _programmeDocumentReportsCount(rootState) {
        return programmeDocumentReportsCount(rootState);
    }
}
__decorate([
    property({ type: Boolean })
], PdReportsList.prototype, "loaded", void 0);
__decorate([
    property({ type: Object, notify: true })
], PdReportsList.prototype, "filters", void 0);
__decorate([
    property({ type: Object })
], PdReportsList.prototype, "permissions", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)' })
], PdReportsList.prototype, "pdId", void 0);
__decorate([
    property({ type: Array, computed: '_programmeDocumentReportsAll(rootState)' })
], PdReportsList.prototype, "data", void 0);
__decorate([
    property({ type: Number, computed: '_programmeDocumentReportsCount(rootState)' })
], PdReportsList.prototype, "totalResults", void 0);
window.customElements.define('pd-reports-list', PdReportsList);
export { PdReportsList as PdReportsListEl };
