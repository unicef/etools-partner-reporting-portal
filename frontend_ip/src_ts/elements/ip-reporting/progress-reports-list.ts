import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/paper-tooltip/paper-tooltip';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/list-placeholder';
import './pd-reports-report-title';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import PaginationMixin from '../../etools-prp-common/mixins/pagination-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import SortingMixin from '../../etools-prp-common/mixins/sorting-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import '@unicef-polymer/etools-data-table/data-table-styles';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('progress-reports-list')
export class ProgressReportsList extends LocalizeMixin(
  SortingMixin(
    ProgressReportUtilsMixin(RoutingMixin(PaginationMixin(DataTableMixin(UtilsMixin(connect(store)(LitElement))))))
  )
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
  loading!: boolean;

  @property({type: Array})
  data: any[] = [];

  @property({type: Number})
  totalResults!: number;

  @property({type: Object})
  queryParams!: any;

  @property({type: Number})
  pageSize!: number;

  @property({type: Number})
  pageNumber!: number;

  @property({type: Array})
  visibleRange = [];

  stateChanged(state: RootState) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.routeDetails, state.app.routeDetails.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.loading !== state.progressReports.loading) {
      this.loading = state.progressReports.loading;
    }

    if (state.progressReports.all && !isJsonStrMatch(this.data, state.progressReports.all)) {
      this.data = state.progressReports.all;
    }

    if (this.totalResults !== state.progressReports.count) {
      this.totalResults = state.progressReports.count;
    }
  }

  render() {
    return html`
      ${tableStyles}
      <etools-content-panel panel-title="${this.localize('list_of_reports')}">
        <etools-data-table-header
          no-collapse
          label="${this.visibleRange?.[0]}-${this.visibleRange?.[1]} of ${this.totalResults} ${this.localize(
            'results_to_show'
          )}"
        >
          <etools-data-table-column field="programme_document__reference_number" sortable>
            <div class="table-column">${this.localize('pd_ref_number')}</div>
          </etools-data-table-column>
          <etools-data-table-column>
            <div class="table-column">${this.localize('report_number')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable>
            <div class="table-column">${this.localize('report_status')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="due_date" sortable>
            <div class="table-column">${this.localize('due_date')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="submission_date" sortable>
            <div class="table-column">${this.localize('date_of_submission')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="start_date" sortable>
            <div class="table-column">${this.localize('reporting_period')}</div>
          </etools-data-table-column>
        </etools-data-table-header>
        <etools-data-table-footer
          .pageSize="${this.pageSize}"
          .pageNumber="${this.pageNumber}"
          .totalResults="${this.totalResults}"
          .visibleRange="${this.visibleRange}"
          @visible-range-changed="${(e) => (this.visibleRange = e.detail.value)}"
          @page-size-changed="${this._pageSizeChanged}"
          @page-number-changed="${this._pageNumberChanged}"
        >
        </etools-data-table-footer>
        ${(this.data || []).map(
          (report: any) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell table-cell--text">
                  <span>
                    ${this._withDefault(report.programme_document?.reference_number, '-')}
                    <paper-tooltip>${report.programme_document?.title}</paper-tooltip>
                  </span>
                </div>
                <div class="table-cell table-cell--text">
                  <pd-reports-report-title display-link display-link-icon .report="${report}"></pd-reports-report-title>
                </div>
                <div class="table-cell table-cell--text">
                  <report-status .status="${report.status}" .reportType="${report.report_type}"></report-status>
                </div>
                <div class="table-cell table-cell--text">${this._withDefault(report.due_date, '-')}</div>
                <div class="table-cell table-cell--text">${this._withDefault(report.submission_date, '-')}</div>
                <div class="table-cell table-cell--text">${this._withDefault(report.reporting_period, '-')}</div>
              </div>
            </etools-data-table-row>
          `
        )}
        <list-placeholder .data="${this.data}" .loading="${this.loading}"></list-placeholder>
        <etools-data-table-footer
          .pageSize="${this.pageSize}"
          .pageNumber="${this.pageNumber}"
          .totalResults="${this.totalResults}"
          .visibleRange="${this.visibleRange}"
          @visible-range-changed="${(e) => (this.visibleRange = e.detail.value)}"
          @page-size-changed="${this._pageSizeChanged}"
          @page-number-changed="${this._pageNumberChanged}"
        >
        </etools-data-table-footer>
        <etools-loading .active="${this.loading}"></etools-loading>
      </etools-content-panel>
    `;
  }
}

export {ProgressReportsList as ProgressReportsListEl};
