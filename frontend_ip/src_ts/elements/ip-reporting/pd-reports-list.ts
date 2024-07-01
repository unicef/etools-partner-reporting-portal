import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-loading/etools-loading';
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
import {
  programmeDocumentReportsAll,
  programmeDocumentReportsCount
} from '../../redux/selectors/programmeDocumentReports';
import {getLink} from './js/pd-reports-list-functions';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import {RootState} from '../../typings/redux.types';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';

@customElement('pd-reports-list')
export class PdReportsList extends LocalizeMixin(
  ProgressReportUtilsMixin(RoutingMixin(UtilsMixin(PaginationMixin(DataTableMixin(connect(store)(LitElement))))))
) {
  static styles = [
    css`
      :host {
        display: block;
      }
      etools-content-panel::part(ecp-content) {
        padding: 0;
      }
    `
  ];

  @property({type: Boolean})
  loaded = false;

  @property({type: Object})
  filters: any = {};

  @property({type: Object})
  permissions: any = {};

  @property({type: String})
  pdId!: string;

  @property({type: Array})
  data: any[] = [];

  @property({type: Number})
  totalResults = 0;

  stateChanged(state: RootState) {
    if (this.pdId !== state.programmeDocuments?.current) {
      this.pdId = state.programmeDocuments?.current;
    }

    this.data = programmeDocumentReportsAll(state);
    this.totalResults = programmeDocumentReportsCount(state);
  }

  _getLink(report: any, permissions: any) {
    const suffix = this._getMode(report, permissions);
    return getLink(report, suffix, this.buildUrl, this._baseUrl);
  }

  render() {
    return html`
      ${tableStyles}

      <etools-prp-permissions .permissions=${this.permissions}></etools-prp-permissions>
      <iron-location .query=${this.query}></iron-location>
      <iron-query-params .paramsString=${this.query} .paramsObject=${this.queryParams}></iron-query-params>

      <etools-content-panel panel-title="${this.localize('list_of_reports')}">
        <etools-data-table-header
          no-collapse
          label="${this.visibleRange[0]}-${this.visibleRange[1]} of ${this.totalResults} ${this.localize(
            'results_to_show'
          )}"
        >
          <etools-data-table-column>
            <div class="table-column">${this.localize('report_number')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable>
            <div class="table-column">${this.localize('report_status')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="due_date" sortable>
            <div class="table-column">${this.localize('due_date')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="date_of_submission" sortable>
            <div class="table-column">${this.localize('date_of_submission')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="reporting_period" sortable>
            <div class="table-column">${this.localize('reporting_period')}</div>
          </etools-data-table-column>
        </etools-data-table-header>

        <etools-data-table-footer
          .pageSize=${this.pageSize}
          .pageNumber=${this.pageNumber}
          .totalResults=${this.totalResults}
          .visibleRange=${this.visibleRange}
          @page-size-changed=${this._pageSizeChanged}
          @page-number-changed=${this._pageNumberChanged}
        ></etools-data-table-footer>

        ${(this.data || []).map(
          (report: any) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell table-cell--text cell-reports">
                  <pd-reports-report-title .displayLink=${true} .report=${report}></pd-reports-report-title>
                </div>
                <div class="table-cell table-cell--text">
                  <report-status .status=${report.status} .reportType=${report.report_type}></report-status>
                </div>
                <div class="table-cell table-cell--text">${this._withDefault(report.due_date, '-')}</div>
                <div class="table-cell table-cell--text">${this._withDefault(report.submission_date)}</div>
                <div class="table-cell table-cell--text">${this._withDefault(report.reporting_period)}</div>
              </div>
            </etools-data-table-row>
          `
        )}

        <list-placeholder .data=${this.data} .loading=${!this.loaded}></list-placeholder>

        <etools-data-table-footer
          .pageSize=${this.pageSize}
          .pageNumber=${this.pageNumber}
          .totalResults=${this.totalResults}
          .visibleRange=${this.visibleRange}
          @page-size-changed=${this._pageSizeChanged}
          @page-number-changed=${this._pageNumberChanged}
        ></etools-data-table-footer>

        <etools-loading .active=${!this.loaded}></etools-loading>
      </etools-content-panel>
    `;
  }
}

export {PdReportsList as PdReportsListEl};
