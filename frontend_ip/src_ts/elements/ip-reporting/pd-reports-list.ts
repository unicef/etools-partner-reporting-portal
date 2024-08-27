import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/list-placeholder';
import '../../etools-prp-common/elements/etools-prp-permissions';
import './pd-reports-report-title';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';
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
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('pd-reports-list')
export class PdReportsList extends PaginationMixin(
  DataTableMixin(ProgressReportUtilsMixin(UtilsMixin(connect(store)(LitElement))))
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

  @property({type: Boolean, reflect: true})
  loading = true;

  @property({type: Object})
  filters: any[] = [];

  @property({type: Object})
  permissions: any = {};

  @property({type: String})
  pdId!: string;

  @property({type: String})
  baseUrl!: string;

  @property({type: Array})
  data: any[] = [];

  stateChanged(state: RootState) {
    super.stateChanged(state);
    if (state.app?.routeDetails?.params?.activeTab !== 'reports') {
      return;
    }

    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.pdId !== state.programmeDocuments?.currentPdId) {
      this.pdId = state.programmeDocuments?.currentPdId;
    }

    if (state.workspaces?.baseUrl && state.workspaces.baseUrl !== this.baseUrl) {
      this.baseUrl = state.workspaces.baseUrl;
    }

    this.data = programmeDocumentReportsAll(state);
    if (this.data) {
      const totalResults = programmeDocumentReportsCount(state);
      if (typeof totalResults !== 'undefined') {
        this.loading = false;
        if (this.paginator?.count !== totalResults) {
          this.paginator = {...this.paginator, count: totalResults};
          this.requestUpdate();
        }
      }
    }
  }

  _getLink(report: any, permissions: any) {
    const suffix = this._getMode(report, permissions);
    return getLink(report, suffix, this.buildUrl, this.baseUrl);
  }

  render() {
    return html`
      ${tableStyles}
      <style>
        ${dataTableStylesLit}
      </style>

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      ></etools-prp-permissions>

      <etools-content-panel panel-title="${translate('LIST_OF_REPORTS')}">
        <etools-loading ?active="${this.loading}"></etools-loading>

        <etools-data-table-header
          no-collapse
          label="${this.paginator.visible_range?.[0]}-${this.paginator.visible_range?.[1]} of ${this.paginator
            .count} ${translate('RESULTS_TO_SHOW')}"
        >
          <etools-data-table-column class="col-3">
            <div class="table-column">${translate('REPORT_NUMBER')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable class="col-2">
            <div class="table-column">${translate('REPORT_STATUS')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="due_date" sortable class="col-2">
            <div class="table-column">${translate('DUE_DATE')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="date_of_submission" sortable class="col-2">
            <div class="table-column">${translate('DATE_OF_SUBMISSION')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="reporting_period" sortable class="col-3">
            <div class="table-column">${translate('REPORTING_PERIOD')}</div>
          </etools-data-table-column>
        </etools-data-table-header>

        ${(this.data || []).map(
          (report: any) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="col-data col-3 table-cell table-cell--text cell-reports">
                  <pd-reports-report-title
                    .displayLink="${true}"
                    .report="${report}"
                    .baseUrl="${this.baseUrl}"
                  ></pd-reports-report-title>
                </div>
                <div class="col-data col-2 table-cell table-cell--text">
                  <report-status .status="${report.status}" .reportType="${report.report_type}"></report-status>
                </div>
                <div class="col-data col-2 table-cell table-cell--text">${this._withDefault(report.due_date, '-')}</div>
                <div class="col-data col-2 table-cell table-cell--text">
                  ${this._withDefault(report.submission_date)}
                </div>
                <div class="col-data col-3 table-cell table-cell--text">
                  ${this._withDefault(report.reporting_period)}
                </div>
              </div>
            </etools-data-table-row>
          `
        )}

        <list-placeholder .data="${this.data}" ?loading="${this.loading}"></list-placeholder>

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
      </etools-content-panel>
    `;
  }

  paginatorChanged() {
    this._paginatorChanged();
  }
}

export {PdReportsList as PdReportsListEl};
