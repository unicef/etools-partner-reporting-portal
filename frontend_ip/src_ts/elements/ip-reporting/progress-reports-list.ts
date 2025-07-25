import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/list-placeholder';
import './pd-reports-report-title';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import SortingMixin from '../../etools-prp-common/mixins/sorting-mixin';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import {store} from '../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {valueWithDefault} from '@unicef-polymer/etools-utils/dist/general.util';

@customElement('progress-reports-list')
export class ProgressReportsList extends SortingMixin(
  ProgressReportUtilsMixin(PaginationMixin(DataTableMixin(connect(store)(LitElement))))
) {
  static styles = [
    layoutStyles,
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

  @property({type: Boolean})
  isGpd = false;

  @property({type: Array})
  data: any[] = [];

  @property({type: Object})
  queryParams!: any;

  @property({type: Number})
  pageSize!: number;

  @property({type: Number})
  pageNumber!: number;

  @property({type: String})
  baseUrl!: string;

  @property({type: Boolean}) lowResolutionLayout = false;

  stateChanged(state: RootState) {
    if (state.app?.routeDetails.subSubRouteName !== 'progress-reports') {
      return;
    }

    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
      if (parseInt(this.queryParams?.page) === 1 && this.paginator.page !== 1) {
        // reset paginator because of search
        this.paginator = {...this.paginator, page: 1};
      }
    }

    if (this.loading !== state.progressReports.loading) {
      this.loading = state.progressReports.loading;
    }

    if (state.progressReports.all !== undefined && !isJsonStrMatch(this.data, state.progressReports.all)) {
      this.data = state.progressReports.all;
    }

    if (state.progressReports?.count !== undefined && this.paginator?.count !== state.progressReports.count) {
      this.paginator = {...this.paginator, count: state.progressReports.count};
    }

    if (state.workspaces?.baseUrl && state.workspaces.baseUrl !== this.baseUrl) {
      this.baseUrl = state.workspaces.baseUrl;
    }
  }

  paginatorChanged() {
    this._paginatorChanged();
  }

  render() {
    return html`
      ${tableStyles}
      <style>
        ${dataTableStylesLit}
      </style>
      <etools-media-query
        query="(max-width: 1300px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel panel-title="${translate('LIST_OF_REPORTS')}">
        <etools-data-table-header
          no-collapse
          .lowResolutionLayout="${this.lowResolutionLayout}"
          label="${this.paginator.visible_range[0]} - ${this.paginator.visible_range[1]} of ${this.paginator
            .count} ${translate('RESULTS_TO_SHOW')}"
        >
          <etools-data-table-column field="programme_document__reference_number" class="col-2" sortable>
            <div class="table-column">${translate(this.isGpd ? 'GPD_REF_NUMBER' : 'PD_REF_NUMBER')}</div>
          </etools-data-table-column>
          <etools-data-table-column class="col-2">
            <div class="table-column">${translate('REPORT_NUMBER')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable class="col-2">
            <div class="table-column">${translate('REPORT_STATUS')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="due_date" sortable class="col-2">
            <div class="table-column">${translate('DUE_DATE')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="submission_date" sortable class="col-2">
            <div class="table-column">${translate('DATE_OF_SUBMISSION')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="start_date" sortable class="col-2">
            <div class="table-column">${translate('REPORTING_PERIOD')}</div>
          </etools-data-table-column>
        </etools-data-table-header>

        ${(this.data || []).map(
          (report: any) => html`
            <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data">
                <div
                  class="col-data col-2 table-cell table-cell--text"
                  data-col-header-label="${translate(this.isGpd ? 'GPD_REF_NUMBER' : 'PD_REF_NUMBER')}"
                >
                  <sl-tooltip content="${report.programme_document?.title}">
                    <span class="truncate">
                      ${valueWithDefault(report.programme_document?.reference_number, '-')}
                    </span>
                  </sl-tooltip>
                </div>
                <div
                  class="col-data col-2 table-cell table-cell--text"
                  data-col-header-label="${translate('REPORT_NUMBER')}"
                >
                  <pd-reports-report-title
                    display-link
                    display-link-icon
                    .report="${report}"
                    .baseUrl="${this.baseUrl}"
                    ?isGpd="${this.isGpd}"
                  ></pd-reports-report-title>
                </div>
                <div
                  class="col-data col-2 table-cell table-cell--text"
                  data-col-header-label="${translate('REPORT_STATUS')}"
                >
                  <report-status .status="${report.status}" .reportType="${report.report_type}"></report-status>
                </div>
                <div
                  class="col-data col-2 table-cell table-cell--text"
                  data-col-header-label="${translate('DUE_DATE')}"
                >
                  ${valueWithDefault(report.due_date, '-')}
                </div>
                <div
                  class="col-data col-2 table-cell table-cell--text"
                  data-col-header-label="${translate('DATE_OF_SUBMISSION')}"
                >
                  ${valueWithDefault(report.submission_date, '-')}
                </div>
                <div
                  class="col-data col-2 table-cell table-cell--text truncate"
                  data-col-header-label="${translate('REPORTING_PERIOD')}"
                >
                  ${valueWithDefault(report.reporting_period, '-')}
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
        <list-placeholder .data="${this.data}" .loading="${this.loading}"></list-placeholder>

        <etools-data-table-footer
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @visible-range-changed="${this.visibleRangeChanged}"
          @page-size-changed="${this.pageSizeChanged}"
          @page-number-changed="${this.pageNumberChanged}"
        >
        </etools-data-table-footer>
        <etools-loading .active="${this.loading}"></etools-loading>
      </etools-content-panel>
    `;
  }
}

export {ProgressReportsList as ProgressReportsListEl};
